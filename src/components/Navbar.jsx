import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, LayoutDashboard, User, LogOut, GraduationCap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

const COURSES_PATH = '/courses';
const PROFILE_PATH = '/profile';

const ANCHOR_LINKS = [
  { id: 'catalogue', label: 'Nos matières' },
  { id: 'trending', label: 'Matières tendances' },
];

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get('search') || '');
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

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin-dashboard'
      : user?.role === 'teacher'
      ? '/teacher-dashboard'
      : '/student-dashboard';

  const handleAnchorClick = (id) => (e) => {
    setMobileOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

  // Barre de recherche Figma : pilule blanche + bouton rond orange à droite
  const renderSearch = () => (
    <form
      onSubmit={handleSearch}
      role="search"
      className="flex items-center w-full h-11 rounded-full border border-slate-200 bg-white pl-4 pr-1.5 shadow-[0_1px_4px_rgba(15,23,42,0.03)] focus-within:border-[#009688] focus-within:ring-2 focus-within:ring-[#009688]/15 transition"
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Qu'est-ce que vous souhaitez apprendre ?"
        aria-label="Rechercher une matière"
        className="flex-1 min-w-0 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Rechercher"
        className="w-8 h-8 rounded-full bg-[#f59e0b] hover:bg-[#d97706] text-white flex items-center justify-center shrink-0 cursor-pointer transition shadow-xs"
      >
        <Search className="w-4 h-4" />
      </button>
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
    <span className="w-9 h-9 rounded-full bg-[#009688] text-white flex items-center justify-center text-sm font-bold">
      {initial}
    </span>
  );

  const isHome = location.pathname === '/';

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
      <div className="max-w-7xl mx-auto h-[72px] px-4 sm:px-6 flex items-center gap-4 lg:gap-6">
        {/* Logo */}
        <Link to="/" onClick={handleHomeClick} className="flex items-center gap-2.5 shrink-0">
          <img src={logo} alt="Aliou Sow Academy" className="h-10 w-auto object-contain" />
          <span className="hidden sm:block leading-tight">
            <span className="block text-[15px] font-extrabold text-slate-900 tracking-wide">ALIOU SOW</span>
            <span className="block text-[9px] font-bold tracking-[0.24em] text-[#009688]">ACADEMY</span>
          </span>
        </Link>

        {/* Liens de navigation */}
        <nav className="hidden lg:flex items-center gap-6 shrink-0" aria-label="Navigation principale">
          <Link
            to="/"
            onClick={handleHomeClick}
            className={`text-sm font-semibold py-1 transition-colors ${
              isHome
                ? 'text-[#0f172a] border-b-2 border-[#f59e0b]'
                : 'text-slate-600 hover:text-[#009688]'
            }`}
          >
            Accueil
          </Link>
          {ANCHOR_LINKS.map((item) => (
            <Link
              key={item.id}
              to={`/#${item.id}`}
              onClick={handleAnchorClick(item.id)}
              className="text-sm font-semibold text-slate-600 hover:text-[#009688] py-1 transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Barre de recherche centrale */}
        <div className="hidden md:block flex-1 max-w-md lg:max-w-lg mx-auto">{renderSearch()}</div>

        {/* Boutons Connexion / Inscription Figma Make */}
        <div className="hidden lg:flex items-center gap-3 ml-auto shrink-0">
          {!loading && !user && (
            <>
              <Link
                to="/login"
                className="h-10 px-5 inline-flex items-center justify-center rounded-full bg-[#fff8e9] hover:bg-[#fef3c7] text-[#d97706] text-xs font-bold transition whitespace-nowrap"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="h-10 px-5 inline-flex items-center justify-center rounded-full border border-[#009688] bg-white text-[#009688] hover:bg-[#009688] hover:text-white text-xs font-bold transition whitespace-nowrap shadow-xs"
              >
                S'inscrire
              </Link>
            </>
          )}

          {!loading && user && (
            <>
              <Link
                to={dashboardPath}
                className="h-10 px-4 inline-flex items-center rounded-full bg-[#009688]/10 text-[#009688] text-xs font-bold hover:bg-[#009688]/15 transition whitespace-nowrap"
              >
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
                    className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50"
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

        {/* Bouton menu mobile */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileOpen}
          className="lg:hidden ml-auto w-10 h-10 inline-flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Panneau mobile */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pb-6 pt-4 space-y-4 max-h-[calc(100vh-4.5rem)] overflow-y-auto shadow-xl">
          <div className="md:hidden">{renderSearch()}</div>

          <nav className="flex flex-col" aria-label="Navigation mobile">
            <Link
              to="/"
              onClick={handleHomeClick}
              className="py-3 text-sm font-semibold text-slate-800 border-b border-slate-100 hover:text-[#009688]"
            >
              Accueil
            </Link>
            {ANCHOR_LINKS.map((item) => (
              <Link
                key={item.id}
                to={`/#${item.id}`}
                onClick={handleAnchorClick(item.id)}
                className="py-3 text-sm font-semibold text-slate-800 border-b border-slate-100 hover:text-[#009688]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={COURSES_PATH}
              className="py-3 text-sm font-semibold text-slate-800 border-b border-slate-100 hover:text-[#009688]"
            >
              Catalogue des matières
            </Link>
          </nav>

          {!loading && !user && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/login"
                className="h-11 inline-flex items-center justify-center rounded-full bg-[#fff8e9] text-[#d97706] text-xs font-bold"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="h-11 inline-flex items-center justify-center rounded-full border border-[#009688] bg-white text-[#009688] text-xs font-bold"
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
