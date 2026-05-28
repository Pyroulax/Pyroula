// Local storage helpers for favorites, history, ratings, badges, theme

export interface WatchHistoryItem {
  id: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  progressSeconds: number;
  totalSeconds: number;
  updatedAt: string;
}

export interface FavoriteItem {
  id: string;
  contentId: number;
  contentType: 'movie' | 'tv' | 'game';
  title: string;
  posterPath: string | null;
  rating?: number;
  year?: string;
  createdAt: string;
}

export interface RatingItem {
  contentId: number;
  contentType: 'movie' | 'tv' | 'game';
  ratingValue: number;
  createdAt: string;
}

export interface Badge {
  id: string;
  label: string;
  emoji: string;
  description: string;
  unlockedAt?: string;
}

// ─── Theme ────────────────────────────────────────────────────────────────────

export function getTheme(): 'dark' | 'light' {
  return (localStorage.getItem('pyroula_theme') as 'dark' | 'light') || 'dark';
}

export function setTheme(theme: 'dark' | 'light') {
  localStorage.setItem('pyroula_theme', theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

// ─── Watch History ────────────────────────────────────────────────────────────

export function getWatchHistory(): WatchHistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem('pyroula_history') || '[]');
  } catch { return []; }
}

export function updateWatchHistory(item: Omit<WatchHistoryItem, 'updatedAt'>) {
  const history = getWatchHistory();
  const idx = history.findIndex(h => h.mediaId === item.mediaId && h.mediaType === item.mediaType);
  const updated = { ...item, updatedAt: new Date().toISOString() };
  if (idx >= 0) history[idx] = updated;
  else history.unshift(updated);
  localStorage.setItem('pyroula_history', JSON.stringify(history.slice(0, 50)));
  checkBadges();
}

export function clearWatchHistory() {
  localStorage.removeItem('pyroula_history');
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export function getFavorites(): FavoriteItem[] {
  try {
    return JSON.parse(localStorage.getItem('pyroula_favorites') || '[]');
  } catch { return []; }
}

export function toggleFavorite(item: Omit<FavoriteItem, 'id' | 'createdAt'>): boolean {
  const favorites = getFavorites();
  const idx = favorites.findIndex(
    f => f.contentId === item.contentId && f.contentType === item.contentType
  );
  if (idx >= 0) {
    favorites.splice(idx, 1);
    localStorage.setItem('pyroula_favorites', JSON.stringify(favorites));
    return false;
  } else {
    favorites.unshift({
      ...item,
      id: `${item.contentType}_${item.contentId}_${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('pyroula_favorites', JSON.stringify(favorites));
    checkBadges();
    return true;
  }
}

export function isFavorite(contentId: number, contentType: string): boolean {
  return getFavorites().some(f => f.contentId === contentId && f.contentType === contentType);
}

// ─── Ratings ─────────────────────────────────────────────────────────────────

export function getRatings(): RatingItem[] {
  try {
    return JSON.parse(localStorage.getItem('pyroula_ratings') || '[]');
  } catch { return []; }
}

export function setRating(item: RatingItem) {
  const ratings = getRatings();
  const idx = ratings.findIndex(r => r.contentId === item.contentId && r.contentType === item.contentType);
  if (idx >= 0) ratings[idx] = item;
  else ratings.unshift(item);
  localStorage.setItem('pyroula_ratings', JSON.stringify(ratings));
  checkBadges();
}

export function getRating(contentId: number, contentType: string): number {
  return getRatings().find(r => r.contentId === contentId && r.contentType === contentType)?.ratingValue || 0;
}

// ─── Badges ───────────────────────────────────────────────────────────────────

const ALL_BADGES: Badge[] = [
  { id: 'first_watch', emoji: '🎬', label: 'Premier visionnage', description: 'Premier film/série regardé' },
  { id: 'watch_5', emoji: '🍿', label: 'Cinéphile', description: '5 films/séries regardés' },
  { id: 'watch_10', emoji: '🎭', label: 'Passionné', description: '10 films/séries regardés' },
  { id: 'watch_25', emoji: '🏆', label: 'Marathonien', description: '25 films/séries regardés' },
  { id: 'first_fav', emoji: '❤️', label: 'Premier favori', description: 'Premier contenu ajouté aux favoris' },
  { id: 'fav_5', emoji: '💖', label: 'Collectionneur', description: '5 contenus en favoris' },
  { id: 'first_rating', emoji: '⭐', label: 'Critique en herbe', description: 'Première notation donnée' },
  { id: 'rating_10', emoji: '🌟', label: 'Grand critique', description: '10 contenus notés' },
  { id: 'first_game', emoji: '🎮', label: 'Gamer', description: 'Premier jeu consulté' },
  { id: 'night_owl', emoji: '🦉', label: 'Oiseau de nuit', description: 'Actif après minuit' },
];

export function getBadges(): Badge[] {
  try {
    const unlocked = JSON.parse(localStorage.getItem('pyroula_badges') || '{}');
    return ALL_BADGES.map(b => ({ ...b, unlockedAt: unlocked[b.id] }));
  } catch { return ALL_BADGES; }
}

export function unlockBadge(id: string) {
  try {
    const unlocked = JSON.parse(localStorage.getItem('pyroula_badges') || '{}');
    if (!unlocked[id]) {
      unlocked[id] = new Date().toISOString();
      localStorage.setItem('pyroula_badges', JSON.stringify(unlocked));
    }
  } catch {}
}

function checkBadges() {
  const history = getWatchHistory();
  const favs = getFavorites();
  const ratings = getRatings();
  const hour = new Date().getHours();

  if (history.length >= 1) unlockBadge('first_watch');
  if (history.length >= 5) unlockBadge('watch_5');
  if (history.length >= 10) unlockBadge('watch_10');
  if (history.length >= 25) unlockBadge('watch_25');
  if (favs.length >= 1) unlockBadge('first_fav');
  if (favs.length >= 5) unlockBadge('fav_5');
  if (ratings.length >= 1) unlockBadge('first_rating');
  if (ratings.length >= 10) unlockBadge('rating_10');
  if (hour >= 0 && hour < 5) unlockBadge('night_owl');
}

// ─── "Film du jour" / "Jeu du jour" ─────────────────────────────────────────

export function getDailyPick(type: 'movie' | 'game'): { id: number; date: string } | null {
  try {
    return JSON.parse(localStorage.getItem(`pyroula_daily_${type}`) || 'null');
  } catch { return null; }
}

export function setDailyPick(type: 'movie' | 'game', id: number) {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(`pyroula_daily_${type}`, JSON.stringify({ id, date: today }));
}

export function shouldRefreshDailyPick(type: 'movie' | 'game'): boolean {
  const pick = getDailyPick(type);
  if (!pick) return true;
  const today = new Date().toISOString().split('T')[0];
  return pick.date !== today;
}

// ─── Game history (for recommendations) ──────────────────────────────────────

export function addGameView(gameId: number, gameName: string) {
  try {
    const games = JSON.parse(localStorage.getItem('pyroula_game_views') || '[]') as { id: number; name: string }[];
    if (!games.find(g => g.id === gameId)) {
      games.unshift({ id: gameId, name: gameName });
      localStorage.setItem('pyroula_game_views', JSON.stringify(games.slice(0, 20)));
    }
    unlockBadge('first_game');
    checkBadges();
  } catch {}
}

export function getGameViews(): { id: number; name: string }[] {
  try {
    return JSON.parse(localStorage.getItem('pyroula_game_views') || '[]');
  } catch { return []; }
}
