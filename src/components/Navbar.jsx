import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, LayoutDashboard } from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

// Liens d'ancrage vers les sections de la landing page
const ANCHOR_LINKS = [
  { id: 'modules', label: 'Modules' },
  { id: 'courses', label: 'Cours' },
  { id: 'testimonials', label: 'Témoignages' },
];

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Si on est déjà sur la landing page, on scrolle en douceur au lieu de recharger la route
  const handleAnchorClick = (id) => (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    // Sinon on laisse le Link naviguer vers "/#id" ; Landing.jsx gère le scroll au montage
  };

  return (
    <nav className="glass fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between border-b border-white/5">
      <Link to="/" className="flex items-center gap-2">
        <img src={logo} alt="Aliou Sow Academy" className="h-11 w-auto" />
        <span className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 hidden sm:inline">
          ALIOU SOW ACADEMY
        </span>
      </Link>

      {/* Liens de navigation vers les sections (visibles à partir de md) */}
      <div className="hidden md:flex items-center gap-8">
        <Link
          to="/"
          className="text-slate-300 hover:text-white transition font-medium text-sm"
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          Accueil
        </Link>
        {ANCHOR_LINKS.map((link) => (
          <Link
            key={link.id}
            to={`/#${link.id}`}
            onClick={handleAnchorClick(link.id)}
            className="text-slate-300 hover:text-white transition font-medium text-sm"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            <Link to={user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'} className="flex items-center gap-1 text-slate-300 hover:text-white transition font-medium text-sm md:text-base">
              <LayoutDashboard className="w-4 h-4" />
              <span>Mon Espace</span>
            </Link>

            <Link to="/profile" className="flex items-center gap-2 hover:opacity-85 transition bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-indigo-500/50" />
              <span className="text-sm font-medium text-slate-200 hidden md:inline">{user.name}</span>
            </Link>

            <button onClick={handleLogout} className="flex items-center gap-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20 text-sm font-medium transition cursor-pointer">
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Déconnexion</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-slate-300 hover:text-white transition font-medium text-sm md:text-base">
              Connexion
            </Link>
            <Link to="/register" className="btn-neon text-white font-semibold px-5 py-2 rounded-lg text-sm transition">
              S'inscrire
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;