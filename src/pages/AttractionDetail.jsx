import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, Phone, Globe, Star, Clock, Calendar, Euro,
  Info, Accessibility, Languages, Wifi, Utensils, ShoppingBag,
  ParkingCircle, Camera, Users, Heart, Share2, ExternalLink, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useLanguage } from './LanguageContext';
import { useTranslation } from './translations';
import SEO from '../components/SEO';
import { useAchievements } from '../components/gamification/useAchievements';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import SocialShare from '../components/SocialShare';
import RatingStars from '../components/reviews/RatingStars';
import ReviewForm from '../components/reviews/ReviewForm';
import ReviewList from '../components/reviews/ReviewList';

export default function AttractionDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const attractionSlug = urlParams.get('slug');
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [user, setUser] = useState(null);
  const { trackAttractionView } = useAchievements(user);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: attraction, isLoading: attractionLoading } = useQuery({
    queryKey: ['attraction', attractionSlug],
    queryFn: async () => {
      const attractions = await base44.entities.Attraction.filter({ slug: attractionSlug });
      return attractions[0];
    },
    enabled: !!attractionSlug,
  });

  // Track attraction view for gamification
  useEffect(() => {
    if (attraction && user) {
      trackAttractionView(attractionSlug);
    }
  }, [attraction, user, attractionSlug]);

  const { data: city } = useQuery({
    queryKey: ['city', attraction?.city_slug],
    queryFn: async () => {
      const cities = await base44.entities.City.filter({ slug: attraction.city_slug });
      return cities[0];
    },
    enabled: !!attraction?.city_slug,
  });

  const { data: relatedAttractions = [] } = useQuery({
    queryKey: ['related-attractions', attraction?.city_slug, attraction?.category],
    queryFn: async () => {
      const attractions = await base44.entities.Attraction.filter({ 
        city_slug: attraction.city_slug 
      }, '-average_rating', 10);
      return attractions.filter(a => a.id !== attraction.id).slice(0, 3);
    },
    enabled: !!attraction?.city_slug,
  });

  if (attractionLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-orange)]"></div>
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="py-20 px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Attraction Not Found</h1>
        <p className="text-gray-600 mb-6">The attraction you're looking for doesn't exist.</p>
        <Link to={createPageUrl('Attractions')}>
          <Button className="bg-[var(--primary-orange)] hover:bg-[#d67f0a]">
            Browse All Attractions
          </Button>
        </Link>
      </div>
    );
  }

  const mainImage = attraction.images?.[0] || attraction.image
    || 'https://images.unsplash.com/photo-1605305089278-e92b9c7bb2a9?w=1600&q=80';

  const contactPhone = attraction.contact_phone || attraction.phone;
  const websiteUrl = attraction.website_url || attraction.website;

  const facilityIcons = {
    'parking': ParkingCircle,
    'cafe': Utensils,
    'restaurant': Utensils,
    'gift shop': ShoppingBag,
    'wifi': Wifi,
    'photography': Camera,
    'guided tours': Users,
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "name": attraction.name,
    "description": attraction.short_description || attraction.full_description,
    "image": mainImage,
    "address": attraction.address,
    ...(contactPhone && { "telephone": contactPhone }),
    ...(websiteUrl && { "url": websiteUrl }),
    ...(attraction.opening_hours && { "openingHours": attraction.opening_hours }),
    ...(attraction.average_rating && attraction.review_count > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": attraction.average_rating,
        "reviewCount": attraction.review_count,
        "bestRating": 5
      }
    })
  };

  const breadcrumbItems = attraction ? [
    { label: 'Attractions', url: createPageUrl('Attractions') },
    { label: city?.name || attraction.city_slug, url: createPageUrl('CityDetail') + '?city=' + attraction.city_slug },
    { label: attraction.name, url: createPageUrl('AttractionDetail') + '?slug=' + attractionSlug }
  ] : [];

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />
      
      <SEO 
        title={`${attraction.name} - ${city?.name || 'Belgium'}`}
        description={attraction.short_description || attraction.full_description}
        keywords={`${attraction.name}, ${city?.name}, Belgium, ${attraction.category}, tourist attraction, things to do`}
        image={mainImage}
        type="article"
        structuredData={structuredData}
      />

      {/* Hero Section with Image Gallery */}
      <div className="relative">
        <div className="relative h-[500px]">
          <img
            src={mainImage}
            alt={attraction.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Floating Share Button */}
          <SocialShare
            url={window.location.href}
            title={attraction.name}
            description={attraction.short_description || attraction.full_description}
            hashtags={['Belgium', city?.name?.replace(/\s+/g, ''), attraction.category?.replace(/\s+/g, ''), 'Travel']}
            variant="floating"
          />

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-[var(--primary-orange)] text-white text-sm">
                  {attraction.category}
                </Badge>
                <Badge className="bg-white/90 text-gray-900 text-sm">
                  {attraction.price_range || '€€'}
                </Badge>
                {city && (
                  <Badge className="bg-white/90 text-gray-900 text-sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    {city.name}
                  </Badge>
                )}
              </div>
              <h1 className="text-5xl font-bold text-white mb-4">{attraction.name}</h1>
              
              {/* Rating Display */}
              <div className="flex items-center gap-4">
                {attraction.average_rating > 0 ? (
                  <>
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                      <RatingStars rating={attraction.average_rating} size="md" />
                      <span className="text-lg font-bold text-gray-900">{attraction.average_rating.toFixed(1)}</span>
                    </div>
                    <span className="text-white text-sm">
                      ({attraction.review_count} {attraction.review_count === 1 ? 'review' : 'reviews'})
                    </span>
                  </>
                ) : (
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Star className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">No reviews yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery Thumbnails */}
        {attraction.images && attraction.images.length > 1 && (
          <div className="bg-gray-900 py-4">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex gap-4 overflow-x-auto">
                {attraction.images.slice(0, 6).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${attraction.name} ${index + 1}`}
                    className="h-20 w-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {attraction.opening_hours && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Clock className="h-8 w-8 text-[var(--primary-orange)] mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-900 mb-1">Opening Hours</p>
                    <p className="text-xs text-gray-600">{attraction.opening_hours}</p>
                  </CardContent>
                </Card>
              )}
              
              {attraction.duration && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Calendar className="h-8 w-8 text-[var(--primary-orange)] mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-900 mb-1">Duration</p>
                    <p className="text-xs text-gray-600">{attraction.duration}</p>
                  </CardContent>
                </Card>
              )}
              
              {attraction.ticket_price && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Euro className="h-8 w-8 text-[var(--primary-orange)] mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-900 mb-1">Ticket Price</p>
                    <p className="text-xs text-gray-600">{attraction.ticket_price}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line mb-4">
                {attraction.full_description || attraction.short_description}
              </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="visitor-info">Visitor Info</TabsTrigger>
                <TabsTrigger value="tips">Tips</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                {attraction.facilities && attraction.facilities.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-4">Facilities</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {attraction.facilities.map((facility, index) => {
                          const Icon = facilityIcons[facility.toLowerCase()] || Info;
                          return (
                            <div key={index} className="flex items-center gap-2">
                              <Icon className="h-5 w-5 text-[var(--primary-orange)]" />
                              <span className="text-sm capitalize">{facility}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {attraction.languages_available && attraction.languages_available.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-4">Languages Available</h3>
                      <div className="flex flex-wrap gap-2">
                        {attraction.languages_available.map((lang, index) => (
                          <Badge key={index} variant="outline">
                            <Languages className="h-3 w-3 mr-1" />
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="visitor-info">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {attraction.best_time && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Best Time to Visit</h3>
                        <p className="text-gray-700">{attraction.best_time}</p>
                      </div>
                    )}
                    
                    {attraction.accessibility && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                          <Accessibility className="h-5 w-5 text-[var(--primary-orange)]" />
                          Accessibility
                        </h3>
                        <p className="text-gray-700">{attraction.accessibility}</p>
                      </div>
                    )}

                    {attraction.address && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-[var(--primary-orange)]" />
                          Location
                        </h3>
                        <p className="text-gray-700">{attraction.address}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tips">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">Visitor Tips</h3>
                    <p className="text-gray-700 whitespace-pre-line">
                      {attraction.tips || "No visitor tips available yet."}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Reviews Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-[var(--primary-orange)]" />
                <h2 className="text-3xl font-bold text-gray-900">Reviews & Ratings</h2>
              </div>

              {/* Review Form */}
              <ReviewForm
                itemType="attraction"
                itemId={attraction.id}
                itemSlug={attraction.slug}
                itemName={attraction.name}
              />

              {/* Review List */}
              <ReviewList
                itemType="attraction"
                itemId={attraction.id}
              />
            </div>

            {/* Related Attractions */}
            {relatedAttractions.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">More in {city?.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedAttractions.map((related) => (
                    <RelatedAttractionCard key={related.id} attraction={related} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact & Visit Card */}
            <Card className="sticky top-24">
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Plan Your Visit</h3>
                
                {contactPhone && (
                  <a href={`tel:${contactPhone}`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Phone className="h-5 w-5 text-[var(--primary-orange)] mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Call Us</p>
                      <p className="text-sm text-gray-600">{contactPhone}</p>
                    </div>
                  </a>
                )}

                {websiteUrl && (
                  <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Globe className="h-5 w-5 text-[var(--primary-orange)] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Visit Website</p>
                      <p className="text-sm text-gray-600 break-all">{websiteUrl}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </a>
                )}

                {attraction.address && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <MapPin className="h-5 w-5 text-[var(--primary-orange)] mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Address</p>
                      <p className="text-sm text-gray-600">{attraction.address}</p>
                    </div>
                  </div>
                )}

                {websiteUrl && (
                  <Button 
                    className="w-full bg-[var(--primary-orange)] hover:bg-[#d67f0a] text-white"
                    onClick={() => window.open(websiteUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Official Website
                  </Button>
                )}

                {city && (
                  <Link to={createPageUrl('CityDetail') + '?city=' + city.slug}>
                    <Button variant="outline" className="w-full">
                      Explore {city.name}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Social Share Card */}
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold mb-4">Share This Attraction</h3>
                <SocialShare
                  url={window.location.href}
                  title={attraction.name}
                  description={attraction.short_description || attraction.full_description}
                  hashtags={['Belgium', city?.name?.replace(/\s+/g, ''), 'Travel']}
                  variant="compact"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function RelatedAttractionCard({ attraction }) {
  const mainImage = attraction.images?.[0] || attraction.image
    || 'https://images.unsplash.com/photo-1605305089278-e92b9c7bb2a9?w=800&q=80';

  return (
    <Link to={createPageUrl('AttractionDetail') + '?slug=' + attraction.slug}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative h-40">
          <img
            src={mainImage}
            alt={attraction.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <CardContent className="pt-4">
          <h4 className="font-bold text-gray-900 mb-2 group-hover:text-[var(--primary-orange)] transition-colors line-clamp-2">
            {attraction.name}
          </h4>
          <p className="text-sm text-gray-600 line-clamp-2">{attraction.short_description}</p>
          {attraction.average_rating > 0 && (
            <div className="flex items-center mt-2">
              <RatingStars rating={attraction.average_rating} size="sm" />
              <span className="text-sm font-semibold ml-2">{attraction.average_rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500 ml-1">({attraction.review_count})</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}