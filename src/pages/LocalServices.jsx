import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Car, Home, Sparkles, UtensilsCrossed, Baby, Dog, 
  Laptop, Building, Dumbbell, GraduationCap, Bus, Wind,
  ChevronRight, Wrench, Scissors, Hammer, PaintBucket,
  Truck, Package, Users, Briefcase, CheckCircle, Star,
  MapPin, TrendingUp
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useTranslation } from './translations';
import SEO from '../components/SEO';

const iconMap = {
  'Car': Car,
  'Home': Home,
  'Sparkles': Sparkles,
  'UtensilsCrossed': UtensilsCrossed,
  'Baby': Baby,
  'Dog': Dog,
  'Laptop': Laptop,
  'Building': Building,
  'Dumbbell': Dumbbell,
  'GraduationCap': GraduationCap,
  'Bus': Bus,
  'Wind': Wind,
  'Wrench': Wrench,
  'Scissors': Scissors,
  'Hammer': Hammer,
  'PaintBucket': PaintBucket,
  'Truck': Truck,
  'Package': Package,
  'Users': Users,
  'Briefcase': Briefcase
};

const gradientMap = [
  'from-orange-500 to-red-500',
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-green-500 to-emerald-500',
  'from-yellow-500 to-orange-500',
  'from-indigo-500 to-purple-500',
  'from-pink-500 to-rose-500',
  'from-teal-500 to-green-500',
  'from-violet-500 to-fuchsia-500',
  'from-amber-500 to-red-500',
  'from-cyan-500 to-blue-500',
  'from-lime-500 to-green-500'
];

export default function LocalServices() {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['business-categories'],
    queryFn: () => base44.entities.BusinessCategory.list('order', 100),
  });

  const { data: allBusinesses = [] } = useQuery({
    queryKey: ['all-businesses'],
    queryFn: () => base44.entities.Business.list('-rating', 1000),
  });

  // Count businesses per category
  const getCategoryCount = (categorySlug) => {
    return allBusinesses.filter(b => b.category_slug === categorySlug).length;
  };

  // Get top businesses for featured section - Filter in JavaScript
  const topBusinesses = allBusinesses
    .filter(b => b.verified === true && b.rating && b.rating >= 4.5)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <SEO 
        title="Top Local Business Categories in Belgium"
        description="Discover the most searched local services and businesses across Belgium. From car repair to beauty salons, find trusted local businesses in your area."
        keywords="Belgium local business, Belgium services, car repair Belgium, home renovation Belgium, beauty salons Belgium, restaurants Belgium"
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--primary-dark)] via-[var(--secondary-gray)] to-[var(--near-black)] text-white py-20 px-4">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary-orange)] opacity-10 organic-blob"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[var(--primary-yellow)] opacity-10 organic-blob" style={{animationDelay: '2s'}}></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-white/10 text-white border-white/20 text-sm px-6 py-2">
            <Briefcase className="h-4 w-4 mr-2" />
            Trusted Local Professionals
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Find Local Services in <span className="text-[var(--primary-yellow)]">Belgium</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            Connect with verified local businesses and professionals. Quality services for every need.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Verified Businesses</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
              <Star className="h-4 w-4 text-[var(--primary-yellow)]" />
              <span>Rated & Reviewed</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
              <MapPin className="h-4 w-4 text-blue-400" />
              <span>All Cities</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        {/* Featured Top Businesses */}
        {topBusinesses.length > 0 && (
          <div className="mb-16">
            <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="h-6 w-6 text-[var(--primary-orange)]" />
                  <h2 className="text-2xl font-bold text-gray-900">Top Rated Services</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topBusinesses.map((business) => (
                    <Link 
                      key={business.id}
                      to={createPageUrl('BusinessDetail') + '?slug=' + business.slug}
                      className="group"
                    >
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                            {business.image ? (
                              <img src={business.image} alt={business.name} className="w-full h-full object-cover" />
                            ) : (
                              <Briefcase className="w-full h-full p-2 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[var(--primary-orange)] transition-colors">
                              {business.name}
                            </h3>
                            {business.rating && business.rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-[var(--primary-yellow)] fill-current" />
                                <span className="text-sm font-semibold">{business.rating.toFixed(1)}</span>
                                {business.review_count && business.review_count > 0 && (
                                  <span className="text-xs text-gray-500">({business.review_count})</span>
                                )}
                              </div>
                            )}
                          </div>
                          {business.verified && (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{business.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Service Categories Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Browse by <span className="gradient-text">Category</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our diverse range of local services and find the perfect professional for your needs
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-orange)]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category, index) => {
                const IconComponent = iconMap[category.icon] || Briefcase;
                const gradient = gradientMap[index % gradientMap.length];
                const businessCount = getCategoryCount(category.slug);
                
                return (
                  <Link 
                    key={category.id}
                    to={createPageUrl('BusinessSearch') + '?category=' + category.slug}
                    className="group"
                  >
                    <Card className="h-full hover-lift border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
                      <CardContent className="p-6">
                        {/* Icon with gradient background */}
                        <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>
                        
                        {/* Category Name */}
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[var(--primary-orange)] group-hover:to-[var(--primary-yellow)] transition-all duration-300">
                          {category.name}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
                          {category.description}
                        </p>

                        {/* Business Count & Arrow */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`bg-gradient-to-r ${gradient} text-white border-0`}>
                              {businessCount} {businessCount === 1 ? 'business' : 'businesses'}
                            </Badge>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[var(--primary-orange)] group-hover:translate-x-2 transition-all duration-300" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          {categories.length === 0 && !isLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories available</h3>
                <p className="text-gray-600">Check back soon for local service categories</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Why Choose Local Section */}
        <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl p-8 md:p-12 shadow-xl">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose <span className="gradient-text">Local Services?</span>
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Supporting local businesses strengthens your community and often provides 
                more personalized service. Belgian local businesses are ready to serve you with quality and care.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold gradient-text mb-2">{categories.length}+</div>
                <div className="text-gray-600 font-medium">Service Categories</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold gradient-text mb-2">100%</div>
                <div className="text-gray-600 font-medium">Verified Listings</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold gradient-text mb-2">{allBusinesses.length}+</div>
                <div className="text-gray-600 font-medium">Local Businesses</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}