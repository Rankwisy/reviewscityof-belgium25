import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Facebook, Twitter, Linkedin, Mail, Link as LinkIcon,
  MessageCircle, Check, Share2
} from 'lucide-react';

export default function SocialShare({ 
  url, 
  title, 
  description, 
  hashtags = [],
  variant = 'inline' // 'inline', 'floating', 'compact'
}) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Ensure absolute URL
  const shareUrl = url?.startsWith('http') ? url : `${window.location.origin}${url || window.location.pathname}`;
  const shareTitle = encodeURIComponent(title || document.title);
  const shareDescription = encodeURIComponent(description || '');
  const shareHashtags = hashtags.join(',');

  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}${shareHashtags ? `&hashtags=${shareHashtags}` : ''}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${shareTitle}%20${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${shareTitle}&body=${shareDescription}%0A%0A${encodeURIComponent(shareUrl)}`
  };

  const handleShare = (platform) => {
    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      window.open(socialLinks[platform], '_blank', 'width=600,height=400');
    }
    
    if (variant === 'floating') {
      setShowMenu(false);
    }
  };

  // Native Web Share API (for mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    }
  };

  // Compact variant (just icons)
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 mr-2">Share:</span>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleShare('facebook')}
          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
          title="Share on Facebook"
        >
          <Facebook className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleShare('twitter')}
          className="h-8 w-8 hover:bg-sky-50 hover:text-sky-600"
          title="Share on Twitter"
        >
          <Twitter className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleShare('linkedin')}
          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-700"
          title="Share on LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleShare('copy')}
          className="h-8 w-8 hover:bg-gray-100"
          title="Copy link"
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <LinkIcon className="h-4 w-4" />}
        </Button>
      </div>
    );
  }

  // Floating variant (sticky button with popup)
  if (variant === 'floating') {
    return (
      <div className="fixed right-6 bottom-6 z-40">
        {showMenu && (
          <Card className="mb-4 shadow-xl border-0 animate-in slide-in-from-bottom-2 duration-200">
            <CardContent className="p-4">
              <div className="space-y-2 min-w-[200px]">
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => handleShare('facebook')}
                >
                  <Facebook className="h-4 w-4 mr-3" />
                  Facebook
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-sky-50 hover:text-sky-600"
                  onClick={() => handleShare('twitter')}
                >
                  <Twitter className="h-4 w-4 mr-3" />
                  Twitter
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-blue-50 hover:text-blue-700"
                  onClick={() => handleShare('linkedin')}
                >
                  <Linkedin className="h-4 w-4 mr-3" />
                  LinkedIn
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-green-50 hover:text-green-600"
                  onClick={() => handleShare('whatsapp')}
                >
                  <MessageCircle className="h-4 w-4 mr-3" />
                  WhatsApp
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-gray-100"
                  onClick={() => handleShare('email')}
                >
                  <Mail className="h-4 w-4 mr-3" />
                  Email
                </Button>
                <div className="border-t pt-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-gray-100"
                    onClick={() => handleShare('copy')}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-3 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4 mr-3" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Button
          onClick={() => setShowMenu(!showMenu)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
        >
          <Share2 className="h-6 w-6 text-white" />
        </Button>
      </div>
    );
  }

  // Inline variant (full card)
  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] flex items-center justify-center">
            <Share2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Share this page</h3>
            <p className="text-sm text-gray-600">Spread the word with your friends</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Button
            variant="outline"
            className="w-full justify-start hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600 transition-colors"
            onClick={() => handleShare('facebook')}
          >
            <Facebook className="h-4 w-4 mr-2" />
            Facebook
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start hover:bg-sky-50 hover:text-sky-600 hover:border-sky-600 transition-colors"
            onClick={() => handleShare('twitter')}
          >
            <Twitter className="h-4 w-4 mr-2" />
            Twitter
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700 transition-colors"
            onClick={() => handleShare('linkedin')}
          >
            <Linkedin className="h-4 w-4 mr-2" />
            LinkedIn
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start hover:bg-green-50 hover:text-green-600 hover:border-green-600 transition-colors"
            onClick={() => handleShare('whatsapp')}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start hover:bg-gray-100 transition-colors"
            onClick={() => handleShare('email')}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start hover:bg-gray-100 transition-colors"
            onClick={() => handleShare('copy')}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>
        </div>

        {/* Native Share Button (Mobile) */}
        {navigator.share && (
          <Button
            variant="ghost"
            className="w-full mt-3"
            onClick={handleNativeShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share via...
          </Button>
        )}
      </CardContent>
    </Card>
  );
}