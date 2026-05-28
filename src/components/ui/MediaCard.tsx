import { useState } from 'react';
import { Star, Heart, Play, Tv } from 'lucide-react';
import { tmdbImage } from '../../services/api';
import { toggleFavorite, isFavorite } from '../../store/localStore';

interface MediaCardProps {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  voteAverage?: number;
  releaseDate?: string;
  rank?: number;
  onClick?: () => void;
  compact?: boolean;
}

export default function MediaCard({
  id, type, title, posterPath, voteAverage, releaseDate, rank, onClick, compact = false
}: MediaCardProps) {
  const [fav, setFav] = useState(() => isFavorite(id, type));
  const [imgError, setImgError] = useState(false);
  const imgUrl = tmdbImage(posterPath, compact ? 'w185' : 'w342');
  const year = releaseDate ? releaseDate.split('-')[0] : '';
  const rating = voteAverage ? voteAverage.toFixed(1) : null;

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleFavorite({
      contentId: id,
      contentType: type,
      title,
      posterPath,
      year,
    });
    setFav(added);
  };

  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer rounded-xl overflow-hidden bg-gray-900 border border-white/10 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/10 ${compact ? 'min-w-[140px]' : ''}`}
    >
      {/* Rank badge */}
      {rank !== undefined && (
        <div className="absolute top-2 left-2 z-20 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
          {rank}
        </div>
      )}

      {/* Poster */}
      <div className={`relative ${compact ? 'aspect-[2/3]' : 'aspect-[2/3]'} bg-gray-800`}>
        {imgUrl && !imgError ? (
          <img
            src={imgUrl}
            alt={title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            {type === 'tv' ? (
              <Tv className="w-10 h-10 text-gray-600" />
            ) : (
              <Play className="w-10 h-10 text-gray-600" />
            )}
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <div className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4 py-1.5 text-sm font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <Play className="w-3.5 h-3.5 fill-white" />
            Regarder
          </div>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 right-2 z-10">
          {type === 'tv' && (
            <span className="bg-blue-500/80 text-white text-xs px-1.5 py-0.5 rounded font-medium backdrop-blur-sm">
              Série
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <h3 className="text-white text-sm font-medium line-clamp-2 leading-tight mb-1">{title}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {rating && (
              <>
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-yellow-400 text-xs font-medium">{rating}</span>
              </>
            )}
            {year && <span className="text-gray-500 text-xs ml-1">{year}</span>}
          </div>
          <button
            onClick={handleFav}
            className={`p-1 rounded-full transition-colors ${fav ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
          >
            <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-red-500' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
