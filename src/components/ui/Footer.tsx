import { Link } from 'react-router-dom';
import { Flame, Film, Gamepad2, Sparkles, User } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black/80 border-t border-white/10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Pyroula<span className="text-orange-400">+</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Votre plateforme multimédia tout-en-un pour films, séries et jeux vidéo.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors">
                <span className="text-xs font-bold">GH</span>
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors">
                <span className="text-xs font-bold">TW</span>
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors">
                <span className="text-xs font-bold">YT</span>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Accueil', icon: Flame },
                { to: '/films-series', label: 'Films & Séries', icon: Film },
                { to: '/jeux', label: 'Jeux', icon: Gamepad2 },
                { to: '/nouveautes', label: 'Nouveautés', icon: Sparkles },
                { to: '/profil', label: 'Profil', icon: User },
              ].map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="flex items-center gap-2 text-gray-400 hover:text-orange-400 text-sm transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contenus</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/films-series" className="hover:text-orange-400 transition-colors">Films populaires</Link></li>
              <li><Link to="/films-series" className="hover:text-orange-400 transition-colors">Séries tendance</Link></li>
              <li><Link to="/films-series" className="hover:text-orange-400 transition-colors">Animations</Link></li>
              <li><Link to="/jeux" className="hover:text-orange-400 transition-colors">Top jeux PC</Link></li>
              <li><Link to="/nouveautes" className="hover:text-orange-400 transition-colors">Dernières sorties</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Légal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-orange-400 transition-colors">Mentions légales</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Politique de confidentialité</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Conditions d'utilisation</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Cookies</a></li>
            </ul>
            <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-gray-500">
                Ce site utilise les APIs TMDB et RAWG. Les données multimédias sont fournies par ces services tiers.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Pyroula+. Tous droits réservés.
          </p>
          <p className="text-gray-600 text-xs">
            Données fournies par{' '}
            <a href="https://www.themoviedb.org" className="text-orange-400 hover:underline" target="_blank" rel="noopener noreferrer">TMDB</a>
            {' '}et{' '}
            <a href="https://rawg.io" className="text-orange-400 hover:underline" target="_blank" rel="noopener noreferrer">RAWG</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
