import { useState, useEffect, useCallback } from 'react';
import { Search, X, Star, SlidersHorizontal, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { rawg } from '../services/api';
import GameCard from '../components/ui/GameCard';
import Carousel from '../components/ui/Carousel';
import GameDetail from '../components/GameDetail';
import LoadingSpinner, { GameCardSkeleton } from '../components/ui/LoadingSpinner';

type Tab = 'home' | 'library';

const GENRE_BUTTONS = [
  { slug: 'action', label: '⚔️ Action' },
  { slug: 'adventure', label: '🗺️ Aventure' },
  { slug: 'role-playing-games-rpg', label: '🧙 RPG' },
  { slug: 'shooter', label: '🔫 FPS/TPS' },
  { slug: 'strategy', label: '♟️ Stratégie' },
  { slug: 'simulation', label: '🏗️ Simulation' },
  { slug: 'sports', label: '⚽ Sport' },
  { slug: 'puzzle', label: '🧩 Puzzle' },
  { slug: 'horror', label: '👻 Horreur' },
  { slug: 'indie', label: '🎨 Indé' },
];

const SORT_OPTIONS = [
  { value: '-rating', label: 'Par note' },
  { value: '-released', label: 'Par date de sortie' },
  { value: '-added', label: 'Par popularité' },
];

const MIN_RATINGS = [
  { value: '', label: 'Toutes' },
  { value: '3', label: '★★★ 3+' },
  { value: '3.5', label: '★★★½ 3.5+' },
  { value: '4', label: '★★★★ 4+' },
  { value: '4.5', label: '★★★★½ 4.5+' },
];

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 2000;

function isAdultGame(esrb: any, tags: any[]): boolean {
  if (!esrb) return false;
  if (esrb.slug === 'adults-only' || esrb.name?.toLowerCase().includes('adult')) return true;
  return (tags || []).some((t: any) =>
    ['adult', 'nsfw', 'adults-only', 'erotic', 'explicit'].some(kw => t.slug?.toLowerCase().includes(kw))
  );
}

interface GamesGridProps {
  initialGenre?: string;
  onSelect: (id: number) => void;
}

function GamesLibrary({ initialGenre, onSelect }: GamesGridProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState(initialGenre || '');
  const [minRating, setMinRating] = useState('');
  const [yearRange, setYearRange] = useState(CURRENT_YEAR);
  const [sortBy, setSortBy] = useState('-rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSidebar, setShowSidebar] = useState(true);
  const PAGE_SIZE = 20;

  const fetchGames = useCallback(async (pg: number) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        ordering: sortBy,
        page_size: PAGE_SIZE,
        page: pg,
      };
      if (genre) params['genres'] = genre;
      if (minRating) params['rating'] = minRating;
      if (yearRange < CURRENT_YEAR) {
        params['dates'] = `${MIN_YEAR}-01-01,${yearRange}-12-31`;
      }

      let data: any;
      if (query.trim()) {
        data = await rawg.searchGames(query, pg);
      } else {
        data = await rawg.games(params);
      }
      setItems(data.results || []);
      setTotalCount(data.count || 0);
    } finally {
      setLoading(false);
    }
  }, [genre, minRating, yearRange, sortBy, query]);

  useEffect(() => { fetchGames(page); }, [fetchGames, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
    setPage(1);
  };

  const resetFilters = () => {
    setGenre(''); setMinRating(''); setYearRange(CURRENT_YEAR); setQuery(''); setSearch('');
    setSortBy('-rating'); setPage(1);
  };

  const activeFilters = [
    genre && GENRE_BUTTONS.find(g => g.slug === genre)?.label,
    minRating && `Note ≥ ${minRating}`,
    yearRange < CURRENT_YEAR && `≤ ${yearRange}`,
    query && `"${query}"`,
  ].filter(Boolean);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const pageNumbers = () => {
    const pages: (number | '...')[] = [];
    const total = Math.min(totalPages, 50);
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
      if (page < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className={`${showSidebar ? 'w-64 flex-shrink-0' : 'hidden'} space-y-6`}>
        <div className="bg-gray-900 rounded-xl border border-white/10 p-4 space-y-5">
          {/* Search */}
          <div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full bg-gray-800 border border-white/10 rounded-lg pl-8 pr-2 py-2 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              {query && (
                <button type="button" onClick={() => { setQuery(''); setSearch(''); setPage(1); }} className="text-gray-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Genre */}
          <div>
            <h4 className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">Genre</h4>
            <div className="flex flex-wrap gap-1.5">
              {GENRE_BUTTONS.map(g => (
                <button
                  key={g.slug}
                  onClick={() => { setGenre(genre === g.slug ? '' : g.slug); setPage(1); }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${genre === g.slug ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note min */}
          <div>
            <h4 className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">Note minimum</h4>
            <div className="space-y-1.5">
              {MIN_RATINGS.map(r => (
                <label key={r.value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="minRating"
                    value={r.value}
                    checked={minRating === r.value}
                    onChange={() => { setMinRating(r.value); setPage(1); }}
                    className="accent-purple-500"
                  />
                  <span className={`text-xs transition-colors ${minRating === r.value ? 'text-yellow-400' : 'text-gray-400 group-hover:text-white'}`}>
                    {r.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Year range */}
          <div>
            <h4 className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">
              Année ≤ {yearRange}
            </h4>
            <input
              type="range"
              min={MIN_YEAR}
              max={CURRENT_YEAR}
              value={yearRange}
              onChange={e => { setYearRange(Number(e.target.value)); setPage(1); }}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{MIN_YEAR}</span>
              <span>{CURRENT_YEAR}</span>
            </div>
          </div>

          {/* Plateforme (verrouillée PC) */}
          <div>
            <h4 className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">Plateforme</h4>
            <div className="space-y-1">
              {['Windows', 'Linux', 'macOS'].map(p => (
                <div key={p} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-600/40 border border-purple-500/50 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-sm bg-purple-400"></div>
                  </div>
                  <span className="text-gray-400 text-xs">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reset */}
          {activeFilters.length > 0 && (
            <button onClick={resetFilters} className="w-full text-xs text-gray-400 hover:text-white py-2 border border-white/10 rounded-lg hover:border-white/20 transition-colors">
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Content bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            {totalCount > 0 && (
              <span className="text-gray-400 text-sm">
                <span className="text-white font-semibold">{totalCount.toLocaleString()}</span> jeux trouvés
              </span>
            )}
            {/* Active filter tags */}
            {activeFilters.map((f, i) => (
              <span key={i} className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full border border-purple-500/30">
                {f}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(1); }}
              className="bg-gray-800 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500/50"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="flex rounded-lg overflow-hidden border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Games */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-3'}>
            <GameCardSkeleton count={12} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>Aucun jeu trouvé avec ces filtres.</p>
            <button onClick={resetFilters} className="mt-3 text-purple-400 hover:underline text-sm">Réinitialiser</button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(g => (
              <GameCard
                key={g.id}
                id={g.id}
                name={g.name}
                backgroundImage={g.background_image}
                rating={g.rating}
                released={g.released}
                esrbRating={g.esrb_rating}
                onClick={() => onSelect(g.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(g => {
              const adult = isAdultGame(g.esrb_rating, g.tags || []);
              return (
                <div
                  key={g.id}
                  onClick={() => onSelect(g.id)}
                  className="flex gap-4 bg-gray-900 border border-white/10 hover:border-purple-500/40 rounded-xl p-3 cursor-pointer transition-all hover:bg-gray-800/80 group"
                >
                  <div className="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden bg-gray-800">
                    {g.background_image ? (
                      <img
                        src={g.background_image}
                        alt={g.name}
                        loading="lazy"
                        className={`w-full h-full object-cover ${adult ? 'blur-md' : ''}`}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-medium line-clamp-1 group-hover:text-purple-300 transition-colors">{g.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      {g.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-yellow-400 text-xs">{g.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {g.released && <span className="text-gray-500 text-xs">{g.released?.split('-')[0]}</span>}
                      {adult && <span className="text-xs bg-red-600/20 text-red-400 px-1.5 py-0.5 rounded border border-red-600/30">🔞 18+</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(g.genres || []).slice(0, 3).map((genre: any) => (
                        <span key={genre.id} className="text-xs bg-white/5 text-gray-500 px-1.5 py-0.5 rounded">{genre.name}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
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
                <span key={`e-${i}`} className="text-gray-500 px-1">...</span>
              ) : (
                <button
                  key={pg}
                  onClick={() => setPage(Number(pg))}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === pg ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                >
                  {pg}
                </button>
              )
            )}
            <button
              onClick={() => setPage(p => Math.min(Math.min(totalPages, 50), p + 1))}
              disabled={page >= Math.min(totalPages, 50)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GamesHome({ onSelect, onGenreClick }: { onSelect: (id: number) => void; onGenreClick: (genre: string) => void }) {
  const [top10, setTop10] = useState<any[]>([]);
  const [genreTops, setGenreTops] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  const MAIN_GENRES = ['action', 'adventure', 'role-playing-games-rpg', 'shooter', 'sports', 'simulation'];

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const top = await rawg.topGames(1);
        setTop10((top.results || []).slice(0, 10));

        const genreResults: Record<string, any[]> = {};
        for (const g of MAIN_GENRES.slice(0, 4)) {
          const data = await rawg.gamesByGenre(g, 1);
          genreResults[g] = (data.results || []).slice(0, 10);
        }
        setGenreTops(genreResults);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <LoadingSpinner />;

  const genreNames: Record<string, string> = {
    'action': '⚔️ Action',
    'adventure': '🗺️ Aventure',
    'role-playing-games-rpg': '🧙 RPG',
    'shooter': '🔫 FPS/TPS',
    'sports': '⚽ Sport',
    'simulation': '🏗️ Simulation',
  };

  return (
    <div className="space-y-12">
      <Carousel title="🏆 Top 10 Jeux PC du moment">
        {top10.map((g, i) => (
          <div key={g.id} className="min-w-[240px] sm:min-w-[280px]">
            <GameCard
              id={g.id}
              name={g.name}
              backgroundImage={g.background_image}
              rating={g.rating}
              released={g.released}
              esrbRating={g.esrb_rating}
              rank={i + 1}
              onClick={() => onSelect(g.id)}
            />
          </div>
        ))}
      </Carousel>

      {/* Genre quick access */}
      <div>
        <h2 className="text-white text-xl font-bold mb-4">🎯 Par genre</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          {GENRE_BUTTONS.map(g => (
            <button
              key={g.slug}
              onClick={() => onGenreClick(g.slug)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/40 hover:to-blue-600/40 border border-purple-500/30 text-white rounded-xl text-sm font-medium transition-all hover:scale-105"
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top by genre */}
      {MAIN_GENRES.slice(0, 4).map(slug => {
        const games = genreTops[slug] || [];
        if (games.length === 0) return null;
        return (
          <Carousel key={slug} title={`🎮 Top ${genreNames[slug]}`}>
            {games.map((g, i) => (
              <div key={g.id} className="min-w-[240px] sm:min-w-[280px]">
                <GameCard
                  id={g.id}
                  name={g.name}
                  backgroundImage={g.background_image}
                  rating={g.rating}
                  released={g.released}
                  esrbRating={g.esrb_rating}
                  rank={i + 1}
                  onClick={() => onSelect(g.id)}
                />
              </div>
            ))}
          </Carousel>
        );
      })}
    </div>
  );
}

export default function Jeux() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [libraryGenre, setLibraryGenre] = useState('');

  const handleGenreClick = (genre: string) => {
    setLibraryGenre(genre);
    setActiveTab('library');
  };

  return (
    <div
      className="min-h-screen text-white pt-16"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(88, 28, 135, 0.3) 0%, rgb(3, 7, 18) 70%)' }}
    >
      <div className="bg-gradient-to-b from-purple-950/30 to-transparent border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-0">
          <h1 className="text-3xl font-bold text-white mb-6">Jeux PC</h1>
          <div className="flex gap-1">
            {[
              { id: 'home' as Tab, label: '🏠 Accueil Jeux' },
              { id: 'library' as Tab, label: '📚 Bibliothèque' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
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
        {activeTab === 'home' && (
          <GamesHome onSelect={setSelectedGame} onGenreClick={handleGenreClick} />
        )}
        {activeTab === 'library' && (
          <GamesLibrary key={libraryGenre} initialGenre={libraryGenre} onSelect={setSelectedGame} />
        )}
      </div>

      {selectedGame !== null && (
        <GameDetail id={selectedGame} onClose={() => setSelectedGame(null)} />
      )}
    </div>
  );
}
