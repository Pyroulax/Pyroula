import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SearchProvider } from './contexts/SearchContext';
import { getTheme, setTheme } from './store/localStore';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import ScrollToTop from './components/ui/ScrollToTop';
import Home from './pages/Home';
import FilmsSeries from './pages/FilmsSeries';
import Jeux from './pages/Jeux';
import Nouveautes from './pages/Nouveautes';
import Profil from './pages/Profil';

export default function App() {
  useEffect(() => {
    const theme = getTheme();
    setTheme(theme);
  }, []);

  return (
    <BrowserRouter>
      <SearchProvider>
        <div className="min-h-screen bg-gray-950">
          <ScrollToTop />
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/films-series" element={<FilmsSeries />} />
              <Route path="/jeux" element={<Jeux />} />
              <Route path="/nouveautes" element={<Nouveautes />} />
              <Route path="/profil" element={<Profil />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </SearchProvider>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white pt-16">
      <div className="text-center">
        <div className="text-8xl mb-6">🔥</div>
        <h1 className="text-4xl font-bold mb-3">Page introuvable</h1>
        <p className="text-gray-400 mb-6">Cette page n'existe pas sur Pyroula+</p>
        <a href="/" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}
