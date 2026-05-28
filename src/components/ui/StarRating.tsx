import { useState } from 'react';
import { Star } from 'lucide-react';
import { setRating, getRating } from '../../store/localStore';

interface StarRatingProps {
  contentId: number;
  contentType: 'movie' | 'tv' | 'game';
  max?: number;
}

export default function StarRating({ contentId, contentType, max = 5 }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(() => getRating(contentId, contentType));

  const handleRate = (value: number) => {
    setSelected(value);
    setRating({ contentId, contentType, ratingValue: value, createdAt: new Date().toISOString() });
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map(val => (
        <button
          key={val}
          onMouseEnter={() => setHover(val)}
          onMouseLeave={() => setHover(0)}
          onClick={() => handleRate(val)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              val <= (hover || selected)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-600'
            }`}
          />
        </button>
      ))}
      {selected > 0 && (
        <span className="text-gray-400 text-sm ml-2">{selected}/{max}</span>
      )}
    </div>
  );
}
