import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin, Search, Plus, Edit, Trash2, Eye, Star,
  ArrowLeft, Save, X, Grid3x3, List as ListIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEO from '../components/SEO';
import ProtectedRoute from '../components/ProtectedRoute';
import MediaSelector from '../components/admin/MediaSelector';
import AIContentGenerator from '../components/admin/AIContentGenerator';
import { requireAdminAuth } from '@/functions/customAdminAuth';

function AdminCitiesContent() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCity, setEditingCity] = useState(null);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (!requireAdminAuth(navigate)) {
      return;
    }
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, [navigate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    if (action === 'new') {
      setEditingCity('new');
      setFormData({
        name: '',
        slug: '',
        tagline: '',
        description: '',
        population: '',
        languages: '',
        best_time_to_visit: '',
        getting_there: '',
        getting_around: '',
        practical_tips: '',
        hero_image: '',
        thumbnail_image: '',
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
        og_image: '',
        featured: false
      });
    }
  }, []);

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['admin-cities'],
    queryFn: () => base44.entities.City.list('-created_date', 100),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (cityData) => base44.entities.City.create(cityData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-cities']);
      setEditingCity(null);
      setFormData({});
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.City.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-cities']);
      setEditingCity(null);
      setFormData({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.City.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-cities']);
    },
  });

  const handleSave = () => {
    const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');
    const dataToSave = { ...formData, slug };

    if (editingCity === 'new') {
      createMutation.mutate(dataToSave);
    } else {
      updateMutation.mutate({ id: editingCity.id, data: dataToSave });
    }
  };

  const handleEdit = (city) => {
    setEditingCity(city);
    setFormData(city);
  };

  const handleDelete = (cityId) => {
    if (window.confirm('Are you sure you want to delete this city?')) {
      deleteMutation.mutate(cityId);
    }
  };

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.tagline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (editingCity) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <SEO title={`${editingCity === 'new' ? 'Add New' : 'Edit'} City - Admin`} />
        
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => {
                setEditingCity(null);
                setFormData({});
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cities
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingCity(null);
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
                Save City
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingCity === 'new' ? 'Add New City' : `Edit: ${formData.name}`}
              </h2>

              <Tabs defaultValue="basic" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  {/* Basic Information */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Brussels"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      URL Slug <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="e.g., brussels (auto-generated if left empty)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      URL: cityreview.be/cities/{formData.slug || formData.name?.toLowerCase().replace(/\s+/g, '-')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tagline <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.tagline || ''}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="e.g., Heart of Europe"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <AIContentGenerator
                        type="description"
                        context={{
                          name: formData.name,
                          type: 'city',
                          city: formData.name
                        }}
                        onAccept={(content) => setFormData({ ...formData, description: content })}
                        buttonText="Generate Description"
                      />
                    </div>
                    <Textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed description of the city..."
                      rows={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.description?.length || 0} characters
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  {/* Additional Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Population</label>
                      <Input
                        value={formData.population || ''}
                        onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                        placeholder="e.g., 1.2 million"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Languages</label>
                      <Input
                        value={formData.languages || ''}
                        onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                        placeholder="e.g., Dutch, French"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Best Time to Visit</label>
                      <Input
                        value={formData.best_time_to_visit || ''}
                        onChange={(e) => setFormData({ ...formData, best_time_to_visit: e.target.value })}
                        placeholder="e.g., Spring to Fall"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Getting There</label>
                    <Textarea
                      value={formData.getting_there || ''}
                      onChange={(e) => setFormData({ ...formData, getting_there: e.target.value })}
                      placeholder="Information about how to get to the city..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Getting Around</label>
                    <Textarea
                      value={formData.getting_around || ''}
                      onChange={(e) => setFormData({ ...formData, getting_around: e.target.value })}
                      placeholder="Information about public transport, walking, etc..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Practical Tips</label>
                    <Textarea
                      value={formData.practical_tips || ''}
                      onChange={(e) => setFormData({ ...formData, practical_tips: e.target.value })}
                      placeholder="Tips on currency, tipping, safety, etc..."
                      rows={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Hero Image</label>
                    <MediaSelector
                      value={formData.hero_image || ''}
                      onChange={(url) => setFormData({ ...formData, hero_image: url })}
                      collection="cities"
                    />
                    <p className="text-xs text-gray-500 mt-1">Large banner image for the city page</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Thumbnail Image</label>
                    <MediaSelector
                      value={formData.thumbnail_image || ''}
                      onChange={(url) => setFormData({ ...formData, thumbnail_image: url })}
                      collection="cities"
                    />
                    <p className="text-xs text-gray-500 mt-1">Card/preview image for listings</p>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">SEO Settings</h4>
                      <p className="text-sm text-blue-700">Optimize this city page for search engines. If left empty, default values will be generated automatically.</p>
                    </div>
                    <AIContentGenerator
                      type="seo"
                      context={{
                        name: formData.name,
                        description: formData.description,
                        entityType: 'city'
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
                      placeholder={`${formData.name || 'City'} - ${formData.tagline || 'Belgium'}`}
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.seo_title?.length || 0} / 60 characters (optimal: 50-60)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">SEO Meta Description</label>
                    <Textarea
                      value={formData.seo_description || ''}
                      onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                      placeholder={`Discover ${formData.name || 'this Belgian city'}. ${formData.description?.substring(0, 100) || 'Explore attractions, restaurants, and hotels.'}`}
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.seo_description?.length || 0} / 160 characters (optimal: 150-160)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">SEO Keywords</label>
                    <Input
                      value={formData.seo_keywords || ''}
                      onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                      placeholder={`${formData.name || 'city'}, Belgium, travel, tourism, attractions, restaurants`}
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Open Graph Image</label>
                    <MediaSelector
                      value={formData.og_image || ''}
                      onChange={(url) => setFormData({ ...formData, og_image: url })}
                      collection="cities"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Used when sharing on social media (1200x630px recommended). If empty, uses hero image.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  {/* Settings */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured || false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="featured" className="text-sm font-medium cursor-pointer">
                      Feature this city on homepage
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
      <SEO title="Manage Cities - Admin" />

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
            <h1 className="text-4xl font-bold text-gray-900">Manage Cities</h1>
            <p className="text-gray-600 mt-1">{cities.length} total cities</p>
          </div>
          <Button
            onClick={() => {
              setEditingCity('new');
              setFormData({
                name: '',
                slug: '',
                tagline: '',
                description: '',
                population: '',
                languages: '',
                best_time_to_visit: '',
                getting_there: '',
                getting_around: '',
                practical_tips: '',
                hero_image: '',
                thumbnail_image: '',
                seo_title: '',
                seo_description: '',
                seo_keywords: '',
                og_image: '',
                featured: false
              });
            }}
            className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New City
          </Button>
        </div>

        {/* Search & Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cities..."
                  className="pl-10"
                />
              </div>
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
          </CardContent>
        </Card>

        {/* Cities Grid/List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-orange)] mx-auto"></div>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCities.map((city) => (
              <Card key={city.id} className="hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  {city.thumbnail_image || city.hero_image ? (
                    <img
                      src={city.thumbnail_image || city.hero_image}
                      alt={city.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <MapPin className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  {city.featured && (
                    <Badge className="absolute top-3 right-3 bg-[var(--primary-yellow)] text-gray-900">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold mb-2">{city.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{city.tagline}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(city)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(createPageUrl('CityDetail') + '?city=' + city.slug, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(city.id)}
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
                      <th className="text-left p-4 text-sm font-semibold">City</th>
                      <th className="text-left p-4 text-sm font-semibold">Tagline</th>
                      <th className="text-center p-4 text-sm font-semibold">Featured</th>
                      <th className="text-right p-4 text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCities.map((city) => (
                      <tr key={city.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                              {city.thumbnail_image ? (
                                <img src={city.thumbnail_image} alt={city.name} className="w-full h-full object-cover" />
                              ) : (
                                <MapPin className="w-full h-full p-2 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">{city.name}</p>
                              <p className="text-xs text-gray-500">{city.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{city.tagline}</td>
                        <td className="p-4 text-center">
                          {city.featured && <Badge className="bg-[var(--primary-yellow)] text-gray-900">Yes</Badge>}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(city)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(createPageUrl('CityDetail') + '?city=' + city.slug, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(city.id)}
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
        )}

        {filteredCities.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No cities found</h3>
              <p className="text-gray-600 mb-4">Start by adding your first city</p>
              <Button
                onClick={() => {
                  setEditingCity('new');
                  setFormData({
                    name: '',
                    slug: '',
                    tagline: '',
                    description: '',
                    population: '',
                    languages: '',
                    best_time_to_visit: '',
                    getting_there: '',
                    getting_around: '',
                    practical_tips: '',
                    hero_image: '',
                    thumbnail_image: '',
                    seo_title: '',
                    seo_description: '',
                    seo_keywords: '',
                    og_image: '',
                    featured: false
                  });
                }}
                className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First City
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AdminCities() {
  return (
    <ProtectedRoute requiredPermission="manage_cities">
      <AdminCitiesContent />
    </ProtectedRoute>
  );
}