import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=1600&q=80',
      title: 'Discover the Best of Belgium',
      subtitle: 'Your Complete Guide to Belgian Cities, Attractions & Experiences'
    },
    {
      image: 'https://images.unsplash.com/photo-1555043919-019d0305a40a?w=1600&q=80',
      title: 'Explore Historic Cities',
      subtitle: 'From medieval Bruges to vibrant Brussels'
    },
    {
      image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1600&q=80',
      title: 'Taste Belgian Delights',
      subtitle: 'Chocolate, waffles, beer, and world-class cuisine'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = createPageUrl('Attractions') + '?search=' + encodeURIComponent(searchQuery);
    }
  };

  return (
    <div className="relative h-[600px] lg:h-[700px] overflow-hidden">
      {/* Carousel */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=1600&q=80';
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      {/* Content */}
      <div className="relative h-full flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
            {slides[currentSlide].title}
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 drop-shadow-md">
            {slides[currentSlide].subtitle}
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-2 bg-white rounded-lg p-2 shadow-2xl">
              <Input
                type="text"
                placeholder="Search cities, attractions, restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 text-lg focus-visible:ring-0"
              />
              <Button 
                type="submit"
                size="lg" 
                className="bg-[var(--belgian-red)] hover:bg-[#c00510] text-white px-8"
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </form>

          {/* Quick City Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            {['Brussels', 'Bruges', 'Antwerp', 'Ghent'].map((city) => (
              <Link
                key={city}
                to={createPageUrl('CityDetail') + '?city=' + city.toLowerCase()}
              >
                <Button
                  variant="outline"
                  className="bg-white/90 hover:bg-white border-0 text-gray-800 font-semibold"
                >
                  {city}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}