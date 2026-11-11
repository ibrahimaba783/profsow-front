import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, LayoutDashboard, User, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

const PROFILE_PATH = '/profile';

const Navbar = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Synchronisation de la barre de recherche avec le paramètre de l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchVal = params.get('search');
    if (searchVal !== null) {
      setQuery(searchVal);
    }
  }, [location.search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dashboardPath = user?.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';

  // Navigation fluide vers une ancre spécifique en tenant compte des 80px de la barre fixe
  const handleAnchorClick = (id) => (e) => {
    setMobileOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        const yOffset = -90;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  const handleHomeClick = (e) => {
    setMobileOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Recherche dynamique opérationnelle qui transmet le mot-clé et fait défiler vers les cours
  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/?search=${encodeURIComponent(q)}#courses`);
    } else {
      navigate('/#courses');
    }
    setTimeout(() => {
      const el = document.getElementById('courses');
      if (el) {
        const yOffset = -90;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 120);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : '?';

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Logo Bakeli-style pour Aliou Sow Academy */}
        <Link to="/" onClick={handleHomeClick} className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="Aliou Sow Academy" className="h-11 w-auto" />
          <div className="leading-tight hidden sm:block">
            <span className="block text-lg font-black text-slate-900 tracking-tight">ALIOU SOW</span>
            <span className="block text-[10px] font-extrabold tracking-[0.25em] text-[#00897b] uppercase">ACADEMY</span>
          </div>
        </Link>

        {/* Liens Centraux style Bakeli : Accueil, Nos modules, Notre méthode, Témoignages */}
        <nav className="hidden lg:flex items-center gap-8 text-[15px] font-bold text-slate-700">
          <Link
            to="/"
            onClick={handleHomeClick}
            className="hover:text-[#00897b] transition-colors py-1"
          >
            Accueil
          </Link>

          {/* "Nos modules" pointe directement vers le catalogue des cours (#courses) */}
          <a
            href="/#courses"
            onClick={handleAnchorClick('courses')}
            className="hover:text-[#00897b] transition-colors py-1"
          >
            Nos modules
          </a>

          {/* "Notre méthode" pointe vers les 4 piliers (#methode) */}
          <a
            href="/#methode"
            onClick={handleAnchorClick('methode')}
            className="hover:text-[#00897b] transition-colors py-1"
          >
            Notre méthode
          </a>

          <a
            href="/#testimonials"
            onClick={handleAnchorClick('testimonials')}
            className="hover:text-[#00897b] transition-colors py-1"
          >
            Témoignages
          </a>
        </nav>

        {/* Barre de Recherche style Bakeli avec bouton rond orange (Screenshot 3) */}
        <div className="hidden md:block flex-1 max-w-xs mx-3">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Qu'est-ce que vous souhaitez apprendre ?"
              className="w-full h-11 pl-5 pr-12 rounded-full border border-slate-300 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#ff9800] focus:ring-2 focus:ring-orange-100 transition shadow-inner"
            />
            <button
              type="submit"
              aria-label="Rechercher"
              className="absolute right-1 w-9 h-9 rounded-full bg-[#ff9800] hover:bg-[#f57c00] text-white flex items-center justify-center transition shadow-sm cursor-pointer"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>

        {/* Boutons d'Action style Bakeli : Se connecter (Orange) & S'inscrire (Teal) */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse"></div>
          ) : !user ? (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/login"
                className="h-10 px-6 inline-flex items-center justify-center rounded-full text-xs font-bold text-white bg-[#ff9800] hover:bg-[#f57c00] shadow-md shadow-orange-500/20 transition cursor-pointer"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="h-10 px-6 inline-flex items-center justify-center rounded-full text-xs font-bold text-white bg-[#00897b] hover:bg-[#00796b] shadow-md shadow-teal-600/20 transition cursor-pointer"
              >
                S'inscrire
              </Link>
            </div>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-50 border border-slate-200 transition cursor-pointer"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-[#00897b]/30"
                  />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-[#00897b] text-white flex items-center justify-center text-xs font-bold">
                    {initial}
                  </span>
                )}
                <span className="hidden md:block text-xs font-bold text-slate-800 max-w-[120px] truncate pr-1">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-50 text-[#00897b] uppercase">
                      {user.role === 'admin' ? 'ADMINISTRATEUR' : user.role === 'teacher' ? 'PROFESSEUR' : 'ÉLÈVE'}
                    </span>
                  </div>

                  <Link
                    to={dashboardPath}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-[#00897b] font-semibold"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    {user.role === 'admin' ? 'Back Office Admin' : user.role === 'teacher' ? 'Espace Professeur' : 'Mon Espace Élève'}
                  </Link>

                  <Link
                    to={PROFILE_PATH}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-[#00897b] font-semibold"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Mon Profil
                  </Link>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Menu Mobile */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Déroulant */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-5 py-5 space-y-4 shadow-xl">
          {/* Recherche mobile */}
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un cours..."
              className="w-full h-10 pl-4 pr-11 rounded-full border border-slate-300 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#ff9800]"
            />
            <button
              type="submit"
              className="absolute right-1 w-8 h-8 rounded-full bg-[#ff9800] text-white flex items-center justify-center cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
            <Link to="/" onClick={handleHomeClick} className="py-2 border-b border-slate-100">
              Accueil
            </Link>
            <a href="/#courses" onClick={handleAnchorClick('courses')} className="py-2 border-b border-slate-100">
              Nos modules
            </a>
            <a href="/#methode" onClick={handleAnchorClick('methode')} className="py-2 border-b border-slate-100">
              Notre méthode
            </a>
            <a href="/#testimonials" onClick={handleAnchorClick('testimonials')} className="py-2 border-b border-slate-100">
              Témoignages
            </a>
          </nav>

          {!user ? (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/login"
                className="h-11 inline-flex items-center justify-center rounded-full bg-[#ff9800] text-white text-xs font-bold"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="h-11 inline-flex items-center justify-center rounded-full bg-[#00897b] text-white text-xs font-bold"
              >
                S'inscrire
              </Link>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <Link
                to={dashboardPath}
                className="flex items-center gap-2 py-2 text-sm font-bold text-[#00897b]"
              >
                <LayoutDashboard className="w-4 h-4" />
                {user.role === 'admin' ? 'Back Office Admin' : user.role === 'teacher' ? 'Espace Professeur' : 'Mon Espace Élève'}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 py-2 text-sm font-bold text-red-600 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
