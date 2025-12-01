import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Star, CheckCircle, AlertCircle } from 'lucide-react';
import RatingStars from './RatingStars';

export default function ReviewForm({ itemType, itemId, itemSlug, itemName, onSuccess }) {
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      return await base44.entities.Review.create(reviewData);
    },
    onSuccess: () => {
      setSuccess(true);
      setRating(0);
      setTitle('');
      setComment('');
      setVisitDate('');
      queryClient.invalidateQueries(['reviews', itemType, itemId]);
      queryClient.invalidateQueries([itemType, itemSlug]);
      
      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => setSuccess(false), 5000);
    },
    onError: (error) => {
      setError(error.message || 'Failed to submit review. Please try again.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a review');
      return;
    }

    const reviewData = {
      item_type: itemType,
      item_id: itemId,
      item_slug: itemSlug,
      item_name: itemName,
      rating,
      title: title.trim() || undefined,
      comment: comment.trim(),
      reviewer_name: user.full_name || user.email.split('@')[0],
      visit_date: visitDate || undefined
    };

    submitReviewMutation.mutate(reviewData);
  };

  if (!user) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-8 text-center">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Your Experience</h3>
          <p className="text-gray-600 mb-4">Sign in to leave a review</p>
          <Button 
            onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
            className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white"
          >
            Sign In to Review
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="pt-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Write a Review</h3>

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Thank you! Your review has been submitted successfully.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Your Rating *
            </label>
            <div className="flex items-center gap-4">
              <RatingStars
                rating={rating}
                size="xl"
                interactive
                onRatingChange={setRating}
              />
              {rating > 0 && (
                <span className="text-lg font-semibold text-gray-900">
                  {rating} {rating === 1 ? 'star' : 'stars'}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Review Title (Optional)
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Your Review *
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience... What did you like? What could be improved?"
              rows={6}
              maxLength={1000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/1000 characters
            </p>
          </div>

          {/* Visit Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Visit Date (Optional)
            </label>
            <Input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={submitReviewMutation.isPending}
              className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white"
            >
              {submitReviewMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
            {(rating > 0 || comment || title) && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRating(0);
                  setTitle('');
                  setComment('');
                  setVisitDate('');
                  setError('');
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}