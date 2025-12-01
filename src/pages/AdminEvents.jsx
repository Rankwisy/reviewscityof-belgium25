import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar, Edit, Trash2, ArrowLeft, Save, X, Plus, Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEO from '../components/SEO';
import ProtectedRoute from '../components/ProtectedRoute';
import MediaSelector from '../components/admin/MediaSelector';
import AIContentGenerator from '../components/admin/AIContentGenerator';

function AdminEventsContent() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((userData) => {
      setUser(userData);
    }).catch(() => {});
  }, []);

  const { data: events = [] } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => base44.entities.Event.list('-start_date', 1000),
    enabled: !!user,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['admin-cities'],
    queryFn: () => base44.entities.City.list('-name', 100),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Event.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-events']);
      setEditingEvent(null);
      setFormData({});
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Event.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-events']);
      setEditingEvent(null);
      setFormData({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Event.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-events']);
    },
  });

  const handleSave = () => {
    const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');
    const dataToSave = { ...formData, slug };

    if (editingEvent === 'new') {
      createMutation.mutate(dataToSave);
    } else {
      updateMutation.mutate({ id: editingEvent.id, data: dataToSave });
    }
  };

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ['Festival', 'Concert', 'Exhibition', 'Market', 'Sports', 'Food & Drink', 'Cultural', 'Nightlife', 'Workshop', 'Conference'];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-orange)]"></div>
      </div>
    );
  }

  if (editingEvent) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <SEO title={`${editingEvent === 'new' ? 'Add' : 'Edit'} Event - Admin`} />
        
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => {
                setEditingEvent(null);
                setFormData({});
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingEvent(null);
                  setFormData({});
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Event
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="basic" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Event Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter event name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <Select
                        value={formData.category || ''}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <Select
                        value={formData.city_slug || ''}
                        onValueChange={(value) => setFormData({ ...formData, city_slug: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map(city => (
                            <SelectItem key={city.id} value={city.slug}>{city.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Description</label>
                      <AIContentGenerator
                        type="description"
                        context={{
                          name: formData.name,
                          type: 'event',
                          category: formData.category,
                          city: formData.city_slug
                        }}
                        onAccept={(content) => setFormData({ ...formData, description: content })}
                        buttonText="Generate Description"
                      />
                    </div>
                    <Textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={6}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Date & Time</label>
                      <Input
                        type="datetime-local"
                        value={formData.start_date?.slice(0, 16) || ''}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">End Date & Time</label>
                      <Input
                        type="datetime-local"
                        value={formData.end_date?.slice(0, 16) || ''}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Location/Venue</label>
                      <Input
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Venue name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Address</label>
                      <Input
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Full address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Price</label>
                      <Input
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="e.g., €15 or 'Free'"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Website/Tickets URL</label>
                      <Input
                        value={formData.website || ''}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Image</label>
                    <MediaSelector
                      value={formData.image || ''}
                      onChange={(url) => setFormData({ ...formData, image: url })}
                      collection="events"
                    />
                    <p className="text-xs text-gray-500 mt-1">Main promotional image for the event</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Organizer</label>
                    <Input
                      value={formData.organizer || ''}
                      onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                      placeholder="Event organizer name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                    <Input
                      value={formData.tags?.join(', ') || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                      })}
                      placeholder="music, festival, outdoor"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">SEO Optimization</h4>
                      <p className="text-sm text-blue-700">Help people discover this event through search engines</p>
                    </div>
                    <AIContentGenerator
                      type="seo"
                      context={{
                        name: formData.name,
                        description: formData.description,
                        category: formData.category,
                        city: formData.city_slug,
                        entityType: 'event'
                      }}
                      onAccept={(seoData) => setFormData({ 
                        ...formData, 
                        seo_title: seoData.seo_title,
                        seo_description: seoData.seo_description,
                        seo_keywords: seoData.keywords
                      })}
                      buttonText="Generate SEO"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">SEO Title</label>
                    <Input
                      value={formData.seo_title || ''}
                      onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                      placeholder={`${formData.name || 'Event'} - ${formData.city_slug || 'Belgium'}`}
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.seo_title?.length || 0} / 60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">SEO Meta Description</label>
                    <Textarea
                      value={formData.seo_description || ''}
                      onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                      placeholder={`Join us for ${formData.name || 'this event'}...`}
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.seo_description?.length || 0} / 160 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">SEO Keywords</label>
                    <Input
                      value={formData.seo_keywords || ''}
                      onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                      placeholder={`${formData.category || 'event'}, ${formData.city_slug || 'belgium'}, things to do`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Open Graph Image</label>
                    <MediaSelector
                      value={formData.og_image || ''}
                      onChange={(url) => setFormData({ ...formData, og_image: url })}
                      collection="events"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Image for social media sharing (1200x630px recommended)
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured || false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="featured" className="text-sm font-medium cursor-pointer">
                      Feature on homepage
                    </label>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <SEO title="Manage Events - Admin" />

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to={createPageUrl('AdminDashboard')}>
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Manage Events</h1>
            <p className="text-gray-600 mt-1">{events.length} total events</p>
          </div>
          <Button
            onClick={() => {
              setEditingEvent('new');
              setFormData({
                name: '',
                slug: '',
                category: '',
                city_slug: '',
                description: '',
                start_date: '',
                location: '',
                featured: false,
                seo_title: '',
                seo_description: '',
                seo_keywords: '',
                og_image: ''
              });
            }}
            className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {event.image && (
                    <div className="w-48 h-32 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{event.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge>{event.category}</Badge>
                          <Badge variant="outline" className="capitalize">{event.city_slug}</Badge>
                          {event.featured && (
                            <Badge className="bg-[var(--primary-yellow)] text-gray-900">Featured</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span>📅 {new Date(event.start_date).toLocaleDateString()}</span>
                      <span>📍 {event.location}</span>
                      <span>💰 {event.price || 'Free'}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingEvent(event);
                          setFormData(event);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (window.confirm('Delete this event?')) {
                            deleteMutation.mutate(event.id);
                          }
                        }}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">Create your first event</p>
              <Button
                onClick={() => {
                  setEditingEvent('new');
                  setFormData({
                    name: '',
                    category: '',
                    city_slug: '',
                    description: '',
                    start_date: '',
                    location: '',
                    featured: false
                  });
                }}
                className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Event
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AdminEvents() {
  return (
    <ProtectedRoute requiredPermission="manage_events">
      <AdminEventsContent />
    </ProtectedRoute>
  );
}