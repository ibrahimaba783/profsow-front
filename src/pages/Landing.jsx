import React, { useEffect, useState, useRef, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';
import api from '../utils/api';
import CourseCard from '../components/CourseCard';
import LevelSelect from '../components/LevelSelect';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Quote,
  Users,
  BookOpen,
  Briefcase,
  Smartphone,
  Check,
  Zap,
  WifiOff,
  Bell,
  GraduationCap,
  Award,
  Megaphone,
  Wrench,
  ExternalLink,
} from 'lucide-react';
import profPhoto from '../assets/prof-aliou-sow.jpg';

const COURSES_PREVIEW_COUNT = 8;
const TRENDING_PREVIEW_COUNT = 4;

const INSTALL_FEATURES = [
  {
    icon: Zap,
    title: 'Accès ultra-rapide',
    text: "Lancez l'application en un clic depuis votre écran d'accueil",
  },
  {
    icon: WifiOff,
    title: 'Mode hors ligne',
    text: 'Consultez vos cours même sans connexion internet',
  },
  {
    icon: Bell,
    title: 'Notifications',
    text: 'Recevez des alertes pour vos nouveaux cours et séances en direct',
  },
  {
    icon: Smartphone,
    title: 'Expérience native',
    text: 'Interface optimisée comme une vraie application mobile',
  },
];

const INSTALL_STEPS = [
  {
    emoji: '🌐',
    title: 'Chrome / Edge',
    text: 'Cliquez sur "Installer" dans la barre d\'adresse ou utilisez le bouton ci-dessus',
  },
  {
    emoji: '🍎',
    title: 'Safari (iOS)',
    text: 'Appuyez sur le bouton Partager puis "Sur l\'écran d\'accueil"',
  },
  {
    emoji: '🤖',
    title: 'Android',
    text: 'Appuyez sur "Ajouter à l\'écran d\'accueil" dans le menu du navigateur',
  },
];

const STEPS = [
  "S'inscrire",
  'Choisir un module',
  'Tester vos connaissances',
  'Suivre les cours et séances en direct',
];

const TESTIMONIALS = [
  {
    name: 'FATOU DIAGNE',
    level: 'Élève en Terminale S',
    quote:
      "Grâce à Aliou Sow Academy, j'ai pu maîtriser les fonctions, les suites et la mécanique. Les cours sont très structurés et les quiz corrigés m'ont permis de réussir mon Baccalauréat sereinement.",
  },
  {
    name: 'MOUSSA KA',
    level: 'Élève en 1ère S',
    quote:
      "Les séances en direct et l'espace d'échange avec M. Aliou Sow font toute la différence. Dès que j'ai une question sur un chapitre de Physique-Chimie, j'obtiens une explication claire et rapide.",
  },
  {
    name: 'AÏSSATOU SARR',
    level: 'Élève en 3ème',
    quote:
      "Les fiches PDF et les vidéos pas à pas sont faciles à suivre sur téléphone comme sur ordinateur. J'ai préparé mon BFEM en toute confiance grâce aux exercices interactifs.",
  },
];

const FAQS = [
  {
    question: 'Comment fonctionne Aliou Sow Academy ?',
    answer:
      "Inscrivez-vous en quelques secondes, choisissez votre module en Mathématiques ou Physique-Chimie selon votre classe (4ème à Terminale S), accédez aux chapitres structurés (vidéos, fiches PDF, cours rédigés, séances en direct) et validez vos acquis grâce aux quiz interactifs.",
  },
  {
    question: 'Les cours suivent-ils le programme officiel ?',
    answer:
      "Oui, l'ensemble des modules est conçu par M. Aliou Sow conformément au programme officiel sénégalais du collège et du lycée scientifique (4ème, 3ème, 2nde S, 1ère S, Terminale S) pour préparer efficacement le BFEM et le Baccalauréat.",
  },
  {
    question: "Quel est le tarif et la durée d'accès à un module ?",
    answer:
      "L'accès standard à un module est fixé à 6 000 FCFA (payable simplement par Wave ou Orange Money), avec des offres gratuites sur certains modules de découverte et un accès renouvelable pour accompagner votre progression.",
  },
  {
    question: 'Puis-je accéder aux cours sur mobile ?',
    answer:
      "Oui, la plateforme est entièrement responsive et optimisée pour smartphones, tablettes et ordinateurs. Vous pouvez même l'installer sur votre écran d'accueil pour un accès rapide.",
  },
  {
    question: "Y a-t-il un support disponible si j'ai des questions ?",
    answer:
      "Oui ! Chaque module intègre un salon de discussion et de soutien pédagogique permettant d'échanger directement avec M. Aliou Sow et les autres apprenants, en plus des séances en direct.",
  },
];

