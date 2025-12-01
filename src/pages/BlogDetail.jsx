import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, User, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import RelatedPosts from '../components/blog/RelatedPosts';
import SEO from '../components/SEO';
import SocialShare from '../components/SocialShare';
import Breadcrumbs from '../components/navigation/Breadcrumbs';

export default function BlogDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const posts = await base44.entities.BlogPost.filter({ slug });
      return posts[0];
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--belgian-red)]"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <>
        <SEO 
          title="Article Not Found"
          description="The article you're looking for doesn't exist."
        />
        <div className="py-20 px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600">The article you're looking for doesn't exist.</p>
        </div>
      </>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.featured_image || 'https://images.unsplash.com/photo-1605305089278-e92b9c7bb2a9?w=1600&q=80',
    "datePublished": post.created_date,
    "dateModified": post.updated_date || post.created_date,
    "author": {
      "@type": "Person",
      "name": post.author || "CityReview.be Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CityReview.be",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/logo.png`
      }
    },
    "url": window.location.href,
    ...(post.tags && post.tags.length > 0 && { "keywords": post.tags.join(', ') }),
    "articleSection": post.category,
    "inLanguage": "en-US"
  };

  const breadcrumbItems = post ? [
    { label: 'Blog', url: createPageUrl('Blog') },
    { label: post.title, url: createPageUrl('BlogDetail') + '?slug=' + slug }
  ] : [];

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="py-8 px-4">
        <SEO 
        title={post.title}
        description={post.excerpt}
        keywords={post.tags ? post.tags.join(', ') : `Belgium travel, ${post.category}`}
        image={post.featured_image}
        type="article"
        structuredData={structuredData}
      />
      {/* Hero Image */}
      <div className="relative h-[500px] mb-8">
        <img
          src={post.featured_image || 'https://images.unsplash.com/photo-1605305089278-e92b9c7bb2a9?w=1600&q=80'}
          alt={post.title}
          className="w-full h-full object-cover rounded-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl" />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {post.category && (
            <Badge className="bg-[var(--belgian-red)] text-white">
              {post.category}
            </Badge>
          )}
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{format(new Date(post.created_date), 'MMMM d, yyyy')}</span>
          </div>
          {post.reading_time && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>{post.reading_time}</span>
            </div>
          )}
          {post.author && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2" />
              <span>{post.author}</span>
            </div>
          )}
        </div>

        {/* Title & Excerpt */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          {post.title}
        </h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Content */}
        <article className="prose prose-lg max-w-none mb-12">
          <div 
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
            className="text-gray-700 leading-relaxed whitespace-pre-line"
          />
        </article>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="border-t border-b py-6 mb-8">
            <div className="flex items-center flex-wrap gap-2">
              <Tag className="h-5 w-5 text-gray-400" />
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Social Share */}
        <div className="mb-12">
          <SocialShare
            url={window.location.href}
            title={post.title}
            description={post.excerpt}
            hashtags={['Belgium', 'Travel', post.category?.replace(/\s+/g, ''), ...(post.tags || []).slice(0, 2)]}
            variant="inline"
          />
        </div>

        {/* Smart Related Posts */}
        <RelatedPosts currentPost={post} />
      </div>
      </div>
    </div>
  );
}