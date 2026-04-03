import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  MapPin, Eye, Utensils, Calendar, ChevronRight, Star,
  TrendingUp, Briefcase, Hotel, Trophy, Bus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MegaMenu() {
  const [activeMenu, setActiveMenu] = useState(null);
  const leaveTimer = useRef(null); // single shared timer for all menu items

  const handleMenuEnter = (menuKey) => {
    clearTimeout(leaveTimer.current);
    setActiveMenu(menuKey);
  };

  const handleMenuLeave = () => {
    leaveTimer.current = setTimeout(() => setActiveMenu(null), 200);
  };

  const { data: cities = [] } = useQuery({
    queryKey: ['mega-menu-cities'],
    queryFn: async () => {
      const allCities = await base44.entities.City.list('-name', 50);
      return allCities.slice(0, 8);
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['mega-menu-categories'],
    queryFn: () => base44.entities.BusinessCategory.list('-order', 6),
  });

  const attractionCategories = [
    'Museums & Galleries',
    'Historical Sites',
    'Parks & Nature',
    'Nightlife & Entertainment',
    'Tours & Experiences'
  ];

  const cuisineTypes = [
    'Belgian',
    'French',
    'Italian',
    'Asian',
    'Mediterranean',
    'European'
  ];

  const eventCategories = [
    'Festival',
    'Concert',
    'Exhibition',
    'Market',
    'Sports',
    'Food & Drink'
  ];

  const menus = {
    cities: {
      title: 'Explore Cities',
      icon: MapPin,
      sections: [
        {
          title: 'Popular Cities',
          items: cities.map(city => ({
            label: city.name,
            subtitle: city.tagline,
            url: createPageUrl('CityDetail') + '?city=' + city.slug,
            icon: MapPin
          }))
        },
        {
          title: 'Quick Links',
          items: [
            { label: 'All Cities', url: createPageUrl('Cities'), icon: MapPin },
            { label: 'Weekend Getaways', url: createPageUrl('Cities'), icon: TrendingUp },
            { label: 'Hidden Gems', url: createPageUrl('Cities'), icon: Star }
          ]
        }
      ]
    },
    attractions: {
      title: 'Attractions',
      icon: Eye,
      sections: [
        {
          title: 'By Category',
          items: attractionCategories.map(cat => ({
            label: cat,
            url: createPageUrl('Attractions') + '?category=' + encodeURIComponent(cat),
            icon: Eye
          }))
        },
        {
          title: 'Browse',
          items: [
            { label: 'All Attractions', url: createPageUrl('Attractions'), icon: Eye },
            { label: 'Top Rated', url: createPageUrl('Attractions') + '?sort=rating', icon: Star },
            { label: 'Free Attractions', url: createPageUrl('Attractions') + '?price=free', icon: TrendingUp }
          ]
        }
      ]
    },
    restaurants: {
      title: 'Restaurants',
      icon: Utensils,
      sections: [
        {
          title: 'By Cuisine',
          items: cuisineTypes.map(cuisine => ({
            label: cuisine,
            url: createPageUrl('Restaurants') + '?cuisine=' + encodeURIComponent(cuisine),
            icon: Utensils
          }))
        },
        {
          title: 'Browse',
          items: [
            { label: 'All Restaurants', url: createPageUrl('Restaurants'), icon: Utensils },
            { label: 'Top Rated', url: createPageUrl('Restaurants') + '?sort=rating', icon: Star },
            { label: 'Fine Dining', url: createPageUrl('Restaurants') + '?price=€€€€', icon: Star }
          ]
        }
      ]
    },
    hotels: {
      title: 'Hotels',
      icon: Hotel,
      sections: [
        {
          title: 'Popular Cities',
          items: cities.slice(0, 6).map(city => ({
            label: `Hotels in ${city.name}`,
            url: createPageUrl('Hotels') + '?city=' + city.slug,
            icon: Hotel
          }))
        },
        {
          title: 'Browse',
          items: [
            { label: 'All Hotels', url: createPageUrl('Hotels'), icon: Hotel },
            { label: 'Luxury Hotels', url: createPageUrl('Hotels') + '?stars=5', icon: Star },
            { label: 'Budget Friendly', url: createPageUrl('Hotels') + '?price=€', icon: TrendingUp }
          ]
        }
      ]
    },
    events: {
      title: 'Events',
      icon: Calendar,
      sections: [
        {
          title: 'By Category',
          items: eventCategories.map(cat => ({
            label: cat,
            url: createPageUrl('Events') + '?category=' + encodeURIComponent(cat),
            icon: Calendar
          }))
        },
        {
          title: 'Browse',
          items: [
            { label: 'All Events', url: createPageUrl('Events'), icon: Calendar },
            { label: 'This Weekend', url: createPageUrl('Events') + '?time=weekend', icon: TrendingUp },
            { label: 'Free Events', url: createPageUrl('Events') + '?price=free', icon: Star }
          ]
        }
      ]
    },
    services: {
      title: 'Local Services',
      icon: Briefcase,
      sections: [
        {
          title: 'Popular Services',
          items: categories.map(cat => ({
            label: cat.name,
            url: createPageUrl('LocalServices') + '?category=' + cat.slug,
            icon: Briefcase
          }))
        },
        {
          title: 'Browse',
          items: [
            { label: 'All Services', url: createPageUrl('LocalServices'), icon: Briefcase },
            { label: 'Transport Guide', url: '/localservices/transport', icon: Bus },
            { label: 'Verified Businesses', url: createPageUrl('LocalServices') + '?verified=true', icon: Star }
          ]
        }
      ]
    },
    sports: {
      title: 'Sports',
      icon: Trophy,
      sections: [
        {
          title: 'Sports Events',
          items: [
            { label: 'All Sports Events', url: createPageUrl('Events') + '?category=Sports', icon: Trophy },
            { label: 'Football', url: createPageUrl('Events') + '?category=Sports&sport=football', icon: Trophy },
            { label: 'Cycling', url: createPageUrl('Events') + '?category=Sports&sport=cycling', icon: Trophy },
            { label: 'Tennis', url: createPageUrl('Events') + '?category=Sports&sport=tennis', icon: Trophy },
            { label: 'Athletics', url: createPageUrl('Events') + '?category=Sports&sport=athletics', icon: Trophy },
            { label: 'Winter Sports', url: createPageUrl('Events') + '?category=Sports&sport=winter', icon: Trophy },
          ]
        },
        {
          title: 'Browse',
          items: [
            { label: 'All Events', url: createPageUrl('Events'), icon: Calendar },
            { label: 'This Weekend', url: createPageUrl('Events') + '?time=weekend', icon: TrendingUp },
            { label: 'Free Events', url: createPageUrl('Events') + '?price=free', icon: Star }
          ]
        }
      ]
    }
  };

  const navItems = [
    { menuKey: 'cities',      label: 'Cities',      icon: MapPin   },
    { menuKey: 'attractions', label: 'Attractions', icon: Eye      },
    { menuKey: 'restaurants', label: 'Restaurants', icon: Utensils },
    { menuKey: 'hotels',      label: 'Hotels',      icon: Hotel    },
    { menuKey: 'events',      label: 'Events',      icon: Calendar },
    { menuKey: 'sports',      label: 'Sports',      icon: Trophy   },
    { menuKey: 'services',    label: 'Services',    icon: Briefcase},
  ];

  return (
    <nav className="hidden lg:flex items-center space-x-2">
      {navItems.map(({ menuKey, label, icon: Icon }) => {
        const isActive = activeMenu === menuKey;
        return (
          <div
            key={menuKey}
            className="relative"
            onMouseEnter={() => handleMenuEnter(menuKey)}
            onMouseLeave={handleMenuLeave}
          >
            {/* Trigger button */}
            <button className="text-gray-700 hover:text-[var(--primary-orange)] transition-all duration-300 font-medium px-4 py-2 flex items-center gap-2 relative group">
              <Icon className="h-4 w-4" />
              {label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] group-hover:w-full transition-all duration-300"></span>
            </button>

            {/* Dropdown — negative margin pulls it up to remove gap, padding restores visual spacing */}
            {isActive && (
              <div
                className="absolute top-full left-0 z-50 animate-in slide-in-from-top-2 duration-200"
                style={{ marginTop: '-4px', paddingTop: '8px' }}
              >
                <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 min-w-[600px]">
                  <div className="grid grid-cols-2 gap-8">
                    {menus[menuKey].sections.map((section, idx) => (
                      <div key={idx}>
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                          {section.title}
                        </h3>
                        <ul className="space-y-2">
                          {section.items.map((item, itemIdx) => (
                            <li key={itemIdx}>
                              <Link
                                to={item.url}
                                className="flex items-center gap-2 text-gray-600 hover:text-[var(--primary-orange)] transition-colors group py-1"
                                onClick={() => setActiveMenu(null)}
                              >
                                <item.icon className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                                <div className="flex-1">
                                  <span className="text-sm font-medium">{item.label}</span>
                                  {item.subtitle && (
                                    <p className="text-xs text-gray-500">{item.subtitle}</p>
                                  )}
                                </div>
                                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Featured Banner */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="bg-gradient-to-r from-[var(--primary-orange)]/10 to-[var(--primary-yellow)]/10 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-900">Need help planning?</p>
                        <p className="text-xs text-gray-600">Ask our AI Travel Assistant</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white">
                        Ask AI
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}