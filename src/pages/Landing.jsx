import React, { useEffect, useState, useRef, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';
import api from '../utils/api';
import CourseCard from '../components/CourseCard';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
  Play,
  ArrowRight,
  Star,
  Download,
  Share2,
  Monitor,
  X,
} from 'lucide-react';
import profPhotoCutout from '../assets/prof-aliou-sow-cutout.png';
import { getClassStats } from '../utils/education';

const COURSES_PREVIEW_COUNT = 8;
const TRENDING_PREVIEW_COUNT = 4;

// Composant Reveal pour les animations fluides au scroll (exactement comme sur la vidéo)
const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98], delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const INSTALL_FEATURES = [
  {
    icon: Zap,
    title: 'Accès ultra-rapide',
    text: 'Revoyez vos cours en quelques secondes.',
  },
  {
    icon: WifiOff,
    title: 'Mode hors ligne',
    text: 'Révisez sans connexion internet.',
  },
  {
    icon: Bell,
    title: 'Notifications',
    text: 'Ne manquez aucun nouveau chapitre.',
  },
  {
    icon: Smartphone,
    title: 'Expérience native',
    text: 'Une interface fluide pensée pour le mobile.',
  },
];

const INSTALL_STEPS = [
  {
    number: '01',
    icon: Monitor,
    title: 'Chrome / Edge',
    text: 'Menu > Installer l\'application',
  },
  {
    number: '02',
    icon: Share2,
    title: 'Safari (iOS)',
    text: 'Partager > Sur l\'écran d\'accueil',
  },
  {
    number: '03',
    icon: Smartphone,
    title: 'Android',
    text: 'Appuyez sur la bannière Installer',
  },
];

const STEPS = [
  "S'inscrire en quelques clics",
  'Choisir une matière adaptée à votre classe',
  'Tester vos connaissances avec des quiz',
  'Suivre les chapitres et séances en direct',
];

const TESTIMONIALS = [
  {
    name: 'Fatou Diagne',
    initials: 'FD',
    level: 'Élève en Terminale S',
    quote:
      "Les explications sont claires et progressives. J'ai enfin compris les limites et je suis beaucoup plus confiante pour le Bac.",
  },
  {
    name: 'Aïssatou Fall',
    initials: 'AF',
    level: 'Élève en 2nde S',
    quote:
      "Je peux revoir les vidéos sur mon téléphone après les cours. Les résumés PDF sont vraiment pratiques pour réviser.",
  },
  {
    name: 'Moussa Ndiaye',
    initials: 'MN',
    level: 'Élève en 3ème',
    quote:
      "Les exercices corrigés m'ont aidé à repérer mes erreurs. Mon dernier devoir de maths est passé de 9 à 15.",
  },
];

const FAQS = [
  {
    question: 'Comment fonctionne Aliou Sow Academy ?',
    answer:
      'Créez votre compte, choisissez votre classe puis avancez à votre rythme grâce aux vidéos, fiches PDF, exercices corrigés et quiz.',
  },
  {
    question: 'Les cours suivent-ils le programme officiel ?',
    answer:
      "Oui, l'ensemble des cours respecte scrupuleusement le programme officiel du Ministère de l'Éducation Nationale du Sénégal, du collège au lycée (de la 4ème à la Terminale S).",
  },
  {
    question: "Quel est le tarif et la durée d'accès à un module ?",
    answer:
      "L'accès standard à un module complet est proposé à un tarif très accessible (payable simplement par Wave ou Orange Money), avec des leçons d'aperçu 100% gratuites.",
  },
  {
    question: 'Puis-je accéder aux cours sur mobile ?',
    answer:
      "Absolument ! La plateforme est parfaitement adaptée aux téléphones et tablettes. Vous pouvez l'installer en PWA sur votre écran d'accueil pour réviser à tout moment.",
  },
  {
    question: "Y a-t-il un support disponible si j'ai des questions ?",
    answer:
      'Oui, un espace de questions-réponses ainsi que des séances en direct avec M. Aliou Sow vous permettent de lever tous vos blocages en direct.',
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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(15,23,42,0.06)] p-8 text-center hover:-translate-y-1.5 transition-all duration-300">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#f59e0b] flex items-center justify-center mx-auto mb-5 shadow-xs">
        <Icon className="w-7 h-7" strokeWidth={1.8} />
      </div>
      <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
        {value}
        {target > 0 ? suffix : ''}
      </div>
      <p className="text-slate-500 text-sm font-medium mt-2">{label}</p>
    </div>
  );
};

const CourseSkeletonRow = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden animate-pulse bg-white p-4 space-y-4">
        <div className="aspect-[16/9] bg-slate-100 rounded-xl" />
        <div className="h-4 bg-slate-100 rounded-full w-24" />
        <div className="h-5 bg-slate-100 rounded w-4/5" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-8 bg-slate-100 rounded-xl w-full" />
      </div>
    ))}
  </div>
);

