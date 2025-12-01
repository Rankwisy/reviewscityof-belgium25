
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Star, CheckCircle, XCircle, AlertTriangle, ArrowLeft, User, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEO from '../components/SEO';
import ProtectedRoute from '../components/ProtectedRoute';

function AdminReviewsContent() {
  const [user, setUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((userData) => {
      // The ProtectedRoute already handles role checks and redirection for non-admins,
      // but we still need to set the user state for local use.
      setUser(userData);
    }).catch(() => {
      // Error fetching user data, ProtectedRoute should handle redirection.
      // Or in case of local error, just ensure user is null.
      setUser(null);
    });
  }, []);

  const { data: reviews = [] } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => base44.entities.BusinessReview.list('-created_date', 1000),
    // Ensure reviews are only fetched if user data is available
    enabled: !!user,
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BusinessReview.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-reviews']);
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id) => base44.entities.BusinessReview.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-reviews']);
    },
  });

  const handleApprove = (reviewId) => {
    updateReviewMutation.mutate({ id: reviewId, data: { status: 'approved' } });
  };

  const handleReject = (reviewId) => {
    updateReviewMutation.mutate({ id: reviewId, data: { status: 'rejected' } });
  };

  const handleDelete = (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
    const matchesRating = filterRating === 'all' || review.rating === Number(filterRating);
    return matchesStatus && matchesRating;
  });

  const pendingReviews = reviews.filter(r => r.status === 'pending');
  const approvedReviews = reviews.filter(r => r.status === 'approved');
  const rejectedReviews = reviews.filter(r => r.status === 'rejected');

  // Display a loading spinner if user data is still being fetched,
  // or if reviews are loading (though useQuery handles its own loading state)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-orange)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <SEO title="Manage Reviews - Admin" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to={createPageUrl('AdminDashboard')}>
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Manage Reviews</h1>
            <p className="text-gray-600 mt-1">{reviews.length} total reviews</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Reviews</span>
                <Star className="h-5 w-5 text-gray-400" />
              </div>
              <div className="text-3xl font-bold">{reviews.length}</div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Pending</span>
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-orange-600">{pendingReviews.length}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Approved</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600">{approvedReviews.length}</div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Rejected</span>
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-red-600">{rejectedReviews.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              All Reviews ({filteredReviews.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingReviews.length})
              {pendingReviews.length > 0 && (
                <Badge className="ml-2 bg-orange-500 text-white">{pendingReviews.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedReviews.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedReviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ReviewList reviews={filteredReviews} onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete} />
          </TabsContent>

          <TabsContent value="pending">
            <ReviewList reviews={pendingReviews} onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete} priority />
          </TabsContent>

          <TabsContent value="approved">
            <ReviewList reviews={approvedReviews} onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete} />
          </TabsContent>

          <TabsContent value="rejected">
            <ReviewList reviews={rejectedReviews} onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminReviews() {
  return (
    <ProtectedRoute roles={['admin']}>
      <AdminReviewsContent />
    </ProtectedRoute>
  );
}

function ReviewList({ reviews, onApprove, onReject, onDelete, priority }) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
          <p className="text-gray-600">Reviews will appear here when submitted</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className={priority && review.status === 'pending' ? 'border-orange-200 bg-orange-50' : ''}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {review.reviewer_name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.created_date).toLocaleString()}
                    </p>
                  </div>
                </div>

                <Link
                  to={createPageUrl('BusinessDetail') + '?slug=' + review.business_slug}
                  className="text-sm text-blue-600 hover:underline mb-2 block"
                >
                  View Business: {review.business_slug}
                </Link>

                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < review.rating
                          ? 'text-[var(--primary-yellow)] fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-semibold">{review.rating}/5</span>
                </div>

                {review.title && (
                  <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                )}

                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <Badge
                  className={
                    review.status === 'pending'
                      ? 'bg-orange-100 text-orange-800'
                      : review.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {review.status}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              {review.status !== 'approved' && (
                <Button
                  size="sm"
                  onClick={() => onApprove(review.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              )}
              {review.status !== 'rejected' && (
                <Button
                  size="sm"
                  onClick={() => onReject(review.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(review.id)}
                className="text-red-600 hover:bg-red-50"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
