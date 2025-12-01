import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, Star, MapPin, Eye, Trophy, Flame, Target
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProgressTracker({ progress }) {
  if (!progress) {
    return null;
  }

  const levelThresholds = [0, 100, 250, 500, 1000, 2000, 5000, 10000];
  const currentLevel = progress.level || 1;
  const currentPoints = progress.total_points || 0;
  const nextLevelPoints = levelThresholds[currentLevel] || levelThresholds[levelThresholds.length - 1];
  const prevLevelPoints = levelThresholds[currentLevel - 1] || 0;
  const progressToNext = ((currentPoints - prevLevelPoints) / (nextLevelPoints - prevLevelPoints)) * 100;

  const stats = [
    {
      icon: MapPin,
      label: 'Cities Explored',
      value: progress.cities_visited?.length || 0,
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      icon: Eye,
      label: 'Attractions Viewed',
      value: progress.attractions_viewed?.length || 0,
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    },
    {
      icon: Trophy,
      label: 'Badges Earned',
      value: progress.badges_earned || 0,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50'
    },
    {
      icon: Flame,
      label: 'Day Streak',
      value: progress.streak_days || 0,
      color: 'text-orange-500',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Level Progress Card */}
      <Card className="border-2 border-[var(--primary-orange)]/20 shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-yellow)] flex items-center justify-center shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">Level {currentLevel}</div>
                <p className="text-sm text-gray-500">Explorer</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[var(--primary-orange)]">{currentPoints}</div>
              <p className="text-xs text-gray-500">total points</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress to Level {currentLevel + 1}</span>
              <span className="font-semibold text-gray-900">{nextLevelPoints - currentPoints} points to go</span>
            </div>
            <Progress value={progressToNext} className="h-3" />
          </div>

          {progress.streak_days > 0 && progress.streak_days >= 7 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg flex items-center gap-3"
            >
              <Flame className="h-6 w-6 text-orange-500 animate-pulse" />
              <div>
                <p className="font-semibold text-gray-900">You're on fire! 🔥</p>
                <p className="text-sm text-gray-600">{progress.streak_days} day streak - Keep it up!</p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Milestones */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-[var(--primary-orange)]" />
            <h3 className="font-bold text-gray-900">Next Milestones</h3>
          </div>
          <div className="space-y-3">
            {generateMilestones(progress).map((milestone, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <milestone.icon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{milestone.title}</p>
                    <p className="text-xs text-gray-500">{milestone.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {milestone.reward} pts
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function generateMilestones(progress) {
  const milestones = [];

  const citiesVisited = progress.cities_visited?.length || 0;
  if (citiesVisited < 5) {
    milestones.push({
      icon: MapPin,
      title: `Visit ${5 - citiesVisited} more ${5 - citiesVisited === 1 ? 'city' : 'cities'}`,
      description: 'Unlock City Explorer badge',
      reward: 50
    });
  }

  const attractionsViewed = progress.attractions_viewed?.length || 0;
  if (attractionsViewed < 10) {
    milestones.push({
      icon: Eye,
      title: `View ${10 - attractionsViewed} more attractions`,
      description: 'Unlock Attraction Collector badge',
      reward: 75
    });
  }

  if (progress.reviews_written < 3) {
    milestones.push({
      icon: Star,
      title: `Write ${3 - progress.reviews_written} more reviews`,
      description: 'Unlock Reviewer badge',
      reward: 100
    });
  }

  return milestones.slice(0, 3);
}