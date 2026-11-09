import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

// --- Icônes de réseaux sociaux (lucide-react n'exporte plus les icônes de marques) ---
const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
  </svg>
);
const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const YoutubeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23 12s0-3.6-.46-5.32a2.94 2.94 0 0 0-2.07-2.08C18.75 4.14 12 4.14 12 4.14s-6.75 0-8.47.46A2.94 2.94 0 0 0 1.46 6.68C1 8.4 1 12 1 12s0 3.6.46 5.32a2.94 2.94 0 0 0 2.07 2.08C5.25 19.86 12 19.86 12 19.86s6.75 0 8.47-.46a2.94 2.94 0 0 0 2.07-2.08C23 15.6 23 12 23 12ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z" />
  </svg>
);

// === Coordonnées de contact : remplace par les vraies informations si besoin ===
const CONTACT_PHONE_DISPLAY = '+221 77 102 33 99';
const CONTACT_PHONE_LINK = 'tel:+221771023399';
const CONTACT_EMAIL = 'Sowaliou2504@gmail.com';

// Pages où le footer n'est PAS affiché (connexion, inscription, tableaux de bord)
const HIDDEN_ON = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/teacher-dashboard',
  '/student-dashboard',
];

// anchor : id d'une section de la page d'accueil (défilement fluide)
// top    : remonte en haut de l'accueil
// state  : filtre transmis à la page d'accueil (matière / niveau déjà sélectionné)
const columns = [
  {
    title: 'Matières',
    links: [
      { label: 'Mathématiques', to: '/#courses', state: { subject: 'Mathématiques', level: 'Tous' } },
      { label: 'Physique-Chimie', to: '/#courses', state: { subject: 'Physique-Chimie', level: 'Tous' } },
    ],
  },
  {
    title: 'Niveaux',
    links: [
      { label: '4ème', to: '/#courses', state: { subject: 'Tous', level: '4ème' } },
      { label: '3ème', to: '/#courses', state: { subject: 'Tous', level: '3ème' } },
      { label: '2nde S', to: '/#courses', state: { subject: 'Tous', level: '2nde S' } },
      { label: '1ère S', to: '/#courses', state: { subject: 'Tous', level: '1ère S' } },
      { label: 'Terminale S', to: '/#courses', state: { subject: 'Tous', level: 'TS' } },
    ],
  },
  {
    title: 'Plateforme',
    links: [
      { label: 'Accueil', to: '/', top: true },
      { label: 'Modules', to: '/#modules', anchor: 'modules' },
      { label: 'Témoignages', to: '/#testimonials', anchor: 'testimonials' },
      { label: 'FAQ', to: '/#faq', anchor: 'faq' },
      { label: 'Se connecter', to: '/login' },
      { label: "S'inscrire", to: '/register' },
    ],
  },
];

const linkClass = 'text-sm text-slate-300 hover:text-white hover:underline transition-colors';
const socialClass =
  'w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition';

const Footer = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (HIDDEN_ON.some((path) => location.pathname.startsWith(path))) {
    return null;
  }

  const handleAnchorClick = (id) => (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTopClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getClickHandler = (item) => {
    if (item.anchor) return handleAnchorClick(item.anchor);
    if (item.top) return handleTopClick;
    return undefined;
  };

  return (
    <footer className="bg-slate-900 text-white">
      {/* Bandeau d'invitation (visible seulement si non connecté) */}
      {!user && (
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <p className="text-lg sm:text-xl font-bold max-w-2xl leading-snug">
              Prêt à progresser en{' '}
              <span className="text-indigo-300">Mathématiques et Physique-Chimie</span> avec M. Aliou Sow ?
            </p>
            <Link
              to="/register"
              className="shrink-0 inline-flex items-center justify-center h-11 px-6 rounded-lg bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 transition"
            >
              Créer mon compte
            </Link>
          </div>
        </div>
      )}

      {/* Présentation + colonnes de liens */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-10">
        <div className="col-span-2">
          <Link to="/" onClick={handleTopClick} className="inline-flex items-center gap-3 mb-4">
            <span className="bg-white rounded-lg p-1.5 inline-flex">
              <img src={logo} alt="Aliou Sow Academy" className="h-8 w-auto" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-extrabold tracking-wide">ALIOU SOW</span>
              <span className="block text-[10px] font-semibold tracking-[0.25em] text-indigo-300">ACADEMY</span>
            </span>
          </Link>
          <p className="text-sm text-slate-300 leading-relaxed max-w-sm mb-5">
            Aliou Sow Academy est une plateforme d'apprentissage en ligne dédiée aux Mathématiques et à la
            Physique-Chimie, conçue pour la classe de M. Aliou Sow.
          </p>
          <p className="text-sm text-slate-300 mb-1">
            Tél :{' '}
            <a href={CONTACT_PHONE_LINK} className="hover:text-white hover:underline">
              {CONTACT_PHONE_DISPLAY}
            </a>
          </p>
          <p className="text-sm text-slate-300 mb-5">
            Mail :{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
          <div className="flex gap-3">
            {/* Remplace href="#" par les vrais liens des réseaux sociaux */}
            <a href="#" onClick={(e) => e.preventDefault()} aria-label="Facebook" className={socialClass}>
              <FacebookIcon className="w-4 h-4 text-white" />
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} aria-label="Instagram" className={socialClass}>
              <InstagramIcon className="w-4 h-4 text-white" />
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} aria-label="YouTube" className={socialClass}>
              <YoutubeIcon className="w-4 h-4 text-white" />
            </a>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-bold mb-4">{col.title}</h3>
            <ul className="space-y-2.5">
              {col.links.map((item) => (
                <li key={`${col.title}-${item.label}`}>
                  <Link to={item.to} state={item.state} onClick={getClickHandler(item)} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Barre du bas */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Aliou Sow Academy - Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;