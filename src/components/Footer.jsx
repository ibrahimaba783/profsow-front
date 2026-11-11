import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

// --- Icônes des réseaux sociaux ---
const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
  </svg>
);

const YoutubeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23 12s0-3.6-.46-5.32a2.94 2.94 0 0 0-2.07-2.08C18.75 4.14 12 4.14 12 4.14s-6.75 0-8.47.46A2.94 2.94 0 0 0 1.46 6.68C1 8.4 1 12 1 12s0 3.6.46 5.32a2.94 2.94 0 0 0 2.07 2.08C5.25 19.86 12 19.86 12 19.86s6.75 0 8.47-.46a2.94 2.94 0 0 0 2.07-2.08C23 15.6 23 12 23 12ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z" />
  </svg>
);

const TikTokIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.46v13.67a2.9 2.9 0 0 1-2.9 2.9 2.9 2.9 0 1 1 2.9-2.9c0-.24-.03-.48-.08-.71v-3.54a6.38 6.38 0 0 0-2.82-.66A6.38 6.38 0 1 0 15.84 17V9.95a8.2 8.2 0 0 0 4.8 1.54V8.03a4.85 4.85 0 0 1-1.05-.12Z" />
  </svg>
);

// === Coordonnées de contact ===
const CONTACT_PHONE_DISPLAY = '+221 77 102 33 99';
const CONTACT_PHONE_LINK = 'tel:+221771023399';
const CONTACT_EMAIL = 'Sowaliou2504@gmail.com';

// === Liens des réseaux sociaux ===
// Un réseau n'est affiché que si son lien est renseigné (mets '#' pour le masquer).
const FACEBOOK_URL = '#';
const YOUTUBE_URL = 'https://youtube.com/@dermannaltv4340?si=Jk86Ads8TMVEx6vv';
const TIKTOK_URL = 'https://www.tiktok.com/@aliousow9216';

const SOCIALS = [
  { label: 'Facebook', url: FACEBOOK_URL, Icon: FacebookIcon },
  { label: 'YouTube', url: YOUTUBE_URL, Icon: YoutubeIcon },
  { label: 'TikTok', url: TIKTOK_URL, Icon: TikTokIcon },
].filter((s) => s.url && s.url !== '#');

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
// state  : filtre transmis à la page d'accueil (matière / niveau déjà sélectionné)
const columns = [
  {
    title: "Obtenir de l'aide",
    links: [
      { label: 'FAQ', to: '/#faq', anchor: 'faq' },
      { label: 'Témoignages', to: '/#testimonials', anchor: 'testimonials' },
      { label: 'Se connecter', to: '/login' },
      { label: "S'inscrire", to: '/register' },
    ],
  },
  {
    title: 'Matières',
    links: [
      { label: 'Mathématiques', to: '/#courses', state: { subject: 'Mathématiques', level: 'Tous' } },
      { label: 'Physique-Chimie', to: '/#courses', state: { subject: 'Physique-Chimie', level: 'Tous' } },
      { label: '4ème', to: '/#courses', state: { subject: 'Tous', level: '4ème' } },
      { label: '3ème', to: '/#courses', state: { subject: 'Tous', level: '3ème' } },
      { label: '2nde S', to: '/#courses', state: { subject: 'Tous', level: '2nde S' } },
      { label: '1ère S', to: '/#courses', state: { subject: 'Tous', level: '1ère S' } },
      { label: 'Terminale S', to: '/#courses', state: { subject: 'Tous', level: 'TS' } },
    ],
  },
];

const linkClass = 'text-slate-700 hover:text-[#2f4fd8] transition-colors';
const headingClass = 'text-sm font-bold uppercase tracking-wide text-slate-900 mb-4';

const Footer = () => {
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

  return (
    <footer className="bg-slate-50 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Présentation */}
        <div>
          <Link to="/" onClick={handleTopClick} className="inline-flex items-center gap-3 mb-4">
            <img src={logo} alt="Aliou Sow Academy" className="h-11 w-auto" />
            <span className="leading-tight">
              <span className="block text-base font-extrabold tracking-wide text-slate-900">ALIOU SOW</span>
              <span className="block text-[10px] font-semibold tracking-[0.25em] text-indigo-600">ACADEMY</span>
            </span>
          </Link>
          <p className="text-sm text-slate-700 leading-relaxed">
            Aliou Sow Academy est une plateforme d'apprentissage en ligne dédiée aux Mathématiques et à la
            Physique-Chimie, conçue pour la classe de M. Aliou Sow.
          </p>
        </div>

        {/* Colonnes de liens */}
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className={headingClass}>{col.title}</h3>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((item) => (
                <li key={`${col.title}-${item.label}`}>
                  <Link
                    to={item.to}
                    state={item.state}
                    onClick={item.anchor ? handleAnchorClick(item.anchor) : undefined}
                    className={linkClass}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact */}
        <div>
          <h3 className={headingClass}>Contactez-nous</h3>
          <p className="text-sm text-slate-700 mb-1.5">
            Tél :{' '}
            <a href={CONTACT_PHONE_LINK} className="text-[#2f4fd8] hover:underline">
              {CONTACT_PHONE_DISPLAY}
            </a>
          </p>
          <p className="text-sm text-slate-700 mb-5">
            Mail :{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#2f4fd8] hover:underline break-all">
              {CONTACT_EMAIL}
            </a>
          </p>

          {SOCIALS.length > 0 && (
            <div className="flex items-center gap-4">
              {SOCIALS.map(({ label, url, Icon }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="text-slate-900 hover:text-[#2f4fd8] transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border-t border-slate-200 py-6 text-center text-sm text-slate-700">
          Copyright &copy; {new Date().getFullYear()} Aliou Sow Academy | Tous droits réservés
        </div>
      </div>
    </footer>
  );
};

export default Footer;