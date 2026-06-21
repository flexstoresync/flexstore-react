var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  FlexStoreContext: () => FlexStoreContext,
  FlexStoreProvider: () => FlexStoreProvider,
  SyncCtx: () => SyncCtx,
  SyncProvider: () => SyncProvider,
  defineResource: () => import_core2.defineResource,
  resourceRegistry: () => import_core2.resourceRegistry,
  useClient: () => useClient,
  useQuery: () => useQuery,
  useReady: () => useReady,
  useResource: () => useResource,
  useSetPaused: () => useSetPaused,
  useSyncNow: () => useSyncNow,
  useSyncStatus: () => useSyncStatus
});
module.exports = __toCommonJS(index_exports);

// src/FlexStoreProvider.jsx
var import_react2 = require("react");
var import_core = require("@flexstore/core");

// src/context.js
var import_react = require("react");
var FlexStoreContext = (0, import_react.createContext)(null);
var SyncCtx = FlexStoreContext;

// src/FlexStoreProvider.jsx
var import_jsx_runtime = require("react/jsx-runtime");
function FlexStoreProvider({ client: clientProp, config, children }) {
  const [client] = (0, import_react2.useState)(() => clientProp ?? (0, import_core.createSyncClient)(config));
  const [ready, setReady] = (0, import_react2.useState)(false);
  (0, import_react2.useEffect)(() => {
    let mounted = true;
    client.start().then(() => mounted && setReady(true));
    return () => {
      mounted = false;
      client.stop();
    };
  }, [client]);
  const value = (0, import_react2.useMemo)(() => ({ client, ready }), [client, ready]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlexStoreContext.Provider, { value, children });
}
var SyncProvider = FlexStoreProvider;

// src/hooks.js
var import_react3 = require("react");
function useFlexStoreContext() {
  const ctx = (0, import_react3.useContext)(FlexStoreContext);
  if (!ctx) {
    throw new Error("FlexStore hooks must be used within <FlexStoreProvider>");
  }
  return ctx;
}
function useClient() {
  return useFlexStoreContext().client;
}
function useReady() {
  return useFlexStoreContext().ready;
}
function normalizeWhere(where) {
  if (!where) return void 0;
  if (typeof where === "object" && where.where && typeof where.where === "object" && !Array.isArray(where.where)) {
    return where.where;
  }
  return where;
}
function useQuery(resource, where) {
  const client = useClient();
  const [rows, setRows] = (0, import_react3.useState)([]);
  const filter = normalizeWhere(where);
  const whereKey = filter ? JSON.stringify(filter) : "";
  (0, import_react3.useEffect)(() => {
    return client.subscribe(resource, filter, setRows);
  }, [client, resource, whereKey, filter]);
  return rows;
}
function useSyncStatus() {
  const client = useClient();
  const [status, setStatus] = (0, import_react3.useState)(client.status);
  (0, import_react3.useEffect)(() => client.onStatus(setStatus), [client]);
  return status;
}
function useResource(resource) {
  const client = useClient();
  return (0, import_react3.useMemo)(
    () => ({
      create: (data) => client.create(resource, data),
      update: (id, patch) => client.update(resource, id, patch),
      remove: (id) => client.remove(resource, id),
      syncNow: () => client.syncNow()
    }),
    [client, resource]
  );
}
function useSyncNow() {
  const client = useClient();
  return (0, import_react3.useCallback)(() => client.syncNow(), [client]);
}
function useSetPaused() {
  const client = useClient();
  return (0, import_react3.useCallback)((paused) => client.setPaused(paused), [client]);
}

// src/index.js
var import_core2 = require("@flexstore/core");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FlexStoreContext,
  FlexStoreProvider,
  SyncCtx,
  SyncProvider,
  defineResource,
  resourceRegistry,
  useClient,
  useQuery,
  useReady,
  useResource,
  useSetPaused,
  useSyncNow,
  useSyncStatus
});
//# sourceMappingURL=index.cjs.map