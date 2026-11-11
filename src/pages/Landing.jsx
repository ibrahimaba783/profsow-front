import React, { useEffect, useState, useRef, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import {
  ChevronRight,
  ChevronDown,
  Calculator,
  Atom,
  Quote,
  Users,
  BookOpen,
  GraduationCap,
  Clock,
  Smartphone,
  Check,
  Zap,
  WifiOff,
  Bell,
} from 'lucide-react';
import logoFull from '../assets/logo-aliou-sow-academy-hero.png';
import profPhoto from '../assets/prof-aliou-sow.jpg';

// --- Matières et niveaux (valeurs identiques à celles du modèle Course) ---
const SUBJECTS = ['Mathématiques', 'Physique-Chimie'];
const LEVELS = [
  { value: '4ème', label: '4ème' },
  { value: '3ème', label: '3ème' },
  { value: '2nde S', label: '2nde S' },
  { value: '1ère S', label: '1ère S' },
  { value: 'TS', label: 'Terminale S' },
];

// Dans la base, la Terminale S est enregistrée sous la valeur "TS"
const formatLevel = (level) => (level === 'TS' ? 'Terminale S' : level);
const getInitials = (name) =>
  (name || 'Aliou Sow')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

// Nombre de cours affichés avant de cliquer sur "Tout afficher"
const COURSES_PREVIEW_COUNT = 8;

// --- Contenu des modules proposés (uniquement Maths & Physique-Chimie) ---
const MODULES = [
  {
    key: 'Mathématiques',
    icon: Calculator,
    title: 'Mathématiques',
    description:
      "Algèbre, analyse, géométrie et probabilités du collège à la Terminale S. Des cours structurés par chapitres, avec exercices et corrigés détaillés.",
    banner: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
  },
  {
    key: 'Physique-Chimie',
    icon: Atom,
    title: 'Physique-Chimie',
    description:
      "Mécanique, électricité, chimie organique et thermodynamique. Comprenez les phénomènes physiques à travers des cours clairs, appliqués et illustrés.",
    banner: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  },
];

// --- Section "Apprenez partout, même hors ligne" ---
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
    text: "Cliquez sur \"Installer\" dans la barre d'adresse ou utilisez le bouton ci-dessus",
  },
  {
    emoji: '🍎',
    title: 'Safari (iOS)',
    text: "Appuyez sur le bouton Partager puis \"Sur l'écran d'accueil\"",
  },
  {
    emoji: '🤖',
    title: 'Android',
    text: "Appuyez sur \"Ajouter à l'écran d'accueil\" dans le menu du navigateur",
  },
];

// --- Étapes (section "Développer vos compétences") ---
const STEPS = [
  "S'inscrire",
  'Choisir un module',
  'Suivre les cours en vidéo et en direct',
  'Tester vos connaissances avec les quiz',
];

// --- Témoignages (contenu à personnaliser avec de vrais retours d'élèves) ---
const TESTIMONIALS = [
  {
    name: 'Fatou Diagne',
    level: 'Terminale S',
    quote:
      "Grâce aux cours de M. Sow, j'ai enfin compris les limites et les suites. Les quiz m'ont permis de vérifier mes acquis avant le bac.",
  },
  {
    name: 'Moussa Ka',
    level: '1ère S',
    quote:
      "Les séances en direct sur Meet sont un vrai plus. Je pose mes questions et j'ai une réponse immédiate, comme en classe.",
  },
  {
    name: 'Aïssatou Sarr',
    level: '3ème',
    quote:
      "Les fiches PDF sont hyper claires. J'ai pu préparer mon BFEM sereinement grâce aux exercices corrigés.",
  },
];

// --- FAQ ---
const FAQS = [
  {
    question: 'Comment fonctionne Aliou Sow Academy ?',
    answer:
      "Inscris-toi, choisis un module (Mathématiques ou Physique-Chimie), avance chapitre par chapitre avec les vidéos et fiches PDF, puis teste tes acquis avec les quiz. Des sessions en direct sur Google Meet complètent chaque module.",
  },
  {
    question: 'Les cours suivent-ils le programme officiel sénégalais ?',
    answer:
      "Oui, les cours sont conçus par M. Aliou Sow en suivant le programme du collège et du lycée, en vue du BFEM et du Baccalauréat.",
  },
  {
    question: 'Puis-je accéder aux cours sur mobile ?',
    answer:
      "Oui, la plateforme est accessible depuis n'importe quel navigateur, sur ordinateur comme sur smartphone.",
  },
  {
    question: 'Comment poser une question si je suis bloqué(e) ?',
    answer:
      "Tu peux poser tes questions pendant les séances en direct sur Google Meet, ou contacter M. Aliou Sow directement.",
  },
];

