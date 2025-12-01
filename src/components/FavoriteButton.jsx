import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FavoriteButton({ itemType, itemId, itemSlug, itemName, variant = 'default', className = '' }) {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorite.list('-created_date', 1000),
    enabled: !!user,
  });

  const isFavorited = favorites.some(
    fav => fav.item_type === itemType && fav.item_id === itemId
  );

  const addFavoriteMutation = useMutation({
    mutationFn: () => base44.entities.Favorite.create({
      item_type: itemType,
      item_id: itemId,
      item_slug: itemSlug,
      item_name: itemName
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      const favorite = favorites.find(
        fav => fav.item_type === itemType && fav.item_id === itemId
      );
      if (favorite) {
        await base44.entities.Favorite.delete(favorite.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    if (isFavorited) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`p-2 rounded-full hover:bg-white/20 transition-colors ${className}`}
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart
          className={`h-6 w-6 ${
            isFavorited
              ? 'fill-red-500 text-red-500'
              : 'text-white'
          }`}
        />
      </button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      className={className}
      disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
    >
      <Heart
        className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current' : ''}`}
      />
      {isFavorited ? 'Saved' : 'Save'}
    </Button>
  );
}