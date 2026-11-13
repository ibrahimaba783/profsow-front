import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';
import api from '../utils/api';
import CourseCard, { formatLevel } from '../components/CourseCard';
import LevelSelect from '../components/LevelSelect';
import {
  BookOpen,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Phone,
  Smartphone,
  LayoutGrid,
  LayoutDashboard,
  Search,
  Settings,
  LogOut,
  User,
  Users,
  Award,
  Calendar,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

const mapInitialView = (rawView) => {
  if (rawView === 'mine' || rawView === 'parcours') return 'mine';
  if (rawView === 'progress' || rawView === 'certifications') return 'progress';
  return 'all';
};

const countCourseLessons = (course) =>
  (course?.chapters || []).reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0);

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);
  const SUBJECT_FILTERS = [
    'Tous',
    ...(settings.subjects?.length ? settings.subjects : ['Mathématiques', 'Physique-Chimie']),
  ];
  const LEVEL_FILTERS = [
    { value: 'Tous', label: 'Tous les niveaux' },
    ...(settings.levels?.length
      ? settings.levels
      : [
          { value: '4ème', label: '4ème' },
          { value: '3ème', label: '3ème' },
          { value: '2nde S', label: '2nde S' },
          { value: '1ère S', label: '1ère S' },
          { value: 'TS', label: 'Terminale S' },
        ]),
  ];
  const features = settings.features || {};

  const [myCourses, setMyCourses] = useState([]);
  const [allCoursesList, setAllCoursesList] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Wave');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [emailPreviewUrl, setEmailPreviewUrl] = useState('');
  const [paying, setPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [enrollingFreeId, setEnrollingFreeId] = useState(null);
  const [freeEnrollError, setFreeEnrollError] = useState('');

  const location = useLocation();
  const [view, setView] = useState(() => mapInitialView(location.state?.view)); // 'all' | 'certifications' | 'parcours'
  const [query, setQuery] = useState(location.state?.query || '');
  const [showFilters, setShowFilters] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState('Tous');
  const [levelFilter, setLevelFilter] = useState('Tous');
  const [freeOnly, setFreeOnly] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  );
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.view) {
      setView(mapInitialView(location.state.view));
    }
    if (typeof location.state?.query === 'string') {
      setQuery(location.state.query);
    }
  }, [location.state]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [allCourses, mySubs, results] = await Promise.all([
        api('/courses'),
        api('/subscriptions/my'),
        api('/quizzes/student/results').catch(() => []),
      ]);

      const coursesArray = Array.isArray(allCourses) ? allCourses : [];
      const subsArray = Array.isArray(mySubs) ? mySubs : [];

      setAllCoursesList(coursesArray);
      setSubscriptions(subsArray);
      setQuizResults(Array.isArray(results) ? results : []);

      const activeCourseIds = subsArray
        .filter((sub) => sub.course && sub.status === 'active' && new Date(sub.expiresAt) > new Date())
        .map((sub) => sub.course._id);

      setMyCourses(coursesArray.filter((c) => activeCourseIds.includes(c._id)));
    } catch (err) {
      console.error('Erreur de récupération des données du dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollFree = async (course) => {
    setEnrollingFreeId(course._id);
    setFreeEnrollError('');
    try {
      await api(`/subscriptions/enroll-free/${course._id}`, { method: 'POST' });
      await fetchDashboardData();
    } catch (err) {
      setFreeEnrollError(err.message || "Impossible d'activer ce cours gratuit pour le moment");
    } finally {
      setEnrollingFreeId(null);
    }
  };

  const startPayment = (course) => {
    setSelectedCourse(course);
    setPhoneNumber('');
    setPaymentSuccess(false);
    setTransactionId('');
    setEmailPreviewUrl('');
    setErrorMessage('');
    setPaymentMethod('Wave');
  };

  const handleSimulatePayment = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 9) {
      setErrorMessage('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    setPaying(true);
    setErrorMessage('');

    const prefix = paymentMethod === 'Wave' ? 'WV-' : 'OM-';
    const fakeTxId = prefix + Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
      const data = await api('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          courseId: selectedCourse._id,
          paymentMethod,
          transactionId: fakeTxId,
          amount: selectedCourse.price,
          durationMonths: 12,
        }),
      });

      setTransactionId(fakeTxId);
      if (data.emailPreviewUrl) {
        setEmailPreviewUrl(data.emailPreviewUrl);
      }
      setPaymentSuccess(true);
      await fetchDashboardData();
    } catch (err) {
      setErrorMessage(err.message || 'Le paiement a échoué');
    } finally {
      setPaying(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const activeSubMap = new Map(
    subscriptions
      .filter((s) => s.course && s.status === 'active' && new Date(s.expiresAt) > new Date())
      .map((s) => [String(s.course._id || s.course), s])
  );

  const getCourseProgress = (course) => {
    const total = countCourseLessons(course);
    const sub = activeSubMap.get(String(course._id));
    const completed = Array.isArray(sub?.completedLessons) ? sub.completedLessons.length : 0;
    const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
    return { total, completed, pct };
  };

  const q = query.trim().toLowerCase();
  const matches = (c) =>
    (subjectFilter === 'Tous' || c.subject === subjectFilter) &&
    (levelFilter === 'Tous' || c.level === levelFilter) &&
    (!freeOnly || c.isFree || c.price === 0) &&
    (!q || `${c.title} ${c.subject} ${c.level}`.toLowerCase().includes(q));

  const recommendedCourses = [...allCoursesList]
    .sort((a, b) => (b.studentsCount || 0) - (a.studentsCount || 0))
    .slice(0, 8);

  const filteredTrending = allCoursesList.filter(matches);
  const filteredMine = myCourses.filter(matches);

  const activeFiltersCount =
    (subjectFilter !== 'Tous' ? 1 : 0) + (levelFilter !== 'Tous' ? 1 : 0) + (freeOnly ? 1 : 0);

  const renderCard = (course, enrolled) => {
    return (
      <CourseCard
        course={course}
        onClick={() => navigate(`/courses/${course._id}`)}
        topRightBadge={
          enrolled ? (
            <span className="text-[10px] font-bold bg-[#009688] text-white px-2.5 py-1 rounded-full shadow-sm">
              Accès complet
            </span>
          ) : (
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              1er chap. gratuit
            </span>
          )
        }
        footerRight={
          enrolled ? (
            <span className="text-[#009688] text-xs font-bold flex items-center gap-0.5 shrink-0">
              Continuer <ChevronRight className="w-3.5 h-3.5" />
            </span>
          ) : null
        }
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  const sidebarItems = [
    { key: 'all', label: 'Toutes les matières', icon: LayoutGrid },
    { key: 'mine', label: 'Mes matières', icon: BookOpen, count: myCourses.length },
    { key: 'progress', label: 'Mes résultats & quiz', icon: Award, count: quizResults.length },
  ];

  const avgQuizScore =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0) /
            quizResults.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Barre du haut fixe (exact style Bakeli) */}
      <header className="fixed top-0 inset-x-0 h-[72px] bg-white border-b border-slate-200 z-40 flex items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="Aliou Sow Academy" className="h-9 w-auto" />
          <span className="hidden sm:block leading-tight">
            <span className="block text-sm font-extrabold text-slate-900 tracking-wide">ALIOU SOW</span>
            <span className="block text-[9px] font-bold tracking-[0.24em] text-[#009688]">ACADEMY</span>
          </span>
        </Link>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setView('all');
          }}
          className="flex-1 max-w-xl flex items-center bg-slate-50 border border-slate-200 rounded-full pl-5 pr-1.5 py-1 focus-within:border-[#f59d0e]"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Qu'est-ce que vous souhaitez apprendre ?"
            className="flex-1 min-w-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Rechercher"
            className="w-8 h-8 rounded-full bg-[#f59d0e] hover:bg-[#e08b00] text-white flex items-center justify-center shrink-0 cursor-pointer transition"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 cursor-pointer"
          >
            {user?.avatar && !user.avatar.includes('cld-sample.jpg') ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <span className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center">
                <User className="w-5 h-5" />
              </span>
            )}
            <span className="hidden sm:block text-sm font-semibold text-slate-800 max-w-[140px] truncate">
              {user?.name}
            </span>
            <ChevronDown className="hidden sm:block w-4 h-4 text-slate-400" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
              <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-3 z-50">
                <div className="px-4 pb-3 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-500">{user?.name}</p>
                  <p className="text-sm text-slate-800 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setView('all');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Tableau de bord
                </button>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50"
                >
                  <Settings className="w-4 h-4" />
                  Paramètres
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Menu latéral repliable (format Bakeli adapté à Aliou Sow Academy) */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 top-[72px] bg-black/30 z-20"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      <aside
        className={`fixed top-[72px] bottom-0 left-0 w-64 bg-white border-r border-slate-200 z-30 px-4 py-6 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400 px-3 mb-3">
          ESPACE ÉLÈVE
        </p>
        <nav className="space-y-1.5">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  active ? 'bg-amber-50/90 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    active ? 'bg-[#f59d0e] text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {typeof item.count === 'number' && !active && (
                  <span className="text-xs text-slate-400">{item.count}</span>
                )}
                {active && <ChevronRight className="w-4 h-4 text-[#f59d0e] shrink-0" />}
              </button>
            );
          })}
        </nav>
      </aside>

      <button
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label={sidebarOpen ? 'Replier le menu' : 'Ouvrir le menu'}
        className={`fixed top-[5.25rem] z-30 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-500 hover:text-[#f59d0e] cursor-pointer transition-all duration-300 ${
          sidebarOpen ? 'left-[15.125rem]' : 'left-2'
        }`}
      >
        {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Contenu principal */}
      <main
        className={`pt-[72px] min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'md:pl-64' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-7 space-y-9">
          {freeEnrollError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{freeEnrollError}</span>
            </div>
          )}

          {view === 'all' ? (
            <>
              {/* 1. COURS RECOMMANDÉS / SÉLECTION DU PROGRAMME (FORMAT BAKELI) */}
              {recommendedCourses.length > 0 && (
                <section className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {myCourses.length > 0 ? 'Reprendre & découvrir' : 'Matières recommandées'}
                    </h2>
                    <span className="text-xs font-medium text-slate-400">
                      Mathématiques &amp; Physique-Chimie • 4ème à Terminale S
                    </span>
                  </div>

                  <div className="grid grid-flow-col auto-cols-[245px] sm:auto-cols-[260px] gap-4 overflow-x-auto pb-2 snap-x">
                    {recommendedCourses.map((course) => {
                      const isEnrolled = activeSubMap.has(String(course._id));
                      return (
                        <div
                          key={course._id}
                          onClick={() => navigate(`/courses/${course._id}`)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') navigate(`/courses/${course._id}`);
                          }}
                          className="snap-start group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition flex flex-col cursor-pointer"
                        >
                          <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                            <img
                              src={course.image}
                              alt={course.title}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            {isEnrolled ? (
                              <span className="absolute top-2.5 left-2.5 text-[10px] font-extrabold uppercase tracking-wider bg-[#009688] text-white px-2 py-0.5 rounded-md shadow-xs">
                                DÉJÀ DÉBLOQUÉ
                              </span>
                            ) : (course.isFree || course.price === 0) ? (
                              <span className="absolute top-2.5 left-2.5 text-[10px] font-extrabold uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-md shadow-xs">
                                MATIÈRE GRATUITE
                              </span>
                            ) : null}
                          </div>

                          <div className="p-3.5 flex flex-col flex-1">
                            <div className="flex items-center justify-between gap-2 mb-2.5">
                              <span className="text-[11px] font-semibold bg-sky-50 text-sky-600 rounded-md px-2 py-0.5 truncate">
                                {course.subject}
                              </span>
                              <span className="text-[11px] font-semibold bg-amber-50 text-[#f59d0e] rounded-md px-2 py-0.5 shrink-0">
                                {formatLevel(course.level)}
                              </span>
                            </div>

                            <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-[#009688] transition-colors">
                              {course.title}
                            </h3>

                            <div className="mt-auto pt-3 flex items-center justify-between text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                                <Users className="w-3.5 h-3.5" />
                                <span>{course.studentsCount || 0}</span>
                              </span>
                              <span className="text-[#009688] font-bold inline-flex items-center gap-0.5">
                                Voir <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 2. CATALOGUE DES COURS (FORMAT BAKELI) */}
              <section className="space-y-5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Catalogue des matières
                </h2>

                {/* Barre de recherche + bouton Filtres */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-full px-4 h-11 focus-within:border-[#009688] shadow-2xs">
                    <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Rechercher une matière..."
                      className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFilters((v) => !v)}
                    className={`h-11 px-5 rounded-2xl border text-sm font-semibold flex items-center justify-center gap-2 shrink-0 cursor-pointer transition ${
                      showFilters || activeFiltersCount > 0
                        ? 'bg-teal-50 border-[#009688]/40 text-[#009688]'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span>Filtres</span>
                    <SlidersHorizontal className="w-4 h-4" />
                    {activeFiltersCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#009688] text-white text-[10px] font-bold flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Panneau Filtres dépliable */}
                {showFilters && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center gap-3 shadow-xs">
                    <LevelSelect
                      value={levelFilter}
                      onChange={setLevelFilter}
                      options={LEVEL_FILTERS}
                      size="sm"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      {SUBJECT_FILTERS.map((subject) => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => setSubjectFilter(subject)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                            subjectFilter === subject
                              ? 'bg-[#009688] border-[#009688] text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-[#009688]'
                          }`}
                        >
                          {subject === 'Tous' ? 'Toutes les matières' : subject}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setFreeOnly((v) => !v)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                        freeOnly
                          ? 'bg-[#f59d0e] border-[#f59d0e] text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-[#f59d0e]'
                      }`}
                    >
                      Matières gratuites uniquement
                    </button>

                    {activeFiltersCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSubjectFilter('Tous');
                          setLevelFilter('Tous');
                          setFreeOnly(false);
                        }}
                        className="ml-auto text-xs font-bold text-slate-500 hover:text-red-500 cursor-pointer"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>
                )}

                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                  <span>Retrouvez les leçons vidéo, fiches PDF, directs et quiz</span>
                  <Flame className="w-4 h-4 text-[#f59d0e] fill-[#f59d0e]" />
                  <span>du programme ({filteredTrending.length})</span>
                </p>

                {filteredTrending.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
                    Aucune matière ne correspond à votre recherche.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredTrending.map((course) => (
                      <div key={course._id}>
                        {renderCard(course, activeSubMap.has(String(course._id)))}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : view === 'mine' ? (
            /* ================= VUE MES COURS & ABONNEMENTS ================= */
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Mes matières</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Suivez votre progression leçon par leçon et consultez vos abonnements actifs.
                  </p>
                </div>
                <span className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 self-start">
                  Matières actives : <strong className="text-[#009688]">{myCourses.length}</strong>
                </span>
              </div>

              {filteredMine.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center text-slate-500">
                  <p className="font-semibold text-slate-700">
                    {myCourses.length === 0
                      ? "Vous n'avez aucune matière débloquée pour le moment."
                      : 'Aucune de vos matières ne correspond à cette recherche.'}
                  </p>
                  <button
                    onClick={() => setView('all')}
                    className="mt-3 text-[#009688] font-bold hover:underline cursor-pointer text-sm"
                  >
                    Découvrir toutes les matières
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredMine.map((course) => {
                    const { total, completed, pct } = getCourseProgress(course);
                    return (
                      <div
                        key={course._id}
                        onClick={() => navigate(`/courses/${course._id}`)}
                        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col cursor-pointer"
                      >
                        <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden">
                          <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                          <span className="absolute top-2.5 right-2.5 text-[10px] font-bold bg-[#009688] text-white px-2.5 py-1 rounded-full">
                            {pct}% terminé
                          </span>
                        </div>
                        <div className="p-5 flex-1 flex flex-col space-y-3">
                          <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                            <span className="bg-sky-50 text-sky-600 px-2.5 py-0.5 rounded-full">
                              {course.subject}
                            </span>
                            <span className="bg-amber-50 text-[#f59d0e] px-2.5 py-0.5 rounded-full">
                              {formatLevel(course.level)}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-slate-900 line-clamp-2">
                            {course.title}
                          </h3>
                          <div className="space-y-1.5 pt-1">
                            <div className="flex justify-between text-xs text-slate-500 font-semibold">
                              <span>Progression</span>
                              <span className="text-[#009688]">
                                {completed}/{total} leçons
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#009688] rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <div className="pt-2 mt-auto flex justify-end">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#f59d0e]">
                              Continuer le module <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Abonnements enregistrés */}
              <section className="bg-white border border-slate-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#009688]" />
                  <span>Mes abonnements et accès</span>
                </h2>
                {subscriptions.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Vous n&apos;avez pas encore d&apos;abonnement enregistré.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {subscriptions.map((sub) => {
                      const active =
                        sub.status === 'active' && new Date(sub.expiresAt) > new Date();
                      return (
                        <div
                          key={sub._id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm"
                        >
                          <div>
                            <Link
                              to={`/courses/${sub.course?._id}`}
                              className="font-bold text-slate-900 hover:text-[#009688]"
                            >
                              {sub.course?.title || 'Module'}
                            </Link>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {sub.course?.subject} • {formatLevel(sub.course?.level)} •{' '}
                              {sub.paymentMethod} ({sub.amount} FCFA)
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500">
                              Valide jusqu&apos;au{' '}
                              {new Date(sub.expiresAt).toLocaleDateString('fr-FR')}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                active
                                  ? 'bg-teal-50 text-[#009688]'
                                  : 'bg-red-50 text-red-600'
                              }`}
                            >
                              {active ? 'Actif' : 'Expiré'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          ) : (
            /* ================= VUE MES RÉSULTATS & QUIZ ================= */
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Mes résultats &amp; quiz</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Consultez vos notes aux quiz interactifs et votre progression dans les matières scientifiques.
                  </p>
                </div>
                <div className="flex items-center gap-3 self-start">
                  <span className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700">
                    Cours suivis : <strong className="text-[#009688]">{myCourses.length}</strong>
                  </span>
                  <span className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700">
                    Moyenne quiz : <strong className="text-[#f59d0e]">{avgQuizScore}%</strong>
                  </span>
                </div>
              </div>

              <section className="bg-white border border-slate-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#f59d0e]" />
                  <span>Mes résultats aux évaluations (Quiz)</span>
                </h2>
                {quizResults.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Vous n&apos;avez pas encore passé d&apos;évaluation. Ouvrez un cours pour faire
                    un quiz !
                  </p>
                ) : (
                  <div className="space-y-3">
                    {quizResults
                      .slice()
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((res) => {
                        const pct = Math.round((res.score / res.totalQuestions) * 100);
                        return (
                          <div
                            key={res._id}
                            className="flex items-center justify-between gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm"
                          >
                            <div>
                              <p className="font-bold text-slate-900">
                                {res.quiz?.title || 'Quiz'}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {res.quiz?.course?.title || 'Matière'} •{' '}
                                {new Date(res.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-base font-extrabold text-[#009688]">
                                {res.score} / {res.totalQuestions}
                              </span>
                              <p className="text-xs text-slate-500">{pct}% de réussite</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>

      {/* Modal de paiement Wave / Orange Money */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl relative flex flex-col slide-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              ✕
            </button>

            {paymentSuccess ? (
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 bg-teal-50 border border-teal-100 text-[#009688] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Abonnement Réussi !</h3>
                <p className="text-slate-600 text-sm">
                  La matière <strong>{selectedCourse.title}</strong> est désormais débloquée.
                </p>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left text-xs space-y-1 font-mono">
                  <div className="text-slate-500">Transaction ID: {transactionId}</div>
                  <div className="text-slate-500">Montant: {selectedCourse.price} FCFA</div>
                  <div className="text-[#009688]">Statut: Validé</div>
                </div>

                {emailPreviewUrl && (
                  <div className="bg-teal-50 border border-teal-100 p-3 rounded-lg text-left text-xs space-y-1">
                    <span className="flex items-center gap-1 text-xs font-bold text-[#009688]">
                      <Sparkles className="w-3 h-3" />
                      E-MAIL DE PAIEMENT GÉNÉRÉ
                    </span>
                    <a
                      href={emailPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-[#009688] font-bold underline"
                    >
                      Prévisualiser l&apos;email de confirmation ↗
                    </a>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedCourse(null);
                    navigate(`/courses/${selectedCourse._id}`);
                  }}
                  className="w-full bg-[#009688] hover:bg-[#00796b] text-white font-bold py-3 rounded-xl cursor-pointer transition"
                >
                  Accéder à la matière
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#009688]" />
                  <span>Paiement Mobile FCFA</span>
                </h3>
                <p className="text-slate-500 text-xs mb-3">
                  Réglez votre abonnement Wave ou Orange Money pour la matière :{' '}
                  <strong>{selectedCourse.title}</strong> ({selectedCourse.price ?? 6000} FCFA).
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 mb-5 space-y-1">
                  <p>
                    Numéro Wave : <strong className="text-slate-900">{settings.siteInfo?.waveNumber || '+221 77 102 33 99'}</strong>
                  </p>
                  <p>
                    Numéro Orange Money : <strong className="text-slate-900">{settings.siteInfo?.orangeMoneyNumber || '+221 77 102 33 99'}</strong>
                  </p>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-xs mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSimulatePayment} className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Wave')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition cursor-pointer ${
                        paymentMethod === 'Wave'
                          ? 'payment-card-wave border-blue-400 text-white'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <span className="text-lg font-bold">Wave</span>
                      <span className="text-[10px] opacity-75">Paiement mobile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Orange Money')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition cursor-pointer ${
                        paymentMethod === 'Orange Money'
                          ? 'payment-card-orange border-orange-400 text-white'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <span className="text-lg font-bold">Orange Money</span>
                      <span className="text-[10px] opacity-75">Sénégal</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Numéro de téléphone payeur
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="input-animated pl-10 pr-3"
                        placeholder="77 123 45 67"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg flex justify-between text-xs border border-slate-100 font-semibold">
                    <span className="text-slate-500">Total à payer :</span>
                    <span className="text-slate-900">{selectedCourse.price ?? 6000} FCFA</span>
                  </div>

                  <button
                    type="submit"
                    disabled={paying}
                    className="w-full bg-[#009688] hover:bg-[#00796b] text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {paying ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Confirmer le paiement</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
