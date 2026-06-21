export { FlexStoreProvider, SyncProvider } from './FlexStoreProvider.jsx';
export { FlexStoreContext, SyncCtx } from './context.js';
export {
  useClient,
  useReady,
  useQuery,
  useResource,
  useSyncNow,
  useSyncStatus,
  useSetPaused,
} from './hooks.js';
export { defineResource, resourceRegistry } from '@flexstore/core';
