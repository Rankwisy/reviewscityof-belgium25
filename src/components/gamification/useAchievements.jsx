import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export function useAchievements(user) {
  const [notifications, setNotifications] = useState([]);
  const queryClient = useQueryClient();

  const checkAndAwardBadge = async (badgeName, badgeType, description, points, rarity, metadata) => {
    if (!user) return;

    try {
      // Check if user already has this badge
      const existing = await base44.entities.Achievement.filter({
        created_by: user.email,
        badge_name: badgeName
      });

      if (existing.length > 0) return; // Already has this badge

      // Award the badge
      const newAchievement = await base44.entities.Achievement.create({
        badge_name: badgeName,
        badge_type: badgeType,
        description: description,
        points: points,
        rarity: rarity,
        unlocked_at: new Date().toISOString(),
        metadata: metadata || {}
      });

      // Update user progress
      const progressResults = await base44.entities.UserProgress.filter({
        created_by: user.email
      });

      if (progressResults.length > 0) {
        const progress = progressResults[0];
        const newPoints = (progress.total_points || 0) + points;
        const newLevel = calculateLevel(newPoints);
        
        await base44.entities.UserProgress.update(progress.id, {
          total_points: newPoints,
          level: newLevel,
          badges_earned: (progress.badges_earned || 0) + 1
        });
      } else {
        // Create new progress record
        await base44.entities.UserProgress.create({
          total_points: points,
          level: 1,
          badges_earned: 1
        });
      }

      // Show notification
      setNotifications(prev => [...prev, newAchievement]);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries(['achievements']);
      queryClient.invalidateQueries(['userProgress']);

      return newAchievement;
    } catch (error) {
      console.error('Error awarding badge:', error);
    }
  };

  const trackCityVisit = async (citySlug) => {
    if (!user) return;

    try {
      const progressResults = await base44.entities.UserProgress.filter({
        created_by: user.email
      });

      let progress = progressResults[0];
      let citiesVisited = progress?.cities_visited || [];

      if (!citiesVisited.includes(citySlug)) {
        citiesVisited = [...citiesVisited, citySlug];

        if (progress) {
          await base44.entities.UserProgress.update(progress.id, {
            cities_visited: citiesVisited
          });
        } else {
          progress = await base44.entities.UserProgress.create({
            cities_visited: citiesVisited,
            total_points: 0,
            level: 1
          });
        }

        // Check for achievements
        if (citiesVisited.length === 1) {
          await checkAndAwardBadge(
            'First Steps',
            'city_explorer',
            'Visited your first Belgian city',
            25,
            'common',
            { city: citySlug }
          );
        } else if (citiesVisited.length === 5) {
          await checkAndAwardBadge(
            'City Explorer',
            'city_explorer',
            'Explored 5 different Belgian cities',
            100,
            'rare',
            { cities: citiesVisited }
          );
        } else if (citiesVisited.length >= 10) {
          await checkAndAwardBadge(
            'Belgium Master',
            'city_explorer',
            'Visited all major Belgian cities',
            500,
            'legendary',
            { cities: citiesVisited }
          );
        }

        queryClient.invalidateQueries(['userProgress']);
      }
    } catch (error) {
      console.error('Error tracking city visit:', error);
    }
  };

  const trackAttractionView = async (attractionSlug) => {
    if (!user) return;

    try {
      const progressResults = await base44.entities.UserProgress.filter({
        created_by: user.email
      });

      let progress = progressResults[0];
      let attractionsViewed = progress?.attractions_viewed || [];

      if (!attractionsViewed.includes(attractionSlug)) {
        attractionsViewed = [...attractionsViewed, attractionSlug];

        if (progress) {
          await base44.entities.UserProgress.update(progress.id, {
            attractions_viewed: attractionsViewed
          });
        } else {
          await base44.entities.UserProgress.create({
            attractions_viewed: attractionsViewed,
            total_points: 0,
            level: 1
          });
        }

        // Award points and check achievements
        if (attractionsViewed.length === 10) {
          await checkAndAwardBadge(
            'Attraction Hunter',
            'attraction_collector',
            'Viewed 10 unique attractions',
            75,
            'common',
            { count: 10 }
          );
        } else if (attractionsViewed.length === 50) {
          await checkAndAwardBadge(
            'Attraction Collector',
            'attraction_collector',
            'Viewed 50 unique attractions',
            200,
            'epic',
            { count: 50 }
          );
        }

        queryClient.invalidateQueries(['userProgress']);
      }
    } catch (error) {
      console.error('Error tracking attraction view:', error);
    }
  };

  const trackReview = async () => {
    if (!user) return;

    try {
      const progressResults = await base44.entities.UserProgress.filter({
        created_by: user.email
      });

      let progress = progressResults[0];
      let reviewCount = (progress?.reviews_written || 0) + 1;

      if (progress) {
        await base44.entities.UserProgress.update(progress.id, {
          reviews_written: reviewCount
        });
      } else {
        await base44.entities.UserProgress.create({
          reviews_written: 1,
          total_points: 0,
          level: 1
        });
      }

      if (reviewCount === 1) {
        await checkAndAwardBadge(
          'First Review',
          'reviewer',
          'Wrote your first review',
          50,
          'common'
        );
      } else if (reviewCount === 5) {
        await checkAndAwardBadge(
          'Dedicated Reviewer',
          'reviewer',
          'Wrote 5 helpful reviews',
          150,
          'epic'
        );
      }

      queryClient.invalidateQueries(['userProgress']);
    } catch (error) {
      console.error('Error tracking review:', error);
    }
  };

  const trackItineraryCreation = async () => {
    if (!user) return;

    try {
      const progressResults = await base44.entities.UserProgress.filter({
        created_by: user.email
      });

      let progress = progressResults[0];
      let itineraryCount = (progress?.itineraries_created || 0) + 1;

      if (progress) {
        await base44.entities.UserProgress.update(progress.id, {
          itineraries_created: itineraryCount
        });
      } else {
        await base44.entities.UserProgress.create({
          itineraries_created: 1,
          total_points: 0,
          level: 1
        });
      }

      if (itineraryCount === 1) {
        await checkAndAwardBadge(
          'Travel Planner',
          'planner',
          'Created your first itinerary',
          50,
          'common'
        );
      }

      queryClient.invalidateQueries(['userProgress']);
    } catch (error) {
      console.error('Error tracking itinerary:', error);
    }
  };

  const updateStreak = async () => {
    if (!user) return;

    try {
      const progressResults = await base44.entities.UserProgress.filter({
        created_by: user.email
      });

      let progress = progressResults[0];
      const now = new Date();
      const lastActivity = progress?.last_activity ? new Date(progress.last_activity) : null;
      
      let streakDays = progress?.streak_days || 0;

      if (lastActivity) {
        const daysDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          streakDays += 1;
        } else if (daysDiff > 1) {
          streakDays = 1;
        }
      } else {
        streakDays = 1;
      }

      if (progress) {
        await base44.entities.UserProgress.update(progress.id, {
          streak_days: streakDays,
          last_activity: now.toISOString()
        });
      } else {
        await base44.entities.UserProgress.create({
          streak_days: 1,
          last_activity: now.toISOString(),
          total_points: 0,
          level: 1
        });
      }

      // Award streak badges
      if (streakDays === 7) {
        await checkAndAwardBadge(
          'Week Warrior',
          'completionist',
          'Logged in for 7 consecutive days',
          100,
          'rare'
        );
      } else if (streakDays === 30) {
        await checkAndAwardBadge(
          'Month Champion',
          'completionist',
          'Logged in for 30 consecutive days',
          500,
          'legendary'
        );
      }

      queryClient.invalidateQueries(['userProgress']);
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const removeNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return {
    notifications,
    removeNotification,
    trackCityVisit,
    trackAttractionView,
    trackReview,
    trackItineraryCreation,
    updateStreak,
    checkAndAwardBadge
  };
}

function calculateLevel(points) {
  const thresholds = [0, 100, 250, 500, 1000, 2000, 5000, 10000];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (points >= thresholds[i]) {
      return i + 1;
    }
  }
  return 1;
}