import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SettingsContext } from '../context/SettingsContext';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

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

const HIDDEN_ON = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/teacher-dashboard',
  '/student-dashboard',
  '/admin-dashboard',
];

const Footer = () => {
  const location = useLocation();
  const { settings } = useContext(SettingsContext);

  if (HIDDEN_ON.some((path) => location.pathname.startsWith(path))) {
    return null;
  }

  const CONTACT_PHONE_DISPLAY = settings.channels?.contactPhone || '+221 77 102 33 99';
  const CONTACT_PHONE_LINK = `tel:${CONTACT_PHONE_DISPLAY.replace(/\s+/g, '')}`;
  const CONTACT_EMAIL = settings.channels?.contactEmail || 'sowaliou2504@gmail.com';
  const YOUTUBE_URL =
    settings.channels?.youtubeUrl || 'https://youtube.com/@dermannaltv4340?si=Jk86Ads8TMVEx6vv';
  const TIKTOK_URL = settings.channels?.tiktokUrl || 'https://www.tiktok.com/@aliousow9216';
  const FACEBOOK_URL = settings.channels?.facebookUrl || `mailto:${CONTACT_EMAIL}`;

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
    <footer className="bg-[#071727] text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
        {/* Colonne 1 : Logo & Présentation */}
        <div className="lg:col-span-4 space-y-4">
          <Link to="/" onClick={handleTopClick} className="inline-flex items-center gap-3">
            <img src={logo} alt="Aliou Sow Academy" className="h-10 w-auto object-contain bg-white/95 p-1 rounded-xl shadow-xs" />
            <span className="leading-tight">
              <span className="block text-sm font-black tracking-wider text-white">ALIOU SOW</span>
              <span className="block text-[10px] font-bold tracking-[0.28em] text-[#009688]">ACADEMY</span>
            </span>
          </Link>

          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
            Des cours de sciences accessibles, structurés et adaptés au programme sénégalais pour aider chaque élève à réussir.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <a
              href={YOUTUBE_URL}
              aria-label="YouTube"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#009688] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200"
            >
              <YoutubeIcon className="w-4 h-4" />
            </a>
            <a
              href={TIKTOK_URL}
              aria-label="TikTok"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#009688] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200"
            >
              <TikTokIcon className="w-4 h-4" />
            </a>
            <a
              href={FACEBOOK_URL}
              aria-label="Facebook"
              target={settings.channels?.facebookUrl ? '_blank' : undefined}
              rel={settings.channels?.facebookUrl ? 'noopener noreferrer' : undefined}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#009688] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Colonne 2 : Obtenir de l'aide */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-wide">
            Obtenir de l'aide
          </h3>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            <li>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                onClick={() => {
                  window.open(
                    `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}`,
                    '_blank',
                    'noopener,noreferrer'
                  );
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Contactez-nous
              </a>
            </li>
            <li>
              <Link to="/courses" className="hover:text-white transition-colors">
                Toutes nos matières
              </Link>
            </li>
            <li>
              <Link
                to="/#faq"
                onClick={handleAnchorClick('faq')}
                className="hover:text-white transition-colors"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-white transition-colors">
                Créer un compte
              </Link>
            </li>
          </ul>
        </div>

        {/* Colonne 3 : Domaines & niveaux */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-wide">
            Domaines &amp; niveaux
          </h3>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            <li>
              <Link
                to="/courses?subject=Mathématiques"
                className="hover:text-white transition-colors"
              >
                Mathématiques
              </Link>
            </li>
            <li>
              <Link
                to="/courses?subject=Physique-Chimie"
                className="hover:text-white transition-colors"
              >
                Physique-Chimie
              </Link>
            </li>
            <li>
              <Link
                to="/courses?level=3ème"
                className="hover:text-white transition-colors"
              >
                Collège 4ème - 3ème
              </Link>
            </li>
            <li>
              <Link
                to="/courses?level=TS"
                className="hover:text-white transition-colors"
              >
                Lycée 2nde S - 1ère S - TS
              </Link>
            </li>
          </ul>
        </div>

        {/* Colonne 4 : Contactez-nous */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-wide">
            Contactez-nous
          </h3>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
            <li>Sénégal</li>
            <li>
              <a href={CONTACT_PHONE_LINK} className="hover:text-white transition-colors">
                {CONTACT_PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                onClick={() => {
                  window.open(
                    `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}`,
                    '_blank',
                    'noopener,noreferrer'
                  );
                }}
                title={`Envoyer un e-mail à ${CONTACT_EMAIL}`}
                className="hover:text-white hover:underline transition-colors whitespace-nowrap block text-slate-300 font-medium cursor-pointer"
              >
                {CONTACT_EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Barre de copyright */}
      <div className="border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>&copy; {new Date().getFullYear()} Aliou Sow Academy — Tous droits réservés.</span>
          <span>Conçu pour la réussite des élèves sénégalais.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;