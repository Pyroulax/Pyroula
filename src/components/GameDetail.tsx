import { useState, useEffect, useCallback } from 'react';
import { X, Star, Heart, Gamepad2, Calendar, Globe } from 'lucide-react';
import { rawg } from '../services/api';
import { toggleFavorite, isFavorite, addGameView } from '../store/localStore';
import StarRating from './ui/StarRating';

// Download button icons (base64)
const IGG_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAOVBMVEVHcEz/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAAn+tGKAAAAE3RSTlMAOYfP9f/DbelgKOAVSQuwAZ1W3DQu6QAAAOdJREFUeAFlkEECxBAQBAcAgP8/dqPFRqQuUJjR9IdxIZWSmjM6MZdYWPdS3qoXIT4uqQ/scIEn7xO3L+tnoefsLJ+xwNFCG3rsCPR5u9p4u6h/m4hIjjeJKLo4tiCxGYjYqp77JvuYeuI4cxHTJnHV4Hk+lpmzTTY0Iu/SVI3rva/kHPqdj58gGPvIXJq4qLu069m4d4vfi9XQKQsaGl+RXzmmZsbeT4lM48xdHjKv5DsmbxlWpiRgt2wzXKH5BjApT1mxlASqV5MyJenZzc2ykFhKuEnWu6Sgj6DFJjOdRNNECHLIxQ+Ttg15CAaRkAAAAABJRU5ErkJggg==';
const STEAM_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAM1BMVEVHcEz/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AACRyl/zAAAAEXRSTlMAEnm0ixn/1MMI6mqgWCtKNqrUHEwAAACdSURBVHgBrdAFDsQwEATBMY0Z/v/Zo3CyF1FKaG4Zj1HaGOsg0vyx/9Z8IKlxEUkfASQy4iyTCh9OOmqZ8OMZcFaWRUtKPfippMNJsx2tR8DpgZORi+dHO89rk7g4xmQeYUfxRO3v5Mxz0g+/NokYwr9PLR6AUGSW26pQpDlZFyM2nROnboq8lAseJeyF/YrROOjzfMkDV92U3PCcN6LSB6wjzWnTAAAAAElFTkSuQmCC';
const POTION_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAe1BMVEVHcEyoqKj+/v6oqKj///+rqqqvrq60sLG5uLfFxsa7vLz////x8vKpn6n////u6eny7eytBr+jBrfEwsGRA6iKAqKdBLG7ubjh4NvW1tGXBay2B8bNy8qtp6yTkZG/As6AApaYMKKkhKeDTIyag518e3v///9yGIaLa5J1aumzAAAAD3RSTlMAgiyfGN2//d9LZAoh+iWYn2F1AAABEElEQVQokXXT65JEMBAFYGYQl5kVGumMhLjt7Ps/4YZaJLNxyr9PazmK5x0J/CiOI99zJWEgOBcgAwdGFL51GLpmH0SA0FfsfO7XsnTd0jnNu2kjIC+wY0Apu8Q8v0ZBLzElVE+Sm4sYw3wNC5NPCwWBzXJK4W7bEyWl+V8oj6w5Kg/a1Kgw5TNuuN9B2dl+zNuBIHImyT58rA1g7Pu+eZVFUUy47T6Pm/Ch79u21VaWamYcESHbV+JwWFk2Va3UDwTG5G5N83pVVT0fk3rnh9USzreFwrY3niWlfLJMP/VhNMTrwrAJzXYzyYfD1IShVXwW8lFVOrV6E2H1vsZnAp7jKEGQf99zPe49Xn8Hg34BBuUeBEFSCdgAAAAASUVORK5CYII=';

interface GameDetailProps {
  id: number;
  onClose: () => void;
}

function isAdultGame(esrb: any): boolean {
  if (!esrb) return false;
  return esrb.slug === 'adults-only' || esrb.name?.toLowerCase().includes('adult');
}

