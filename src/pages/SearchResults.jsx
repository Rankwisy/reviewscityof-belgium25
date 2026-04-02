import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, Filter, MapPin, Building, Calendar, Briefcase,
  Star, SlidersHorizontal, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/navigation/Breadcrumbs';

export default function SearchResults() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [cityFilter, setCityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  // Fetch all entities
  const { data: cities = [] } = useQuery({
    queryKey: ['search-cities'],
    queryFn: () => base44.entities.City.list('-name', 100),
  });

  const { data: attractions = [] } = useQuery({
    queryKey: ['search-attractions'],
    queryFn: () => base44.entities.Attraction.list('-rating', 200),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['search-events'],
    queryFn: () => base44.entities.Event.list('-start_date', 200),
  });

  const { data: businesses = [] } = useQuery({
    queryKey: ['search-businesses'],
    queryFn: () => base44.entities.Business.list('-rating', 200),
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['search-restaurants'],
    queryFn: () => base44.entities.Restaurant.list('-rating', 100),
  });

  const { data: hotels = [] } = useQuery({
    queryKey: ['search-hotels'],
    queryFn: () => base44.entities.Hotel.list('-rating', 100),
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ['search-blog'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, '-created_date', 100),
  });

  // Filter and search logic
  const filterResults = (items, type) => {
    return items.filter(item => {
      // Search query filter
      const matchesQuery = !query || 
        item.name?.toLowerCase().includes(query.toLowerCase()) ||
        item.title?.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase()) ||
        item.short_description?.toLowerCase().includes(query.toLowerCase()) ||
        item.tagline?.toLowerCase().includes(query.toLowerCase()) ||
        item.category?.toLowerCase().includes(query.toLowerCase()) ||
        item.cuisine_type?.toLowerCase().includes(query.toLowerCase());

      // City filter
      const matchesCity = cityFilter === 'all' || item.city_slug === cityFilter;

      // Category filter
      const matchesCategory = categoryFilter === 'all' || 
        item.category === categoryFilter ||
        item.category_slug === categoryFilter;

      // Rating filter
      const matchesRating = ratingFilter === 'all' ||
        (ratingFilter === '4+' && item.rating >= 4) ||
        (ratingFilter === '3+' && item.rating >= 3);

      // Price filter
      const matchesPrice = priceFilter === 'all' || item.price_range === priceFilter;

      return matchesQuery && matchesCity && matchesCategory && matchesRating && matchesPrice;
    });
  };

  const filteredCities = filterResults(cities, 'city');
  const filteredAttractions = filterResults(attractions, 'attraction');
  const filteredEvents = filterResults(events, 'event');
  const filteredBusinesses = filterResults(businesses, 'business');
  const filteredRestaurants = filterResults(restaurants, 'restaurant');
  const filteredHotels = filterResults(hotels, 'hotel');
  const filteredBlogPosts = filterResults(blogPosts, 'blog');

  const allResults = [
    ...filteredCities.map(item => ({ ...item, type: 'city' })),
    ...filteredAttractions.map(item => ({ ...item, type: 'attraction' })),
    ...filteredEvents.map(item => ({ ...item, type: 'event' })),
    ...filteredBusinesses.map(item => ({ ...item, type: 'business' })),
    ...filteredRestaurants.map(item => ({ ...item, type: 'restaurant' })),
    ...filteredHotels.map(item => ({ ...item, type: 'hotel' })),
    ...filteredBlogPosts.map(item => ({ ...item, type: 'blog' })),
  ];

  // Sort results
  const sortResults = (results) => {
    if (sortBy === 'name') {
      return [...results].sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
    }
    if (sortBy === 'rating') {
      return [...results].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return results; // relevance (default order)
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(searchInput);
  };

  const clearFilters = () => {
    setCityFilter('all');
    setCategoryFilter('all');
    setRatingFilter('all');
    setPriceFilter('all');
  };

  const hasActiveFilters = cityFilter !== 'all' || categoryFilter !== 'all' || 
                          ratingFilter !== 'all' || priceFilter !== 'all';

  const breadcrumbItems = [
    { label: 'Search Results', url: createPageUrl('SearchResults') + (query ? '?q=' + query : '') }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumbs items={breadcrumbItems} />
      
      <SEO 
        title={query ? `Search Results for "${query}"` : 'Search - CityReview.be'}
        description="Search across cities, attractions, events, restaurants, hotels, and more in Belgium"
      />

      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {query ? `Search Results for "${query}"` : 'Search'}
            </h1>
            <p className="text-gray-600">
              {allResults.length} results found
            </p>
          </div>

          {/* Search Bar */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search cities, attractions, events, businesses..."
                    className="pl-10 h-12"
                  />
                </div>
                <Button type="submit" className="h-12 bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-5 w-5 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge className="ml-2 bg-[var(--primary-orange)] text-white">
                      {[cityFilter, categoryFilter, ratingFilter, priceFilter].filter(f => f !== 'all').length}
                    </Badge>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Advanced Filters
                  </h3>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">City</label>
                    <Select value={cityFilter} onValueChange={setCityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Cities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {cities.map(city => (
                          <SelectItem key={city.id} value={city.slug}>{city.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Museums & Galleries">Museums & Galleries</SelectItem>
                        <SelectItem value="Historical Sites">Historical Sites</SelectItem>
                        <SelectItem value="Parks & Nature">Parks & Nature</SelectItem>
                        <SelectItem value="Nightlife & Entertainment">Nightlife & Entertainment</SelectItem>
                        <SelectItem value="Tours & Experiences">Tours & Experiences</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Rating</label>
                    <Select value={ratingFilter} onValueChange={setRatingFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Rating</SelectItem>
                        <SelectItem value="4+">4+ Stars</SelectItem>
                        <SelectItem value="3+">3+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Relevance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="name">Name (A-Z)</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
              <TabsTrigger value="all">All ({allResults.length})</TabsTrigger>
              {filteredCities.length > 0 && (
                <TabsTrigger value="cities">Cities ({filteredCities.length})</TabsTrigger>
              )}
              {filteredAttractions.length > 0 && (
                <TabsTrigger value="attractions">Attractions ({filteredAttractions.length})</TabsTrigger>
              )}
              {filteredEvents.length > 0 && (
                <TabsTrigger value="events">Events ({filteredEvents.length})</TabsTrigger>
              )}
              {filteredBusinesses.length > 0 && (
                <TabsTrigger value="businesses">Businesses ({filteredBusinesses.length})</TabsTrigger>
              )}
              {filteredRestaurants.length > 0 && (
                <TabsTrigger value="restaurants">Restaurants ({filteredRestaurants.length})</TabsTrigger>
              )}
              {filteredHotels.length > 0 && (
                <TabsTrigger value="hotels">Hotels ({filteredHotels.length})</TabsTrigger>
              )}
              {filteredBlogPosts.length > 0 && (
                <TabsTrigger value="blog">Blog ({filteredBlogPosts.length})</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {sortResults(allResults).map((item, index) => (
                <ResultCard key={`${item.type}-${item.id}-${index}`} item={item} />
              ))}
            </TabsContent>

            <TabsContent value="cities" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortResults(filteredCities).map(city => (
                <CityCard key={city.id} city={city} />
              ))}
            </TabsContent>

            <TabsContent value="attractions" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortResults(filteredAttractions).map(attraction => (
                <AttractionCard key={attraction.id} attraction={attraction} />
              ))}
            </TabsContent>

            <TabsContent value="events" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortResults(filteredEvents).map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </TabsContent>

            <TabsContent value="businesses" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortResults(filteredBusinesses).map(business => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </TabsContent>

            <TabsContent value="restaurants" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortResults(filteredRestaurants).map(restaurant => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </TabsContent>

            <TabsContent value="hotels" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortResults(filteredHotels).map(hotel => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </TabsContent>

            <TabsContent value="blog" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortResults(filteredBlogPosts).map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </TabsContent>
          </Tabs>

          {allResults.length === 0 && query && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any results for "{query}". Try different keywords or browse our categories.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link to={createPageUrl('Cities')}>
                    <Button variant="outline">Browse Cities</Button>
                  </Link>
                  <Link to={createPageUrl('Attractions')}>
                    <Button variant="outline">Browse Attractions</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Result card components
function ResultCard({ item }) {
  const getLink = () => {
    switch (item.type) {
      case 'city': return createPageUrl('CityDetail') + '?city=' + item.slug;
      case 'attraction': return createPageUrl('AttractionDetail') + '?slug=' + item.slug;
      case 'event': return createPageUrl('Events') + '?event=' + item.slug;
      case 'business': return createPageUrl('BusinessDetail') + '?slug=' + item.slug;
      case 'restaurant': return createPageUrl('Restaurants') + '?restaurant=' + item.slug;
      case 'hotel': return createPageUrl('Hotels') + '?hotel=' + item.slug;
      case 'blog': return createPageUrl('BlogDetail') + '?slug=' + item.slug;
      default: return '#';
    }
  };

  const getIcon = () => {
    switch (item.type) {
      case 'city': return MapPin;
      case 'attraction': return Building;
      case 'event': return Calendar;
      case 'business': return Briefcase;
      case 'restaurant': return Briefcase;
      case 'hotel': return Building;
      case 'blog': return Building;
      default: return Building;
    }
  };

  const Icon = getIcon();

  return (
    <Link to={getLink()}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Icon className="h-8 w-8 text-[var(--primary-orange)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                  {item.name || item.title}
                </h3>
                <Badge variant="outline" className="capitalize flex-shrink-0">
                  {item.type}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {item.tagline || item.short_description || item.description || item.excerpt}
              </p>
              {item.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-[var(--primary-yellow)] fill-current" />
                  <span className="text-sm font-semibold">{item.rating}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CityCard({ city }) {
  return (
    <Link to={createPageUrl('CityDetail') + '?city=' + city.slug}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative h-48">
          <img
            src={city.thumbnail_image || city.hero_image || 'https://images.unsplash.com/photo-1605305089278-e92b9c7bb2a9?w=800&q=80'}
            alt={city.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-2 group-hover:text-[var(--primary-orange)] transition-colors">
            {city.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">{city.tagline}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function AttractionCard({ attraction }) {
  return (
    <Link to={createPageUrl('AttractionDetail') + '?slug=' + attraction.slug}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative h-48">
          <img
            src={attraction.images?.[0] || 'https://images.unsplash.com/photo-1605305089278-e92b9c7bb2a9?w=800&q=80'}
            alt={attraction.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {attraction.rating && (
            <Badge className="absolute top-3 right-3 bg-white text-gray-900">
              <Star className="h-3 w-3 mr-1 text-[var(--primary-yellow)] fill-current" />
              {attraction.rating}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <Badge variant="outline" className="mb-2">{attraction.category}</Badge>
          <h3 className="font-bold text-lg mb-2 group-hover:text-[var(--primary-orange)] transition-colors">
            {attraction.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">{attraction.short_description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function EventCard({ event }) {
  return (
    <Link to={createPageUrl('Events') + '?event=' + event.slug}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative h-48">
          <img
            src={event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <CardContent className="p-4">
          <Badge variant="outline" className="mb-2">{event.category}</Badge>
          <h3 className="font-bold text-lg mb-2 group-hover:text-[var(--primary-orange)] transition-colors">
            {event.name}
          </h3>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(event.start_date).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function BusinessCard({ business }) {
  return (
    <Link to={createPageUrl('BusinessDetail') + '?slug=' + business.slug}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative h-48">
          <img
            src={business.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {business.rating && (
            <Badge className="absolute top-3 right-3 bg-white text-gray-900">
              <Star className="h-3 w-3 mr-1 text-[var(--primary-yellow)] fill-current" />
              {business.rating}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-2 group-hover:text-[var(--primary-orange)] transition-colors">
            {business.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">{business.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function RestaurantCard({ restaurant }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative h-48">
        <img
          src={restaurant.images?.[0] || restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'; }}
        />
        {restaurant.rating && (
          <Badge className="absolute top-3 right-3 bg-white text-gray-900">
            <Star className="h-3 w-3 mr-1 text-[var(--primary-yellow)] fill-current" />
            {restaurant.rating}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 group-hover:text-[var(--primary-orange)] transition-colors">
          {restaurant.name}
        </h3>
        <p className="text-sm text-gray-600">{restaurant.cuisine_type}</p>
      </CardContent>
    </Card>
  );
}

function HotelCard({ hotel }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative h-48">
        <img
          src={hotel.images?.[0] || hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'; }}
        />
        {hotel.rating && (
          <Badge className="absolute top-3 right-3 bg-white text-gray-900">
            <Star className="h-3 w-3 mr-1 text-[var(--primary-yellow)] fill-current" />
            {hotel.rating}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 group-hover:text-[var(--primary-orange)] transition-colors">
          {hotel.name}
        </h3>
        <p className="text-sm text-gray-600">{hotel.type}</p>
      </CardContent>
    </Card>
  );
}

function BlogCard({ post }) {
  return (
    <Link to={createPageUrl('BlogDetail') + '?slug=' + post.slug}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative h-48">
          <img
            src={post.featured_image || 'https://images.unsplash.com/photo-1605305089278-e92b9c7bb2a9?w=800&q=80'}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <CardContent className="p-4">
          <Badge variant="outline" className="mb-2">{post.category}</Badge>
          <h3 className="font-bold text-lg mb-2 group-hover:text-[var(--primary-orange)] transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
        </CardContent>
      </Card>
    </Link>
  );
}