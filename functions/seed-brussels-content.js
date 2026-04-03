// Netlify Function: POST /.netlify/functions/seed-brussels-content
//
// Seeds Brussels attractions, restaurants, and hotels with rich content
// and unique Unsplash images per item.
//
// Required env vars:
//   DATABASE_URL   ← Neon connection string
//   IMPORT_SECRET  ← secret token for protection
//
// Usage:
//   curl -s -X POST "https://cityreview.be/.netlify/functions/seed-brussels-content" \
//        -H "x-import-secret: YOUR_SECRET"

const { neon } = require('@neondatabase/serverless');

const ATTRACTIONS = [
  {
    name: 'Grand Place',
    slug: 'grand-place-brussels',
    city_slug: 'brussels',
    category: 'Historical Sites',
    short_description: 'A UNESCO World Heritage Site — one of the most beautiful medieval squares in Europe, surrounded by ornate guild houses and the Gothic Town Hall.',
    description: `The Grand Place (Grote Markt) is Brussels' central square and one of the most impressive medieval marketplaces in the world. Designated a UNESCO World Heritage Site in 1998, the square is surrounded by elaborately decorated 17th-century guild houses, the Gothic Town Hall (Hôtel de Ville) and the Breadhouse (Maison du Roi). The gilded facades dazzle visitors both by day and at night when lit up spectacularly. Every two years in August, the square is carpeted with a stunning floral tapestry made from over half a million begonias.`,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=800&q=80'],
    address: 'Grand Place, 1000 Brussels',
    ticket_price: 'Free (exterior)',
    opening_hours: 'Open 24 hours (exterior)',
    duration: '1–2 hours',
    price_range: '€',
    latitude: 50.8467,
    longitude: 4.3525,
    source: 'seed',
    external_id: 'seed_brussels_grand_place',
  },
  {
    name: 'Atomium',
    slug: 'atomium-brussels',
    city_slug: 'brussels',
    category: 'Museums & Galleries',
    short_description: 'An iconic steel structure built for the 1958 World Expo, representing an iron crystal magnified 165 billion times, with panoramic views over Brussels.',
    description: `The Atomium is one of Belgium's most recognisable landmarks — a towering 102-metre structure shaped like a unit cell of an iron crystal, magnified 165 billion times. Built for the 1958 Brussels World's Fair (Expo 58), it has become a symbol of the optimistic, atomic age. Nine spheres are connected by tubes containing escalators and lifts, with the top sphere offering a stunning panoramic view of Brussels and beyond. Inside, the spheres house permanent exhibitions on the history of Expo 58 and rotating contemporary art exhibitions. The illuminated structure at night is breathtaking.`,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'],
    address: 'Square de l\'Atomium 1, 1020 Brussels',
    ticket_price: 'Adults €16, Children (6–11) €8',
    opening_hours: 'Daily 10:00–18:00',
    duration: '1.5–2 hours',
    price_range: '€€',
    latitude: 50.8948,
    longitude: 4.3412,
    source: 'seed',
    external_id: 'seed_brussels_atomium',
  },
  {
    name: 'Manneken Pis',
    slug: 'manneken-pis-brussels',
    city_slug: 'brussels',
    category: 'Historical Sites',
    short_description: 'Brussels\' cheeky mascot — a small bronze fountain statue of a little boy urinating, dressed in hundreds of themed costumes throughout the year.',
    description: `The Manneken Pis is a small but extraordinarily famous bronze fountain statue depicting a naked little boy urinating into a fountain basin. Created by sculptor Jérôme Duquesnoy in 1619, it has become Brussels' best-known symbol and one of Belgium's most photographed landmarks. Despite its modest size (just 61 cm tall), the statue has an enormous wardrobe of over 1,000 miniature costumes donated by cities, countries and organisations from around the world — on special occasions the statue is dressed accordingly. The original statue is housed in the Brussels City Museum on the Grand Place; the one on the corner of Rue de l'Étuve is a replica.`,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80'],
    address: 'Rue de l\'Étuve / Rue du Chêne, 1000 Brussels',
    ticket_price: 'Free',
    opening_hours: 'Open 24 hours',
    duration: '30 minutes',
    price_range: '€',
    latitude: 50.8449,
    longitude: 4.3499,
    source: 'seed',
    external_id: 'seed_brussels_manneken_pis',
  },
  {
    name: 'Royal Museums of Fine Arts of Belgium',
    slug: 'royal-museums-fine-arts-brussels',
    city_slug: 'brussels',
    category: 'Museums & Galleries',
    short_description: 'One of Belgium\'s most important art institutions, housing masterpieces by Bruegel, Rubens, Magritte and more across six interconnected museums.',
    description: `The Royal Museums of Fine Arts of Belgium is one of the oldest and largest art institutions in the country, comprising six interconnected museums spanning Belgian and international art from the 15th century to the present day. Highlights include the Ancient Art Museum with works by Pieter Bruegel the Elder and Peter Paul Rubens, and the Magritte Museum — the world's largest collection of works by the Surrealist master René Magritte. The building itself is an architectural landmark. The museums share an impressive collection of over 20,000 works of art ranging from Flemish Primitives to Impressionism and contemporary Belgian art.`,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80'],
    address: 'Rue de la Régence 3, 1000 Brussels',
    ticket_price: 'Adults €15, Under 26 free',
    opening_hours: 'Tue–Fri 10:00–17:00, Sat–Sun 11:00–18:00',
    duration: '2–3 hours',
    price_range: '€€',
    latitude: 50.8426,
    longitude: 4.3600,
    source: 'seed',
    external_id: 'seed_brussels_royal_museums',
  },
  {
    name: 'Galeries Royales Saint-Hubert',
    slug: 'galeries-royales-saint-hubert-brussels',
    city_slug: 'brussels',
    category: 'Historical Sites',
    short_description: 'Europe\'s oldest shopping arcade, built in 1847 — an elegant neoclassical glass-roofed gallery lined with boutiques, chocolatiers and cafés.',
    description: `The Galeries Royales Saint-Hubert is a breathtaking neo-Renaissance covered shopping arcade built in 1847 — one of the oldest and most beautiful in Europe. The arcade runs for 213 metres and is divided into three parts: the Galerie du Roi, Galerie de la Reine and Galerie des Princes. Its iron-and-glass vaulted ceiling filters soft light over the boutiques, chocolatiers, bookshops, theatres and restaurants below. Victor Hugo, Karl Marx and Alexandre Dumas were among its early admirers. Today it remains a working shopping and cultural centre, home to some of Brussels' finest chocolate shops and the Galeries cinema.`,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80'],
    address: 'Galerie du Roi 5, 1000 Brussels',
    ticket_price: 'Free',
    opening_hours: 'Daily 08:00–23:00',
    duration: '30–60 minutes',
    price_range: '€',
    latitude: 50.8480,
    longitude: 4.3551,
    source: 'seed',
    external_id: 'seed_brussels_galeries_saint_hubert',
  },
  {
    name: 'Parc du Cinquantenaire',
    slug: 'parc-du-cinquantenaire-brussels',
    city_slug: 'brussels',
    category: 'Parks & Nature',
    short_description: 'A grand public park with a triumphal arch and three world-class museums, built to celebrate Belgium\'s 50th anniversary of independence.',
    description: `The Parc du Cinquantenaire (Jubelpark) is one of Brussels' largest and most impressive parks, created to mark the 50th anniversary of Belgian independence in 1880. The centrepiece is a magnificent triumphal arch flanked by colonnades, which frames the Brussels skyline dramatically. The park hosts three major museums: the Art & History Museum with its vast collection spanning ancient civilisations to art nouveau; the Autoworld museum with over 300 vintage vehicles; and the Royal Museum of the Army and Military History. The surrounding parkland is a beloved green space for residents — popular for cycling, picnicking and outdoor events throughout the year.`,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80'],
    address: 'Parc du Cinquantenaire, 1000 Brussels',
    ticket_price: 'Park free; museums from €8',
    opening_hours: 'Park: daily 06:00–22:00; Museums: Tue–Fri 09:30–17:00',
    duration: '2–4 hours',
    price_range: '€€',
    latitude: 50.8405,
    longitude: 4.3876,
    source: 'seed',
    external_id: 'seed_brussels_cinquantenaire',
  },
  {
    name: 'Mini-Europe',
    slug: 'mini-europe-brussels',
    city_slug: 'brussels',
    category: 'Tours & Experiences',
    short_description: 'A miniature park at the foot of the Atomium featuring 1:25 scale replicas of over 350 famous European monuments from all EU member states.',
    description: `Mini-Europe is a unique open-air miniature park located at the foot of the Atomium in the Laeken district of Brussels. Opened in 1989, it showcases over 350 scale reproductions (1:25) of the most iconic monuments and buildings from all European Union member states. Stroll past Big Ben, the Eiffel Tower, the Acropolis, the Colosseum and many lesser-known regional treasures — all in a single afternoon. Many models feature interactive elements: the eruption of Mount Vesuvius, the fall of the Berlin Wall and working windmills and trains. A delightful experience for families and anyone who wants to discover the richness of European heritage in miniature.`,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80'],
    address: 'Bruparck, Avenue du Football 1, 1020 Brussels',
    ticket_price: 'Adults €17.50, Children (3–11) €13',
    opening_hours: 'Daily 09:30–18:00 (extended hours in summer)',
    duration: '2–3 hours',
    price_range: '€€',
    latitude: 50.8967,
    longitude: 4.3387,
    source: 'seed',
    external_id: 'seed_brussels_mini_europe',
  },
  {
    name: 'Basilica of the Sacred Heart',
    slug: 'basilica-sacred-heart-brussels',
    city_slug: 'brussels',
    category: 'Historical Sites',
    short_description: 'One of the world\'s largest churches by volume, a striking Art Deco basilica dominating the Koekelberg hill with panoramic views over Brussels.',
    description: `The National Basilica of the Sacred Heart (Basilique du Sacré-Cœur) in Koekelberg is the fifth-largest church in the world by interior volume and one of Brussels' most dramatic landmarks. Begun in 1905 and completed only in 1970, it combines Gothic structure with Art Deco detailing in a way unique in religious architecture. The copper-green domes are visible from across the city. Inside, the nave is flooded with light through enormous stained-glass windows, and the Art Deco interior is richly decorated with Belgian artworks. Visitors can ascend to the panoramic gallery for sweeping 360-degree views over Brussels and beyond — on clear days you can see for 75 kilometres.`,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80'],
    address: 'Parvis de la Basilique 1, 1083 Koekelberg, Brussels',
    ticket_price: 'Church free; panorama €5',
    opening_hours: 'Daily 08:00–18:00',
    duration: '1–1.5 hours',
    price_range: '€',
    latitude: 50.8678,
    longitude: 4.3218,
    source: 'seed',
    external_id: 'seed_brussels_basilica_sacred_heart',
  },
];

