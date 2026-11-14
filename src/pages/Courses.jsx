import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  RotateCcw,
  GraduationCap,
  ChevronRight,
  Layers,
  Sparkles,
  Home,
  X,
  Play,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { SettingsContext } from '../context/SettingsContext';
import api from '../utils/api';
import CourseCard from '../components/CourseCard';
import LevelSelect from '../components/LevelSelect';
import {
  CYCLES,
  ALL_CLASSES,
  matchesClassLevel,
  getClassStats,
  formatClassLabel,
  getSubjectMeta,
} from '../utils/education';

const Courses = () => {
  const { settings } = useContext(SettingsContext);
  const [searchParams, setSearchParams] = useSearchParams();
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

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeSubject, setActiveSubject] = useState('Tous');
  const [activeLevel, setActiveLevel] = useState(searchParams.get('level') || 'Tous');
  const [priceFilter, setPriceFilter] = useState('Tous');

  const SUBJECTS =
    settings.subjects?.length > 0 ? settings.subjects : ['Mathématiques', 'Physique-Chimie'];

  useEffect(() => {
    const urlLevel = searchParams.get('level');
    if (urlLevel) {
      setActiveLevel(urlLevel);
    }
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

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
        console.error('Erreur de chargement des matières :', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set('search', value.trim());
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleLevelChange = (levelValue) => {
    setActiveLevel(levelValue);
    const params = new URLSearchParams(searchParams);
    if (levelValue && levelValue !== 'Tous') {
      params.set('level', levelValue);
    } else {
      params.delete('level');
    }
    setSearchParams(params);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setActiveSubject('Tous');
    setActiveLevel('Tous');
    setPriceFilter('Tous');
    setSearchParams({});
  };

  // Trouver l'objet classe correspondante si un niveau précis est actif
  const currentClassObj =
    activeLevel !== 'Tous'
      ? ALL_CLASSES.find((cls) => matchesClassLevel(activeLevel, cls)) || {
          id: activeLevel,
          name: formatClassLabel(activeLevel),
          cycle: 'Collège & Lycée',
        }
      : null;

  const currentClassStats = currentClassObj ? getClassStats(courses, currentClassObj) : null;

  const q = searchQuery.trim().toLowerCase();
  const filtered = courses.filter((c) => {
    const isFree = c.isFree || c.price === 0;
    const matchSubject = activeSubject === 'Tous' || c.subject === activeSubject;
    const matchLevel =
      activeLevel === 'Tous' ||
      (currentClassObj ? matchesClassLevel(c.level, currentClassObj) : c.level === activeLevel);
    const matchPrice =
      priceFilter === 'Tous' || (priceFilter === 'free' && isFree) || (priceFilter === 'paid' && !isFree);
    const matchSearch =
      !q ||
      `${c.title} ${c.description || ''} ${c.subject} ${c.level} ${c.teacher?.name || ''}`
        .toLowerCase()
        .includes(q);
    return matchSubject && matchLevel && matchPrice && matchSearch;
  });

  const hasActiveFilters =
    Boolean(searchQuery) || activeSubject !== 'Tous' || activeLevel !== 'Tous' || priceFilter !== 'Tous';

  return (
    <div className="min-h-screen bg-slate-50/50 pt-[72px] text-slate-900">
      {/* 1. HERO HEADER AVEC DÉGRADÉ & FILTRES ÉLÉGANTS */}
      <section className="relative bg-gradient-to-b from-white via-slate-50/80 to-slate-100/50 border-b border-slate-200/80 py-8 sm:py-10 overflow-hidden">
        {/* Glow ambient en arrière-plan */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#009688]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-[#f59d0e]/6 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center justify-between gap-5 mb-7"
          >
            <div>
              {/* Fil d'Ariane interactif */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1 hover:text-[#009688] transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Accueil</span>
                </Link>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-slate-800 font-bold">
                  {currentClassObj ? `Classe de ${currentClassObj.name}` : 'Toutes les matières'}
                </span>
              </div>

              {/* Badge d'en-tête */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[#009688] text-xs font-bold mb-2.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#009688]" />
                <span>Programme officiel sénégalais • Collège &amp; Lycée</span>
              </div>

              {/* Titre principal */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                {currentClassObj ? (
                  <>
                    Matières — <span className="text-[#009688]">Classe de {currentClassObj.name}</span>
                  </>
                ) : (
                  <>
                    Catalogue officiel des <span className="text-[#009688]">matières</span>
                  </>
                )}
              </h1>

              <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                {currentClassObj
                  ? `Retrouvez toutes les matières enseignées en classe de ${currentClassObj.name} avec leurs chapitres, leçons vidéo, exercices d'application et quiz corrigés.`
                  : 'Explorez toutes les matières de Mathématiques et Physique-Chimie de M. Aliou Sow, de la 4ème à la Terminale S.'}
              </p>
            </div>

            {/* Carte stats de la classe active */}
            {currentClassStats && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-4 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl px-6 py-4 shadow-sm"
              >
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-900">{currentClassStats.subjectsCount}</div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Matières</div>
                </div>
                <div className="h-9 w-px bg-slate-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-black text-[#009688]">{currentClassStats.totalChapters}</div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Chapitres</div>
                </div>
                <div className="h-9 w-px bg-slate-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-black text-amber-500">{currentClassStats.totalLessons || 0}</div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Leçons</div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* SÉLECTEUR DE CLASSE INTERACTIF (ANIMÉ AVEC FRAMER-MOTION) */}
          <div className="space-y-4 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => handleLevelChange('Tous')}
                className={`h-10 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeLevel === 'Tous'
                    ? 'bg-[#009688] text-white shadow-md shadow-teal-700/20'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-[#009688] hover:text-[#009688]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Toutes les classes</span>
              </motion.button>

              <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

              {/* Section Collège */}
              <div className="inline-flex items-center gap-1.5 p-1 bg-white/80 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">
                  Collège :
                </span>
                {CYCLES[0]?.classes.map((cls) => {
                  const isSelected = currentClassObj?.id === cls.id;
                  return (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      key={cls.id}
                      type="button"
                      onClick={() => handleLevelChange(cls.id)}
                      className={`h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      {cls.name}
                    </motion.button>
                  );
                })}
              </div>

              {/* Section Lycée */}
              <div className="inline-flex items-center gap-1.5 p-1 bg-white/80 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">
                  Lycée :
                </span>
                {CYCLES[1]?.classes.map((cls) => {
                  const isSelected = currentClassObj?.id === cls.id;
                  return (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      key={cls.id}
                      type="button"
                      onClick={() => handleLevelChange(cls.id)}
                      className={`h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                      }`}
                    >
                      {cls.name}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* BARRE DE RECHERCHE & FILTRES DISCIPLINE */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Rechercher une matière, un chapitre..."
                  className="w-full h-11 pl-11 pr-10 rounded-2xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#009688] focus:ring-2 focus:ring-[#009688]/15 transition shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filtres par matière */}
              <div className="flex flex-wrap items-center gap-2">
                {['Tous', ...SUBJECTS].map((subject) => {
                  const isActive = activeSubject === subject;
                  return (
                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      key={subject}
                      onClick={() => setActiveSubject(subject)}
                      className={`h-11 px-4 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#009688] border-[#009688] text-white shadow-sm shadow-teal-700/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-[#009688] hover:text-[#009688]'
                      }`}
                    >
                      {subject === 'Tous' ? 'Toutes les disciplines' : subject}
                    </motion.button>
                  );
                })}

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPriceFilter((p) => (p === 'free' ? 'Tous' : 'free'))}
                  className={`h-11 px-4 rounded-2xl border text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    priceFilter === 'free'
                      ? 'bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-600/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-amber-400 hover:text-amber-600'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Matières gratuites</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. GRILLE DES MATIÈRES AVEC ANIMATIONS FLUIDES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#009688] animate-pulse"></span>
            <p className="text-sm font-medium text-slate-600">
              <span className="font-extrabold text-slate-900 text-base">{filtered.length}</span> matière
              {filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}
              {currentClassObj && (
                <span>
                  {' '}
                  en classe de <strong className="text-slate-900">{currentClassObj.name}</strong>
                </span>
              )}
            </p>
          </div>

          {hasActiveFilters && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#009688] hover:bg-teal-50 transition shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser les filtres</span>
            </motion.button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs animate-pulse"
              >
                <div className="aspect-[16/9] bg-slate-100"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                  <div className="h-5 bg-slate-100 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-9 bg-slate-100 rounded-xl mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-dashed border-slate-200 rounded-3xl py-16 px-6 text-center bg-white shadow-xs max-w-xl mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#009688] flex items-center justify-center mx-auto mb-4 border border-teal-100">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-slate-900 font-extrabold text-lg mb-2">
              Aucune matière ne correspond à votre recherche
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
              {currentClassObj
                ? `Le programme de la classe de ${currentClassObj.name} est en cours d'enrichissement par M. Aliou Sow.`
                : 'Essayez un autre mot-clé ou réinitialisez les filtres pour découvrir toutes les matières disponibles.'}
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-6 py-2.5 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white text-sm font-bold transition cursor-pointer shadow-md shadow-teal-700/20"
            >
              Afficher toutes les matières
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {filtered.map((course) => (
              <motion.div
                key={course._id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default Courses;
