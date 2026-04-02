import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  MapPin, Compass, Users, Mail, Star, TrendingUp, Sparkles,
  Award, Heart, ArrowRight, Search, Calendar, ChevronRight,
  Briefcase, CheckCircle, Clock, Phone, Globe, Trophy, Bus
} from 'lucide-react';
import SEO from '../components/SEO';
import { format, parseISO, isFuture } from 'date-fns';
import { useLanguage } from './LanguageContext';
import { useTranslation } from './translations';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isVisible, setIsVisible] = useState({});
  const { language } = useLanguage();
  const t = useTranslation(language);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[id^="section-"]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const { data: cities = [] } = useQuery({
    queryKey: ['cities', 'featured'],
    queryFn: async () => {
      const allCities = await base44.entities.City.list('-created_date', 100);
      return allCities.filter(city => city.featured === true).slice(0, 8);
    },
  });

  const { data: attractions = [] } = useQuery({
    queryKey: ['attractions', 'featured'],
    queryFn: async () => {
      const allAttractions = await base44.entities.Attraction.list('-rating', 100);
      return allAttractions.filter(attraction => attraction.featured === true).slice(0, 6);
    },
  });

  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses', 'featured'],
    queryFn: async () => {
      const allBusinesses = await base44.entities.Business.list('-rating', 100);
      return allBusinesses.filter(business => business.featured === true).slice(0, 4);
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events', 'featured'],
    queryFn: async () => {
      const allEvents = await base44.entities.Event.list('start_date', 100);
      return allEvents.filter(event => event.featured === true).slice(0, 4);
    },
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ['blog', 'featured'],
    queryFn: async () => {
      const allPosts = await base44.entities.BlogPost.list('-created_date', 100);
      return allPosts.filter(post => post.featured === true && post.published === true).slice(0, 4);
    },
  });

  const upcomingEvents = events.filter(event => event.start_date && isFuture(parseISO(event.start_date)));


  const stats = [
    { number: "50+", label: t('home.citiesAndTowns'), icon: MapPin },
    { number: "500+", label: t('home.topAttractions'), icon: Compass },
    { number: "1000+", label: t('home.localBusinesses'), icon: Users },
    { number: "200+", label: t('home.travelGuides'), icon: Award }
  ];

  return (
    <div className="relative overflow-hidden">
      <SEO 
        title="Discover Belgium - Your Complete Travel Guide"
        description="Explore Belgian cities, top attractions, restaurants, and hotels. Your comprehensive guide to traveling in Belgium with local insights and expert recommendations."
        keywords="Belgium travel, Belgian cities, Belgium tourism, Brussels, Bruges, Antwerp, Ghent"
      />

      {/* Premium Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://ik.imagekit.io/9nqnnkvba/cityreview.be.jpg"
            alt="Belgium travel guide — discover cities, restaurants, hotels and attractions"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent" />
        </div>

        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-yellow)] opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-blue-500 to-purple-500 opacity-10 rounded-full blur-3xl" style={{animation: 'float 8s ease-in-out infinite'}}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <div className="glass-effect rounded-3xl p-8 md:p-12 max-w-4xl mx-auto backdrop-blur-xl">
            <Badge className="mb-6 bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white border-0 text-sm px-6 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              {language === 'fr' ? 'Votre Aventure Belge Commence Ici' : language === 'nl' ? 'Uw Belgisch Avontuur Begint Hier' : 'Your Belgian Adventure Starts Here'}
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              {t('home.welcomeTitle')}
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8">
              {t('home.welcomeSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder={t('home.searchPlaceholder')}
                  className="h-14 pl-12 pr-4 text-lg bg-white/95 backdrop-blur border-0 shadow-xl"
                />
              </div>
              <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] hover:shadow-2xl hover:scale-105 transition-all duration-300 text-white border-0 text-lg font-semibold">
                {t('home.startExploring')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link to={createPageUrl('Cities')}>
                <Button variant="outline" className="glass-effect border-white/30 text-white hover:bg-white/20">
                  <MapPin className="h-4 w-4 mr-2" />
                  {t('nav.cities')}
                </Button>
              </Link>
              <Link to={createPageUrl('Attractions')}>
                <Button variant="outline" className="glass-effect border-white/30 text-white hover:bg-white/20">
                  <Compass className="h-4 w-4 mr-2" />
                  {t('nav.attractions')}
                </Button>
              </Link>
              <Link to={createPageUrl('Events')}>
                <Button variant="outline" className="glass-effect border-white/30 text-white hover:bg-white/20">
                  <Calendar className="h-4 w-4 mr-2" />
                  {t('nav.events')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-white to-orange-50 relative">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[var(--primary-orange)] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[var(--primary-yellow)] rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                id={`section-stat-${index}`}
                className={`text-center transform transition-all duration-700 delay-${index * 100} ${
                  isVisible[`section-stat-${index}`] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-yellow)] rounded-2xl mb-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110">
                  <stat.icon className="h-10 w-10 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cities */}
      <section id="section-cities" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[var(--primary-orange)]/10 text-[var(--primary-orange)] border-[var(--primary-orange)]/20">
              {t('home.popularDestinations')}
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              {language === 'fr' ? 'Explorez ' : language === 'nl' ? 'Verken ' : 'Explore '}<span className="gradient-text">{language === 'fr' ? 'les Villes Belges' : language === 'nl' ? 'Belgische Steden' : 'Belgian Cities'}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('home.discoverCharm')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {cities.slice(0, 2).map((city, index) => (
              <Link
                key={city.id}
                to={createPageUrl('CityDetail') + '?city=' + city.slug}
                className="group relative overflow-hidden rounded-2xl hover-lift md:col-span-2 h-96"
              >
                <img
                  src={city.thumbnail_image || city.hero_image}
                  alt={`Scenic view of ${city.name}, Belgium - ${city.tagline}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white font-bold mb-2 text-4xl">
                    {city.name}
                  </h3>
                  <p className="text-white/90 text-sm mb-3">{city.tagline}</p>
                  <div className="flex items-center text-white/80 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {t('home.belgium')}
                    <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}

            <Link
              to={createPageUrl('LocalServices')}
              className="group relative overflow-hidden rounded-2xl hover-lift h-64 border-2 border-dashed border-[var(--primary-orange)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-yellow)]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <Briefcase className="h-12 w-12 text-white mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold text-2xl mb-2">
                  {t('home.localServicesTitle')}
                </h3>
                <p className="text-white/90 text-sm mb-3">
                  {t('home.localServicesDesc')}
                </p>
                <Badge className="bg-white text-[var(--primary-orange)] font-semibold">
                  {t('home.featuredService')}
                </Badge>
              </div>
            </Link>

            <Link
              to={createPageUrl('Events')}
              className="group relative overflow-hidden rounded-2xl hover-lift h-64 border-2 border-dashed border-purple-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <Calendar className="h-12 w-12 text-white mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold text-2xl mb-2">
                  {t('home.upcomingEventsTitle')}
                </h3>
                <p className="text-white/90 text-sm mb-3">
                  {t('home.upcomingEventsDesc')}
                </p>
                <Badge className="bg-white text-purple-600 font-semibold">
                  {t('home.featuredEvents')}
                </Badge>
              </div>
            </Link>

            <Link
              to={createPageUrl('Events') + '?category=Sports'}
              className="group relative overflow-hidden rounded-2xl hover-lift h-64 border-2 border-dashed border-green-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-500" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <Trophy className="h-12 w-12 text-white mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold text-2xl mb-2">Sports Events</h3>
                <p className="text-white/90 text-sm mb-3">
                  Live matches, races & sporting events across Belgium
                </p>
                <Badge className="bg-white text-green-600 font-semibold">
                  Explore Sports
                </Badge>
              </div>
            </Link>

            <Link
              to="/localservices/transport"
              className="group relative overflow-hidden rounded-2xl hover-lift h-64 border-2 border-dashed border-blue-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-500" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <Bus className="h-12 w-12 text-white mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold text-2xl mb-2">Transport</h3>
                <p className="text-white/90 text-sm mb-3">
                  Trains, buses, trams & cycling guides for Belgium
                </p>
                <Badge className="bg-white text-blue-600 font-semibold">
                  Get Around
                </Badge>
              </div>
            </Link>

            {cities.slice(2, 8).map((city) => (
              <Link
                key={city.id}
                to={createPageUrl('CityDetail') + '?city=' + city.slug}
                className="group relative overflow-hidden rounded-2xl hover-lift h-64"
              >
                <img
                  src={city.thumbnail_image || city.hero_image}
                  alt={`Discover ${city.name}, Belgium - ${city.tagline}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white font-bold mb-2 text-2xl">
                    {city.name}
                  </h3>
                  <p className="text-white/90 text-sm mb-3">{city.tagline}</p>
                  <div className="flex items-center text-white/80 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {t('home.belgium')}
                    <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link to={createPageUrl('Cities')}>
              <Button size="lg" variant="outline" className="border-2 border-[var(--primary-orange)] text-[var(--primary-orange)] hover:bg-[var(--primary-orange)] hover:text-white transition-all duration-300 hover:shadow-xl">
                {t('home.viewAllCities')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Attractions */}
      <section id="section-attractions" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-400 opacity-10 organic-blob"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[var(--primary-yellow)]/20 text-[var(--primary-dark)] border-[var(--primary-yellow)]/30">
              {t('home.mustSeePlaces')}
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              {language === 'fr' ? 'Top ' : language === 'nl' ? 'Top ' : 'Top '}<span className="gradient-text">{language === 'fr' ? 'Attractions' : language === 'nl' ? 'Attracties' : 'Attractions'}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('home.unforgettableExperiences')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {attractions.slice(0, 6).map((attraction, index) => (
              <Link
                key={attraction.id}
                to={createPageUrl('AttractionDetail') + '?slug=' + attraction.slug}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="overflow-hidden hover-lift h-full border-0 shadow-xl">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={attraction.images?.[0] || 'https://images.unsplash.com/photo-1605305089278-e92b9c7bb2a9?w=800&q=80'}
                      alt={`${attraction.name} in ${attraction.city_slug}, Belgium - ${attraction.category} attraction`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <Badge className="absolute top-4 right-4 bg-white/95 text-gray-900 backdrop-blur">
                      {attraction.price_range || '€€'}
                    </Badge>
                    {attraction.rating && (
                      <div className="absolute top-4 left-4 glass-effect px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="h-4 w-4 text-[var(--primary-yellow)] fill-current" />
                        <span className="text-white font-semibold text-sm">{attraction.rating}</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <MapPin className="h-4 w-4 text-[var(--primary-orange)]" />
                      <span className="capitalize">{attraction.city_slug}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                      {attraction.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {attraction.short_description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <Badge variant="outline" className="text-xs">
                        {attraction.category}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-[var(--primary-orange)] group-hover:translate-x-2 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to={createPageUrl('Attractions')}>
              <Button size="lg" className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] hover:shadow-2xl hover:scale-105 transition-all duration-300 text-white border-0">
                {t('home.discoverMore')}
                <TrendingUp className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Local Services */}
      {businesses.length > 0 && (
        <section id="section-businesses" className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
                {t('home.trustedServices')}
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold mb-4">
                {language === 'fr' ? 'Entreprises ' : language === 'nl' ? 'Lokale ' : 'Featured '}<span className="gradient-text">{language === 'fr' ? 'Locales en Vedette' : language === 'nl' ? 'Bedrijven' : 'Local Businesses'}</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t('home.connectWithPros')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {businesses.slice(0, 4).map((business) => (
                <Link
                  key={business.id}
                  to={createPageUrl('BusinessDetail') + '?slug=' + business.slug}
                >
                  <Card className="overflow-hidden hover-lift h-full border-0 shadow-xl group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={business.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'}
                        alt={`${business.name} - Verified local business in ${business.city_slug || 'Belgium'}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {business.verified && (
                        <Badge className="absolute top-3 right-3 bg-green-500 text-white flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {t('home.verified')}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-[var(--primary-orange)] transition-colors">
                        {business.name}
                      </h3>
                      
                      {business.rating && business.rating > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.round(business.rating)
                                    ? 'text-[var(--primary-yellow)] fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold">{business.rating.toFixed(1)}</span>
                          {business.review_count && business.review_count > 0 && (
                            <span className="text-xs text-gray-500">({business.review_count})</span>
                          )}
                        </div>
                      )}

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {business.description}
                      </p>

                      <div className="space-y-1 text-xs text-gray-500">
                        {business.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span className="truncate">{business.phone}</span>
                          </div>
                        )}
                        {business.city_slug && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="capitalize">{business.city_slug}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to={createPageUrl('LocalServices')}>
                <Button size="lg" variant="outline" className="border-2 border-[var(--primary-orange)] text-[var(--primary-orange)] hover:bg-[var(--primary-orange)] hover:text-white transition-all duration-300">
                  {t('home.viewAllServices')}
                  <Briefcase className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Events */}
      {upcomingEvents.length > 0 && (
        <section id="section-events" className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-purple-100 text-purple-800 border-purple-200">
                {t('home.whatsHappening')}
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold mb-4">
                {language === 'fr' ? 'Événements ' : language === 'nl' ? 'Aankomende ' : 'Upcoming '}<span className="gradient-text">{language === 'fr' ? 'à Venir' : language === 'nl' ? 'Evenementen' : 'Events'}</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t('home.excitingHappenings')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingEvents.slice(0, 4).map((event) => (
                <Card key={event.id} className="overflow-hidden hover-lift h-full border-0 shadow-xl group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'}
                      alt={`${event.name} - ${event.category} event in ${event.city_slug || 'Belgium'} on ${event.start_date ? format(parseISO(event.start_date), 'MMMM d, yyyy') : 'upcoming date'}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {event.category && (
                      <Badge className="absolute top-3 right-3 bg-white/95 text-gray-900">
                        {event.category}
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[var(--primary-orange)] transition-colors line-clamp-2">
                      {event.name}
                    </h3>

                    <div className="space-y-2 mb-4">
                      {event.start_date && (
                        <>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 text-[var(--primary-orange)]" />
                            <span>{format(parseISO(event.start_date), 'MMM d, yyyy')}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4 text-[var(--primary-orange)]" />
                            <span>{format(parseISO(event.start_date), 'h:mm a')}</span>
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
                        <span className="font-bold text-green-600">{t('home.free')}</span>
                      )}
                      
                      {event.website && (
                        <Button size="sm" variant="outline" className="text-xs" asChild>
                          <a href={event.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            {t('home.learnMore')}
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to={createPageUrl('Events')}>
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-white border-0">
                  {t('home.viewAllEvents')}
                  <Calendar className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section id="section-features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              {t('home.whyCityReview').split(' ')[0]} <span className="gradient-text">{t('home.whyCityReview').split(' ').slice(1).join(' ')}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: t('home.comprehensiveGuides'),
                description: t('home.comprehensiveDesc'),
                color: "from-orange-500 to-red-500"
              },
              {
                icon: Users,
                title: t('home.localInsights'),
                description: t('home.localInsightsDesc'),
                color: "from-blue-500 to-purple-500"
              },
              {
                icon: TrendingUp,
                title: t('home.alwaysUpdated'),
                description: t('home.alwaysUpdatedDesc'),
                color: "from-green-500 to-teal-500"
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover-lift border-0 shadow-xl overflow-hidden">
                <CardContent className="p-8 text-center relative">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110 relative z-10`}>
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      {blogPosts.length > 0 && (
        <section id="section-blog" className="py-20 px-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-white/10 text-white border-white/20">
                {t('home.travelInspiration')}
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold mb-4">
                {language === 'fr' ? 'Dernières ' : language === 'nl' ? 'Laatste ' : 'Latest '}<span className="text-[var(--primary-yellow)]">{language === 'fr' ? 'Histoires' : language === 'nl' ? 'Verhalen' : 'Stories'}</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                {t('home.expertGuides')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogPosts.slice(0, 2).map((post) => (
                <Link
                  key={post.id}
                  to={createPageUrl('BlogDetail') + '?slug=' + post.slug}
                  className="group"
                >
                  <Card className="overflow-hidden hover-lift h-full bg-white/5 backdrop-blur border-white/10">
                    <div className="relative h-72 overflow-hidden">
                      <img
                        src={post.featured_image || 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800&q=80'}
                        alt={`${post.title} - ${post.category} travel article about ${post.related_city || 'Belgium'}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <Badge className="absolute top-4 left-4 bg-[var(--primary-yellow)] text-gray-900">
                        {post.category}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2 group-hover:text-[var(--primary-yellow)] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-300 line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{post.reading_time || `5 ${t('home.minRead')}`}</span>
                        <div className="flex items-center text-[var(--primary-yellow)] font-semibold">
                          {t('home.readMore')}
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to={createPageUrl('Blog')}>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300">
                  {t('home.viewAllArticles')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-[var(--primary-orange)] via-[var(--primary-yellow)] to-[var(--accent-brown)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl float-animation"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" style={{animation: 'float 10s ease-in-out infinite', animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="glass-effect rounded-3xl p-12 backdrop-blur-xl">
            <Mail className="h-16 w-16 text-white mx-auto mb-6 pulse-glow" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('home.startJourney')}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {t('home.exclusiveTips')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={t('home.emailPlaceholder')}
                className="flex-1 h-14 bg-white/95 backdrop-blur border-0 text-lg"
              />
              <Button size="lg" className="h-14 px-8 bg-white text-[var(--primary-orange)] hover:bg-gray-100 font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                {t('home.subscribe')}
                <Heart className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <p className="text-white/70 text-sm mt-4">
              {t('home.joinTravelers')}
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes ken-burns {
          0% { transform: scale(1) translateX(0); }
          100% { transform: scale(1.1) translateX(-20px); }
        }

        .animate-ken-burns {
          animation: ken-burns 20s ease-out infinite alternate;
        }
      `}</style>
    </div>
  );
}