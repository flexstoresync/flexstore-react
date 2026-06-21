import { createContext } from 'react';

export const FlexStoreContext = createContext(null);

/** @deprecated Use FlexStoreContext */
export const SyncCtx = FlexStoreContext;
