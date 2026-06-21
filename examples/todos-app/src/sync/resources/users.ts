import { defineResource } from '@flexstore/react';

/** Optional second resource — same pattern, separate file. */
export const usersResource = defineResource({
  name: 'users',
  softDeletes: true,
  tenantScoped: true,
  attributes: {
    name: 'string',
    email: 'string',
  },
});
