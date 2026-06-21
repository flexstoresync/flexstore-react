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

  return <FlexStoreContext.Provider value={value}>{children}</FlexStoreContext.Provider>;
}

/** @deprecated Use FlexStoreProvider */
export const SyncProvider = FlexStoreProvider;
