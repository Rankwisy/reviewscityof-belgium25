import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import { createPageUrl } from '@/utils';

export default function Restaurants() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list('-rating', 100),
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list('-name', 50),
  });

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.cuisine_type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === 'all' || restaurant.city_slug === cityFilter;
    const matchesPrice = priceFilter === 'all' || restaurant.price_range === priceFilter;
    return matchesSearch && matchesCity && matchesPrice;
  });

  const breadcrumbItems = [
    { label: 'Restaurants', url: createPageUrl('Restaurants') }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumbs items={breadcrumbItems} />
      
      <SEO 
        title="Best Restaurants in Belgium - Dining Guide"
        description="Discover the best restaurants, cafés, and dining experiences across Belgium. From fine dining to local favorites, find your perfect meal."
        keywords="Belgium restaurants, Belgian cuisine, restaurants in Brussels, restaurants in Bruges, Belgian food, dining in Belgium, best restaurants Belgium"
      />

      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Where to Eat in Belgium</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the best restaurants, cafés, and dining experiences across Belgium
            </p>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12"
                />
              </div>

              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.slug}>{city.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="€">€ - Budget</SelectItem>
                  <SelectItem value="€€">€€ - Moderate</SelectItem>
                  <SelectItem value="€€€">€€€ - Upscale</SelectItem>
                  <SelectItem value="€€€€">€€€€ - Fine Dining</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurant' : 'restaurants'}
            </p>
          </div>

          {/* Restaurants Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--belgian-red)]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}

          {filteredRestaurants.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No restaurants found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RestaurantCard({ restaurant }) {
  const mainImage = restaurant.images?.[0] || restaurant.image
    || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={mainImage}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'; }}
        />
        <Badge className="absolute top-3 right-3 bg-white text-gray-800">
          {restaurant.price_range}
        </Badge>
      </div>
      
      <div className="p-4">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{restaurant.city_slug}</span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[var(--belgian-red)] transition-colors">
          {restaurant.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3">{restaurant.cuisine_type}</p>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {restaurant.short_description}
        </p>
        
        {restaurant.rating && (
          <div className="flex items-center">
            <Star className="h-4 w-4 text-[var(--belgian-gold)] fill-current mr-1" />
            <span className="text-sm font-semibold">{restaurant.rating}</span>
          </div>
        )}
      </div>
    </div>
  );
}