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
  const CONTACT_EMAIL = settings.channels?.contactEmail || 'Sowaliou2504@gmail.com';
  const YOUTUBE_URL =
    settings.channels?.youtubeUrl || 'https://youtube.com/@dermannaltv4340?si=Jk86Ads8TMVEx6vv';
  const TIKTOK_URL = settings.channels?.tiktokUrl || 'https://www.tiktok.com/@aliousow9216';
  const FACEBOOK_URL = settings.channels?.facebookUrl || `mailto:${CONTACT_EMAIL}`;
  const subjectsList =
    settings.subjects?.length > 0 ? settings.subjects : ['Mathématiques', 'Physique-Chimie'];

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
    <footer className="bg-white border-t border-slate-200 text-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Colonne 1 : Présentation (format Bakeli) */}
        <div>
          <Link to="/" onClick={handleTopClick} className="inline-flex items-center gap-2.5 mb-4">
            <img src={logo} alt="Aliou Sow Academy" className="h-9 w-auto" />
            <span className="leading-tight">
              <span className="block text-sm font-extrabold text-slate-900 tracking-wide">ALIOU SOW</span>
              <span className="block text-[9px] font-bold tracking-[0.24em] text-[#009688]">ACADEMY</span>
            </span>
          </Link>
          <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
            {settings.siteInfo?.platformName || 'Aliou Sow Academy'} est une plateforme de formation en ligne dédiée aux Mathématiques et à la
            Physique-Chimie, conçue par {settings.siteInfo?.teacherDisplayName || 'M. Aliou Sow'} pour accompagner les élèves de la 4ème à la Terminale S.
          </p>
        </div>

        {/* Colonne 2 : OBTENIR DE L'AIDE */}
        <div>
          <h3 className="text-xs font-extrabold tracking-wider uppercase text-slate-900 mb-4">
            OBTENIR DE L'AIDE
          </h3>
          <ul className="space-y-2.5 text-sm text-slate-600">
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-[#009688] transition-colors">
                Contactez-Nous
              </a>
            </li>
            <li>
              <Link to="/courses" className="hover:text-[#009688] transition-colors">
                Toutes nos matières
              </Link>
            </li>
            <li>
              <Link
                to="/#faq"
                onClick={handleAnchorClick('faq')}
                className="hover:text-[#009688] transition-colors"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-[#009688] transition-colors">
                Créer un compte
              </Link>
            </li>
          </ul>
        </div>

        {/* Colonne 3 : DOMAINES */}
        <div>
          <h3 className="text-xs font-extrabold tracking-wider uppercase text-slate-900 mb-4">
            DOMAINES &amp; NIVEAUX
          </h3>
          <ul className="space-y-2.5 text-sm text-slate-600">
            {subjectsList.slice(0, 3).map((sub) => (
              <li key={sub}>
                <Link
                  to="/#catalogue"
                  state={{ subject: sub, level: 'Tous' }}
                  onClick={handleAnchorClick('catalogue')}
                  className="hover:text-[#009688] transition-colors"
                >
                  {sub}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/#catalogue"
                state={{ subject: 'Tous', level: '3ème' }}
                onClick={handleAnchorClick('catalogue')}
                className="hover:text-[#009688] transition-colors"
              >
                Collège (4ème - 3ème)
              </Link>
            </li>
            <li>
              <Link
                to="/#catalogue"
                state={{ subject: 'Tous', level: 'TS' }}
                onClick={handleAnchorClick('catalogue')}
                className="hover:text-[#009688] transition-colors"
              >
                Lycée (2nde S - 1ère S - TS)
              </Link>
            </li>
          </ul>
        </div>

        {/* Colonne 4 : CONTACTEZ NOUS */}
        <div>
          <h3 className="text-xs font-extrabold tracking-wider uppercase text-slate-900 mb-4">
            CONTACTEZ NOUS
          </h3>
          <div className="space-y-2 text-sm text-slate-600">
            <p>Plateforme e-learning scientifique — Sénégal (4ème à Terminale S)</p>
            <p>
              Tel:{' '}
              <a href={CONTACT_PHONE_LINK} className="text-[#009688] font-medium hover:underline">
                {CONTACT_PHONE_DISPLAY}
              </a>
            </p>
            <p>
              Mail:{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#009688] font-medium hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>

          <div className="flex items-center gap-4 mt-5 text-slate-900">
            <a
              href={YOUTUBE_URL}
              aria-label="YouTube"
              target="_blank"
              rel="noopener noreferrer"
              title="YouTube"
              className="hover:text-[#009688] transition-colors"
            >
              <YoutubeIcon className="w-5 h-5" />
            </a>
            <a
              href={TIKTOK_URL}
              aria-label="TikTok"
              target="_blank"
              rel="noopener noreferrer"
              title="TikTok"
              className="hover:text-[#009688] transition-colors"
            >
              <TikTokIcon className="w-5 h-5" />
            </a>
            <a
              href={FACEBOOK_URL}
              aria-label="Facebook / Contact"
              target={settings.channels?.facebookUrl ? '_blank' : undefined}
              rel={settings.channels?.facebookUrl ? 'noopener noreferrer' : undefined}
              title="Contact"
              className="hover:text-[#009688] transition-colors"
            >
              <FacebookIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Barre du bas */}
      <div className="border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} {settings.siteInfo?.platformName || 'Aliou Sow Academy'} — Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