const Landing = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);
  const location = useLocation();

  const [courses, setCourses] = useState(() => {
    try {
      const cached = localStorage.getItem('profsow_cached_courses');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('profsow_cached_courses');
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });

  // Filtres
  const [activeCycleTab, setActiveCycleTab] = useState('toutes'); // 'toutes' | 'college' | 'lycee'
  const [activeSubject, setActiveSubject] = useState('Toutes les matières');
  const [activeClassFilter, setActiveClassFilter] = useState('Toutes les classes');
  const [onlyFree, setOnlyFree] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);

  // Stats & Testimonials
  const [statsVisible, setStatsVisible] = useState(false);
  const [platformStats, setPlatformStats] = useState(() => {
    try {
      const cached = localStorage.getItem('profsow_cached_stats');
      return cached ? JSON.parse(cached) : { studentsCount: 494, coursesCount: 30, modulesCount: 5 };
    } catch {
      return { studentsCount: 494, coursesCount: 30, modulesCount: 5 };
    }
  });

  const dynamicTestimonials = settings?.testimonials?.length ? settings.testimonials : TESTIMONIALS;
  const dynamicFaqs = settings?.faqs?.length ? settings.faqs : FAQS;
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState(0); // 1er élément ouvert par défaut comme sur la vidéo
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installModal, setInstallModal] = useState(null); // 'chrome' | 'safari' | 'android' | 'general' | null
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  const statsRef = useRef(null);

  const isLoggedIn = !authLoading && !!user;
  const dashboardPath =
    user?.role === 'admin'
      ? '/admin-dashboard'
      : user?.role === 'teacher'
      ? '/teacher-dashboard'
      : '/student-dashboard';

  useEffect(() => {
    if (location.state?.subject) setActiveSubject(location.state.subject);
    if (location.state?.level) setActiveClassFilter(location.state.level);

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
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
          try {
            localStorage.setItem('profsow_cached_courses', JSON.stringify(data));
          } catch {}
        }
      } catch (err) {
        console.error('Erreur chargement cours:', err);
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
        if (data && typeof data === 'object') {
          setPlatformStats((prev) => ({
            ...prev,
            ...data,
            studentsCount: data.studentsCount || 494,
            coursesCount: data.coursesCount || 30,
            modulesCount: data.modulesCount || 5,
          }));
        }
      } catch (err) {
        console.error('Erreur stats:', err);
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
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsAppInstalled(true);
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleTriggerInstall = async (platform = 'general') => {
    // Si l'événement natif Chrome/Edge/Android beforeinstallprompt est prêt
    if (installPrompt && (platform === 'chrome' || platform === 'android' || platform === 'general')) {
      try {
        installPrompt.prompt();
        const choiceResult = await installPrompt.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          setIsAppInstalled(true);
          setInstallPrompt(null);
          return;
        }
      } catch (err) {
        console.error('Erreur prompt installation:', err);
      }
    }

    // Sinon ouvrir la modale interactive d'instructions pour cette plateforme
    setInstallModal(platform);
  };

  // Matières tendances : triées par nombre d'élèves
  const trendingCourses = [...courses]
    .sort((a, b) => (b.studentsCount || 0) - (a.studentsCount || 0))
    .slice(0, TRENDING_PREVIEW_COUNT);

  // Filtre dynamique des cours pour "Trouver la matière"
  const filteredCourses = courses.filter((c) => {
    const matchSubject =
      activeSubject === 'Toutes les matières' ||
      activeSubject === 'Tous' ||
      (c.subject && c.subject.toLowerCase().includes(activeSubject.toLowerCase()));

    const matchClass =
      activeClassFilter === 'Toutes les classes' ||
      activeClassFilter === 'Tous' ||
      c.level === activeClassFilter ||
      (c.level && c.level.toLowerCase().includes(activeClassFilter.toLowerCase()));

    const matchFree = !onlyFree || c.isFree || c.price === 0;

    return matchSubject && matchClass && matchFree;
  });

  const visibleCourses = showAllCourses
    ? filteredCourses
    : filteredCourses.slice(0, COURSES_PREVIEW_COUNT);

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev === 0 ? dynamicTestimonials.length - 1 : prev - 1));
  };

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev === dynamicTestimonials.length - 1 ? 0 : prev + 1));
  };

  // Liste ordonnée des 5 classes sénégalaises (disponibilité 100% dynamique calculée via les cours de l'API)
  const PROGRAM_CLASSES = [
    {
      id: '4ème',
      name: 'Classe de 4ème',
      short: '4e',
      cycle: 'college',
      desc: 'Construisez des bases solides en sciences.',
      examBadge: null,
    },
    {
      id: '3ème',
      name: 'Classe de 3ème',
      short: '3e',
      cycle: 'college',
      desc: 'Préparez le BFEM avec méthode et confiance.',
      examBadge: 'EXAMEN BFEM',
    },
    {
      id: '2nde S',
      name: 'Classe de 2nde S',
      short: '2nde S',
      cycle: 'lycee',
      desc: 'Réussissez votre entrée au lycée scientifique.',
      examBadge: null,
    },
    {
      id: '1ère S',
      name: 'Classe de 1ère S',
      short: '1ère S',
      cycle: 'lycee',
      desc: 'Approfondissez les notions scientifiques clés.',
      examBadge: null,
    },
    {
      id: 'TS',
      name: 'Terminale S',
      short: 'TS',
      cycle: 'lycee',
      desc: "Visez l'excellence au Baccalauréat scientifique.",
      examBadge: 'EXAMEN BAC',
    },
  ];

  const collegeClasses = PROGRAM_CLASSES.filter((c) => c.cycle === 'college');
  const lyceeClasses = PROGRAM_CLASSES.filter((c) => c.cycle === 'lycee');

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pt-[72px] font-sans antialiased">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Identique à la vidéo 00:39 - 00:46) */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f0fbf9]/60 via-[#f8fafc] to-[#f8fafc] pt-10 pb-16 lg:pt-14 lg:pb-20">
        {/* Motif de points subtil dans le coin supérieur gauche */}
        <div
          className="absolute top-6 left-6 w-44 h-44 opacity-25 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#009688 1.8px, transparent 1.8px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Cercles de fond flous décoratifs */}
        <div className="absolute top-10 left-1/3 w-96 h-96 bg-[#009688]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-80 h-80 bg-[#f59e0b]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Colonne gauche : Titre, sous-titre, CTA, preuve sociale */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Badge "+ Réussir en sciences devient plus simple" */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#00796b] bg-[#e7f7f4] border border-[#009688]/20 shadow-xs">
                <span className="font-extrabold text-[#009688] text-sm leading-none">+</span>
                <span>Réussir en sciences devient plus simple</span>
              </div>

              {/* Titre */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-slate-900 leading-[1.1] tracking-tight">
                Apprenez à <br />
                votre rythme <br />
                et réussissez <br />
                en sciences
              </h1>

              {/* Description */}
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                Accédez à des matières structurées en chapitres (Mathématiques et Physique-Chimie), de la
                4ème à la Terminale S. Progressez grâce aux leçons vidéos, résumés PDF, exercices corrigés
                et quiz pour réussir le BFEM et le Baccalauréat.
              </p>

              {/* Boutons d'action CTA */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {isLoggedIn ? (
                  <Link
                    to={dashboardPath}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-white text-sm font-bold shadow-[0_10px_25px_-4px_rgba(245,158,11,0.35)] transition-all duration-200 hover:scale-[1.02]"
                  >
                    <span>Accéder à mon espace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-white text-sm font-bold shadow-[0_10px_25px_-4px_rgba(245,158,11,0.35)] transition-all duration-200 hover:scale-[1.02]"
                  >
                    <span>Inscrivez-vous dès maintenant</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                <a
                  href="#classes"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl border-2 border-[#009688] bg-white text-[#009688] hover:bg-[#009688] hover:text-white text-sm font-bold transition-all duration-200 shadow-xs hover:scale-[1.02]"
                >
                  Choisir ma classe
                </a>
              </div>

              {/* Preuve sociale : 3 avatars + avis */}
              <div className="flex items-center gap-3 pt-4">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-[#009688] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    FD
                  </div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-[#0284c7] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    MN
                  </div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-[#d97706] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    AP
                  </div>
                </div>

                <div className="text-xs">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-slate-900">4,9/5</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-500 font-medium">Déjà adopté par 500+ élèves</p>
                </div>
              </div>
            </motion.div>

            {/* Colonne droite : Photo en arche exacte de la vidéo + 3 cartes flottantes */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
              className="lg:col-span-5 relative flex justify-center lg:justify-end pt-4 pb-4"
            >
              <div className="relative isolate w-[300px] sm:w-[350px] md:w-[370px]">
                {/* Anneau courbé vert d'accent en arrière-plan (crescent figma) */}
                <div className="absolute top-1.5 -right-3 w-full h-full rounded-t-[190px] rounded-b-[34px] bg-[#009688] -z-10 shadow-lg" />
                <div className="absolute -inset-6 rounded-full bg-[#009688]/15 blur-2xl -z-20 pointer-events-none" />

                {/* Cadre arche avec photo du professeur bien en face et posée */}
                <div className="relative z-10 w-full aspect-[4/5] rounded-t-[180px] rounded-b-[28px] overflow-hidden bg-gradient-to-b from-[#c46d49] via-[#b6613c] to-[#994a28] shadow-[0_25px_60px_rgba(15,23,42,0.18)] border-4 border-white flex items-end justify-center">
                  <img
                    src={profPhotoCutout}
                    alt="M. Aliou Sow - Professeur de Mathématiques et Physique-Chimie"
                    className="w-full h-full object-cover object-[center_top] select-none pointer-events-none"
                  />
                </div>

                {/* 1. Carte flottante : Cours vidéo (haut gauche) */}
                <div
                  style={{ animation: 'float 4s ease-in-out infinite' }}
                  className="absolute top-10 -left-6 sm:-left-10 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_12px_32px_rgba(15,23,42,0.14)] border border-slate-100 px-4 py-2.5 flex items-center gap-3 z-30"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-[#f59e0b] flex items-center justify-center shrink-0 shadow-xs">
                    <Play className="w-3.5 h-3.5 fill-[#f59e0b] translate-x-0.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">Cours vidéo</h4>
                    <p className="text-[10px] text-slate-400">Clairs et progressifs</p>
                  </div>
                </div>

                {/* 2. Carte flottante : Quiz corrigés (milieu droite) */}
                <div
                  style={{ animation: 'float 4s ease-in-out infinite 1.5s' }}
                  className="absolute top-1/2 -right-6 sm:-right-8 -translate-y-1/2 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_12px_32px_rgba(15,23,42,0.14)] border border-slate-100 px-4 py-2.5 flex items-center gap-3 z-30"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-50 text-[#009688] flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">Quiz corrigés</h4>
                    <p className="text-[10px] text-slate-400">Testez vos acquis</p>
                  </div>
                </div>

                {/* 3. Carte flottante : Séances en direct (bas gauche) */}
                <div
                  style={{ animation: 'float 4s ease-in-out infinite 0.8s' }}
                  className="absolute bottom-6 -left-6 sm:-left-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_12px_32px_rgba(15,23,42,0.14)] border border-slate-100 px-4 py-2.5 flex items-center gap-3 z-30"
                >
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">Séances en direct</h4>
                    <p className="text-[10px] text-slate-400">Avec Aliou Sow</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Barre de réassurance inférieure (4 colonnes) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.35 }}
            className="mt-14 sm:mt-16 bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] border border-slate-100 p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100"
          >
            <div className="flex items-center gap-3 pt-2 md:pt-0">
              <span className="w-10 h-10 rounded-xl bg-teal-50 text-[#009688] flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                Programme officiel sénégalais
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-6">
              <span className="w-10 h-10 rounded-xl bg-teal-50 text-[#009688] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">BFEM &amp; Bac</span>
            </div>

            <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-6">
              <span className="w-10 h-10 rounded-xl bg-teal-50 text-[#009688] flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">Accessible sur mobile</span>
            </div>

            <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-6">
              <span className="w-10 h-10 rounded-xl bg-teal-50 text-[#009688] flex items-center justify-center shrink-0">
                <Play className="w-5 h-5" />
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">Séances en direct</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PROGRAMMES PAR CLASSE (Vidéo 00:00 - 00:04) */}
      {/* ========================================================================= */}
      <section id="classes" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
        {/* En-tête avec onglets de filtrage */}
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#e7f7f4] text-[#00796b] mb-3">
              PROGRAMME OFFICIEL SÉNÉGALAIS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Explorez les programmes par classe
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Un parcours structuré pour chaque niveau, du collège à la Terminale S.
            </p>
          </div>

          {/* Onglets segmentés Toutes / Collège / Lycée */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveCycleTab('toutes')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeCycleTab === 'toutes'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Toutes les classes
            </button>
            <button
              type="button"
              onClick={() => setActiveCycleTab('college')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeCycleTab === 'college'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Collège (4e &amp; 3e)
            </button>
            <button
              type="button"
              onClick={() => setActiveCycleTab('lycee')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeCycleTab === 'lycee'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lycée (2nde S à TS)
            </button>
          </div>
        </Reveal>

        {/* Grille des cartes de classes (Données 100% dynamiques et animation au scroll) */}
        <div className="space-y-8">
          {/* Row Collège */}
          {(activeCycleTab === 'toutes' || activeCycleTab === 'college') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {collegeClasses.map((item, idx) => {
                const stats = getClassStats(courses, item.id);
                // Règle stricte demandée : une classe est disponible UNIQUEMENT si elle a au moins 1 matière
                const isAvailable = stats.subjectsCount > 0;

                return (
                  <Reveal key={item.id} delay={idx * 0.08}>
                    <div
                      className={`group bg-white rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(15,23,42,0.06)] border border-slate-100 flex flex-col h-full transition-all duration-300 ${
                        isAvailable
                          ? 'hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(0,150,136,0.14)] cursor-pointer'
                          : 'opacity-90'
                      }`}
                    >
                      {/* Bannière supérieure : Verte si >= 1 matière, Grisée si 0 matière */}
                      <div
                        className={`relative h-44 flex items-center justify-center overflow-hidden transition-colors duration-300 ${
                          isAvailable ? 'bg-[#009688]' : 'bg-slate-300'
                        }`}
                      >
                        <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/10" />
                        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />

                        {item.examBadge && (
                          <span className="absolute top-4 right-4 bg-[#f59e0b] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs uppercase tracking-wider">
                            {item.examBadge}
                          </span>
                        )}

                        <div className="w-24 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg text-slate-900 text-2xl font-black group-hover:scale-105 transition-transform duration-300">
                          {item.short}
                        </div>
                      </div>

                      <div className="p-6 sm:p-8 flex flex-col flex-1">
                        {!isAvailable && (
                          <span className="inline-block self-start text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                            BIENTÔT DISPONIBLE
                          </span>
                        )}

                        <h3 className={`text-xl font-black text-slate-900 mb-1 transition-colors ${isAvailable ? 'group-hover:text-[#009688]' : ''}`}>
                          {item.name}
                        </h3>
                        <p className="text-slate-500 text-xs sm:text-sm mb-6">{item.desc}</p>

                        {/* Vraies données de l'API : matières, chapitres et leçons */}
                        <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-400 mb-6 flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{stats.subjectsCount} matière{stats.subjectsCount > 1 ? 's' : ''}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>{stats.totalChapters} chapitre{stats.totalChapters > 1 ? 's' : ''}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Play className="w-3.5 h-3.5 text-[#009688]" />
                            <span>{stats.totalLessons} leçon{stats.totalLessons > 1 ? 's' : ''}</span>
                          </span>
                        </div>

                        {/* Bouton d'action selon disponibilité */}
                        <div className="mt-auto">
                          {isAvailable ? (
                            <Link
                              to={`/courses?level=${encodeURIComponent(item.id)}`}
                              className="w-full py-3 px-4 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md cursor-pointer"
                            >
                              <span>Accéder au programme</span>
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                            </Link>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="w-full py-3 px-4 rounded-xl bg-slate-200 text-slate-400 text-xs font-bold cursor-not-allowed text-center select-none pointer-events-none transition-none"
                            >
                              Bientôt disponible
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}

          {/* Row Lycée */}
          {(activeCycleTab === 'toutes' || activeCycleTab === 'lycee') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {lyceeClasses.map((item, idx) => {
                const stats = getClassStats(courses, item.id);
                const isAvailable = stats.subjectsCount > 0;

                return (
                  <Reveal key={item.id} delay={idx * 0.08}>
                    <div
                      className={`group bg-white rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(15,23,42,0.06)] border border-slate-100 flex flex-col h-full transition-all duration-300 ${
                        isAvailable
                          ? 'hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(0,150,136,0.14)] cursor-pointer'
                          : 'opacity-90'
                      }`}
                    >
                      <div
                        className={`relative h-44 flex items-center justify-center overflow-hidden transition-colors duration-300 ${
                          isAvailable ? 'bg-[#009688]' : 'bg-slate-300'
                        }`}
                      >
                        <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/10" />
                        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />

                        {item.examBadge && (
                          <span className="absolute top-4 right-4 bg-[#f59e0b] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs uppercase tracking-wider">
                            {item.examBadge}
                          </span>
                        )}

                        <div className="w-24 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg text-slate-900 text-2xl font-black group-hover:scale-105 transition-transform duration-300">
                          {item.short}
                        </div>
                      </div>

                      <div className="p-6 sm:p-8 flex flex-col flex-1">
                        {!isAvailable && (
                          <span className="inline-block self-start text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                            BIENTÔT DISPONIBLE
                          </span>
                        )}

                        <h3 className={`text-xl font-black text-slate-900 mb-1 transition-colors ${isAvailable ? 'group-hover:text-[#009688]' : ''}`}>
                          {item.name}
                        </h3>
                        <p className="text-slate-500 text-xs sm:text-sm mb-6">{item.desc}</p>

                        <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-400 mb-6 flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{stats.subjectsCount} matière{stats.subjectsCount > 1 ? 's' : ''}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>{stats.totalChapters} chapitre{stats.totalChapters > 1 ? 's' : ''}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Play className="w-3.5 h-3.5 text-[#009688]" />
                            <span>{stats.totalLessons} leçon{stats.totalLessons > 1 ? 's' : ''}</span>
                          </span>
                        </div>

                        <div className="mt-auto">
                          {isAvailable ? (
                            <Link
                              to={`/courses?level=${encodeURIComponent(item.id)}`}
                              className="w-full py-3 px-4 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md cursor-pointer"
                            >
                              <span>Accéder au programme</span>
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                            </Link>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="w-full py-3 px-4 rounded-xl bg-slate-200 text-slate-400 text-xs font-bold cursor-not-allowed text-center select-none pointer-events-none transition-none"
                            >
                              Bientôt disponible
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. NOS MATIÈRES TENDANCES (Vidéo 00:05 - 00:07) */}
      {/* ========================================================================= */}
      <section id="trending" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <Reveal className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Nos matières tendances
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Les matières les plus suivies par les élèves de l'académie cette année.
            </p>
          </div>
          <Link
            to="/courses"
            className="text-xs sm:text-sm font-bold text-[#009688] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Tout afficher</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Reveal>

        {loading ? (
          <CourseSkeletonRow />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(trendingCourses.length > 0 ? trendingCourses : courses.slice(0, 4)).map((course, idx) => (
              <Reveal key={`trending-${course._id}`} delay={idx * 0.08}>
                <CourseCard course={course} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 4. DÉCOUVREZ LES CHIFFRES DES ÉLÈVES (Vidéo 00:08) */}
      {/* ========================================================================= */}
      <section ref={statsRef} className="py-20 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-900 mb-12">
              Découvrez les chiffres des élèves ayant suivi nos matières
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Reveal delay={0}>
              <StatCard
                icon={Users}
                target={platformStats.studentsCount || 494}
                suffix="+"
                label="Élèves inscrits"
                start={statsVisible}
              />
            </Reveal>
            <Reveal delay={0.1}>
              <StatCard
                icon={BookOpen}
                target={platformStats.coursesCount || 30}
                suffix="+"
                label="Matières & chapitres"
                start={statsVisible}
              />
            </Reveal>
            <Reveal delay={0.2}>
              <StatCard
                icon={GraduationCap}
                target={platformStats.modulesCount || 5}
                label="Programmes scientifiques complets"
                start={statsVisible}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. APPRENEZ PARTOUT, MÊME HORS LIGNE (Vidéo 00:09 - 00:11) */}
      {/* ========================================================================= */}
      {settings?.features?.enableAppInstall !== false && (
        <section id="install" className="py-20 bg-white border-y border-slate-100 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Colonne gauche : 4 atouts */}
            <Reveal className="lg:col-span-7 space-y-6">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#e7f7f4] text-[#00796b]">
                VOTRE ACADÉMIE DANS LA POCHE
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Apprenez partout, <br />
                même hors ligne
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                Emportez vos cours avec vous et transformez chaque moment en occasion de progresser.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                {INSTALL_FEATURES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-start gap-3.5 hover:border-[#009688]/30 hover:shadow-xs transition duration-200"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#f59e0b] flex items-center justify-center shrink-0 shadow-2xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{item.title}</h4>
                        <p className="text-slate-500 text-xs mt-0.5 leading-snug">{item.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleTriggerInstall('general')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold transition shadow-sm hover:scale-[1.02] cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Installer l'application sur cet appareil</span>
                </button>
              </div>
            </Reveal>

            {/* Colonne droite : Mockup téléphone réaliste exactement comme sur la vidéo */}
            <Reveal delay={0.15} className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 sm:w-72 aspect-[9/18] bg-slate-900 rounded-[44px] p-3 shadow-2xl ring-1 ring-slate-800">
                {/* Encoche haut */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-20" />

                {/* Écran intérieur */}
                <div className="w-full h-full bg-[#f8fafc] rounded-[36px] overflow-hidden flex flex-col pt-7 relative border border-slate-200">
                  {/* Header de l'app */}
                  <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#009688] flex items-center justify-center text-white text-[10px] font-bold">
                        AS
                      </div>
                      <span className="text-xs font-extrabold text-slate-800">Aliou Sow</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>

                  {/* Corps de l'écran mockup */}
                  <div className="p-3 space-y-3 flex-1 overflow-hidden text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      REPRISE RAPIDE
                    </span>

                    {/* Carte active "Continuez à apprendre" */}
                    <div className="p-3.5 bg-gradient-to-br from-[#009688] to-[#00796b] rounded-2xl text-white shadow-xs">
                      <div className="text-[10px] font-semibold text-teal-100">Continuez à apprendre</div>
                      <div className="text-xs font-black mt-1">Fonctions numériques</div>
                      <div className="text-[9px] text-teal-200 mt-0.5">Terminale S • Maths</div>

                      <div className="mt-3 flex items-center justify-between text-[9px] text-teal-100 font-bold">
                        <span>Progression</span>
                        <span>72%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mt-1">
                        <div className="w-[72%] h-full bg-[#f59e0b] rounded-full" />
                      </div>
                    </div>

                    {/* Mes matières */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-bold text-slate-700 block">Mes matières</span>

                      <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-xs font-bold">
                            M
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-slate-800">Mathématiques</div>
                            <div className="text-[9px] text-slate-400">12 chapitres</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#009688]">Ouvrir</span>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-bold">
                            PC
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-slate-800">Physique-Chimie</div>
                            <div className="text-[9px] text-slate-400">9 chapitres</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#009688]">Ouvrir</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bouton flottant Téléchargement vert en bas à gauche (Cliquable pour installer l'application) */}
                <button
                  type="button"
                  onClick={() => handleTriggerInstall('general')}
                  title="Télécharger et installer l'application"
                  aria-label="Télécharger et installer l'application"
                  style={{ animation: 'float 4s ease-in-out infinite' }}
                  className="absolute -bottom-3 -left-3 w-12 h-12 rounded-full bg-[#009688] hover:bg-[#00796b] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer z-30 focus:outline-none focus:ring-4 focus:ring-[#009688]/30"
                >
                  <Download className="w-5 h-5 animate-pulse" />
                </button>
              </div>
            </Reveal>
          </div>

          {/* 3 Étapes d'installation cliquables (Vidéo 00:11) */}
          <div className="mt-16 pt-12 border-t border-slate-100">
            <Reveal className="text-center max-w-xl mx-auto mb-10">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                Comment installer l'application ?
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm">
                Ajoutez Aliou Sow Academy à votre écran d'accueil en moins d'une minute.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {INSTALL_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const platformKey =
                  step.number === '01' ? 'chrome' : step.number === '02' ? 'safari' : 'android';
                return (
                  <Reveal key={step.number} delay={idx * 0.1}>
                    <button
                      type="button"
                      onClick={() => handleTriggerInstall(platformKey)}
                      className="w-full text-left group bg-[#f8fafc] hover:bg-white rounded-2xl p-6 border border-slate-100 hover:border-[#009688]/40 hover:shadow-lg transition-all duration-300 flex items-start justify-between h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#009688]/30"
                    >
                      <div className="space-y-1">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#009688] flex items-center justify-center mb-3 shadow-2xs group-hover:scale-110 group-hover:bg-[#009688] group-hover:text-white transition-all duration-200">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#009688] transition-colors flex items-center gap-1.5">
                          <span>{step.title}</span>
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#009688]" />
                        </h4>
                        <p className="text-slate-500 text-xs leading-relaxed">{step.text}</p>
                        <span className="inline-block pt-2 text-[11px] font-bold text-[#009688] group-hover:underline">
                          {platformKey === 'safari' ? 'Voir le guide iOS →' : 'Installer maintenant →'}
                        </span>
                      </div>

                      <span className="text-2xl font-black text-slate-300 group-hover:text-[#009688] transition-colors shrink-0">
                        {step.number}
                      </span>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      )}


      {/* ========================================================================= */}
      {/* 6. TROUVER LA MATIÈRE QUI VOUS CORRESPOND (Vidéo 00:12 - 00:15) */}
      {/* ========================================================================= */}
      <section id="catalogue" className="py-20 bg-white border-b border-slate-100 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Trouver la matière <br className="hidden sm:inline" />
              qui vous correspond
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Filtrez les cours selon votre niveau et vos objectifs.
            </p>
          </Reveal>

          {/* Barre des pilules de filtrage */}
          <Reveal delay={0.08} className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
            {/* Sélecteur de classe */}
            <div className="relative">
              <select
                value={activeClassFilter}
                onChange={(e) => setActiveClassFilter(e.target.value)}
                className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold pl-4 pr-8 py-2 rounded-full cursor-pointer transition focus:outline-none"
              >
                <option value="Toutes les classes">Toutes les classes</option>
                {(settings?.levels?.length
                  ? settings.levels
                  : [
                      { value: '4ème', label: '4ème' },
                      { value: '3ème', label: '3ème' },
                      { value: '2nde S', label: '2nde S' },
                      { value: '1ère S', label: '1ère S' },
                      { value: 'TS', label: 'Terminale S' },
                    ]
                ).map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label || lvl.value}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Pilules matières dynamiques */}
            {[
              'Toutes les matières',
              ...(settings?.subjects?.length
                ? settings.subjects
                : ['Mathématiques', 'Physique-Chimie']),
            ].map((sub) => {
              const active = activeSubject === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setActiveSubject(sub)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-[#009688] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {sub}
                </button>
              );
            })}

            {/* Pilule matières gratuites */}
            <button
              type="button"
              onClick={() => setOnlyFree((prev) => !prev)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                onlyFree
                  ? 'bg-[#009688] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Matières gratuites
            </button>
          </Reveal>

          {/* Grille des cartes de cours */}
          {loading ? (
            <CourseSkeletonRow />
          ) : filteredCourses.length === 0 ? (
            <div className="border border-dashed border-slate-300 rounded-2xl py-14 px-6 text-center max-w-lg mx-auto">
              <p className="text-slate-800 font-bold mb-1">Aucune matière ne correspond à ce filtre.</p>
              <p className="text-slate-500 text-xs mb-4">
                Essayez de réinitialiser vos critères de sélection.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveSubject('Toutes les matières');
                  setActiveClassFilter('Toutes les classes');
                  setOnlyFree(false);
                }}
                className="px-4 py-2 bg-[#009688] text-white text-xs font-bold rounded-lg hover:bg-[#00796b]"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleCourses.map((course, idx) => (
                <Reveal key={course._id} delay={(idx % 4) * 0.08}>
                  <CourseCard course={course} />
                </Reveal>
              ))}
            </div>
          )}

          {/* Bouton afficher plus */}
          {filteredCourses.length > COURSES_PREVIEW_COUNT && (
            <div className="text-center mt-12">
              <button
                type="button"
                onClick={() => setShowAllCourses((prev) => !prev)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 hover:border-[#009688] text-slate-700 hover:text-[#009688] font-bold text-xs transition cursor-pointer"
              >
                <span>{showAllCourses ? 'Voir moins de matières' : 'Voir toutes les matières'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAllCourses ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CE QUE DISENT NOS ÉLÈVES (Vidéo 00:16 - 00:17 & 00:29) */}
      {/* ========================================================================= */}
      {settings?.features?.enableReviews !== false && (
        <section className="py-20 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Reveal className="flex items-center justify-between mb-8">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#e7f7f4] text-[#00796b] mb-2">
                ILS NOUS FONT CONFIANCE
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Ce que disent nos élèves
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevTestimonial}
                aria-label="Témoignage précédent"
                className="w-10 h-10 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition shadow-xs cursor-pointer hover:border-[#009688]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextTestimonial}
                aria-label="Témoignage suivant"
                className="w-10 h-10 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition shadow-xs cursor-pointer hover:border-[#009688]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </Reveal>

          {/* Carte de témoignage avec animation Reveal */}
          <Reveal delay={0.1}>
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-[0_4px_30px_rgba(15,23,42,0.06)] border border-slate-100 relative min-h-[220px] flex flex-col justify-between transition-all duration-300">
              <span className="text-5xl font-serif text-[#009688] leading-none mb-4 select-none opacity-80">
                “
              </span>

              <p className="text-slate-700 text-base sm:text-lg font-medium leading-relaxed mb-8 transition-opacity duration-200">
                "{dynamicTestimonials[activeTestimonial].quote}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#009688] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {dynamicTestimonials[activeTestimonial].initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {dynamicTestimonials[activeTestimonial].name}
                  </h4>
                  <p className="text-xs text-slate-400">{dynamicTestimonials[activeTestimonial].level}</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Indicateurs de pagination dots animés */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {dynamicTestimonials.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTestimonial(idx)}
                aria-label={`Aller au témoignage ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeTestimonial === idx ? 'w-8 bg-[#009688]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>
      </section>
      )}


      {/* ========================================================================= */}
      {/* 8. DÉVELOPPER DES COMPÉTENCES AVEC ALIOU SOW ACADEMY (Vidéo 00:18 - 00:19) */}
      {/* ========================================================================= */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Colonne gauche : Étapes 1 à 4 */}
            <Reveal className="lg:col-span-7 space-y-6">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#e7f7f4] text-[#00796b]">
                UN PARCOURS SIMPLE ET GUIDÉ
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Développer des compétences avec <br className="hidden sm:inline" />
                Aliou Sow Academy
              </h2>

              <div className="space-y-3 pt-2">
                {STEPS.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-[#f8fafc] border border-slate-100 hover:bg-white hover:border-[#009688]/30 hover:shadow-xs transition duration-200"
                  >
                    <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}</span>
                    <span className="w-6 h-6 rounded-full bg-[#009688] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">{step}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  to="/courses"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs sm:text-sm font-bold shadow-[0_10px_25px_-4px_rgba(245,158,11,0.35)] transition-all duration-200 hover:scale-[1.02]"
                >
                  <span>Explorer nos matières</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </Reveal>

            {/* Colonne droite : Illustration apprenant */}
            <Reveal delay={0.15} className="lg:col-span-5 flex justify-center">
              <div className="relative w-72 sm:w-80 aspect-square flex items-center justify-center">
                {/* Cercle vert pastel d'arrière-plan */}
                <div className="absolute inset-4 rounded-full bg-[#e7f7f4] -z-10" />

                {/* Badge flottant diplôme (gauche) */}
                <div
                  style={{ animation: 'float 4s ease-in-out infinite' }}
                  className="absolute top-1/3 left-2 w-11 h-11 rounded-full bg-[#009688] text-white flex items-center justify-center shadow-md"
                >
                  <GraduationCap className="w-5 h-5" />
                </div>

                {/* Badge flottant note A+ (droite) */}
                <div
                  style={{ animation: 'float 4s ease-in-out infinite 1s' }}
                  className="absolute top-16 right-4 px-3 py-1.5 rounded-xl bg-[#f59e0b] text-white font-black text-xs shadow-md"
                >
                  A+
                </div>

                {/* Illustration élève lisant un livre */}
                <div className="relative flex flex-col items-center">
                  <div className="w-20 h-24 rounded-full bg-[#8d5b4c] mb-1 shadow-inner" />
                  <div className="w-36 h-24 rounded-t-full bg-[#009688] relative flex justify-center">
                    <div className="w-10 h-4 bg-white/20 rounded-b-md" />
                  </div>
                  <div className="w-44 h-16 bg-white border-2 border-amber-300 rounded-lg shadow-md flex divide-x-2 divide-amber-200 -mt-6 z-10">
                    <div className="flex-1 p-2 space-y-1">
                      <div className="h-1 bg-slate-200 rounded w-full" />
                      <div className="h-1 bg-slate-200 rounded w-3/4" />
                    </div>
                    <div className="flex-1 p-2 space-y-1">
                      <div className="h-1 bg-slate-200 rounded w-full" />
                      <div className="h-1 bg-slate-200 rounded w-2/3" />
                    </div>
                  </div>
                  <div className="w-64 h-4 bg-[#c28e57] rounded-full mt-2 shadow-sm" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 8.5 SERVICES & RESSOURCES COMPLÉMENTAIRES (DYNAMIQUES SANS CODE) */}
      {/* ========================================================================= */}
      {Array.isArray(settings?.extraLinks) &&
        settings.extraLinks.filter((item) => item && item.active !== false).length > 0 && (
          <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
            <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-teal-50 text-[#00796b] mb-2">
                  SERVICES &amp; RESSOURCES
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Services &amp; Ressources recommandés
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Accédez aux outils complémentaires, annales et groupes d'entraide proposés par M. Aliou Sow.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {settings.extraLinks
                .filter((item) => item && item.active !== false)
                .map((link, idx) => {
                  const isExternal =
                    link.url?.startsWith('http://') || link.url?.startsWith('https://');
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#009688]/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#009688]/10 text-[#00796b] px-2.5 py-1 rounded-full">
                            {link.badge || 'Nouveau'}
                          </span>
                          {isExternal ? (
                            <ExternalLink className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{link.title}</h3>
                        {link.description && (
                          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                            {link.description}
                          </p>
                        )}
                      </div>
                      <div className="pt-5 mt-4 border-t border-slate-100">
                        {isExternal ? (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#009688] hover:text-[#00796b]"
                          >
                            <span>Accéder à la ressource</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <Link
                            to={link.url}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#009688] hover:text-[#00796b]"
                          >
                            <span>Consulter</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </section>
        )}

      {/* 9. BANDEAU CTA VERT (Vidéo 00:20) */}
      {/* ========================================================================= */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="relative rounded-3xl bg-gradient-to-r from-[#009688] to-[#00796b] p-8 sm:p-14 text-white overflow-hidden shadow-[0_20px_50px_rgba(0,150,136,0.22)]">
            <div className="absolute right-10 -bottom-10 opacity-10 pointer-events-none">
              <GraduationCap className="w-72 h-72 text-white" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-xl space-y-2">
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
                  Commençons avec <br className="hidden sm:inline" />
                  Aliou Sow Academy
                </h2>
                <p className="text-teal-100 text-xs sm:text-sm">
                  Votre réussite scientifique commence aujourd'hui. Apprenez mieux, progressez avec méthode.
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  to="/courses"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 text-xs sm:text-sm font-bold shadow-md transition-all duration-200 hover:scale-[1.02]"
                >
                  <span>Découvrez nos matières</span>
                  <ArrowRight className="w-4 h-4 text-[#009688] group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ========================================================================= */}
      {/* 10. QUESTIONS FRÉQUENTES / FAQ (Vidéo 00:21 - 00:26) */}
      {/* ========================================================================= */}
      <section id="faq" className="py-20 bg-white border-t border-slate-100 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Colonne gauche : Titre & boîte d'aide */}
            <Reveal className="lg:col-span-5 space-y-6">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#e7f7f4] text-[#00796b]">
                BESOIN D'AIDE ?
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Questions <br />
                fréquentes
              </h2>

              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                Retrouvez les réponses aux questions les plus posées par nos élèves et leurs parents.
              </p>

              {/* Boîte d'assistance contact */}
              <div className="p-6 rounded-2xl bg-[#e7f7f4]/60 border border-[#009688]/20 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#009688] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Une autre question ?</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Notre équipe vous répond rapidement.</p>
                  <a
                    href="mailto:sowaliou2504@gmail.com"
                    onClick={() => {
                      window.open(
                        'https://mail.google.com/mail/?view=cm&fs=1&to=sowaliou2504@gmail.com',
                        '_blank',
                        'noopener,noreferrer'
                      );
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#009688] hover:underline mt-2.5 cursor-pointer"
                  >
                    <span>Nous contacter</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Colonne droite : Accordéon FAQ interactif */}
            <div className="lg:col-span-7 space-y-3.5">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <Reveal key={index} delay={index * 0.06}>
                    <div className="border border-slate-100 rounded-2xl bg-[#f8fafc] overflow-hidden transition-all duration-300">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                        className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:text-[#009688] transition cursor-pointer"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                            isOpen ? 'rotate-180 text-[#009688]' : ''
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/60 pt-3">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODALE INTERACTIVE D'INSTALLATION DE L'APPLICATION */}
      {/* ========================================================================= */}
      {installModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setInstallModal(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermer */}
            <button
              type="button"
              onClick={() => setInstallModal(null)}
              aria-label="Fermer"
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* En-tête */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#009688] text-white flex items-center justify-center shadow-md shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  Installer l'application
                </h3>
                <p className="text-xs text-slate-500">
                  Aliou Sow Academy sur votre écran d'accueil
                </p>
              </div>
            </div>

            {/* Onglets des plateformes */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl mb-6 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setInstallModal('chrome')}
                className={`py-2 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  installModal === 'chrome' || installModal === 'general'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-[#009688]" />
                <span className="truncate">Chrome / PC</span>
              </button>
              <button
                type="button"
                onClick={() => setInstallModal('safari')}
                className={`py-2 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  installModal === 'safari'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-blue-500" />
                <span className="truncate">iPhone / iPad</span>
              </button>
              <button
                type="button"
                onClick={() => setInstallModal('android')}
                className={`py-2 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  installModal === 'android'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate">Android</span>
              </button>
            </div>

            {/* Contenu spécifique par plateforme */}
            {(installModal === 'chrome' || installModal === 'general') && (
              <div className="space-y-3.5 text-xs sm:text-sm text-slate-600">
                <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#009688] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <span className="font-bold text-slate-800">Dans la barre d'adresse</span> (en haut à droite), repérez l'icône d'installation <strong>⊕</strong> ou cliquez sur le menu <strong>⋮</strong> (trois points).
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#009688] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    Cliquez sur <strong>« Installer Aliou Sow Academy »</strong>.
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#009688] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    L'application s'ouvre directement comme une vraie application de bureau, accessible sans navigateur !
                  </div>
                </div>
              </div>
            )}

            {installModal === 'safari' && (
              <div className="space-y-3.5 text-xs sm:text-sm text-slate-600">
                <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    Ouvrez le site dans le navigateur <strong>Safari</strong> sur votre iPhone ou iPad.
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    En bas de l'écran, appuyez sur le bouton <strong>Partager</strong> (le carré avec la flèche vers le haut ⎋).
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    Faites défiler vers le bas et sélectionnez <strong>« Sur l'écran d'accueil »</strong> (icône ➕).
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    4
                  </span>
                  <div>
                    Appuyez sur <strong>« Ajouter »</strong> en haut à droite. L'application est maintenant sur votre écran d'accueil !
                  </div>
                </div>
              </div>
            )}

            {installModal === 'android' && (
              <div className="space-y-3.5 text-xs sm:text-sm text-slate-600">
                <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    Dans Chrome sur votre smartphone Android, appuyez sur le menu <strong>⋮</strong> (trois points en haut à droite).
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    Appuyez sur <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    Validez en appuyant sur <strong>« Installer »</strong>. L'application apparaîtra avec vos autres applications !
                  </div>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              {installPrompt && (
                <button
                  type="button"
                  onClick={() => {
                    installPrompt.prompt();
                    setInstallModal(null);
                  }}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Installer directement</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setInstallModal(null)}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition cursor-pointer text-center"
              >
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
