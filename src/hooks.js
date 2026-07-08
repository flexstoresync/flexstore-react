import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FlexStoreContext } from './context.js';

function useFlexStoreContext() {
  const ctx = useContext(FlexStoreContext);
  if (!ctx) {
    throw new Error('FlexStore hooks must be used within <FlexStoreProvider>');
  }
  return ctx;
}

export function useClient() {
  return useFlexStoreContext().client;
}

export function useReady() {
  return useFlexStoreContext().ready;
}

/** Set when `client.start()` rejects (e.g. SQLite WASM or config error). */
export function useStartError() {
  return useFlexStoreContext().startError ?? null;
}

function normalizeWhere(where) {
  if (!where) return undefined;
  // Accept { where: { field: value } } (docs style) or flat { field: value }
  if (
    typeof where === 'object' &&
    where.where &&
    typeof where.where === 'object' &&
    !Array.isArray(where.where)
  ) {
    return where.where;
  }
  return where;
}

export function useQuery(resource, where) {
  const client = useClient();
  const ready = useReady();
  const [rows, setRows] = useState([]);
  const filter = normalizeWhere(where);
  const whereKey = filter ? JSON.stringify(filter) : '';

  useEffect(() => {
    if (!ready) {
      setRows([]);
      return;
    }

    let cancelled = false;
    const parsedFilter = whereKey ? JSON.parse(whereKey) : undefined;
    const unsub = client.subscribe(resource, parsedFilter, (next) => {
      if (!cancelled) setRows(next);
    });

    return () => {
      cancelled = true;
      unsub();
    };
    // whereKey only — inline `{ done: false }` is a new object every render
  }, [client, resource, whereKey, ready]);

  return rows;
}

export function useSyncStatus() {
  const client = useClient();
  const [status, setStatus] = useState(client.status);
  useEffect(() => client.onStatus(setStatus), [client]);
  return status;
}

/** Pub/sub SSE connection state and resolved endpoint URLs. */
export function useRealtimeStatus() {
  const status = useSyncStatus();
  return {
    connected: status.realtimeConnected,
    baseUrl: status.baseUrl,
    pubsubUrl: status.pubsubUrl,
    enabled: !!status.pubsubUrl,
  };
}

export function useResource(resource) {
  const client = useClient();
  return useMemo(
    () => ({
      create: (data) => client.create(resource, data),
      update: (id, patch) => client.update(resource, id, patch),
      remove: (id) => client.remove(resource, id),
      syncNow: () => client.syncNow(),
    }),
    [client, resource],
  );
}

export function useSyncNow() {
  const client = useClient();
  return useCallback(() => client.syncNow(), [client]);
}

export function useSetPaused() {
  const client = useClient();
  return useCallback((paused) => client.setPaused(paused), [client]);
}

/** Force the server to bypass its cached credential validation and re-check now. */
export function useRevalidate() {
  const client = useClient();
  return useCallback(() => client.revalidate(), [client]);
}

/** Local device id for this install (after provider ready). */
export function useDeviceId() {
  const client = useClient();
  const ready = useReady();
  return ready ? client.getDeviceId() : null;
}

/** Server-registered devices for the tenant (last_seen_at, first_seen_at). */
export function useDevices({ autoLoad = true } = {}) {
  const client = useClient();
  const ready = useReady();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (!ready || !autoLoad) return;
    refresh().catch(() => {});
  }, [ready, autoLoad, refresh]);

  return { devices, loading, error, refresh };
}

/** This install's device row from the server. */
export function useThisDevice({ autoLoad = true } = {}) {
  const client = useClient();
  const ready = useReady();
  const deviceId = useDeviceId();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (!ready || !autoLoad || !deviceId) return;
    refresh().catch(() => {});
  }, [ready, autoLoad, deviceId, refresh]);

  return { device, deviceId, loading, error, refresh };
}
