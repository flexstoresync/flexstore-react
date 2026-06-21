import { resourceRegistry } from '@flexstore/react';
import { todosResource } from './resources/todos';
// import { usersResource } from './resources/users';

/** Single import point — pass `registry` to FlexStoreProvider config. */
export const registry = resourceRegistry(
  todosResource,
  // usersResource,
);
