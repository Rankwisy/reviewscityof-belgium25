import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Snowflake, MapPin, Calendar, Clock, Euro, Gift,
  Utensils, Music, Star, TreePine
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import SEO from '../components/SEO';

export default function ChristmasMarkets() {
  const markets = [
    {
      city: 'Brussels',
      citySlug: 'brussels',
      name: 'Winter Wonders',
      dates: 'Late November - Early January',
      location: 'Grand Place & City Center',
      hours: 'Daily 12:00 - 22:00',
      highlights: ['Ice skating rink', 'Light & sound show', '200+ chalets', 'Giant Christmas tree'],
      price: 'Free entry',
      image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80',
      featured: true
    },
    {
      city: 'Bruges',
      citySlug: 'bruges',
      name: 'Bruges Christmas Market',
      dates: 'Late November - Early January',
      location: 'Market Square & Simon Stevin Square',
      hours: 'Daily 10:30 - 22:00',
      highlights: ['Ice sculpture festival', 'Skating rink', 'Traditional crafts', 'Mulled wine'],
      price: 'Free entry',
      image: 'https://images.unsplash.com/photo-1482841097386-503bf52ca431?w=800&q=80',
      featured: true
    },
    {
      city: 'Antwerp',
      citySlug: 'antwerp',
      name: 'Antwerp Christmas Market',
      dates: 'December',
      location: 'Grote Markt',
      hours: 'Daily 11:00 - 21:00',
      highlights: ['Ice bar', 'Ferris wheel', 'Local delicacies', 'Live entertainment'],
      price: 'Free entry',
      image: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800&q=80',
      featured: true
    },
    {
      city: 'Ghent',
      citySlug: 'ghent',
      name: 'Ghent Winter Festival',
      dates: 'December',
      location: 'Sint-Baafsplein',
      hours: 'Daily 11:00 - 22:00',
      highlights: ['Medieval atmosphere', 'Local food', 'Artisan crafts', 'Cozy bars'],
      price: 'Free entry',
      image: 'https://images.unsplash.com/photo-1576614228332-710b13bf6941?w=800&q=80'
    },
    {
      city: 'Leuven',
      citySlug: 'leuven',
      name: 'Leuven Christmas Market',
      dates: 'December',
      location: 'Oude Markt',
      hours: 'Daily 11:00 - 22:00',
      highlights: ['University atmosphere', 'Belgian beers', 'Student choirs', 'Traditional market'],
      price: 'Free entry',
      image: 'https://images.unsplash.com/photo-1544986581-efac024faf62?w=800&q=80'
    }
  ];

  const whatToExpect = [
    {
      icon: Utensils,
      title: 'Traditional Food & Drinks',
      items: ['Mulled wine (Glühwein)', 'Belgian waffles', 'Hot chocolate', 'Roasted chestnuts', 'Belgian fries', 'Smoutebollen (dough balls)']
    },
    {
      icon: Gift,
      title: 'Shopping',
      items: ['Handmade crafts', 'Belgian chocolates', 'Christmas decorations', 'Local artwork', 'Jewelry', 'Winter accessories']
    },
    {
      icon: Music,
      title: 'Entertainment',
      items: ['Live music', 'Carol singers', 'Light shows', 'Ice skating', 'Ferris wheels', 'Street performers']
    },
    {
      icon: TreePine,
      title: 'Atmosphere',
      items: ['Festive lights', 'Decorated chalets', 'Christmas trees', 'Cozy ambiance', 'Traditional decorations', 'Holiday spirit']
    }
  ];

  const tips = [
    {
      icon: Clock,
      title: 'Best Times to Visit',
      description: 'Weekday afternoons are less crowded. Evenings offer the best atmosphere with all lights on. Avoid weekends if you prefer fewer crowds.'
    },
    {
      icon: Euro,
      title: 'Budget Tips',
      description: 'Markets are free to enter. Food and drinks range from €3-8. Crafts and gifts vary widely. Most stalls accept cards, but bring cash.'
    },
    {
      icon: Snowflake,
      title: 'What to Wear',
      description: 'Dress warmly in layers. Waterproof jacket recommended. Comfortable walking shoes. Gloves and hat essential. Hand warmers helpful.'
    },
    {
      icon: MapPin,
      title: 'Getting Around',
      description: 'Markets are walkable in city centers. Use public transport between cities. Park outside city centers. Consider a multi-city tour.'
    }
  ];

  return (
    <div className="py-12 px-4">
      <SEO 
        title="Christmas Markets in Belgium 2025 - Winter Wonders Guide"
        description="Discover Belgium's magical Christmas markets in Brussels, Bruges, Antwerp, and more. Guide to dates, locations, highlights, and tips for your winter visit."
        keywords="Belgium Christmas markets, Brussels winter wonders, Bruges Christmas market, Antwerp Christmas, Belgian Christmas, winter Belgium"
      />

      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Snowflake className="h-12 w-12 text-[var(--primary-orange)]" />
            <h1 className="text-5xl font-bold text-gray-900">Christmas Markets in Belgium</h1>
            <Snowflake className="h-12 w-12 text-[var(--primary-orange)]" />
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the magic of Belgian Christmas markets with festive lights, mulled wine, and holiday cheer
          </p>
          <Badge className="mt-4 bg-[var(--primary-orange)] text-white text-lg px-6 py-2">
            Season: Late November - Early January
          </Badge>
        </div>

        {/* Featured Markets */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Christmas Markets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {markets.filter(m => m.featured).map((market, index) => (
              <MarketCard key={index} market={market} featured />
            ))}
          </div>
          
          {/* Other Markets */}
          <h3 className="text-2xl font-bold text-gray-900 mb-6 mt-12">More Christmas Markets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {markets.filter(m => !m.featured).map((market, index) => (
              <MarketCard key={index} market={market} />
            ))}
          </div>
        </section>

        {/* What to Expect */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What to Expect</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whatToExpect.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className="bg-[var(--primary-yellow)] bg-opacity-20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <category.icon className="h-10 w-10 text-[var(--primary-orange)]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{category.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {category.items.map((item, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <Star className="h-3 w-3 text-[var(--primary-yellow)] mt-1 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Visitor Tips */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Visitor Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-[var(--primary-orange)] bg-opacity-10 p-3 rounded-full shrink-0">
                      <tip.icon className="h-8 w-8 text-[var(--primary-orange)]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{tip.title}</h3>
                      <p className="text-gray-700">{tip.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Multi-Market Tour Suggestion */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-8">
            <div className="text-center max-w-3xl mx-auto">
              <TreePine className="h-16 w-16 text-[var(--primary-orange)] mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Plan a Multi-Market Tour</h3>
              <p className="text-lg text-gray-700 mb-6">
                Belgium is compact! Visit multiple Christmas markets in one trip. Brussels, Bruges, and Ghent are 
                all within an hour of each other by train. Make it a magical holiday experience!
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to={createPageUrl('Cities')}>
                  <Button className="bg-[var(--primary-orange)] hover:bg-[#d67f0a]">
                    Explore Belgian Cities
                  </Button>
                </Link>
                <Link to={createPageUrl('Hotels')}>
                  <Button variant="outline">
                    Find Accommodation
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MarketCard({ market, featured }) {
  return (
    <Card className={`overflow-hidden hover:shadow-xl transition-all duration-300 ${featured ? 'border-2 border-[var(--primary-orange)]' : ''}`}>
      <div className="relative h-64">
        <img
          src={market.image}
          alt={market.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        {featured && (
          <Badge className="absolute top-4 right-4 bg-[var(--primary-yellow)] text-gray-900 font-bold">
            ⭐ Featured
          </Badge>
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-bold text-white mb-1">{market.city}</h3>
          <p className="text-lg text-white opacity-90">{market.name}</p>
        </div>
      </div>
      
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-[var(--primary-orange)] mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Dates</p>
              <p className="text-sm text-gray-600">{market.dates}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-[var(--primary-orange)] mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Hours</p>
              <p className="text-sm text-gray-600">{market.hours}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-[var(--primary-orange)] mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Location</p>
              <p className="text-sm text-gray-600">{market.location}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm font-semibold text-gray-900 mb-2">Highlights:</p>
          <div className="flex flex-wrap gap-2">
            {market.highlights.map((highlight, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {highlight}
              </Badge>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t flex items-center justify-between">
          <Badge className="bg-green-100 text-green-800">
            {market.price}
          </Badge>
          <Link to={createPageUrl('CityDetail') + '?city=' + market.citySlug}>
            <Button variant="outline" size="sm">
              Visit {market.city}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}