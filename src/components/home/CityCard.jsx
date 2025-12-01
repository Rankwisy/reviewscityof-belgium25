import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CityCard({ city }) {
  const imageUrl = city.thumbnail_image || city.hero_image || 'https://images.unsplash.com/photo-1559564484-e48bf5e8a3e7?w=800&h=600&fit=crop&q=80';
  
  return (
    <Link to={createPageUrl('CityDetail') + '?city=' + city.slug}>
      <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 h-96">
        <img
          src={imageUrl}
          alt={`${city.name}, Belgium - ${city.tagline}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1559564484-e48bf5e8a3e7?w=800&h=600&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-2xl font-bold mb-2">{city.name}</h3>
          <p className="text-gray-200 mb-4">{city.tagline}</p>
          
          <Button 
            className="bg-[var(--belgian-red)] hover:bg-[#c00510] text-white group-hover:bg-white group-hover:text-[var(--belgian-red)]"
          >
            Explore City
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </Link>
  );
}