import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Star, Clock, MapPin, Phone, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const CATEGORY_FALLBACKS = {
  'Museums & Galleries':       'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80',
  'Historical Sites':          'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
  'Parks & Nature':            'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
  'Nightlife & Entertainment': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  'Tours & Experiences':       'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
};
const DEFAULT_ATTRACTION_FALLBACK = 'https://images.unsplash.com/photo-1605305089278-e92b9c7bb2a9?w=800&q=80';

export default function AttractionCard({ attraction }) {
  const mainImage = attraction.images?.[0]
    || attraction.image
    || CATEGORY_FALLBACKS[attraction.category]
    || DEFAULT_ATTRACTION_FALLBACK;

  const contactPhone = attraction.contact_phone || attraction.phone;
  const websiteUrl = attraction.website_url || attraction.website;

  return (
    <Link to={createPageUrl('AttractionDetail') + '?slug=' + attraction.slug}>
      <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
        <div className="relative h-48 overflow-hidden">
          <img
            src={mainImage}
            alt={`${attraction.name} - Popular ${attraction.category} attraction in ${attraction.city_slug}, Belgium`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = CATEGORY_FALLBACKS[attraction.category] || DEFAULT_ATTRACTION_FALLBACK;
            }}
          />
          <Badge className="absolute top-3 right-3 bg-white text-gray-800">
            {attraction.price_range || '€€'}
          </Badge>
          {attraction.category && (
            <Badge className="absolute top-3 left-3 bg-[var(--primary-orange)] text-white">
              {attraction.category}
            </Badge>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <MapPin className="h-4 w-4 text-[var(--primary-orange)]" />
            <span className="capitalize">{attraction.city_slug}</span>
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[var(--primary-orange)] transition-colors line-clamp-1">
            {attraction.name}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {attraction.short_description}
          </p>
          
          <div className="space-y-2 mb-3">
            {attraction.opening_hours && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="h-3 w-3 text-[var(--primary-orange)]" />
                <span className="line-clamp-1">{attraction.opening_hours}</span>
              </div>
            )}
            
            {contactPhone && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Phone className="h-3 w-3 text-[var(--primary-orange)]" />
                <span>{contactPhone}</span>
              </div>
            )}
            
            {websiteUrl && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Globe className="h-3 w-3 text-[var(--primary-orange)]" />
                <span className="line-clamp-1">Website available</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-[var(--primary-yellow)] fill-current mr-1" />
              <span className="text-sm font-semibold">{attraction.rating || 4.5}</span>
            </div>
            {attraction.duration && (
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>{attraction.duration}</span>
              </div>
            )}
          </div>

          {attraction.ticket_price && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-[var(--primary-orange)]">Tickets: </span>
                {attraction.ticket_price}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}