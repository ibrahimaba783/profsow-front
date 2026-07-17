import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import {
  Video,
  FileText,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Calculator,
  Atom,
  Quote,
} from 'lucide-react';
import logoFull from '../assets/logo-aliou-sow-academy-hero.png';
import logoEmblem from '../assets/logo-aliou-sow-academy-navbar.png';

// --- Contenu des modules proposés (uniquement Maths & Physique-Chimie) ---
const MODULES = [
  {
    key: 'Mathématiques',
    icon: Calculator,
    title: 'Mathématiques',
    description:
      "Algèbre, analyse, géométrie et probabilités du collège à la Terminale S. Des cours structurés par chapitres, avec exercices et corrigés détaillés.",
    iconWrap: 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400',
    badge: 'text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full font-semibold',
  },
  {
    key: 'Physique-Chimie',
    icon: Atom,
    title: 'Physique-Chimie',
    description:
      "Mécanique, électricité, chimie organique et thermodynamique. Comprenez les phénomènes physiques à travers des cours clairs, appliqués et illustrés.",
    iconWrap: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400',
    badge: 'text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-full font-semibold',
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

const StatCounter = ({ target, suffix, label, start }) => {
  const value = useCountUp(target, start);
  return (
    <div>
      <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
        {value}
        {suffix}
      </div>
      <p className="text-slate-400 text-sm mt-2">{label}</p>
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
    <div className="min-h-screen gradient-bg pt-24 text-slate-100 flex flex-col items-center">
      {/* Hero Section */}
      <header className="w-full max-w-6xl px-6 py-12 md:py-20 text-center flex flex-col items-center relative">
        {/* Glow Effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-20 left-1/3 w-60 h-60 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Logo */}
        <img
          src={logoFull}
          alt="Aliou Sow Academy"
          className="h-40 md:h-56 w-auto -mt-16 mb-5 slide-in"
        />

        {/* Titre */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight max-w-4xl slide-in">
          Maîtrisez les{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Mathématiques
          </span>{' '}
          & la{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Physique-Chimie
          </span>
        </h1>

        {/* Description */}
        <p className="text-slate-300 text-lg md:text-xl max-w-3xl mb-10 leading-relaxed slide-in">
          Apprenez les <strong className="text-white">Mathématiques</strong> et la{' '}
          <strong className="text-white">Physique-Chimie</strong> grâce à des{' '}
          <span className="text-indigo-400 font-semibold">cours vidéo</span>, des{' '}
          <span className="text-purple-400 font-semibold">documents PDF</span>, des{' '}
          <span className="text-emerald-400 font-semibold">quiz interactifs</span> et des{' '}
          <span className="text-pink-400 font-semibold">séances en direct avec M. Aliou Sow</span>.
        </p>

        {/* Boutons */}
        <div className="flex flex-col sm:flex-row gap-4 slide-in">
          <Link
            to="/register"
            className="btn-neon text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-indigo-500/50 transition"
          >
            Commencer gratuitement
          </Link>

          <a
            href="#courses"
            className="glass hover:bg-white/5 border border-white/10 text-slate-200 font-semibold px-8 py-3.5 rounded-xl transition"
          >
            Découvrir les cours
          </a>
        </div>
      </header>

      {/* Feature Section */}
      <section className="w-full max-w-6xl px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center">
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-indigo-400 mb-6">
            <Video className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-2">Cours Vidéos & Directs</h3>
          <p className="text-slate-400 text-sm">
            Visionnez les cours structurés sur YouTube et rejoignez des lives interactifs sur Google Meet pour poser vos questions en direct.
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center">
          <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl text-purple-400 mb-6">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-2">Fiches & Devoirs PDF</h3>
          <p className="text-slate-400 text-sm">
            Téléchargez des fiches de résumé de cours, des séries d'exercices et des corrigés détaillés au format PDF hébergés de manière sécurisée.
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-2">Suivi & Évaluations</h3>
          <p className="text-slate-400 text-sm">
            Testez vos connaissances en temps réel via des QCM et quiz interactifs avec corrections automatiques fournies par M. Sow.
          </p>
        </div>
      </section>

      {/* Modules Section — équivalent des "domaines de formation" */}
      <section id="modules" className="w-full max-w-6xl px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Formez-vous aux matières clés du Bac & du BFEM !</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Choisissez votre module et progressez à votre rythme grâce à un accompagnement structuré par chapitres.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <div key={mod.key} className="glass-card p-8 rounded-2xl flex flex-col items-center text-center">
                <div className={`${mod.iconWrap} p-5 rounded-2xl mb-6`}>
                  <Icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-3">{mod.title}</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">{mod.description}</p>
                <button
                  onClick={() => goToModule(mod.key)}
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1 cursor-pointer"
                >
                  Voir les cours <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing / Information Card */}
      <section className="w-full max-w-3xl mx-6 my-4 glass-card p-8 md:p-12 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 to-slate-900/40 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-purple-500/10 rounded-full blur-[80px]"></div>
        <div>
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 mb-2">
            Abonnement Annuel Unique
          </h3>
          <p className="text-slate-400 text-sm max-w-md">
            Accès complet à toutes les leçons d'un module, aux visioconférences Google Meet et au chat de soutien pendant un an.
          </p>
        </div>
        <div className="text-center flex flex-col items-center md:items-end">
          <span className="text-4xl font-extrabold text-white tracking-tight">6 000 FCFA</span>
          <span className="text-indigo-400 text-sm font-medium mb-4">Par module & par an</span>
          <Link
            to="/register"
            className="btn-shiny px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold text-white shadow-md"
          >
            S'inscrire Maintenant
          </Link>
        </div>
      </section>

      {/* Stats Section — compteurs animés, chiffres RÉELS calculés depuis la base de données */}
      <section ref={statsRef} className="w-full max-w-5xl px-6 py-16">
        <div className="glass-card rounded-3xl px-8 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center border border-white/5">
          <StatCounter
            target={platformStats.studentsCount}
            suffix=""
            label="Élèves inscrits"
            start={statsVisible}
          />
          <StatCounter
            target={platformStats.coursesCount}
            suffix=""
            label="Cours disponibles"
            start={statsVisible}
          />
          <StatCounter
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
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Nos Modules Disponibles</h2>
            <p className="text-slate-400">Sélectionnez une matière pour explorer les cours structurés par chapitres.</p>
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
                  : 'glass border-white/10 text-slate-300 hover:bg-white/5'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="loader-spinner"></div>
          </div>
        ) : courses.length === 0 ? (
          /* Placeholders Premium en l'absence totale de données réelles en base */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition">
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800')` }}
              ></div>
              <div className="p-6">
                <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full font-semibold">
                  Mathématiques
                </span>
                <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full font-semibold ml-2">
                  TS (Terminales S)
                </span>
                <h3 className="text-xl font-bold mt-4 mb-2">Algèbre & Analyse Mathématique</h3>
                <p className="text-slate-400 text-sm line-clamp-2">
                  Limites de fonctions, suites numériques, fonctions exponentielles et logarithmes de Terminale S.
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="font-extrabold text-lg">6 000 FCFA</span>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1"
                  >
                    Accéder au cours <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition">
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800')` }}
              ></div>
              <div className="p-6">
                <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full font-semibold">
                  Physique-Chimie
                </span>
                <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full font-semibold ml-2">
                  1ère S
                </span>
                <h3 className="text-xl font-bold mt-4 mb-2">Mécanique & Cinématique du Point</h3>
                <p className="text-slate-400 text-sm line-clamp-2">
                  Lois de Newton, énergie mécanique, travail d'une force et mouvements rectilignes uniformes.
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="font-extrabold text-lg">6 000 FCFA</span>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1"
                  >
                    Accéder au cours <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition">
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=800')` }}
              ></div>
              <div className="p-6">
                <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full font-semibold">
                  Mathématiques
                </span>
                <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full font-semibold ml-2">
                  3ème
                </span>
                <h3 className="text-xl font-bold mt-4 mb-2">Théorème de Thalès & Trigonométrie</h3>
                <p className="text-slate-400 text-sm line-clamp-2">
                  Préparation complète aux épreuves de géométrie pour le brevet/BFEM.
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="font-extrabold text-lg">6 000 FCFA</span>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1"
                  >
                    Accéder au cours <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          /* Il existe de vrais cours, mais aucun ne correspond au filtre sélectionné */
          <div className="glass-card rounded-2xl py-16 px-6 text-center">
            <p className="text-slate-300 font-semibold mb-1">Aucun cours disponible pour le moment dans « {activeFilter} ».</p>
            <p className="text-slate-500 text-sm">Reviens bientôt ou choisis une autre matière.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div key={course._id} className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition">
                <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${course.image})` }}></div>
                <div className="p-6">
                  <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full font-semibold">
                    {course.subject}
                  </span>
                  <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full font-semibold ml-2">
                    {course.level}
                  </span>
                  <h3 className="text-xl font-bold mt-4 mb-2">{course.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2">{course.description}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="font-extrabold text-lg">{course.price} FCFA</span>
                    <Link
                      to={`/courses/${course._id}`}
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1"
                    >
                      Accéder au cours <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Témoignages */}
      <section id="testimonials" className="w-full max-w-4xl px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Nos élèves témoignent</h2>
          <p className="text-slate-400">Ce qu'ils disent de leur progression avec Aliou Sow Academy.</p>
        </div>

        <div className="glass-card rounded-2xl p-8 md:p-12 relative">
          <Quote className="w-10 h-10 text-indigo-500/30 mb-4" />
          <p className="text-lg md:text-xl text-slate-200 leading-relaxed mb-6 min-h-[96px]">
            {TESTIMONIALS[testimonialIndex].quote}
          </p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-bold">{TESTIMONIALS[testimonialIndex].name}</p>
              <p className="text-slate-400 text-sm">{TESTIMONIALS[testimonialIndex].level}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTestimonialIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
                aria-label="Témoignage précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTestimonialIndex((i) => (i + 1) % TESTIMONIALS.length)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
                aria-label="Témoignage suivant"
              >
                <ChevronRight className="w-4 h-4" />
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
                  i === testimonialIndex ? 'bg-indigo-400 w-6' : 'bg-white/20 w-2'
                }`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="w-full max-w-4xl px-6 py-16 text-center">
        <div className="glass-card rounded-3xl p-10 md:p-16 border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute -left-20 -top-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>
          <h2 className="text-2xl md:text-4xl font-extrabold mb-4">Prêt à booster tes résultats ?</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            Rejoins Aliou Sow Academy dès aujourd'hui et accède à tous les cours de Mathématiques et Physique-Chimie.
          </p>
          <Link
            to="/register"
            className="btn-neon inline-block text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-indigo-500/50 transition"
          >
            Je m'inscris maintenant
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 mt-auto py-10 text-center text-slate-500 text-sm glass flex flex-col items-center gap-3">
        <img src={logoEmblem} alt="Aliou Sow Academy" className="h-10 w-auto opacity-70" />
        <div className="flex gap-4 text-slate-400 text-xs mt-1">
          <span>Mathématiques</span>
          <span>•</span>
          <span>Physique-Chimie</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Aliou Sow Academy - Tous droits réservés.</p>
        <p className="text-xs mt-1 text-slate-600">Conçu pour la classe de M. Aliou Sow</p>
      </footer>
    </div>
  );
};

export default Landing;