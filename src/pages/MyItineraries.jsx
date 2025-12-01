
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Calendar, Plus, MapPin, Trash2, Edit, Eye, Share2, Globe, Lock, ArrowLeft } from 'lucide-react'; // Updated imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import SEO from '../components/SEO';
import { useAchievements } from '../components/gamification/useAchievements'; // Updated import path
import { Badge } from '@/components/ui/badge'; // Added Badge import

export default function MyItineraries() {
  const [user, setUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { trackItineraryCreation } = useAchievements(user); // Moved useAchievements here

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => {
        // Redirect to login, then come back to MyItineraries
        base44.auth.redirectToLogin(createPageUrl('MyItineraries')); // Updated redirectToLogin URL
      });
  }, []);

  const { data: itineraries = [], isLoading } = useQuery({
    queryKey: ['itineraries'],
    queryFn: () => base44.entities.Itinerary.list('-created_date', 100),
    enabled: !!user, // Only fetch if user is loaded
  });

  const createItineraryMutation = useMutation({ // New mutation for creating itinerary, handled in MyItineraries
    mutationFn: (data) => base44.entities.Itinerary.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
      // Track itinerary creation for gamification
      if (user) {
        trackItineraryCreation();
      }
      setDialogOpen(false); // Close dialog on success
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Itinerary.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
    },
  });

  if (isLoading || !user) { // Combined initial loading check for user and itineraries
    return (
      <div className="flex items-center justify-center py-20">
        {/* Generic spinner using SVG, as Loader2 was removed from lucide-react imports in outline */}
        <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-[var(--belgian-red)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <SEO
        title="My Travel Itineraries"
        description="Create and manage your personalized Belgium travel itineraries"
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-10 w-10 text-[var(--belgian-red)]" />
              <h1 className="text-4xl font-bold text-gray-900">My Itineraries</h1>
            </div>
            <p className="text-xl text-gray-600">
              Plan and organize your perfect Belgium trip
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[var(--belgian-red)] hover:bg-[#c00510]">
                <Plus className="h-5 w-5 mr-2" />
                New Itinerary
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Itinerary</DialogTitle>
              </DialogHeader>
              <CreateItineraryForm
                onCreateItinerary={createItineraryMutation.mutate} // Pass mutation function
                isCreating={createItineraryMutation.isPending} // Pass pending state
              />
            </DialogContent>
          </Dialog>
        </div>

        {itineraries.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No itineraries yet</h2>
            <p className="text-gray-600 mb-6">Create your first itinerary to start planning your trip</p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[var(--belgian-red)] hover:bg-[#c00510]">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Itinerary
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Itinerary</DialogTitle>
                </DialogHeader>
                <CreateItineraryForm
                  onCreateItinerary={createItineraryMutation.mutate}
                  isCreating={createItineraryMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((itinerary) => (
              <Card key={itinerary.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <img
                    src={itinerary.image || 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800&q=80'}
                    alt={itinerary.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Added badge for public/private status */}
                  {itinerary.is_public !== undefined && (
                    <Badge
                      className="absolute top-3 right-3 text-white"
                      style={{ backgroundColor: itinerary.is_public ? 'var(--belgian-red)' : 'var(--dark-gray)' }}
                    >
                      {itinerary.is_public ? (
                        <>
                          <Globe className="h-3 w-3 mr-1" /> Public
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3 mr-1" /> Private
                        </>
                      )}
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="line-clamp-2">{itinerary.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {itinerary.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{itinerary.description}</p>
                  )}

                  {itinerary.start_date && itinerary.end_date && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(new Date(itinerary.start_date), 'MMM d')} - {format(new Date(itinerary.end_date), 'MMM d, yyyy')}
                    </div>
                  )}

                  {itinerary.cities && itinerary.cities.length > 0 && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      {itinerary.cities.join(', ')}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Link to={createPageUrl('ItineraryDetail') + '?id=' + itinerary.id} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        View & Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this itinerary?')) {
                          deleteMutation.mutate(itinerary.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CreateItineraryForm({ onCreateItinerary, isCreating }) { // Changed props: accepts mutation function and its loading state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateItinerary({ // Call the prop function to create itinerary
      ...formData,
      days: [],
      cities: []
    });
    // Reset form after submission (MyItineraries handles closing dialog)
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Title *</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Belgium Adventure 2025"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your trip..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Start Date</label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">End Date</label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-[var(--belgian-red)] hover:bg-[#c00510]"
        disabled={isCreating} // Use isCreating prop for disabled state
      >
        {isCreating ? (
          <>
            {/* Generic spinner using SVG */}
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating...
          </>
        ) : (
          'Create Itinerary'
        )}
      </Button>
    </form>
  );
}