const RESTAURANTS = [
  {
    name: 'Chez Léon',
    slug: 'chez-leon-brussels',
    city_slug: 'brussels',
    cuisine_type: 'Belgian',
    price_range: '€€',
    short_description: 'A Brussels institution since 1893, famous for its moules-frites, served in an atmospheric brasserie steps from the Grand Place.',
    description: `Chez Léon is one of Brussels' most famous and beloved restaurants, having served traditional Belgian cuisine since 1893. Located in the Rue des Bouchers — the city's restaurant row — it is an institution for moules-frites (mussels and chips), the quintessential Belgian dish. The dining room is warm and bustling, with classic brasserie décor, and the service is efficiently friendly. Beyond mussels prepared in over a dozen different ways, the menu features Belgian classics: vol-au-vent, stoemp, and waterzooi. A must-visit for an authentic, unpretentious taste of Brussels culinary heritage.`,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80'],
    address: 'Rue des Bouchers 18, 1000 Brussels',
    phone: '+32 2 511 14 15',
    website: 'https://www.chezleon.be',
    opening_hours: 'Daily 12:00–23:00',
    latitude: 50.8490,
    longitude: 4.3558,
    source: 'seed',
    external_id: 'seed_brussels_chez_leon',
  },
  {
    name: 'Fin de Siècle',
    slug: 'fin-de-siecle-brussels',
    city_slug: 'brussels',
    cuisine_type: 'Belgian',
    price_range: '€',
    short_description: 'A no-frills, no-reservations Brussels gem beloved by locals for hearty Belgian dishes, generous portions and a lively bistro atmosphere.',
    description: `Fin de Siècle is a beloved neighbourhood bistro in central Brussels, consistently rated among the best value restaurants in the city. There are no reservations, no menu card — just a blackboard of daily Belgian classics chalked up each day. Generous portions of stoemp, carbonnade flamande (Belgian beef and beer stew), rabbit in kriek, and vol-au-vent are served at communal tables to a mix of students, locals and savvy tourists. The atmosphere is lively and unpretentious, the prices are remarkably affordable, and the food is honest and deeply satisfying. Arrive early or expect to queue.`,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'],
    address: 'Rue des Chartreux 9, 1000 Brussels',
    opening_hours: 'Mon–Sat 12:00–15:00, 18:00–00:00',
    latitude: 50.8483,
    longitude: 4.3464,
    source: 'seed',
    external_id: 'seed_brussels_fin_de_siecle',
  },
  {
    name: 'Brasserie de la Senne',
    slug: 'brasserie-de-la-senne-brussels',
    city_slug: 'brussels',
    cuisine_type: 'Belgian Beer Café',
    price_range: '€€',
    short_description: 'A craft brewery and café in Molenbeek celebrating traditional Brussels beer culture with exceptional house-brewed ales and seasonal specials.',
    description: `Brasserie de la Senne is one of Brussels' most respected craft breweries, named after the Senne river that once flowed through the city. Founded in 2010, it produces a range of unpasteurised, unfiltered ales inspired by traditional Brussels and Belgian brewing techniques, including Taras Boulba (a light, hop-forward ale), Stouterik (a smooth dark stout) and a range of seasonal specials. Their taproom and café is relaxed and welcoming, popular with locals and beer enthusiasts from around the world. The kitchen serves simple dishes designed to complement the beers — ideal for an authentic taste of contemporary Brussels brewing.`,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80'],
    address: 'Rue Delaunoy 39, 1080 Molenbeek, Brussels',
    website: 'https://www.brasseriedelasenne.be',
    opening_hours: 'Thu–Sat 16:00–23:00',
    latitude: 50.8544,
    longitude: 4.3338,
    source: 'seed',
    external_id: 'seed_brussels_brasserie_senne',
  },
  {
    name: 'Comme Chez Soi',
    slug: 'comme-chez-soi-brussels',
    city_slug: 'brussels',
    cuisine_type: 'French/Belgian Fine Dining',
    price_range: '€€€€',
    short_description: 'A legendary two-Michelin-star Brussels institution in a stunning Art Nouveau interior, serving refined Belgian-French haute cuisine since 1926.',
    description: `Comme Chez Soi ("Like at Home") is Brussels' most iconic fine dining restaurant, having held two Michelin stars for decades. Founded in 1926, it occupies a beautifully preserved Art Nouveau town house near the Place Rouppe, with an extraordinary stained-glass interior designed by Victor Horta's student Gustave Strauven. The kitchen produces technically brilliant, deeply seasonal French-Belgian cuisine of the highest order — classical technique applied to the finest Belgian and French ingredients. A reservation is essential, often weeks in advance. An extraordinary experience for a special occasion, combining exceptional food with one of the most beautiful restaurant interiors in Europe.`,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80'],
    address: 'Place Rouppe 23, 1000 Brussels',
    phone: '+32 2 512 29 21',
    website: 'https://www.commechezsoi.be',
    opening_hours: 'Tue–Sat 12:00–14:00, 19:00–21:30 (closed Sun–Mon)',
    latitude: 50.8441,
    longitude: 4.3466,
    source: 'seed',
    external_id: 'seed_brussels_comme_chez_soi',
  },
];

