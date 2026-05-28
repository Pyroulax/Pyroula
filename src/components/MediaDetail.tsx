import { useState, useEffect, useCallback } from 'react';
import { X, Star, Heart, Play, Calendar, Clock, Globe, ExternalLink, ChevronDown } from 'lucide-react';
import { tmdb, tmdbImage, formatDate, formatYear, searchYouTubeTrailer } from '../services/api';
import { toggleFavorite, isFavorite, updateWatchHistory } from '../store/localStore';
import StarRating from './ui/StarRating';

interface MediaDetailProps {
  id: number;
  type: 'movie' | 'tv';
  onClose: () => void;
}

export default function MediaDetail({ id, type, onClose }: MediaDetailProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [fav, setFav] = useState(false);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const detail = type === 'movie' ? await tmdb.movieDetails(id) : await tmdb.tvDetails(id);
        setData(detail);
        setFav(isFavorite(id, type));

        // Try TMDB videos first
        const videos = detail.videos?.results || [];
        const tmdbTrailer = videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
        if (tmdbTrailer) {
          setTrailerKey(tmdbTrailer.key);
        } else {
          const title = detail.title || detail.name;
          const year = formatYear(detail.release_date || detail.first_air_date);
          const ytKey = await searchYouTubeTrailer(title, year);
          setTrailerKey(ytKey);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, type]);

  const handleFav = () => {
    if (!data) return;
    const title = data.title || data.name;
    const added = toggleFavorite({
      contentId: id,
      contentType: type,
      title,
      posterPath: data.poster_path,
      year: formatYear(data.release_date || data.first_air_date),
    });
    setFav(added);
  };

  const handleWatch = () => {
    if (!data) return;
    const title = data.title || data.name;
    updateWatchHistory({
      id: `${type}_${id}`,
      mediaId: id,
      mediaType: type,
      title,
      posterPath: data.poster_path,
      progressSeconds: 0,
      totalSeconds: type === 'movie' ? (data.runtime || 0) * 60 : 0,
    });
    setShowPlayer(true);
  };

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

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
          <div className="absolute inset-0 rounded-full border-2 border-orange-500/20"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const title = data.title || data.name;
  const overview = data.overview;
  const backdropUrl = tmdbImage(data.backdrop_path, 'w1280');
  const posterUrl = tmdbImage(data.poster_path, 'w342');
  const releaseDate = data.release_date || data.first_air_date;
  const runtime = data.runtime ? `${Math.floor(data.runtime / 60)}h${data.runtime % 60}m` : null;
  const genres = data.genres?.map((g: any) => g.name) || [];
  const cast = data.credits?.cast?.slice(0, 8) || [];
  const director = data.credits?.crew?.find((c: any) => c.job === 'Director');
  const seasons = data.seasons?.filter((s: any) => s.season_number > 0) || [];

  const playerUrl = type === 'movie'
    ? `https://frembed.click/embed/movie/${id}`
    : `https://vidsrc.to/embed/tv/${id}/${season}/${episode}?lang=en&sub=fr`;

  const openInNewTab = () => window.open(playerUrl, '_blank');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="relative bg-gray-950 rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Backdrop */}
        {backdropUrl && !imgError && (
          <div className="relative h-64 sm:h-80 overflow-hidden">
            <img
              src={backdropUrl}
              alt={title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 -mt-20 sm:-mt-24 relative z-10">
            {/* Poster */}
            <div className="flex-shrink-0">
              {posterUrl ? (
                <img src={posterUrl} alt={title} className="w-32 sm:w-44 rounded-xl shadow-2xl border border-white/10" />
              ) : (
                <div className="w-32 sm:w-44 aspect-[2/3] bg-gray-800 rounded-xl flex items-center justify-center">
                  <Play className="w-8 h-8 text-gray-600" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 mt-16 sm:mt-0 pt-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{title}</h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {data.vote_average > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 font-semibold">{data.vote_average.toFixed(1)}</span>
                    <span className="text-gray-500 text-sm">/10</span>
                  </div>
                )}
                {releaseDate && (
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(releaseDate)}
                  </div>
                )}
                {runtime && (
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Clock className="w-3.5 h-3.5" />
                    {runtime}
                  </div>
                )}
                {data.original_language && (
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Globe className="w-3.5 h-3.5" />
                    {data.original_language.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-4">
                {genres.map((g: string) => (
                  <span key={g} className="text-xs bg-white/10 text-gray-300 px-2.5 py-1 rounded-full">{g}</span>
                ))}
              </div>

              {/* Overview */}
              {overview && (
                <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-4">{overview}</p>
              )}

              {/* Director */}
              {director && (
                <p className="text-gray-400 text-sm mb-4">
                  <span className="text-gray-500">Réalisateur : </span>
                  <span className="text-white">{director.name}</span>
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <button
                  onClick={handleWatch}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-lg shadow-orange-500/20"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Regarder
                </button>
                {trailerKey && (
                  <button
                    onClick={() => setShowTrailer(!showTrailer)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Bande-annonce
                  </button>
                )}
                <button
                  onClick={handleFav}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                    fav ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${fav ? 'fill-red-400' : ''}`} />
                  {fav ? 'Favori' : 'Ajouter'}
                </button>
              </div>

              {/* Star rating */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-500 text-sm">Votre note :</span>
                <StarRating contentId={id} contentType={type} />
              </div>
            </div>
          </div>

          {/* TV Season/Episode Selector */}
          {type === 'tv' && seasons.length > 0 && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <ChevronDown className="w-4 h-4" />
                Sélectionner un épisode
              </h3>
              <div className="flex flex-wrap gap-3">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Saison</label>
                  <select
                    value={season}
                    onChange={e => { setSeason(Number(e.target.value)); setEpisode(1); }}
                    className="bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500/50"
                  >
                    {seasons.map((s: any) => (
                      <option key={s.season_number} value={s.season_number}>
                        Saison {s.season_number} ({s.episode_count} ép.)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Épisode</label>
                  <select
                    value={episode}
                    onChange={e => setEpisode(Number(e.target.value))}
                    className="bg-gray-800 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500/50"
                  >
                    {Array.from(
                      { length: seasons.find((s: any) => s.season_number === season)?.episode_count || 1 },
                      (_, i) => i + 1
                    ).map(ep => (
                      <option key={ep} value={ep}>Épisode {ep}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Trailer */}
          {showTrailer && trailerKey && (
            <div className="mt-6">
              <h3 className="text-white font-semibold mb-3">🎬 Bande-annonce</h3>
              <div className="aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                  title="Bande-annonce"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Main Player */}
          {showPlayer && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">▶ Lecteur</h3>
                <button
                  onClick={openInNewTab}
                  className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 text-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ouvrir dans un nouvel onglet
                </button>
              </div>
              <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
                <iframe
                  src={playerUrl}
                  title={title}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  className="w-full h-full"
                  referrerPolicy="origin"
                />
              </div>
            </div>
          )}

          {/* Cast */}
          {cast.length > 0 && (
            <div className="mt-6">
              <h3 className="text-white font-semibold mb-3">🎭 Casting</h3>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {cast.map((actor: any) => (
                  <div key={actor.id} className="text-center">
                    {actor.profile_path ? (
                      <img
                        src={tmdbImage(actor.profile_path, 'w92') || ''}
                        alt={actor.name}
                        loading="lazy"
                        className="w-full aspect-square object-cover rounded-full mb-1 border border-white/10"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-gray-800 rounded-full mb-1 flex items-center justify-center text-gray-600 text-xs">
                        {actor.name[0]}
                      </div>
                    )}
                    <p className="text-gray-400 text-xs line-clamp-2 leading-tight">{actor.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
