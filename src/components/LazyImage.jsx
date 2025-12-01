import React, { useState, useEffect, useRef } from 'react';

export default function LazyImage({ src, alt, className, fallback, onError }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (onError) onError();
    if (fallback) setImageSrc(fallback);
  };

  return (
    <div ref={imgRef} className={`relative ${className || ''}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`${className || ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
}