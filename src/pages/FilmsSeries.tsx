import { useState, useEffect, useCallback } from 'react';
import { Search, X, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { tmdb } from '../services/api';
import MediaCard from '../components/ui/MediaCard';
import Carousel from '../components/ui/Carousel';
import MediaDetail from '../components/MediaDetail';
import LoadingSpinner, { CardSkeleton } from '../components/ui/LoadingSpinner';

type Tab = 'home' | 'movies' | 'series' | 'animation' | 'search';

const TABS: { id: Tab; label: string }[] = [
  { id: 'home', label: '🏠 Accueil' },
  { id: 'movies', label: '🎬 Films' },
  { id: 'series', label: '📺 Séries' },
  { id: 'animation', label: '🎨 Animations' },
  { id: 'search', label: '🔍 Recherche' },
];

const MOVIE_GENRES = [
  { id: 28, name: 'Action' }, { id: 12, name: 'Aventure' }, { id: 35, name: 'Comédie' },
  { id: 80, name: 'Crime' }, { id: 18, name: 'Drame' }, { id: 27, name: 'Horreur' },
  { id: 10749, name: 'Romance' }, { id: 878, name: 'Science-fiction' }, { id: 53, name: 'Thriller' },
  { id: 10752, name: 'Guerre' }, { id: 37, name: 'Western' }, { id: 9648, name: 'Mystère' },
];
const TV_GENRES = [
  { id: 28, name: 'Action' }, { id: 35, name: 'Comédie' }, { id: 80, name: 'Crime' },
  { id: 18, name: 'Drame' }, { id: 9648, name: 'Mystère' }, { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10759, name: 'Action & Aventure' }, { id: 10768, name: 'Guerre & Politique' },
];
const YEARS = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());
const RATINGS = ['6', '7', '8', '9'];

interface GridProps {
  type: 'movie' | 'tv';
  genres: { id: number; name: string }[];
  isAnimation?: boolean;
  onSelect: (id: number, type: 'movie' | 'tv') => void;
}

