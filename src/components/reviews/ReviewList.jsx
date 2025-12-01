import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, Calendar, ThumbsUp, MoreVertical, 
  TrendingUp, Clock, Star as StarIcon 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import RatingStars from './RatingStars';

export default function ReviewList({ itemType, itemId }) {
  const [sortBy, setSortBy] = useState('newest');

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', itemType, itemId, sortBy],
    queryFn: async () => {
      const allReviews = await base44.entities.Review.filter(
        { item_type: itemType, item_id: itemId, status: 'approved' },
        sortBy === 'newest' ? '-created_date' : sortBy === 'highest' ? '-rating' : '-helpful_count',
        100
      );
      return allReviews;
    },
    enabled: !!itemType && !!itemId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-orange)]"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-12 text-center">
          <StarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
          <p className="text-gray-600">Be the first to share your experience!</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate rating statistics
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: (reviews.filter(r => r.rating === star).length / totalReviews) * 100
  }));

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-yellow-50">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="text-6xl font-bold text-gray-900 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <RatingStars rating={averageRating} size="lg" />
              <p className="text-gray-600 mt-2">
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-12">
                    {star} star{star !== 1 && 's'}
                  </span>
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          All Reviews ({totalReviews})
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {sortBy === 'newest' && <><Clock className="h-4 w-4 mr-2" />Newest First</>}
              {sortBy === 'highest' && <><TrendingUp className="h-4 w-4 mr-2" />Highest Rated</>}
              {sortBy === 'helpful' && <><ThumbsUp className="h-4 w-4 mr-2" />Most Helpful</>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortBy('newest')}>
              <Clock className="h-4 w-4 mr-2" />
              Newest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('highest')}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Highest Rated
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('helpful')}>
              <ThumbsUp className="h-4 w-4 mr-2" />
              Most Helpful
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-yellow)] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {review.reviewer_name ? review.reviewer_name.charAt(0).toUpperCase() : 'U'}
            </div>

            {/* Review Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-900">{review.reviewer_name || 'Anonymous'}</span>
                <span className="text-gray-400">•</span>
                <RatingStars rating={review.rating} size="sm" />
              </div>

              {review.title && (
                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
              )}

              <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(review.created_date), 'MMM d, yyyy')}</span>
                </div>
                {review.visit_date && (
                  <div className="flex items-center gap-1">
                    <span>Visited: {format(new Date(review.visit_date), 'MMM yyyy')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <ThumbsUp className="h-4 w-4 mr-2" />
                Mark as Helpful
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Helpful Count */}
        {review.helpful_count > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-600">
              <ThumbsUp className="h-3 w-3 inline mr-1" />
              {review.helpful_count} {review.helpful_count === 1 ? 'person' : 'people'} found this helpful
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}