# @flexstore/react

React bindings for [FlexStore](https://github.com/flexstoresync/flexstore) — local-first data that syncs when you're online.

## Install

```bash
npm install @flexstore/react @flexstore/core
```

## Sync backend

| Option | Best for |
|--------|----------|
| **[FlexStore hosted SaaS](https://github.com/flexstoresync/flexstore)** | Sign up, create an app, get an API key from the dashboard |
| **[Self-hosted Docker](https://github.com/flexstoresync/flexstore-self-host)** | Run your own sync server — single tenant, no dashboard, `docker compose up` |

Both speak the same protocol. Point `baseUrl` at `http://localhost:8088` (or your host) and set `apiKey` + `tenantId`.

---

## Recommended folder structure

Define **one resource per file**, import them into a single registry, and keep sync config separate from UI:

```
src/
  main.tsx
  index.css
  App.tsx                 # FlexStoreProvider + layout
  App.css
  components/
    TodoList.tsx          # useQuery / useResource hooks
  sync/
    config.ts             # baseUrl, apiKey, tenantId from env
    registry.ts           # resourceRegistry(...imports)
    resources/
      todos.ts            # defineResource({ name: 'todos', ... })
      users.ts            # another resource in its own file
```

Full working files: [`examples/todos-app/`](./examples/todos-app/) in this package (also mirrored in `developer/tests/mytodo`).

---

## Resources

Use `defineResource` in each file and `resourceRegistry` to combine them:

```ts
// src/sync/resources/todos.ts
import { defineResource } from '@flexstore/react';

export const todosResource = defineResource({
  name: 'todos',
  attributes: { title: 'string', done: 'boolean' },
});
```

```ts
// src/sync/registry.ts
import { resourceRegistry } from '@flexstore/react';
import { todosResource } from './resources/todos';
import { usersResource } from './resources/users';

export const registry = resourceRegistry(todosResource, usersResource);
```

```ts
// src/sync/config.ts
import type { SyncClientConfig } from '@flexstore/react';
import { registry } from './registry';

export function buildSyncConfig(): SyncClientConfig {
  return {
    baseUrl: import.meta.env.VITE_FLEXSTORE_SYNC_URL,
    apiKey: import.meta.env.VITE_FLEXSTORE_API_KEY,
    tenantId: import.meta.env.VITE_FLEXSTORE_TENANT_ID,
    resources: registry,
  };
}
```

### `ResourceDefinition` type

| Field | Required | Description |
|-------|----------|-------------|
| `name` | yes | Resource name used in `useQuery('todos')` |
| `attributes` | yes | Flat scalar fields: `'string' \| 'boolean' \| 'integer' \| 'float'` |
| `dependsOn` | no | Parent resources pulled first |
| `pullSchema` | no | Server pull projection (`select`, `where`, `include`) |

TypeScript types ship with the package (`ResourceDefinition`, `SyncClientConfig`, etc.).

---

## App entry

```tsx
// src/App.tsx
import { FlexStoreProvider } from '@flexstore/react';
import { buildSyncConfig } from './sync/config';
import { TodoList } from './components/TodoList';
import './App.css';

export function App() {
  return (
    <FlexStoreProvider config={buildSyncConfig()}>
      <TodoList />
    </FlexStoreProvider>
  );
}
```

```tsx
// src/components/TodoList.tsx
import { useQuery, useResource, useSyncStatus } from '@flexstore/react';

export function TodoList() {
  const todos = useQuery('todos', { done: false });
  const { create, update } = useResource('todos');
  const status = useSyncStatus();

  // ...
}
```

> **Note:** `useQuery` takes a flat filter: `{ done: false }`, not `{ where: { done: false } }`.
> The `{ where: ... }` shape is for server **pull schema**, not local queries.

See [`examples/todos-app/src/App.tsx`](./examples/todos-app/src/App.tsx),
[`App.css`](./examples/todos-app/src/App.css), and
[`components/TodoList.tsx`](./examples/todos-app/src/components/TodoList.tsx).

---

## Environment (Vite)

```bash
# .env.local
VITE_FLEXSTORE_SYNC_URL=http://localhost:8088
VITE_FLEXSTORE_API_KEY=your-api-key
VITE_FLEXSTORE_TENANT_ID=your-tenant-id
```

For **self-hosted**, use the API key and tenant id from your
[`flexstore-self-host`](https://github.com/flexstoresync/flexstore-self-host) `.env`
(`OFS_API_KEY`, `OFS_TENANT_ID`).

Register your dev origin (e.g. `http://localhost:5173`) in the hosted dashboard under **Allowed domains**, or set `OFS_CORS_ORIGINS` when self-hosting.

---

## API

| Export | Description |
|--------|-------------|
| `defineResource(def)` | Define one resource (use in `resources/*.ts`) |
| `resourceRegistry(...resources)` | Merge resources into an array for config |
| `FlexStoreProvider` | Boots the sync client and wraps your app |
| `useQuery(resource, filter?)` | Live local query; re-renders on store changes |
| `useResource(resource)` | `{ create, update, remove, syncNow }` |
| `useSyncStatus()` | `{ stage, online, pending, lastError, lastSyncAt }` |
| `useReady()` | `true` after IndexedDB init |
| `useClient()` | Raw `@flexstore/core` client |
| `useSyncNow()` | Trigger an immediate sync |
| `useSetPaused()` | Pause/resume background sync |

Legacy aliases `SyncProvider` and `SyncCtx` are exported for migration.

---

## License

MIT — see [LICENSE](./LICENSE).
