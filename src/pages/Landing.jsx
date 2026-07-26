import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import {
  Video,
  FileText,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Calculator,
  Atom,
  Quote,
  Users,
  BookOpen,
  GraduationCap,
  Clock,
} from 'lucide-react';
import logoFull from '../assets/logo-aliou-sow-academy-hero.png';
import logoEmblem from '../assets/logo-aliou-sow-academy-navbar.png';

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

// --- Contenu des modules proposés (uniquement Maths & Physique-Chimie) ---
const MODULES = [
  {
    key: 'Mathématiques',
    icon: Calculator,
    title: 'Mathématiques',
    description:
      "Algèbre, analyse, géométrie et probabilités du collège à la Terminale S. Des cours structurés par chapitres, avec exercices et corrigés détaillés.",
    banner: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
    badge: 'text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full font-semibold',
  },
  {
    key: 'Physique-Chimie',
    icon: Atom,
    title: 'Physique-Chimie',
    description:
      "Mécanique, électricité, chimie organique et thermodynamique. Comprenez les phénomènes physiques à travers des cours clairs, appliqués et illustrés.",
    banner: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    badge: 'text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full font-semibold',
  },
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

const StatCard = ({ icon: Icon, target, suffix, label, start }) => {
  const value = useCountUp(target, start);
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-sm">
      <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
        <Icon className="w-7 h-7" />
      </div>
      <div className="text-3xl md:text-4xl font-extrabold text-slate-900">
        {value}
        {suffix}
      </div>
      <p className="text-slate-500 text-sm mt-2">{label}</p>
    </div>
  );
};

