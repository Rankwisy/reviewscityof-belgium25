import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Languages, Calendar, Utensils, Music, Heart, Gift,
  Clock, Coffee, Users, Sparkles
} from 'lucide-react';
import SEO from '../components/SEO';

export default function BelgianCulture() {
  const languages = [
    {
      name: 'Dutch (Flemish)',
      region: 'Flanders (North)',
      percentage: '60%',
      phrases: [
        { phrase: 'Goeiemorgen', meaning: 'Good morning' },
        { phrase: 'Dank u wel', meaning: 'Thank you' },
        { phrase: 'Alstublieft', meaning: 'Please' },
        { phrase: 'Tot ziens', meaning: 'Goodbye' }
      ]
    },
    {
      name: 'French',
      region: 'Wallonia (South)',
      percentage: '40%',
      phrases: [
        { phrase: 'Bonjour', meaning: 'Good morning' },
        { phrase: 'Merci', meaning: 'Thank you' },
        { phrase: 'S\'il vous plaît', meaning: 'Please' },
        { phrase: 'Au revoir', meaning: 'Goodbye' }
      ]
    },
    {
      name: 'German',
      region: 'Eastern Belgium',
      percentage: '<1%',
      phrases: [
        { phrase: 'Guten Morgen', meaning: 'Good morning' },
        { phrase: 'Danke', meaning: 'Thank you' },
        { phrase: 'Bitte', meaning: 'Please' },
        { phrase: 'Auf Wiedersehen', meaning: 'Goodbye' }
      ]
    }
  ];

  const etiquette = [
    {
      icon: Users,
      title: 'Greetings',
      description: 'A handshake is standard. Friends may exchange kisses on the cheek (three times in Belgium!). Use formal titles until invited to use first names.'
    },
    {
      icon: Utensils,
      title: 'Dining',
      description: 'Keep hands visible on the table. Wait for everyone to be served before eating. Say "Smakelijk" (Dutch) or "Bon appétit" (French) before meals.'
    },
    {
      icon: Gift,
      title: 'Gift Giving',
      description: 'Bring chocolates, wine, or flowers when invited to someone\'s home. Avoid chrysanthemums (used for funerals) and white flowers.'
    },
    {
      icon: Clock,
      title: 'Punctuality',
      description: 'Being on time is important. If you\'re running late, call ahead. For social events, arriving 10-15 minutes late is acceptable.'
    }
  ];

  const holidays = [
    { date: 'Jan 1', name: 'New Year\'s Day', description: 'National holiday' },
    { date: 'Mar/Apr', name: 'Easter Monday', description: 'National holiday' },
    { date: 'May 1', name: 'Labour Day', description: 'National holiday' },
    { date: 'May', name: 'Ascension Day', description: '39 days after Easter' },
    { date: 'May/Jun', name: 'Whit Monday', description: '50 days after Easter' },
    { date: 'Jul 21', name: 'Belgian National Day', description: 'Independence celebration' },
    { date: 'Aug 15', name: 'Assumption Day', description: 'Religious holiday' },
    { date: 'Nov 1', name: 'All Saints\' Day', description: 'National holiday' },
    { date: 'Nov 11', name: 'Armistice Day', description: 'WWI remembrance' },
    { date: 'Dec 25', name: 'Christmas Day', description: 'National holiday' }
  ];

  const festivals = [
    {
      name: 'Carnival',
      season: 'February/March',
      description: 'Colorful parades and celebrations, especially famous in Binche',
      image: 'https://images.unsplash.com/photo-1582719188393-c590485b09f8?w=800&q=80'
    },
    {
      name: 'Gentse Feesten',
      season: 'July',
      description: 'Ghent\'s 10-day cultural festival with music and street performances',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80'
    },
    {
      name: 'Christmas Markets',
      season: 'December',
      description: 'Magical winter markets across Belgian cities',
      image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80'
    },
    {
      name: 'Ommegang',
      season: 'June/July',
      description: 'Historic pageant in Brussels\' Grand Place',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'
    }
  ];

  const culturalTips = [
    {
      icon: Coffee,
      title: 'Beer Culture',
      description: 'Belgium is world-famous for its beer. Each beer has its own special glass. Order a "pintje" for a small beer or specify the brand you want.'
    },
    {
      icon: Utensils,
      title: 'Food Traditions',
      description: 'Fries (frites/frieten) are a national treasure. Waffles come in two types: Brussels (lighter) and Liège (denser, sweeter). Chocolate is a serious business.'
    },
    {
      icon: Music,
      title: 'Arts & Music',
      description: 'Belgium has a rich musical tradition from classical to electronic music. The country hosts numerous music festivals throughout summer.'
    },
    {
      icon: Sparkles,
      title: 'Comic Culture',
      description: 'Belgium is the birthplace of famous comics like Tintin and The Smurfs. Brussels has comic strip murals throughout the city.'
    }
  ];

  return (
    <div className="py-12 px-4">
      <SEO 
        title="Belgian Culture Guide - Language, Etiquette & Traditions"
        description="Essential guide to Belgian culture, languages, etiquette, holidays, and traditions. Everything you need to know before visiting Belgium."
        keywords="Belgian culture, Belgium language, Belgian etiquette, Belgium holidays, Belgian traditions, Belgium festivals"
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Belgian Culture Guide</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Understanding Belgian culture, languages, and customs to make the most of your visit
          </p>
        </div>

        {/* Languages Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Languages className="h-10 w-10 text-[var(--primary-orange)]" />
            <h2 className="text-4xl font-bold text-gray-900">Languages of Belgium</h2>
          </div>
          
          <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="pt-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                Belgium is officially trilingual with three official languages: Dutch (spoken in Flanders), 
                French (spoken in Wallonia), and German (spoken in a small eastern region). Brussels is officially 
                bilingual (French and Dutch). Most Belgians speak at least two languages, and many speak English, 
                especially in tourist areas.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {languages.map((lang, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{lang.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{lang.region}</p>
                    <Badge className="bg-[var(--primary-orange)] text-white text-lg">
                      {lang.percentage}
                    </Badge>
                  </div>
                  <div className="space-y-2 mt-6">
                    <p className="font-semibold text-sm text-gray-700 mb-3">Useful Phrases:</p>
                    {lang.phrases.map((p, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded">
                        <p className="font-semibold text-gray-900">{p.phrase}</p>
                        <p className="text-sm text-gray-600">{p.meaning}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Etiquette Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-10 w-10 text-[var(--primary-orange)]" />
            <h2 className="text-4xl font-bold text-gray-900">Belgian Etiquette</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {etiquette.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-[var(--primary-orange)] bg-opacity-10 p-3 rounded-full">
                      <item.icon className="h-8 w-8 text-[var(--primary-orange)]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-700">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Cultural Tips */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Cultural Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {culturalTips.map((tip, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className="bg-[var(--primary-yellow)] bg-opacity-20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <tip.icon className="h-10 w-10 text-[var(--primary-orange)]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Holidays Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="h-10 w-10 text-[var(--primary-orange)]" />
            <h2 className="text-4xl font-bold text-gray-900">Public Holidays & Festivals</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Public Holidays */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Public Holidays</h3>
                <div className="space-y-3">
                  {holidays.map((holiday, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                      <Badge className="bg-[var(--primary-orange)] text-white shrink-0">
                        {holiday.date}
                      </Badge>
                      <div>
                        <p className="font-semibold text-gray-900">{holiday.name}</p>
                        <p className="text-sm text-gray-600">{holiday.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Festivals */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Major Festivals</h3>
              {festivals.map((festival, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-1/3 h-40 sm:h-auto">
                      <img 
                        src={festival.image} 
                        alt={festival.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="sm:w-2/3 pt-4">
                      <Badge className="bg-[var(--primary-yellow)] text-gray-900 mb-2">
                        {festival.season}
                      </Badge>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{festival.name}</h4>
                      <p className="text-sm text-gray-600">{festival.description}</p>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Tips */}
        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardContent className="pt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Cultural Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-700">🍺 Beer is typically served in its own branded glass</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-700">🚴 Cycling is a major part of Belgian culture and sport</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-700">🎨 Art Nouveau architecture is prevalent in Brussels</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-700">🏛️ Museums often close on Mondays</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-700">💳 Most places accept cards, but carry some cash</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-700">🚭 Smoking is banned in public indoor spaces</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}