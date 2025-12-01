import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User, Mail, Calendar, MapPin, Heart, Trophy, Star,
  Edit, Save, X, Settings, Eye, Utensils, Hotel, Briefcase,
  TrendingUp, Award, Target, Zap, ChevronRight, Upload, Camera,
  Plus, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEO from '../components/SEO';
import BadgeShowcase from '../components/gamification/BadgeShowcase';
import ProgressTracker from '../components/gamification/ProgressTracker';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import { format } from 'date-fns';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((userData) => {
      setUser(userData);
      setFormData({
        full_name: userData.full_name || '',
        bio: userData.bio || '',
        location: userData.location || '',
        interests: userData.interests || [],
        profile_picture: userData.profile_picture || ''
      });
    }).catch(() => {
      base44.auth.redirectToLogin(window.location.pathname);
    });
  }, []);

  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', user?.email],
    queryFn: async () => {
      const progress = await base44.entities.UserProgress.filter({ created_by: user.email });
      return progress[0] || {
        total_points: 0,
        level: 1,
        cities_visited: [],
        attractions_viewed: [],
        reviews_written: 0,
        itineraries_created: 0,
        badges_earned: 0
      };
    },
    enabled: !!user,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['user-achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ created_by: user.email }, '-unlocked_at', 50),
    enabled: !!user,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['user-favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ created_by: user.email }, '-created_date', 100),
    enabled: !!user,
  });

  const { data: itineraries = [] } = useQuery({
    queryKey: ['user-itineraries', user?.email],
    queryFn: () => base44.entities.Itinerary.filter({ created_by: user.email }, '-created_date', 50),
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      setIsEditing(false);
      queryClient.invalidateQueries(['user-progress']);
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, profile_picture: file_url });
      
      // Auto-save profile picture
      await base44.auth.updateMe({ profile_picture: file_url });
      setUser({ ...user, profile_picture: file_url });
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-orange)]"></div>
      </div>
    );
  }

  const favoritesByType = {
    attraction: favorites.filter(f => f.item_type === 'attraction'),
    restaurant: favorites.filter(f => f.item_type === 'restaurant'),
    hotel: favorites.filter(f => f.item_type === 'hotel'),
    city: favorites.filter(f => f.item_type === 'city'),
    event: favorites.filter(f => f.item_type === 'event')
  };

  const recentAchievements = achievements.slice(0, 6);
  const stats = [
    { label: 'Cities Visited', value: userProgress?.cities_visited?.length || 0, icon: MapPin, color: 'from-blue-500 to-cyan-500' },
    { label: 'Attractions Viewed', value: userProgress?.attractions_viewed?.length || 0, icon: Eye, color: 'from-purple-500 to-pink-500' },
    { label: 'Total Points', value: userProgress?.total_points || 0, icon: Star, color: 'from-yellow-500 to-orange-500' },
    { label: 'Badges Earned', value: userProgress?.badges_earned || 0, icon: Award, color: 'from-green-500 to-teal-500' }
  ];

  const breadcrumbItems = [
    { label: 'My Profile', url: createPageUrl('UserProfile') }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Breadcrumbs items={breadcrumbItems} />
      
      <SEO 
        title="My Profile - CityReview.be"
        description="Manage your profile, view favorites, itineraries, and track your exploration progress"
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden border-0 shadow-xl">
          <div className="relative h-48 bg-gradient-to-r from-[var(--primary-orange)] via-[var(--primary-yellow)] to-[var(--accent-brown)]">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>
          </div>
          
          <CardContent className="relative pt-0 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
              {/* Avatar with Upload */}
              <div className="relative group">
                {user.profile_picture || formData.profile_picture ? (
                  <img 
                    src={user.profile_picture || formData.profile_picture}
                    alt={user.full_name || 'Profile'}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center text-4xl font-bold text-[var(--primary-orange)]">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Upload Button */}
                <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  {uploadingImage ? (
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  ) : (
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-white mx-auto mb-1" />
                      <span className="text-xs text-white font-medium">Upload</span>
                    </div>
                  )}
                </label>

                {/* Level Badge */}
                <div className="absolute bottom-0 right-0 bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm shadow-lg">
                  {userProgress?.level || 1}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      {user.full_name || 'Traveler'}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    {user.location && (
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.bio && (
                      <p className="text-gray-700 mt-2 max-w-2xl">{user.bio}</p>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge className="bg-[var(--primary-orange)] text-white">
                    Level {userProgress?.level || 1}
                  </Badge>
                  <Badge variant="outline">
                    <Trophy className="h-3 w-3 mr-1" />
                    {userProgress?.total_points || 0} Points
                  </Badge>
                  {user.role === 'admin' && (
                    <Badge className="bg-purple-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  <Badge variant="outline">
                    Joined {format(new Date(user.created_date), 'MMM yyyy')}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        {isEditing && (
          <Card className="mb-8 border-2 border-[var(--primary-orange)]">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself (max 200 characters)"
                    maxLength={200}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(formData.bio || '').length}/200 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to={createPageUrl('MyFavorites')}>
            <Card className="hover-lift cursor-pointer border-2 border-transparent hover:border-[var(--primary-orange)] transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Heart className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">My Favorites</h3>
                    <p className="text-sm text-gray-600">{favorites.length} saved items</p>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('MyItineraries')}>
            <Card className="hover-lift cursor-pointer border-2 border-transparent hover:border-[var(--primary-orange)] transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">My Itineraries</h3>
                    <p className="text-sm text-gray-600">{itineraries.length} travel plans</p>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover-lift border-0 shadow-lg overflow-hidden">
              <CardContent className="pt-6 relative">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl`}></div>
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl mb-4 shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="progress">
              <Trophy className="h-4 w-4 mr-2" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="h-4 w-4 mr-2" />
              Favorites ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="itineraries">
              <Calendar className="h-4 w-4 mr-2" />
              Itineraries ({itineraries.length})
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Award className="h-4 w-4 mr-2" />
              Achievements ({achievements.length})
            </TabsTrigger>
          </TabsList>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-[var(--primary-orange)]" />
                  Your Exploration Journey
                </h2>
                
                <ProgressTracker userProgress={userProgress} />

                {/* Detailed Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0">
                    <CardContent className="pt-6">
                      <MapPin className="h-8 w-8 text-blue-600 mb-3" />
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {userProgress?.cities_visited?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600 mb-3">Cities Explored</div>
                      {userProgress?.cities_visited?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {userProgress.cities_visited.slice(0, 5).map((city, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs capitalize">
                              {city}
                            </Badge>
                          ))}
                          {userProgress.cities_visited.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{userProgress.cities_visited.length - 5}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0">
                    <CardContent className="pt-6">
                      <Eye className="h-8 w-8 text-purple-600 mb-3" />
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {userProgress?.attractions_viewed?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Attractions Discovered</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-0">
                    <CardContent className="pt-6">
                      <Zap className="h-8 w-8 text-green-600 mb-3" />
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {userProgress?.reviews_written || 0}
                      </div>
                      <div className="text-sm text-gray-600">Reviews Written</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            {recentAchievements.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Recent Achievements</h3>
                    <Button variant="ghost" size="sm" onClick={() => document.querySelector('[value="achievements"]').click()}>
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentAchievements.map((achievement) => (
                      <Card key={achievement.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border-0">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-yellow)] flex items-center justify-center text-2xl">
                              {getRarityEmoji(achievement.rarity)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-1">{achievement.badge_name}</h4>
                              <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                              <div className="flex items-center justify-between">
                                <Badge className="bg-[var(--primary-orange)] text-white text-xs">
                                  +{achievement.points} pts
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {achievement.rarity}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Favorites</h2>
              <Link to={createPageUrl('MyFavorites')}>
                <Button variant="outline" className="flex items-center gap-2">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {favorites.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorites yet</h3>
                  <p className="text-gray-600 mb-6">Start exploring and save your favorite places!</p>
                  <Link to={createPageUrl('Cities')}>
                    <Button className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white">
                      Explore Belgium
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {favoritesByType.attraction.length > 0 && (
                  <FavoriteSection 
                    title="Attractions" 
                    icon={Eye} 
                    items={favoritesByType.attraction.slice(0, 6)}
                    type="attraction"
                  />
                )}
                {favoritesByType.restaurant.length > 0 && (
                  <FavoriteSection 
                    title="Restaurants" 
                    icon={Utensils} 
                    items={favoritesByType.restaurant.slice(0, 6)}
                    type="restaurant"
                  />
                )}
                {favoritesByType.hotel.length > 0 && (
                  <FavoriteSection 
                    title="Hotels" 
                    icon={Hotel} 
                    items={favoritesByType.hotel.slice(0, 6)}
                    type="hotel"
                  />
                )}
                {favoritesByType.city.length > 0 && (
                  <FavoriteSection 
                    title="Cities" 
                    icon={MapPin} 
                    items={favoritesByType.city.slice(0, 6)}
                    type="city"
                  />
                )}
              </>
            )}
          </TabsContent>

          {/* Itineraries Tab */}
          <TabsContent value="itineraries" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Itineraries</h2>
              <Link to={createPageUrl('MyItineraries')}>
                <Button className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  View All & Create New
                </Button>
              </Link>
            </div>

            {itineraries.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No itineraries yet</h3>
                  <p className="text-gray-600 mb-6">Plan your perfect Belgian adventure!</p>
                  <Link to={createPageUrl('MyItineraries')}>
                    <Button className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white">
                      Create Itinerary
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {itineraries.slice(0, 6).map((itinerary) => (
                  <Link key={itinerary.id} to={createPageUrl('ItineraryDetail') + '?id=' + itinerary.id}>
                    <Card className="hover-lift h-full border-0 shadow-lg">
                      <div className="relative h-48 bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-yellow)]">
                        {itinerary.image ? (
                          <img src={itinerary.image} alt={itinerary.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Calendar className="h-16 w-16 text-white opacity-50" />
                          </div>
                        )}
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{itinerary.title}</h3>
                        {itinerary.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{itinerary.description}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          {itinerary.start_date && itinerary.end_date && (
                            <span>{format(new Date(itinerary.start_date), 'MMM d')} - {format(new Date(itinerary.end_date), 'MMM d, yyyy')}</span>
                          )}
                          {itinerary.is_public && (
                            <Badge variant="outline" className="text-xs">Public</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-[var(--primary-orange)]" />
                  All Achievements
                </h2>
                
                {achievements.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No achievements yet</h3>
                    <p className="text-gray-600">Start exploring to unlock achievements!</p>
                  </div>
                ) : (
                  <BadgeShowcase achievements={achievements} userProgress={userProgress} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function FavoriteSection({ title, icon: Icon, items, type }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="pt-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Icon className="h-5 w-5 text-[var(--primary-orange)]" />
          {title} ({items.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((favorite) => (
            <Card key={favorite.id} className="hover-lift">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{favorite.item_name}</h4>
                {favorite.notes && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{favorite.notes}</p>
                )}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs capitalize">{favorite.item_type}</Badge>
                  <Button size="sm" variant="ghost" className="text-xs">
                    View
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getRarityEmoji(rarity) {
  const emojis = {
    common: '🥉',
    rare: '🥈',
    epic: '🥇',
    legendary: '👑'
  };
  return emojis[rarity] || '🏅';
}