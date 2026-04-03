// Netlify Function: POST /.netlify/functions/seed-cities
//
// Seeds the cities table with rich touristic content and hero images
// for Brussels, Bruges, Antwerp and Ghent.
//
// Also adds missing DB columns (best_time_to_visit, languages, best_for)
// if they don't already exist.
//
// Required env vars:
//   DATABASE_URL   ← Neon connection string
//   IMPORT_SECRET  ← secret token for protection
//
// Usage:
//   curl -s -X POST "https://cityreview.be/.netlify/functions/seed-cities" \
//        -H "x-import-secret: YOUR_SECRET"

const { neon } = require('@neondatabase/serverless');

const CITIES = [
  {
    name: 'Brussels',
    slug: 'brussels',
    tagline: 'Capital of Europe — History, Art & Belgian Gastronomy',
    short_description:
      "Belgium's vibrant capital blends medieval grandeur with modern cosmopolitanism, home to the EU, world-class cuisine and iconic landmarks.",
    description: `Brussels is one of Europe's most cosmopolitan capitals — a city where medieval cobblestones meet the headquarters of the European Union, and where world-famous chocolatiers sit beside Michelin-starred restaurants.

At the heart of Brussels lies the Grand Place, a UNESCO World Heritage Site and one of the most beautiful squares in the world. Surrounded by ornate 17th-century guild houses and the magnificent Gothic Town Hall, it dazzles visitors day and night. A short walk away, the cheeky Manneken Pis statue has been delighting tourists for centuries.

Beyond the historic centre, the Atomium — a giant steel atom built for the 1958 World's Fair — offers panoramic views of the city, while the Royal Museums of Fine Arts house masterpieces by Bruegel, Rubens and Magritte. The Art Nouveau architecture of architect Victor Horta is another treasure to explore.

Brussels is the undisputed capital of Belgian gastronomy. Indulge in authentic Belgian waffles, crispy frites with mayonnaise, a dizzying variety of craft beers, and hand-crafted pralines from chocolatiers who have been perfecting their art for generations. The covered Galeries Royales Saint-Hubert, built in 1847, is Europe's oldest shopping arcade and a perfect spot for a leisurely stroll.

The city's cultural diversity makes it endlessly fascinating — more than 180 nationalities call Brussels home, creating a rich tapestry of restaurants, markets and street life unlike anywhere else in Europe.`,
    hero_image:
      'https://images.unsplash.com/photo-1652275998409-0f9360a7a66f?w=1600&q=80',
    rating: 4.7,
    region: 'Brussels-Capital Region',
    population: 1200000,
    latitude: 50.8503,
    longitude: 4.3517,
    best_time_to_visit: 'April – October',
    languages: 'French, Dutch, German',
    best_for: ['History', 'Architecture', 'Food & Beer', 'EU Capital', 'Art & Museums', 'Nightlife'],
  },
  {
    name: 'Bruges',
    slug: 'bruges',
    tagline: 'The Venice of the North — Medieval Canals & Fairy-Tale Charm',
    short_description:
      'A UNESCO World Heritage medieval city of canals, belfries and chocolate shops — one of Europe\'s most romantic destinations.',
    description: `Bruges is a perfectly preserved medieval city that feels like stepping into a fairy tale. Its labyrinth of cobblestone streets, humpback bridges and mirror-still canals has earned it the nickname "The Venice of the North" — and the comparison is well deserved.

The Markt (Market Square) is the beating heart of the city, dominated by the iconic 83-metre Belfry of Bruges, a UNESCO-listed medieval bell tower whose 366 steps reward climbers with breathtaking views over the rooftops and canals below. Nearby, the Burg Square hosts the magnificent Basilica of the Holy Blood, said to contain a relic of Christ's blood brought back from the Crusades.

One of the great pleasures of Bruges is simply wandering — discovering hidden courtyards (béguinages), romantic canal-side terraces, and the serene Minnewater Lake, known as the Lake of Love, where swans glide beneath weeping willows.

Bruges is the spiritual home of Belgian chocolate. The city's chocolatiers are legendary — look for hand-crafted pralines, truffles and novelty shapes in the dozens of specialist shops along the medieval lanes. Belgian beer culture is equally celebrated here; the city's breweries, including the last remaining inner-city brewery Bourgogne des Flandres, offer tours and tastings.

With an exceptional network of cycling paths running through the surrounding Flemish countryside, Bruges is also the ideal base for exploring picturesque villages, polders and the North Sea coast just 15 kilometres away.`,
    hero_image:
      'https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=1600&q=80',
    rating: 4.8,
    region: 'West Flanders',
    population: 117000,
    latitude: 51.2093,
    longitude: 3.2247,
    best_time_to_visit: 'March – October',
    languages: 'Dutch (West Flemish)',
    best_for: ['Medieval History', 'Canals & Bridges', 'Chocolate', 'Cycling', 'Craft Beer', 'Romance'],
  },
  {
    name: 'Antwerp',
    slug: 'antwerp',
    tagline: 'Diamond Capital & Fashion City on the Scheldt',
    short_description:
      "Europe's diamond hub and fashion capital combines a stunning Gothic cathedral, world-class port heritage and a buzzing creative scene.",
    description: `Antwerp is Belgium's second-largest city and arguably its most dynamic — a bold, confident metropolis where centuries of trading wealth have produced some of Europe's finest art, architecture and fashion.

The Cathedral of Our Lady (Onze-Lieve-Vrouwekathedraal) is the undisputed centrepiece of the city. This Gothic masterpiece, built over nearly two centuries, houses four major altarpieces by Peter Paul Rubens, the city's most famous son. The cathedral's 123-metre spire is visible from across the city and illuminated beautifully at night.

The Grote Markt, Antwerp's magnificent central square, is surrounded by ornate guild houses and the Renaissance town hall — a UNESCO World Heritage Site. The square buzzes with café terraces from spring to autumn. Nearby, the Hendrik Conscienceplein hosts the baroque St. Charles Borromeo Church.

Antwerp is the global capital of the diamond trade — more than 80% of the world's rough diamonds pass through the city's Diamond Quarter (Diamantwijk) every year. Guided tours and the Antwerp World Diamond Centre offer fascinating insights into this glittering industry.

The city has reinvented itself as a world fashion capital. The Royal Academy of Fine Arts has produced internationally celebrated designers including Dries Van Noten and the legendary Antwerp Six. The MoMu fashion museum, the Meir shopping boulevard and cutting-edge concept stores make Antwerp essential for fashion lovers.

Don't miss the MAS (Museum aan de Stroom), an extraordinary red sandstone tower overlooking the Scheldt river, or the spectacular Port House — a diamond-shaped glass structure by Zaha Hadid perched atop a converted fire station.`,
    hero_image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80',
    rating: 4.6,
    region: 'Antwerp Province',
    population: 530000,
    latitude: 51.2213,
    longitude: 4.4051,
    best_time_to_visit: 'May – September',
    languages: 'Dutch (Flemish)',
    best_for: ['Fashion & Shopping', 'Diamonds', 'Art & Museums', 'Port Heritage', 'Architecture', 'Nightlife'],
  },
  {
    name: 'Ghent',
    slug: 'ghent',
    tagline: 'Medieval Marvel with a Modern Soul',
    short_description:
      "Home to three belfries, Gravensteen castle and the Graslei quay, Ghent is Belgium's most authentic city — vibrant, student-driven and proudly local.",
    description: `Ghent is Belgium's best-kept secret — a city of breathtaking medieval architecture, vibrant student energy and an independent spirit that sets it apart from its more tourist-heavy neighbours. With the largest pedestrianised historical centre in Belgium, Ghent rewards exploration on foot or by bicycle.

The Graslei and Korenlei, two quays flanking the Leie river, form one of the most picturesque scenes in all of Belgium — a row of medieval guild houses reflected in the still water, best admired from a canal boat or from one of the riverside terrace bars that fill with students on warm evenings.

The imposing Gravensteen — the Castle of the Counts — rises dramatically from the city centre, a remarkably intact 12th-century fortress with a history of medieval torture instruments now turned into a darkly playful museum. Nearby, St. Bavo's Cathedral houses the Ghent Altarpiece (The Adoration of the Mystic Lamb) by the Van Eyck brothers — widely considered one of the most important paintings in Western art.

Ghent is a student city, with over 70,000 students at Ghent University infusing the city with youthful energy, creativity and a thriving café culture. The city has Europe's largest pedestrian shopping street and a legendary craft beer scene; the local Gentse Strop and Gruut beers are brewed right in the city centre.

Every July, the Gentse Feesten (Ghent Festival) transforms the entire city into a ten-day street party with over 1.5 million visitors, free concerts on every square and a carnival atmosphere that is utterly unique in Europe. Outside festival season, the city's cycling culture, independent shops and innovative restaurant scene make it one of Belgium's most rewarding urban destinations.`,
    hero_image:
      'https://images.unsplash.com/photo-1662730092147-2a3e9efd2d72?w=1600&q=80',
    rating: 4.7,
    region: 'East Flanders',
    population: 265000,
    latitude: 51.0543,
    longitude: 3.7174,
    best_time_to_visit: 'May – September',
    languages: 'Dutch (Flemish)',
    best_for: ['Medieval Architecture', 'Student City', 'Art', 'Craft Beer', 'Festivals', 'Cycling'],
  },
];

