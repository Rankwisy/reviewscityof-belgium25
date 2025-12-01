import React, { useEffect } from 'react';
import { useLanguage } from '../pages/LanguageContext';

export default function SEO({ 
  title, 
  description, 
  keywords,
  image,
  url,
  type = 'website',
  locale,
  structuredData
}) {
  const { language } = useLanguage();
  const currentLocale = locale || language;
  
  const siteTitle = 'CityReview.be';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const currentUrl = url || window.location.href;
  const defaultImage = 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=1200&h=630&fit=crop&q=80';
  const ogImage = image || defaultImage;

  const alternateLanguages = {
    en: currentUrl.replace(/[?&](lang|locale)=(en|fr|nl)/, ''),
    fr: currentUrl.includes('?') ? `${currentUrl}&lang=fr` : `${currentUrl}?lang=fr`,
    nl: currentUrl.includes('?') ? `${currentUrl}&lang=nl` : `${currentUrl}?lang=nl`
  };

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (property, content) => {
      let element = document.querySelector(`meta[property="${property}"]`) ||
                    document.querySelector(`meta[name="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          element.setAttribute('property', property);
        } else {
          element.setAttribute('name', property);
        }
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Update or create link tags
    const updateLinkTag = (rel, sizes, href, type) => {
      let selector = `link[rel="${rel}"]`;
      if (sizes) {
        selector += `[sizes="${sizes}"]`;
      }
      
      let element = document.querySelector(selector);
      
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        if (sizes) element.setAttribute('sizes', sizes);
        if (type) element.setAttribute('type', type);
        document.head.appendChild(element);
      }
      
      element.setAttribute('href', href);
    };

    // Favicon links
    updateLinkTag('icon', '16x16', 'https://ik.imagekit.io/by733ltn6/FAVICONS/favicon_io%20(15)/favicon-16x16.png?updatedAt=1762899271805', 'image/png');
    updateLinkTag('icon', '32x32', 'https://ik.imagekit.io/by733ltn6/FAVICONS/favicon_io%20(15)/favicon-32x32.png?updatedAt=1762899271818', 'image/png');
    updateLinkTag('apple-touch-icon', '180x180', 'https://ik.imagekit.io/by733ltn6/FAVICONS/favicon_io%20(15)/apple-touch-icon.png?updatedAt=1762899271843');
    updateLinkTag('icon', '192x192', 'https://ik.imagekit.io/by733ltn6/FAVICONS/favicon_io%20(15)/android-chrome-192x192.png?updatedAt=1762899271805', 'image/png');
    updateLinkTag('icon', '512x512', 'https://ik.imagekit.io/by733ltn6/FAVICONS/favicon_io%20(15)/android-chrome-512x512.png?updatedAt=1762899271840', 'image/png');

    // Basic meta tags
    if (description) {
      updateMetaTag('description', description);
    }
    
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Open Graph meta tags
    updateMetaTag('og:title', fullTitle);
    if (description) {
      updateMetaTag('og:description', description);
    }
    updateMetaTag('og:type', type);
    updateMetaTag('og:url', currentUrl);
    updateMetaTag('og:image', ogImage);
    updateMetaTag('og:image:width', '1200');
    updateMetaTag('og:image:height', '630');
    updateMetaTag('og:locale', currentLocale);
    updateMetaTag('og:site_name', siteTitle);

    // Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    if (description) {
      updateMetaTag('twitter:description', description);
    }
    updateMetaTag('twitter:image', ogImage);

    // Language alternate links
    const existingAlternates = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingAlternates.forEach(link => link.remove());

    Object.entries(alternateLanguages).forEach(([lang, href]) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = href;
      document.head.appendChild(link);
    });

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;

    // Language meta tag
    document.documentElement.setAttribute('lang', currentLocale);

    // Structured Data (JSON-LD)
    if (structuredData) {
      let scriptTag = document.querySelector('script[type="application/ld+json"]');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    }

  }, [fullTitle, description, keywords, currentUrl, ogImage, type, currentLocale, structuredData]);

  return null;
}