const HOTELS = [
  {
    name: 'Hotel Amigo',
    slug: 'hotel-amigo-brussels',
    city_slug: 'brussels',
    type: 'Hotel',
    star_rating: 5,
    price_range: '€€€€',
    short_description: 'A legendary five-star luxury hotel steps from the Grand Place, combining Renaissance-inspired architecture with Belgian artistic heritage and impeccable service.',
    description: `Hotel Amigo is Brussels' most prestigious address — a five-star Rocco Forte hotel occupying a prime position just steps from the Grand Place. The name has a colourful history: the site was a prison in the 16th century, and the Spanish occupiers' mispronunciation of "ami" (friend) as "amigo" gave it its name. Today the hotel is a masterpiece of Belgian luxury, its interior decorated with original works by Pieter Bruegel the Elder and commissions from leading Belgian designers. The 154 rooms and suites are individually furnished with Flemish tapestries and Brussels' finest antiques. The hotel's restaurant, Bocconi, serves outstanding Italian cuisine, and the concierge service is legendary.`,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80'],
    address: 'Rue de l\'Amigo 1–3, 1000 Brussels',
    phone: '+32 2 547 47 47',
    website: 'https://www.roccofortehotels.com/hotels-and-resorts/hotel-amigo/',
    latitude: 50.8452,
    longitude: 4.3524,
    source: 'seed',
    external_id: 'seed_brussels_hotel_amigo',
  },
  {
    name: 'The Dominican',
    slug: 'the-dominican-brussels',
    city_slug: 'brussels',
    type: 'Hotel',
    star_rating: 4,
    price_range: '€€€',
    short_description: 'A stylish four-star boutique hotel in a converted 15th-century Dominican priory, blending historical architecture with contemporary design in the heart of Brussels.',
    description: `The Dominican is one of Brussels' most distinctive hotels, occupying a beautifully converted 15th-century Dominican priory in the heart of the city, a short walk from the Grand Place and Galeries Saint-Hubert. The hotel seamlessly combines the original priory's vaulted stone ceilings, Gothic arches and historic courtyard with sleek contemporary interior design by Christophe Pillet. The 150 rooms are modern and well-appointed, and the Grand Lounge in the former chapel is one of Brussels' most atmospheric spaces for a drink or informal meeting. The hotel's restaurant, Grand Café, serves all-day Belgian and international cuisine in a relaxed setting.`,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'],
    address: 'Rue Léopold 9, 1000 Brussels',
    phone: '+32 2 203 08 08',
    website: 'https://www.thedominican.be',
    latitude: 50.8497,
    longitude: 4.3548,
    source: 'seed',
    external_id: 'seed_brussels_the_dominican',
  },
  {
    name: 'Meininger Hotel Brussels City Center',
    slug: 'meininger-hotel-brussels',
    city_slug: 'brussels',
    type: 'Hostel',
    star_rating: 3,
    price_range: '€',
    short_description: 'A modern, well-located hostel and budget hotel near Brussels South station, ideal for solo travellers and groups exploring Brussels on a budget.',
    description: `Meininger Brussels City Center is a well-run, modern hostel and budget hotel near Gare du Midi (Brussels South), making it ideally located for arrivals by Eurostar, Thalys or local trains. The property offers a mix of private rooms and dormitories, all clean, contemporary and well-equipped. Facilities include a lively common room and bar, a games room, free Wi-Fi throughout and a fully equipped self-catering kitchen. The central location gives easy access to all of Brussels' main attractions by public transport. An excellent choice for backpackers, solo travellers and groups looking for good-value, sociable accommodation in central Brussels.`,
    rating: 4.1,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'],
    address: 'Rue du Midi 98, 1000 Brussels',
    phone: '+32 2 588 14 74',
    website: 'https://www.meininger-hotels.com',
    latitude: 50.8438,
    longitude: 4.3448,
    source: 'seed',
    external_id: 'seed_brussels_meininger',
  },
];

