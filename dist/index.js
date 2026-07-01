// src/FlexStoreProvider.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import { createSyncClient } from "@flexstore/core";

// src/context.js
import { createContext } from "react";
var FlexStoreContext = createContext(null);
var SyncCtx = FlexStoreContext;

// src/FlexStoreProvider.jsx
import { jsx } from "react/jsx-runtime";
function FlexStoreProvider({ client: clientProp, config, children }) {
  const [client] = useState(() => clientProp ?? createSyncClient(config));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    client.start().then(() => mounted && setReady(true));
    return () => {
      mounted = false;
      client.stop();
    };
  }, [client]);
  const value = useMemo(() => ({ client, ready }), [client, ready]);
  return /* @__PURE__ */ jsx(FlexStoreContext.Provider, { value, children });
}
var SyncProvider = FlexStoreProvider;

// src/hooks.js
import { useCallback, useContext as useContext2, useEffect as useEffect2, useMemo as useMemo2, useState as useState2 } from "react";
function useFlexStoreContext() {
  const ctx = useContext2(FlexStoreContext);
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
  const [rows, setRows] = useState2([]);
  const filter = normalizeWhere(where);
  const whereKey = filter ? JSON.stringify(filter) : "";
  useEffect2(() => {
    return client.subscribe(resource, filter, setRows);
  }, [client, resource, whereKey, filter]);
  return rows;
}
function useSyncStatus() {
  const client = useClient();
  const [status, setStatus] = useState2(client.status);
  useEffect2(() => client.onStatus(setStatus), [client]);
  return status;
}
function useRealtimeStatus() {
  const status = useSyncStatus();
  return {
    connected: status.realtimeConnected,
    baseUrl: status.baseUrl,
    pubsubUrl: status.pubsubUrl,
    enabled: !!status.pubsubUrl
  };
}
function useResource(resource) {
  const client = useClient();
  return useMemo2(
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
  return useCallback(() => client.syncNow(), [client]);
}
function useSetPaused() {
  const client = useClient();
  return useCallback((paused) => client.setPaused(paused), [client]);
}
function useDeviceId() {
  const client = useClient();
  const ready = useReady();
  return ready ? client.getDeviceId() : null;
}
function useDevices({ autoLoad = true } = {}) {
  const client = useClient();
  const ready = useReady();
  const [devices, setDevices] = useState2([]);
  const [loading, setLoading] = useState2(autoLoad);
  const [error, setError] = useState2(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await client.listDevices();
      setDevices(rows);
      return rows;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [client]);
  useEffect2(() => {
    if (!ready || !autoLoad) return;
    refresh().catch(() => {
    });
  }, [ready, autoLoad, refresh]);
  return { devices, loading, error, refresh };
}
function useThisDevice({ autoLoad = true } = {}) {
  const client = useClient();
  const ready = useReady();
  const deviceId = useDeviceId();
  const [device, setDevice] = useState2(null);
  const [loading, setLoading] = useState2(autoLoad);
  const [error, setError] = useState2(null);
  const refresh = useCallback(async () => {
    if (!deviceId) return null;
    setLoading(true);
    setError(null);
    try {
      const row = await client.getThisDevice();
      setDevice(row);
      return row;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [client, deviceId]);
  useEffect2(() => {
    if (!ready || !autoLoad || !deviceId) return;
    refresh().catch(() => {
    });
  }, [ready, autoLoad, deviceId, refresh]);
  return { device, deviceId, loading, error, refresh };
}

// src/index.js
import { defineResource, resourceRegistry, parsePollIntervalMs, DEFAULT_PUBSUB_FALLBACK_POLL_MS, DEFAULT_POLL_INTERVAL_MS } from "@flexstore/core";
export {
  DEFAULT_POLL_INTERVAL_MS,
  DEFAULT_PUBSUB_FALLBACK_POLL_MS,
  FlexStoreContext,
  FlexStoreProvider,
  SyncCtx,
  SyncProvider,
  defineResource,
  parsePollIntervalMs,
  resourceRegistry,
  useClient,
  useDeviceId,
  useDevices,
  useQuery,
  useReady,
  useRealtimeStatus,
  useResource,
  useSetPaused,
  useSyncNow,
  useSyncStatus,
  useThisDevice
};
//# sourceMappingURL=index.js.map