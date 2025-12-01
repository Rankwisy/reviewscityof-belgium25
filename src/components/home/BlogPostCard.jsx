import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function BlogPostCard({ post }) {
  const imageUrl = post.featured_image || 'https://images.unsplash.com/photo-1605305089278-e92b9c7bb2a9?w=800&h=600&fit=crop&q=80';
  
  return (
    <Link to={createPageUrl('BlogDetail') + '?slug=' + post.slug}>
      <article className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
        <div className="relative h-56 overflow-hidden">
          <img
            src={imageUrl}
            alt={`${post.title} - ${post.category} travel guide ${post.related_city ? `about ${post.related_city}` : 'for Belgium'}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1605305089278-e92b9c7bb2a9?w=800&h=600&fit=crop&q=80';
            }}
          />
          {post.category && (
            <Badge className="absolute top-3 left-3 bg-[var(--belgian-red)] text-white">
              {post.category}
            </Badge>
          )}
        </div>
        
        <div className="p-5">
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{format(new Date(post.created_date), 'MMM d, yyyy')}</span>
            </div>
            {post.reading_time && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{post.reading_time}</span>
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[var(--belgian-red)] transition-colors line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {post.excerpt}
          </p>
          
          <div className="flex items-center text-[var(--belgian-red)] font-semibold text-sm group-hover:gap-2 transition-all">
            Read More
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </article>
    </Link>
  );
}