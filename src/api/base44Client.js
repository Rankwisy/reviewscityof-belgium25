// Lightweight local stub of the Base44 client so the app can run
// without any external Base44 backend or configuration.

const createNoopEntity = () => ({
  // Listing/filtering return empty arrays so UI components can safely .map()
  list: async () => [],
  filter: async () => [],
  // Mutations resolve with a basic object so admin UIs don't crash
  create: async (data) => ({ id: Date.now().toString(), ...data }),
  update: async (id, data) => ({ id, ...data }),
  delete: async () => true,
});

// Proxy so any entity name (City, Attraction, etc.) returns a safe stub
const entities = new Proxy(
  {},
  {
    get: () => createNoopEntity(),
  }
);

export const base44 = {
  entities,
  auth: {
    // Treat all users as unauthenticated in this stub
    me: async () => {
      const error = new Error('Auth disabled in static deployment');
      error.status = 401;
      throw error;
    },
    redirectToLogin: () => {
      // No-op in static deployment
    },
    logout: () => {
      // No-op in static deployment
    },
  },
  appLogs: {
    logUserInApp: async () => {
      // Do nothing; logging should never break the app
    },
  },
  integrations: {
    Core: {},
  },
};

// Expose stub on window for any legacy window.base44 references
if (typeof window !== 'undefined') {
  window.base44 = base44;
}
