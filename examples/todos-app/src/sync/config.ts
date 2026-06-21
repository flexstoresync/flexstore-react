import type { SyncClientConfig } from '@flexstore/react';
import { registry } from './registry';

export function buildSyncConfig(): SyncClientConfig {
  return {
    baseUrl: import.meta.env.VITE_FLEXSTORE_SYNC_URL ?? 'http://localhost:8088',
    apiKey: import.meta.env.VITE_FLEXSTORE_API_KEY ?? '',
    tenantId: import.meta.env.VITE_FLEXSTORE_TENANT_ID || undefined,
    intervalMs: 4000,
    dbName: 'flexstore-todos-demo',
    resources: registry,
  };
}
