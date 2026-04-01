// Netlify Function: POST /.netlify/functions/import-apify-data
//
// Fetches a completed Apify dataset and upserts records into Neon PostgreSQL.
//
// Request body (JSON):
//   {
//     "datasetId": "abc123",        // Apify dataset ID (from run detail page)
//     "source": "google_maps",      // "google_maps" | "tripadvisor" | "yelp"
//     "entityType": "restaurants",  // "restaurants" | "hotels" | "attractions" | "businesses"
//     "citySlug": "brussels"        // optional — force all records to this city
//   }
//
// Required env vars (Netlify dashboard → Environment variables):
//   DATABASE_URL       ← Neon connection string (postgres://user:pass@host/db)
//   APIFY_API_TOKEN
//   IMPORT_SECRET      ← optional auth token for this endpoint

const { neon } = require('@neondatabase/serverless');

const APIFY_BASE = 'https://api.apify.com/v2';

// ── Slug helper ────────────────────────────────────────────────────────────────
function slugify(text = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Price range ────────────────────────────────────────────────────────────────
function inferPriceRange(item) {
  if (item.priceLevel !== undefined) {
    return ['', '€', '€€', '€€€', '€€€€'][item.priceLevel] ?? null;
  }
  if (item.price) {
    const count = (item.price.match(/€/g) || []).length;
    return count > 0 ? '€'.repeat(count) : item.price;
  }
  return null;
}

// ── City slug inference ────────────────────────────────────────────────────────
const CITY_KEYWORDS = {
  brussels: 'brussels', bruxelles: 'brussels', brussel: 'brussels',
  bruges: 'bruges', brugge: 'bruges',
  ghent: 'ghent', gent: 'ghent',
  antwerp: 'antwerp', antwerpen: 'antwerp', anvers: 'antwerp',
  'liège': 'liege', liege: 'liege', luik: 'liege',
  namur: 'namur', namen: 'namur',
  leuven: 'leuven', louvain: 'leuven',
  dinant: 'dinant',
  mons: 'mons', bergen: 'mons',
};

function inferCitySlug(addressStr = '') {
  const lower = addressStr.toLowerCase();
  for (const [kw, slug] of Object.entries(CITY_KEYWORDS)) {
    if (lower.includes(kw)) return slug;
  }
  return null;
}

function inferHotelType(cat = '') {
  const l = cat.toLowerCase();
  if (l.includes('hostel')) return 'Hostel';
  if (l.includes('bed') || l.includes('b&b') || l.includes('breakfast')) return 'Bed & Breakfast';
  if (l.includes('apartment') || l.includes('rental') || l.includes('vacation')) return 'Vacation Rental';
  return 'Hotel';
}

function mapAttractionCategory(cat = '') {
  const l = cat.toLowerCase();
  if (l.includes('museum') || l.includes('gallery') || l.includes('art')) return 'Museums & Galleries';
  if (l.includes('histor') || l.includes('monument') || l.includes('castle') || l.includes('church')) return 'Historical Sites';
  if (l.includes('park') || l.includes('nature') || l.includes('garden')) return 'Parks & Nature';
  if (l.includes('night') || l.includes('bar') || l.includes('club') || l.includes('entertainment')) return 'Nightlife & Entertainment';
  return 'Tours & Experiences';
}

// ── Field mappers ──────────────────────────────────────────────────────────────
function mapGoogleMaps(item, entityType, citySlug) {
  const base = {
    name: item.title || item.name,
    slug: slugify(item.title || item.name) + '-' + String(item.placeId || Date.now()).slice(-6),
    city_slug: citySlug || inferCitySlug(item.address || ''),
    rating: item.totalScore ?? item.rating ?? null,
    address: item.address || null,
    phone: item.phone || null,
    website: item.website || null,
    image: item.imageUrl || item.images?.[0] || null,
    images: item.images || [],
    latitude: item.location?.lat ?? null,
    longitude: item.location?.lng ?? null,
    source: 'google_maps',
    external_id: item.placeId || null,
    description: item.description || null,
    short_description: item.description?.slice(0, 200) || null,
  };
  if (entityType === 'restaurants') return { ...base, cuisine_type: item.categoryName || null, price_range: inferPriceRange(item) };
  if (entityType === 'hotels')      return { ...base, type: inferHotelType(item.categoryName || ''), star_rating: item.stars || null, price_range: inferPriceRange(item) };
  if (entityType === 'attractions') return { ...base, category: mapAttractionCategory(item.categoryName || '') };
  return base;
}

function mapTripAdvisor(item, entityType, citySlug) {
  const addr = [item.addressObj?.street, item.addressObj?.city].filter(Boolean).join(', ');
  const base = {
    name: item.name,
    slug: slugify(item.name) + '-' + String(item.locationId || Date.now()).slice(-6),
    city_slug: citySlug || inferCitySlug(addr),
    rating: item.rating || null,
    address: addr || null,
    phone: item.phone || null,
    website: item.website || null,
    image: item.photo?.images?.large?.url || null,
    images: item.photo ? [item.photo.images?.large?.url].filter(Boolean) : [],
    latitude: item.latitude || null,
    longitude: item.longitude || null,
    source: 'tripadvisor',
    external_id: item.locationId ? `ta_${item.locationId}` : null,
    description: item.description || null,
    short_description: item.description?.slice(0, 200) || null,
  };
  if (entityType === 'restaurants') return { ...base, cuisine_type: item.cuisine?.[0]?.name || null, price_range: item.priceLevel || null };
  if (entityType === 'hotels')      return { ...base, type: 'Hotel', star_rating: item.hotelClass ? Math.round(item.hotelClass) : null };
  if (entityType === 'attractions') return { ...base, category: mapAttractionCategory(item.subCategory?.[0]?.name || '') };
  return base;
}

function mapYelp(item, entityType, citySlug) {
  const base = {
    name: item.name,
    slug: slugify(item.name) + '-' + String(item.id || Date.now()).slice(-6),
    city_slug: citySlug || inferCitySlug(item.location?.city || ''),
    rating: item.rating || null,
    address: item.location?.display_address?.join(', ') || null,
    phone: item.display_phone || null,
    website: item.url || null,
    image: item.image_url || null,
    images: item.image_url ? [item.image_url] : [],
    latitude: item.coordinates?.latitude || null,
    longitude: item.coordinates?.longitude || null,
    source: 'yelp',
    external_id: item.id ? `yelp_${item.id}` : null,
    short_description: item.categories?.map(c => c.title).join(', ') || null,
  };
  if (entityType === 'restaurants') return { ...base, cuisine_type: item.categories?.[0]?.title || null, price_range: item.price || null };
  return base;
}

// ── Upsert helpers ─────────────────────────────────────────────────────────────
async function upsertBatch(sql, table, records) {
  if (records.length === 0) return 0;
  const cols = Object.keys(records[0]);
  const colList = cols.map(c => `"${c}"`).join(', ');
  const updateList = cols.filter(c => c !== 'external_id' && c !== 'id')
    .map(c => `"${c}" = EXCLUDED."${c}"`).join(', ');

  let imported = 0;
  for (const record of records) {
    const vals = cols.map(c => record[c]);
    const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
    try {
      await sql.query(
        `INSERT INTO "${table}" (${colList}) VALUES (${placeholders})
         ON CONFLICT (external_id) DO UPDATE SET ${updateList}`,
        vals
      );
      imported++;
    } catch (err) {
      console.warn(`[import] skipping record "${record.name}": ${err.message}`);
    }
  }
  return imported;
}

// ── Main handler ───────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const secret = process.env.IMPORT_SECRET;
  if (secret && event.headers['authorization'] !== `Bearer ${secret}`) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  const { datasetId, source, entityType, citySlug } = body;
  if (!datasetId || !source || !entityType) {
    return { statusCode: 400, body: 'Required: datasetId, source, entityType' };
  }

  const TABLE_MAP = { restaurants: 'restaurants', hotels: 'hotels', attractions: 'attractions', businesses: 'businesses' };
  const table = TABLE_MAP[entityType];
  if (!table) return { statusCode: 400, body: `Unknown entityType: ${entityType}` };

  const MAPPER = { google_maps: mapGoogleMaps, tripadvisor: mapTripAdvisor, yelp: mapYelp };
  const mapper = MAPPER[source];
  if (!mapper) return { statusCode: 400, body: `Unknown source: ${source}` };

  // Fetch from Apify
  const apifyUrl = `${APIFY_BASE}/datasets/${datasetId}/items?token=${process.env.APIFY_API_TOKEN}&format=json&clean=true&limit=2000`;
  let items;
  try {
    const res = await fetch(apifyUrl);
    if (!res.ok) throw new Error(`Apify ${res.status}: ${await res.text()}`);
    items = await res.json();
  } catch (err) {
    return { statusCode: 502, body: `Apify fetch failed: ${err.message}` };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { statusCode: 200, body: JSON.stringify({ imported: 0, message: 'Empty dataset' }) };
  }

  const records = items
    .map(item => mapper(item, entityType, citySlug))
    .filter(r => r.name && r.slug);

  const sql = neon(process.env.DATABASE_URL);
  const imported = await upsertBatch(sql, table, records);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ datasetId, source, entityType, total: items.length, imported, skipped: items.length - imported }),
  };
};
