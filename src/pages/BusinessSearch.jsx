import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, Phone, Mail, Globe, Star, CheckCircle, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEO from '../components/SEO';

export default function BusinessSearch() {
  const urlParams = new URLSearchParams(window.location.search);
  const categorySlug = urlParams.get('category');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');

  const { data: category } = useQuery({
    queryKey: ['category', categorySlug],
    queryFn: async () => {
      if (!categorySlug) return null;
      const categories = await base44.entities.BusinessCategory.filter({ slug: categorySlug });
      return categories[0];
    },
    enabled: !!categorySlug,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list('-name', 50),
  });

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['businesses', categorySlug],
    queryFn: async () => {
      if (!categorySlug) return [];
      return await base44.entities.Business.filter({ category_slug: categorySlug }, '-rating', 100);
    },
    enabled: !!categorySlug,
  });

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === 'all' || business.city_slug === cityFilter;
    return matchesSearch && matchesCity;
  });

  if (!categorySlug) {
    return (
      <div className="py-20 px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Category Not Found</h1>
        <p className="text-gray-600">Please select a valid business category.</p>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <SEO 
        title={`${category?.name || 'Business'} Services in Belgium`}
        description={category?.description || 'Find trusted local businesses in Belgium'}
        keywords={`${category?.name}, Belgium, local services, business directory`}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Briefcase className="h-12 w-12 text-[var(--belgian-red)]" />
            <h1 className="text-5xl font-bold text-gray-900">{category?.name || 'Services'}</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {category?.description || 'Find trusted local businesses in Belgium'}
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search businesses..."
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
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'}
          </p>
        </div>

        {/* Business Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--belgian-red)]"></div>
          </div>
        ) : filteredBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <Card className="mb-12">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 text-lg">No businesses found matching your criteria.</p>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-[var(--belgian-red)] to-[#c00510] rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">List Your Business</h2>
          <p className="text-xl mb-6 opacity-90">
            Are you a business owner? Get discovered by thousands of customers across Belgium.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-[var(--belgian-red)] hover:bg-gray-100"
            onClick={() => window.location.href = createPageUrl('Contact')}
          >
            Contact Us to List Your Business
          </Button>
        </div>
      </div>
    </div>
  );
}

function BusinessCard({ business }) {
  return (
    <Link to={createPageUrl('BusinessDetail') + '?slug=' + business.slug}>
      <Card className="h-full hover:shadow-xl transition-all duration-300 group">
        <CardContent className="pt-6">
          {/* Image */}
          <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
            <img
              src={business.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'}
              alt={business.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {business.verified && (
              <Badge className="absolute top-3 right-3 bg-green-100 text-green-800 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>

          {/* Business Info */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[var(--belgian-red)] transition-colors">
            {business.name}
          </h3>

          {/* Rating */}
          {business.rating > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(business.rating)
                        ? 'text-[var(--belgian-gold)] fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">{business.rating.toFixed(1)}</span>
              {business.review_count > 0 && (
                <span className="text-sm text-gray-500">({business.review_count} reviews)</span>
              )}
            </div>
          )}

          <p className="text-gray-600 mb-4 line-clamp-2">{business.description}</p>

          {/* Contact Info */}
          <div className="space-y-2 text-sm">
            {business.city_slug && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4 text-[var(--belgian-red)]" />
                <span className="capitalize">{business.city_slug}</span>
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4 text-[var(--belgian-red)]" />
                <span>{business.phone}</span>
              </div>
            )}
            {business.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4 text-[var(--belgian-red)]" />
                <span className="truncate">{business.email}</span>
              </div>
            )}
          </div>

          {/* View Details Button */}
          <Button 
            className="w-full mt-4 bg-[var(--belgian-red)] hover:bg-[#c00510]"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = createPageUrl('BusinessDetail') + '?slug=' + business.slug;
            }}
          >
            View Details & Reviews
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}