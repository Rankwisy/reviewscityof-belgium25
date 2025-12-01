import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles, Trophy } from 'lucide-react';

export default function AchievementNotification({ achievement, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-yellow-600'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          className="fixed top-24 right-4 z-50 max-w-sm"
        >
          <Card className="border-2 border-[var(--primary-orange)] shadow-2xl overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-orange)]/10 to-[var(--primary-yellow)]/10 animate-pulse"></div>
            
            {/* Confetti effect */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-[var(--primary-yellow)] rounded-full"
                  initial={{ 
                    x: '50%', 
                    y: '50%',
                    scale: 0 
                  }}
                  animate={{ 
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0]
                  }}
                  transition={{ 
                    duration: 1.5,
                    delay: i * 0.05,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </div>

            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[var(--primary-orange)] animate-pulse" />
                  <p className="font-bold text-gray-900">Achievement Unlocked!</p>
                </div>
                <button
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <motion.div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${rarityColors[achievement.rarity]} flex items-center justify-center shadow-lg flex-shrink-0`}
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 0.5,
                    repeat: 2
                  }}
                >
                  <Trophy className="h-8 w-8 text-white" />
                </motion.div>

                <div className="flex-1">
                  <Badge className={`mb-2 bg-gradient-to-r ${rarityColors[achievement.rarity]} text-white border-0 text-xs`}>
                    {achievement.rarity.toUpperCase()}
                  </Badge>
                  <h3 className="font-bold text-gray-900 mb-1">{achievement.badge_name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                  <p className="text-sm font-semibold text-[var(--primary-orange)]">
                    +{achievement.points} points
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}