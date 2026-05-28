import { useState } from 'react';
import { Star, Heart, Gamepad2 } from 'lucide-react';
import { toggleFavorite, isFavorite } from '../../store/localStore';

interface GameCardProps {
  id: number;
  name: string;
  backgroundImage: string | null;
  rating?: number;
  released?: string;
  esrbRating?: { slug: string; name: string } | null;
  rank?: number;
  onClick?: () => void;
  compact?: boolean;
}

function isAdultGame(esrb: { slug: string; name: string } | null | undefined): boolean {
  if (!esrb) return false;
  return esrb.slug === 'adults-only' || esrb.name?.toLowerCase().includes('adult');
}

export default function GameCard({
  id, name, backgroundImage, rating, released, esrbRating, rank, onClick, compact = false
}: GameCardProps) {
  const [fav, setFav] = useState(() => isFavorite(id, 'game'));
  const [imgError, setImgError] = useState(false);
  const [adultRevealed, setAdultRevealed] = useState(false);
  const adult = isAdultGame(esrbRating);
  const year = released ? released.split('-')[0] : '';

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleFavorite({
      contentId: id,
      contentType: 'game',
      title: name,
      posterPath: backgroundImage,
      year,
    });
    setFav(added);
  };

  const handleReveal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdultRevealed(true);
  };

  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer rounded-xl overflow-hidden bg-gray-900 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 ${compact ? 'min-w-[160px]' : ''}`}
    >
      {rank !== undefined && (
        <div className="absolute top-2 left-2 z-20 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
          {rank}
        </div>
      )}

      <div className={`relative ${compact ? 'aspect-[16/9]' : 'aspect-[16/10]'} bg-gray-800`}>
        {backgroundImage && !imgError ? (
          <img
            src={backgroundImage}
            alt={name}
            loading="lazy"
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-all duration-300 ${adult && !adultRevealed ? 'blur-xl scale-110' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <Gamepad2 className="w-10 h-10 text-gray-600" />
          </div>
        )}

        {/* Adult overlay */}
        {adult && !adultRevealed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40">
            <button
              onClick={handleReveal}
              className="bg-red-600/90 hover:bg-red-700 text-white text-xs px-3 py-2 rounded-lg font-medium text-center leading-tight mx-2 backdrop-blur-sm transition-colors"
            >
              🔞 Contenu adulte<br />
              <span className="text-xs opacity-80">J'ai 18 ans ou plus : Afficher</span>
            </button>
          </div>
        )}

        {/* Hover overlay */}
        {(!adult || adultRevealed) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
            <div className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full px-4 py-1.5 text-sm font-medium shadow-lg">
              <Gamepad2 className="w-3.5 h-3.5" />
              Voir le jeu
            </div>
          </div>
        )}

        {/* PC badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-gray-800/80 text-gray-300 text-xs px-1.5 py-0.5 rounded font-medium backdrop-blur-sm">
            PC
          </span>
        </div>
      </div>

      <div className="p-2.5">
        <h3 className="text-white text-sm font-medium line-clamp-2 leading-tight mb-1">{name}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {rating ? (
              <>
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-yellow-400 text-xs font-medium">{rating.toFixed(1)}</span>
              </>
            ) : null}
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
