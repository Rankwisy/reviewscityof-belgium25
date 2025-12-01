import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Upload, Image as ImageIcon, Search, Grid3x3, List as ListIcon,
  Trash2, Edit, Copy, Check, ArrowLeft, X, Save, Filter, Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEO from '../components/SEO';

export default function AdminMedia() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [selectedImages, setSelectedImages] = useState([]);
  const [editingImage, setEditingImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((userData) => {
      if (userData.role !== 'admin') {
        window.location.href = createPageUrl('Home');
      }
      setUser(userData);
    }).catch(() => {
      window.location.href = createPageUrl('Home');
    });
  }, []);

  const { data: cities = [] } = useQuery({
    queryKey: ['admin-cities'],
    queryFn: () => base44.entities.City.list('-name', 100),
    enabled: !!user,
  });

  const { data: mediaFiles = [], isLoading } = useQuery({
    queryKey: ['media-files'],
    queryFn: () => base44.entities.MediaFile.list('-created_date', 1000),
    enabled: !!user,
  });

  const createMediaMutation = useMutation({
    mutationFn: (data) => base44.entities.MediaFile.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['media-files']);
    },
  });

  const updateMediaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MediaFile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['media-files']);
      setEditingImage(null);
    },
  });

  const deleteMediaMutation = useMutation({
    mutationFn: (id) => base44.entities.MediaFile.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['media-files']);
    },
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(files.map((f, i) => ({ name: f.name, progress: 0, status: 'uploading' })));

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Upload file using Core.UploadFile integration
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        // Get image dimensions
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = file_url;
        });

        // Save to database
        await createMediaMutation.mutateAsync({
          file_name: file.name,
          file_url: file_url,
          file_size: file.size,
          width: img.width,
          height: img.height,
          mime_type: file.type,
          collection: 'uncategorized',
          tags: []
        });

        setUploadProgress(prev => prev.map((p, idx) => 
          idx === i ? { ...p, progress: 100, status: 'complete' } : p
        ));
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadProgress(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: 'error' } : p
        ));
      }
    }

    setUploading(false);
    setTimeout(() => setUploadProgress([]), 3000);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedImages.length} selected images?`)) {
      selectedImages.forEach(id => {
        deleteMediaMutation.mutate(id);
      });
      setSelectedImages([]);
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filteredMedia = mediaFiles.filter(media => {
    const matchesSearch = media.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         media.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCollection = collectionFilter === 'all' || media.collection === collectionFilter;
    return matchesSearch && matchesCollection;
  });

  const collections = ['uncategorized', 'cities', 'attractions', 'restaurants', 'hotels', 'businesses', 'events', 'blog'];

  const totalSize = mediaFiles.reduce((sum, file) => sum + (file.file_size || 0), 0);
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-orange)]"></div>
      </div>
    );
  }

  if (editingImage) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <SEO title="Edit Media - Admin" />
        
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => setEditingImage(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Library
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingImage(null)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={() => {
                  updateMediaMutation.mutate({
                    id: editingImage.id,
                    data: editingImage
                  });
                }}
                className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image Preview */}
                <div>
                  <img
                    src={editingImage.file_url}
                    alt={editingImage.alt_text || editingImage.file_name}
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Dimensions:</strong> {editingImage.width} × {editingImage.height}px</p>
                    <p><strong>Size:</strong> {formatBytes(editingImage.file_size)}</p>
                    <p><strong>Type:</strong> {editingImage.mime_type}</p>
                    <div className="pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyUrl(editingImage.file_url)}
                        className="w-full"
                      >
                        {copiedUrl === editingImage.file_url ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy URL
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      value={editingImage.title || ''}
                      onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                      placeholder="Image title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Alt Text</label>
                    <Input
                      value={editingImage.alt_text || ''}
                      onChange={(e) => setEditingImage({ ...editingImage, alt_text: e.target.value })}
                      placeholder="Describe the image for accessibility"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      value={editingImage.description || ''}
                      onChange={(e) => setEditingImage({ ...editingImage, description: e.target.value })}
                      placeholder="Longer description"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Collection</label>
                    <Select
                      value={editingImage.collection}
                      onValueChange={(value) => setEditingImage({ ...editingImage, collection: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {collections.map(col => (
                          <SelectItem key={col} value={col} className="capitalize">
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">City (optional)</label>
                    <Select
                      value={editingImage.city_slug || ''}
                      onValueChange={(value) => setEditingImage({ ...editingImage, city_slug: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>None</SelectItem>
                        {cities.map(city => (
                          <SelectItem key={city.id} value={city.slug}>{city.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                    <Input
                      value={editingImage.tags?.join(', ') || ''}
                      onChange={(e) => setEditingImage({ 
                        ...editingImage, 
                        tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                      })}
                      placeholder="belgium, architecture, landmark"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <SEO title="Media Library - Admin" />

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
            <h1 className="text-4xl font-bold text-gray-900">Media Library</h1>
            <p className="text-gray-600 mt-1">
              {mediaFiles.length} files · {formatBytes(totalSize)} total
            </p>
          </div>
          <div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                as="span"
                className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white cursor-pointer"
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Images'}
              </Button>
            </label>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Upload Progress</h3>
              <div className="space-y-2">
                {uploadProgress.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{item.name}</span>
                        <Badge className={
                          item.status === 'complete' ? 'bg-green-100 text-green-800' :
                          item.status === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {item.status}
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] h-2 rounded-full transition-all"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {collections.map(col => (
            <Card key={col}>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600 capitalize mb-1">{col}</div>
                <div className="text-2xl font-bold">
                  {mediaFiles.filter(m => m.collection === col).length}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters & Actions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by filename or tags..."
                  className="pl-10"
                />
              </div>
              <Select value={collectionFilter} onValueChange={setCollectionFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Collections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Collections</SelectItem>
                  {collections.map(col => (
                    <SelectItem key={col} value={col} className="capitalize">
                      {col}
                    </SelectItem>
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

            {selectedImages.length > 0 && (
              <div className="mt-4 flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">{selectedImages.length} images selected</span>
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
                  onClick={() => setSelectedImages([])}
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Media Grid/List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-orange)]"></div>
          </div>
        ) : filteredMedia.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No images found</h3>
              <p className="text-gray-600 mb-4">Upload your first image to get started</p>
              <label htmlFor="file-upload">
                <Button
                  as="span"
                  className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images
                </Button>
              </label>
            </CardContent>
          </Card>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMedia.map((media) => (
              <Card key={media.id} className="group relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedImages.includes(media.id)}
                    onChange={() => {
                      setSelectedImages(prev =>
                        prev.includes(media.id)
                          ? prev.filter(id => id !== media.id)
                          : [...prev, media.id]
                      );
                    }}
                    className="w-5 h-5"
                  />
                </div>
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={media.file_url}
                    alt={media.alt_text || media.file_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-3">
                  <p className="text-xs font-medium truncate mb-1">{media.file_name}</p>
                  <p className="text-xs text-gray-500">{media.width} × {media.height}</p>
                  <Badge className="mt-2 text-xs capitalize">{media.collection}</Badge>
                  <div className="flex gap-1 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingImage(media)}
                      className="flex-1 text-xs"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyUrl(media.file_url)}
                    >
                      {copiedUrl === media.file_url ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
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
                          checked={selectedImages.length === filteredMedia.length && filteredMedia.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedImages(filteredMedia.map(m => m.id));
                            } else {
                              setSelectedImages([]);
                            }
                          }}
                          className="w-4 h-4"
                        />
                      </th>
                      <th className="text-left p-4 text-sm font-semibold">Preview</th>
                      <th className="text-left p-4 text-sm font-semibold">Name</th>
                      <th className="text-left p-4 text-sm font-semibold">Dimensions</th>
                      <th className="text-left p-4 text-sm font-semibold">Size</th>
                      <th className="text-left p-4 text-sm font-semibold">Collection</th>
                      <th className="text-right p-4 text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedia.map((media) => (
                      <tr key={media.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedImages.includes(media.id)}
                            onChange={() => {
                              setSelectedImages(prev =>
                                prev.includes(media.id)
                                  ? prev.filter(id => id !== media.id)
                                  : [...prev, media.id]
                              );
                            }}
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="p-4">
                          <img
                            src={media.file_url}
                            alt={media.alt_text || media.file_name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </td>
                        <td className="p-4 text-sm">{media.file_name}</td>
                        <td className="p-4 text-sm text-gray-600">
                          {media.width} × {media.height}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {formatBytes(media.file_size)}
                        </td>
                        <td className="p-4">
                          <Badge className="capitalize">{media.collection}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingImage(media)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyUrl(media.file_url)}
                            >
                              {copiedUrl === media.file_url ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (window.confirm('Delete this image?')) {
                                  deleteMediaMutation.mutate(media.id);
                                }
                              }}
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
      </div>
    </div>
  );
}