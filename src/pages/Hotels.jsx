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

export default function Hotels() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: () => base44.entities.Hotel.list('-rating', 100),
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list('-name', 50),
  });

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hotel.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === 'all' || hotel.city_slug === cityFilter;
    const matchesType = typeFilter === 'all' || hotel.type === typeFilter;
    return matchesSearch && matchesCity && matchesType;
  });

  const breadcrumbItems = [
    { label: 'Hotels', url: createPageUrl('Hotels') }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="py-12 px-4">
        <SEO 
        title="Hotels in Belgium - Accommodation Guide"
        description="Find the perfect place to stay in Belgium. Browse hotels, B&Bs, hostels, and vacation rentals across Belgian cities."
        keywords="Belgium hotels, hotels in Brussels, hotels in Bruges, Belgium accommodation, Belgian B&B, hostels Belgium, where to stay Belgium"
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Where to Stay in Belgium</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find the perfect accommodation for your Belgian adventure
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search hotels..."
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

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Accommodation Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Hotel">Hotels</SelectItem>
                <SelectItem value="Bed & Breakfast">Bed & Breakfasts</SelectItem>
                <SelectItem value="Hostel">Hostels</SelectItem>
                <SelectItem value="Vacation Rental">Vacation Rentals</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredHotels.length} {filteredHotels.length === 1 ? 'property' : 'properties'}
          </p>
        </div>

        {/* Hotels Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--belgian-red)]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}

        {filteredHotels.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hotels found matching your criteria.</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

function HotelCard({ hotel }) {
  const mainImage = hotel.images?.[0] || hotel.image
    || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={mainImage}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'; }}
        />
        <Badge className="absolute top-3 right-3 bg-white text-gray-800">
          {hotel.price_range}
        </Badge>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{hotel.city_slug}</span>
          </div>
          {hotel.star_rating && (
            <div className="flex items-center">
              {Array.from({ length: hotel.star_rating }).map((_, i) => (
                <Star key={i} className="h-3 w-3 text-[var(--belgian-gold)] fill-current" />
              ))}
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[var(--belgian-red)] transition-colors">
          {hotel.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3">{hotel.type}</p>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {hotel.short_description}
        </p>
        
        {hotel.rating && (
          <div className="flex items-center">
            <Star className="h-4 w-4 text-[var(--belgian-gold)] fill-current mr-1" />
            <span className="text-sm font-semibold">{hotel.rating}</span>
            <span className="text-sm text-gray-500 ml-1">Guest Rating</span>
          </div>
        )}
      </div>
    </div>
  );
}