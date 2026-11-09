import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, LayoutDashboard, User, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

// === À ADAPTER SI BESOIN ===
const COURSES_PATH = '/courses'; // page catalogue (la recherche y envoie ?search=...)
const PROFILE_PATH = '/profile'; // page profil de l'utilisateur connecté

// Sections de la page d'accueil (les id doivent exister dans Home.jsx)
const ANCHOR_LINKS = [
  { id: 'modules', label: 'Modules' },
  { id: 'courses', label: 'Cours' },
  { id: 'testimonials', label: 'Témoignages' },
];

const Navbar = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const menuRef = useRef(null);

  // Ferme les menus à chaque changement de page
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Ferme le menu utilisateur quand on clique en dehors
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

  // Défilement fluide vers une section (si on est déjà sur l'accueil)
  const handleAnchorClick = (id) => (e) => {
    setMobileOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Clic sur "Accueil" : remonte en haut si on est déjà sur l'accueil
  const handleHomeClick = (e) => {
    setMobileOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `${COURSES_PATH}?search=${encodeURIComponent(q)}` : COURSES_PATH);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const renderSearch = () => (
    <form onSubmit={handleSearch} role="search" className="relative w-full">
      <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Que souhaitez-vous apprendre ?"
        aria-label="Rechercher un cours"
        className="w-full h-11 pl-11 pr-4 rounded-full border border-slate-300 bg-slate-50 text-sm text-slate-800 placeholder-slate-500 outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </form>
  );

  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : '?';

  const avatarEl = user?.avatar ? (
    <img
      src={user.avatar}
      alt={user.name}
      className="w-9 h-9 rounded-full object-cover border border-slate-200"
    />
  ) : (
    <span className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
      {initial}
    </span>
  );

  const desktopLinkClass = 'text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors';

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center gap-4 lg:gap-6">
        {/* Logo */}
        <Link to="/" onClick={handleHomeClick} className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="Aliou Sow Academy" className="h-9 w-auto" />
          <span className="hidden sm:block leading-tight">
            <span className="block text-base font-extrabold text-slate-900 tracking-wide">ALIOU SOW</span>
            <span className="block text-[10px] font-semibold tracking-[0.25em] text-indigo-600">ACADEMY</span>
          </span>
        </Link>

        {/* Liens (grand écran) */}
        <nav className="hidden lg:flex items-center gap-5" aria-label="Navigation principale">
          <Link to="/" onClick={handleHomeClick} className={desktopLinkClass}>
            Accueil
          </Link>
          {ANCHOR_LINKS.map((item) => (
            <Link
              key={item.id}
              to={`/#${item.id}`}
              onClick={handleAnchorClick(item.id)}
              className={desktopLinkClass}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Recherche (tablette et plus) */}
        <div className="hidden md:block flex-1 max-w-xl">{renderSearch()}</div>

        {/* Zone connexion (grand écran) */}
        <div className="hidden lg:flex items-center gap-3 ml-auto">
          {!loading && !user && (
            <>
              <Link
                to="/login"
                className="h-10 px-4 inline-flex items-center rounded-lg border border-indigo-600 text-indigo-700 text-sm font-bold hover:bg-indigo-50 transition"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="h-10 px-4 inline-flex items-center rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition"
              >
                S'inscrire
              </Link>
            </>
          )}

          {!loading && user && (
            <>
              <Link to={dashboardPath} className={desktopLinkClass}>
                Mon espace
              </Link>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="flex items-center gap-1 h-11 pl-1 pr-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
                >
                  {avatarEl}
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      to={dashboardPath}
                      role="menuitem"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-500" />
                      Mon espace
                    </Link>
                    <Link
                      to={PROFILE_PATH}
                      role="menuitem"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      Mon profil
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      role="menuitem"
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-slate-100 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Bouton menu (mobile et tablette) */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileOpen}
          className="lg:hidden ml-auto w-10 h-10 inline-flex items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Panneau mobile */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pb-5 pt-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="md:hidden">{renderSearch()}</div>

          <nav className="flex flex-col" aria-label="Navigation mobile">
            <Link
              to="/"
              onClick={handleHomeClick}
              className="py-3 text-sm font-medium text-slate-700 border-b border-slate-100 hover:text-indigo-600"
            >
              Accueil
            </Link>
            {ANCHOR_LINKS.map((item) => (
              <Link
                key={item.id}
                to={`/#${item.id}`}
                onClick={handleAnchorClick(item.id)}
                className="py-3 text-sm font-medium text-slate-700 border-b border-slate-100 hover:text-indigo-600"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {!loading && !user && (
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/login"
                className="h-11 inline-flex items-center justify-center rounded-lg border border-indigo-600 text-indigo-700 text-sm font-bold hover:bg-indigo-50"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="h-11 inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
              >
                S'inscrire
              </Link>
            </div>
          )}

          {!loading && user && (
            <div className="space-y-1">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                {avatarEl}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <Link to={dashboardPath} className="flex items-center gap-3 py-3 text-sm text-slate-700">
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                Mon espace
              </Link>
              <Link to={PROFILE_PATH} className="flex items-center gap-3 py-3 text-sm text-slate-700">
                <User className="w-4 h-4 text-slate-500" />
                Mon profil
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 py-3 text-sm text-red-600 cursor-pointer"
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