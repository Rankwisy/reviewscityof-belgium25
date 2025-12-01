import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ThumbsUp, User, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ReviewCard({ review, currentUser }) {
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);
  const queryClient = useQueryClient();

  const markHelpfulMutation = useMutation({
    mutationFn: async () => {
      // Update the helpful count
      await base44.entities.BusinessReview.update(review.id, {
        helpful_count: (review.helpful_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews']);
      setHasMarkedHelpful(true);
    },
  });

  const handleMarkHelpful = () => {
    if (!currentUser) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }
    
    if (!hasMarkedHelpful) {
      markHelpfulMutation.mutate();
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? 'text-[var(--primary-yellow)] fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-lg">{review.rating}.0</span>
            </div>
            {review.title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{review.title}</h3>
            )}
          </div>
          <div className="text-right text-sm text-gray-500">
            <div className="flex items-center gap-1 mb-1">
              <User className="h-4 w-4" />
              <span className="font-medium">{review.reviewer_name || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(review.created_date), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkHelpful}
            disabled={hasMarkedHelpful || markHelpfulMutation.isLoading}
            className={`flex items-center gap-2 ${
              hasMarkedHelpful 
                ? 'text-[var(--primary-orange)] pointer-events-none' 
                : 'hover:text-[var(--primary-orange)] hover:bg-orange-50'
            }`}
          >
            <ThumbsUp className={`h-4 w-4 ${hasMarkedHelpful ? 'fill-current' : ''}`} />
            <span className="font-medium">
              {hasMarkedHelpful ? 'Marked as Helpful' : 'Helpful'}
            </span>
            <span className="text-gray-500">({review.helpful_count || 0})</span>
          </Button>

          {hasMarkedHelpful && (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Thank you!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}