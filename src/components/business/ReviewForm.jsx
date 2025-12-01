import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useAchievements } from '../gamification/useAchievements';

export default function ReviewForm({ businessId, businessSlug, onSuccess }) {
  const [user, setUser] = useState(null);
  const { trackReview } = useAchievements(user);
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    reviewer_name: ''
  });
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me()
      .then((userData) => {
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          reviewer_name: userData.full_name || userData.email
        }));
      })
      .catch(() => setUser(null));
  }, []);

  const createReviewMutation = useMutation({
    mutationFn: (reviewData) => base44.entities.BusinessReview.create(reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries(['business-reviews', businessSlug]);
      queryClient.invalidateQueries(['business', businessSlug]);
      
      // Track review for gamification
      if (user) {
        trackReview();
      }
      
      if (onSuccess) onSuccess();
      
      setFormData({
        rating: 0,
        title: '',
        comment: '',
        reviewer_name: user?.full_name || user?.email || ''
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.rating === 0 || !formData.comment) {
      alert('Please provide a rating and comment');
      return;
    }

    createReviewMutation.mutate({
      business_id: businessId,
      business_slug: businessSlug,
      rating: formData.rating,
      title: formData.title,
      comment: formData.comment,
      reviewer_name: formData.reviewer_name || 'Anonymous',
      status: 'pending'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= formData.rating
                    ? 'text-[var(--primary-yellow)] fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Your Name</label>
        <Input
          value={formData.reviewer_name}
          onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
          placeholder="Your name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Review Title (Optional)</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Sum up your experience"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Your Review</label>
        <Textarea
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          placeholder="Share your experience..."
          rows={6}
        />
      </div>

      <Button
        type="submit"
        disabled={createReviewMutation.isPending}
        className="w-full bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white"
      >
        {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
      </Button>

      {createReviewMutation.isSuccess && (
        <p className="text-green-600 text-sm text-center">
          Review submitted! It will appear after moderation.
        </p>
      )}
    </form>
  );
}