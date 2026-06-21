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
  const [rows, setRows] = useState([]);
  const filter = normalizeWhere(where);
  const whereKey = filter ? JSON.stringify(filter) : '';

  useEffect(() => {
    return client.subscribe(resource, filter, setRows);
  }, [client, resource, whereKey, filter]);

  return rows;
}

export function useSyncStatus() {
  const client = useClient();
  const [status, setStatus] = useState(client.status);
  useEffect(() => client.onStatus(setStatus), [client]);
  return status;
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
