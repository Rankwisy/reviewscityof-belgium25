import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Image as ImageIcon, Search, X, Check, Upload
} from 'lucide-react';

export default function MediaSelector({ value, onChange, multiple = false, collection = 'all' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionFilter, setCollectionFilter] = useState(collection === 'all' ? 'all' : collection);
  const [selectedUrls, setSelectedUrls] = useState(
    multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : [])
  );
  const [uploading, setUploading] = useState(false);

  const { data: mediaFiles = [] } = useQuery({
    queryKey: ['media-files'],
    queryFn: () => base44.entities.MediaFile.list('-created_date', 500),
  });

  const collections = ['uncategorized', 'cities', 'attractions', 'restaurants', 'hotels', 'businesses', 'events', 'blog'];

  const filteredMedia = mediaFiles.filter(media => {
    const matchesSearch = media.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         media.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCollection = collectionFilter === 'all' || media.collection === collectionFilter;
    return matchesSearch && matchesCollection;
  });

  const handleSelect = (url) => {
    if (multiple) {
      const newSelection = selectedUrls.includes(url)
        ? selectedUrls.filter(u => u !== url)
        : [...selectedUrls, url];
      setSelectedUrls(newSelection);
    } else {
      setSelectedUrls([url]);
      onChange(url);
      setIsOpen(false);
    }
  };

  const handleConfirm = () => {
    if (multiple) {
      onChange(selectedUrls);
    }
    setIsOpen(false);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      const uploadedUrls = [];
      
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = file_url;
        });

        await base44.entities.MediaFile.create({
          file_name: file.name,
          file_url: file_url,
          file_size: file.size,
          width: img.width,
          height: img.height,
          mime_type: file.type,
          collection: collectionFilter !== 'all' ? collectionFilter : 'uncategorized',
          tags: []
        });

        uploadedUrls.push(file_url);
      }

      // Auto-select uploaded images
      if (multiple) {
        setSelectedUrls([...selectedUrls, ...uploadedUrls]);
      } else if (uploadedUrls.length > 0) {
        setSelectedUrls([uploadedUrls[0]]);
        onChange(uploadedUrls[0]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) {
    return (
      <div>
        {selectedUrls.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedUrls.map((url, index) => (
              <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                <img src={url} alt="Selected" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    const newSelection = selectedUrls.filter(u => u !== url);
                    setSelectedUrls(newSelection);
                    onChange(multiple ? newSelection : (newSelection[0] || ''));
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="w-full"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          {selectedUrls.length > 0 ? `${selectedUrls.length} image(s) selected` : 'Select from Media Library'}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Select from Media Library</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search images..."
                className="pl-10"
              />
            </div>
            <Select value={collectionFilter} onValueChange={setCollectionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
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
            <div>
              <input
                type="file"
                multiple={multiple}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="quick-upload"
              />
              <label htmlFor="quick-upload">
                <Button
                  as="span"
                  variant="outline"
                  disabled={uploading}
                  className="cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </label>
            </div>
          </div>

          {/* Media Grid */}
          <div className="flex-1 overflow-y-auto mb-4">
            {filteredMedia.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No images found</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredMedia.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => handleSelect(media.file_url)}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedUrls.includes(media.file_url)
                        ? 'border-[var(--primary-orange)] ring-2 ring-[var(--primary-orange)]'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={media.file_url}
                      alt={media.alt_text || media.file_name}
                      className="w-full h-full object-cover"
                    />
                    {selectedUrls.includes(media.file_url) && (
                      <div className="absolute inset-0 bg-[var(--primary-orange)]/20 flex items-center justify-center">
                        <div className="bg-[var(--primary-orange)] text-white rounded-full p-2">
                          <Check className="h-5 w-5" />
                        </div>
                      </div>
                    )}
                    <Badge className="absolute bottom-2 left-2 text-xs capitalize">
                      {media.collection}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-sm text-gray-600">
              {selectedUrls.length} image(s) selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              {multiple && (
                <Button
                  onClick={handleConfirm}
                  className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white"
                >
                  Confirm Selection
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}