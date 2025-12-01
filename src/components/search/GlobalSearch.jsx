import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, MapPin, Building, Calendar, Briefcase, 
  ArrowRight, X, TrendingUp, Clock, Star
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Search queries
  const { data: cities = [] } = useQuery({
    queryKey: ['search-cities', query],
    queryFn: () => base44.entities.City.list('-name', 50),
    enabled: query.length > 0,
  });

  const { data: attractions = [] } = useQuery({
    queryKey: ['search-attractions', query],
    queryFn: () => base44.entities.Attraction.list('-rating', 100),
    enabled: query.length > 0,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['search-events', query],
    queryFn: () => base44.entities.Event.list('-start_date', 100),
    enabled: query.length > 0,
  });

  const { data: businesses = [] } = useQuery({
    queryKey: ['search-businesses', query],
    queryFn: () => base44.entities.Business.list('-rating', 100),
    enabled: query.length > 0,
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['search-restaurants', query],
    queryFn: () => base44.entities.Restaurant.list('-rating', 50),
    enabled: query.length > 0,
  });

  const { data: hotels = [] } = useQuery({
    queryKey: ['search-hotels', query],
    queryFn: () => base44.entities.Hotel.list('-rating', 50),
    enabled: query.length > 0,
  });

  // Filter results based on query
  const filteredCities = cities.filter(item =>
    item.name?.toLowerCase().includes(query.toLowerCase()) ||
    item.tagline?.toLowerCase().includes(query.toLowerCase()) ||
    item.description?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredAttractions = attractions.filter(item =>
    item.name?.toLowerCase().includes(query.toLowerCase()) ||
    item.short_description?.toLowerCase().includes(query.toLowerCase()) ||
    item.category?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredEvents = events.filter(item =>
    item.name?.toLowerCase().includes(query.toLowerCase()) ||
    item.description?.toLowerCase().includes(query.toLowerCase()) ||
    item.category?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredBusinesses = businesses.filter(item =>
    item.name?.toLowerCase().includes(query.toLowerCase()) ||
    item.description?.toLowerCase().includes(query.toLowerCase()) ||
    item.category_slug?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredRestaurants = restaurants.filter(item =>
    item.name?.toLowerCase().includes(query.toLowerCase()) ||
    item.cuisine_type?.toLowerCase().includes(query.toLowerCase()) ||
    item.short_description?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredHotels = hotels.filter(item =>
    item.name?.toLowerCase().includes(query.toLowerCase()) ||
    item.type?.toLowerCase().includes(query.toLowerCase()) ||
    item.short_description?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const allResults = [
    ...filteredCities.map(item => ({ ...item, type: 'city' })),
    ...filteredAttractions.map(item => ({ ...item, type: 'attraction' })),
    ...filteredEvents.map(item => ({ ...item, type: 'event' })),
    ...filteredBusinesses.map(item => ({ ...item, type: 'business' })),
    ...filteredRestaurants.map(item => ({ ...item, type: 'restaurant' })),
    ...filteredHotels.map(item => ({ ...item, type: 'hotel' })),
  ];

  const handleViewAll = () => {
    navigate(createPageUrl('SearchResults') + '?q=' + encodeURIComponent(query));
    onClose();
  };

  const handleItemClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-3xl z-50 px-4">
        <Card className="shadow-2xl">
          <CardContent className="p-0">
            {/* Search Input */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search cities, attractions, events, businesses..."
                  className="pl-10 pr-10 h-12 text-lg"
                />
                <button
                  onClick={onClose}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {query.length === 0 ? (
              /* Quick Links */
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Popular Searches
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link to={createPageUrl('Cities')} onClick={handleItemClick}>
                    <Button variant="outline" className="w-full justify-start">
                      <MapPin className="h-4 w-4 mr-2" />
                      Cities
                    </Button>
                  </Link>
                  <Link to={createPageUrl('Attractions')} onClick={handleItemClick}>
                    <Button variant="outline" className="w-full justify-start">
                      <Building className="h-4 w-4 mr-2" />
                      Attractions
                    </Button>
                  </Link>
                  <Link to={createPageUrl('Events')} onClick={handleItemClick}>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Events
                    </Button>
                  </Link>
                  <Link to={createPageUrl('LocalServices')} onClick={handleItemClick}>
                    <Button variant="outline" className="w-full justify-start">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Local Services
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* Search Results */
              <div className="max-h-[500px] overflow-y-auto">
                {allResults.length > 0 ? (
                  <>
                    {/* Tabs */}
                    <div className="border-b px-4 pt-2 flex gap-2 overflow-x-auto">
                      <button
                        onClick={() => setActiveTab('all')}
                        className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === 'all'
                            ? 'border-[var(--primary-orange)] text-[var(--primary-orange)]'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        All Results ({allResults.length})
                      </button>
                      {filteredCities.length > 0 && (
                        <button
                          onClick={() => setActiveTab('cities')}
                          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === 'cities'
                              ? 'border-[var(--primary-orange)] text-[var(--primary-orange)]'
                              : 'border-transparent text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Cities ({filteredCities.length})
                        </button>
                      )}
                      {filteredAttractions.length > 0 && (
                        <button
                          onClick={() => setActiveTab('attractions')}
                          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === 'attractions'
                              ? 'border-[var(--primary-orange)] text-[var(--primary-orange)]'
                              : 'border-transparent text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Attractions ({filteredAttractions.length})
                        </button>
                      )}
                      {filteredEvents.length > 0 && (
                        <button
                          onClick={() => setActiveTab('events')}
                          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === 'events'
                              ? 'border-[var(--primary-orange)] text-[var(--primary-orange)]'
                              : 'border-transparent text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Events ({filteredEvents.length})
                        </button>
                      )}
                      {(filteredBusinesses.length > 0 || filteredRestaurants.length > 0 || filteredHotels.length > 0) && (
                        <button
                          onClick={() => setActiveTab('services')}
                          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === 'services'
                              ? 'border-[var(--primary-orange)] text-[var(--primary-orange)]'
                              : 'border-transparent text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Services ({filteredBusinesses.length + filteredRestaurants.length + filteredHotels.length})
                        </button>
                      )}
                    </div>

                    {/* Results */}
                    <div className="p-4 space-y-2">
                      {(activeTab === 'all' || activeTab === 'cities') && filteredCities.map(city => (
                        <SearchResultItem
                          key={`city-${city.id}`}
                          icon={MapPin}
                          title={city.name}
                          subtitle={city.tagline}
                          badge="City"
                          link={createPageUrl('CityDetail') + '?city=' + city.slug}
                          onClick={handleItemClick}
                        />
                      ))}
                      {(activeTab === 'all' || activeTab === 'attractions') && filteredAttractions.map(attraction => (
                        <SearchResultItem
                          key={`attraction-${attraction.id}`}
                          icon={Building}
                          title={attraction.name}
                          subtitle={attraction.category}
                          badge="Attraction"
                          rating={attraction.rating}
                          link={createPageUrl('AttractionDetail') + '?slug=' + attraction.slug}
                          onClick={handleItemClick}
                        />
                      ))}
                      {(activeTab === 'all' || activeTab === 'events') && filteredEvents.map(event => (
                        <SearchResultItem
                          key={`event-${event.id}`}
                          icon={Calendar}
                          title={event.name}
                          subtitle={event.category}
                          badge="Event"
                          link={createPageUrl('Events') + '?event=' + event.slug}
                          onClick={handleItemClick}
                        />
                      ))}
                      {(activeTab === 'all' || activeTab === 'services') && filteredBusinesses.map(business => (
                        <SearchResultItem
                          key={`business-${business.id}`}
                          icon={Briefcase}
                          title={business.name}
                          subtitle={business.category_slug}
                          badge="Business"
                          rating={business.rating}
                          link={createPageUrl('BusinessDetail') + '?slug=' + business.slug}
                          onClick={handleItemClick}
                        />
                      ))}
                      {(activeTab === 'all' || activeTab === 'services') && filteredRestaurants.map(restaurant => (
                        <SearchResultItem
                          key={`restaurant-${restaurant.id}`}
                          icon={Briefcase}
                          title={restaurant.name}
                          subtitle={restaurant.cuisine_type}
                          badge="Restaurant"
                          rating={restaurant.rating}
                          link={createPageUrl('Restaurants') + '?restaurant=' + restaurant.slug}
                          onClick={handleItemClick}
                        />
                      ))}
                      {(activeTab === 'all' || activeTab === 'services') && filteredHotels.map(hotel => (
                        <SearchResultItem
                          key={`hotel-${hotel.id}`}
                          icon={Building}
                          title={hotel.name}
                          subtitle={hotel.type}
                          badge="Hotel"
                          rating={hotel.rating}
                          link={createPageUrl('Hotels') + '?hotel=' + hotel.slug}
                          onClick={handleItemClick}
                        />
                      ))}
                    </div>

                    {/* View All Button */}
                    {allResults.length >= 5 && (
                      <div className="border-t p-4">
                        <Button
                          onClick={handleViewAll}
                          className="w-full bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white"
                        >
                          View All Results ({allResults.length}+)
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-12 text-center">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No results found for "{query}"</p>
                    <p className="text-sm text-gray-500">Try different keywords or browse our categories</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function SearchResultItem({ icon: Icon, title, subtitle, badge, rating, link, onClick }) {
  return (
    <Link to={link} onClick={onClick}>
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-[var(--primary-orange)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate group-hover:text-[var(--primary-orange)] transition-colors">
            {title}
          </p>
          <p className="text-sm text-gray-600 truncate">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {rating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3 w-3 text-[var(--primary-yellow)] fill-current" />
              <span className="font-semibold">{rating}</span>
            </div>
          )}
          <Badge variant="outline" className="text-xs">
            {badge}
          </Badge>
        </div>
      </div>
    </Link>
  );
}