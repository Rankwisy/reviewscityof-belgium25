import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Trophy, TrendingUp, Bell, BellOff, Download,
  Share2, Settings, Award, Star, MapPin, Calendar
} from 'lucide-react';
import SEO from '../components/SEO';
import BadgeShowcase from '../components/gamification/BadgeShowcase';
import ProgressTracker from '../components/gamification/ProgressTracker';
import { motion } from 'framer-motion';

export default function ExplorerProfile() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      window.location.href = '/';
    });
  }, []);

  const { data: progress } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: async () => {
      const results = await base44.entities.UserProgress.filter({ 
        created_by: user.email 
      });
      return results[0] || null;
    },
    enabled: !!user,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ 
      created_by: user.email 
    }, '-unlocked_at', 100),
    enabled: !!user,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ 
      created_by: user.email 
    }),
    enabled: !!user,
  });

  const { data: itineraries = [] } = useQuery({
    queryKey: ['itineraries', user?.email],
    queryFn: () => base44.entities.Itinerary.filter({ 
      created_by: user.email 
    }),
    enabled: !!user,
  });

  const enableNotificationsMutation = useMutation({
    mutationFn: async () => {
      if (!progress) {
        // Create new progress record
        return await base44.entities.UserProgress.create({
          notifications_enabled: true,
          total_points: 10 // Bonus points for enabling
        });
      } else {
        // Update existing
        return await base44.entities.UserProgress.update(progress.id, {
          notifications_enabled: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProgress']);
    },
  });

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        enableNotificationsMutation.mutate();
        new Notification('🎉 Notifications Enabled!', {
          body: 'You\'ll now receive updates about new content and achievements',
          icon: 'https://ik.imagekit.io/by733ltn6/FAVICONS/favicon_io%20(15)/android-chrome-192x192.png?updatedAt=1762899271805'
        });
      }
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-orange)]"></div>
      </div>
    );
  }

  const allBadges = getAllPossibleBadges();
  const lockedBadges = allBadges.filter(
    badge => !achievements.some(a => a.badge_name === badge.badge_name)
  );

  return (
    <div className="py-12 px-4 min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <SEO 
        title="My Explorer Profile - CityReview.be"
        description="Track your Belgian travel journey, achievements, and explorer progress"
      />

      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-8 overflow-hidden border-2 border-[var(--primary-orange)]/20">
            <div className="h-32 bg-gradient-to-r from-[var(--primary-orange)] via-[var(--primary-yellow)] to-[var(--accent-brown)]"></div>
            <CardContent className="relative px-6 pb-6">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
                <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                  <User className="h-16 w-16 text-gray-400" />
                </div>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.full_name || user.email}</h1>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <Badge className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white border-0">
                      <Trophy className="h-4 w-4 mr-1" />
                      Level {progress?.level || 1} Explorer
                    </Badge>
                    <Badge variant="outline">
                      <Star className="h-4 w-4 mr-1 text-[var(--primary-yellow)]" />
                      {progress?.total_points || 0} points
                    </Badge>
                    <Badge variant="outline">
                      <Award className="h-4 w-4 mr-1 text-purple-500" />
                      {achievements.length} badges
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(!progress?.notifications_enabled) && (
                    <Button 
                      onClick={requestNotificationPermission}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Bell className="h-4 w-4" />
                      Enable Notifications
                    </Button>
                  )}
                  {progress?.notifications_enabled && (
                    <Button variant="outline" disabled>
                      <BellOff className="h-4 w-4 mr-2" />
                      Notifications On
                    </Button>
                  )}
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Profile
                  </Button>
                  <Button variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="badges">Badges ({achievements.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProgressTracker progress={progress} />
              </div>

              <div className="space-y-6">
                {/* Recent Badges */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-[var(--primary-orange)]" />
                      Recent Badges
                    </h3>
                    {achievements.length > 0 ? (
                      <BadgeShowcase achievements={achievements.slice(0, 4)} compact />
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No badges yet. Start exploring!
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Favorites</span>
                        <span className="font-semibold">{favorites.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Itineraries</span>
                        <span className="font-semibold">{itineraries.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Reviews</span>
                        <span className="font-semibold">{progress?.reviews_written || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="badges">
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Badges</h2>
                  <p className="text-gray-600">
                    You've earned {achievements.length} out of {allBadges.length} possible badges
                  </p>
                </div>
                <BadgeShowcase achievements={achievements} />

                {lockedBadges.length > 0 && (
                  <div className="mt-12">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Locked Badges</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 opacity-50">
                      {lockedBadges.map((badge, index) => (
                        <Card key={index} className="border-dashed">
                          <CardContent className="p-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                              <Trophy className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="font-bold text-gray-700 mb-2">{badge.badge_name}</h3>
                            <p className="text-sm text-gray-500">{badge.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {achievements.slice(0, 10).map((achievement) => (
                    <div key={achievement.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-yellow)] flex items-center justify-center flex-shrink-0">
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Unlocked: {achievement.badge_name}</p>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(achievement.unlocked_at || achievement.created_date).toLocaleString()}
                        </p>
                      </div>
                      <Badge className="bg-[var(--primary-orange)] text-white">
                        +{achievement.points}
                      </Badge>
                    </div>
                  ))}
                  {achievements.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No activity yet. Start exploring!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collections">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[var(--primary-orange)]" />
                    Cities Explored ({progress?.cities_visited?.length || 0})
                  </h3>
                  {progress?.cities_visited?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {progress.cities_visited.map((city, index) => (
                        <Badge key={index} variant="outline" className="capitalize">
                          {city}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No cities visited yet</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[var(--primary-orange)]" />
                    Saved Itineraries ({itineraries.length})
                  </h3>
                  {itineraries.length > 0 ? (
                    <div className="space-y-2">
                      {itineraries.slice(0, 5).map((itinerary) => (
                        <div key={itinerary.id} className="p-2 bg-gray-50 rounded text-sm">
                          {itinerary.title}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No itineraries created yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* PWA Install Prompt */}
        <InstallPrompt />
      </div>
    </div>
  );
}

function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50 max-w-sm"
    >
      <Card className="border-2 border-[var(--primary-orange)] shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-yellow)] flex items-center justify-center flex-shrink-0">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">Install CityReview.be</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get the app for offline access and faster browsing
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleInstall}
                  className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white border-0"
                >
                  Install
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowPrompt(false)}
                >
                  Later
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function getAllPossibleBadges() {
  return [
    { badge_name: 'First Steps', description: 'Visit your first city', rarity: 'common' },
    { badge_name: 'City Explorer', description: 'Visit 5 different cities', rarity: 'rare' },
    { badge_name: 'Belgium Master', description: 'Visit all major cities', rarity: 'legendary' },
    { badge_name: 'Attraction Hunter', description: 'View 10 attractions', rarity: 'common' },
    { badge_name: 'Culture Buff', description: 'Read 5 culture articles', rarity: 'rare' },
    { badge_name: 'Food Explorer', description: 'Save 10 restaurants', rarity: 'rare' },
    { badge_name: 'Event Enthusiast', description: 'Attend 3 events', rarity: 'epic' },
    { badge_name: 'Travel Planner', description: 'Create your first itinerary', rarity: 'common' },
    { badge_name: 'Dedicated Reviewer', description: 'Write 5 reviews', rarity: 'epic' },
    { badge_name: 'Week Warrior', description: '7 day login streak', rarity: 'rare' },
    { badge_name: 'Month Champion', description: '30 day login streak', rarity: 'legendary' },
    { badge_name: 'Social Butterfly', description: 'Share 10 items', rarity: 'epic' }
  ];
}