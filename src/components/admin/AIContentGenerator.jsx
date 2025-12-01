import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Loader2, X, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AIContentGenerator({ 
  type = 'description', // 'description', 'seo', 'blog'
  context = {},
  onAccept,
  buttonText = 'Generate with AI',
  buttonSize = 'sm'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateContent = async () => {
    setGenerating(true);
    setResult(null);

    try {
      let prompt = '';
      
      if (type === 'description') {
        prompt = `Write an engaging, informative description for a ${context.type || 'location'} in Belgium.
        
Name: ${context.name || 'Unknown'}
${context.category ? `Category: ${context.category}` : ''}
${context.city ? `City: ${context.city}` : ''}
${context.type ? `Type: ${context.type}` : ''}

Write 2-3 paragraphs (150-200 words) that:
- Highlights unique features and what makes it special
- Mentions key attractions or offerings
- Appeals to travelers and tourists
- Is informative yet engaging
- Includes relevant local context

Description:`;

      } else if (type === 'seo') {
        prompt = `Generate SEO metadata for a Belgian ${context.entityType || 'location'} page.

Name: ${context.name || 'Unknown'}
${context.description ? `Description: ${context.description.substring(0, 500)}` : ''}
${context.category ? `Category: ${context.category}` : ''}
${context.city ? `City: ${context.city}` : ''}

Generate:
1. SEO Title (50-60 characters, compelling and keyword-rich)
2. Meta Description (150-160 characters, actionable and enticing)
3. 5-7 relevant keywords (comma-separated)

Make it optimized for search engines while remaining natural and appealing to users.`;

        const seoResult = await base44.integrations.Core.InvokeLLM({
          prompt: prompt,
          response_json_schema: {
            type: "object",
            properties: {
              seo_title: { type: "string" },
              seo_description: { type: "string" },
              keywords: { type: "string" }
            }
          }
        });

        setResult(seoResult);
        setGenerating(false);
        return;

      } else if (type === 'blog') {
        prompt = `Write a comprehensive blog post draft about: ${context.title || context.topic}

${context.category ? `Category: ${context.category}` : ''}
${context.relatedCity ? `Related to: ${context.relatedCity}` : ''}
${context.briefing ? `Additional context: ${context.briefing}` : ''}

Write a full blog post (800-1200 words) that includes:
- An engaging introduction
- Well-structured body with 3-5 main sections
- Practical tips and local insights
- A compelling conclusion
- Natural keyword integration for SEO

Use a friendly, informative tone suitable for travel enthusiasts.

Blog post:`;

      } else if (type === 'short_description') {
        prompt = `Write a brief, compelling description (100-150 characters) for:

Name: ${context.name}
Type: ${context.type || 'attraction'}
${context.city ? `Location: ${context.city}` : ''}
${context.highlights ? `Key features: ${context.highlights}` : ''}

Make it catchy and informative for preview/listing cards.

Description:`;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt
      });

      setResult(typeof response === 'string' ? { content: response } : response);
    } catch (error) {
      console.error('AI generation failed:', error);
      setResult({ error: 'Failed to generate content. Please try again.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        size={buttonSize}
        onClick={() => setIsOpen(true)}
        className="border-purple-300 text-purple-700 hover:bg-purple-50"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="text-xl font-bold">AI Content Generator</h3>
              <Badge className="bg-purple-100 text-purple-800">Powered by AI</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {!result && !generating && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {type === 'blog' && 'Generate a complete blog post draft based on your topic'}
                  {type === 'seo' && 'Generate optimized SEO metadata for better search visibility'}
                  {type === 'description' && 'Generate an engaging description that highlights key features'}
                  {type === 'short_description' && 'Generate a brief, compelling description for listings'}
                </p>
                <Button
                  onClick={generateContent}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Content
                </Button>
              </div>
            </div>
          )}

          {generating && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">AI is generating your content...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
              </div>
            </div>
          )}

          {result && !result.error && (
            <div className="flex-1 overflow-y-auto">
              {type === 'seo' ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">SEO Title</label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(result.seo_title)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{result.seo_title}</p>
                      <p className="text-xs text-gray-500 mt-1">{result.seo_title?.length || 0} characters</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Meta Description</label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(result.seo_description)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{result.seo_description}</p>
                      <p className="text-xs text-gray-500 mt-1">{result.seo_description?.length || 0} characters</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Keywords</label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(result.keywords)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{result.keywords}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => {
                        onAccept(result);
                        setIsOpen(false);
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    >
                      Use This SEO Data
                    </Button>
                    <Button
                      variant="outline"
                      onClick={generateContent}
                    >
                      Regenerate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Generated Content</label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(result.content)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Textarea
                      value={result.content}
                      onChange={(e) => setResult({ ...result, content: e.target.value })}
                      rows={type === 'blog' ? 25 : 10}
                      className="font-sans"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {result.content?.length || 0} characters · {Math.round((result.content?.length || 0) / 5)} words
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        onAccept(result.content);
                        setIsOpen(false);
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    >
                      Use This Content
                    </Button>
                    <Button
                      variant="outline"
                      onClick={generateContent}
                    >
                      Regenerate
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {result?.error && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-red-600">
                <p className="mb-4">{result.error}</p>
                <Button onClick={generateContent} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}