import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import CityCard from '../components/home/CityCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import SEO from '../components/SEO';

export default function Cities() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list('-created_date', 100),
  });

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.tagline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Belgian Cities",
    "description": "Complete list of Belgian cities with travel information",
    "numberOfItems": cities.length,
    "itemListElement": cities.map((city, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "City",
        "name": city.name,
        "description": city.tagline,
        "url": `${window.location.origin}/CityDetail?city=${city.slug}`
      }
    }))
  };

  return (
    <div className="py-12 px-4">
      <SEO 
        title="Belgian Cities - Complete Travel Guide"
        description="Explore the diverse cities of Belgium, each with its own unique character, history, and charm. From Brussels to Bruges, discover all Belgian cities."
        keywords="Belgian cities, Belgium destinations, Brussels, Bruges, Antwerp, Ghent, Liège, Namur, Belgium city guide"
        structuredData={structuredData}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Belgian Cities</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the diverse cities of Belgium, each with its own unique character, history, and charm
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg"
            />
          </div>
        </div>

        {/* Cities Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--belgian-red)]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCities.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>
        )}

        {filteredCities.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No cities found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}