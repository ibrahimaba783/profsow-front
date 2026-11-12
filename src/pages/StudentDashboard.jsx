import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
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
  Award,
  Calendar,
} from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

const SUBJECT_FILTERS = ['Tous', 'Mathématiques', 'Physique-Chimie'];
const LEVEL_FILTERS = [
  { value: 'Tous', label: 'Tous les niveaux' },
  { value: '4ème', label: '4ème' },
  { value: '3ème', label: '3ème' },
  { value: '2nde S', label: '2nde S' },
  { value: '1ère S', label: '1ère S' },
  { value: 'TS', label: 'Terminale S' },
];

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [myCourses, setMyCourses] = useState([]);
  const [catalog, setCatalog] = useState([]);
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
  const [view, setView] = useState(location.state?.view || 'all'); // 'all' | 'mine' | 'progress'
  const [query, setQuery] = useState(location.state?.query || '');
  const [subjectFilter, setSubjectFilter] = useState('Tous');
  const [levelFilter, setLevelFilter] = useState('Tous');
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  );
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

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

      setSubscriptions(Array.isArray(mySubs) ? mySubs : []);
      setQuizResults(Array.isArray(results) ? results : []);

      const activeCourseIds = (Array.isArray(mySubs) ? mySubs : [])
        .filter((sub) => sub.course && sub.status === 'active' && new Date(sub.expiresAt) > new Date())
        .map((sub) => sub.course._id);

      const enrolled = allCourses.filter((c) => activeCourseIds.includes(c._id));
      const available = allCourses.filter((c) => !activeCourseIds.includes(c._id));

      setMyCourses(enrolled);
      setCatalog(available);
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

  const q = query.trim().toLowerCase();
  const matches = (c) =>
    (subjectFilter === 'Tous' || c.subject === subjectFilter) &&
    (levelFilter === 'Tous' || c.level === levelFilter) &&
    (!q || `${c.title} ${c.subject} ${c.level}`.toLowerCase().includes(q));

  const filteredMine = myCourses.filter(matches);
  const filteredCatalog = catalog.filter(matches);
  const firstName = user?.name ? user.name.trim().split(' ')[0] : '';

  const renderCard = (course, enrolled) => {
    const courseIsFree = course.isFree || course.price === 0;

    return (
      <CourseCard
        course={course}
        onClick={() => navigate(`/courses/${course._id}`)}
        topRightBadge={
          enrolled ? (
            <span className="text-[10px] font-bold bg-[#009688] text-white px-2.5 py-1 rounded-full shadow-sm">
              Accès actif
            </span>
          ) : (
            <span className="w-7 h-7 rounded-full bg-white/90 text-slate-500 flex items-center justify-center shadow-sm">
              <Lock className="w-3.5 h-3.5" />
            </span>
          )
        }
        footerRight={
          enrolled ? (
            <span className="text-[#009688] text-xs font-bold flex items-center gap-0.5 shrink-0">
              Étudier <ChevronRight className="w-3.5 h-3.5" />
            </span>
          ) : courseIsFree ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEnrollFree(course);
              }}
              disabled={enrollingFreeId === course._id}
              className="px-3 py-1.5 bg-[#009688] hover:bg-[#00796b] disabled:opacity-60 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition shrink-0"
            >
              {enrollingFreeId === course._id ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>Gratuit</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                startPayment(course);
              }}
              className="px-3 py-1.5 bg-[#f59d0e] hover:bg-[#e08b00] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition shrink-0"
            >
              <CreditCard className="w-3 h-3" />
              <span>{(course.price ?? 6000).toLocaleString('fr-FR')} F</span>
            </button>
          )
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
    { key: 'all', label: 'Tous les cours', icon: LayoutGrid },
    { key: 'mine', label: 'Mes cours', icon: BookOpen, count: myCourses.length },
    { key: 'progress', label: 'Mes résultats & progrès', icon: Award, count: quizResults.length },
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
      {/* Barre du haut */}
      <header className="fixed top-0 inset-x-0 h-[72px] bg-white border-b border-slate-200 z-40 flex items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="Aliou Sow Academy" className="h-9 w-auto" />
          <span className="hidden sm:block leading-tight">
            <span className="block text-sm font-extrabold text-slate-900 tracking-wide">ALIOU SOW</span>
            <span className="block text-[9px] font-bold tracking-[0.24em] text-[#009688]">ACADEMY</span>
          </span>
        </Link>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex-1 max-w-xl flex items-center bg-white border border-slate-200 rounded-full pl-4 pr-1.5 py-1 focus-within:border-[#f59d0e]"
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
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <span className="w-9 h-9 rounded-full bg-[#009688] text-white flex items-center justify-center">
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

      {/* Menu latéral repliable */}
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
        <p className="text-[11px] font-bold tracking-wider text-slate-400 px-2 mb-3">
          ESPACE ÉLÈVE
        </p>
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  active ? 'bg-teal-50 text-[#009688]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    active ? 'bg-[#009688] text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {typeof item.count === 'number' && (
                  <span className="text-xs text-slate-400">{item.count}</span>
                )}
              </button>
            );
          })}

          <Link
            to="/profile"
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
              <User className="w-4 h-4" />
            </span>
            <span className="flex-1 text-left">Mon profil</span>
          </Link>
        </nav>
      </aside>

      <button
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label={sidebarOpen ? 'Replier le menu' : 'Ouvrir le menu'}
        className={`fixed top-[5.5rem] z-30 w-7 h-7 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center text-slate-600 hover:text-[#009688] cursor-pointer transition-all duration-300 ${
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
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                Bonjour{firstName ? `, ${firstName}` : ''}
              </h1>
              <p className="text-slate-500 mt-1">
                Suivez vos cours, testez vos connaissances et suivez vos progrès.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="bg-white border border-slate-200 rounded-lg px-3.5 py-2 font-semibold text-slate-700">
                Modules actifs : <strong className="text-[#009688]">{myCourses.length}</strong>
              </span>
              <span className="bg-white border border-slate-200 rounded-lg px-3.5 py-2 font-semibold text-slate-700">
                Moyenne quiz : <strong className="text-[#f59d0e]">{avgQuizScore}%</strong>
              </span>
            </div>
          </div>

          {view !== 'progress' && (
            <div className="flex flex-wrap items-center gap-2.5">
              <LevelSelect
                value={levelFilter}
                onChange={setLevelFilter}
                options={LEVEL_FILTERS}
                size="sm"
              />

              {SUBJECT_FILTERS.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSubjectFilter(subject)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                    subjectFilter === subject
                      ? 'bg-[#009688] border-[#009688] text-white'
                      : 'bg-white border-slate-300 text-slate-600 hover:border-[#009688]'
                  }`}
                >
                  {subject === 'Tous' ? 'Toutes les matières' : subject}
                </button>
              ))}
            </div>
          )}

          {freeEnrollError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
              {freeEnrollError}
            </div>
          )}

          {view === 'progress' ? (
            <div className="space-y-8">
              {/* Suivi des abonnements */}
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

              {/* Suivi des notes aux quiz */}
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
                                {res.quiz?.course?.title || 'Module'} •{' '}
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
          ) : view === 'mine' ? (
            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-5">
                Mes cours ({filteredMine.length})
              </h2>
              {filteredMine.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
                  <p className="font-semibold text-slate-700">
                    {myCourses.length === 0
                      ? "Vous n'avez aucun cours débloqué pour le moment."
                      : 'Aucun cours ne correspond à votre recherche.'}
                  </p>
                  {myCourses.length === 0 && (
                    <button
                      onClick={() => setView('all')}
                      className="mt-3 text-[#009688] font-bold hover:underline cursor-pointer"
                    >
                      Découvrir les cours
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  {filteredMine.map((course) => (
                    <div key={course._id}>{renderCard(course, true)}</div>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <>
              {filteredMine.length > 0 && (
                <section>
                  <div className="flex items-end justify-between mb-5">
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Continuer mes cours
                    </h2>
                    <button
                      onClick={() => setView('mine')}
                      className="text-sm font-semibold text-[#009688] hover:underline cursor-pointer"
                    >
                      Tout afficher
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {filteredMine.slice(0, 4).map((course) => (
                      <div key={course._id}>{renderCard(course, true)}</div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-xl font-extrabold text-slate-900">Nos cours disponibles</h2>
                <p className="text-slate-500 text-sm mt-1 mb-5">
                  Découvrez les modules disponibles ({filteredCatalog.length}).
                </p>

                {catalog.length === 0 ? (
                  <p className="text-slate-400 text-sm">
                    Tous les cours disponibles sont débloqués dans votre espace !
                  </p>
                ) : filteredCatalog.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
                    Aucun cours ne correspond à votre recherche.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {filteredCatalog.map((course) => (
                      <div key={course._id}>{renderCard(course, false)}</div>
                    ))}
                  </div>
                )}
              </section>
            </>
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
                  Le module <strong>{selectedCourse.title}</strong> est désormais débloqué.
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
                  Accéder au cours
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#009688]" />
                  <span>Paiement Mobile FCFA</span>
                </h3>
                <p className="text-slate-500 text-xs mb-6">
                  Réglez votre abonnement Wave ou Orange Money pour le module :{' '}
                  <strong>{selectedCourse.title}</strong> ({selectedCourse.price ?? 6000} FCFA).
                </p>

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
