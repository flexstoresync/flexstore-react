import type { SyncClientConfig } from '@flexstore/react';
import { parsePollIntervalMs } from '@flexstore/core';
import { registry } from './registry';

export function buildSyncConfig(): SyncClientConfig {
  return {
    baseUrl: import.meta.env.VITE_FLEXSTORE_SYNC_URL ?? 'http://localhost:8088',
    pubsubUrl: import.meta.env.VITE_FLEXSTORE_PUBSUB_URL ?? 'http://localhost:8090',
    apiKey: import.meta.env.VITE_FLEXSTORE_API_KEY ?? '',
    tenantId: import.meta.env.VITE_FLEXSTORE_TENANT_ID || undefined,
    pubsubFallbackPollMs: parsePollIntervalMs(
      import.meta.env.VITE_FLEXSTORE_PUBSUB_FALLBACK_POLL_MS,
      60_000,
    ),
    pollIntervalDisconnectedMs: parsePollIntervalMs(
      import.meta.env.VITE_FLEXSTORE_POLL_INTERVAL_MS,
      4_000,
    ),
    dbName: 'flexstore-todos-demo',
    resources: registry,
  };
}
