
import React from 'react';
import { MapPin, Heart, Users, Award } from 'lucide-react';
import SEO from '../components/SEO';

export default function About() {
  return (
    <div>
      <SEO 
        title="About CityReview.be - Your Belgium Travel Guide"
        description="Learn about CityReview.be, your comprehensive guide to exploring Belgium. Discover our mission to help travelers experience the best of Belgian cities, culture, and cuisine."
        keywords="about CityReview, Belgium travel guide, Belgium tourism, travel Belgium"
      />

      {/* Hero Section */}
      <div className="relative h-[400px]">
        <img
          src="https://images.unsplash.com/photo-1605305089278-e92b9c7bb2a9?w=1600&q=80"
          alt="About CityReview.be"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-3xl px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">About CityReview.be</h1>
            <p className="text-xl">Your trusted guide to exploring Belgium</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg max-w-none">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            CityReview.be was created with a simple mission: to help travelers discover the best that Belgium has to offer. 
            From the medieval charm of Bruges to the cosmopolitan energy of Brussels, from world-class chocolate and beer 
            to stunning architecture and rich history, Belgium is a destination that deserves to be explored in depth.
          </p>

          <p className="text-gray-700 leading-relaxed mb-12">
            We provide comprehensive, up-to-date information on Belgian cities, attractions, restaurants, and hotels, 
            helping you plan the perfect trip whether you're visiting for business or pleasure, traveling solo or with family.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--belgian-red)] rounded-full mb-4">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Comprehensive Coverage</h3>
              <p className="text-gray-600">
                Detailed guides for every major Belgian city, with hundreds of attractions, restaurants, and hotels reviewed.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--belgian-gold)] rounded-full mb-4">
                <Heart className="h-6 w-6 text-gray-800" />
              </div>
              <h3 className="text-xl font-bold mb-3">Local Expertise</h3>
              <p className="text-gray-600">
                Our recommendations come from locals and experienced travelers who truly know Belgium.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Community Driven</h3>
              <p className="text-gray-600">
                We welcome contributions from travelers and businesses to keep our information current and comprehensive.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Quality First</h3>
              <p className="text-gray-600">
                Every listing is carefully reviewed to ensure accuracy and relevance for our users.
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-6">Why Belgium?</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Belgium may be small, but it punches well above its weight when it comes to culture, cuisine, and charm. 
            This is a country where medieval towns sit alongside modern cities, where three languages blend seamlessly, 
            and where you can enjoy world-class museums, restaurants, and festivals.
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            Whether you're drawn by the art of Rubens and Van Eyck, the beer culture that spans centuries, the innovative 
            Belgian cuisine, or simply the warm hospitality of the Belgian people, you'll find that Belgium offers 
            something special at every turn.
          </p>

          <div className="bg-gradient-to-r from-[var(--belgian-red)] to-[#c00510] rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Explore Belgium?</h3>
            <p className="text-lg mb-6">
              Start planning your Belgian adventure today with our comprehensive city guides and recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
