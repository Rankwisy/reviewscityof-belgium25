import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, MapPin, Utensils, Users, Bus, 
  RefreshCw, AlertCircle, Loader2 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AITravelGuide({ cityName, citySlug }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guide, setGuide] = useState(null);
  const [activeTab, setActiveTab] = useState('attractions');

  const generateGuide = async () => {
    setLoading(true);
    setError(null);

    try {
      const prompt = `Generate a comprehensive travel guide for ${cityName}, Belgium. 
      
Provide detailed, practical, and engaging information in JSON format with the following structure:

{
  "topAttractions": [
    {
      "name": "attraction name",
      "description": "2-3 sentences about why it's special",
      "tips": "practical visitor tip",
      "bestTime": "when to visit"
    }
  ],
  "localCuisine": {
    "musttry": [
      {
        "dish": "dish name",
        "description": "what it is and why to try it",
        "whereToFind": "best places or restaurants to try it"
      }
    ],
    "restaurants": [
      {
        "type": "restaurant type/category",
        "recommendation": "what makes it special"
      }
    ],
    "foodTips": ["practical eating tip 1", "practical eating tip 2"]
  },
  "culturalEtiquette": {
    "greetings": "how locals greet each other",
    "dining": "dining customs and etiquette",
    "tipping": "tipping practices",
    "language": "language tips and useful phrases",
    "customs": ["important custom 1", "important custom 2", "important custom 3"]
  },
  "gettingAround": {
    "publicTransport": {
      "description": "overview of public transport",
      "tickets": "how to buy tickets and pricing",
      "tips": "practical tips for using public transport"
    },
    "walking": "walkability and pedestrian tips",
    "cycling": "cycling infrastructure and bike rentals",
    "taxis": "taxi and ride-sharing information",
    "parking": "parking tips if driving"
  }
}

Make the content practical, specific to ${cityName}, and helpful for tourists. Include 5-6 top attractions, 4-5 must-try dishes, and comprehensive transport information.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            topAttractions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  tips: { type: "string" },
                  bestTime: { type: "string" }
                }
              }
            },
            localCuisine: {
              type: "object",
              properties: {
                musttry: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      dish: { type: "string" },
                      description: { type: "string" },
                      whereToFind: { type: "string" }
                    }
                  }
                },
                restaurants: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      recommendation: { type: "string" }
                    }
                  }
                },
                foodTips: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            culturalEtiquette: {
              type: "object",
              properties: {
                greetings: { type: "string" },
                dining: { type: "string" },
                tipping: { type: "string" },
                language: { type: "string" },
                customs: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            gettingAround: {
              type: "object",
              properties: {
                publicTransport: {
                  type: "object",
                  properties: {
                    description: { type: "string" },
                    tickets: { type: "string" },
                    tips: { type: "string" }
                  }
                },
                walking: { type: "string" },
                cycling: { type: "string" },
                taxis: { type: "string" },
                parking: { type: "string" }
              }
            }
          }
        }
      });

      setGuide(response);
    } catch (err) {
      console.error('Error generating guide:', err);
      setError('Failed to generate travel guide. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!guide && !loading) {
    return (
      <Card className="border-2 border-dashed border-[var(--primary-orange)] bg-gradient-to-br from-orange-50 to-yellow-50">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-yellow)] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            AI-Powered Travel Guide
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get a personalized, comprehensive travel guide for {cityName} generated by AI. 
            Discover hidden gems, local cuisine, cultural tips, and more!
          </p>
          <Button 
            onClick={generateGuide}
            size="lg"
            className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] hover:shadow-xl transition-all duration-300 hover:scale-105 text-white border-0"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Generate AI Travel Guide
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-yellow-50">
        <CardContent className="pt-12 pb-12 text-center">
          <Loader2 className="h-12 w-12 text-[var(--primary-orange)] animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Generating Your Travel Guide...
          </h3>
          <p className="text-gray-600">
            Our AI is crafting a personalized guide for {cityName}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
        <Button 
          onClick={generateGuide}
          size="sm"
          variant="outline"
          className="mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white border-0 shadow-xl">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">AI-Generated Travel Guide</h3>
                <p className="text-white/90 text-sm">Personalized insights for {cityName}</p>
              </div>
            </div>
            <Button 
              onClick={generateGuide}
              size="sm"
              variant="secondary"
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Card className="border-0 shadow-xl">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="attractions" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Attractions</span>
              </TabsTrigger>
              <TabsTrigger value="cuisine" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                <span className="hidden sm:inline">Cuisine</span>
              </TabsTrigger>
              <TabsTrigger value="culture" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Culture</span>
              </TabsTrigger>
              <TabsTrigger value="transport" className="flex items-center gap-2">
                <Bus className="h-4 w-4" />
                <span className="hidden sm:inline">Transport</span>
              </TabsTrigger>
            </TabsList>

            {/* Top Attractions Tab */}
            <TabsContent value="attractions" className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-[var(--primary-orange)]" />
                  Top Attractions in {cityName}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {guide.topAttractions?.map((attraction, index) => (
                    <Card key={index} className="hover:shadow-lg transition-all duration-300 border-l-4 border-[var(--primary-orange)]">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Badge className="bg-[var(--primary-orange)] text-white text-lg px-3 py-1 flex-shrink-0">
                            {index + 1}
                          </Badge>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900 mb-2">{attraction.name}</h4>
                            <p className="text-gray-700 mb-3">{attraction.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-xs font-semibold text-blue-800 mb-1">💡 Visitor Tip</p>
                                <p className="text-sm text-blue-900">{attraction.tips}</p>
                              </div>
                              <div className="bg-green-50 rounded-lg p-3">
                                <p className="text-xs font-semibold text-green-800 mb-1">⏰ Best Time</p>
                                <p className="text-sm text-green-900">{attraction.bestTime}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Local Cuisine Tab */}
            <TabsContent value="cuisine" className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Utensils className="h-6 w-6 text-[var(--primary-orange)]" />
                  Local Cuisine in {cityName}
                </h3>
                
                {/* Must-Try Dishes */}
                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">🍽️ Must-Try Dishes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {guide.localCuisine?.musttry?.map((item, index) => (
                      <Card key={index} className="hover:shadow-lg transition-all duration-300">
                        <CardContent className="pt-6">
                          <h5 className="text-lg font-bold text-gray-900 mb-2">{item.dish}</h5>
                          <p className="text-gray-700 text-sm mb-3">{item.description}</p>
                          <div className="bg-orange-50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-orange-800 mb-1">📍 Where to Find</p>
                            <p className="text-sm text-orange-900">{item.whereToFind}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Restaurant Types */}
                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">🏪 Restaurant Recommendations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {guide.localCuisine?.restaurants?.map((rest, index) => (
                      <Card key={index} className="border-l-4 border-[var(--primary-yellow)]">
                        <CardContent className="pt-4">
                          <h5 className="font-bold text-gray-900 mb-1">{rest.type}</h5>
                          <p className="text-sm text-gray-700">{rest.recommendation}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Food Tips */}
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">💡 Dining Tips</h4>
                  <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
                    <CardContent className="pt-6">
                      <ul className="space-y-2">
                        {guide.localCuisine?.foodTips?.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-700">
                            <span className="text-[var(--primary-orange)] mt-1">✓</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Cultural Etiquette Tab */}
            <TabsContent value="culture" className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-6 w-6 text-[var(--primary-orange)]" />
                  Cultural Etiquette in {cityName}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card className="border-t-4 border-[var(--primary-orange)]">
                    <CardHeader>
                      <CardTitle className="text-lg">👋 Greetings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{guide.culturalEtiquette?.greetings}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-t-4 border-[var(--primary-yellow)]">
                    <CardHeader>
                      <CardTitle className="text-lg">🍴 Dining Customs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{guide.culturalEtiquette?.dining}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-t-4 border-blue-500">
                    <CardHeader>
                      <CardTitle className="text-lg">💰 Tipping</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{guide.culturalEtiquette?.tipping}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-t-4 border-green-500">
                    <CardHeader>
                      <CardTitle className="text-lg">🗣️ Language</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{guide.culturalEtiquette?.language}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>🎭</span>
                      Important Customs to Know
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {guide.culturalEtiquette?.customs?.map((custom, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Badge className="bg-purple-600 text-white flex-shrink-0">{index + 1}</Badge>
                          <span className="text-gray-700">{custom}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Getting Around Tab */}
            <TabsContent value="transport" className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Bus className="h-6 w-6 text-[var(--primary-orange)]" />
                  Getting Around {cityName}
                </h3>

                <div className="space-y-4">
                  <Card className="border-l-4 border-blue-500">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bus className="h-5 w-5 text-blue-600" />
                        Public Transport
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="font-semibold text-gray-800 mb-1">Overview</p>
                        <p className="text-gray-700 text-sm">{guide.gettingAround?.publicTransport?.description}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="font-semibold text-blue-800 mb-1">🎫 Tickets & Pricing</p>
                        <p className="text-sm text-blue-900">{guide.gettingAround?.publicTransport?.tickets}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="font-semibold text-green-800 mb-1">💡 Tips</p>
                        <p className="text-sm text-green-900">{guide.gettingAround?.publicTransport?.tips}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">🚶 Walking</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 text-sm">{guide.gettingAround?.walking}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">🚲 Cycling</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 text-sm">{guide.gettingAround?.cycling}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">🚕 Taxis & Ride-Sharing</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 text-sm">{guide.gettingAround?.taxis}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">🅿️ Parking</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 text-sm">{guide.gettingAround?.parking}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription className="text-xs">
          This travel guide was generated by AI and provides general recommendations. 
          Always verify important details like opening hours, prices, and availability before your visit.
        </AlertDescription>
      </Alert>
    </div>
  );
}