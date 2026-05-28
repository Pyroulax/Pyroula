import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { tmdb, rawg, tmdbImage, formatYear } from '../services/api';
import MediaDetail from '../components/MediaDetail';
import GameDetail from '../components/GameDetail';
import LoadingSpinner from '../components/ui/LoadingSpinner';

type Filter = 'all' | 'movies' | 'series' | 'games';

interface NewItem {
  id: number;
  type: 'movie' | 'tv' | 'game';
  title: string;
  poster: string | null;
  rating: number;
  date: string;
  year: string;
  genres?: string[];
}

export default function Nouveautes() {
  const [items, setItems] = useState<NewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: 'movie' | 'tv' } | null>(null);
  const [selectedGame, setSelectedGame] = useState<number | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [nowPlaying, onAir, newGames] = await Promise.all([
          tmdb.nowPlaying(1),
          tmdb.airingToday(1),
          rawg.newGames(),
        ]);

        const movies: NewItem[] = (nowPlaying.results || []).slice(0, 20).map((m: any) => ({
          id: m.id,
          type: 'movie' as const,
          title: m.title,
          poster: m.poster_path,
          rating: m.vote_average,
          date: m.release_date,
          year: formatYear(m.release_date),
        }));

        const series: NewItem[] = (onAir.results || []).slice(0, 20).map((s: any) => ({
          id: s.id,
          type: 'tv' as const,
          title: s.name,
          poster: s.poster_path,
          rating: s.vote_average,
          date: s.first_air_date,
          year: formatYear(s.first_air_date),
        }));

        const games: NewItem[] = (newGames.results || []).slice(0, 20).map((g: any) => ({
          id: g.id,
          type: 'game' as const,
          title: g.name,
          poster: g.background_image,
          rating: g.rating,
          date: g.released,
          year: formatYear(g.released),
          genres: (g.genres || []).map((gn: any) => gn.name).slice(0, 2),
        }));

        // Merge and sort by date desc
        const all = [...movies, ...series, ...games].sort((a, b) => {
          const da = new Date(a.date || '1900-01-01').getTime();
          const db = new Date(b.date || '1900-01-01').getTime();
          return db - da;
        });

        setItems(all);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filtered = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'movies') return item.type === 'movie';
    if (filter === 'series') return item.type === 'tv';
    if (filter === 'games') return item.type === 'game';
    return true;
  });

  const handleItemClick = (item: NewItem) => {
    if (item.type === 'game') {
      setSelectedGame(item.id);
    } else {
      setSelectedMedia({ id: item.id, type: item.type });
    }
  };

  const typeLabel = (type: string) => {
    if (type === 'movie') return { label: '🎬 Film', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    if (type === 'tv') return { label: '📺 Série', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    return { label: '🎮 Jeu PC', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
  };

  const posterUrl = (item: NewItem) => {
    if (item.type === 'game') return item.poster;
    return tmdbImage(item.poster, 'w342');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-16">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
          <h1 className="text-3xl font-bold text-white mb-2">✨ Nouveautés</h1>
          <p className="text-gray-400 text-sm mb-6">Les dernières sorties films, séries et jeux PC</p>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {([
              { id: 'all', label: 'Tout' },
              { id: 'movies', label: '🎬 Films' },
              { id: 'series', label: '📺 Séries' },
              { id: 'games', label: '🎮 Jeux' },
            ] as const).map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === f.id
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {f.label}
              </button>
            ))}
            <span className="text-gray-500 text-sm self-center ml-2">{filtered.length} titres</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map(item => {
              const { label, color } = typeLabel(item.type);
              const img = posterUrl(item);
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleItemClick(item)}
                  className="relative group cursor-pointer rounded-xl overflow-hidden bg-gray-900 border border-white/10 hover:border-orange-500/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-black/50"
                >
                  {/* Poster / Image */}
                  <div className={`relative ${item.type === 'game' ? 'aspect-[16/10]' : 'aspect-[2/3]'} bg-gray-800`}>
                    {img ? (
                      <img
                        src={img}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        {item.type === 'game' ? '🎮' : item.type === 'tv' ? '📺' : '🎬'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-2 left-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium backdrop-blur-sm ${color}`}>
                        {label}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5">
                    <h3 className="text-white text-xs font-medium line-clamp-2 mb-1 leading-tight">{item.title}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {item.rating > 0 && (
                          <>
                            <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                            <span className="text-yellow-400 text-xs">{item.rating.toFixed(1)}</span>
                          </>
                        )}
                        <span className="text-gray-600 text-xs ml-1">{item.year}</span>
                      </div>
                    </div>
                    {item.genres && item.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.genres.slice(0, 2).map(g => (
                          <span key={g} className="text-xs text-gray-600">{g}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedMedia && (
        <MediaDetail id={selectedMedia.id} type={selectedMedia.type} onClose={() => setSelectedMedia(null)} />
      )}
      {selectedGame !== null && (
        <GameDetail id={selectedGame} onClose={() => setSelectedGame(null)} />
      )}
    </div>
  );
}
