import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Eye, Edit, Trash2, Search, Plus, ArrowLeft, Save, X,
  Grid3x3, List as ListIcon, Star, MapPin, Utensils, Hotel,
  Briefcase, Filter, Download, Upload, CheckSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEO from '../components/SEO';
import MediaSelector from '../components/admin/MediaSelector';
import AIContentGenerator from '../components/admin/AIContentGenerator'; // Added import
import ProtectedRoute from '../components/ProtectedRoute';

function AdminListingsContent() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('attractions');
  const [view, setView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((userData) => {
      setUser(userData);
    }).catch(() => {
      setUser(null);
    });
  }, []);

  const { data: cities = [] } = useQuery({
    queryKey: ['admin-cities'],
    queryFn: () => base44.entities.City.list('-name', 100),
    enabled: !!user,
  });

  const { data: attractions = [] } = useQuery({
    queryKey: ['admin-attractions'],
    queryFn: () => base44.entities.Attraction.list('-created_date', 1000),
    enabled: !!user,
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['admin-restaurants'],
    queryFn: () => base44.entities.Restaurant.list('-created_date', 1000),
    enabled: !!user,
  });

  const { data: hotels = [] } = useQuery({
    queryKey: ['admin-hotels'],
    queryFn: () => base44.entities.Hotel.list('-created_date', 1000),
    enabled: !!user,
  });

  const { data: businesses = [] } = useQuery({
    queryKey: ['admin-businesses'],
    queryFn: () => base44.entities.Business.list('-created_date', 1000),
    enabled: !!user,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => base44.entities.BusinessCategory.list('-order', 50),
    enabled: !!user && activeTab === 'businesses',
  });

  const createAttractionMutation = useMutation({
    mutationFn: (data) => base44.entities.Attraction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-attractions']);
      setEditingItem(null);
      setFormData({});
    },
  });

  const updateAttractionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Attraction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-attractions']);
      setEditingItem(null);
      setFormData({});
    },
  });

  const deleteAttractionMutation = useMutation({
    mutationFn: (id) => base44.entities.Attraction.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-attractions']);
    },
  });

  const createRestaurantMutation = useMutation({
    mutationFn: (data) => base44.entities.Restaurant.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-restaurants']);
      setEditingItem(null);
      setFormData({});
    },
  });

  const updateRestaurantMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Restaurant.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-restaurants']);
      setEditingItem(null);
      setFormData({});
    },
  });

  const deleteRestaurantMutation = useMutation({
    mutationFn: (id) => base44.entities.Restaurant.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-restaurants']);
    },
  });

  const createHotelMutation = useMutation({
    mutationFn: (data) => base44.entities.Hotel.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-hotels']);
      setEditingItem(null);
      setFormData({});
    },
  });

  const updateHotelMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Hotel.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-hotels']);
      setEditingItem(null);
      setFormData({});
    },
  });

  const deleteHotelMutation = useMutation({
    mutationFn: (id) => base44.entities.Hotel.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-hotels']);
    },
  });

  const createBusinessMutation = useMutation({
    mutationFn: (data) => base44.entities.Business.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-businesses']);
      setEditingItem(null);
      setFormData({});
    },
  });

  const updateBusinessMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Business.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-businesses']);
      setEditingItem(null);
      setFormData({});
    },
  });

  const deleteBusinessMutation = useMutation({
    mutationFn: (id) => base44.entities.Business.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-businesses']);
    },
  });

  const handleSave = () => {
    const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');
    const dataToSave = { ...formData, slug };

    if (editingItem === 'new') {
      if (activeTab === 'attractions') {
        createAttractionMutation.mutate(dataToSave);
      } else if (activeTab === 'restaurants') {
        createRestaurantMutation.mutate(dataToSave);
      } else if (activeTab === 'hotels') {
        createHotelMutation.mutate(dataToSave);
      } else if (activeTab === 'businesses') {
        createBusinessMutation.mutate(dataToSave);
      }
    } else {
      if (activeTab === 'attractions') {
        updateAttractionMutation.mutate({ id: editingItem.id, data: dataToSave });
      } else if (activeTab === 'restaurants') {
        updateRestaurantMutation.mutate({ id: editingItem.id, data: dataToSave });
      } else if (activeTab === 'hotels') {
        updateHotelMutation.mutate({ id: editingItem.id, data: dataToSave });
      } else if (activeTab === 'businesses') {
        updateBusinessMutation.mutate({ id: editingItem.id, data: dataToSave });
      }
    }
  };

  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      if (activeTab === 'attractions') {
        deleteAttractionMutation.mutate(item.id);
      } else if (activeTab === 'restaurants') {
        deleteRestaurantMutation.mutate(item.id);
      } else if (activeTab === 'hotels') {
        deleteHotelMutation.mutate(item.id);
      } else if (activeTab === 'businesses') {
        deleteBusinessMutation.mutate(item.id);
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
  };

  const handleNew = () => {
    setEditingItem('new');
    const baseData = {
      name: '',
      slug: '',
      city_slug: '',
      short_description: '',
      full_description: '',
      address: '',
      phone: '',
      website: '',
      featured: false,
      images: [],
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
      og_image: ''
    };

    if (activeTab === 'attractions') {
      setFormData({
        ...baseData,
        category: '',
        price_range: '€€',
        rating: 0,
        opening_hours: '',
        duration: ''
      });
    } else if (activeTab === 'restaurants') {
      setFormData({
        ...baseData,
        cuisine_type: '',
        price_range: '€€',
        rating: 0,
        opening_hours: '',
        specialty: ''
      });
    } else if (activeTab === 'hotels') {
      setFormData({
        ...baseData,
        type: 'Hotel',
        price_range: '€€',
        star_rating: 3,
        rating: 0,
        amenities: []
      });
    } else if (activeTab === 'businesses') {
      setFormData({
        ...baseData,
        category_slug: '',
        description: '',
        services: [],
        verified: false
      });
    }
  };

  const toggleSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedItems.length} selected items?`)) {
      selectedItems.forEach(id => {
        if (activeTab === 'attractions') {
          deleteAttractionMutation.mutate(id);
        } else if (activeTab === 'restaurants') {
          deleteRestaurantMutation.mutate(id);
        } else if (activeTab === 'hotels') {
          deleteHotelMutation.mutate(id);
        } else if (activeTab === 'businesses') {
          deleteBusinessMutation.mutate(id);
        }
      });
      setSelectedItems([]);
    }
  };

  const getCurrentItems = () => {
    let items = [];
    if (activeTab === 'attractions') items = attractions;
    else if (activeTab === 'restaurants') items = restaurants;
    else if (activeTab === 'hotels') items = hotels;
    else if (activeTab === 'businesses') items = businesses;

    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = cityFilter === 'all' || item.city_slug === cityFilter;
      return matchesSearch && matchesCity;
    });
  };

  const filteredItems = getCurrentItems();

  const getMediaCollection = () => {
    if (activeTab === 'attractions') return 'attractions';
    if (activeTab === 'restaurants') return 'restaurants';
    if (activeTab === 'hotels') return 'hotels';
    if (activeTab === 'businesses') return 'businesses';
    return 'uncategorized';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-orange)]"></div>
      </div>
    );
  }

  if (editingItem) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <SEO title={`${editingItem === 'new' ? 'Add' : 'Edit'} ${activeTab.slice(0, -1)} - Admin`} />
        
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => {
                setEditingItem(null);
                setFormData({});
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Listings
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingItem(null);
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
                Save
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingItem === 'new' ? `Add New ${activeTab.slice(0, -1)}` : `Edit: ${formData.name}`}
              </h2>

              <Tabs defaultValue="basic" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger> {/* New tab trigger */}
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      URL Slug <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="auto-generated if left empty"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
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

                  {activeTab === 'attractions' && (
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
                          <SelectItem value="Museums & Galleries">Museums & Galleries</SelectItem>
                          <SelectItem value="Historical Sites">Historical Sites</SelectItem>
                          <SelectItem value="Parks & Nature">Parks & Nature</SelectItem>
                          <SelectItem value="Nightlife & Entertainment">Nightlife & Entertainment</SelectItem>
                          <SelectItem value="Tours & Experiences">Tours & Experiences</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {activeTab === 'restaurants' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Cuisine Type</label>
                      <Input
                        value={formData.cuisine_type || ''}
                        onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
                        placeholder="e.g., Belgian, French, Italian"
                      />
                    </div>
                  )}

                  {activeTab === 'hotels' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Hotel Type</label>
                      <Select
                        value={formData.type || ''}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hotel">Hotel</SelectItem>
                          <SelectItem value="Bed & Breakfast">Bed & Breakfast</SelectItem>
                          <SelectItem value="Hostel">Hostel</SelectItem>
                          <SelectItem value="Vacation Rental">Vacation Rental</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {activeTab === 'businesses' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <Select
                        value={formData.category_slug || ''}
                        onValueChange={(value) => setFormData({ ...formData, category_slug: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Short Description</label>
                      <AIContentGenerator
                        type="short_description"
                        context={{
                          name: formData.name,
                          type: activeTab.slice(0, -1),
                          category: formData.category || formData.cuisine_type || formData.type || (activeTab === 'businesses' ? categories.find(c => c.slug === formData.category_slug)?.name : ''),
                          city: formData.city_slug,
                          services: activeTab === 'businesses' ? formData.services : undefined,
                          specialty: activeTab === 'restaurants' ? formData.specialty : undefined
                        }}
                        onAccept={(content) => setFormData({ ...formData, short_description: content })}
                        buttonText="Generate"
                      />
                    </div>
                    <Textarea
                      value={formData.short_description || ''}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      placeholder="Brief description (200 characters)"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.short_description?.length || 0} / 200 characters
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Full Description</label>
                      <AIContentGenerator
                        type="description"
                        context={{
                          name: formData.name,
                          type: activeTab.slice(0, -1),
                          category: formData.category || formData.cuisine_type || formData.type || (activeTab === 'businesses' ? categories.find(c => c.slug === formData.category_slug)?.name : ''),
                          city: formData.city_slug,
                          services: activeTab === 'businesses' ? formData.services : undefined,
                          specialty: activeTab === 'restaurants' ? formData.specialty : undefined,
                          address: formData.address,
                          phone: formData.phone
                        }}
                        onAccept={(content) => setFormData({ ...formData, full_description: content, description: content })}
                        buttonText="Generate Full Description"
                      />
                    </div>
                    <Textarea
                      value={formData.full_description || formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, full_description: e.target.value, description: e.target.value })}
                      placeholder="Detailed description"
                      rows={8}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Address</label>
                      <Input
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Street address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <Input
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+32 2 XXX XX XX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Website</label>
                      <Input
                        value={formData.website || ''}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Price Range</label>
                      <Select
                        value={formData.price_range || '€€'}
                        onValueChange={(value) => setFormData({ ...formData, price_range: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="€">€ - Budget</SelectItem>
                          <SelectItem value="€€">€€ - Moderate</SelectItem>
                          <SelectItem value="€€€">€€€ - Upscale</SelectItem>
                          <SelectItem value="€€€€">€€€€ - Luxury</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(activeTab === 'attractions' || activeTab === 'restaurants') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Opening Hours</label>
                      <Textarea
                        value={formData.opening_hours || ''}
                        onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                        placeholder="Mon-Fri: 9:00-18:00, Sat-Sun: 10:00-17:00"
                        rows={3}
                      />
                    </div>
                  )}

                  {activeTab === 'attractions' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Duration</label>
                        <Input
                          value={formData.duration || ''}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          placeholder="e.g., 2 hours"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Ticket Price</label>
                        <Input
                          value={formData.ticket_price || ''}
                          onChange={(e) => setFormData({ ...formData, ticket_price: e.target.value })}
                          placeholder="e.g., Adults: €15, Children: €8"
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'restaurants' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Specialty</label>
                      <Input
                        value={formData.specialty || ''}
                        onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                        placeholder="Signature dishes or specialties"
                      />
                    </div>
                  )}

                  {activeTab === 'hotels' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Star Rating</label>
                      <Select
                        value={String(formData.star_rating || 3)}
                        onValueChange={(value) => setFormData({ ...formData, star_rating: Number(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Star</SelectItem>
                          <SelectItem value="2">2 Stars</SelectItem>
                          <SelectItem value="3">3 Stars</SelectItem>
                          <SelectItem value="4">4 Stars</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {activeTab === 'businesses' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Services Offered</label>
                      <Input
                        value={formData.services?.join(', ') || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          services: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        })}
                        placeholder="e.g., Oil Change, Tire Replacement, Brake Service"
                      />
                      <p className="text-xs text-gray-500 mt-1">Comma-separated list of services</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Images</label>
                    <p className="text-xs text-gray-500 mb-3">
                      Select images from the media library or upload new ones. Drag to reorder.
                    </p>
                    
                    <MediaSelector
                      value={formData.images || []}
                      onChange={(urls) => setFormData({ ...formData, images: urls })}
                      multiple={true}
                      collection={getMediaCollection()}
                    />

                    <p className="text-xs text-gray-500 mt-2">
                      {formData.images?.length || 0} image(s) selected
                    </p>
                  </div>

                  {formData.images && formData.images.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Preview</label>
                      <div className="grid grid-cols-3 gap-4">
                        {formData.images.map((url, index) => (
                          <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
                            <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Badge className="bg-white text-gray-900">Image {index + 1}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* New SEO Tab Content */}
                <TabsContent value="seo" className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">SEO Optimization</h4>
                      <p className="text-sm text-blue-700">Improve search visibility for this listing</p>
                    </div>
                    <AIContentGenerator
                      type="seo"
                      context={{
                        name: formData.name,
                        description: formData.short_description || formData.full_description || formData.description,
                        category: formData.category || formData.cuisine_type || formData.type || (activeTab === 'businesses' ? categories.find(c => c.slug === formData.category_slug)?.name : ''),
                        city: formData.city_slug,
                        entityType: activeTab.slice(0, -1),
                        services: activeTab === 'businesses' ? formData.services : undefined,
                        specialty: activeTab === 'restaurants' ? formData.specialty : undefined,
                        priceRange: formData.price_range
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
                      placeholder={`${formData.name || 'Listing'} - ${formData.city_slug || 'Belgium'}`}
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
                      placeholder={`Discover ${formData.name || 'this amazing place'}...`}
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
                      placeholder={`${formData.name || 'attraction'}, ${formData.city_slug || 'belgium'}, ${formData.category || 'tourism'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Open Graph Image</label>
                    <MediaSelector
                      value={formData.og_image || ''}
                      onChange={(url) => setFormData({ ...formData, og_image: url })}
                      collection={getMediaCollection()}
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

                  {activeTab === 'businesses' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="verified"
                        checked={formData.verified || false}
                        onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label htmlFor="verified" className="text-sm font-medium cursor-pointer">
                        Verified business
                      </label>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Rating (0-5)</label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating || 0}
                      onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    />
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
      <SEO title="Manage Listings - Admin" />

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
            <h1 className="text-4xl font-bold text-gray-900">Manage Listings</h1>
          </div>
          <Button
            onClick={handleNew}
            className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="attractions" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Attractions ({attractions.length})
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Restaurants ({restaurants.length})
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center gap-2">
              <Hotel className="h-4 w-4" />
              Hotels ({hotels.length})
            </TabsTrigger>
            <TabsTrigger value="businesses" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Businesses ({businesses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="pl-10"
                    />
                  </div>
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city.id} value={city.slug}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      variant={view === 'grid' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setView('grid')}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={view === 'list' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setView('list')}
                    >
                      <ListIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {selectedItems.length > 0 && (
                  <div className="mt-4 flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">{selectedItems.length} items selected</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedItems([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Listings */}
            {filteredItems.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  {activeTab === 'attractions' && <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
                  {activeTab === 'restaurants' && <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
                  {activeTab === 'hotels' && <Hotel className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
                  {activeTab === 'businesses' && <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No {activeTab} found</h3>
                  <p className="text-gray-600 mb-4">Start by adding your first {activeTab.slice(0, -1)}</p>
                  <Button
                    onClick={handleNew}
                    className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1, -1)}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              view === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelection(item.id)}
                          className="absolute top-3 left-3 w-5 h-5 z-10"
                        />
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              {activeTab === 'attractions' && <Eye className="h-16 w-16 text-gray-400" />}
                              {activeTab === 'restaurants' && <Utensils className="h-16 w-16 text-gray-400" />}
                              {activeTab === 'hotels' && <Hotel className="h-16 w-16 text-gray-400" />}
                              {activeTab === 'businesses' && <Briefcase className="h-16 w-16 text-gray-400" />}
                            </div>
                          )}
                          {item.featured && (
                            <Badge className="absolute top-3 right-3 bg-[var(--primary-yellow)] text-gray-900">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span className="capitalize">{item.city_slug}</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2 line-clamp-1">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {item.short_description || item.description}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const pageMap = {
                                'attractions': 'AttractionDetail',
                                'restaurants': 'CityDetail', // Restaurants usually have their own detail page
                                'hotels': 'CityDetail', // Hotels usually have their own detail page
                                'businesses': 'BusinessDetail'
                              };
                              const pageKey = pageMap[activeTab];
                              if (pageKey) {
                                window.open(createPageUrl(pageKey) + '?slug=' + item.slug, '_blank');
                              } else {
                                // Fallback for types not explicitly mapped, or handle this case
                                console.warn(`No specific page map for ${activeTab}`);
                              }
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="p-4 w-12">
                              <input
                                type="checkbox"
                                checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItems(filteredItems.map(i => i.id));
                                  } else {
                                    setSelectedItems([]);
                                  }
                                }}
                                className="w-4 h-4"
                              />
                            </th>
                            <th className="text-left p-4 text-sm font-semibold">Name</th>
                            <th className="text-left p-4 text-sm font-semibold">City</th>
                            <th className="text-center p-4 text-sm font-semibold">Rating</th>
                            <th className="text-center p-4 text-sm font-semibold">Featured</th>
                            <th className="text-right p-4 text-sm font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredItems.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                              <td className="p-4">
                                <input
                                  type="checkbox"
                                  checked={selectedItems.includes(item.id)}
                                  onChange={() => toggleSelection(item.id)}
                                  className="w-4 h-4"
                                />
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                    {item.images && item.images.length > 0 ? (
                                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                    ) : item.image ? (
                                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        {activeTab === 'attractions' && <Eye className="h-6 w-6 text-gray-400" />}
                                        {activeTab === 'restaurants' && <Utensils className="h-6 w-6 text-gray-400" />}
                                        {activeTab === 'hotels' && <Hotel className="h-6 w-6 text-gray-400" />}
                                        {activeTab === 'businesses' && <Briefcase className="h-6 w-6 text-gray-400" />}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.slug}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-sm capitalize">{item.city_slug}</td>
                              <td className="p-4 text-center">
                                {item.rating && (
                                  <div className="flex items-center justify-center gap-1">
                                    <Star className="h-4 w-4 text-[var(--primary-yellow)] fill-current" />
                                    <span className="text-sm font-semibold">{item.rating}</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                {item.featured && (
                                  <Badge className="bg-[var(--primary-yellow)] text-gray-900">Yes</Badge>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(item)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDelete(item)}
                                    className="text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminListings() {
  return (
    <ProtectedRoute requiredPermission="manage_listings">
      <AdminListingsContent />
    </ProtectedRoute>
  );
}