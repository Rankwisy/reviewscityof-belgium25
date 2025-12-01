import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import BlogPostCard from '../components/home/BlogPostCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { createPageUrl } from '@/utils';

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, '-created_date', 100),
  });

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['City Guides', 'Travel Tips', 'Food & Drink', 'Culture', 'Events', 'Itineraries'];
  const featuredPost = posts.find(p => p.featured);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "CityReview.be Travel Blog",
    "description": "Travel stories, guides, and tips for exploring Belgium",
    "url": typeof window !== 'undefined' ? window.location.href : 'https://www.cityreview.be/blog', // Added check for window
    "blogPost": posts.slice(0, 10).map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": post.created_date,
      "author": {
        "@type": "Person",
        "name": post.author || "CityReview.be Team"
      }
    }))
  };

  const breadcrumbItems = [
    { label: 'Blog', url: createPageUrl('Blog') }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumbs items={breadcrumbItems} />
      
      <SEO 
        title="Belgium Travel Blog - Stories, Guides & Tips"
        description="Stories, guides, and inspiration for your Belgian journey. Read about the best cities, attractions, food, and travel experiences in Belgium."
        keywords="Belgium travel blog, Belgium travel tips, Belgium travel guide, visiting Belgium, Belgium itinerary, Belgium stories"
        structuredData={structuredData}
      />

      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Travel Blog</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stories, guides, and inspiration for your Belgian journey
            </p>
          </div>

          {/* Featured Post */}
          {featuredPost && (
            <div className="mb-12">
              <div className="relative h-[400px] rounded-2xl overflow-hidden group cursor-pointer">
                <img
                  src={featuredPost.featured_image || 'https://images.unsplash.com/photo-1605305089278-e92b9c7bb2a9?w=1600&q=80'}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <p className="text-sm font-semibold mb-2 text-[var(--belgian-gold)]">FEATURED</p>
                  <h2 className="text-4xl font-bold mb-4">{featuredPost.title}</h2>
                  <p className="text-lg mb-4 line-clamp-2">{featuredPost.excerpt}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search & Filter */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
            </p>
          </div>

          {/* Blog Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--belgian-red)]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {filteredPosts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No articles found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}