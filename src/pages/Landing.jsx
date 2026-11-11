import React, { useEffect, useState, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import {
  ChevronDown,
  Clock,
  BookOpen,
  QrCode,
  Award,
  Sparkles,
  MessageCircle,
  Bell,
  Star,
  Users,
  Search,
  X,
} from 'lucide-react';
import profPhoto from '../assets/prof-aliou-sow.jpg';

const SUBJECTS = ['Mathématiques', 'Physique-Chimie'];
const LEVELS = [
  { value: 'Tous', label: 'Tous les niveaux' },
  { value: '4ème', label: '4ème' },
  { value: '3ème', label: '3ème (BFEM)' },
  { value: '2nde S', label: '2nde S' },
  { value: '1ère S', label: '1ère S' },
  { value: 'TS', label: 'Terminale S (BAC)' },
];

const formatLevel = (level) => (level === 'TS' ? 'Terminale S' : level);

const DEFAULT_COURSES = [
  {
    _id: 'default-maths-ts',
    title: 'Mathématiques Terminale S : Analyse, Fonctions & Suites Numériques',
    description:
      'Le socle incontournable pour viser la mention Très Bien au Baccalauréat sénégalais. Étude complète des fonctions, limites, continuités, dérivées, primitives et suites numériques avec annales corrigées.',
    subject: 'Mathématiques',
    level: 'TS',
    duration: '1 an',
    chapters: [{ lessons: [1, 2, 3, 4] }],
    price: 0,
    isFree: true,
    image:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800',
    teacher: { name: 'Aliou Sow', email: 'aliou@gmail.com' },
  },
  {
    _id: 'default-pc-ts',
    title: 'Physique-Chimie Terminale S : Mécanique Newtonienne & Cinématique',
    description:
      'Comprenez intuitivement les lois de Newton, les mouvements dans les champs uniformes et gravitationnels, et la dynamique des solides avec des vidéos animées et fiches de synthèse.',
    subject: 'Physique-Chimie',
    level: 'TS',
    duration: '1 an',
    chapters: [{ lessons: [1, 2, 3] }],
    price: 6000,
    isFree: false,
    image:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
    teacher: { name: 'Aliou Sow', email: 'aliou@gmail.com' },
  },
  {
    _id: 'default-maths-3eme',
    title: "Mathématiques 3ème (BFEM) : Géométrie dans l'Espace, Thalès & Pythagore",
    description:
      "Préparez votre épreuve de BFEM sans stress avec les théorèmes clés, la trigonométrie et des fiches d'entraînement progressives rédigées par M. Sow.",
    subject: 'Mathématiques',
    level: '3ème',
    duration: '6 mois',
    chapters: [{ lessons: [1, 2] }],
    price: 0,
    isFree: true,
    image:
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800',
    teacher: { name: 'Aliou Sow', email: 'aliou@gmail.com' },
  },
  {
    _id: 'default-pc-1ere',
    title: 'Physique-Chimie 1ère S : Électrostatique, Optique & Solutions Aqueuses',
    description:
      'Une préparation d’excellence pour aborder la classe de Terminale en toute confiance. Maîtrisez la calorimétrie, l’optique géométrique et la cinétique chimique.',
    subject: 'Physique-Chimie',
    level: '1ère S',
    duration: '1 an',
    chapters: [{ lessons: [1, 2, 3] }],
    price: 6000,
    isFree: false,
    image:
      'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=800',
    teacher: { name: 'Aliou Sow', email: 'aliou@gmail.com' },
  },
];

const getInitials = (name) =>
  (name || 'Aliou Sow')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

const Landing = () => {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();

  // Lecture du paramètre de recherche transmis par la barre de recherche du haut
  const searchQuery = searchParams.get('search') || '';

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('Tous');
  const [selectedLevel, setSelectedLevel] = useState('Tous');
  const [openFaq, setOpenFaq] = useState(0);

  // Configuration dynamique (gérée depuis le No-Code Hub)
  const [settings, setSettings] = useState({
    theme: 'bakeli',
    features: {
      enableLiveMeet: true,
      enableQuiz: true,
      enableForum: true,
      enablePdfDownload: true,
      enableWhatsAppButton: true,
      enableFreeEnrollment: true,
      enableOpenRegistration: true,
      showAnnouncementBanner: false,
    },
    announcement: {
      active: false,
      message: 'Bienvenue sur la plateforme officielle de M. Aliou Sow !',
      type: 'info',
      link: '',
      buttonText: 'En savoir plus',
    },
    channels: {
      whatsappNumber: '+221771023399',
    },
    faqs: [
      {
        question: 'Comment fonctionne Aliou Sow Academy ?',
        answer:
          "Inscrivez-vous en quelques secondes, choisissez vos modules de Mathématiques et de Physique-Chimie, et commencez vos cours à votre rythme avec nos vidéos explicatives, devoirs corrigés en PDF, quiz interactifs et séances en direct sur Google Meet.",
      },
      {
        question: 'Les cours sont-ils conformes au programme officiel sénégalais ?',
        answer:
          "Oui, tous les cours sont conçus par M. Aliou Sow en stricte conformité avec le programme national du Sénégal, spécialement axés sur les exigences des épreuves du BFEM et du Baccalauréat Scientifique.",
      },
      {
        question: 'Puis-je suivre les cours depuis mon téléphone ?',
        answer:
          "Oui, la plateforme est 100% optimisée pour tous les navigateurs de téléphones portables (Android et iPhone), sans téléchargement obligatoire d'application lourde.",
      },
      {
        question: 'Comment poser une question si je ne comprends pas une leçon ?',
        answer:
          "Vous pouvez poser vos questions lors des séances en direct sur Google Meet ou contacter M. Sow directement via le bouton WhatsApp de la plateforme.",
      },
    ],
    testimonials: [
      {
        name: 'Fatou Diagne',
        level: 'Terminale S',
        quote:
          "Grâce aux cours de M. Sow sur les suites numériques et la mécanique, j'ai eu 16/20 en maths au Bac !",
        rating: 5,
      },
      {
        name: 'Moussa Ka',
        level: '1ère S',
        quote:
          "Les séances en direct sur Google Meet sont très claires et m'ont redonné confiance en sciences.",
        rating: 5,
      },
      {
        name: 'Aïssatou Sarr',
        level: '3ème (Admise au BFEM)',
        quote:
          "Les fiches PDF et exercices types m'ont permis de décrocher mon brevet avec brio.",
        rating: 5,
      },
    ],
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Défilement automatique vers la section des cours si une recherche est lancée ou si l'ancre #courses est dans l'URL
  useEffect(() => {
    if (searchQuery || window.location.hash === '#courses') {
      const timer = setTimeout(() => {
        const el = document.getElementById('courses');
        if (el) {
          const yOffset = -90;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, loadingCourses]);

  const fetchInitialData = async () => {
    try {
      const [coursesData, settingsData] = await Promise.all([
        api('/courses').catch(() => []),
        api('/settings').catch(() => null),
      ]);
      if (Array.isArray(coursesData) && coursesData.length > 0) {
        setCourses(coursesData);
      } else {
        setCourses(DEFAULT_COURSES);
      }
      if (settingsData) {
        setSettings((prev) => ({
          ...prev,
          ...settingsData,
          faqs: settingsData.faqs?.length ? settingsData.faqs : prev.faqs,
          testimonials: settingsData.testimonials?.length ? settingsData.testimonials : prev.testimonials,
        }));
      }
    } catch (err) {
      console.error('Erreur chargement données', err);
      setCourses(DEFAULT_COURSES);
    } finally {
      setLoadingCourses(false);
    }
  };

  // Filtrage combiné : Matière + Niveau + Recherche par mot-clé du haut
  const filteredCourses = courses.filter((c) => {
    const matchSubject = selectedSubject === 'Tous' || c.subject === selectedSubject;
    const matchLevel = selectedLevel === 'Tous' || c.level === selectedLevel;

    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      (c.subject && c.subject.toLowerCase().includes(q)) ||
      (c.level && c.level.toLowerCase().includes(q)) ||
      (c.teacher?.name && c.teacher.name.toLowerCase().includes(q));

    return matchSubject && matchLevel && matchSearch;
  });

  const clearSearch = () => {
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased">
      {/* ============================================================== */}
      {/* BANNIÈRE FLASH D'ANNONCE */}
      {/* ============================================================== */}
      {settings.announcement?.active && (
        <div className="bg-[#00897b] text-white px-4 py-2.5 text-xs font-bold text-center fixed top-20 left-0 w-full z-40 shadow-sm flex items-center justify-center gap-3">
          <Bell className="w-4 h-4 animate-bounce shrink-0" />
          <span>{settings.announcement.message}</span>
          {settings.announcement.link && (
            <a
              href={settings.announcement.link}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-orange-200 ml-2"
            >
              {settings.announcement.buttonText || 'Rejoindre'} &rarr;
            </a>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. HERO SECTION (Fidèle à la Capture Bakeli Screenshot 3) */}
      {/* ============================================================== */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Texte Hero */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-[#111827] leading-[1.12] tracking-tight uppercase">
                APPRENEZ À VOTRE RYTHME ET BOOSTET VOS RÉSULTATS
              </h1>

              <p className="text-base text-slate-600 leading-relaxed max-w-xl font-normal">
                Avec notre plateforme d'apprentissage en ligne, accédez à des cours variés, conçus par des experts, et adaptés à vos besoins. Que vous soyez collégien ou lycéen (4ème à la Terminale S), avancez à votre propre rythme et développez des compétences scientifiques qui feront la différence dans votre carrière scolaire.
              </p>

              <div className="pt-2">
                {!user ? (
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border-2 border-[#ff9800] text-[#ff9800] hover:bg-[#ff9800] hover:text-white font-bold text-base transition-all duration-300 shadow-sm cursor-pointer"
                  >
                    Inscrivez-vous dès maintenant !
                  </Link>
                ) : (
                  <Link
                    to={user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'}
                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#00897b] hover:bg-[#00796b] text-white font-bold text-base transition-all shadow-md cursor-pointer"
                  >
                    Accéder à mon espace &rarr;
                  </Link>
                )}
              </div>
            </div>

            {/* Illustration Hero avec formes Bakeli */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="relative w-full max-w-sm sm:max-w-md">
                <div className="absolute -top-4 -right-4 w-60 h-60 bg-[#00897b]/15 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-6 -left-6 w-60 h-60 bg-[#ff9800]/20 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-tr from-[#00897b] to-emerald-400 opacity-90 hidden sm:block"></div>
                <div className="absolute bottom-10 -left-6 w-14 h-14 rounded-full bg-gradient-to-tr from-[#ff9800] to-amber-300 opacity-90 hidden sm:block"></div>

                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-50 z-10 aspect-[4/5]">
                  <img
                    src={profPhoto}
                    alt="M. Aliou Sow"
                    className="w-full h-full object-cover object-[50%_15%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-6">
                    <div className="text-white">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider bg-[#ff9800] px-3 py-1 rounded-full shadow">
                        Professeur d'Élite
                      </span>
                      <h3 className="text-xl font-black mt-2">M. Aliou Sow</h3>
                      <p className="text-xs text-slate-200">Mathématiques & Physique-Chimie (Sénégal)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. NOS MODULES TENDANCE (Destination officielle du clic "Nos modules") */}
      {/* ============================================================== */}
      <section id="courses" className="py-16 bg-[#fafafa] border-t border-slate-200/60 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-[#111827]">
                Nos Modules Tendance
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Explorez l'ensemble de nos programmes de cours officiels.
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedSubject('Tous');
                setSelectedLevel('Tous');
                clearSearch();
              }}
              className="text-sm font-bold text-[#00897b] hover:underline cursor-pointer text-left sm:text-right"
            >
              Tout afficher ({courses.length})
            </button>
          </div>

          {/* Bandeau d'indication si une recherche est active depuis la barre du haut */}
          {searchQuery && (
            <div className="mb-6 p-3 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-bold text-[#00897b]">
                <Search className="w-4 h-4" />
                Résultats de recherche pour : "{searchQuery}" ({filteredCourses.length} cours trouvés)
              </span>
              <button
                onClick={clearSearch}
                className="px-3 py-1 rounded-full bg-white border border-teal-200 text-teal-800 font-bold hover:bg-teal-100 transition flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Effacer le filtre
              </button>
            </div>
          )}

          {/* Filtres par Matière et Niveau */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <button
              onClick={() => setSelectedSubject('Tous')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                selectedSubject === 'Tous'
                  ? 'bg-[#111827] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Toutes les matières
            </button>
            {SUBJECTS.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                  selectedSubject === sub
                    ? 'bg-[#00897b] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {sub}
              </button>
            ))}

            <div className="h-5 w-[1px] bg-slate-300 mx-2 hidden sm:block"></div>

            {LEVELS.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => setSelectedLevel(lvl.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  selectedLevel === lvl.value
                    ? 'bg-[#ff9800] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          {/* Grille des Cartes (4 colonnes style Bakeli) */}
          {loadingCourses ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-4 border-[#00897b] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-slate-500 font-semibold">Chargement des modules...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">Aucun cours trouvé</h3>
              <p className="text-xs text-slate-500 mt-1">
                {searchQuery
                  ? `Aucun cours ne correspond au mot-clé "${searchQuery}".`
                  : 'Aucun cours ne correspond aux filtres sélectionnés.'}
              </p>
              <button
                onClick={() => {
                  setSelectedSubject('Tous');
                  setSelectedLevel('Tous');
                  clearSearch();
                }}
                className="mt-4 px-5 py-2 rounded-full bg-[#00897b] text-white text-xs font-bold cursor-pointer"
              >
                Réinitialiser la recherche
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCourses.map((course, idx) => {
                const chaptersCount = course.chapters?.length || 1;
                const learnersCount = 750 + ((idx * 383 + 420) % 2500);

                return (
                  <Link
                    key={course._id}
                    to={`/courses/${course._id}`}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image de couverture avec badges */}
                      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />

                        <div className="absolute top-2.5 left-2.5">
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-[#00897b] text-white tracking-wide uppercase shadow">
                            NOUVEAU MODULE
                          </span>
                        </div>

                        <div className="absolute bottom-2.5 left-2.5 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow">
                          <Award className="w-3 h-3" />
                          <span>Formation complète & certifiante</span>
                        </div>

                        <div className="absolute bottom-2.5 right-2.5 bg-white/90 p-1 rounded shadow">
                          <QrCode className="w-3 h-3 text-slate-800" />
                        </div>
                      </div>

                      {/* Tags & Titre */}
                      <div className="p-4 pb-2">
                        <div className="flex items-center justify-between gap-1 mb-2.5">
                          <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full">
                            {course.subject}
                          </span>
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                            {formatLevel(course.level)}
                          </span>
                        </div>

                        <h3 className="text-sm font-extrabold text-[#111827] leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-[#00897b] transition-colors">
                          {course.title}
                        </h3>

                        <div className="text-right mt-2 text-[11px] font-bold text-slate-500">
                          {learnersCount} apprenants
                        </div>

                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1 text-slate-600">
                            <Clock className="w-3 h-3 text-red-500" />
                            {course.duration || '1 an'}
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <BookOpen className="w-3 h-3 text-amber-500" />
                            {chaptersCount} sections
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ligne Formateur & Tarif */}
                    <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">
                          AS
                        </div>
                        <span className="text-xs font-black text-slate-800 uppercase truncate">
                          Aliou SOW
                        </span>
                      </div>

                      <div>
                        {course.isFree ? (
                          <span className="text-sm font-black text-[#00897b]">
                            Gratuit
                          </span>
                        ) : (
                          <span className="text-sm font-black text-[#00897b]">
                            {course.price ? `${course.price.toLocaleString()} FCFA` : '6 000 FCFA'}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. LES 4 PILIERS PÉDAGOGIQUES (#methode) */}
      {/* ============================================================== */}
      <section id="methode" className="py-20 bg-white border-t border-slate-200/60 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-black text-[#00897b] uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Pédagogie de l'Excellence
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#111827]">
              Comment Nous Vous Accompagnons Vers la Mention
            </h2>
            <p className="text-slate-500 text-sm">
              Un système d'apprentissage rigoureux conçu pour sécuriser votre réussite au BFEM et au Baccalauréat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Cours Vidéos Découpés',
                desc: 'Chaque chapitre est décomposé en notions simples de 15 minutes avec schémas et démonstrations.',
                icon: BookOpen,
                color: 'bg-teal-50 text-[#00897b]',
              },
              {
                title: 'Séances Google Meet',
                desc: 'Des sessions en direct interactives régulières pour poser vos questions et corriger les points bloquants.',
                icon: Users,
                color: 'bg-orange-50 text-[#ff9800]',
              },
              {
                title: 'Devoirs & Fiches PDF',
                desc: 'Des résumés de formules et des annales corrigées téléchargeables pour vous entraîner chez vous.',
                icon: Award,
                color: 'bg-emerald-50 text-emerald-600',
              },
              {
                title: 'Quiz Auto-corrigés',
                desc: 'Des évaluations automatiques à la fin de chaque leçon pour mesurer instantanément vos progrès.',
                icon: Sparkles,
                color: 'bg-blue-50 text-blue-600',
              },
            ].map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition space-y-4"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${pillar.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">{pillar.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. TÉMOIGNAGES DES ÉLÈVES (#testimonials) */}
      {/* ============================================================== */}
      <section id="testimonials" className="py-20 bg-[#f9fafb] border-t border-slate-200/60 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-black text-[#ff9800] uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              Résultats et Réussite
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#111827]">
              Ce que Disent Nos Élèves
            </h2>
            <p className="text-slate-500 text-sm">
              Des témoignages authentiques d'élèves préparant le BFEM et le Baccalauréat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {settings.testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(t.rating || 5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00897b] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {getInitials(t.name)}
                  </div>
                  <div>
                    <p className="font-extrabold text-xs text-slate-900">{t.name}</p>
                    <p className="text-[11px] text-[#00897b] font-semibold">{t.level}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. QUESTIONS FRÉQUENTES (#faq) */}
      {/* ============================================================== */}
      <section id="faq" className="py-20 bg-white border-t border-slate-200/60 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-black text-[#00897b] uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Aide et Renseignements
            </span>
            <h2 className="text-3xl font-black text-[#111827]">Questions Fréquentes</h2>
            <p className="text-slate-500 text-xs">
              Toutes les réponses à vos questions avant de vous inscrire.
            </p>
          </div>

          <div className="space-y-3">
            {settings.faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-[#00897b] transition cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openFaq === i ? 'rotate-180 text-[#00897b]' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bouton WhatsApp Flottant */}
      {settings.features.enableWhatsAppButton && (
        <a
          href={`https://wa.me/${(settings.channels?.whatsappNumber || '221771023399').replace(/[^0-9]/g, '')}?text=Bonjour%20M.%20Aliou%20Sow,%20je%20souhaite%20des%20informations%20sur%20vos%20cours`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contacter sur WhatsApp"
          className="fixed bottom-6 right-6 z-40 bg-[#00897b] hover:bg-[#00796b] text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition duration-300"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      )}
    </div>
  );
};

export default Landing;
