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

const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
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

          <ul className="uiverse-social-list pt-3">
            <li className="icon-content">
              <a
                data-social="whatsapp"
                aria-label="WhatsApp"
                href={`https://wa.me/${CONTACT_PHONE_DISPLAY.replace(/[^\d]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="filled" />
                <WhatsAppIcon />
              </a>
              <div className="tooltip">WhatsApp</div>
            </li>
            <li className="icon-content">
              <a
                data-social="youtube"
                aria-label="YouTube"
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="filled" />
                <YoutubeIcon />
              </a>
              <div className="tooltip">YouTube</div>
            </li>
            <li className="icon-content">
              <a
                data-social="tiktok"
                aria-label="TikTok"
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="filled" />
                <TikTokIcon />
              </a>
              <div className="tooltip">TikTok</div>
            </li>
            <li className="icon-content">
              <a
                data-social="facebook"
                aria-label="Facebook"
                href={FACEBOOK_URL}
                target={settings.channels?.facebookUrl ? '_blank' : undefined}
                rel={settings.channels?.facebookUrl ? 'noopener noreferrer' : undefined}
              >
                <div className="filled" />
                <FacebookIcon />
              </a>
              <div className="tooltip">Facebook</div>
            </li>
          </ul>
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