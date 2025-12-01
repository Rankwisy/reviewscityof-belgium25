import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, Phone, Mail, Globe, Star, CheckCircle, ThumbsUp,
  Calendar, User, ArrowUpDown, TrendingUp, Clock
} from 'lucide-react';
import ReviewForm from '../components/business/ReviewForm';
import ReviewCard from '../components/reviews/ReviewCard';
import SEO from '../components/SEO';
import { format } from 'date-fns';
import SocialShare from '../components/SocialShare';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import { createPageUrl } from '@/utils';

export default function BusinessDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const businessSlug = urlParams.get('slug');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [user, setUser] = useState(null);
  const [reviewSort, setReviewSort] = useState('helpful'); // helpful, newest, highest

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: business, isLoading: businessLoading } = useQuery({
    queryKey: ['business', businessSlug],
    queryFn: async () => {
      const businesses = await base44.entities.Business.filter({ slug: businessSlug });
      return businesses[0];
    },
    enabled: !!businessSlug,
  });

  const { data: category } = useQuery({
    queryKey: ['category', business?.category_slug],
    queryFn: async () => {
      const categories = await base44.entities.BusinessCategory.filter({ slug: business.category_slug });
      return categories[0];
    },
    enabled: !!business?.category_slug,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', business?.id],
    queryFn: () => base44.entities.BusinessReview.filter({ 
      business_id: business.id,
      status: 'approved'
    }, '-created_date', 100),
    enabled: !!business?.id,
  });

  // Sort reviews based on selected option
  const sortedReviews = React.useMemo(() => {
    const reviewsCopy = [...reviews];
    
    switch (reviewSort) {
      case 'helpful':
        return reviewsCopy.sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));
      case 'newest':
        return reviewsCopy.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      case 'highest':
        return reviewsCopy.sort((a, b) => b.rating - a.rating);
      default:
        return reviewsCopy;
    }
  }, [reviews, reviewSort]);

  if (businessLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--belgian-red)]"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="py-20 px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Business Not Found</h1>
        <p className="text-gray-600">The business you're looking for doesn't exist.</p>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : business.rating || 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === stars).length / reviews.length) * 100 : 0
  }));

  const breadcrumbItems = business ? [
    { label: 'Local Services', url: createPageUrl('LocalServices') },
    { label: category?.name || 'Business', url: createPageUrl('LocalServices') + (category ? '?category=' + category.slug : '') },
    { label: business.name, url: createPageUrl('BusinessDetail') + '?slug=' + businessSlug }
  ] : [];

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />
      
      <SEO 
        title={`${business.name} - ${category?.name || 'Business'}`}
        description={business.description}
        keywords={`${business.name}, Belgium, ${category?.name}, local services`}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Business Image */}
              <div className="md:w-1/3">
                <img
                  src={business.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'}
                  alt={business.name}
                  className="w-full h-64 object-cover rounded-xl"
                />
              </div>

              {/* Business Info */}
              <div className="md:w-2/3">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{business.name}</h1>
                    {category && (
                      <Badge className="bg-[var(--belgian-red)] text-white mb-3">
                        {category.name}
                      </Badge>
                    )}
                  </div>
                  {business.verified && (
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Verified
                    </Badge>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < Math.round(averageRating)
                            ? 'text-[var(--belgian-gold)] fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold">{averageRating}</span>
                  <span className="text-gray-600">({reviews.length} reviews)</span>
                </div>

                <p className="text-lg text-gray-700 mb-6">{business.description}</p>

                {/* Contact Info */}
                <div className="space-y-3">
                  {business.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-[var(--belgian-red)] mt-1" />
                      <span className="text-gray-700">{business.address}</span>
                    </div>
                  )}
                  {business.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-[var(--belgian-red)]" />
                      <a href={`tel:${business.phone}`} className="text-gray-700 hover:text-[var(--belgian-red)]">
                        {business.phone}
                      </a>
                    </div>
                  )}
                  {business.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-[var(--belgian-red)]" />
                      <a href={`mailto:${business.email}`} className="text-gray-700 hover:text-[var(--belgian-red)]">
                        {business.email}
                      </a>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-[var(--belgian-red)]" />
                      <a 
                        href={business.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-[var(--belgian-red)]"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>

                {business.website && (
                  <Button 
                    className="mt-6 bg-[var(--belgian-red)] hover:bg-[#c00510] text-white"
                    onClick={() => window.open(business.website, '_blank')}
                  >
                    <Globe className="h-5 w-5 mr-2" />
                    Visit Website
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Rating Overview */}
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center mb-6">
                      <div className="text-5xl font-bold mb-2">{averageRating}</div>
                      <div className="flex items-center justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.round(averageRating)
                                ? 'text-[var(--belgian-gold)] fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-600">{reviews.length} reviews</p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="space-y-2 mb-6">
                      {ratingDistribution.map(({ stars, count, percentage }) => (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="text-sm w-8">{stars}★</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[var(--belgian-gold)]"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8">{count}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="w-full bg-[var(--belgian-red)] hover:bg-[#c00510]"
                      onClick={() => setShowReviewForm(!showReviewForm)}
                    >
                      Write a Review
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-2 space-y-6">
                {showReviewForm && (
                  <ReviewForm 
                    business={business} 
                    onCancel={() => setShowReviewForm(false)}
                  />
                )}

                {/* Sort Dropdown */}
                {reviews.length > 0 && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-5 w-5 text-gray-600" />
                      <span className="font-semibold text-gray-700">Sort by:</span>
                    </div>
                    <Select value={reviewSort} onValueChange={setReviewSort}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="helpful">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Most Helpful
                          </div>
                        </SelectItem>
                        <SelectItem value="newest">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Newest First
                          </div>
                        </SelectItem>
                        <SelectItem value="highest">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Highest Rating
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--belgian-red)]"></div>
                  </div>
                ) : sortedReviews.length > 0 ? (
                  sortedReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} currentUser={user} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about">
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">About {business.name}</h2>
                  <p className="text-gray-700 mb-6 whitespace-pre-line">{business.description}</p>
                  
                  {business.services && business.services.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Services Offered</h3>
                      <div className="flex flex-wrap gap-2">
                        {business.services.map((service, index) => (
                          <Badge key={index} variant="outline">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Social Share */}
              <SocialShare
                url={window.location.href}
                title={business.name}
                description={business.description}
                hashtags={['Belgium', business.city_slug?.replace(/\s+/g, ''), 'LocalBusiness', category?.name?.replace(/\s+/g, '')]}
                variant="inline"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}