const Landing = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const [platformStats, setPlatformStats] = useState({ studentsCount: 0, coursesCount: 0, modulesCount: 0 });
  const [openFaq, setOpenFaq] = useState(0);
  const statsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Scrolle vers la section ciblée par le hash de l'URL (ex: venu du Navbar depuis une autre page)
  useEffect(() => {
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

  // Défilement automatique des témoignages
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const goToModule = (subjectKey) => {
    setActiveFilter(subjectKey);
    document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredCourses =
    activeFilter === 'Tous' ? courses : courses.filter((c) => c.subject === activeFilter);

  return (
    <div className="min-h-screen bg-white pt-24 text-slate-900 flex flex-col items-center">
      {/* Hero Section */}
      <header className="w-full bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6">
              Mathématiques &amp; Physique-Chimie
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-slate-900">
              Maîtrisez les <span className="text-indigo-600">Mathématiques</span> &amp; la{' '}
              <span className="text-emerald-600">Physique-Chimie</span>
            </h1>
            <p className="text-slate-600 text-lg mb-10 leading-relaxed">
              Apprenez les <strong className="text-slate-900">Mathématiques</strong> et la{' '}
              <strong className="text-slate-900">Physique-Chimie</strong> grâce à des{' '}
              <span className="text-indigo-600 font-semibold">cours vidéo</span>, des{' '}
              <span className="text-purple-600 font-semibold">documents PDF</span>, des{' '}
              <span className="text-emerald-600 font-semibold">quiz interactifs</span> et des{' '}
              <span className="text-pink-600 font-semibold">séances en direct avec M. Aliou Sow</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition text-center"
              >
                Commencer gratuitement
              </Link>
              <a
                href="#courses"
                className="border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 font-semibold px-8 py-3.5 rounded-xl transition text-center"
              >
                Découvrir les cours
              </a>
            </div>
          </div>

          <div className="relative flex justify-center items-center">
            <div className="absolute w-40 h-40 bg-indigo-200 rounded-full blur-2xl -top-4 -left-4 opacity-70"></div>
            <div className="absolute w-32 h-32 bg-purple-200 rounded-full blur-2xl bottom-0 right-2 opacity-70"></div>
            <div className="absolute w-14 h-14 bg-emerald-300 rounded-full top-6 right-10 opacity-70"></div>
            <img
              src={logoFull}
              alt="Aliou Sow Academy"
              className="relative z-10 w-56 md:w-80 drop-shadow-xl"
            />
          </div>
        </div>
      </header>

      {/* Feature Section */}
      <section className="w-full max-w-6xl px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-slate-100 shadow-sm p-8 rounded-2xl flex flex-col items-center text-center">
          <div className="bg-indigo-50 p-4 rounded-xl text-indigo-600 mb-6">
            <Video className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-2">Cours Vidéos &amp; Directs</h3>
          <p className="text-slate-500 text-sm">
            Visionnez les cours structurés sur YouTube et rejoignez des lives interactifs sur Google Meet pour poser vos questions en direct.
          </p>
        </div>

        <div className="bg-white border border-slate-100 shadow-sm p-8 rounded-2xl flex flex-col items-center text-center">
          <div className="bg-purple-50 p-4 rounded-xl text-purple-600 mb-6">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-2">Fiches &amp; Devoirs PDF</h3>
          <p className="text-slate-500 text-sm">
            Téléchargez des fiches de résumé de cours, des séries d'exercices et des corrigés détaillés au format PDF hébergés de manière sécurisée.
          </p>
        </div>

        <div className="bg-white border border-slate-100 shadow-sm p-8 rounded-2xl flex flex-col items-center text-center">
          <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600 mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-2">Suivi &amp; Évaluations</h3>
          <p className="text-slate-500 text-sm">
            Testez vos connaissances en temps réel via des QCM et quiz interactifs avec corrections automatiques fournies par M. Sow.
          </p>
        </div>
      </section>

      {/* Modules Section — équivalent des "modules tendance" de Bakeli */}
      <section id="modules" className="w-full max-w-6xl px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3 text-slate-900">
            Formez-vous aux matières clés du Bac &amp; du BFEM !
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Choisissez votre module et progressez à votre rythme grâce à un accompagnement structuré par chapitres.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.key}
                className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-lg transition"
              >
                <div className={`h-32 flex items-center justify-center ${mod.banner}`}>
                  <Icon className="w-12 h-12 text-white" />
                </div>
                <div className="p-8">
                  <span className={mod.badge}>{mod.key}</span>
                  <h3 className="text-xl font-bold mt-4 mb-3 text-slate-900">{mod.title}</h3>
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed">{mod.description}</p>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs text-slate-400 font-medium">M. Aliou Sow</span>
                    <button
                      onClick={() => goToModule(mod.key)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1 cursor-pointer"
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

      {/* Pricing / Information Card */}
      <section className="w-full max-w-3xl mx-6 my-4 p-8 md:p-12 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="text-2xl font-bold text-indigo-700 mb-2">Abonnement Annuel Unique</h3>
          <p className="text-slate-600 text-sm max-w-md">
            Accès complet à toutes les leçons d'un module, aux visioconférences Google Meet et au chat de soutien pendant un an.
          </p>
        </div>
        <div className="text-center flex flex-col items-center md:items-end">
          <span className="text-4xl font-extrabold text-slate-900 tracking-tight">6 000 FCFA</span>
          <span className="text-indigo-600 text-sm font-medium mb-4">Par module &amp; par an</span>
          <Link
            to="/register"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-bold text-white shadow-md"
          >
            S'inscrire Maintenant
          </Link>
        </div>
      </section>

      {/* Stats Section — chiffres RÉELS calculés depuis la base de données */}
      <section ref={statsRef} className="w-full max-w-5xl px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-10 text-slate-900">
          Découvrez les chiffres des élèves ayant suivi nos cours
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <StatCard
            icon={Users}
            target={platformStats.studentsCount}
            suffix=""
            label="Élèves inscrits"
            start={statsVisible}
          />
          <StatCard
            icon={BookOpen}
            target={platformStats.coursesCount}
            suffix=""
            label="Cours disponibles"
            start={statsVisible}
          />
          <StatCard
            icon={GraduationCap}
            target={platformStats.modulesCount}
            suffix=""
            label="Modules proposés"
            start={statsVisible}
          />
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="w-full max-w-6xl px-6 py-16">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2 text-slate-900">Nos Modules Disponibles</h2>
            <p className="text-slate-500">Sélectionnez une matière pour explorer les cours structurés par chapitres.</p>
          </div>
        </div>

        {/* Filtres par matière */}
        <div className="flex flex-wrap gap-3 mb-10">
          {['Tous', 'Mathématiques', 'Physique-Chimie'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition cursor-pointer ${
                activeFilter === filter
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : courses.length === 0 ? (
          /* Placeholders Premium en l'absence totale de données réelles en base */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              onClick={() => navigate('/login')}
              className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-lg hover:border-indigo-200 transition cursor-pointer"
            >
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800')` }}
              ></div>
              <div className="p-6">
                <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full font-semibold">
                  Mathématiques
                </span>
                <span className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-full font-semibold ml-2">
                  TS (Terminales S)
                </span>
                <h3 className="text-xl font-bold mt-4 mb-2 text-slate-900">Algèbre &amp; Analyse Mathématique</h3>
                <p className="text-slate-500 text-sm line-clamp-2">
                  Limites de fonctions, suites numériques, fonctions exponentielles et logarithmes de Terminale S.
                </p>
                <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">AS</span>
                    M. Aliou Sow
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    3 mois
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="font-extrabold text-lg text-slate-900">6 000 FCFA</span>
                  <span className="text-indigo-600 text-sm font-bold flex items-center gap-1">
                    Accéder au cours <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate('/login')}
              className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-lg hover:border-indigo-200 transition cursor-pointer"
            >
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800')` }}
              ></div>
              <div className="p-6">
                <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full font-semibold">
                  Physique-Chimie
                </span>
                <span className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-full font-semibold ml-2">
                  1ère S
                </span>
                <h3 className="text-xl font-bold mt-4 mb-2 text-slate-900">Mécanique &amp; Cinématique du Point</h3>
                <p className="text-slate-500 text-sm line-clamp-2">
                  Lois de Newton, énergie mécanique, travail d'une force et mouvements rectilignes uniformes.
                </p>
                <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">AS</span>
                    M. Aliou Sow
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    2 mois
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="font-extrabold text-lg text-slate-900">6 000 FCFA</span>
                  <span className="text-indigo-600 text-sm font-bold flex items-center gap-1">
                    Accéder au cours <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate('/login')}
              className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-lg hover:border-indigo-200 transition cursor-pointer"
            >
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=800')` }}
              ></div>
              <div className="p-6">
                <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full font-semibold">
                  Mathématiques
                </span>
                <span className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-full font-semibold ml-2">
                  3ème
                </span>
                <h3 className="text-xl font-bold mt-4 mb-2 text-slate-900">Théorème de Thalès &amp; Trigonométrie</h3>
                <p className="text-slate-500 text-sm line-clamp-2">
                  Préparation complète aux épreuves de géométrie pour le brevet/BFEM.
                </p>
                <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">AS</span>
                    M. Aliou Sow
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    1 mois
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="font-extrabold text-lg text-slate-900">6 000 FCFA</span>
                  <span className="text-indigo-600 text-sm font-bold flex items-center gap-1">
                    Accéder au cours <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          /* Il existe de vrais cours, mais aucun ne correspond au filtre sélectionné */
          <div className="bg-white border border-slate-100 rounded-2xl py-16 px-6 text-center">
            <p className="text-slate-700 font-semibold mb-1">Aucun cours disponible pour le moment dans « {activeFilter} ».</p>
            <p className="text-slate-400 text-sm">Reviens bientôt ou choisis une autre matière.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredCourses.map((course) => {
              // Filet de sécurité : un cours à 0 FCFA est considéré gratuit même si la case
              // "Cours gratuit" n'a pas été explicitement cochée à la création.
              const courseIsFree = course.isFree || course.price === 0;
              return (
                <Link
                  key={course._id}
                  to={`/courses/${course._id}`}
                  className="block bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-lg hover:border-indigo-200 transition relative"
                >
                  {courseIsFree && (
                    <span className="absolute top-3 right-3 z-10 text-xs bg-emerald-500 text-white px-3 py-1 rounded-full font-bold shadow-lg">
                      Gratuit
                    </span>
                  )}
                  <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${course.image})` }}></div>
                  <div className="p-6">
                    <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full font-semibold">
                      {course.subject}
                    </span>
                    <span className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-full font-semibold ml-2">
                      {course.level}
                    </span>
                    <h3 className="text-xl font-bold mt-4 mb-2 text-slate-900">{course.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
                      <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">AS</span>
                        M. Aliou Sow
                      </span>
                      {course.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {course.duration}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      {courseIsFree ? (
                        <span className="flex items-baseline gap-2">
                          <span className="font-extrabold text-lg text-emerald-600">Gratuit</span>
                          {course.originalPrice > 0 && (
                            <span className="text-xs text-slate-400 line-through">{course.originalPrice} FCFA</span>
                          )}
                        </span>
                      ) : (
                        <span className="font-extrabold text-lg text-slate-900">{course.price} FCFA</span>
                      )}
                      <span className="text-indigo-600 text-sm font-bold flex items-center gap-1">
                        Accéder au cours <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Témoignages */}
      <section id="testimonials" className="w-full max-w-4xl px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2 text-slate-900">Nos élèves témoignent</h2>
          <p className="text-slate-500">Ce qu'ils disent de leur progression avec Aliou Sow Academy.</p>
        </div>

        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-8 md:p-12 relative">
          <Quote className="w-10 h-10 text-indigo-100 mb-4" />
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed mb-6 min-h-[96px]">
            {TESTIMONIALS[testimonialIndex].quote}
          </p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-bold text-slate-900">{TESTIMONIALS[testimonialIndex].name}</p>
              <p className="text-slate-500 text-sm">{TESTIMONIALS[testimonialIndex].level}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTestimonialIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                aria-label="Témoignage précédent"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => setTestimonialIndex((i) => (i + 1) % TESTIMONIALS.length)}
                className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                aria-label="Témoignage suivant"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIndex(i)}
                aria-label={`Aller au témoignage ${i + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === testimonialIndex ? 'bg-indigo-600 w-6' : 'bg-slate-200 w-2'
                }`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="w-full max-w-4xl px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-10 text-slate-900">Questions fréquentes</h2>
        <div className="flex flex-col divide-y divide-slate-100 border-t border-b border-slate-100">
          {FAQS.map((faq, i) => (
            <div key={faq.question}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                className="w-full flex items-center justify-between py-5 text-left cursor-pointer"
              >
                <span className="font-semibold text-slate-800">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-indigo-600 flex-shrink-0 transition-transform ${
                    openFaq === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === i && (
                <p className="text-slate-500 text-sm pb-5 pr-8 leading-relaxed">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="w-full max-w-4xl px-6 py-16 text-center">
        <div className="rounded-3xl p-10 md:p-16 border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-4 text-slate-900">Prêt à booster tes résultats ?</h2>
          <p className="text-slate-600 max-w-xl mx-auto mb-8">
            Rejoins Aliou Sow Academy dès aujourd'hui et accède à tous les cours de Mathématiques et Physique-Chimie.
          </p>
          <Link
            to="/register"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition"
          >
            Je m'inscris maintenant
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-100 mt-auto bg-slate-50 pt-14 pb-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <img src={logoEmblem} alt="Aliou Sow Academy" className="h-10 w-auto mb-4" />
            <p className="text-slate-500 text-sm leading-relaxed">
              Aliou Sow Academy est une plateforme d'apprentissage en ligne dédiée aux Mathématiques et à la
              Physique-Chimie, conçue pour la classe de M. Aliou Sow.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Obtenir de l'aide</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#faq" className="hover:text-indigo-600">FAQ</a></li>
              <li><a href="#testimonials" className="hover:text-indigo-600">Témoignages</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Matières</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><button onClick={() => goToModule('Mathématiques')} className="hover:text-indigo-600 cursor-pointer">Mathématiques</button></li>
              <li><button onClick={() => goToModule('Physique-Chimie')} className="hover:text-indigo-600 cursor-pointer">Physique-Chimie</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Contactez-nous</h4>
            {/* Remplace ces coordonnées par les vraies informations de contact */}
            <p className="text-sm text-slate-500 mb-1">
              Tel:{' '}
              <a href="tel:+221771023399" className="hover:text-indigo-600">
                +221 77 102 33 99
              </a>
            </p>
            <p className="text-sm text-slate-500 mb-4">
              Mail:{' '}
              <a href="mailto:contact@aliousowacademy.com" className="hover:text-indigo-600">
                Sowaliou2504@gmail.com
              </a>
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-200 transition"
              >
                <FacebookIcon className="w-4 h-4 text-slate-600" />
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-200 transition"
              >
                <InstagramIcon className="w-4 h-4 text-slate-600" />
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-200 transition"
              >
                <YoutubeIcon className="w-4 h-4 text-slate-600" />
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 mt-10 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Aliou Sow Academy - Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default Landing;