import { useContext, useEffect, useMemo, useState } from 'react';
import { createSyncClient } from '@flexstore/core';
import { FlexStoreContext } from './context.js';

/**
 * Boots a FlexStore sync client and provides it to the tree.
 *
 * @param {object} props
 * @param {import('@flexstore/core').SyncClient|object} [props.client] Pre-built client instance
 * @param {object} [props.config] Passed to createSyncClient when client is omitted
 */
export function FlexStoreProvider({ client: clientProp, config, children }) {
  const [client] = useState(() => {
    const c = clientProp ?? createSyncClient(config);
    if (config?.pausedOnStart) c.setPaused(true);
    return c;
  });
  const [ready, setReady] = useState(false);
  const [startError, setStartError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setStartError(null);
    client
      .start()
      .then(() => mounted && setReady(true))
      .catch((e) => {
        if (mounted) setStartError(e instanceof Error ? e : new Error(String(e)));
      });
    return () => {
      mounted = false;
      client.stop();
    };
  }, [client]);

  const value = useMemo(() => ({ client, ready, startError }), [client, ready, startError]);

  return <FlexStoreContext.Provider value={value}>{children}</FlexStoreContext.Provider>;
}

/** @deprecated Use FlexStoreProvider */
export const SyncProvider = FlexStoreProvider;