const useCountUp = (target, start, duration = 1400) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime = null;
    let frameId;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [start, target, duration]);

  return value;
};

const StatCard = ({ icon: Icon, target, label, suffix = '', start }) => {
  const value = useCountUp(target, start);
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-[0_2px_14px_rgba(15,23,42,0.04)] p-8 text-center">
      <Icon className="w-11 h-11 mx-auto mb-4 text-[#f59d0e]" strokeWidth={1.6} />
      <div className="text-3xl md:text-4xl font-extrabold text-slate-900">
        {value}
        {target > 0 ? suffix : ''}
      </div>
      <p className="text-slate-500 text-sm mt-2">{label}</p>
    </div>
  );
};

const CourseSkeletonRow = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="rounded-xl border border-slate-200 overflow-hidden animate-pulse bg-white">
        <div className="aspect-[16/10] bg-slate-100"></div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between">
            <div className="h-4 bg-slate-100 rounded-full w-20"></div>
            <div className="h-4 bg-slate-100 rounded-full w-16"></div>
          </div>
          <div className="h-4 bg-slate-100 rounded w-5/6"></div>
          <div className="h-3 bg-slate-100 rounded w-1/2"></div>
          <div className="h-5 bg-slate-100 rounded w-1/3"></div>
        </div>
      </div>
    ))}
  </div>
);

const getInitials = (name) =>
  (name || 'AS')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

