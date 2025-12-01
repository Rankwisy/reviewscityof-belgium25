import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, MapPin, Utensils, Clock, Euro, Users, Heart, 
  TrendingUp, Sparkles, RefreshCw, AlertCircle, Loader2,
  CheckCircle, Coffee, Camera, Sunrise, Sun, Sunset, Moon
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const TIME_ICONS = {
  morning: Sunrise,
  midday: Sun,
  afternoon: Sun,
  evening: Sunset,
  night: Moon
};

export default function AIItineraryPlanner({ cityName, citySlug }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [showForm, setShowForm] = useState(true);
  
  // Form state
  const [duration, setDuration] = useState('1');
  const [budget, setBudget] = useState('moderate');
  const [interests, setInterests] = useState({
    history: false,
    food: false,
    art: false,
    nature: false,
    shopping: false,
    nightlife: false,
    architecture: false,
    museums: false
  });
  const [pace, setPace] = useState('moderate');
  const [travelStyle, setTravelStyle] = useState('solo');

  const toggleInterest = (interest) => {
    setInterests(prev => ({
      ...prev,
      [interest]: !prev[interest]
    }));
  };

  const selectedInterests = Object.keys(interests).filter(key => interests[key]);

  const generateItinerary = async () => {
    if (selectedInterests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setLoading(true);
    setError(null);
    setShowForm(false);

    try {
      const interestsList = selectedInterests.join(', ');
      
      const prompt = `Create a detailed ${duration}-day personalized travel itinerary for ${cityName}, Belgium.

Traveler Profile:
- Interests: ${interestsList}
- Budget: ${budget}
- Pace: ${pace} (slow = relaxed with breaks, moderate = balanced, fast = packed schedule)
- Travel style: ${travelStyle}

For each day, provide a structured schedule with:
- Morning activities (8am-12pm)
- Afternoon activities (12pm-6pm)
- Evening activities (6pm-10pm)

Return the itinerary in JSON format:

{
  "title": "Catchy itinerary title",
  "summary": "Brief overview of the trip (2-3 sentences)",
  "days": [
    {
      "day": 1,
      "theme": "Day theme (e.g., Historic Brussels, Foodie Adventure)",
      "activities": [
        {
          "time": "morning/afternoon/evening",
          "timeSlot": "8:00 AM - 10:00 AM",
          "title": "Activity name",
          "location": "Specific location name",
          "description": "What to do and why it's special",
          "type": "attraction/restaurant/activity/shopping/museum",
          "estimatedCost": "€€" (use €, €€, €€€, €€€€),
          "duration": "2 hours",
          "tips": "Practical tip for this activity",
          "travelTime": "15 min walk from previous location"
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "accommodation": "€50-100 per night",
    "food": "€30-50 per day",
    "activities": "€20-40 per day",
    "transport": "€10-15 per day",
    "total": "€110-205 per day"
  },
  "practicalTips": [
    "Practical tip 1",
    "Practical tip 2",
    "Practical tip 3"
  ],
  "transportInfo": {
    "gettingAround": "How to get around the city",
    "ticketRecommendation": "Best ticket/pass to buy"
  }
}

Make sure the itinerary is:
- Realistic with proper timing and travel times
- Matches the ${budget} budget
- Aligned with ${interestsList} interests
- Has a ${pace} pace
- Includes specific restaurant recommendations for meals
- Considers the ${travelStyle} travel style
- Includes hidden gems along with popular attractions
- Has practical tips for each activity`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            summary: { type: "string" },
            days: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "number" },
                  theme: { type: "string" },
                  activities: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        time: { type: "string" },
                        timeSlot: { type: "string" },
                        title: { type: "string" },
                        location: { type: "string" },
                        description: { type: "string" },
                        type: { type: "string" },
                        estimatedCost: { type: "string" },
                        duration: { type: "string" },
                        tips: { type: "string" },
                        travelTime: { type: "string" }
                      }
                    }
                  }
                }
              }
            },
            budgetBreakdown: {
              type: "object",
              properties: {
                accommodation: { type: "string" },
                food: { type: "string" },
                activities: { type: "string" },
                transport: { type: "string" },
                total: { type: "string" }
              }
            },
            practicalTips: {
              type: "array",
              items: { type: "string" }
            },
            transportInfo: {
              type: "object",
              properties: {
                gettingAround: { type: "string" },
                ticketRecommendation: { type: "string" }
              }
            }
          }
        }
      });

      setItinerary(response);
    } catch (err) {
      console.error('Error generating itinerary:', err);
      setError('Failed to generate itinerary. Please try again.');
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setItinerary(null);
    setShowForm(true);
    setError(null);
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardContent className="pt-12 pb-12 text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Creating Your Perfect Itinerary...
          </h3>
          <p className="text-gray-600">
            Our AI is crafting a personalized {duration}-day adventure in {cityName}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {selectedInterests.map((interest) => (
              <Badge key={interest} className="bg-purple-100 text-purple-800 capitalize">
                {interest}
              </Badge>
            ))}
          </div>
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
          onClick={() => {
            setError(null);
            setShowForm(true);
          }}
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

  if (showForm) {
    return (
      <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">AI Itinerary Planner</CardTitle>
              <p className="text-sm text-gray-600">Get a personalized day-by-day plan for {cityName}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Trip Duration */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">How many days?</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="2">2 Days</SelectItem>
                <SelectItem value="3">3 Days</SelectItem>
                <SelectItem value="4">4 Days</SelectItem>
                <SelectItem value="5">5 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">What are you interested in?</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.keys(interests).map((interest) => (
                <div
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`cursor-pointer rounded-lg p-3 border-2 transition-all duration-200 ${
                    interests[interest]
                      ? 'border-purple-600 bg-purple-100'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={interests[interest]}
                      onCheckedChange={() => toggleInterest(interest)}
                      className="pointer-events-none"
                    />
                    <span className="text-sm font-medium capitalize">{interest}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Budget</Label>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="budget">Budget-Friendly (€)</SelectItem>
                <SelectItem value="moderate">Moderate (€€)</SelectItem>
                <SelectItem value="luxury">Luxury (€€€€)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Travel Pace */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Travel Pace</Label>
            <Select value={pace} onValueChange={setPace}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">Slow & Relaxed</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="fast">Fast-Paced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Travel Style */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Travel Style</Label>
            <Select value={travelStyle} onValueChange={setTravelStyle}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Solo Traveler</SelectItem>
                <SelectItem value="couple">Couple</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={generateItinerary}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-xl transition-all duration-300 hover:scale-105 text-white text-lg font-semibold"
            disabled={selectedInterests.length === 0}
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Generate My Perfect Itinerary
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (itinerary) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{itinerary.title}</h3>
                  <p className="text-white/90 text-sm">{duration} days in {cityName}</p>
                </div>
              </div>
              <Button 
                onClick={resetForm}
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Plan
              </Button>
            </div>
            <p className="text-white/95">{itinerary.summary}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedInterests.map((interest) => (
                <Badge key={interest} className="bg-white/20 text-white capitalize">
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Itinerary */}
        {itinerary.days?.map((day, dayIndex) => (
          <Card key={dayIndex} className="border-2 border-purple-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-4 border-b-2 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Day {day.day}</h3>
                  <p className="text-purple-700 font-semibold">{day.theme}</p>
                </div>
                <Badge className="bg-purple-600 text-white text-lg px-4 py-2">
                  {day.activities?.length} Activities
                </Badge>
              </div>
            </div>

            <CardContent className="pt-6">
              <div className="space-y-6">
                {day.activities?.map((activity, actIndex) => {
                  const TimeIcon = TIME_ICONS[activity.time] || Clock;
                  const typeColors = {
                    attraction: 'bg-blue-100 text-blue-800 border-blue-300',
                    restaurant: 'bg-orange-100 text-orange-800 border-orange-300',
                    museum: 'bg-purple-100 text-purple-800 border-purple-300',
                    shopping: 'bg-pink-100 text-pink-800 border-pink-300',
                    activity: 'bg-green-100 text-green-800 border-green-300'
                  };

                  return (
                    <div key={actIndex} className="relative">
                      {actIndex > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 ml-16">
                          <MapPin className="h-4 w-4" />
                          <span>{activity.travelTime || '10 min walk'}</span>
                        </div>
                      )}
                      
                      <Card className="border-l-4 border-purple-400 hover:shadow-xl transition-all duration-300">
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            {/* Time indicator */}
                            <div className="flex flex-col items-center gap-1 flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <TimeIcon className="h-6 w-6 text-white" />
                              </div>
                              <span className="text-xs font-semibold text-gray-600 text-center">
                                {activity.timeSlot}
                              </span>
                            </div>

                            {/* Activity details */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                  <h4 className="text-xl font-bold text-gray-900 mb-1">
                                    {activity.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <MapPin className="h-4 w-4 text-purple-600" />
                                    <span className="font-medium">{activity.location}</span>
                                  </div>
                                </div>
                                <Badge className={`${typeColors[activity.type] || 'bg-gray-100 text-gray-800'} border capitalize`}>
                                  {activity.type}
                                </Badge>
                              </div>

                              <p className="text-gray-700 mb-4">{activity.description}</p>

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-purple-600" />
                                  <span className="font-medium">{activity.duration}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Euro className="h-4 w-4 text-purple-600" />
                                  <span className="font-medium">{activity.estimatedCost}</span>
                                </div>
                              </div>

                              {activity.tips && (
                                <div className="mt-4 bg-purple-50 rounded-lg p-3">
                                  <div className="flex items-start gap-2">
                                    <Sparkles className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-purple-900">
                                      <span className="font-semibold">Tip:</span> {activity.tips}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Budget Breakdown */}
        {itinerary.budgetBreakdown && (
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Euro className="h-6 w-6" />
                Budget Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Accommodation</p>
                  <p className="font-bold text-gray-900">{itinerary.budgetBreakdown.accommodation}</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Food</p>
                  <p className="font-bold text-gray-900">{itinerary.budgetBreakdown.food}</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Activities</p>
                  <p className="font-bold text-gray-900">{itinerary.budgetBreakdown.activities}</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Transport</p>
                  <p className="font-bold text-gray-900">{itinerary.budgetBreakdown.transport}</p>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg p-3 shadow-md text-white md:col-span-2">
                  <p className="text-xs text-green-100 mb-1">Total Estimated Daily</p>
                  <p className="font-bold text-xl">{itinerary.budgetBreakdown.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transport Info */}
        {itinerary.transportInfo && (
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-blue-600" />
                Getting Around
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Transportation</p>
                <p className="text-gray-600">{itinerary.transportInfo.gettingAround}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm font-semibold text-blue-900 mb-1">💡 Ticket Recommendation</p>
                <p className="text-sm text-blue-800">{itinerary.transportInfo.ticketRecommendation}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Practical Tips */}
        {itinerary.practicalTips && itinerary.practicalTips.length > 0 && (
          <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <TrendingUp className="h-6 w-6" />
                Practical Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {itinerary.practicalTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription className="text-xs">
            This itinerary was AI-generated based on your preferences. Times, prices, and availability may vary. 
            Always verify details before your visit and adjust based on your actual pace and interests.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}