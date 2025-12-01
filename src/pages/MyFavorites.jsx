import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Utensils, Hotel as HotelIcon, Loader2, Calendar, Clock, Trash2, Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import AttractionCard from '../components/home/AttractionCard';
import SEO from '../components/SEO';
import { createPageUrl } from '@/utils';

export default function MyFavorites() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => {
        base44.auth.redirectToLogin(window.location.href);
      })
      .finally(() => setLoading(false));
  }, []);

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => base44.entities.Favorite.list('-created_date', 1000),
    enabled: !!user,
  });

  const { data: attractions = [] } = useQuery({
    queryKey: ['attractions'],
    queryFn: () => base44.entities.Attraction.list('-rating', 500),
    enabled: !!user,
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list('-rating', 500),
    enabled: !!user,
  });

  const { data: hotels = [] } = useQuery({
    queryKey: ['hotels'],
    queryFn: () => base44.entities.Hotel.list('-rating', 500),
    enabled: !!user,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list('-name', 100),
    enabled: !!user,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('start_date', 500),
    enabled: !!user && favorites.some(f => f.item_type === 'event'),
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (id) => base44.entities.Favorite.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
    },
  });

  if (loading || favoritesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--primary-orange)]" />
      </div>
    );
  }

  const favoriteAttractions = favorites
    .filter(f => f.item_type === 'attraction')
    .map(f => attractions.find(a => a.id === f.item_id))
    .filter(Boolean);

  const favoriteRestaurants = favorites
    .filter(f => f.item_type === 'restaurant')
    .map(f => restaurants.find(r => r.id === f.item_id))
    .filter(Boolean);

  const favoriteHotels = favorites
    .filter(f => f.item_type === 'hotel')
    .map(f => hotels.find(h => h.id === f.item_id))
    .filter(Boolean);

  const favoriteCities = favorites
    .filter(f => f.item_type === 'city')
    .map(f => cities.find(c => c.id === f.item_id))
    .filter(Boolean);

  const favoriteEvents = favorites.filter(f => f.item_type === 'event');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 py-12 px-4">
      <SEO 
        title="My Saved Places - Favorites"
        description="View and manage your saved attractions, restaurants, hotels, cities, and events in Belgium"
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full">
            <Heart className="h-8 w-8 fill-current" />
            <h1 className="text-3xl font-bold">My Saved Places</h1>
          </div>
          <p className="text-xl text-gray-600">
            All your favorite places and events in Belgium
          </p>
        </div>

        {favorites.length === 0 ? (
          <Card className="border-0 shadow-xl">
            <CardContent className="p-20 text-center">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h2>
              <p className="text-gray-600 mb-6">Start saving your favorite places to plan your perfect trip</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-8 grid grid-cols-3 md:grid-cols-6 w-full md:w-auto">
              <TabsTrigger value="all">
                All ({favorites.length})
              </TabsTrigger>
              <TabsTrigger value="attractions">
                <MapPin className="h-4 w-4 mr-2" />
                Attractions ({favoriteAttractions.length})
              </TabsTrigger>
              <TabsTrigger value="restaurants">
                <Utensils className="h-4 w-4 mr-2" />
                Restaurants ({favoriteRestaurants.length})
              </TabsTrigger>
              <TabsTrigger value="hotels">
                <HotelIcon className="h-4 w-4 mr-2" />
                Hotels ({favoriteHotels.length})
              </TabsTrigger>
              <TabsTrigger value="cities">
                <MapPin className="h-4 w-4 mr-2" />
                Cities ({favoriteCities.length})
              </TabsTrigger>
              <TabsTrigger value="events">
                <Calendar className="h-4 w-4 mr-2" />
                Events ({favoriteEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-12">
                {favoriteAttractions.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <MapPin className="h-6 w-6 mr-2 text-[var(--primary-orange)]" />
                      Attractions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favoriteAttractions.map(attraction => (
                        <AttractionCard key={attraction.id} attraction={attraction} />
                      ))}
                    </div>
                  </div>
                )}

                {favoriteRestaurants.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <Utensils className="h-6 w-6 mr-2 text-[var(--primary-orange)]" />
                      Restaurants
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favoriteRestaurants.map(restaurant => (
                        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                      ))}
                    </div>
                  </div>
                )}

                {favoriteHotels.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <HotelIcon className="h-6 w-6 mr-2 text-[var(--primary-orange)]" />
                      Hotels
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favoriteHotels.map(hotel => (
                        <HotelCard key={hotel.id} hotel={hotel} />
                      ))}
                    </div>
                  </div>
                )}

                {favoriteEvents.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <Calendar className="h-6 w-6 mr-2 text-[var(--primary-orange)]" />
                      Events
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favoriteEvents.map((fav) => {
                        const event = events.find(e => e.id === fav.item_id);
                        return (
                          <EventFavoriteCard 
                            key={fav.id} 
                            favorite={fav} 
                            event={event}
                            onRemove={() => removeFavoriteMutation.mutate(fav.id)} 
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="attractions">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteAttractions.map(attraction => (
                  <AttractionCard key={attraction.id} attraction={attraction} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="restaurants">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteRestaurants.map(restaurant => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="hotels">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteHotels.map(hotel => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="cities">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteCities.map(city => (
                  <CityCard key={city.id} city={city} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="events">
              {favoriteEvents.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved events yet</h3>
                    <p className="text-gray-600">Start saving events to keep track of what you want to attend</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteEvents.map((fav) => {
                    const event = events.find(e => e.id === fav.item_id);
                    return (
                      <EventFavoriteCard 
                        key={fav.id} 
                        favorite={fav} 
                        event={event}
                        onRemove={() => removeFavoriteMutation.mutate(fav.id)} 
                      />
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function RestaurantCard({ restaurant }) {
  const mainImage = restaurant.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';
  
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
      <div className="relative h-48">
        <img src={mainImage} alt={restaurant.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{restaurant.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{restaurant.cuisine_type}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{restaurant.short_description}</p>
      </div>
    </div>
  );
}

function HotelCard({ hotel }) {
  const mainImage = hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';
  
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
      <div className="relative h-48">
        <img src={mainImage} alt={hotel.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{hotel.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{hotel.type}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{hotel.short_description}</p>
      </div>
    </div>
  );
}

function CityCard({ city }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
      <div className="relative h-48">
        <img 
          src={city.thumbnail_image || city.hero_image || 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800&q=80'} 
          alt={city.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{city.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{city.tagline}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{city.description}</p>
      </div>
    </div>
  );
}

function EventFavoriteCard({ favorite, event, onRemove }) {
  const startDate = event?.start_date ? parseISO(event.start_date) : null;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
      <div className="relative h-48 overflow-hidden">
        <img
          src={event?.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'}
          alt={favorite.item_name}
          className="w-full h-full object-cover"
        />
        {event?.category && (
          <Badge className="absolute top-3 left-3 bg-white/90 text-gray-900">
            {event.category}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1">
            {favorite.item_name}
          </h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={onRemove}
            className="text-red-500 hover:bg-red-50 flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {event && (
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
        )}

        {favorite.notes && (
          <p className="text-sm text-gray-600 italic mb-4 p-3 bg-gray-50 rounded-lg">
            "{favorite.notes}"
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          {event?.price ? (
            <span className="font-bold text-[var(--primary-orange)]">{event.price}</span>
          ) : (
            <span className="font-bold text-green-600">Free</span>
          )}
          
          {event?.website && (
            <a href={event.website} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="text-xs">
                View Event
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}