// --- Hook de compteur animé, démarre uniquement quand `start` devient vrai ---
const useCountUp = (target, start, duration = 1500) => {
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

const StatCard = ({ icon: Icon, target, label, start }) => {
  const value = useCountUp(target, start);
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center">
      <Icon className="w-12 h-12 mx-auto mb-4 text-[#d6a74a]" strokeWidth={1.5} />
      <div className="text-3xl md:text-4xl font-extrabold text-slate-900">{value}</div>
      <p className="text-slate-600 mt-2">{label}</p>
    </div>
  );
};

// Carte de cours (style Bakeli) : image, matière + niveau, titre, durée, sections, professeur.
// Aucun prix n'est affiché sur la page d'accueil.
const CourseCardItem = ({ course }) => {
  const teacherName = course.teacher?.name || 'Aliou Sow';
  const sectionsCount = course.chaptersCount ?? course.chapters?.length ?? 0;

  return (
    <Link
      to={`/courses/${course._id}`}
      className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 transition"
    >
      <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>

      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold bg-blue-50 text-blue-600 rounded-full px-2.5 py-0.5 truncate">
            {course.subject}
          </span>
          <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5 shrink-0">
            {formatLevel(course.level)}
          </span>
        </div>

        <h3 className="text-[15px] font-bold text-slate-900 leading-snug line-clamp-3 min-h-[3.9rem]">
          {course.title}
        </h3>

        <div className="flex items-center gap-4 mt-4 text-xs text-slate-500 min-h-[1.25rem]">
          {course.duration && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-red-400" />
              {course.duration}
            </span>
          )}
          {sectionsCount > 0 && (
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              {sectionsCount} section{sectionsCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4">
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 rounded bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                {getInitials(teacherName)}
              </span>
              <span className="text-xs text-slate-700 truncate">{teacherName}</span>
            </span>
            <span className="text-xs font-bold text-[#2f4fd8] flex items-center gap-0.5 shrink-0 group-hover:underline">
              Voir le cours <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Squelette affiché pendant le chargement des cours
const CourseSkeletonRow = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="rounded-xl border border-slate-200 overflow-hidden animate-pulse">
        <div className="aspect-[16/10] bg-slate-100"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-slate-100 rounded w-5/6"></div>
          <div className="h-3 bg-slate-100 rounded w-1/2"></div>
          <div className="h-5 bg-slate-100 rounded w-1/3"></div>
        </div>
      </div>
    ))}
  </div>
);

