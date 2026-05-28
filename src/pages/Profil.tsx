import { useState, useEffect } from 'react';
import { Sun, Moon, Trash2, Heart, Clock, Star, Award } from 'lucide-react';
import { tmdbImage } from '../services/api';
import {
  getTheme, setTheme,
  getWatchHistory, clearWatchHistory, WatchHistoryItem,
  getFavorites, FavoriteItem,
  getRatings, RatingItem,
  getBadges, Badge,
} from '../store/localStore';
import MediaDetail from '../components/MediaDetail';
import GameDetail from '../components/GameDetail';

export default function Profil() {
  const [theme, setThemeState] = useState<'dark' | 'light'>(getTheme);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: 'movie' | 'tv' } | null>(null);
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'history' | 'favorites' | 'badges'>('overview');

  useEffect(() => {
    setHistory(getWatchHistory());
    setFavorites(getFavorites());
    setRatings(getRatings());
    setBadges(getBadges());
  }, []);

  const handleThemeChange = (t: 'dark' | 'light') => {
    setThemeState(t);
    setTheme(t);
  };

  const handleClearHistory = () => {
    clearWatchHistory();
    setHistory([]);
  };

  const handleItemClick = (item: FavoriteItem | WatchHistoryItem) => {
    const contentId = 'contentId' in item ? item.contentId : item.mediaId;
    const contentType = 'contentType' in item ? item.contentType : item.mediaType;
    if (contentType === 'game') {
      setSelectedGame(contentId);
    } else {
      setSelectedMedia({ id: contentId, type: contentType as 'movie' | 'tv' });
    }
  };

  const unlockedBadges = badges.filter(b => b.unlockedAt);
  const lockedBadges = badges.filter(b => !b.unlockedAt);

  const stats = {
    watched: history.length,
    favorites: favorites.length,
    rated: ratings.length,
    avgRating: ratings.length > 0 ? (ratings.reduce((s, r) => s + r.ratingValue, 0) / ratings.length).toFixed(1) : '—',
    badges: unlockedBadges.length,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-16">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl mb-3 shadow-lg shadow-orange-500/20">
                🔥
              </div>
              <h1 className="text-2xl font-bold text-white">Mon Profil</h1>
              <p className="text-gray-400 text-sm">Invité · {new Date().toLocaleDateString('fr-FR')}</p>
            </div>

            {/* Theme toggle */}
            <div className="flex items-center gap-2 bg-gray-800 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'light' ? 'bg-white text-gray-900 shadow' : 'text-gray-400 hover:text-white'}`}
              >
                <Sun className="w-4 h-4" />
                Clair
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'dark' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                <Moon className="w-4 h-4" />
                Sombre
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-3 mt-6">
            {[
              { icon: Clock, label: 'Vus', value: stats.watched, color: 'text-blue-400' },
              { icon: Heart, label: 'Favoris', value: stats.favorites, color: 'text-red-400' },
              { icon: Star, label: 'Notés', value: stats.rated, color: 'text-yellow-400' },
              { icon: Star, label: 'Moy.', value: stats.avgRating, color: 'text-yellow-400' },
              { icon: Award, label: 'Badges', value: stats.badges, color: 'text-purple-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-gray-900 border border-white/10 rounded-xl p-3 text-center">
                <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                <div className="text-white font-bold text-lg">{value}</div>
                <div className="text-gray-500 text-xs">{label}</div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-1 mt-6">
            {([
              { id: 'overview', label: '📊 Vue d\'ensemble' },
              { id: 'history', label: '⏱️ Historique' },
              { id: 'favorites', label: '❤️ Favoris' },
              { id: 'badges', label: '🏅 Badges' },
            ] as const).map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                  activeSection === s.id
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Overview */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Continue watching */}
            {history.length > 0 && (
              <div>
                <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  Continuer à regarder
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {history.slice(0, 8).map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="cursor-pointer group"
                    >
                      <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-white/10 hover:border-orange-500/40 transition-all">
                        <div className="aspect-[2/3] bg-gray-800">
                          {item.posterPath ? (
                            <img
                              src={tmdbImage(item.posterPath, 'w185') || ''}
                              alt={item.title}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-2xl">
                              {item.mediaType === 'tv' ? '📺' : '🎬'}
                            </div>
                          )}
                        </div>
                        {/* Progress bar */}
                        {item.totalSeconds > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                            <div
                              className="h-full bg-orange-500"
                              style={{ width: `${Math.min(100, (item.progressSeconds / item.totalSeconds) * 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-white text-xs mt-1.5 line-clamp-1 font-medium">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent favorites */}
            {favorites.length > 0 && (
              <div>
                <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  Favoris récents
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {favorites.slice(0, 8).map(fav => (
                    <div
                      key={fav.id}
                      onClick={() => handleItemClick(fav)}
                      className="cursor-pointer"
                    >
                      <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-white/10 hover:border-red-500/40 transition-all">
                        <div className={`${fav.contentType === 'game' ? 'aspect-[16/10]' : 'aspect-[2/3]'} bg-gray-800`}>
                          {fav.posterPath ? (
                            <img
                              src={fav.contentType === 'game' ? fav.posterPath : (tmdbImage(fav.posterPath, 'w185') || '')}
                              alt={fav.title}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-2xl">
                              {fav.contentType === 'game' ? '🎮' : fav.contentType === 'tv' ? '📺' : '🎬'}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-white text-xs mt-1.5 line-clamp-1">{fav.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {history.length === 0 && favorites.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <div className="text-5xl mb-4">🎬</div>
                <p className="text-lg font-medium text-gray-400 mb-2">Votre espace personnel</p>
                <p className="text-sm">Commencez à explorer des films, séries et jeux pour voir votre activité ici.</p>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {activeSection === 'history' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">Historique de visionnage</h2>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm border border-red-500/30 hover:border-red-500/60 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Effacer
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Aucun visionnage dans l'historique</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="flex gap-4 bg-gray-900 border border-white/10 hover:border-orange-500/30 rounded-xl p-3 cursor-pointer transition-colors group"
                  >
                    <div className="w-16 aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                      {item.posterPath ? (
                        <img
                          src={tmdbImage(item.posterPath, 'w92') || ''}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          {item.mediaType === 'tv' ? '📺' : '🎬'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium line-clamp-1 group-hover:text-orange-400 transition-colors">{item.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{item.mediaType === 'tv' ? '📺 Série' : '🎬 Film'}</span>
                        <span>Vu le {new Date(item.updatedAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {item.totalSeconds > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progression</span>
                            <span>{Math.round((item.progressSeconds / item.totalSeconds) * 100)}%</span>
                          </div>
                          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 rounded-full"
                              style={{ width: `${Math.min(100, (item.progressSeconds / item.totalSeconds) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Favorites */}
        {activeSection === 'favorites' && (
          <div>
            <h2 className="text-white text-xl font-bold mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Mes Favoris ({favorites.length})
            </h2>

            {favorites.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Aucun favori enregistré</p>
                <p className="text-sm mt-2">Ajoutez des contenus à vos favoris depuis les fiches détaillées.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {favorites.map(fav => (
                  <div
                    key={fav.id}
                    onClick={() => handleItemClick(fav)}
                    className="cursor-pointer group"
                  >
                    <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-white/10 hover:border-red-500/40 transition-all hover:scale-105 duration-300">
                      <div className={`${fav.contentType === 'game' ? 'aspect-[16/10]' : 'aspect-[2/3]'} bg-gray-800`}>
                        {fav.posterPath ? (
                          <img
                            src={fav.contentType === 'game' ? fav.posterPath : (tmdbImage(fav.posterPath, 'w342') || '')}
                            alt={fav.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-3xl">
                            {fav.contentType === 'game' ? '🎮' : fav.contentType === 'tv' ? '📺' : '🎬'}
                          </div>
                        )}
                      </div>
                      <div className="absolute top-2 right-2">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className="text-xs bg-black/60 text-gray-300 px-1.5 py-0.5 rounded backdrop-blur-sm">
                          {fav.contentType === 'game' ? '🎮' : fav.contentType === 'tv' ? '📺' : '🎬'}
                        </span>
                      </div>
                    </div>
                    <div className="p-1.5">
                      <p className="text-white text-xs font-medium line-clamp-1">{fav.title}</p>
                      <p className="text-gray-500 text-xs">{fav.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rating history */}
            {ratings.length > 0 && (
              <div className="mt-10">
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  Mes notes ({ratings.length})
                </h3>
                <div className="space-y-2">
                  {ratings.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-900 border border-white/10 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`w-3.5 h-3.5 ${j < r.ratingValue ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />
                        ))}
                      </div>
                      <span className="text-gray-400 text-xs">
                        {r.contentType === 'game' ? '🎮' : r.contentType === 'tv' ? '📺' : '🎬'} ID: {r.contentId}
                      </span>
                      <span className="text-gray-600 text-xs ml-auto">
                        {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Badges */}
        {activeSection === 'badges' && (
          <div>
            <h2 className="text-white text-xl font-bold mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              Badges & Succès
            </h2>
            <p className="text-gray-500 text-sm mb-6">{unlockedBadges.length}/{badges.length} badges débloqués</p>

            {/* Unlocked */}
            {unlockedBadges.length > 0 && (
              <div className="mb-8">
                <h3 className="text-green-400 text-sm font-semibold mb-3 uppercase tracking-wider">✅ Débloqués</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {unlockedBadges.map(badge => (
                    <div
                      key={badge.id}
                      className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-xl p-4 text-center"
                    >
                      <div className="text-3xl mb-2">{badge.emoji}</div>
                      <div className="text-white text-sm font-semibold">{badge.label}</div>
                      <div className="text-gray-400 text-xs mt-1">{badge.description}</div>
                      {badge.unlockedAt && (
                        <div className="text-purple-400 text-xs mt-2">
                          {new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked */}
            {lockedBadges.length > 0 && (
              <div>
                <h3 className="text-gray-500 text-sm font-semibold mb-3 uppercase tracking-wider">🔒 Verrouillés</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {lockedBadges.map(badge => (
                    <div
                      key={badge.id}
                      className="bg-gray-900/50 border border-white/5 rounded-xl p-4 text-center opacity-50"
                    >
                      <div className="text-3xl mb-2 grayscale">{badge.emoji}</div>
                      <div className="text-gray-400 text-sm font-semibold">{badge.label}</div>
                      <div className="text-gray-600 text-xs mt-1">{badge.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
