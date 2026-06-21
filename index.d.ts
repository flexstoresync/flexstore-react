import type { ReactNode } from 'react';
import type { ResourceDefinition, SyncClient, SyncClientConfig } from '@flexstore/core';

export type {
  AttributeType,
  PullSchema,
  PullSchemaInclude,
  PullSchemaWhere,
  ResourceDefinition,
  SyncClientConfig,
} from '@flexstore/core';

export { defineResource, resourceRegistry } from '@flexstore/core';

export interface FlexStoreProviderProps {
  config?: SyncClientConfig;
  client?: SyncClient;
  children: ReactNode;
}

export function FlexStoreProvider(props: FlexStoreProviderProps): JSX.Element;
export const SyncProvider: typeof FlexStoreProvider;

export const FlexStoreContext: import('react').Context<{
  client: SyncClient;
  ready: boolean;
} | null>;
export const SyncCtx: typeof FlexStoreContext;

export function useClient(): SyncClient;
export function useReady(): boolean;
export function useQuery(
  resource: string,
  where?: Record<string, unknown> | { where?: Record<string, unknown> },
): Record<string, unknown>[];
export function useResource(resource: string): {
  create: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
  update: (id: string, patch: Record<string, unknown>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  syncNow: () => Promise<void>;
};
export function useSyncStatus(): SyncClient['status'];
export function useSyncNow(): () => Promise<void>;
export function useSetPaused(): (paused: boolean) => void;