function MediaGrid({ type, genres, isAnimation, onSelect }: GridProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [minRating, setMinRating] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetch = useCallback(async (pg: number) => {
    setLoading(true);
    try {
      let data: any;
      const params: Record<string, string | number> = {
        sort_by: 'popularity.desc',
        page: pg,
      };
      if (isAnimation) {
        params['with_genres'] = '16';
      } else if (genre) {
        params['with_genres'] = genre;
      }
      if (year) {
        if (type === 'movie') params['primary_release_year'] = year;
        else params['first_air_date_year'] = year;
      }
      if (minRating) params['vote_average.gte'] = minRating;

      if (query.trim()) {
        if (type === 'movie') data = await tmdb.searchMovies(query, pg);
        else data = await tmdb.searchTv(query, pg);
      } else {
        if (type === 'movie') data = await tmdb.discoverMovies(params);
        else data = await tmdb.discoverTv(params);
      }
      setItems(data.results || []);
      setTotalPages(Math.min(data.total_pages || 1, 20));
    } finally {
      setLoading(false);
    }
  }, [type, isAnimation, genre, year, minRating, query]);

  useEffect(() => { fetch(page); }, [fetch, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
    setPage(1);
  };

  const resetFilters = () => {
    setGenre(''); setYear(''); setMinRating(''); setQuery(''); setSearch(''); setPage(1);
  };

  const pageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div>
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Rechercher ${type === 'movie' ? 'un film' : 'une série'}...`}
              className="w-full bg-gray-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            OK
          </button>
          {(query || genre || year || minRating) && (
            <button type="button" onClick={resetFilters} className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtres
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-gray-900 border border-white/10 rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-gray-400 text-xs mb-2 block">Genre</label>
            <select
              value={genre}
              onChange={e => { setGenre(e.target.value); setPage(1); }}
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            >
              <option value="">Tous les genres</option>
              {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-2 block">Année</label>
            <select
              value={year}
              onChange={e => { setYear(e.target.value); setPage(1); }}
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            >
              <option value="">Toutes les années</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-2 block">Note minimum</label>
            <select
              value={minRating}
              onChange={e => { setMinRating(e.target.value); setPage(1); }}
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            >
              <option value="">Toutes les notes</option>
              {RATINGS.map(r => <option key={r} value={r}>≥ {r}/10 ⭐</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Active filters */}
      {(query || genre || year || minRating) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {query && <span className="bg-orange-500/20 text-orange-400 text-xs px-2.5 py-1 rounded-full border border-orange-500/30">"{query}"</span>}
          {genre && <span className="bg-orange-500/20 text-orange-400 text-xs px-2.5 py-1 rounded-full border border-orange-500/30">{genres.find(g => String(g.id) === genre)?.name}</span>}
          {year && <span className="bg-orange-500/20 text-orange-400 text-xs px-2.5 py-1 rounded-full border border-orange-500/30">{year}</span>}
          {minRating && <span className="bg-orange-500/20 text-orange-400 text-xs px-2.5 py-1 rounded-full border border-orange-500/30">≥ {minRating}★</span>}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <CardSkeleton count={12} />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map(item => (
            <MediaCard
              key={item.id}
              id={item.id}
              type={type}
              title={item.title || item.name}
              posterPath={item.poster_path}
              voteAverage={item.vote_average}
              releaseDate={item.release_date || item.first_air_date}
              onClick={() => onSelect(item.id, type)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {pageNumbers().map((pg, i) =>
            pg === '...' ? (
              <span key={`ellipsis-${i}`} className="text-gray-500 px-1">...</span>
            ) : (
              <button
                key={pg}
                onClick={() => setPage(Number(pg))}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === pg ? 'bg-orange-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              >
                {pg}
              </button>
            )
          )}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function HomeTab({ onSelect }: { onSelect: (id: number, type: 'movie' | 'tv') => void }) {
  const [topMovies, setTopMovies] = useState<any[]>([]);
  const [topSeries, setTopSeries] = useState<any[]>([]);
  const [topAnim, setTopAnim] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [movies, series, animM] = await Promise.all([
          tmdb.topRated('movie', 1),
          tmdb.topRated('tv', 1),
          tmdb.animationMovies(1),
        ]);
        setTopMovies((movies.results || []).slice(0, 10));
        setTopSeries((series.results || []).slice(0, 10));
        setTopAnim((animM.results || []).slice(0, 10));
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <LoadingSpinner />;

  const renderCarousel = (title: string, items: any[], type: 'movie' | 'tv') => (
    <Carousel title={title} className="mb-12">
      {items.map((item, i) => (
        <div key={item.id} className="min-w-[160px] sm:min-w-[180px]">
          <MediaCard
            id={item.id}
            type={type}
            title={item.title || item.name}
            posterPath={item.poster_path}
            voteAverage={item.vote_average}
            releaseDate={item.release_date || item.first_air_date}
            rank={i + 1}
            onClick={() => onSelect(item.id, type)}
          />
        </div>
      ))}
    </Carousel>
  );

  return (
    <div>
      {renderCarousel('🏆 Top 10 Films', topMovies, 'movie')}
      {renderCarousel('🏆 Top 10 Séries', topSeries, 'tv')}
      {renderCarousel('🎨 Top 10 Animations', topAnim, 'movie')}
    </div>
  );
}

function UnifiedSearch({ onSelect }: { onSelect: (id: number, type: 'movie' | 'tv') => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'tv' | 'animation'>('all');
  const [searched, setSearched] = useState(false);

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await tmdb.searchMulti(q);
      setResults((data.results || []).filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  const filtered = results.filter(r => {
    if (typeFilter === 'all') return true;
    if (typeFilter === 'movie') return r.media_type === 'movie' && !(r.genre_ids?.includes(16));
    if (typeFilter === 'tv') return r.media_type === 'tv' && !(r.genre_ids?.includes(16));
    if (typeFilter === 'animation') return r.genre_ids?.includes(16);
    return true;
  });

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher Films, Séries, Animations..."
            className="w-full bg-gray-900 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
          />
        </div>
        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors">
          Rechercher
        </button>
      </form>

      {/* Type filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'movie', 'tv', 'animation'] as const).map(f => (
          <button
            key={f}
            onClick={() => setTypeFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${typeFilter === f ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
          >
            {f === 'all' ? 'Tout' : f === 'movie' ? 'Films' : f === 'tv' ? 'Séries' : 'Animations'}
          </button>
        ))}
        {results.length > 0 && <span className="text-gray-500 text-sm self-center ml-2">{filtered.length} résultat(s)</span>}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <CardSkeleton count={12} />
        </div>
      ) : searched && filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Aucun résultat pour "{query}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(item => (
            <MediaCard
              key={item.id}
              id={item.id}
              type={item.media_type}
              title={item.title || item.name}
              posterPath={item.poster_path}
              voteAverage={item.vote_average}
              releaseDate={item.release_date || item.first_air_date}
              onClick={() => onSelect(item.id, item.media_type)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilmsSeries() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: 'movie' | 'tv' } | null>(null);

  const handleSelect = (id: number, type: 'movie' | 'tv') => {
    setSelectedMedia({ id, type });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-16">
      {/* Page header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-0">
          <h1 className="text-3xl font-bold text-white mb-6">Films & Séries</h1>
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-0" style={{ scrollbarWidth: 'none' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-white/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'home' && <HomeTab onSelect={handleSelect} />}
        {activeTab === 'movies' && <MediaGrid type="movie" genres={MOVIE_GENRES} onSelect={handleSelect} />}
        {activeTab === 'series' && <MediaGrid type="tv" genres={TV_GENRES} onSelect={handleSelect} />}
        {activeTab === 'animation' && <MediaGrid type="movie" genres={MOVIE_GENRES} isAnimation onSelect={handleSelect} />}
        {activeTab === 'search' && <UnifiedSearch onSelect={handleSelect} />}
      </div>

      {selectedMedia && (
        <MediaDetail id={selectedMedia.id} type={selectedMedia.type} onClose={() => setSelectedMedia(null)} />
      )}
    </div>
  );
}