const Landing = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState('Tous');
  const [activeLevel, setActiveLevel] = useState('Tous');
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [platformStats, setPlatformStats] = useState({ studentsCount: 0, coursesCount: 0, modulesCount: 0 });
  const [openFaq, setOpenFaq] = useState(0);
  const [installPrompt, setInstallPrompt] = useState(null);
  const statsRef = useRef(null);
  const location = useLocation();

  const isLoggedIn = !authLoading && !!user;
  const firstName = user?.name ? user.name.trim().split(' ')[0] : '';
  const dashboardPath = user?.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';

  // Filtres éventuels transmis par le footer (matière / niveau) + défilement vers la section du hash
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

  // Chargement des cours depuis l'API (tous modules confondus, filtrage côté client)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api('/courses');
        setCourses(data);
      } catch (err) {
        console.error('Erreur de chargement des cours :', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Chargement des statistiques RÉELLES de la plateforme (calculées côté backend, aucune valeur inventée)
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

  // Déclenche les compteurs animés dès que la section stats entre dans l'écran
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Récupère l'invite d'installation du navigateur (bouton "Installer l'application")
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

  const goToModule = (subjectKey) => {
    setActiveSubject(subjectKey);
    setActiveLevel('Tous');
    document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetFilters = () => {
    setActiveSubject('Tous');
    setActiveLevel('Tous');
  };

  const filteredCourses = courses.filter(
    (c) =>
      (activeSubject === 'Tous' || c.subject === activeSubject) &&
      (activeLevel === 'Tous' || c.level === activeLevel)
  );

  const visibleCourses = showAllCourses ? filteredCourses : filteredCourses.slice(0, COURSES_PREVIEW_COUNT);
  const canToggleCourses = filteredCourses.length > COURSES_PREVIEW_COUNT;

  return (
    <div className="min-h-screen bg-white pt-16 text-slate-900 flex flex-col items-center">
      {/* Bannière d'accueil : texte à gauche, photo du professeur avec formes colorées à droite */}
      <header className="w-full bg-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-8 items-center">
          {/* Texte */}
          <div>
            <div className="w-16 h-1.5 rounded-full bg-[#d6a74a] mb-6"></div>

            {isLoggedIn ? (
              <>
                <h1 className="font-black uppercase tracking-tight leading-[1.05] text-[#0b1f49] text-4xl sm:text-5xl mb-6">
                  Ravi de vous retrouver{firstName ? ', ' : ' !'}
                  {firstName && <span className="text-[#2f4fd8]">{firstName} !</span>}
                </h1>
                <p className="text-slate-600 text-lg leading-relaxed max-w-xl mb-8">
                  Reprenez là où vous vous êtes arrêté ou découvrez de nouveaux cours de Mathématiques et de
                  Physique-Chimie avec M. Aliou Sow.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Link
                    to={dashboardPath}
                    className="text-center border-2 border-[#0b1f49] bg-[#0b1f49] text-white hover:bg-white hover:text-[#0b1f49] font-bold px-8 py-3.5 rounded-lg transition"
                  >
                    Aller à mon espace
                  </Link>
                  <a
                    href="#courses"
                    className="text-center text-[#0b1f49] hover:text-[#2f4fd8] font-bold px-2 py-3.5 transition"
                  >
                    Découvrir les cours &rarr;
                  </a>
                </div>
              </>
            ) : (
              <>
                <h1 className="font-black uppercase tracking-tight leading-[1.05] text-[#0b1f49] text-4xl sm:text-5xl mb-6">
                  Maîtrisez les <span className="text-[#2f4fd8]">Mathématiques</span> &amp; la{' '}
                  <span className="text-[#b8862b]">Physique-Chimie</span>
                </h1>
                <p className="text-slate-600 text-lg leading-relaxed max-w-xl mb-8">
                  Accédez à des cours vidéo, des documents PDF, des quiz interactifs et des séances en direct avec
                  M. Aliou Sow. Du collège à la Terminale S, avancez à votre rythme et préparez sereinement le
                  BFEM et le Baccalauréat.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Link
                    to="/register"
                    className="text-center border-2 border-[#0b1f49] text-[#0b1f49] hover:bg-[#0b1f49] hover:text-white font-bold px-8 py-3.5 rounded-lg transition"
                  >
                    Inscrivez-vous dès maintenant !
                  </Link>
                  <a
                    href="#courses"
                    className="text-center text-[#0b1f49] hover:text-[#2f4fd8] font-bold px-2 py-3.5 transition"
                  >
                    Découvrir les cours &rarr;
                  </a>
                </div>
              </>
            )}
          </div>

          {/* Photo du professeur + formes décoratives */}
          <div className="flex justify-center lg:justify-end lg:pr-6">
            <div className="relative w-[280px] sm:w-[340px] lg:w-[380px]">
              {/* Formes en arrière-plan */}
              <div className="absolute -top-8 -left-10 w-3/5 h-3/5 rounded-[58%_42%_52%_48%/45%_55%_45%_55%] bg-gradient-to-b from-[#f6d58a] to-[#d6a74a] -rotate-12"></div>
              <div className="absolute -bottom-8 -right-8 w-3/5 h-3/5 rounded-[45%_55%_40%_60%/55%_45%_55%_45%] bg-gradient-to-b from-[#2f4fd8] to-[#0b1f49] rotate-6"></div>
              <div className="absolute bottom-16 -left-12 w-24 h-24 rounded-full bg-[#efe6d3]"></div>
              <div className="absolute -top-5 right-10 w-10 h-10 rounded-full bg-gradient-to-b from-[#d6a74a] to-[#2f4fd8]"></div>
              <div className="absolute top-1/3 -right-10 w-16 h-8 rounded-[0_100%_0_100%] bg-gradient-to-r from-[#d6a74a] to-[#2f4fd8] -rotate-[25deg]"></div>
              <div className="absolute bottom-6 right-1/4 w-4 h-4 rounded-full bg-[#d6a74a]"></div>

              {/* Photo */}
              <div className="relative z-10 aspect-[4/5] overflow-hidden border-4 border-white shadow-2xl rounded-tl-[110px] rounded-br-[110px] rounded-tr-[28px] rounded-bl-[28px] bg-slate-100">
                <img
                  src={profPhoto}
                  alt="M. Aliou Sow, professeur de Mathématiques et de Physique-Chimie"
                  className="w-full h-full object-cover object-[50%_8%]"
                />
              </div>

              {/* Carte d'identification */}
              <div className="absolute z-20 -bottom-6 left-4 sm:-left-8 bg-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 max-w-[260px]">
                <span className="w-1.5 self-stretch rounded-full bg-[#d6a74a]"></span>
                <div className="leading-tight">
                  <p className="text-sm font-extrabold text-[#0b1f49]">M. Aliou Sow</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Professeur de Mathématiques &amp; Physique-Chimie</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Nos modules : titre à gauche, "Tout afficher" à droite, cartes compactes */}
      <section id="modules" className="w-full max-w-7xl px-4 sm:px-6 py-14 scroll-mt-20">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Nos Modules</h2>
            <p className="text-slate-500 mt-1">Deux matières clés pour réussir le BFEM et le Baccalauréat.</p>
          </div>
          <button
            onClick={() => goToModule('Tous')}
            className="text-[#2f4fd8] font-bold hover:underline shrink-0 cursor-pointer"
          >
            Tout afficher
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            const count = courses.filter((c) => c.subject === mod.key).length;
            return (
              <div
                key={mod.key}
                className="flex items-start gap-5 bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition"
              >
                <div className={`w-16 h-16 rounded-xl shrink-0 flex items-center justify-center ${mod.banner}`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900">{mod.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed line-clamp-3">{mod.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs font-semibold text-slate-500">
                      {loading ? '' : `${count} cours`}
                    </span>
                    <button
                      onClick={() => goToModule(mod.key)}
                      className="text-sm font-bold text-[#2f4fd8] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Voir les cours <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Nos cours : liste déroulante de niveau, pastilles de matières, "Tout afficher", cartes */}
      <section id="courses" className="w-full max-w-7xl px-4 sm:px-6 pb-14 scroll-mt-20">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Nos Cours</h2>
          <p className="text-slate-500 mt-1">Choisissez un niveau et une matière pour trouver votre cours.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative">
            <select
              value={activeLevel}
              onChange={(e) => setActiveLevel(e.target.value)}
              aria-label="Filtrer par niveau"
              className="appearance-none h-11 pl-5 pr-11 rounded-full border border-slate-400 bg-white text-sm font-semibold text-slate-800 outline-none focus:border-[#2f4fd8] cursor-pointer"
            >
              <option value="Tous">Tous les niveaux</option>
              {LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {['Tous', ...SUBJECTS].map((subject) => (
            <button
              key={subject}
              onClick={() => setActiveSubject(subject)}
              className={`h-10 px-4 rounded-full border text-sm font-semibold transition cursor-pointer ${
                activeSubject === subject
                  ? 'bg-[#0b1f49] border-[#0b1f49] text-white'
                  : 'bg-white border-slate-400 text-slate-700 hover:border-[#0b1f49]'
              }`}
            >
              {subject === 'Tous' ? 'Toutes les matières' : subject}
            </button>
          ))}

          {canToggleCourses && (
            <button
              onClick={() => setShowAllCourses((v) => !v)}
              className="ml-auto text-[#2f4fd8] font-bold hover:underline cursor-pointer"
            >
              {showAllCourses ? 'Réduire' : 'Tout afficher'}
            </button>
          )}
        </div>

        {loading ? (
          <CourseSkeletonRow />
        ) : courses.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl py-16 px-6 text-center">
            <p className="text-slate-700 font-semibold mb-1">Les premiers cours arrivent bientôt.</p>
            <p className="text-slate-400 text-sm">Revenez très prochainement sur Aliou Sow Academy.</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="border border-slate-200 rounded-xl py-16 px-6 text-center">
            <p className="text-slate-700 font-semibold mb-1">Aucun cours ne correspond à cette sélection.</p>
            <button
              onClick={resetFilters}
              className="mt-3 text-[#2f4fd8] hover:underline text-sm font-bold cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleCourses.map((course) => (
              <CourseCardItem key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Chiffres clés — valeurs RÉELLES calculées depuis la base de données */}
      <div className="w-full bg-slate-50">
        <section ref={statsRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-10 text-slate-900">
            Découvrez les chiffres des élèves ayant suivi nos cours
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard icon={Users} target={platformStats.studentsCount} label="Élèves inscrits" start={statsVisible} />
            <StatCard
              icon={BookOpen}
              target={platformStats.coursesCount}
              label="Cours disponibles"
              start={statsVisible}
            />
            <StatCard
              icon={GraduationCap}
              target={platformStats.modulesCount}
              label="Modules proposés"
              start={statsVisible}
            />
          </div>
        </section>
      </div>

      {/* Apprenez partout, même hors ligne */}
      <div className="w-full bg-white">
        <section id="install" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                Apprenez partout, même hors ligne
              </h2>
              <p className="text-slate-600 text-lg mt-4 leading-relaxed max-w-xl">
                Installez Aliou Sow Academy sur votre appareil pour une expérience optimale. Accédez à vos cours
                rapidement, même sans connexion internet.
              </p>

              <div className="mt-8 flex flex-col gap-5">
                {INSTALL_FEATURES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#b8862b] flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{item.title}</h3>
                        <p className="text-sm text-slate-500">{item.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {installPrompt && (
                <button
                  onClick={handleInstall}
                  className="mt-8 bg-[#0b1f49] hover:bg-[#2f4fd8] text-white font-bold px-6 py-3 rounded-lg transition cursor-pointer"
                >
                  Installer l'application
                </button>
              )}
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-lg mb-5">Comment installer ?</h3>
              <div className="space-y-4">
                {INSTALL_STEPS.map((step) => (
                  <div
                    key={step.title}
                    className="flex items-start gap-4 bg-slate-50 border border-slate-200 rounded-xl p-5"
                  >
                    <span className="text-2xl leading-none">{step.emoji}</span>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{step.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Ce que disent nos élèves */}
      <div className="w-full bg-slate-50">
        <section id="testimonials" className="max-w-6xl mx-auto px-4 sm:px-6 py-14 scroll-mt-20">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-8">Ce que disent nos élèves</h2>
          <div className="space-y-4">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8"
              >
                <Quote className="w-8 h-8 text-[#0b1f49] mb-3" />
                <blockquote className="text-slate-600 leading-relaxed">{t.quote}</blockquote>
                <figcaption className="flex items-center gap-4 mt-5">
                  <span className="w-12 h-12 rounded-full bg-[#0b1f49] text-white font-bold flex items-center justify-center shrink-0">
                    {getInitials(t.name)}
                  </span>
                  <span>
                    <span className="block text-sm font-bold uppercase text-slate-800">{t.name}</span>
                    <span className="block text-sm text-slate-500">Élève en {t.level}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>

      {/* Développer vos compétences */}
      <div className="w-full bg-white">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-3">
              Développer vos compétences avec Aliou Sow Academy
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-xl">
              Boostez vos résultats et révélez votre potentiel avec une plateforme claire, structurée et accessible.
            </p>
            <ul className="space-y-4 mb-8">
              {STEPS.map((step) => (
                <li key={step} className="flex items-center gap-3 font-semibold text-slate-800">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  {step}
                </li>
              ))}
            </ul>
            <a
              href="#courses"
              className="inline-flex items-center h-12 px-7 rounded-lg bg-[#0b1f49] hover:bg-[#2f4fd8] text-white font-bold transition"
            >
              Explorer nos cours
            </a>
          </div>
          <div className="flex justify-center">
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-indigo-50 to-amber-50 flex items-center justify-center p-8">
              <img src={logoFull} alt="Aliou Sow Academy" className="w-full h-auto" />
            </div>
          </div>
        </section>
      </div>

      {/* Bandeau d'appel à l'action */}
      <div className="w-full bg-gradient-to-r from-[#0b1f49] via-[#1d3a8a] to-[#273d8f] text-center">
        <section className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Commençons avec Aliou Sow Academy</h2>
          <p className="text-white/90 font-medium max-w-2xl mx-auto mb-8">
            Des cours clairs et structurés par M. Aliou Sow pour transformer vos difficultés en réussite au BFEM et au
            Baccalauréat.
          </p>
          <a
            href="#courses"
            className="inline-flex items-center h-12 px-8 rounded-lg border border-white text-white hover:bg-white hover:text-[#0b1f49] font-bold transition"
          >
            Découvrez nos cours
          </a>
        </section>
      </div>

      {/* Questions fréquentes */}
      <div className="w-full bg-slate-50">
        <section id="faq" className="max-w-7xl mx-auto px-4 sm:px-6 py-14 scroll-mt-20">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">Questions fréquentes</h2>
          <div className="flex flex-col divide-y divide-slate-200">
            {FAQS.map((faq, i) => (
              <div key={faq.question}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer"
                >
                  <span className="text-lg text-slate-800">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 shrink-0 transition-transform ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <p className="text-slate-500 pb-5 pr-8 leading-relaxed">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Landing;