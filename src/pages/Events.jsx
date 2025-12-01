import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar, Clock, MapPin, Tag, Search, Heart, ChevronRight, 
  Filter, X, Sparkles, Star, TrendingUp
} from 'lucide-react';
import { format, parseISO, isFuture, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/navigation/Breadcrumbs';

export default function Events() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('upcoming');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('start_date', 500),
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list('name', 100),
  });

  const { data: myFavorites = [] } = useQuery({
    queryKey: ['my-event-favorites'],
    queryFn: () => base44.entities.Favorite.filter({ 
      created_by: user?.email,
      item_type: 'event' 
    }),
    enabled: !!user,
  });

  const addFavoriteMutation = useMutation({
    mutationFn: (eventData) => base44.entities.Favorite.create({
      item_type: 'event',
      item_id: eventData.id,
      item_slug: eventData.slug,
      item_name: eventData.name
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-event-favorites']);
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (favoriteId) => base44.entities.Favorite.delete(favoriteId),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-event-favorites']);
    },
  });

  const toggleFavorite = (event) => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    const existingFavorite = myFavorites.find(f => f.item_id === event.id);
    if (existingFavorite) {
      removeFavoriteMutation.mutate(existingFavorite.id);
    } else {
      addFavoriteMutation.mutate(event);
    }
  };

  const isFavorited = (eventId) => {
    return myFavorites.some(f => f.item_id === eventId);
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    const matchesCity = cityFilter === 'all' || event.city_slug === cityFilter;
    
    let matchesTime = true;
    if (event.start_date) {
      const eventDate = parseISO(event.start_date);
      const now = new Date();
      
      if (timeFilter === 'upcoming') {
        matchesTime = isFuture(eventDate);
      } else if (timeFilter === 'past') {
        matchesTime = !isFuture(eventDate);
      } else if (timeFilter === 'custom' && startDateFilter && endDateFilter) {
        const start = startOfDay(new Date(startDateFilter));
        const end = endOfDay(new Date(endDateFilter));
        matchesTime = isWithinInterval(eventDate, { start, end });
      }
    }

    return matchesSearch && matchesCategory && matchesCity && matchesTime;
  });

  const featuredEvents = events.filter(e => e.featured && e.start_date && isFuture(parseISO(e.start_date))).slice(0, 4);
  const upcomingEvents = filteredEvents.filter(e => e.start_date && isFuture(parseISO(e.start_date)));
  const categories = ['Festival', 'Concert', 'Exhibition', 'Market', 'Sports', 'Food & Drink', 'Cultural', 'Nightlife', 'Workshop', 'Conference'];

  const activeFiltersCount = [
    categoryFilter !== 'all',
    cityFilter !== 'all',
    timeFilter !== 'upcoming',
    startDateFilter,
    endDateFilter
  ].filter(Boolean).length;

  const breadcrumbItems = [
    { label: 'Events', url: createPageUrl('Events') }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <Breadcrumbs items={breadcrumbItems} />
      
      <SEO 
        title="Events in Belgium - Festivals, Concerts & More"
        description="Discover upcoming events, festivals, concerts, and cultural happenings across Belgium. Find the best things to do in Belgian cities."
        keywords="Belgium events, Belgian festivals, concerts Belgium, things to do Belgium, cultural events"
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white py-20 px-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500 opacity-10 organic-blob"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-yellow-500 opacity-10 organic-blob" style={{animationDelay: '3s'}}></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-white/10 text-white border-white/20 text-sm px-6 py-2">
            <Calendar className="h-4 w-4 mr-2" />
            What's Happening in Belgium
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Discover <span className="text-[var(--primary-yellow)]">Amazing Events</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            From festivals to concerts, exhibitions to markets - never miss out on Belgian happenings
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Featured Events Section */}
        {featuredEvents.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="h-8 w-8 text-[var(--primary-orange)]" />
              <h2 className="text-3xl font-bold text-gray-900">Featured Events</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredEvents.map((event) => (
                <FeaturedEventCard 
                  key={event.id} 
                  event={event} 
                  isFavorited={isFavorited(event.id)}
                  onToggleFavorite={() => toggleFavorite(event)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Filters Section */}
        <Card className="mb-8 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Filter Events</h3>
                {activeFiltersCount > 0 && (
                  <Badge className="bg-[var(--primary-orange)] text-white">
                    {activeFiltersCount} active
                  </Badge>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setCategoryFilter('all');
                    setCityFilter('all');
                    setTimeFilter('upcoming');
                    setStartDateFilter('');
                    setEndDateFilter('');
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* City Filter */}
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.slug} className="capitalize">
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Time Filter */}
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming Events</SelectItem>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="past">Past Events</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {timeFilter === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <Input
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <Input
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {timeFilter === 'upcoming' ? 'Upcoming Events' : 
               timeFilter === 'past' ? 'Past Events' : 
               'All Events'}
            </h2>
            <p className="text-gray-600 mt-1">
              Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
            </p>
          </div>
          
          {user && myFavorites.length > 0 && (
            <Link to={createPageUrl('MyFavorites')}>
              <Button variant="outline" className="flex items-center gap-2">
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                My Saved Events ({myFavorites.length})
              </Button>
            </Link>
          )}
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event}
                isFavorited={isFavorited(event.id)}
                onToggleFavorite={() => toggleFavorite(event)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more events</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function FeaturedEventCard({ event, isFavorited, onToggleFavorite }) {
  const startDate = event.start_date ? parseISO(event.start_date) : null;

  return (
    <Card className="overflow-hidden hover-lift h-full border-0 shadow-xl group relative">
      <div className="absolute top-3 right-3 z-10">
        <Button
          size="icon"
          variant="ghost"
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite();
          }}
          className="bg-white/90 backdrop-blur hover:bg-white"
        >
          <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </Button>
      </div>

      <div className="relative h-56 overflow-hidden">
        <img
          src={event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {event.category && (
          <Badge className="absolute top-3 left-3 bg-white/95 text-gray-900">
            {event.category}
          </Badge>
        )}

        <Badge className="absolute bottom-3 left-3 bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white border-0 flex items-center gap-1">
          <Star className="h-3 w-3" />
          Featured
        </Badge>
      </div>
      
      <CardContent className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[var(--primary-orange)] transition-colors line-clamp-2">
          {event.name}
        </h3>

        <div className="space-y-2 mb-4">
          {startDate && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-[var(--primary-orange)]" />
                <span>{format(startDate, 'MMM d, yyyy')}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-[var(--primary-orange)]" />
                <span>{format(startDate, 'h:mm a')}</span>
              </div>
            </>
          )}

          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-[var(--primary-orange)]" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          {event.price ? (
            <span className="font-bold text-[var(--primary-orange)]">{event.price}</span>
          ) : (
            <span className="font-bold text-green-600">Free</span>
          )}
          
          {event.website && (
            <a href={event.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="outline" className="text-xs">
                Learn More
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EventCard({ event, isFavorited, onToggleFavorite }) {
  const startDate = event.start_date ? parseISO(event.start_date) : null;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full relative">
      <div className="absolute top-3 right-3 z-10">
        <Button
          size="icon"
          variant="ghost"
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite();
          }}
          className="bg-white/90 backdrop-blur hover:bg-white"
        >
          <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </Button>
      </div>

      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {event.category && (
          <Badge className="absolute top-3 left-3 bg-white/90 text-gray-900">
            {event.category}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[var(--primary-orange)] transition-colors line-clamp-2">
          {event.name}
        </h3>

        <div className="space-y-2 mb-4">
          {startDate && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-[var(--primary-orange)]" />
                <span>{format(startDate, 'MMM d, yyyy')}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-[var(--primary-orange)]" />
                <span>{format(startDate, 'h:mm a')}</span>
              </div>
            </>
          )}

          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-[var(--primary-orange)]" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}

          {event.city_slug && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Tag className="h-4 w-4 text-[var(--primary-orange)]" />
              <span className="capitalize">{event.city_slug}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{event.description}</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          {event.price ? (
            <span className="font-bold text-[var(--primary-orange)]">{event.price}</span>
          ) : (
            <span className="font-bold text-green-600">Free</span>
          )}
          
          {event.website && (
            <a href={event.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="outline" className="text-xs">
                Details
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}