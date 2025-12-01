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
  FileText, Edit, Trash2, Eye, ArrowLeft, Save, X, Plus, Search, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEO from '../components/SEO';
import ProtectedRoute from '../components/ProtectedRoute';
import MediaSelector from '../components/admin/MediaSelector';
import AIContentGenerator from '../components/admin/AIContentGenerator';

function AdminBlogContent() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((userData) => {
      setUser(userData);
    }).catch(() => {
      setUser(null);
    });
  }, []);

  const { data: posts = [] } = useQuery({
    queryKey: ['admin-blog'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 1000),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BlogPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-blog']);
      setEditingPost(null);
      setFormData({});
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BlogPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-blog']);
      setEditingPost(null);
      setFormData({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-blog']);
    },
  });

  const handleSave = () => {
    const slug = formData.slug || (formData.title ? formData.title.toLowerCase().replace(/\s+/g, '-') : '');
    const dataToSave = { 
      ...formData, 
      slug,
      tags: formData.tags || [],
      published: formData.published || false,
      author: formData.author || user?.full_name || user?.email || 'Unknown',
    };

    if (editingPost === 'new') {
      createMutation.mutate(dataToSave);
    } else {
      updateMutation.mutate({ id: editingPost.id, data: dataToSave });
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['City Guides', 'Travel Tips', 'Food & Drink', 'Culture', 'Events', 'Itineraries'];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-orange)]"></div>
      </div>
    );
  }

  if (editingPost) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <SEO title={`${editingPost === 'new' ? 'Create' : 'Edit'} Blog Post - Admin`} />
        
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => {
                setEditingPost(null);
                setFormData({});
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingPost(null);
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
                {formData.published ? 'Publish' : 'Save Draft'}
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="content" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter post title"
                      className="text-2xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">URL Slug</label>
                    <Input
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="auto-generated from title"
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
                      <label className="block text-sm font-medium mb-2">Author</label>
                      <Input
                        value={formData.author || user.full_name || user.email}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        placeholder="Author name"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">
                        Excerpt <span className="text-red-500">*</span>
                      </label>
                      <AIContentGenerator
                        type="short_description"
                        context={{
                          name: formData.title,
                          type: 'blog post',
                          highlights: formData.category
                        }}
                        onAccept={(content) => setFormData({ ...formData, excerpt: content })}
                        buttonText="Generate Excerpt"
                      />
                    </div>
                    <Textarea
                      value={formData.excerpt || ''}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Short summary (300 characters)"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.excerpt?.length || 0} / 300 characters
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">
                        Content <span className="text-red-500">*</span>
                      </label>
                      <AIContentGenerator
                        type="blog"
                        context={{
                          title: formData.title,
                          category: formData.category,
                          relatedCity: formData.related_city
                        }}
                        onAccept={(content) => setFormData({ ...formData, content: content })}
                        buttonText="Generate Full Post"
                      />
                    </div>
                    <Textarea
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Write your blog post content here..."
                      rows={20}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.content?.length || 0} characters · {Math.round((formData.content?.length || 0) / 5)} words
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Featured Image</label>
                    <MediaSelector
                      value={formData.featured_image || ''}
                      onChange={(url) => setFormData({ ...formData, featured_image: url })}
                      collection="blog"
                    />
                    <p className="text-xs text-gray-500 mt-1">Main image for the blog post</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                    <Input
                      value={formData.tags?.join(', ') || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                      })}
                      placeholder="belgium, travel, brussels"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Related City Slug</label>
                    <Input
                      value={formData.related_city || ''}
                      onChange={(e) => setFormData({ ...formData, related_city: e.target.value })}
                      placeholder="brussels"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">SEO Optimization</h4>
                      <p className="text-sm text-blue-700">Improve your blog post's search engine visibility</p>
                    </div>
                    <AIContentGenerator
                      type="seo"
                      context={{
                        name: formData.title,
                        description: formData.excerpt || formData.content,
                        category: formData.category,
                        entityType: 'blog post'
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
                      placeholder={formData.title || 'Blog post title'}
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
                      placeholder={formData.excerpt || 'Brief description for search results'}
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
                      placeholder="belgium, travel, guide, brussels"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Open Graph Image</label>
                    <MediaSelector
                      value={formData.og_image || ''}
                      onChange={(url) => setFormData({ ...formData, og_image: url })}
                      collection="blog"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Image for social media sharing (1200x630px recommended)
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="published"
                        checked={formData.published || false}
                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label htmlFor="published" className="text-sm font-medium cursor-pointer">
                        Publish immediately
                      </label>
                    </div>

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
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Reading Time</label>
                    <Input
                      value={formData.reading_time || ''}
                      onChange={(e) => setFormData({ ...formData, reading_time: e.target.value })}
                      placeholder="e.g., 5 min read"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Estimated: ~{Math.ceil((formData.content?.length || 0) / 1000)} min read
                    </p>
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
      <SEO title="Manage Blog - Admin" />

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to={createPageUrl('AdminDashboard')}>
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Manage Blog</h1>
            <p className="text-gray-600 mt-1">
              {posts.length} total posts · {posts.filter(p => p.published).length} published
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingPost('new');
              setFormData({
                title: '',
                slug: '',
                excerpt: '',
                content: '',
                category: '',
                author: user.full_name || user.email,
                tags: [],
                published: false,
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
            New Post
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {post.featured_image && (
                    <div className="w-48 h-32 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{post.title}</h3>
                        <p className="text-sm text-gray-600">{post.excerpt}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {post.published ? (
                          <Badge className="bg-green-100 text-green-800">Published</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
                        )}
                        {post.featured && (
                          <Badge className="bg-[var(--primary-yellow)] text-gray-900">Featured</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span>{post.category}</span>
                      <span>·</span>
                      <span>{post.author}</span>
                      <span>·</span>
                      <span>{new Date(post.created_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPost(post);
                          setFormData(post);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(createPageUrl('BlogDetail') + '?slug=' + post.slug, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (window.confirm('Delete this post?')) {
                            deleteMutation.mutate(post.id);
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

        {filteredPosts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No blog posts found</h3>
              <p className="text-gray-600 mb-4">Start by creating your first blog post</p>
              <Button
                onClick={() => {
                  setEditingPost('new');
                  setFormData({
                    title: '',
                    slug: '',
                    excerpt: '',
                    content: '',
                    category: '',
                    author: user.full_name || user.email,
                    tags: [],
                    published: false,
                    featured: false
                  });
                }}
                className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AdminBlog() {
  return (
    <ProtectedRoute requiredPermission="manage_blog">
      <AdminBlogContent />
    </ProtectedRoute>
  );
}