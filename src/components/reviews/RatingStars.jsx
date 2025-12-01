import React from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ rating, maxRating = 5, size = 'md', interactive = false, onRatingChange }) {
  const [hoverRating, setHoverRating] = React.useState(0);
  
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6'
  };

  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;
        const isPartiallyFilled = !Number.isInteger(displayRating) && starValue === Math.ceil(displayRating);
        const fillPercentage = isPartiallyFilled ? (displayRating % 1) * 100 : 0;

        return (
          <div
            key={index}
            className={`relative ${interactive ? 'cursor-pointer' : ''}`}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
          >
            {isPartiallyFilled ? (
              <div className="relative">
                <Star className={`${sizeClasses[size]} text-gray-300`} />
                <div 
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <Star className={`${sizeClasses[size]} text-[var(--primary-yellow)] fill-current`} />
                </div>
              </div>
            ) : (
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled
                    ? 'text-[var(--primary-yellow)] fill-current'
                    : 'text-gray-300'
                } ${interactive ? 'hover:text-[var(--primary-yellow)] transition-colors' : ''}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}