const Landing = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);
  const SUBJECTS = settings.subjects?.length > 0 ? settings.subjects : ['Mathématiques', 'Physique-Chimie'];
  const LEVELS = settings.levels?.length > 0 ? settings.levels : [
    { value: '4ème', label: '4ème' },
    { value: '3ème', label: '3ème' },
    { value: '2nde S', label: '2nde S' },
    { value: '1ère S', label: '1ère S' },
    { value: 'TS', label: 'Terminale S' },
  ];
  const dynamicTestimonials = settings.testimonials?.length > 0 ? settings.testimonials : TESTIMONIALS;
  const dynamicFaqs = settings.faqs?.length > 0 ? settings.faqs : FAQS;
  const activeExtraLinks = (settings.extraLinks || []).filter((item) => item && item.active !== false && item.title && item.url);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState('Tous');
  const [activeLevel, setActiveLevel] = useState('Tous');
  const [onlyFree, setOnlyFree] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [platformStats, setPlatformStats] = useState({
    studentsCount: 0,
    coursesCount: 0,
    modulesCount: 0,
  });
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState(-1);
  const [installPrompt, setInstallPrompt] = useState(null);
  const statsRef = useRef(null);
  const location = useLocation();

  const isLoggedIn = !authLoading && !!user;
  const firstName = user?.name ? user.name.trim().split(' ')[0] : '';
  const dashboardPath = user?.role === 'admin' ? '/admin-dashboard' : user?.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';

  useEffect(() => {
    if (location.state?.subject) setActiveSubject(location.state.subject);
    if (location.state?.level) setActiveLevel(location.state.level);

    if (location.hash) {
      const id = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api('/courses');
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erreur de chargement des cours :', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api('/stats');
        setPlatformStats(data);
      } catch (err) {
        console.error('Erreur de chargement des statistiques :', err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.25 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const resetFilters = () => {
    setActiveSubject('Tous');
    setActiveLevel('Tous');
    setOnlyFree(false);
  };

  // Cours tendance : triés par nombre d'apprenants puis récence
  const trendingCourses = [...courses]
    .sort((a, b) => (b.studentsCount || 0) - (a.studentsCount || 0))
    .slice(0, TRENDING_PREVIEW_COUNT);

  const filteredCourses = courses.filter((c) => {
    const matchSubject = activeSubject === 'Tous' || c.subject === activeSubject;
    const matchLevel = activeLevel === 'Tous' || c.level === activeLevel;
    const matchFree = !onlyFree || c.isFree || c.price === 0;
    return matchSubject && matchLevel && matchFree;
  });

  const visibleCourses = showAllCourses
    ? filteredCourses
    : filteredCourses.slice(0, COURSES_PREVIEW_COUNT);
  const canToggleCourses = filteredCourses.length > COURSES_PREVIEW_COUNT;

  const prevTestimonial = () =>
    setActiveTestimonial((i) =>
      dynamicTestimonials.length ? (i - 1 + dynamicTestimonials.length) % dynamicTestimonials.length : 0
    );
  const nextTestimonial = () =>
    setActiveTestimonial((i) =>
      dynamicTestimonials.length ? (i + 1) % dynamicTestimonials.length : 0
    );

  // Ordre cyclique pour afficher les témoignages comme sur les captures Bakeli
  const orderedTestimonials = dynamicTestimonials.map(
    (_, idx) => dynamicTestimonials[(activeTestimonial + idx) % dynamicTestimonials.length]
  );

  const announcement = settings.announcement || {};
  const maintenanceMode = Boolean(settings.siteInfo?.maintenanceMode);
  const openRegistration = settings.features?.enableOpenRegistration !== false;

  return (
    <div className="min-h-screen bg-white pt-[72px] text-slate-900">
      {maintenanceMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center text-sm text-amber-900">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 font-semibold">
            <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {settings.siteInfo?.maintenanceMessage ||
                'La plateforme est momentanément en maintenance. Nous revenons très vite !'}
            </span>
          </div>
        </div>
      )}

      {announcement.active && announcement.message && (
        <div
          className={`border-b px-4 py-2.5 text-sm ${
            announcement.type === 'warning'
              ? 'bg-orange-50 border-orange-200 text-orange-900'
              : announcement.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-teal-50 border-teal-200 text-[#00695c]'
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 font-medium">
              <Megaphone className="w-4 h-4 shrink-0" />
              {announcement.message}
            </span>
            {announcement.buttonText && announcement.link && (
              <Link
                to={announcement.link}
                className="px-3 py-1 rounded-full bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold transition"
              >
                {announcement.buttonText}
              </Link>
            )}
          </div>
        </div>
      )}
      {/* 1. BANNIÈRE D'ACCUEIL (Format exact Capture 1 Bakeli) */}
      <header className="w-full bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Texte à gauche */}
          <div>
            {isLoggedIn ? (
              <>
                <h1 className="font-black uppercase tracking-tight leading-[1.12] text-slate-900 text-3xl sm:text-4xl lg:text-[42px] mb-5">
                  RAVI DE VOUS RETROUVER{firstName ? `, ${firstName.toUpperCase()} !` : ' !'}
                </h1>
                <p className="text-slate-600 text-base leading-relaxed max-w-xl mb-8">
                  Poursuivez vos cours de Mathématiques et de Physique-Chimie avec M. Aliou Sow,
                  téléchargez vos fiches PDF, participez aux séances en direct et évaluez vos
                  connaissances avec les quiz interactifs.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to={dashboardPath}
                    className="inline-block border border-[#f59d0e] bg-[#f59d0e] text-white hover:bg-[#e08b00] font-semibold px-7 py-3 rounded-lg transition"
                  >
                    Accéder à mon espace
                  </Link>
                  <a
                    href="#catalogue"
                    className="inline-block border border-[#009688] text-[#009688] hover:bg-[#009688] hover:text-white font-semibold px-7 py-3 rounded-lg transition"
                  >
                    Explorer les modules
                  </a>
                </div>
              </>
            ) : (
              <>
                <h1 className="font-black uppercase tracking-tight leading-[1.12] text-slate-900 text-3xl sm:text-4xl lg:text-[42px] mb-5">
                  APPRENEZ À VOTRE RYTHME ET RÉUSSISSEZ EN SCIENCES
                </h1>
                <p className="text-slate-600 text-base leading-relaxed max-w-xl mb-8">
                  Avec la plateforme d&apos;apprentissage en ligne de M. Aliou Sow, accédez à des
                  cours structurés en Mathématiques et Physique-Chimie, adaptés de la 4ème à la
                  Terminale S. Avancez à votre propre rythme grâce aux vidéos, documents PDF, quiz et
                  séances en direct pour réussir le BFEM et le Baccalauréat.
                </p>
                <Link
                  to={openRegistration ? '/register' : '/courses'}
                  className="inline-block border border-[#f59d0e] text-[#f59d0e] hover:bg-[#f59d0e] hover:text-white font-semibold px-7 py-3 rounded-lg transition"
                >
                  {openRegistration ? 'Inscrivez-vous dès maintenant !' : 'Découvrir nos modules'}
                </Link>
              </>
            )}
          </div>

          {/* Portrait du professeur + formes organiques orange/vert sarcelle (Capture 1 Bakeli) */}
          <div className="flex justify-center lg:justify-end lg:pr-6">
            <div className="relative w-[280px] sm:w-[340px] lg:w-[380px] py-4">
              {/* Forme organique centrale dégradée orange -> vert sarcelle */}
              <div className="absolute top-6 left-2 w-3/4 h-3/4 rounded-[58%_42%_52%_48%/45%_55%_45%_55%] bg-gradient-to-r from-[#f59d0e] via-[#84a94c] to-[#009688] opacity-90 -rotate-6"></div>
              {/* Cercle beige doux à gauche */}
              <div className="absolute bottom-14 -left-10 w-24 h-24 rounded-full bg-[#efe8dd]"></div>
              {/* Goutte dégradée en haut à gauche */}
              <div className="absolute top-8 -left-4 w-11 h-11 rounded-full bg-gradient-to-br from-[#f59d0e] to-[#009688]"></div>
              {/* Petit point vert/orange en haut */}
              <div className="absolute top-4 left-1/3 w-4 h-4 rounded-full bg-gradient-to-br from-[#f59d0e] to-[#009688]"></div>
              {/* Forme goutte en haut à droite */}
              <div className="absolute top-12 -right-4 w-12 h-7 rounded-[0_100%_0_100%] bg-gradient-to-r from-[#f59d0e] to-[#009688] -rotate-12"></div>
              {/* Forme goutte en bas à gauche */}
              <div className="absolute bottom-4 -left-6 w-14 h-9 rounded-[100%_0_100%_0] bg-gradient-to-r from-[#f59d0e] to-[#009688] rotate-12"></div>
              {/* Cercle dégradé en bas à droite */}
              <div className="absolute -bottom-2 -right-2 w-14 h-14 rounded-full bg-gradient-to-br from-[#f59d0e] to-[#009688]"></div>

              {/* Photo de M. Aliou Sow */}
              <div className="relative z-10 aspect-[4/5] mx-auto w-[84%] overflow-hidden rounded-[44%_56%_48%_52%/36%_38%_62%_64%] border-4 border-white shadow-xl bg-slate-100">
                <img
                  src={profPhoto}
                  alt="M. Aliou Sow, professeur de Mathématiques et Physique-Chimie"
                  className="w-full h-full object-cover object-[50%_10%]"
                />
              </div>

              {/* Badge professeur discret */}
              <div className="relative z-20 -mt-7 mx-auto w-fit bg-white/95 backdrop-blur border border-slate-100 rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-3">
                <span className="w-1.5 h-8 rounded-full bg-[#009688]"></span>
                <div className="leading-tight">
                  <p className="text-sm font-extrabold text-slate-900">M. Aliou Sow</p>
                  <p className="text-[11px] text-slate-500">
                    Mathématiques &amp; Physique-Chimie
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. NOS MODULES TENDANCE (Capture 2 Bakeli) */}
      <section id="trending" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 scroll-mt-24">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Nos Modules Tendance
          </h2>
          <Link
            to="/courses"
            className="text-sm sm:text-base font-semibold text-[#009688] hover:underline shrink-0"
          >
            Tout afficher
          </Link>
        </div>

        {loading ? (
          <CourseSkeletonRow />
        ) : trendingCourses.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl py-14 px-6 text-center">
            <p className="text-slate-700 font-semibold mb-1">
              Les premiers modules arrivent bientôt.
            </p>
            <p className="text-slate-400 text-sm">
              Revenez très prochainement sur Aliou Sow Academy.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* 3. CHIFFRES CLÉS (Capture 3 Bakeli - Données réelles de la BD) */}
      <section ref={statsRef} className="w-full bg-[#f8fafc] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-900 mb-10">
            Découvrez les chiffres des élèves ayant suivi nos cours
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={Users}
              target={platformStats.studentsCount}
              suffix="+"
              label="Apprenants inscrits"
              start={statsVisible}
            />
            <StatCard
              icon={BookOpen}
              target={platformStats.coursesCount}
              suffix="+"
              label="Cours disponibles"
              start={statsVisible}
            />
            <StatCard
              icon={Briefcase}
              target={platformStats.modulesCount}
              label="Matières scientifiques proposées"
              start={statsVisible}
            />
          </div>
        </div>
      </section>

      {/* 4. APPRENEZ PARTOUT, MÊME HORS LIGNE + COMMENT INSTALLER ? (Captures 4 & 5 Bakeli) */}
      <section id="install" className="w-full bg-white py-16 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Apprenez partout, même hors ligne
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mt-4 leading-relaxed">
              Installez Aliou Sow Academy sur votre appareil pour une expérience optimale. Accédez
              à vos cours rapidement, même sans connexion internet.
            </p>

            <div className="mt-8 space-y-5">
              {INSTALL_FEATURES.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#f59d0e] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-[15px]">{item.title}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {installPrompt && (
              <button
                onClick={handleInstall}
                className="mt-8 bg-[#009688] hover:bg-[#00796b] text-white font-semibold px-6 py-3 rounded-lg transition cursor-pointer"
              >
                Installer l&apos;application
              </button>
            )}
          </div>

          <hr className="border-slate-100 my-14" />

          <h3 className="text-xl font-bold text-slate-900 text-center mb-8">
            Comment installer ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INSTALL_STEPS.map((step) => (
              <div
                key={step.title}
                className="bg-slate-50/70 border border-slate-100 rounded-xl p-6 text-center shadow-[0_1px_6px_rgba(15,23,42,0.03)]"
              >
                <div className="text-3xl mb-3">{step.emoji}</div>
                <h4 className="font-bold text-slate-900 mb-2">{step.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TROUVER LE MODULE QUI VOUS CORRESPOND (Captures 5 & 6 Bakeli) */}
      <section id="catalogue" className="w-full bg-white pb-16 pt-4 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Trouver le module qui vous correspond
          </h2>
          <p className="text-slate-600 mt-2 mb-7">
            Choisissez la matière qui vous passionne et adaptez le niveau d&apos;étude selon vos
            objectifs pour avancer à votre rythme.
          </p>

          {/* Barre de filtres exacte Bakeli */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <LevelSelect
              value={activeLevel}
              onChange={setActiveLevel}
              options={[{ value: 'Tous', label: 'Tous les niveaux' }, ...LEVELS]}
              size="md"
            />

            {['Tous', ...SUBJECTS].map((subject) => (
              <button
                key={subject}
                onClick={() => setActiveSubject(subject)}
                className={`h-10 px-4 rounded-full border text-sm font-medium transition cursor-pointer ${
                  activeSubject === subject
                    ? 'bg-[#009688] border-[#009688] text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:border-[#009688]'
                }`}
              >
                {subject === 'Tous' ? 'Toutes les matières' : subject}
              </button>
            ))}

            <button
              onClick={() => setOnlyFree((v) => !v)}
              className={`h-10 px-4 rounded-full border text-sm font-medium transition cursor-pointer ${
                onlyFree
                  ? 'bg-[#f59d0e] border-[#f59d0e] text-white'
                  : 'bg-white border-slate-300 text-slate-700 hover:border-[#f59d0e]'
              }`}
            >
              Cours gratuits
            </button>

            {canToggleCourses ? (
              <button
                onClick={() => setShowAllCourses((v) => !v)}
                className="ml-auto text-sm sm:text-base font-semibold text-[#009688] hover:underline cursor-pointer"
              >
                {showAllCourses ? 'Réduire' : 'Tout afficher'}
              </button>
            ) : (
              <Link
                to="/courses"
                className="ml-auto text-sm sm:text-base font-semibold text-[#009688] hover:underline"
              >
                Tout afficher
              </Link>
            )}
          </div>

          {loading ? (
            <CourseSkeletonRow />
          ) : courses.length === 0 ? (
            <div className="border border-dashed border-slate-300 rounded-xl py-16 px-6 text-center">
              <p className="text-slate-700 font-semibold mb-1">
                Les premiers cours arrivent bientôt.
              </p>
              <p className="text-slate-400 text-sm">
                Revenez très prochainement sur Aliou Sow Academy.
              </p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="border border-slate-200 rounded-xl py-14 px-6 text-center">
              <p className="text-slate-700 font-semibold mb-1">
                Aucun module ne correspond à cette sélection.
              </p>
              <button
                onClick={resetFilters}
                className="mt-3 text-[#009688] hover:underline text-sm font-semibold cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. CE QUE DISENT NOS APPRENANTS (Captures 7 & 8 Bakeli) */}
      <section id="testimonials" className="w-full bg-[#f8fafc] py-16 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">
            Ce que disent nos apprenants
          </h2>

          <div className="space-y-4">
            {orderedTestimonials.map((t) => (
              <figure
                key={t.name}
                className="bg-white border border-slate-100 rounded-xl shadow-[0_2px_12px_rgba(15,23,42,0.04)] p-6 sm:p-8"
              >
                <Quote className="w-7 h-7 text-slate-900 fill-slate-900 mb-3 rotate-180" />
                <blockquote className="text-slate-600 text-[15px] leading-relaxed">
                  {t.quote}
                </blockquote>
                <figcaption className="flex items-center gap-4 mt-5">
                  <span className="w-12 h-12 rounded-full bg-[#009688] text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {getInitials(t.name)}
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold uppercase text-slate-900">
                      {t.name}
                    </span>
                    <span className="block text-xs text-slate-500 mt-0.5">{t.level}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-5">
            <button
              type="button"
              onClick={prevTestimonial}
              aria-label="Témoignage précédent"
              className="w-7 h-7 bg-slate-900 text-white flex items-center justify-center rounded hover:bg-[#009688] transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextTestimonial}
              aria-label="Témoignage suivant"
              className="w-7 h-7 bg-white border border-slate-200 text-slate-600 flex items-center justify-center rounded hover:border-[#009688] hover:text-[#009688] transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. DÉVELOPPER DES COMPÉTENCES (Capture 8 Bakeli) */}
      <section className="w-full bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-3">
              Développer des compétences avec Aliou Sow Academy
            </h2>
            <p className="text-slate-600 text-base leading-relaxed mb-7 max-w-xl">
              Boostez vos compétences et révélez votre potentiel avec Aliou Sow Academy, votre allié
              pour un apprentissage scientifique structuré et accessible !
            </p>

            <ul className="space-y-3.5 mb-8">
              {STEPS.map((step) => (
                <li key={step} className="flex items-center gap-3 font-medium text-slate-800">
                  <Check className="w-5 h-5 text-[#009688] shrink-0" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/courses"
              className="inline-flex items-center h-12 px-7 rounded-lg bg-[#009688] hover:bg-[#00796b] text-white font-semibold transition"
            >
              Explorer nos cours
            </Link>
          </div>

          {/* Illustration éducative (Capture 8 Bakeli) */}
          <div className="flex justify-center">
            <svg
              viewBox="0 0 360 280"
              className="w-full max-w-[340px] h-auto"
              role="img"
              aria-label="Illustration étudiant en apprentissage"
            >
              <circle cx="185" cy="145" r="108" fill="#eef4ff" />
              {/* Feuille A+ */}
              <rect x="115" y="42" width="46" height="58" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
              <text x="123" y="62" fontSize="14" fontWeight="bold" fill="#4f46e5">A+</text>
              <line x1="123" y1="73" x2="152" y2="73" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="123" y1="82" x2="148" y2="82" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="123" y1="91" x2="144" y2="91" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
              {/* Engrenages */}
              <circle cx="72" cy="148" r="20" fill="#ffffff" stroke="#6366f1" strokeWidth="4" strokeDasharray="7 5" />
              <circle cx="72" cy="148" r="7" fill="#a5b4fc" />
              <circle cx="102" cy="122" r="12" fill="#ffffff" stroke="#6366f1" strokeWidth="3" strokeDasharray="5 4" />
              <circle cx="102" cy="122" r="4" fill="#a5b4fc" />
              {/* Chapeau de diplômé */}
              <polygon points="240,58 278,72 240,86 202,72" fill="#4f6ef7" />
              <path d="M216,78 L216,96 C216,96 240,104 264,96 L264,78" fill="#6366f1" />
              <line x1="274" y1="74" x2="274" y2="100" stroke="#f59d0e" strokeWidth="2.5" />
              <circle cx="274" cy="102" r="3" fill="#f59d0e" />
              {/* Ampoule */}
              <circle cx="290" cy="142" r="16" fill="#dbeafe" stroke="#60a5fa" strokeWidth="2" />
              <rect x="284" y="157" width="12" height="7" rx="2" fill="#64748b" />
              <line x1="290" y1="118" x2="290" y2="111" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
              <line x1="312" y1="142" x2="319" y2="142" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
              <line x1="306" y1="125" x2="311" y2="120" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
              {/* Étudiant avec livre */}
              <circle cx="185" cy="134" r="28" fill="#0f172a" />
              <circle cx="185" cy="139" r="17" fill="#f8cbb8" />
              <path d="M168,136 C172,126 198,126 202,136 C198,123 172,123 168,136 Z" fill="#0f172a" />
              <path d="M126,232 C132,190 156,174 185,174 C214,174 238,190 244,232 Z" fill="#c7d2fe" />
              {/* Livre ouvert */}
              <polygon points="145,196 185,204 185,244 145,235" fill="#4f6ef7" />
              <polygon points="225,196 185,204 185,244 225,235" fill="#6366f1" />
              <circle cx="152" cy="222" r="9" fill="#f8cbb8" />
              <circle cx="218" cy="222" r="9" fill="#f8cbb8" />
            </svg>
          </div>
        </div>
      </section>

      {activeExtraLinks.length > 0 && (
        <section className="w-full bg-[#f8fafc] py-14 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Ressources &amp; Services complémentaires
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-1">
                Outils, documents et activités ajoutés par l&apos;équipe pédagogique.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeExtraLinks.map((item, idx) => (
                <a
                  key={`${item.title}-${idx}`}
                  href={item.url}
                  target={item.url.startsWith('http') ? '_blank' : undefined}
                  rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="bg-white border border-slate-200 hover:border-[#009688] rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4"
                >
                  <div>
                    {item.badge && (
                      <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-[#f59d0e] px-2.5 py-1 rounded-full mb-3">
                        {item.badge}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#009688]">
                    Accéder <ExternalLink className="w-4 h-4" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. BANDEAU D'APPEL À L'ACTION VERT SARCELLE (Capture 9 Bakeli) */}
      <section className="relative w-full bg-[#009688] text-white overflow-hidden">
        <GraduationCap className="hidden md:block absolute -right-8 top-6 w-56 h-56 text-white/10 -rotate-12 pointer-events-none" />
        <Award className="hidden md:block absolute -left-8 bottom-4 w-48 h-48 text-white/10 rotate-12 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
            Commençons avec Aliou Sow Academy
          </h2>
          <p className="text-white/90 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Reconnue pour ses cours structurés de Mathématiques et Physique-Chimie qui transforment
            les élèves ambitieux en lauréats au BFEM et au Baccalauréat.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center h-11 px-8 rounded-lg border border-white text-white hover:bg-white hover:text-[#009688] text-sm font-semibold transition"
          >
            Découvrez nos cours
          </Link>
        </div>
      </section>

      {/* 9. QUESTIONS FRÉQUENTES (Captures 9 & 10 Bakeli) */}
      <section id="faq" className="w-full bg-[#f8fafc] py-16 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">
            Questions fréquentes
          </h2>
          <div className="divide-y divide-slate-200 border-b border-slate-200">
            {dynamicFaqs.map((faq, i) => (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer group"
                >
                  <span className="text-base sm:text-lg text-slate-700 group-hover:text-slate-900 transition-colors">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-200 ${
                      openFaq === i ? 'rotate-180 text-[#009688]' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <p className="text-slate-500 text-sm sm:text-base pb-5 pr-8 leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
