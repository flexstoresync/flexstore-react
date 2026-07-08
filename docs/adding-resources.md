# Adding a new syncable resource

This guide walks through shipping a **new syncable resource** end-to-end in a
FlexStore app, with an explicit checklist for the local-store migration so
existing users don't see `one of the specified object stores was not found`
after upgrading.

A complete worked example (the POS app) is in
[`examples/react/posappwithpubspec`](https://github.com/flexstoresync/flexstore/tree/main/examples/react/posappwithpubspec).

---

## 1. Define the resource

Create one file per resource under `src/sync/resources/`:

```ts
// src/sync/resources/restock_events.ts
import { defineResource } from '@flexstore/core';

export const restockEventsResource = defineResource({
  name: 'restock_events',
  softDeletes: true,
  tenantScoped: true,
  dependsOn: ['suppliers', 'pos_users'],
  attributes: {
    supplier_id: 'string',
    reference_number: 'string',
    total_cost: 'float',
    notes: 'string',
    received_by_user_id: 'string',
    received_by_name: 'string',
    received_at: 'string',
  },
});
```

Conventions:

- One file per resource. Keeps diffs reviewable and lets the SDK tree-shake.
- Flat scalar attributes only — push sends `{ id, version, ...attributes }`,
  no nested objects.
- `softDeletes: true` if the resource can be deleted (writes a tombstone, not a
  physical row loss).
- `tenantScoped: true` for everything except the tenant table itself.
- `dependsOn` declares every parent that must sync before this resource. Order
  in `registry.ts` must agree with `dependsOn`.

See [`docs/relationships.md`](./relationships.md) for parents, FKs, and join
patterns.

---

## 2. Register in pipeline order

```ts
// src/sync/registry.ts
import { resourceRegistry } from '@flexstore/core';
import { restockEventsResource } from './resources/restock_events';
import { restockItemsResource } from './resources/restock_items';
import { suppliersResource } from './resources/suppliers';

export const registry = resourceRegistry(
  // ... existing resources ...
  suppliersResource,        // depends on outlets
  restockEventsResource,    // depends on suppliers, pos_users
  restockItemsResource,     // depends on restock_events, items
);
```

Every parent must appear **before** its child in the array. The SDK uses this
order for both push (parents first) and pull (FK-safe apply).

---

## 3. Bump the local-store schema version

This is the step that breaks upgrades most often. Each resource maps to its own
IndexedDB object store, and **object stores can only be created in the
[`onupgradeneeded`](https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest/onupgradeneeded)
phase**, which fires only when the database version changes.

If you ship a new resource to existing users without bumping
`IDB_SCHEMA_VERSION`, the JS bundle picks up the new resource name, but the
physical database (which is still at the old version) is **never** asked to
add the new object store. The first `useQuery('newResource')` or
`client.create('newResource', …)` throws:

```
DOMException: Failed to execute 'transaction' on 'IDBDatabase':
one of the specified object stores was not found.
```

**Fix.** Bump the schema version:

1. **Monorepo default:** `DEFAULT_IDB_SCHEMA_VERSION` in [`packages/core/src/store/idb.js`](https://github.com/flexstoresync/flexstore-core/blob/main/src/store/idb.js).
2. **Production apps (recommended):** maintain `src/sync/local-schema.ts` and pass `idbSchemaVersion` in your sync config (see Bizflow `buildSyncConfig`).

```ts
// src/sync/local-schema.ts
export const LOCAL_IDB_MIGRATIONS = [
  { version: 1, description: 'Baseline stores' },
  { version: 2, description: 'menu_folders resource' },
] as const;
export const LOCAL_IDB_SCHEMA_VERSION = 2; // latest version
```

```ts
// src/sync/config.ts
import { LOCAL_IDB_SCHEMA_VERSION } from './local-schema';

createSyncClient({
  ...config,
  idbSchemaVersion: LOCAL_IDB_SCHEMA_VERSION,
});
```

Optional custom hooks (indexes, backfills) via `idbMigrations` on the sync config — each entry runs once when its `version` is applied.

The `onupgradeneeded` handler is idempotent — `createObjectStore` is
only called for stores that are missing — so existing data in older stores is
preserved across the upgrade. The `SqliteStore` adapter does **not** need a
bump: it uses `CREATE TABLE IF NOT EXISTS`, which adds the table on next init.

> **Workaround for users already affected.** Open DevTools → Application →
> IndexedDB → delete the `flexstore-idb:<flexstore-dbName>` database and
> reload. The next session re-creates the database with all current resources.

---

## 4. Wire UI hooks

In the React component, use the same hooks as for any other resource:

```tsx
import { useQuery, useResource, useSyncNow } from '@flexstore/react';

function RestockHistory() {
  const events = useQuery('restock_events');
  const restockItems = useQuery('restock_items');
  const suppliers = useQuery('suppliers');
  const { create: createEvent } = useResource('restock_events');
  const { create: createLine } = useResource('restock_items');
  const syncNow = useSyncNow();
  // ...
}
```

Reads (`useQuery`) and writes (`useResource().create`/`update`/`remove`) are
identical to the existing resources — no extra wiring needed.

---

## 5. Smoke test the upgrade path

Before publishing:

1. Build and serve your app at the current `IDB_SCHEMA_VERSION`.
2. Create at least one row in the **existing** resources (so the IDB has real data — it must survive the upgrade).
3. Reload to confirm the app boots cleanly.
4. Bump `IDB_SCHEMA_VERSION` and add the new resource.
5. Reload the app. Existing rows should still appear.
6. Read from the new resource (`useQuery`) — must not throw.
7. Write to the new resource (`create`) — must not throw; the new row must persist across reloads.

If step 6 throws `object stores was not found`, you forgot to bump the version in step 4 — go back and do it.

---

## Checklist (copy-paste for PRs)

- [ ] New resource file at `src/sync/resources/<name>.ts`.
- [ ] Parent resources appear earlier in `src/sync/registry.ts`.
- [ ] `dependsOn` matches registry order.
- [ ] `tenantScoped` / `softDeletes` flags set correctly for the domain.
- [ ] **`LOCAL_IDB_SCHEMA_VERSION` bumped** in `src/sync/local-schema.ts` (and changelog entry in `LOCAL_IDB_MIGRATIONS`).
- [ ] `idbSchemaVersion` passed in sync config.
- [ ] UI uses `useQuery` / `useResource` for the new resource (no bespoke fetches).
- [ ] Smoke test: existing rows persist, new resource reads + writes succeed.
- [ ] (Optional) Postgres connector mapping added (`docs/06-postgres-connector.md`).

---

## Further reading

| Doc | Topic |
|-----|-------|
| [Managing relationships](./relationships.md) | FKs, `dependsOn`, registry order, joins |
| [@flexstore/core README](../../core/README.md) | Store adapters and local-store migrations |
| [docs/07-resource-registry](../../../docs/07-resource-registry.md) | `dependsOn`, verification, scoping flags |
| [docs/03-sync-protocol](../../../docs/03-sync-protocol.md) | Push / pull contracts |
