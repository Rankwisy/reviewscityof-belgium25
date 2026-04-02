import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Train, Bus, Bike, Car, MapPin, Clock, CreditCard,
  ArrowRight, CheckCircle, Globe, Phone, Zap
} from 'lucide-react';
import SEO from '../components/SEO';
import { useLanguage } from './LanguageContext';

const transportModes = [
  {
    icon: Train,
    title: 'Train (SNCB / NMBS)',
    subtitle: 'National Rail Network',
    description:
      'Belgium has one of the densest rail networks in Europe. SNCB/NMBS connects all major cities. Brussels–Bruges takes under 1 hour; Brussels–Antwerp just 40 minutes.',
    gradient: 'from-yellow-500 to-orange-500',
    tips: ['Book at sncb.be for best prices', 'Rail Pass valid for unlimited travel', 'Trains run every 30 min between major cities'],
    link: 'https://www.sncb.be',
    linkLabel: 'sncb.be',
  },
  {
    icon: Bus,
    title: 'Bus & Tram',
    subtitle: 'De Lijn · TEC · STIB-MIVB',
    description:
      'Urban and regional buses and trams cover the whole country. De Lijn serves Flanders, TEC covers Wallonia, and STIB/MIVB operates in Brussels with trams, buses and metro.',
    gradient: 'from-blue-500 to-cyan-500',
    tips: ['Buy a 10-trip card for savings', 'Validate your ticket on boarding', 'STIB night buses run until 3 AM on weekends'],
    link: 'https://www.stib-mivb.be',
    linkLabel: 'stib-mivb.be',
  },
  {
    icon: Zap,
    title: 'Metro (Brussels)',
    subtitle: 'STIB-MIVB Underground',
    description:
      'Brussels has 4 metro lines plus 3 premetro lines connecting the city centre with outer districts. Fast, frequent and affordable — the best way to get around the capital.',
    gradient: 'from-purple-500 to-pink-500',
    tips: ['Runs 6 AM – midnight daily', 'Same ticket as tram and bus', 'Line 1 & 5 cross the entire city'],
    link: 'https://www.stib-mivb.be',
    linkLabel: 'stib-mivb.be',
  },
  {
    icon: Bike,
    title: 'Cycling',
    subtitle: 'Villo! · Blue-bike · Donkey Republic',
    description:
      'Belgium is cycling-friendly with dedicated lanes throughout cities and countryside. Bike-sharing schemes like Villo! (Brussels), Blue-bike (train stations) and Donkey Republic make it easy.',
    gradient: 'from-green-500 to-emerald-500',
    tips: ['Villo! stations all over Brussels', 'Blue-bike rentals at 90+ train stations', 'Flat terrain makes Bruges & Ghent ideal by bike'],
    link: 'https://www.villo.be',
    linkLabel: 'villo.be',
  },
  {
    icon: Car,
    title: 'Taxi & Rideshare',
    subtitle: 'Uber · Bolt · Taxi Verts',
    description:
      'Uber and Bolt operate in all major Belgian cities. Traditional taxis are metered and reliable — look for official stands at train stations and airports.',
    gradient: 'from-indigo-500 to-violet-500',
    tips: ['Uber and Bolt available city-wide', 'Taxi Verts is the main operator in Brussels', 'Airport taxi to Brussels city: ~€45–55'],
    link: null,
    linkLabel: null,
  },
  {
    icon: MapPin,
    title: 'Car Rental',
    subtitle: 'Avis · Hertz · Europcar · Budget',
    description:
      'Renting a car is the best option for reaching smaller towns like Dinant or the Ardennes. All major rental companies are present at Brussels Airport and main train stations.',
    gradient: 'from-red-500 to-rose-500',
    tips: ['Drive on the right, priority to the right', 'LEZ (Low Emission Zones) apply in Brussels & Antwerp', 'Toll-free motorways throughout Belgium'],
    link: null,
    linkLabel: null,
  },
];

const quickFacts = [
  { icon: Clock, label: 'Brussels → Bruges', value: '55 min by train' },
  { icon: Clock, label: 'Brussels → Antwerp', value: '40 min by train' },
  { icon: Clock, label: 'Brussels → Ghent', value: '32 min by train' },
  { icon: CreditCard, label: 'Metro single ticket', value: '~€2.10' },
  { icon: CreditCard, label: 'Train Brussels–Bruges', value: '~€14.80' },
  { icon: Globe, label: 'Schengen zone', value: 'No border checks' },
];

export default function Transport() {
  const { language } = useLanguage();

  return (
    <>
      <SEO
        title="Transport in Belgium — Getting Around Made Easy"
        description="Complete guide to public transport in Belgium: trains (SNCB/NMBS), buses, trams, metro, cycling and taxis. Tips for getting around Brussels, Bruges, Ghent and Antwerp."
        url="https://cityreview.be/localservices/transport"
      />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 py-20 px-4 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-cyan-300 blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto relative text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm">
            Getting Around Belgium
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Transport in Belgium
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Everything you need to know about trains, buses, trams, cycling and taxis across Belgium's most beautiful cities.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to={createPageUrl('Cities')}>
              <Button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold">
                Explore Cities
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to={createPageUrl('LocalServices')}>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                All Local Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick facts */}
      <section className="bg-white border-b border-gray-100 py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickFacts.map((fact, i) => (
            <div key={i} className="text-center p-3">
              <fact.icon className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">{fact.label}</p>
              <p className="text-sm font-bold text-gray-900">{fact.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Transport modes */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Ways to Get Around
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Belgium's compact size means you can reach any corner of the country quickly and cheaply using public transport.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {transportModes.map((mode) => (
              <Card key={mode.title} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-r ${mode.gradient} p-5 flex items-center gap-4`}>
                    <div className="bg-white/20 rounded-xl p-3">
                      <mode.icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg leading-tight">{mode.title}</h3>
                      <p className="text-white/80 text-sm">{mode.subtitle}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-gray-600 text-sm mb-4">{mode.description}</p>
                    <ul className="space-y-1 mb-4">
                      {mode.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                    {mode.link && (
                      <a
                        href={mode.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Globe className="h-3 w-3" />
                        {mode.linkLabel}
                        <ArrowRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to Explore Belgium?</h2>
          <p className="text-white/90 mb-8">
            Browse hotels, restaurants and attractions near Belgium's best transport hubs.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={createPageUrl('Hotels')}>
              <Button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold">
                Find Hotels
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to={createPageUrl('Attractions')}>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Top Attractions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
