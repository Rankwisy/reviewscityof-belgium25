import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AttractionCard from '../components/home/AttractionCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useTranslation } from './translations';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import { createPageUrl } from '@/utils';

export default function Attractions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const { language } = useLanguage();
  const t = useTranslation(language);

  const { data: attractions = [], isLoading } = useQuery({
    queryKey: ['attractions'],
    queryFn: () => base44.entities.Attraction.list('-rating', 100),
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list('-name', 50),
  });

  const filteredAttractions = attractions.filter(attraction => {
    const matchesSearch = attraction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         attraction.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || attraction.category === categoryFilter;
    const matchesCity = cityFilter === 'all' || attraction.city_slug === cityFilter;
    return matchesSearch && matchesCategory && matchesCity;
  });

  const categories = ['Museums & Galleries', 'Historical Sites', 'Parks & Nature', 'Nightlife & Entertainment', 'Tours & Experiences'];

  const breadcrumbItems = [
    { label: 'Attractions', url: createPageUrl('Attractions') }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="py-12 px-4">
        <SEO 
          title={t('attractions.title')}
          description={t('attractions.subtitle')}
          keywords="Belgium attractions, things to do, Belgium tourism, Belgian landmarks"
        />

        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">{t('attractions.title')}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('attractions.subtitle')}
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={t('attractions.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder={t('attractions.allCategories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('attractions.allCategories')}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder={t('attractions.allCities')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('attractions.allCities')}</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.slug}>{city.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {t('attractions.showing')} {filteredAttractions.length} {filteredAttractions.length === 1 ? t('attractions.attraction') : t('attractions.attractionsPlural')}
          </p>
        </div>

        {/* Attractions Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--belgian-red)]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAttractions.map((attraction) => (
              <AttractionCard key={attraction.id} attraction={attraction} />
            ))}
          </div>
        )}

        {filteredAttractions.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('attractions.noResults')}</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}