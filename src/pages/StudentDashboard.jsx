import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
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
} from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

const SUBJECT_FILTERS = ['Tous', 'Mathématiques', 'Physique-Chimie'];
const formatLevel = (level) => (level === 'TS' ? 'Terminale S' : level);

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [myCourses, setMyCourses] = useState([]);
  const [catalog, setCatalog] = useState([]);
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

  // Interface (menu latéral, recherche, filtres)
  const location = useLocation();
  // La page d'un cours peut renvoyer ici avec une vue ("Mes cours") ou une recherche
  const [view, setView] = useState(location.state?.view || 'all'); // 'all' | 'mine'
  const [query, setQuery] = useState(location.state?.query || '');
  const [subjectFilter, setSubjectFilter] = useState('Tous');
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
      const allCourses = await api('/courses');
      const mySubs = await api('/subscriptions/my');

      const activeCourseIds = mySubs
        .filter(sub => sub.course && sub.status === 'active' && new Date(sub.expiresAt) > new Date())
        .map(sub => sub.course._id);

      const enrolled = allCourses.filter(c => activeCourseIds.includes(c._id));
      const available = allCourses.filter(c => !activeCourseIds.includes(c._id));

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

  const handleCardClick = (course) => {
    navigate(`/courses/${course._id}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Filtrage par recherche (barre du haut) et par matière
  const q = query.trim().toLowerCase();
  const matches = (c) =>
    (subjectFilter === 'Tous' || c.subject === subjectFilter) &&
    (!q || `${c.title} ${c.subject} ${c.level}`.toLowerCase().includes(q));

  const filteredMine = myCourses.filter(matches);
  const filteredCatalog = catalog.filter(matches);

  const firstName = user?.name ? user.name.trim().split(' ')[0] : '';

  // Carte de cours (style Bakeli) : image, matière + niveau, titre, action
  const renderCard = (course, enrolled) => {
    const courseIsFree = course.isFree || course.price === 0;

    return (
      <div
        onClick={() => handleCardClick(course)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleCardClick(course);
        }}
        className="group h-full flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer"
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
            <span className="text-[11px] font-semibold bg-orange-50 text-orange-500 rounded-full px-2.5 py-0.5 shrink-0">
              {formatLevel(course.level)}
            </span>
          </div>

          <h3 className="text-[15px] font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.6rem] flex items-start justify-between gap-2">
            <span>{course.title}</span>
            {!enrolled && <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />}
          </h3>

          <div className="mt-auto pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
            {enrolled ? (
              <>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  Abonnement actif
                </span>
                <span className="text-[#2f4fd8] text-sm font-bold flex items-center gap-1">
                  Étudier <ChevronRight className="w-4 h-4" />
                </span>
              </>
            ) : courseIsFree ? (
              <>
                <span className="text-sm font-extrabold text-emerald-600">Gratuit</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEnrollFree(course);
                  }}
                  disabled={enrollingFreeId === course._id}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                >
                  {enrollingFreeId === course._id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Accéder gratuitement</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <span className="text-xs text-slate-500">Accès 1 an</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startPayment(course);
                  }}
                  className="px-3 py-1.5 bg-[#0b1f49] hover:bg-[#2f4fd8] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>S'abonner</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  const sidebarItems = [
    { key: 'all', label: 'Tous les cours', icon: LayoutGrid },
    { key: 'mine', label: 'Mes cours', icon: BookOpen, count: myCourses.length },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Barre du haut : logo, recherche, menu utilisateur */}
      <header className="fixed top-0 inset-x-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="shrink-0">
          <img src={logo} alt="Aliou Sow Academy" className="h-10 w-auto" />
        </Link>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex-1 max-w-xl flex items-center bg-slate-50 border border-slate-200 rounded-full pl-5 pr-1.5 py-1.5"
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
            className="w-9 h-9 rounded-full bg-[#d6a74a] hover:bg-[#b8862b] text-white flex items-center justify-center shrink-0 cursor-pointer transition"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center">
              <User className="w-5 h-5" />
            </span>
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
          className="md:hidden fixed inset-0 top-16 bg-black/30 z-20"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 bg-white border-r border-slate-200 z-30 px-4 py-6 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <p className="text-[11px] font-bold tracking-wider text-slate-400 px-2 mb-3">MES COURS</p>
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  active ? 'bg-amber-50 text-[#0b1f49]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    active ? 'bg-[#d6a74a] text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {typeof item.count === 'number' && (
                  <span className="text-xs text-slate-400">{item.count}</span>
                )}
                {active && <ChevronRight className="w-4 h-4 text-[#b8862b]" />}
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

      {/* Bouton pour replier / ouvrir le menu */}
      <button
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label={sidebarOpen ? 'Replier le menu' : 'Ouvrir le menu'}
        className={`fixed top-[5.5rem] z-30 w-7 h-7 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center text-slate-600 hover:text-[#0b1f49] cursor-pointer transition-all duration-300 ${
          sidebarOpen ? 'left-[15.125rem]' : 'left-2'
        }`}
      >
        {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Contenu principal */}
      <main className={`pt-16 min-h-screen transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Bonjour{firstName ? `, ${firstName}` : ''} 
            </h1>
            <p className="text-slate-500 mt-1">Suivez vos cours et découvrez de nouveaux modules.</p>
          </div>

          {/* Filtres par matière */}
          <div className="flex flex-wrap items-center gap-2">
            {SUBJECT_FILTERS.map((subject) => (
              <button
                key={subject}
                onClick={() => setSubjectFilter(subject)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition cursor-pointer ${
                  subjectFilter === subject
                    ? 'bg-[#0b1f49] border-[#0b1f49] text-white'
                    : 'bg-white border-slate-300 text-slate-600 hover:border-[#0b1f49]'
                }`}
              >
                {subject === 'Tous' ? 'Toutes les matières' : subject}
              </button>
            ))}
          </div>

          {freeEnrollError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
              {freeEnrollError}
            </div>
          )}

          {view === 'mine' ? (
            <section>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-5">
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
                      className="mt-3 text-[#2f4fd8] font-bold hover:underline cursor-pointer"
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
                    <h2 className="text-2xl font-extrabold text-slate-900">Continuer mes cours</h2>
                    <button
                      onClick={() => setView('mine')}
                      className="text-[#2f4fd8] font-bold hover:underline cursor-pointer"
                    >
                      Tout afficher
                    </button>
                  </div>
                  <div className="flex gap-5 overflow-x-auto pb-3">
                    {filteredMine.map((course) => (
                      <div key={course._id} className="w-[250px] shrink-0">
                        {renderCard(course, true)}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-2xl font-extrabold text-slate-900">Nos cours</h2>
                <p className="text-slate-500 mt-1 mb-5">
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

      {selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 border border-slate-100 relative flex flex-col slide-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              ✕
            </button>

            {paymentSuccess ? (
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Abonnement Réussi !</h3>
                <p className="text-slate-600 text-sm">
                  Le module <strong>{selectedCourse.title}</strong> est désormais débloqué.
                </p>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left text-xs space-y-1 font-mono">
                  <div className="text-slate-500">Transaction ID: {transactionId}</div>
                  <div className="text-slate-500">Montant: {selectedCourse.price} FCFA</div>
                  <div className="text-emerald-600">Statut: Validé</div>
                </div>

                {emailPreviewUrl && (
                  <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-left text-xs space-y-1">
                    <span className="flex items-center gap-1 text-xs font-bold text-indigo-600">
                      <Sparkles className="w-3 h-3 animate-pulse" />
                      E-MAIL DE PAIEMENT GÉNÉRÉ
                    </span>
                    <a
                      href={emailPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-indigo-600 hover:text-indigo-700 font-bold underline"
                    >
                      Prévisualiser l'email de confirmation ↗
                    </a>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedCourse(null);
                    navigate(`/courses/${selectedCourse._id}`);
                  }}
                  className="w-full btn-neon text-white font-bold py-3 rounded-xl cursor-pointer"
                >
                  Accéder au cours
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                  <span>Simulateur de Paiement FCFA</span>
                </h3>
                <p className="text-slate-500 text-xs mb-6">
                  Simulez un virement Wave ou Orange Money pour le cours : <strong>{selectedCourse.title}</strong> (6000 FCFA).
                </p>

                {errorMessage && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-xs mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSimulatePayment} className="space-y-6">
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
                      <span className="text-[10px] opacity-75">Frais à 1%</span>
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
                      <span className="text-[10px] opacity-75">Sénégal / Mali / etc</span>
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
                        className="input-animated pl-10"
                        placeholder="77 123 45 67"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg flex justify-between text-xs border border-slate-100 font-semibold">
                    <span className="text-slate-500">Total à payer :</span>
                    <span className="text-slate-900">{selectedCourse.price} FCFA</span>
                  </div>

                  <button
                    type="submit"
                    disabled={paying}
                    className="w-full btn-neon text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {paying ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Confirmer le paiement simulé</span>
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