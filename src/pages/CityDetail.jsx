
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AttractionCard from '../components/home/AttractionCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Users, Calendar, Languages, Star, ChevronRight, Utensils, Briefcase, Phone, Mail, Globe, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useLanguage } from './LanguageContext';
import { useTranslation } from './translations';
import SEO from '../components/SEO';
import CityMap from '../components/city/CityMap';
import AITravelGuide from '../components/city/AITravelGuide';
import AIItineraryPlanner from '../components/city/AIItineraryPlanner';
import { format, parseISO, isFuture } from 'date-fns';
import { useAchievements } from '../components/gamification/useAchievements';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import SocialShare from '../components/SocialShare';

export default function CityDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const citySlug = urlParams.get('city') || 'brussels';
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [user, setUser] = useState(null);
  const { trackCityVisit } = useAchievements(user);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: city, isLoading: cityLoading } = useQuery({
    queryKey: ['city', citySlug],
    queryFn: async () => {
      const cities = await base44.entities.City.filter({ slug: citySlug });
      return cities[0];
    },
  });

  // Track city visit for gamification
  useEffect(() => {
    if (city && user) {
      trackCityVisit(citySlug);
    }
  }, [city, user, citySlug]);

  const { data: attractions = [] } = useQuery({
    queryKey: ['attractions', citySlug],
    queryFn: () => base44.entities.Attraction.filter({ city_slug: citySlug }, '-rating', 50),
    enabled: !!citySlug,
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants', citySlug],
    queryFn: () => base44.entities.Restaurant.filter({ city_slug: citySlug }, '-rating', 50),
    enabled: !!citySlug,
  });

  const { data: hotels = [] } = useQuery({
    queryKey: ['hotels', citySlug],
    queryFn: () => base44.entities.Hotel.filter({ city_slug: citySlug }, '-rating', 50),
    enabled: !!citySlug,
  });

  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses', citySlug],
    queryFn: () => base44.entities.Business.filter({ city_slug: citySlug }, '-rating', 100),
    enabled: !!citySlug,
  });

  const { data: allCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.BusinessCategory.list('-order', 50),
  });

  const { data: allEvents = [] } = useQuery({
    queryKey: ['events', citySlug],
    queryFn: () => base44.entities.Event.filter({ city_slug: citySlug }, 'start_date', 50),
    enabled: !!citySlug,
  });

  // Filter upcoming events
  const upcomingEvents = allEvents.filter(event => event.start_date && isFuture(parseISO(event.start_date))).slice(0, 3);

  if (cityLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--belgian-red)]"></div>
      </div>
    );
  }

  if (!city) {
    return (
      <>
        <SEO
          title={t('cityDetail.notFound')}
          description={t('cityDetail.notFoundDesc')}
        />
        <div className="py-20 px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('cityDetail.notFound')}</h1>
          <p className="text-gray-600">{t('cityDetail.notFoundDesc')}</p>
        </div>
      </>
    );
  }

  const topAttractions = attractions.slice(0, 6);
  const topRestaurants = restaurants.slice(0, 3);

  // Get popular categories for this city
  const categoryCount = {};
  businesses.forEach(business => {
    categoryCount[business.category_slug] = (categoryCount[business.category_slug] || 0) + 1;
  });

  const popularCategories = allCategories
    .filter(cat => categoryCount[cat.slug] > 0)
    .map(cat => ({
      ...cat,
      count: categoryCount[cat.slug]
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Prepare locations for map
  const businessLocations = businesses
    .filter(b => b.address)
    .map(b => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      address: b.address,
      type: 'business'
    }));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "City",
    "name": city.name,
    "description": city.description,
    "image": city.hero_image,
    "url": window.location.href,
    "containedInPlace": {
      "@type": "Country",
      "name": "Belgium"
    },
    ...(city.population && {
      "population": city.population
    }),
    "touristAttraction": attractions.slice(0, 10).map(attr => ({
      "@type": "TouristAttraction",
      "name": attr.name,
      "description": attr.short_description,
      ...(attr.rating && { "aggregateRating": { "@type": "AggregateRating", "ratingValue": attr.rating, "bestRating": 5 } })
    }))
  };

  const breadcrumbItems = city ? [
    { label: 'Cities', url: createPageUrl('Cities') },
    { label: city.name, url: createPageUrl('CityDetail') + '?city=' + citySlug }
  ] : [];

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />

      <SEO
        title={`${city.name} - ${city.tagline}`}
        description={city.description}
        keywords={`${city.name}, Belgium, travel, tourism, attractions, restaurants, hotels, businesses, events, things to do in ${city.name}`}
        image={city.hero_image}
        type="article"
        structuredData={structuredData}
      />

      {/* Hero Section */}
      <div className="relative h-[500px]">
        <img
          src={city.hero_image || 'https://images.unsplash.com/photo-1559564484-e48bf5e8a3e7?w=1600&q=80'}
          alt={city.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">{city.name}</h1>
            <p className="text-2xl mb-6">{city.tagline}</p>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {city.population && (
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{city.population}</span>
                </div>
              )}
              {city.best_time_to_visit && (
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{t('cityDetail.best')} {city.best_time_to_visit}</span>
                </div>
              )}
              {city.languages && (
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Languages className="h-4 w-4 mr-2" />
                  <span>{city.languages}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Overview */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('cityDetail.overview')}</h2>
          <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
            {city.description}
          </p>

          {city.best_for && city.best_for.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-3">{t('cityDetail.bestFor')}</h3>
              <div className="flex flex-wrap gap-2">
                {city.best_for.map((tag, index) => (
                  <Badge key={index} className="bg-[var(--belgian-red)] text-white">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Travel Guide Section */}
        <div className="mb-16">
          <AITravelGuide cityName={city.name} citySlug={citySlug} />
        </div>

        {/* AI Itinerary Planner Section */}
        <div className="mb-16">
          <AIItineraryPlanner cityName={city.name} citySlug={citySlug} />
        </div>

        {/* City Location Map */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Location</h2>
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <div className="relative h-96 w-full">
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(city.name + ', Belgium')}&zoom=12`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nearby Recommendations */}
        {(topAttractions.length > 0 || topRestaurants.length > 0) && (
          <div className="mb-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                What to Do in {city.name}
              </h2>
              <p className="text-gray-600">Curated recommendations just for you</p>
            </div>

            {/* Top Attractions Mini Preview */}
            {topAttractions.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-[var(--belgian-red)]" />
                    Must-See Attractions
                  </h3>
                  <Link to={createPageUrl('Attractions') + '?city=' + citySlug}>
                    <Button variant="outline" size="sm">
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topAttractions.slice(0, 3).map((attraction) => (
                    <Link
                      key={attraction.id}
                      to={createPageUrl('AttractionDetail') + '?slug=' + attraction.slug}
                    >
                      <Card className="hover:shadow-xl transition-all duration-300 group h-full">
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={attraction.images?.[0] || 'https://images.unsplash.com/photo-1605305089278-e92b9c7bb2a9?w=800&q=80'}
                            alt={attraction.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {attraction.rating && (
                            <Badge className="absolute top-2 right-2 bg-white/95 text-gray-900 flex items-center gap-1">
                              <Star className="h-3 w-3 text-[var(--belgian-gold)] fill-current" />
                              {attraction.rating}
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[var(--belgian-red)] transition-colors">
                            {attraction.name}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {attraction.short_description}
                          </p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {attraction.category}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Top Restaurants Mini Preview */}
            {topRestaurants.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Utensils className="h-6 w-6 text-[var(--belgian-red)]" />
                    Where to Eat
                  </h3>
                  <Link to={createPageUrl('Restaurants') + '?city=' + citySlug}>
                    <Button variant="outline" size="sm">
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topRestaurants.map((restaurant) => (
                    <Card key={restaurant.id} className="hover:shadow-xl transition-all duration-300 group h-full">
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={restaurant.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'}
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <Badge className="absolute top-2 right-2 bg-white/95 text-gray-900">
                          {restaurant.price_range}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[var(--belgian-red)] transition-colors">
                          {restaurant.name}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {restaurant.cuisine_type}
                        </p>
                        {restaurant.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-[var(--belgian-gold)] fill-current" />
                            <span className="text-xs font-semibold">{restaurant.rating}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upcoming Events Section */}
        {upcomingEvents.length > 0 && (
          <div className="mb-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-8 w-8 text-[var(--belgian-red)]" />
                  <h2 className="text-3xl font-bold text-gray-900">Upcoming Events in {city.name}</h2>
                </div>
                <p className="text-gray-600">Don't miss these exciting happenings</p>
              </div>
              {allEvents.length > 3 && (
                <Link to={createPageUrl('Events') + '?city=' + citySlug}>
                  <Button className="hidden md:flex items-center bg-[var(--belgian-red)] hover:bg-[#c00510]">
                    View All Events
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <CityEventCard key={event.id} event={event} />
              ))}
            </div>
            {allEvents.length > 3 && (
              <div className="mt-6 text-center md:hidden">
                <Link to={createPageUrl('Events') + '?city=' + citySlug}>
                  <Button className="w-full bg-[var(--belgian-red)] hover:bg-[#c00510]">
                    View All Events
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Local Businesses Section */}
        {businesses.length > 0 && (
          <div className="mb-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="h-8 w-8 text-[var(--belgian-red)]" />
                  <h2 className="text-3xl font-bold text-gray-900">Local Businesses in {city.name}</h2>
                </div>
                <p className="text-gray-600">{businesses.length} verified local services</p>
              </div>
            </div>

            {/* Popular Categories */}
            {popularCategories.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Popular Services</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {popularCategories.map((category) => (
                    <Link
                      key={category.id}
                      to={createPageUrl('BusinessSearch') + '?city=' + citySlug + '&category=' + category.slug}
                      className="bg-white rounded-lg p-4 text-center hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="text-3xl mb-2">
                        {getCategoryIcon(category.icon)}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-[var(--belgian-red)] transition-colors">
                        {category.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {category.count} {category.count === 1 ? 'business' : 'businesses'}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Map View */}
            {businessLocations.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Business Locations</h3>
                <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                  <CityMap
                    cityName={city.name}
                    locations={businessLocations}
                  />
                </div>
              </div>
            )}

            {/* Featured Businesses */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {businesses.slice(0, 6).map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>

            {businesses.length > 6 && (
              <div className="text-center">
                <Button
                  className="bg-[var(--belgian-red)] hover:bg-[#c00510]"
                  onClick={() => {
                    // Scroll to businesses tab
                    document.getElementById('city-tabs').scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  View All {businesses.length} Businesses
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Top Attractions Section */}
        {topAttractions.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('cityDetail.topAttractions')}</h2>
                <p className="text-gray-600">{t('cityDetail.mustSee')} {city.name}</p>
              </div>
              {attractions.length > 6 && (
                <Link to={createPageUrl('Attractions') + '?city=' + citySlug}>
                  <Button variant="outline" className="hidden md:flex items-center">
                    {t('cityDetail.viewAll')} {attractions.length} {t('cityDetail.attractions')}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topAttractions.map((attraction) => (
                <AttractionCard key={attraction.id} attraction={attraction} />
              ))}
            </div>
            {attractions.length > 6 && (
              <div className="mt-6 text-center md:hidden">
                <Link to={createPageUrl('Attractions') + '?city=' + citySlug}>
                  <Button variant="outline" className="w-full">
                    {t('cityDetail.viewAll')} {attractions.length} {t('cityDetail.attractions')}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Local Cuisine Recommendations Section */}
        {topRestaurants.length > 0 && (
          <div className="mb-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Utensils className="h-8 w-8 text-[var(--belgian-red)]" />
                  <h2 className="text-3xl font-bold text-gray-900">{t('cityDetail.localCuisine')}</h2>
                </div>
                <p className="text-gray-600">{t('cityDetail.tasteBest')} {city.name}</p>
              </div>
              {restaurants.length > 3 && (
                <Link to={createPageUrl('Restaurants') + '?city=' + citySlug}>
                  <Button className="hidden md:flex items-center bg-[var(--belgian-red)] hover:bg-[#c00510]">
                    {t('cityDetail.viewAllRestaurants')}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topRestaurants.map((restaurant) => (
                <CuisineCard key={restaurant.id} restaurant={restaurant} t={t} />
              ))}
            </div>
            {restaurants.length > 3 && (
              <div className="mt-6 text-center md:hidden">
                <Link to={createPageUrl('Restaurants') + '?city=' + citySlug}>
                  <Button className="w-full bg-[var(--belgian-red)] hover:bg-[#c00510]">
                    {t('cityDetail.viewAllRestaurants')}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Social Share Section */}
        <div className="mb-12">
          <SocialShare
            url={window.location.href}
            title={`${city.name} - ${city.tagline}`}
            description={city.description}
            hashtags={['Belgium', city.name.replace(/\s+/g, ''), 'Travel', 'CityGuide']}
            variant="inline"
          />
        </div>

        {/* Tabs */}
        <div id="city-tabs">
          <Tabs defaultValue="attractions" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="attractions">{t('cityDetail.thingsToDo')} ({attractions.length})</TabsTrigger>
              <TabsTrigger value="restaurants">{t('cityDetail.restaurants')} ({restaurants.length})</TabsTrigger>
              <TabsTrigger value="hotels">{t('cityDetail.hotels')} ({hotels.length})</TabsTrigger>
              <TabsTrigger value="businesses">Businesses ({businesses.length})</TabsTrigger>
              <TabsTrigger value="events">Events ({allEvents.length})</TabsTrigger>
              <TabsTrigger value="practical">{t('cityDetail.practical')}</TabsTrigger>
            </TabsList>

            <TabsContent value="attractions">
              <h2 className="text-2xl font-bold mb-6">{t('cityDetail.allAttractions')}</h2>
              {attractions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {attractions.map((attraction) => (
                    <AttractionCard key={attraction.id} attraction={attraction} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">{t('cityDetail.noAttractions')}</p>
              )}
            </TabsContent>

            <TabsContent value="restaurants">
              <h2 className="text-2xl font-bold mb-6">{t('cityDetail.whereToEat')}</h2>
              {restaurants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {restaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">{t('cityDetail.noRestaurants')}</p>
              )}
            </TabsContent>

            <TabsContent value="hotels">
              <h2 className="text-2xl font-bold mb-6">{t('cityDetail.whereToStay')}</h2>
              {hotels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotels.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">{t('cityDetail.noHotels')}</p>
              )}
            </TabsContent>

            <TabsContent value="businesses">
              <h2 className="text-2xl font-bold mb-6">Local Businesses & Services</h2>
              {businesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businesses.map((business) => (
                    <BusinessCard key={business.id} business={business} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No businesses listed yet for this city.</p>
              )}
            </TabsContent>

            <TabsContent value="events">
              <h2 className="text-2xl font-bold mb-6">Events in {city.name}</h2>
              {allEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allEvents.map((event) => (
                    <CityEventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No events scheduled for this city yet.</p>
              )}
            </TabsContent>

            <TabsContent value="practical">
              <div className="space-y-8">
                {city.getting_there && (
                  <div>
                    <h3 className="text-2xl font-bold mb-3">{t('cityDetail.gettingThere')}</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{city.getting_there}</p>
                  </div>
                )}

                {city.getting_around && (
                  <div>
                    <h3 className="text-2xl font-bold mb-3">{t('cityDetail.gettingAround')}</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{city.getting_around}</p>
                  </div>
                )}

                {city.practical_tips && (
                  <div>
                    <h3 className="text-2xl font-bold mb-3">{t('cityDetail.practicalTips')}</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{city.practical_tips}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function CityEventCard({ event }) {
  const startDate = event.start_date ? parseISO(event.start_date) : null;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="relative h-48">
        <img
          src={event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {event.category && (
          <Badge className="absolute top-3 right-3 bg-white/90 text-gray-900">
            {event.category}
          </Badge>
        )}
      </div>

      <CardContent className="pt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[var(--belgian-red)] transition-colors line-clamp-2">
          {event.name}
        </h3>

        <div className="space-y-2 mb-4">
          {startDate && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-[var(--belgian-red)]" />
                <span>{format(startDate, 'MMM d, yyyy')}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-[var(--belgian-red)]" />
                <span>{format(startDate, 'h:mm a')}</span>
              </div>
            </>
          )}

          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-[var(--belgian-red)]" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-gray-700 line-clamp-2 mb-4">{event.description}</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          {event.price ? (
            <span className="font-bold text-[var(--belgian-red)]">{event.price}</span>
          ) : (
            <span className="font-bold text-green-600">Free</span>
          )}

          {event.website && (
            <a href={event.website} target="_blank" rel="noopener noreferrer">
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

function getCategoryIcon(iconName) {
  // Simple emoji mapping for category icons
  const iconMap = {
    'Bus': '🚌',
    'Wrench': '🔧',
    'Users': '👥',
    'Briefcase': '💼',
    'Home': '🏠',
    'Car': '🚗',
    'Truck': '🚚',
    'Package': '📦',
    'PaintBucket': '🎨',
    'Hammer': '🔨',
    'Scissors': '✂️',
    'Building': '🏢'
  };
  return iconMap[iconName] || '💼';
}

function BusinessCard({ business }) {
  return (
    <Link to={createPageUrl('BusinessDetail') + '?slug=' + business.slug}>
      <Card className="h-full hover:shadow-xl transition-all duration-300 group">
        <CardContent className="pt-6">
          <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
            <img
              src={business.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'}
              alt={business.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {business.verified && (
              <Badge className="absolute top-2 right-2 bg-green-100 text-green-800 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[var(--belgian-red)] transition-colors line-clamp-1">
            {business.name}
          </h3>

          {business.rating > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.round(business.rating)
                        ? 'text-[var(--belgian-gold)] fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">{business.rating.toFixed(1)}</span>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{business.description}</p>

          <div className="space-y-1 text-xs text-gray-500">
            {business.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span className="truncate">{business.phone}</span>
              </div>
            )}
            {business.website && (
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <span className="truncate">Visit Website</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CuisineCard({ restaurant, t }) {
  const mainImage = restaurant.images && restaurant.images.length > 0
    ? restaurant.images[0]
    : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
      <div className="relative h-56 overflow-hidden">
        <img
          src={mainImage}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Badge className="absolute top-3 right-3 bg-[var(--belgian-red)] text-white">
          {restaurant.price_range}
        </Badge>
        <div className="absolute bottom-3 left-3 right-3">
          <Badge className="bg-white/90 text-gray-800 mb-2">
            {restaurant.cuisine_type}
          </Badge>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--belgian-red)] transition-colors">
          {restaurant.name}
        </h3>
        {restaurant.rating && (
          <div className="flex items-center mb-3">
            <Star className="h-4 w-4 text-[var(--belgian-gold)] fill-current mr-1" />
            <span className="font-semibold text-sm">{restaurant.rating}</span>
          </div>
        )}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{restaurant.short_description}</p>
        {restaurant.specialty && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{t('cityDetail.specialty')}</p>
            <p className="text-sm font-medium text-gray-700 line-clamp-1">{restaurant.specialty}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RestaurantCard({ restaurant }) {
  const mainImage = restaurant.images?.[0] || restaurant.image
    || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
      <div className="relative h-48">
        <img src={mainImage} alt={restaurant.name} className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'; }} />
        <Badge className="absolute top-3 right-3 bg-white text-gray-800">
          {restaurant.price_range}
        </Badge>
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
  const mainImage = hotel.images?.[0] || hotel.image
    || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
      <div className="relative h-48">
        <img src={mainImage} alt={hotel.name} className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'; }} />
        <Badge className="absolute top-3 right-3 bg-white text-gray-800">
          {hotel.price_range}
        </Badge>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{hotel.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{hotel.type}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{hotel.short_description}</p>
      </div>
    </div>
  );
}
