// Data layer — backed by Neon PostgreSQL via Netlify functions.
// All pages use base44.entities.EntityName.list/filter/create/update/delete
// so the same interface is preserved without touching any page files.

import { neonBase44 } from './neonClient';

export const base44 = {
  entities: neonBase44.entities,

  auth: {
    me: async () => {
      const error = new Error('Auth not configured');
      error.status = 401;
      throw error;
    },
    redirectToLogin: () => {},
    logout: () => {},
  },

  appLogs: {
    logUserInApp: async () => {},
  },

  integrations: {
    Core: {},
  },
};

if (typeof window !== 'undefined') {
  window.base44 = base44;
}