export default function GameDetail({ id, onClose }: GameDetailProps) {
  const [data, setData] = useState<any>(null);
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fav, setFav] = useState(false);
  const [adultRevealed, setAdultRevealed] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [detail, shots] = await Promise.all([
          rawg.gameDetails(id),
          rawg.gameScreenshots(id),
        ]);
        setData(detail);
        setScreenshots(shots.results || []);
        setFav(isFavorite(id, 'game'));
        addGameView(id, detail.name);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleFav = () => {
    if (!data) return;
    const added = toggleFavorite({
      contentId: id,
      contentType: 'game',
      title: data.name,
      posterPath: data.background_image,
      year: data.released?.split('-')[0],
    });
    setFav(added);
  };

  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleClose]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-purple-500/20"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const adult = isAdultGame(data.esrb_rating);
  const gameName = data.name;
  const encodedName = gameName.replace(/\s+/g, '+');
  const iggUrl = `https://igg-games.com/?s=${encodedName}`;
  const steamUrl = `https://steamunlocked.org/?s=${encodedName}`;
  const potionUrl = `https://www.potiongang.fr/explore?query=${encodedName}`;

  const allImages = [
    data.background_image,
    ...screenshots.map((s: any) => s.image),
  ].filter(Boolean);

  const platforms = (data.platforms || []).map((p: any) => p.platform?.name).filter(Boolean);
  const genres = (data.genres || []).map((g: any) => g.name);
  const tags = (data.tags || []).slice(0, 8).map((t: any) => t.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="relative bg-gray-950 rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10">
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero image */}
        <div className="relative h-64 sm:h-80 overflow-hidden">
          {allImages[activeImg] ? (
            <img
              src={allImages[activeImg]}
              alt={gameName}
              className={`w-full h-full object-cover transition-all duration-500 ${adult && !adultRevealed ? 'blur-xl scale-110' : ''}`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900 to-gray-900 flex items-center justify-center">
              <Gamepad2 className="w-16 h-16 text-purple-600" />
            </div>
          )}

          {adult && !adultRevealed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/50">
              <button
                onClick={() => setAdultRevealed(true)}
                className="bg-red-600/90 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium text-center leading-tight backdrop-blur-sm transition-colors"
              >
                🔞 Contenu adulte<br />
                <span className="text-sm opacity-80">J'ai 18 ans ou plus : Afficher</span>
              </button>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />
        </div>

        {/* Screenshot thumbnails */}
        {allImages.length > 1 && (
          <div className="flex gap-2 px-6 -mt-8 relative z-10 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {allImages.slice(0, 8).map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`flex-shrink-0 w-16 h-10 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-purple-500' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 justify-between">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{gameName}</h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {data.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 font-semibold">{data.rating.toFixed(1)}</span>
                    <span className="text-gray-500 text-sm">/5</span>
                  </div>
                )}
                {data.released && (
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Calendar className="w-3.5 h-3.5" />
                    {data.released}
                  </div>
                )}
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <Globe className="w-3.5 h-3.5" />
                  PC
                </div>
                {data.metacritic && (
                  <div className="bg-green-600/20 border border-green-600/40 text-green-400 text-xs px-2 py-0.5 rounded font-mono font-bold">
                    Metacritic: {data.metacritic}
                  </div>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-4">
                {genres.map((g: string) => (
                  <span key={g} className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-full">{g}</span>
                ))}
              </div>

              {/* Description */}
              {data.description_raw && (
                <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-5">
                  {data.description_raw}
                </p>
              )}

              {/* Platforms */}
              {platforms.length > 0 && (
                <div className="mb-4">
                  <span className="text-gray-500 text-xs">Plateformes : </span>
                  <span className="text-gray-300 text-xs">{platforms.join(', ')}</span>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tags.map((t: string) => (
                    <span key={t} className="text-xs bg-white/5 text-gray-500 px-2 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={handleFav}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                    fav ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${fav ? 'fill-red-400' : ''}`} />
                  {fav ? 'Favori' : 'Ajouter aux favoris'}
                </button>
              </div>

              {/* Star rating */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-gray-500 text-sm">Votre note :</span>
                <StarRating contentId={id} contentType="game" />
              </div>
            </div>
          </div>

          {/* Download section */}
          <div className="mt-2 p-5 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-white font-semibold mb-4 text-lg">📥 Télécharger le jeu</h3>
            <div className="flex flex-col gap-3">
              <a
                href={iggUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-white px-4 py-3 rounded-xl transition-all hover:scale-[1.02] font-medium"
              >
                <img src={IGG_ICON} alt="IGG Games" className="w-5 h-5 rounded" />
                Télécharger le jeu via IGG GAMES
              </a>
              <a
                href={steamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-white px-4 py-3 rounded-xl transition-all hover:scale-[1.02] font-medium"
              >
                <img src={STEAM_ICON} alt="SteamUnlocked" className="w-5 h-5 rounded" />
                Télécharger le jeu via SteamUnlocked
              </a>
              <a
                href={potionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-white px-4 py-3 rounded-xl transition-all hover:scale-[1.02] font-medium"
              >
                <img src={POTION_ICON} alt="Potion Gang" className="w-5 h-5 rounded" />
                Télécharger le jeu via Potion Gang
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
