import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, Star, MapPin, Eye, Utensils, Calendar, 
  Pen, CheckCircle, Flame, Award, Crown, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const badgeIcons = {
  city_explorer: MapPin,
  attraction_collector: Eye,
  food_enthusiast: Utensils,
  culture_connoisseur: Star,
  event_goer: Calendar,
  reviewer: Pen,
  planner: CheckCircle,
  completionist: Trophy
};

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-yellow-600'
};

const rarityGlow = {
  common: 'shadow-gray-400/50',
  rare: 'shadow-blue-400/50',
  epic: 'shadow-purple-400/50',
  legendary: 'shadow-yellow-400/50 animate-pulse'
};

export default function BadgeShowcase({ achievements, compact = false }) {
  if (!achievements || achievements.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-12 text-center">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold mb-2">No badges yet!</p>
          <p className="text-gray-400 text-sm">Start exploring to earn your first badge</p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {achievements.slice(0, 5).map((achievement, index) => {
          const Icon = badgeIcons[achievement.badge_type] || Award;
          return (
            <motion.div
              key={achievement.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.1, type: 'spring' }}
              className="relative group"
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${rarityColors[achievement.rarity]} flex items-center justify-center shadow-lg ${rarityGlow[achievement.rarity]} cursor-pointer transform transition-transform hover:scale-110`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              {achievement.rarity === 'legendary' && (
                <Crown className="absolute -top-2 -right-2 h-5 w-5 text-yellow-400 animate-bounce" />
              )}
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                <div className="font-semibold">{achievement.badge_name}</div>
                <div className="text-gray-300">{achievement.points} points</div>
              </div>
            </motion.div>
          );
        })}
        {achievements.length > 5 && (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
            +{achievements.length - 5}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {achievements.map((achievement, index) => {
        const Icon = badgeIcons[achievement.badge_type] || Award;
        return (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group">
              <CardContent className="p-6 text-center relative">
                {/* Background glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[achievement.rarity]} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                
                <div className="relative z-10">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${rarityColors[achievement.rarity]} flex items-center justify-center shadow-xl ${rarityGlow[achievement.rarity]} mx-auto mb-4 transform group-hover:scale-110 transition-transform`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  
                  {achievement.rarity === 'legendary' && (
                    <Crown className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 h-6 w-6 text-yellow-400 animate-bounce" />
                  )}
                  
                  <Badge className={`mb-2 bg-gradient-to-r ${rarityColors[achievement.rarity]} text-white border-0 text-xs`}>
                    {achievement.rarity.toUpperCase()}
                  </Badge>
                  
                  <h3 className="font-bold text-gray-900 mb-2">{achievement.badge_name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                  
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-[var(--primary-orange)]" />
                    <span className="font-semibold text-[var(--primary-orange)]">{achievement.points} points</span>
                  </div>
                  
                  {achievement.unlocked_at && (
                    <p className="text-xs text-gray-400 mt-2">
                      Earned {new Date(achievement.unlocked_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}