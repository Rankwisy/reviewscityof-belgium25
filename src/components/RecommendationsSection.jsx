import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles } from 'lucide-react';
import AttractionCard from './home/AttractionCard';

export default function RecommendationsSection({ user }) {
  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorite.list('-created_date', 1000),
    enabled: !!user,
  });

  const { data: allAttractions = [] } = useQuery({
    queryKey: ['attractions-all'],
    queryFn: () => base44.entities.Attraction.list('-rating', 500),
  });

  const { data: allRestaurants = [] } = useQuery({
    queryKey: ['restaurants-all'],
    queryFn: () => base44.entities.Restaurant.list('-rating', 500),
  });

  if (!user || favorites.length === 0) {
    return null;
  }

  // Get cities and categories from favorites
  const favoriteCities = new Set();
  const favoriteCategories = new Set();

  favorites.forEach(fav => {
    if (fav.item_type === 'attraction') {
      const attraction = allAttractions.find(a => a.id === fav.item_id);
      if (attraction) {
        favoriteCities.add(attraction.city_slug);
        favoriteCategories.add(attraction.category);
      }
    } else if (fav.item_type === 'restaurant') {
      const restaurant = allRestaurants.find(r => r.id === fav.item_id);
      if (restaurant) {
        favoriteCities.add(restaurant.city_slug);
      }
    }
  });

  // Find recommendations based on favorite cities and categories
  const favoriteItemIds = new Set(favorites.map(f => f.item_id));

  const recommendations = allAttractions
    .filter(attr => 
      !favoriteItemIds.has(attr.id) && (
        favoriteCities.has(attr.city_slug) ||
        favoriteCategories.has(attr.category)
      )
    )
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 6);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h2 className="text-4xl font-bold text-gray-900">Recommended For You</h2>
          </div>
          <p className="text-xl text-gray-600">
            Based on your saved favorites, we think you'll love these places
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((attraction) => (
            <AttractionCard key={attraction.id} attraction={attraction} />
          ))}
        </div>
      </div>
    </section>
  );
}