exports.handler = async (event) => {
  // Auth check
  const secret = event.headers['x-import-secret'];
  if (!secret || secret !== process.env.IMPORT_SECRET) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);

  try {
    // Step 1: Add missing columns if they don't exist
    await sql.query(`ALTER TABLE cities ADD COLUMN IF NOT EXISTS best_time_to_visit text`);
    await sql.query(`ALTER TABLE cities ADD COLUMN IF NOT EXISTS languages text`);
    await sql.query(`ALTER TABLE cities ADD COLUMN IF NOT EXISTS best_for text[]`);

    const results = [];

    // Step 2: Upsert each city
    for (const city of CITIES) {
      const res = await sql.query(
        `INSERT INTO cities (
          name, slug, tagline, short_description, description,
          hero_image, rating, region, population, latitude, longitude,
          best_time_to_visit, languages, best_for, created_date
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10, $11,
          $12, $13, $14, NOW()
        )
        ON CONFLICT (slug) DO UPDATE SET
          name               = EXCLUDED.name,
          tagline            = EXCLUDED.tagline,
          short_description  = EXCLUDED.short_description,
          description        = EXCLUDED.description,
          hero_image         = EXCLUDED.hero_image,
          rating             = EXCLUDED.rating,
          region             = EXCLUDED.region,
          population         = EXCLUDED.population,
          latitude           = EXCLUDED.latitude,
          longitude          = EXCLUDED.longitude,
          best_time_to_visit = EXCLUDED.best_time_to_visit,
          languages          = EXCLUDED.languages,
          best_for           = EXCLUDED.best_for
        RETURNING id, slug, name`,
        [
          city.name,
          city.slug,
          city.tagline,
          city.short_description,
          city.description,
          city.hero_image,
          city.rating,
          city.region,
          city.population,
          city.latitude,
          city.longitude,
          city.best_time_to_visit,
          city.languages,
          city.best_for,
        ]
      );

      const row = res[0];
      results.push({ slug: row.slug, name: row.name, id: row.id });
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: `Seeded ${results.length} cities`,
        cities: results,
      }),
    };
  } catch (err) {
    console.error('seed-cities error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
