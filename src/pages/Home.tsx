import { useState, useEffect, useRef } from 'react';
import { Play, Star, Flame, Gamepad2, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { tmdb, rawg, tmdbImage, formatYear } from '../services/api';
import { getDailyPick, setDailyPick, shouldRefreshDailyPick } from '../store/localStore';
import MediaCard from '../components/ui/MediaCard';
import GameCard from '../components/ui/GameCard';
import Carousel from '../components/ui/Carousel';
import MediaDetail from '../components/MediaDetail';
import GameDetail from '../components/GameDetail';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Home() {
  const [hero, setHero] = useState<any[]>([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const [dailyMovie, setDailyMovie] = useState<any>(null);
  const [dailyGame, setDailyGame] = useState<any>(null);
  const [newMovies, setNewMovies] = useState<any[]>([]);
  const [newSeries, setNewSeries] = useState<any[]>([]);
  const [newGames, setNewGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: 'movie' | 'tv' } | null>(null);
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const heroTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [trending, nowPlaying, onAir, newGamesData, topMovies] = await Promise.all([
          tmdb.trending('all', 'week'),
          tmdb.nowPlaying(1),
          tmdb.onTheAir(1),
          rawg.newGames(),
          tmdb.topRated('movie', 1),
        ]);

        const heroItems = (trending.results || []).slice(0, 8).filter((i: any) => i.backdrop_path);
        setHero(heroItems);

        // Daily movie
        if (shouldRefreshDailyPick('movie')) {
          const pool = topMovies.results || [];
          const pick = pool[Math.floor(Math.random() * Math.min(pool.length, 20))];
          if (pick) { setDailyPick('movie', pick.id); setDailyMovie(pick); }
        } else {
          const pick = getDailyPick('movie');
          if (pick) {
            const found = (topMovies.results || []).find((m: any) => m.id === pick.id);
            if (found) setDailyMovie(found);
            else { const pool = topMovies.results || []; const p = pool[0]; if (p) setDailyMovie(p); }
          }
        }

        // Daily game
        if (shouldRefreshDailyPick('game')) {
          const pool = newGamesData.results || [];
          const pick = pool[Math.floor(Math.random() * Math.min(pool.length, 10))];
          if (pick) { setDailyPick('game', pick.id); setDailyGame(pick); }
        } else {
          const pick = getDailyPick('game');
          if (pick) {
            const found = (newGamesData.results || []).find((g: any) => g.id === pick.id);
            if (found) setDailyGame(found);
            else { const pool = newGamesData.results || []; if (pool[0]) setDailyGame(pool[0]); }
          }
        }

        setNewMovies((nowPlaying.results || []).slice(0, 20));
        setNewSeries((onAir.results || []).slice(0, 20));
        setNewGames((newGamesData.results || []).slice(0, 20));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Auto-advance hero
  useEffect(() => {
    if (hero.length < 2) return;
    heroTimer.current = setInterval(() => {
      setHeroIdx(i => (i + 1) % hero.length);
    }, 6000);
    return () => { if (heroTimer.current) clearInterval(heroTimer.current); };
  }, [hero.length]);

  const currentHero = hero[heroIdx];
  const heroBackdrop = currentHero ? tmdbImage(currentHero.backdrop_path, 'original') : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {heroBackdrop && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{ backgroundImage: `url(${heroBackdrop})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/30" />

        {currentHero && (
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-end pb-16">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 text-sm font-medium">Tendance</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 leading-tight">
                {currentHero.title || currentHero.name}
              </h1>
              {currentHero.vote_average > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 font-semibold">{currentHero.vote_average.toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">
                    {formatYear(currentHero.release_date || currentHero.first_air_date)}
                  </span>
                </div>
              )}
              {currentHero.overview && (
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 line-clamp-3">
                  {currentHero.overview}
                </p>
              )}
              <button
                onClick={() => setSelectedMedia({ id: currentHero.id, type: currentHero.media_type as 'movie' | 'tv' })}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-orange-500/30"
              >
                <Play className="w-5 h-5 fill-white" />
                Regarder maintenant
              </button>
            </div>
          </div>
        )}

        {/* Hero navigation dots */}
        {hero.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <button onClick={() => setHeroIdx(i => (i - 1 + hero.length) % hero.length)} className="p-1 text-white/60 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            {hero.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIdx(i)}
                className={`rounded-full transition-all ${i === heroIdx ? 'w-6 h-2 bg-orange-500' : 'w-2 h-2 bg-white/40 hover:bg-white/60'}`}
              />
            ))}
            <button onClick={() => setHeroIdx(i => (i + 1) % hero.length)} className="p-1 text-white/60 hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Daily picks */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-400" />
            Focus du jour
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Film du jour */}
            {dailyMovie ? (
              <div
                className="relative rounded-2xl overflow-hidden cursor-pointer group border border-white/10 hover:border-orange-500/30 transition-all"
                onClick={() => setSelectedMedia({ id: dailyMovie.id, type: 'movie' })}
              >
                <div className="relative h-56 overflow-hidden">
                  {tmdbImage(dailyMovie.backdrop_path, 'w780') && (
                    <img
                      src={tmdbImage(dailyMovie.backdrop_path, 'w780') || ''}
                      alt={dailyMovie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Film du jour
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg">{dailyMovie.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 text-sm">{dailyMovie.vote_average?.toFixed(1)}</span>
                    <span className="text-gray-400 text-sm">{formatYear(dailyMovie.release_date)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-gray-900 border border-white/10 h-56 animate-pulse" />
            )}

            {/* Jeu du jour */}
            {dailyGame ? (
              <div
                className="relative rounded-2xl overflow-hidden cursor-pointer group border border-white/10 hover:border-purple-500/30 transition-all"
                onClick={() => setSelectedGame(dailyGame.id)}
              >
                <div className="relative h-56 overflow-hidden">
                  {dailyGame.background_image && (
                    <img
                      src={dailyGame.background_image}
                      alt={dailyGame.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute top-3 left-3 bg-purple-600 text-white text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                    <Gamepad2 className="w-3 h-3" /> Jeu du jour
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg">{dailyGame.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 text-sm">{dailyGame.rating?.toFixed(1)}</span>
                    <span className="text-gray-400 text-sm">{formatYear(dailyGame.released)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-gray-900 border border-white/10 h-56 animate-pulse" />
            )}
          </div>
        </section>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* New Movies */}
            <Carousel title="🎬 Nouveaux Films">
              {newMovies.map(m => (
                <div key={m.id} className="min-w-[160px] sm:min-w-[180px]">
                  <MediaCard
                    id={m.id}
                    type="movie"
                    title={m.title}
                    posterPath={m.poster_path}
                    voteAverage={m.vote_average}
                    releaseDate={m.release_date}
                    onClick={() => setSelectedMedia({ id: m.id, type: 'movie' })}
                  />
                </div>
              ))}
            </Carousel>

            {/* New Series */}
            <Carousel title="📺 Nouvelles Séries">
              {newSeries.map(s => (
                <div key={s.id} className="min-w-[160px] sm:min-w-[180px]">
                  <MediaCard
                    id={s.id}
                    type="tv"
                    title={s.name}
                    posterPath={s.poster_path}
                    voteAverage={s.vote_average}
                    releaseDate={s.first_air_date}
                    onClick={() => setSelectedMedia({ id: s.id, type: 'tv' })}
                  />
                </div>
              ))}
            </Carousel>

            {/* New PC Games */}
            <Carousel title="🎮 Derniers Jeux PC">
              {newGames.map(g => (
                <div key={g.id} className="min-w-[220px] sm:min-w-[260px]">
                  <GameCard
                    id={g.id}
                    name={g.name}
                    backgroundImage={g.background_image}
                    rating={g.rating}
                    released={g.released}
                    esrbRating={g.esrb_rating}
                    onClick={() => setSelectedGame(g.id)}
                  />
                </div>
              ))}
            </Carousel>
          </>
        )}
      </div>

      {/* Modals */}
      {selectedMedia && (
        <MediaDetail id={selectedMedia.id} type={selectedMedia.type} onClose={() => setSelectedMedia(null)} />
      )}
      {selectedGame !== null && (
        <GameDetail id={selectedGame} onClose={() => setSelectedGame(null)} />
      )}
    </div>
  );
}
