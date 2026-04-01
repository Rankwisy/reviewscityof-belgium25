// Neon client — calls the /api/db Netlify function.
// Exposes the same interface as the old Base44 entity stubs so no page files change.

const API_URL = import.meta.env.DEV
  ? 'http://localhost:8888/.netlify/functions/db'   // netlify dev
  : '/.netlify/functions/db';

async function callDb(entity, method, args = []) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entity, method, args }),
  });
  if (!res.ok) {
    console.error(`[neon] ${entity}.${method} → HTTP ${res.status}`);
    return method === 'list' || method === 'filter' ? [] : null;
  }
  return res.json();
}

function createEntityAdapter(entityName) {
  return {
    list: (sortField, limit = 100) =>
      callDb(entityName, 'list', [sortField, limit]),

    filter: (conditions, sortField, limit = 100) =>
      callDb(entityName, 'filter', [conditions, sortField, limit]),

    get: (id) =>
      callDb(entityName, 'get', [id]),

    create: (data) =>
      callDb(entityName, 'create', [data]),

    update: (id, data) =>
      callDb(entityName, 'update', [id, data]),

    delete: (id) =>
      callDb(entityName, 'delete', [id]),
  };
}

// Proxy: any entity name → adapter
const entities = new Proxy(
  {},
  { get: (_, entityName) => createEntityAdapter(entityName) }
);

export const neonBase44 = { entities };
