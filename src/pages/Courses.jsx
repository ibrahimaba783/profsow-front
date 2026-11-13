import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, BookOpen, RotateCcw } from 'lucide-react';
import { SettingsContext } from '../context/SettingsContext';
import api from '../utils/api';
import CourseCard from '../components/CourseCard';
import LevelSelect from '../components/LevelSelect';

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
  const [activeLevel, setActiveLevel] = useState('Tous');
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
    setSearchQuery(searchParams.get('search') || '');
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
        console.error('Erreur de chargement des cours :', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (value.trim()) {
      setSearchParams({ search: value.trim() });
    } else {
      setSearchParams({});
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setActiveSubject('Tous');
    setActiveLevel('Tous');
    setPriceFilter('Tous');
    setSearchParams({});
  };

  const q = searchQuery.trim().toLowerCase();
  const filtered = courses.filter((c) => {
    const isFree = c.isFree || c.price === 0;
    const matchSubject = activeSubject === 'Tous' || c.subject === activeSubject;
    const matchLevel = activeLevel === 'Tous' || c.level === activeLevel;
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
      <section className="bg-slate-50/80 border-b border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Catalogue des modules
          </h1>
          <p className="text-slate-600 mt-1.5 max-w-2xl">
            Explorez tous les cours de Mathématiques et Physique-Chimie de{' '}
            {settings.siteInfo?.teacherDisplayName || 'M. Aliou Sow'}, de la 4ème à la Terminale S.
          </p>

          {/* Barre de filtres */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Rechercher un cours, chapitre, niveau..."
                className="w-full h-11 pl-10 pr-4 rounded-full border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#009688]"
              />
            </div>

            <LevelSelect
              value={activeLevel}
              onChange={setActiveLevel}
              options={[{ value: 'Tous', label: 'Tous les niveaux' }, ...LEVELS]}
              size="lg"
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
              onClick={() => setPriceFilter((p) => (p === 'free' ? 'Tous' : 'free'))}
              className={`h-10 px-4 rounded-full border text-sm font-medium transition cursor-pointer ${
                priceFilter === 'free'
                  ? 'bg-[#f59d0e] border-[#f59d0e] text-white'
                  : 'bg-white border-slate-300 text-slate-700 hover:border-[#f59d0e]'
              }`}
            >
              Gratuits
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            <span className="font-bold text-slate-900">{filtered.length}</span> module
            {filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          </p>
          {(searchQuery || activeSubject !== 'Tous' || activeLevel !== 'Tous' || priceFilter !== 'Tous') && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#009688] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser les filtres
            </button>
          )}
        </div>

        {loading ? (
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
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl py-16 px-6 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-semibold mb-1">
              Aucun module ne correspond à votre recherche.
            </p>
            <p className="text-slate-400 text-sm mb-4">
              Essayez un autre mot-clé ou réinitialisez les filtres.
            </p>
            <button
              onClick={resetFilters}
              className="px-5 py-2 rounded-full bg-[#009688] text-white text-sm font-semibold hover:bg-[#00796b] transition cursor-pointer"
            >
              Voir tous les modules
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
