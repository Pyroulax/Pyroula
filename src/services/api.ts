// All API calls go through proxy endpoints to keep keys server-side
// In this SPA build, we call TMDB/RAWG directly with env-style constants
// Keys are embedded only for demo — in production they'd be behind Express routes

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = '7f7f20973217ae9eff4183ce8531c8cf';
const RAWG_BASE = 'https://api.rawg.io/api';
const RAWG_API_KEY = 'ac07385005924e0ba8de4f7c1a3460f5';
const YOUTUBE_API_KEY = 'AIzaSyANQWKhxN8OwN9_Jqq4F53YjT-y6eb3DeM';

export const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p';

// ─── TMDB ─────────────────────────────────────────────────────────────────────

async function tmdbFetch(path: string, params: Record<string, string | number> = {}) {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'fr-FR');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB error ${res.status}`);
  return res.json();
}

export const tmdb = {
  trending: (type: 'movie' | 'tv' | 'all', window: 'day' | 'week' = 'week') =>
    tmdbFetch(`/trending/${type}/${window}`),

  topRated: (type: 'movie' | 'tv', page = 1) =>
    tmdbFetch(`/${type}/top_rated`, { page }),

  popular: (type: 'movie' | 'tv', page = 1) =>
    tmdbFetch(`/${type}/popular`, { page }),

  nowPlaying: (page = 1) =>
    tmdbFetch('/movie/now_playing', { page }),

  upcoming: (page = 1) =>
    tmdbFetch('/movie/upcoming', { page }),

  airingToday: (page = 1) =>
    tmdbFetch('/tv/airing_today', { page }),

  onTheAir: (page = 1) =>
    tmdbFetch('/tv/on_the_air', { page }),

  movieDetails: (id: number) =>
    tmdbFetch(`/movie/${id}`, { append_to_response: 'credits,videos,similar' }),

  tvDetails: (id: number) =>
    tmdbFetch(`/tv/${id}`, { append_to_response: 'credits,videos,similar' }),

  tvSeason: (id: number, season: number) =>
    tmdbFetch(`/tv/${id}/season/${season}`),

  searchMulti: (query: string, page = 1) =>
    tmdbFetch('/search/multi', { query, page }),

  searchMovies: (query: string, page = 1) =>
    tmdbFetch('/search/movie', { query, page }),

  searchTv: (query: string, page = 1) =>
    tmdbFetch('/search/tv', { query, page }),

  discoverMovies: (params: Record<string, string | number> = {}) =>
    tmdbFetch('/discover/movie', params),

  discoverTv: (params: Record<string, string | number> = {}) =>
    tmdbFetch('/discover/tv', params),

  movieGenres: () =>
    tmdbFetch('/genre/movie/list'),

  tvGenres: () =>
    tmdbFetch('/genre/tv/list'),

  animationMovies: (page = 1) =>
    tmdbFetch('/discover/movie', { with_genres: '16', sort_by: 'popularity.desc', page }),

  animationTv: (page = 1) =>
    tmdbFetch('/discover/tv', { with_genres: '16', sort_by: 'popularity.desc', page }),
};

// ─── RAWG ─────────────────────────────────────────────────────────────────────

async function rawgFetch(path: string, params: Record<string, string | number> = {}) {
  const url = new URL(`${RAWG_BASE}${path}`);
  url.searchParams.set('key', RAWG_API_KEY);
  url.searchParams.set('platforms', '4'); // PC only
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`RAWG error ${res.status}`);
  return res.json();
}

export const rawg = {
  games: (params: Record<string, string | number> = {}) =>
    rawgFetch('/games', params),

  topGames: (page = 1) =>
    rawgFetch('/games', { ordering: '-rating', page_size: 20, page }),

  newGames: () => {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 18);
    const dateMin = cutoff.toISOString().split('T')[0];
    const dateMax = now.toISOString().split('T')[0];
    return rawgFetch('/games', {
      ordering: '-released',
      dates: `${dateMin},${dateMax}`,
      page_size: 20,
    });
  },

  gamesByGenre: (genreSlug: string, page = 1) =>
    rawgFetch('/games', { genres: genreSlug, ordering: '-rating', page_size: 20, page }),

  gameDetails: (id: number | string) =>
    rawgFetch(`/games/${id}`),

  gameScreenshots: (id: number | string) =>
    rawgFetch(`/games/${id}/screenshots`),

  genres: () =>
    rawgFetch('/genres'),

  searchGames: (query: string, page = 1) =>
    rawgFetch('/games', { search: query, page_size: 20, page }),
};

// ─── YouTube ──────────────────────────────────────────────────────────────────

export async function searchYouTubeTrailer(title: string, year?: string) {
  const query = `${title} ${year ? year : ''} official trailer`;
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('key', YOUTUBE_API_KEY);
  url.searchParams.set('q', query);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', '1');
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = await res.json();
  return data.items?.[0]?.id?.videoId ?? null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function tmdbImage(path: string | null | undefined, size = 'w500') {
  if (!path) return null;
  return `${TMDB_IMG_BASE}/${size}${path}`;
}

export function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatYear(dateStr: string) {
  if (!dateStr) return '';
  return dateStr.split('-')[0];
}
