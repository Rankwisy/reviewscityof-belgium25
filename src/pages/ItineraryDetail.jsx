import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Plus, Trash2, Save, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, addDays, differenceInDays } from 'date-fns';
import SEO from '../components/SEO';

export default function ItineraryDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const itineraryId = urlParams.get('id');
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => {
        base44.auth.redirectToLogin(window.location.href);
      });
  }, []);

  const { data: itinerary, isLoading } = useQuery({
    queryKey: ['itinerary', itineraryId],
    queryFn: async () => {
      const itineraries = await base44.entities.Itinerary.filter({ id: itineraryId });
      return itineraries[0];
    },
    enabled: !!itineraryId && !!user,
  });

  const { data: attractions = [] } = useQuery({
    queryKey: ['attractions'],
    queryFn: () => base44.entities.Attraction.list('-rating', 500),
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list('-rating', 500),
  });

  const { data: hotels = [] } = useQuery({
    queryKey: ['hotels'],
    queryFn: () => base44.entities.Hotel.list('-rating', 500),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => base44.entities.Favorite.list('-created_date', 1000),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Itinerary.update(itineraryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itinerary', itineraryId] });
      setEditing(false);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--belgian-red)]" />
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="py-20 px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Itinerary Not Found</h1>
        <p className="text-gray-600">The itinerary you're looking for doesn't exist.</p>
      </div>
    );
  }

  const dayCount = itinerary.start_date && itinerary.end_date
    ? differenceInDays(new Date(itinerary.end_date), new Date(itinerary.start_date)) + 1
    : 1;

  const days = itinerary.days || [];

  const addDay = () => {
    const newDays = [...days, {
      day_number: days.length + 1,
      date: itinerary.start_date ? format(addDays(new Date(itinerary.start_date), days.length), 'yyyy-MM-dd') : '',
      city: '',
      items: []
    }];
    updateMutation.mutate({ ...itinerary, days: newDays });
  };

  const addItemToDay = (dayIndex, type, itemId) => {
    const newDays = [...days];
    const item = type === 'attraction' ? attractions.find(a => a.id === itemId)
      : type === 'restaurant' ? restaurants.find(r => r.id === itemId)
      : hotels.find(h => h.id === itemId);

    newDays[dayIndex].items.push({
      type,
      item_id: itemId,
      time: '',
      notes: ''
    });
    updateMutation.mutate({ ...itinerary, days: newDays });
  };

  const removeItemFromDay = (dayIndex, itemIndex) => {
    const newDays = [...days];
    newDays[dayIndex].items.splice(itemIndex, 1);
    updateMutation.mutate({ ...itinerary, days: newDays });
  };

  return (
    <div className="py-12 px-4">
      <SEO 
        title={`${itinerary.title} - My Itinerary`}
        description={itinerary.description || 'My travel itinerary for Belgium'}
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {editing ? (
            <div className="space-y-4">
              <Input
                value={itinerary.title}
                onChange={(e) => updateMutation.mutate({ ...itinerary, title: e.target.value })}
                className="text-3xl font-bold"
              />
              <Textarea
                value={itinerary.description || ''}
                onChange={(e) => updateMutation.mutate({ ...itinerary, description: e.target.value })}
                placeholder="Add a description..."
              />
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{itinerary.title}</h1>
              {itinerary.description && (
                <p className="text-lg text-gray-600">{itinerary.description}</p>
              )}
            </>
          )}

          <div className="flex items-center gap-6 mt-4 text-gray-600">
            {itinerary.start_date && itinerary.end_date && (
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {format(new Date(itinerary.start_date), 'MMM d')} - {format(new Date(itinerary.end_date), 'MMM d, yyyy')}
                <span className="ml-2 text-sm">({dayCount} days)</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={() => setEditing(!editing)} variant="outline">
              {editing ? 'Cancel' : 'Edit Details'}
            </Button>
          </div>
        </div>

        {/* Favorites Quick Add */}
        {favorites.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-lg">Quick Add from Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Add your saved places to your itinerary
              </p>
              <div className="flex flex-wrap gap-2">
                {favorites.slice(0, 6).map((fav) => (
                  <Button
                    key={fav.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (days.length === 0) {
                        alert('Please add a day first');
                        return;
                      }
                      addItemToDay(days.length - 1, fav.item_type, fav.item_id);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {fav.item_name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Days */}
        <div className="space-y-6">
          {days.map((day, dayIndex) => (
            <DayCard
              key={dayIndex}
              day={day}
              dayIndex={dayIndex}
              attractions={attractions}
              restaurants={restaurants}
              hotels={hotels}
              onAddItem={addItemToDay}
              onRemoveItem={removeItemFromDay}
            />
          ))}

          <Button
            onClick={addDay}
            variant="outline"
            className="w-full border-dashed border-2"
            disabled={updateMutation.isPending}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Day {days.length + 1}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DayCard({ day, dayIndex, attractions, restaurants, hotels, onAddItem, onRemoveItem }) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [itemType, setItemType] = useState('attraction');
  const [selectedItemId, setSelectedItemId] = useState('');

  const items = itemType === 'attraction' ? attractions
    : itemType === 'restaurant' ? restaurants
    : hotels;

  const getItem = (type, id) => {
    if (type === 'attraction') return attractions.find(a => a.id === id);
    if (type === 'restaurant') return restaurants.find(r => r.id === id);
    return hotels.find(h => h.id === id);
  };

  return (
    <Card>
      <CardHeader className="bg-gray-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[var(--belgian-red)]" />
            Day {day.day_number}
            {day.date && <span className="text-sm font-normal text-gray-600">- {format(new Date(day.date), 'EEEE, MMM d')}</span>}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {day.items && day.items.length > 0 ? (
          <div className="space-y-3 mb-4">
            {day.items.map((item, itemIndex) => {
              const itemData = getItem(item.type, item.item_id);
              if (!itemData) return null;

              return (
                <div key={itemIndex} className="flex items-start gap-3 p-3 bg-white border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {item.type === 'attraction' && <MapPin className="h-5 w-5 text-blue-500" />}
                    {item.type === 'restaurant' && <Clock className="h-5 w-5 text-orange-500" />}
                    {item.type === 'hotel' && <MapPin className="h-5 w-5 text-purple-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{itemData.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                    {item.time && <p className="text-sm text-gray-600">⏰ {item.time}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(dayIndex, itemIndex)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm mb-4 italic">No activities added yet</p>
        )}

        {showAddMenu ? (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <Select value={itemType} onValueChange={setItemType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attraction">Attraction</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="hotel">Hotel</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Select place" />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (selectedItemId) {
                    onAddItem(dayIndex, itemType, selectedItemId);
                    setSelectedItemId('');
                    setShowAddMenu(false);
                  }
                }}
                className="flex-1 bg-[var(--belgian-red)] hover:bg-[#c00510]"
                disabled={!selectedItemId}
              >
                Add to Day
              </Button>
              <Button variant="outline" onClick={() => setShowAddMenu(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() => setShowAddMenu(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </Button>
        )}
      </CardContent>
    </Card>
  );
}