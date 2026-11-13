import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, BookOpen, RotateCcw, GraduationCap, ChevronRight, Layers } from 'lucide-react';
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
  const LEVELS =
    settings.levels?.length > 0
      ? settings.levels
      : [
          { value: '4ème', label: '4ème' },
          { value: '3ème', label: '3ème' },
          { value: '2nde S', label: '2nde S' },
          { value: '1ère S', label: '1ère S' },
          { value: 'TS', label: 'Terminale S' },
        ];

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

  return (
    <div className="min-h-screen bg-white pt-[72px] text-slate-900">
      {/* 1. SÉLECTEUR DE CLASSE SAMA SCHOOL (COLLÈGE & LYCÉE) */}
      <section className="bg-slate-50/90 border-b border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Link to="/" className="hover:text-[#009688]">Accueil</Link>
                <span>/</span>
                <span className="text-slate-800 font-bold">
                  {currentClassObj ? `Classe de ${currentClassObj.name}` : 'Toutes les matières'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {currentClassObj
                  ? `Matières — Classe de ${currentClassObj.name}`
                  : 'Catalogue des matières'}
              </h1>
              <p className="text-slate-600 text-sm mt-1 max-w-2xl">
                {currentClassObj
                  ? `Retrouvez toutes les matières enseignées en classe de ${currentClassObj.name} avec leurs chapitres, leçons, exercices et quiz.`
                  : 'Explorez toutes les matières de Mathématiques et Physique-Chimie de M. Aliou Sow, de la 6ème à la Terminale S.'}
              </p>
            </div>

            {currentClassStats && (
              <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
                <div className="text-center">
                  <div className="text-xl font-black text-slate-900">{currentClassStats.subjectsCount}</div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Matières</div>
                </div>
                <div className="h-8 w-px bg-slate-100"></div>
                <div className="text-center">
                  <div className="text-xl font-black text-[#009688]">{currentClassStats.totalChapters}</div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Chapitres</div>
                </div>
              </div>
            )}
          </div>

          {/* Barre de navigation rapide des classes (Modèle Sama School) */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleLevelChange('Tous')}
                className={`h-9 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeLevel === 'Tous'
                    ? 'bg-[#009688] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-[#009688]'
                }`}
              >
                Toutes les classes
              </button>

              <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block"></div>

              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hidden lg:inline mr-1">
                Collège :
              </span>
              {CYCLES[0]?.classes.map((cls) => {
                const isSelected = currentClassObj?.id === cls.id;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => handleLevelChange(cls.id)}
                    className={`h-9 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm font-bold'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-500'
                    }`}
                  >
                    {cls.name}
                  </button>
                );
              })}

              <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block"></div>

              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 hidden lg:inline mr-1">
                Lycée :
              </span>
              {CYCLES[1]?.classes.map((cls) => {
                const isSelected = currentClassObj?.id === cls.id;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => handleLevelChange(cls.id)}
                    className={`h-9 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm font-bold'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-500'
                    }`}
                  >
                    {cls.name}
                  </button>
                );
              })}
            </div>

            {/* Barre de filtres (recherche, matières, gratuit) */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Rechercher une matière, un chapitre..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#009688]"
                />
              </div>

              {['Tous', ...SUBJECTS].map((subject) => (
                <button
                  key={subject}
                  onClick={() => setActiveSubject(subject)}
                  className={`h-10 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    activeSubject === subject
                      ? 'bg-[#009688] border-[#009688] text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-[#009688]'
                  }`}
                >
                  {subject === 'Tous' ? 'Toutes les disciplines' : subject}
                </button>
              ))}

              <button
                onClick={() => setPriceFilter((p) => (p === 'free' ? 'Tous' : 'free'))}
                className={`h-10 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  priceFilter === 'free'
                    ? 'bg-[#f59d0e] border-[#f59d0e] text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-[#f59d0e]'
                }`}
              >
                Matières gratuites
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LISTE DES MATIÈRES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            <span className="font-bold text-slate-900">{filtered.length}</span> matière
            {filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}
            {currentClassObj && ` en classe de ${currentClassObj.name}`}
          </p>
          {(searchQuery || activeSubject !== 'Tous' || activeLevel !== 'Tous' || priceFilter !== 'Tous') && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#009688] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser tous les filtres
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-slate-200 overflow-hidden animate-pulse bg-white">
                <div className="aspect-[16/10] bg-slate-100"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-5 bg-slate-100 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-2xl py-16 px-6 text-center bg-slate-50/50">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-slate-800 font-bold text-lg mb-1">
              Aucune matière ne correspond à votre recherche
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-5 leading-relaxed">
              {currentClassObj
                ? `Le programme de la classe de ${currentClassObj.name} est en cours d'enrichissement par M. Aliou Sow.`
                : 'Essayez un autre mot-clé ou réinitialisez les filtres pour voir toutes les matières.'}
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 rounded-xl bg-[#009688] text-white text-sm font-bold hover:bg-[#00796b] transition cursor-pointer shadow-sm"
            >
              Voir toutes les matières
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Courses;
