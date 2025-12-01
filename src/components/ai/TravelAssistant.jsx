import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle, X, Send, Sparkles, MapPin, Calendar,
  Utensils, Hotel, Clock, User, Bot, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TravelAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      setMessages([
        {
          role: 'assistant',
          content: `Hello! 👋 I'm your AI travel assistant for Belgium. I can help you with:

• Discover cities, attractions, restaurants & hotels
• Plan custom itineraries based on your interests
• Find upcoming events in specific cities
• Answer questions about Belgian culture & travel
• Get personalized recommendations

What would you like to explore today?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchContextData = async (userQuery) => {
    try {
      // Fetch relevant data - using .list() to avoid filter issues
      const [allCities, allAttractions, allRestaurants, allHotels, allEvents] = await Promise.all([
        base44.entities.City.list('-created_date', 50),
        base44.entities.Attraction.list('-rating', 50),
        base44.entities.Restaurant.list('-rating', 50),
        base44.entities.Hotel.list('-rating', 50),
        base44.entities.Event.list('start_date', 50)
      ]);

      // Filter featured items in JavaScript
      const cities = allCities.filter(c => c.featured).slice(0, 10);
      const attractions = allAttractions.filter(a => a.featured).slice(0, 10);
      const restaurants = allRestaurants.filter(r => r.featured).slice(0, 10);
      const hotels = allHotels.filter(h => h.featured).slice(0, 10);
      const events = allEvents.slice(0, 10);

      return {
        cities: cities.map(c => ({ name: c.name, slug: c.slug, tagline: c.tagline })),
        attractions: attractions.map(a => ({ name: a.name, slug: a.slug, city: a.city_slug, category: a.category, rating: a.rating })),
        restaurants: restaurants.map(r => ({ name: r.name, slug: r.slug, city: r.city_slug, cuisine: r.cuisine_type })),
        hotels: hotels.map(h => ({ name: h.name, slug: h.slug, city: h.city_slug, type: h.type })),
        events: events.map(e => ({ name: e.name, city: e.city_slug, date: e.start_date, category: e.category }))
      };
    } catch (error) {
      console.error('Error fetching context:', error);
      return null;
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Fetch relevant data
      const contextData = await fetchContextData(inputValue);

      // Build context for AI
      let contextString = `You are a helpful travel assistant for CityReview.be, a Belgium travel guide platform.
      
Current user query: "${inputValue}"

Available data about Belgium:
- Cities: ${contextData?.cities.map(c => c.name).join(', ')}
- Top Attractions: ${contextData?.attractions.slice(0, 5).map(a => `${a.name} in ${a.city}`).join(', ')}
- Restaurants: ${contextData?.restaurants.slice(0, 5).map(r => `${r.name} (${r.cuisine}) in ${r.city}`).join(', ')}
- Upcoming Events: ${contextData?.events.slice(0, 3).map(e => `${e.name} in ${e.city}`).join(', ')}

Guidelines:
- Be friendly, helpful, and enthusiastic about Belgium
- Provide specific recommendations when asked
- Mention actual cities, attractions, restaurants from the data above
- Keep responses concise but informative (2-3 paragraphs max)
- If asked about itineraries, suggest a day-by-day plan
- Include practical tips when relevant
- Use emojis occasionally to be friendly
- If you mention a specific place, try to include its city/location

Answer the user's question naturally and helpfully:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: contextString,
        add_context_from_internet: false
      });

      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        suggestions: extractSuggestions(response, contextData)
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment! 🙏",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const extractSuggestions = (response, contextData) => {
    // Extract city/attraction names mentioned in response and create quick links
    const suggestions = [];
    
    if (contextData) {
      contextData.cities.forEach(city => {
        if (response.toLowerCase().includes(city.name.toLowerCase())) {
          suggestions.push({
            type: 'city',
            label: `View ${city.name}`,
            url: createPageUrl('CityDetail') + '?city=' + city.slug,
            icon: MapPin
          });
        }
      });
    }

    return suggestions.slice(0, 3); // Max 3 suggestions per message
  };

  const quickPrompts = [
    { icon: MapPin, text: "Best cities for a weekend trip", color: "bg-blue-500" },
    { icon: Utensils, text: "Where to eat in Brussels", color: "bg-orange-500" },
    { icon: Calendar, text: "Upcoming events this month", color: "bg-purple-500" },
    { icon: Hotel, text: "Romantic hotels in Bruges", color: "bg-pink-500" }
  ];

  const handleQuickPrompt = (text) => {
    setInputValue(text);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] hover:scale-110 transition-all duration-300 pulse-glow"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md animate-in slide-in-from-bottom-5">
      <Card className="shadow-2xl border-2 border-[var(--primary-orange)]/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] p-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold">Belgium Travel Assistant</h3>
              <p className="text-white/80 text-xs">Powered by AI</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <CardContent className="p-0">
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-gray-300' 
                    : 'bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)]'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-gray-700" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                  <div className={`inline-block max-w-[85%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-[var(--primary-orange)] text-white rounded-tr-none'
                      : 'bg-white text-gray-900 rounded-tl-none shadow-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-line leading-relaxed">
                      {message.content}
                    </p>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  {/* Quick links for mentioned places */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <Link key={idx} to={suggestion.url}>
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer flex items-center gap-1">
                            <suggestion.icon className="h-3 w-3" />
                            {suggestion.label}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && !isTyping && (
            <div className="p-4 bg-white border-t">
              <p className="text-xs text-gray-500 mb-3">Quick prompts:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt.text)}
                    className="p-3 text-left rounded-lg border hover:border-[var(--primary-orange)] hover:bg-orange-50 transition-all group"
                  >
                    <div className={`w-6 h-6 rounded ${prompt.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <prompt.icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xs font-medium text-gray-700 line-clamp-2">
                      {prompt.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything about Belgium..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] hover:scale-105 transition-transform"
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Powered by AI • Responses may vary
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}