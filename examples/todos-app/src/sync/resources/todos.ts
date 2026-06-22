import { defineResource, resourceRegistry } from '@flexstore/core';

/** Todos resource — one file per resource keeps the registry easy to grow. */
export const todosResource = defineResource({
  name: 'todos',
  softDeletes: true,
  tenantScoped: true,
  attributes: {
    title: 'string',
    done: 'boolean',
  },
});
