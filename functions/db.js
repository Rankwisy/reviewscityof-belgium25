// Netlify Function: /api/db
// Generic entity query endpoint for the React frontend.
// Keeps the Neon DATABASE_URL server-side only.
//
// POST body: { entity, method, args }
//   method = "list"   | args = [sortField, limit]
//   method = "filter" | args = [conditions, sortField, limit]
//   method = "get"    | args = [id]
//   method = "create" | args = [data]
//   method = "update" | args = [id, data]
//   method = "delete" | args = [id]

const { neon } = require('@neondatabase/serverless');

const TABLE_MAP = {
  City:             'cities',
  Attraction:       'attractions',
  Restaurant:       'restaurants',
  Hotel:            'hotels',
  Business:         'businesses',
  BusinessReview:   'business_reviews',
  BusinessCategory: 'business_categories',
  Event:            'events',
  Blog:             'blogs',
};

// '-rating' → { col: 'rating', dir: 'DESC' }
function parseSort(sortField) {
  if (!sortField) return { col: 'created_date', dir: 'DESC' };
  const desc = sortField.startsWith('-');
  return { col: sortField.replace(/^-/, ''), dir: desc ? 'DESC' : 'ASC' };
}

// Validate identifiers to prevent SQL injection on column/table names
const ID_RE = /^[a-z_][a-z0-9_]*$/i;
function safeIdent(str) {
  if (!ID_RE.test(str)) throw new Error(`Invalid identifier: ${str}`);
  return `"${str}"`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { entity, method, args = [] } = body;

  const table = TABLE_MAP[entity];
  if (!table) {
    return { statusCode: 400, body: `Unknown entity: ${entity}` };
  }

  // Block write operations from the public API (use import-apify-data for writes)
  const WRITE_METHODS = ['create', 'update', 'delete'];

  // Only allow review creation from the public API (user submitted reviews)
  const allowWrite = entity === 'BusinessReview' && method === 'create';

  if (WRITE_METHODS.includes(method) && !allowWrite) {
    return { statusCode: 403, body: 'Write access not allowed via public API' };
  }

  const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);

  try {
    let result;
    const tbl = safeIdent(table);

    if (method === 'list') {
      const [sortField, limit = 100] = args;
      const { col, dir } = parseSort(sortField);
      const raw = `SELECT * FROM ${tbl} ORDER BY ${safeIdent(col)} ${dir} LIMIT $1`;
      const res = await sql.query(raw, [limit]);
      result = res.rows;
    }

    else if (method === 'filter') {
      const [conditions = {}, sortField, limit = 100] = args;
      const { col, dir } = parseSort(sortField);
      const entries = Object.entries(conditions);

      if (entries.length === 0) {
        const raw = `SELECT * FROM ${tbl} ORDER BY ${safeIdent(col)} ${dir} LIMIT $1`;
        const res = await sql.query(raw, [limit]);
        result = res.rows;
      } else {
        const whereParts = entries.map(([k], i) => `${safeIdent(k)} = $${i + 1}`).join(' AND ');
        const values = entries.map(([, v]) => v);
        const raw = `SELECT * FROM ${tbl} WHERE ${whereParts} ORDER BY ${safeIdent(col)} ${dir} LIMIT $${values.length + 1}`;
        const res = await sql.query(raw, [...values, limit]);
        result = res.rows;
      }
    }

    else if (method === 'get') {
      const [id] = args;
      const res = await sql.query(`SELECT * FROM ${tbl} WHERE id = $1 LIMIT 1`, [id]);
      result = res.rows[0] ?? null;
    }

    else if (method === 'create' && allowWrite) {
      const [data] = args;
      // Force status = 'pending' for reviews (ignore any client-supplied status)
      if (entity === 'BusinessReview') data.status = 'pending';
      const cols = Object.keys(data).map(safeIdent).join(', ');
      const vals = Object.values(data);
      const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
      const raw = `INSERT INTO ${tbl} (${cols}) VALUES (${placeholders}) RETURNING *`;
      const res = await sql.query(raw, vals);
      result = res.rows[0];
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result ?? []),
    };
  } catch (err) {
    console.error(`[db] ${entity}.${method}:`, err.message);
    return { statusCode: 500, body: err.message };
  }
};
