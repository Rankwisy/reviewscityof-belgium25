import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import BlogPostCard from '../home/BlogPostCard';
import { Sparkles } from 'lucide-react';

export default function RelatedPosts({ currentPost }) {
  const { data: allPosts = [] } = useQuery({
    queryKey: ['all-published-posts'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, '-created_date', 100),
  });

  // Extract keywords from text for semantic analysis
  const extractKeywords = (text) => {
    if (!text) return [];
    
    // Common stop words to exclude
    const stopWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
      'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'is',
      'are', 'was', 'were', 'been', 'has', 'had', 'can', 'could', 'should'
    ]);
    
    // Extract words, convert to lowercase, filter out stop words and short words
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
    
    // Count word frequency
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    // Return top keywords sorted by frequency
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  };

  // Calculate semantic similarity between two texts
  const calculateSemanticSimilarity = (keywords1, keywords2) => {
    if (!keywords1.length || !keywords2.length) return 0;
    
    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    
    // Count common keywords
    let commonCount = 0;
    set1.forEach(word => {
      if (set2.has(word)) commonCount++;
    });
    
    // Jaccard similarity coefficient
    const unionSize = set1.size + set2.size - commonCount;
    return unionSize > 0 ? (commonCount / unionSize) * 100 : 0;
  };

  // Calculate post popularity score
  const getPopularityScore = (post) => {
    let score = 0;
    
    // Featured posts get bonus
    if (post.featured) score += 5;
    
    // Recency bonus (newer posts get higher score)
    const daysOld = (Date.now() - new Date(post.created_date).getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld < 7) score += 5;
    else if (daysOld < 30) score += 3;
    else if (daysOld < 90) score += 1;
    
    return score;
  };

  // Calculate relevance score for each post
  const getRelatedPosts = () => {
    if (!currentPost || !allPosts.length) return [];

    const currentTags = currentPost.tags || [];
    const currentCategory = currentPost.category;
    const currentCity = currentPost.related_city;
    
    // Extract semantic keywords from current post
    const currentText = `${currentPost.title} ${currentPost.excerpt} ${currentPost.content || ''}`;
    const currentKeywords = extractKeywords(currentText);

    const scoredPosts = allPosts
      .filter(post => post.id !== currentPost.id) // Exclude current post
      .map(post => {
        let score = 0;
        const postTags = post.tags || [];

        // 1. Same category: +10 points
        if (post.category === currentCategory) {
          score += 10;
        }

        // 2. Same city: +20 points (increased weight for location relevance)
        if (currentCity && post.related_city === currentCity) {
          score += 20;
        }

        // 3. Matching tags: +5 points per tag
        const matchingTags = postTags.filter(tag => currentTags.includes(tag));
        score += matchingTags.length * 5;

        // 4. Semantic similarity: up to +25 points
        const postText = `${post.title} ${post.excerpt} ${post.content || ''}`;
        const postKeywords = extractKeywords(postText);
        const semanticScore = calculateSemanticSimilarity(currentKeywords, postKeywords);
        score += semanticScore * 0.25; // Scale semantic score to max 25 points

        // 5. Popularity/recency bonus: up to +5 points
        score += getPopularityScore(post);

        return { 
          post, 
          score, 
          matchingTags: matchingTags.length,
          semanticScore
        };
      })
      .filter(item => item.score > 0) // Only posts with some relevance
      .sort((a, b) => {
        // Sort by total score
        if (b.score !== a.score) return b.score - a.score;
        // Tie-breaker: matching tags
        if (b.matchingTags !== a.matchingTags) return b.matchingTags - a.matchingTags;
        // Tie-breaker: semantic similarity
        if (b.semanticScore !== a.semanticScore) return b.semanticScore - a.semanticScore;
        // Final tie-breaker: date
        return new Date(b.post.created_date) - new Date(a.post.created_date);
      });

    // If we have fewer than 3 related posts, add some popular recent posts
    let finalPosts = scoredPosts.slice(0, 3).map(item => item.post);
    
    if (finalPosts.length < 3) {
      const recentPopular = allPosts
        .filter(post => post.id !== currentPost.id && !finalPosts.find(p => p.id === post.id))
        .sort((a, b) => {
          const aScore = getPopularityScore(a);
          const bScore = getPopularityScore(b);
          if (bScore !== aScore) return bScore - aScore;
          return new Date(b.created_date) - new Date(a.created_date);
        })
        .slice(0, 3 - finalPosts.length);
      
      finalPosts = [...finalPosts, ...recentPopular];
    }

    return finalPosts;
  };

  const relatedPosts = getRelatedPosts();

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 pt-12 border-t border-gray-200">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="h-7 w-7 text-[var(--belgian-red)]" />
        <h2 className="text-3xl font-bold text-gray-900">You Might Also Like</h2>
      </div>
      <p className="text-gray-600 mb-8">
        Discover more stories and guides tailored to your interests
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}