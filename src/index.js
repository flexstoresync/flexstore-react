export { FlexStoreProvider, SyncProvider } from './FlexStoreProvider.jsx';
export { FlexStoreContext, SyncCtx } from './context.js';
export {
  useClient,
  useReady,
  useStartError,
  useQuery,
  useResource,
  useSyncNow,
  useSyncStatus,
  useRealtimeStatus,
  useDeviceId,
  useDevices,
  useThisDevice,
  useSetPaused,
} from './hooks.js';
export { defineResource, resourceRegistry, parsePollIntervalMs, DEFAULT_PUBSUB_FALLBACK_POLL_MS, DEFAULT_POLL_INTERVAL_MS } from '@flexstore/core';