exports.handler = async (event) => {
  const secret = event.headers['x-import-secret'];
  if (!secret || secret !== process.env.IMPORT_SECRET) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);

  try {
    // Add extra columns to attractions if they don't exist yet
    await sql.query(`ALTER TABLE attractions ADD COLUMN IF NOT EXISTS ticket_price text`);
    await sql.query(`ALTER TABLE attractions ADD COLUMN IF NOT EXISTS opening_hours text`);
    await sql.query(`ALTER TABLE attractions ADD COLUMN IF NOT EXISTS duration text`);
    await sql.query(`ALTER TABLE attractions ADD COLUMN IF NOT EXISTS price_range text`);
    // Add opening_hours to restaurants if missing
    await sql.query(`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS opening_hours text`);

    const results = { attractions: 0, restaurants: 0, hotels: 0 };

    // ── Attractions ────────────────────────────────────────────────────────────
    for (const item of ATTRACTIONS) {
      await sql.query(
        `INSERT INTO attractions (
          name, slug, city_slug, category,
          short_description, description, rating,
          image, images, address, ticket_price, opening_hours, duration, price_range,
          latitude, longitude, source, external_id, created_date
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, $7,
          $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, NOW()
        )
        ON CONFLICT (external_id) DO UPDATE SET
          name              = EXCLUDED.name,
          slug              = EXCLUDED.slug,
          city_slug         = EXCLUDED.city_slug,
          category          = EXCLUDED.category,
          short_description = EXCLUDED.short_description,
          description       = EXCLUDED.description,
          rating            = EXCLUDED.rating,
          image             = EXCLUDED.image,
          images            = EXCLUDED.images,
          address           = EXCLUDED.address,
          ticket_price      = EXCLUDED.ticket_price,
          opening_hours     = EXCLUDED.opening_hours,
          duration          = EXCLUDED.duration,
          price_range       = EXCLUDED.price_range,
          latitude          = EXCLUDED.latitude,
          longitude         = EXCLUDED.longitude`,
        [
          item.name, item.slug, item.city_slug, item.category,
          item.short_description, item.description, item.rating,
          item.image, item.images, item.address,
          item.ticket_price || null, item.opening_hours || null,
          item.duration || null, item.price_range || null,
          item.latitude, item.longitude, item.source, item.external_id,
        ]
      );
      results.attractions++;
    }

    // ── Restaurants ────────────────────────────────────────────────────────────
    for (const item of RESTAURANTS) {
      await sql.query(
        `INSERT INTO restaurants (
          name, slug, city_slug, cuisine_type, price_range,
          short_description, description, rating,
          image, images, address, phone, website, opening_hours,
          latitude, longitude, source, external_id, created_date
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8,
          $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, NOW()
        )
        ON CONFLICT (external_id) DO UPDATE SET
          name              = EXCLUDED.name,
          slug              = EXCLUDED.slug,
          city_slug         = EXCLUDED.city_slug,
          cuisine_type      = EXCLUDED.cuisine_type,
          price_range       = EXCLUDED.price_range,
          short_description = EXCLUDED.short_description,
          description       = EXCLUDED.description,
          rating            = EXCLUDED.rating,
          image             = EXCLUDED.image,
          images            = EXCLUDED.images,
          address           = EXCLUDED.address,
          phone             = EXCLUDED.phone,
          website           = EXCLUDED.website,
          opening_hours     = EXCLUDED.opening_hours,
          latitude          = EXCLUDED.latitude,
          longitude         = EXCLUDED.longitude`,
        [
          item.name, item.slug, item.city_slug, item.cuisine_type, item.price_range,
          item.short_description, item.description, item.rating,
          item.image, item.images, item.address,
          item.phone || null, item.website || null, item.opening_hours || null,
          item.latitude, item.longitude, item.source, item.external_id,
        ]
      );
      results.restaurants++;
    }

    // ── Hotels ─────────────────────────────────────────────────────────────────
    for (const item of HOTELS) {
      await sql.query(
        `INSERT INTO hotels (
          name, slug, city_slug, type, star_rating, price_range,
          short_description, description, rating,
          image, images, address, phone, website,
          latitude, longitude, source, external_id, created_date
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9,
          $10, $11, $12, $13, $14,
          $15, $16, $17, $18, NOW()
        )
        ON CONFLICT (external_id) DO UPDATE SET
          name              = EXCLUDED.name,
          slug              = EXCLUDED.slug,
          city_slug         = EXCLUDED.city_slug,
          type              = EXCLUDED.type,
          star_rating       = EXCLUDED.star_rating,
          price_range       = EXCLUDED.price_range,
          short_description = EXCLUDED.short_description,
          description       = EXCLUDED.description,
          rating            = EXCLUDED.rating,
          image             = EXCLUDED.image,
          images            = EXCLUDED.images,
          address           = EXCLUDED.address,
          phone             = EXCLUDED.phone,
          website           = EXCLUDED.website,
          latitude          = EXCLUDED.latitude,
          longitude         = EXCLUDED.longitude`,
        [
          item.name, item.slug, item.city_slug, item.type, item.star_rating, item.price_range,
          item.short_description, item.description, item.rating,
          item.image, item.images, item.address,
          item.phone || null, item.website || null,
          item.latitude, item.longitude, item.source, item.external_id,
        ]
      );
      results.hotels++;
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: `Seeded Brussels content`,
        results,
      }),
    };
  } catch (err) {
    console.error('seed-brussels-content error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
