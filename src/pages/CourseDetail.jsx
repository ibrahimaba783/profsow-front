import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';
import api from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';
import { Play, FileText, Video, Send, Plus, Trash2, Check, AlertCircle, MessageSquare, Info, Award, GraduationCap, Lock, MessageCircle as MeetIcon, CreditCard, Smartphone, CheckCircle2, BookOpen, Clock, ChevronDown, Star, Search, LogOut, User, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, LayoutGrid, LayoutDashboard, Settings, Users, BarChart2, X } from 'lucide-react';

// Cadre de l'espace connecté (comme sur Bakeli) : barre du haut + menu latéral repliable.
// Pour un visiteur non connecté, on affiche simplement la page (la barre publique de l'app reste visible).
const CourseShell = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  if (!user) return children;

  const isStaff = user.role === 'teacher' || user.role === 'admin';
  const dashboardPath =
    user.role === 'admin'
      ? '/admin-dashboard'
      : user.role === 'teacher'
      ? '/teacher-dashboard'
      : '/student-dashboard';
  const navItems = isStaff
    ? [
        {
          label: user.role === 'admin' ? 'Back-Office Admin' : 'Mon espace',
          icon: LayoutDashboard,
          to: dashboardPath,
        },
        ...(user.role === 'admin'
          ? [{ label: 'Vue Professeur', icon: BookOpen, to: '/teacher-dashboard' }]
          : []),
      ]
    : [
        { label: 'Tous les cours', icon: LayoutGrid, to: dashboardPath, state: { view: 'all' } },
        { label: 'Mes cours', icon: BookOpen, to: dashboardPath, state: { view: 'mine' } },
      ];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(dashboardPath, { state: { query: query.trim() } });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="fixed top-0 inset-x-0 h-[72px] bg-white border-b border-slate-200 z-40 flex items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="shrink-0">
          <img src={logo} alt="Aliou Sow Academy" className="h-10 w-auto" />
        </Link>

        <form
          onSubmit={handleSearch}
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
            className="w-9 h-9 rounded-full bg-[#f59d0e] hover:bg-[#e08b00] text-white flex items-center justify-center shrink-0 cursor-pointer transition"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        <div className="relative shrink-0">
          <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 cursor-pointer">
            {user.avatar && !avatarError ? (
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <span className="w-9 h-9 rounded-full bg-[#009688] text-white flex items-center justify-center">
                <User className="w-5 h-5" />
              </span>
            )}
            <span className="hidden sm:block text-sm font-semibold text-slate-800 max-w-[140px] truncate">
              {user.name}
            </span>
            <ChevronDown className="hidden sm:block w-4 h-4 text-slate-400" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
              <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-3 z-50">
                <div className="px-4 pb-3 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-500">{user.name}</p>
                  <p className="text-sm text-slate-800 truncate">{user.email}</p>
                </div>
                <Link
                  to={dashboardPath}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Tableau de bord
                </Link>
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

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 top-[72px] bg-black/30 z-20"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      <aside
        className={`fixed top-[72px] bottom-0 left-0 w-64 bg-white border-r border-slate-200 z-30 px-4 py-6 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <p className="text-[11px] font-bold tracking-wider text-slate-400 px-2 mb-3">MES COURS</p>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                state={item.state}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="flex-1 text-left">{item.label}</span>
              </Link>
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
        className={`fixed top-[5.75rem] z-30 w-7 h-7 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center text-slate-600 hover:text-[#009688] cursor-pointer transition-all duration-300 ${
          sidebarOpen ? 'left-[15.125rem]' : 'left-2'
        }`}
      >
        {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      <main className={`pt-[72px] min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : ''}`}>
        {children}
      </main>
    </div>
  );
};

// Section "Laisser un avis" + liste des avis (en bas de la page du cours, comme sur Bakeli).
// Utilise l'API : GET /reviews/:courseId et POST /reviews/:courseId
const CourseReviews = ({ courseId, canReview, isLoggedIn }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api(`/reviews/${courseId}`);
        if (!cancelled) setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setReviews([]);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const average =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    setError('');
    try {
      const saved = await api(`/reviews/${courseId}`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment: comment.trim() }),
      });
      setReviews([saved, ...reviews]);
      setRating(0);
      setComment('');
    } catch (err) {
      setError(err.message || "Impossible de publier votre avis pour le moment");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value, size = 'w-4 h-4') => (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= value ? 'text-[#f59d0e] fill-[#f59d0e]' : 'text-slate-300'}`}
        />
      ))}
    </span>
  );

  return (
    <div className="space-y-4">
      {!isLoggedIn && (
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-600 shadow-sm">
          <Link to="/login" className="font-semibold text-[#009688] hover:underline">
            Connectez-vous
          </Link>{' '}
          pour laisser un avis sur ce module.
        </div>
      )}

      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm">
      {canReview && (
        <form
          onSubmit={handleSubmit}
          className="border border-[#f59d0e] rounded-xl p-5 sm:p-6 space-y-4 mb-8"
        >
          <h3 className="text-lg font-bold text-slate-900">Laisser un avis</h3>

          <div>
            <p className="text-sm text-slate-700 mb-2">Votre note</p>
            <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
                  className="cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 transition ${
                      n <= (hoverRating || rating) ? 'text-[#f59d0e] fill-[#f59d0e]' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-2">
              Commentaire <span className="text-slate-400">(facultatif)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Partagez votre expérience avec ce module..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#009688] focus:ring-2 focus:ring-[#009688]/20 resize-none"
            ></textarea>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={!rating || submitting}
            className="px-6 py-2.5 bg-[#009688] hover:bg-[#00796b] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition cursor-pointer"
          >
            {submitting ? 'Publication...' : "Publier l'avis"}
          </button>
        </form>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {reviews.length === 0 ? 'Aucun avis pour le moment' : `Avis des élèves (${reviews.length})`}
          </h3>
          {reviews.length === 0 && (
            <p className="text-sm text-slate-400 mt-1">
              Soyez le premier à donner votre avis sur ce module !
            </p>
          )}
        </div>
        {reviews.length > 0 && (
          <span className="flex items-center gap-2 text-sm text-slate-600">
            {renderStars(Math.round(average))}
            <span className="font-bold text-slate-900">{average.toFixed(1)}</span>
          </span>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id || `${r.createdAt}-${r.student?.name}`} className="flex gap-3 border-t border-slate-100 pt-4">
              <span className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 text-sm font-bold flex items-center justify-center shrink-0">
                {(r.student?.name || 'É').trim().charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">{r.student?.name || 'Élève'}</span>
                  {renderStars(r.rating, 'w-3.5 h-3.5')}
                  {r.createdAt && (
                    <span className="text-xs text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
                {r.comment && (
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap break-words">
                    {r.comment}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </section>
    </div>
  );
};

const formatRelativeTime = (dateValue) => {
  if (!dateValue) return '';
  const diffMs = Date.now() - new Date(dateValue).getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60000));
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days} j`;
  const months = Math.floor(days / 30);
  return `il y a environ ${months} mois`;
};

const formatLevelLabel = (lvl) => (lvl === 'TS' ? 'Terminale S' : lvl);

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);
  const isStaff = user?.role === 'teacher' || user?.role === 'admin';
  const features = settings.features || {};
  const sequentialUnlock = features.enableSequentialUnlock !== false;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content'); // content, discussion, quizzes
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checkingSub, setCheckingSub] = useState(true);
  const [openPreviewChapters, setOpenPreviewChapters] = useState({});
  const [previewTab, setPreviewTab] = useState('content'); // content, info, qa (page publique du cours)
  const [enrollingFree, setEnrollingFree] = useState(false);
  const [freeEnrollError, setFreeEnrollError] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Wave');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [payEmailPreview, setPayEmailPreview] = useState('');

  // Leçon active
  const [activeLesson, setActiveLesson] = useState(null);

  // Édition Prof (Chapitres / Leçons)
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState('video');
  const [newLessonYoutube, setNewLessonYoutube] = useState('');
  const [newLessonMeet, setNewLessonMeet] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonPdf, setNewLessonPdf] = useState(null);
  const [addingLesson, setAddingLesson] = useState(false);

  // Discussions (Chat)
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef(null);

  // Quizzes
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  
  // Créateur / Édition de Quiz (Prof)
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null); // null = création, sinon id du quiz en cours de modification
  const [quizTitle, setQuizTitle] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([
    { questionText: '', options: ['', ''], correctAnswerIndex: 0 }
  ]);
  const [savingQuiz, setSavingQuiz] = useState(false);

  // Aperçu Prof (tester un quiz sans enregistrer de vraie tentative)
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Résultats des élèves pour un quiz donné (vue Prof)
  const [viewingResultsQuiz, setViewingResultsQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [toast, setToast] = useState({ type: '', text: '' });
  const [confirmState, setConfirmState] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Progression & Interface Bakeli Explorer
  const [completedLessons, setCompletedLessons] = useState([]);
  const [togglingProgress, setTogglingProgress] = useState(false);
  const [interactionTab, setInteractionTab] = useState('qa');
  const [qaSearch, setQaSearch] = useState('');
  const [showQaForm, setShowQaForm] = useState(false);
  const [curriculumTab, setCurriculumTab] = useState('content');
  const [openCurriculumChapters, setOpenCurriculumChapters] = useState({});

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast((prev) => (prev.text === text ? { type: '', text: '' } : prev)), 4000);
  };

  const executeConfirm = async () => {
    if (!confirmState?.onConfirm) return;
    setConfirmLoading(true);
    try {
      await confirmState.onConfirm();
      setConfirmState(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [id, user?._id]);

  useEffect(() => {
    if (isSubscribed || isStaff) {
      fetchDiscussions();
      fetchQuizzes();
    }
  }, [isSubscribed, isStaff, id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const data = await api(`/courses/${id}`);
      setCourse(data);

      if (isStaff) {
        setIsSubscribed(true);
        try {
          const saved = JSON.parse(localStorage.getItem(`progress_${id}`) || '[]');
          setCompletedLessons(Array.isArray(saved) ? saved : []);
        } catch {
          setCompletedLessons([]);
        }
        setCheckingSub(false);
      } else if (user) {
        // Vérifier l'abonnement
        const subCheck = await api(`/subscriptions/check/${id}`);
        setIsSubscribed(subCheck.isSubscribed);
        const serverProgress = subCheck.subscription?.completedLessons;
        setCompletedLessons(Array.isArray(serverProgress) ? serverProgress.map(String) : []);
        setCheckingSub(false);
      } else {
        setCheckingSub(false);
      }

      // Sélectionner la première leçon par défaut si elle existe
      if (data.chapters?.[0]?.lessons?.[0]) {
        setActiveLesson(data.chapters[0].lessons[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussions = async () => {
    try {
      const messagesData = await api(`/discussions/${id}`);
      setMessages(messagesData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const quizData = await api(`/quizzes/course/${id}`);
      setQuizzes(quizData);
    } catch (err) {
      console.error(err);
    }
  };

  // --- ACTIONS PROF ---
  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!newChapterTitle) return;
    try {
      const updated = await api(`/courses/${id}/chapters`, {
        method: 'POST',
        body: JSON.stringify({ title: newChapterTitle }),
      });
      setCourse(updated);
      setNewChapterTitle('');
      setShowAddChapter(false);
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleDeleteChapter = (chapterId) => {
    const ch = course?.chapters?.find((c) => c._id === chapterId);
    setConfirmState({
      title: 'Supprimer ce chapitre',
      message: ch ? `Supprimer le chapitre "${ch.title}" ?` : 'Voulez-vous supprimer ce chapitre ?',
      details: 'Toutes les leçons contenues dans ce chapitre seront également supprimées.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const updated = await api(`/courses/${id}/chapters/${chapterId}`, {
            method: 'DELETE',
          });
          setCourse(updated);
          if (activeLesson && !updated.chapters.some(c => c.lessons.some(l => l._id === activeLesson._id))) {
            setActiveLesson(null);
          }
          showToast('success', 'Chapitre supprimé.');
        } catch (err) {
          showToast('error', err.message);
        }
      },
    });
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    setAddingLesson(true);
    const formData = new FormData();
    formData.append('title', newLessonTitle);
    formData.append('contentType', newLessonType);
    if (newLessonType === 'video') formData.append('youtubeUrl', newLessonYoutube);
    if (newLessonType === 'meet') formData.append('meetLink', newLessonMeet);
    if (newLessonType === 'text') formData.append('content', newLessonContent);
    if (newLessonType === 'pdf' && newLessonPdf) {
      formData.append('pdf', newLessonPdf);
    }

    try {
      const updated = await api(`/courses/${id}/chapters/${selectedChapterId}/lessons`, {
        method: 'POST',
        body: formData,
      });
      setCourse(updated);
      // Reset form
      setNewLessonTitle('');
      setNewLessonYoutube('');
      setNewLessonMeet('');
      setNewLessonContent('');
      setNewLessonPdf(null);
      setSelectedChapterId(null);
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setAddingLesson(false);
    }
  };

  const handleDeleteLesson = (chapterId, lessonId) => {
    const ch = course?.chapters?.find((c) => c._id === chapterId);
    const ls = ch?.lessons?.find((l) => l._id === lessonId);
    setConfirmState({
      title: 'Supprimer cette leçon',
      message: ls ? `Supprimer la leçon "${ls.title}" ?` : 'Voulez-vous supprimer cette leçon ?',
      details: 'Cette leçon ne sera plus accessible aux élèves inscrits.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const updated = await api(`/courses/${id}/chapters/${chapterId}/lessons/${lessonId}`, {
            method: 'DELETE',
          });
          setCourse(updated);
          if (activeLesson?._id === lessonId) {
            setActiveLesson(null);
          }
          showToast('success', 'Leçon supprimée.');
        } catch (err) {
          showToast('error', err.message);
        }
      },
    });
  };

  // --- DISCUSSION CHAT ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSendingMessage(true);

    try {
      const savedMessage = await api(`/discussions/${id}`, {
        method: 'POST',
        body: JSON.stringify({ message: newMessage }),
      });
      setMessages([...messages, savedMessage]);
      setNewMessage('');
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  // --- ACTIONS QUIZ ---
  const handleSelectQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setQuizAnswers({});
    setQuizScore(null);
    setIsPreviewMode(false);
    setShowAddQuiz(false);
    setViewingResultsQuiz(null);
  };

  // Le prof peut tester son propre quiz sans que ça enregistre une vraie
  // tentative en base (pas d'appel à /submit, calcul fait localement).
  const handlePreviewQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setQuizAnswers({});
    setQuizScore(null);
    setIsPreviewMode(true);
    setShowAddQuiz(false);
    setViewingResultsQuiz(null);
  };

  const handleSelectQuizAnswer = (questionIdx, answerIdx) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionIdx]: answerIdx
    });
  };

  const handleSubmitQuiz = async () => {
    // Mode aperçu (prof) : on calcule le score localement, sans appeler
    // l'API ni créer de QuizResult en base.
    if (isPreviewMode) {
      let score = 0;
      activeQuiz.questions.forEach((q, idx) => {
        if (quizAnswers[idx] !== undefined && quizAnswers[idx] === q.correctAnswerIndex) {
          score++;
        }
      });
      const total = activeQuiz.questions.length;
      setQuizScore({
        score,
        total,
        percentage: Math.round((score / total) * 100),
      });
      return;
    }

    setSubmittingQuiz(true);

    try {
      const res = await api(`/quizzes/${activeQuiz._id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers: quizAnswers })
      });
      setQuizScore({
        score: res.score,
        total: res.totalQuestions,
        percentage: res.percentage
      });
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const addQuestionField = () => {
    setQuizQuestions([
      ...quizQuestions,
      { questionText: '', options: ['', ''], correctAnswerIndex: 0 }
    ]);
  };

  const removeQuestionField = (idx) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== idx));
  };

  const updateQuestionText = (idx, text) => {
    const updated = [...quizQuestions];
    updated[idx].questionText = text;
    setQuizQuestions(updated);
  };

  const updateOptionText = (qIdx, oIdx, text) => {
    const updated = [...quizQuestions];
    updated[qIdx].options[oIdx] = text;
    setQuizQuestions(updated);
  };

  const addOptionField = (qIdx) => {
    const updated = [...quizQuestions];
    updated[qIdx].options.push('');
    setQuizQuestions(updated);
  };

  const removeOptionField = (qIdx, oIdx) => {
    const updated = [...quizQuestions];
    updated[qIdx].options = updated[qIdx].options.filter((_, i) => i !== oIdx);
    setQuizQuestions(updated);
  };

  const setCorrectAnswer = (qIdx, oIdx) => {
    const updated = [...quizQuestions];
    updated[qIdx].correctAnswerIndex = oIdx;
    setQuizQuestions(updated);
  };

  const resetQuizForm = () => {
    setQuizTitle('');
    setQuizQuestions([{ questionText: '', options: ['', ''], correctAnswerIndex: 0 }]);
    setEditingQuizId(null);
    setShowAddQuiz(false);
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    setSavingQuiz(true);
    try {
      if (editingQuizId) {
        // Modification d'un quiz existant
        const updated = await api(`/quizzes/${editingQuizId}`, {
          method: 'PUT',
          body: JSON.stringify({ title: quizTitle, questions: quizQuestions }),
        });
        setQuizzes(quizzes.map(q => (q._id === editingQuizId ? updated : q)));
      } else {
        // Création d'un nouveau quiz
        const quiz = await api('/quizzes', {
          method: 'POST',
          body: JSON.stringify({
            courseId: id,
            title: quizTitle,
            questions: quizQuestions
          })
        });
        setQuizzes([...quizzes, quiz]);
      }
      resetQuizForm();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuizId(quiz._id);
    setQuizTitle(quiz.title);
    // Copie profonde pour ne pas modifier l'objet du state `quizzes` directement
    setQuizQuestions(quiz.questions.map(q => ({ ...q, options: [...q.options] })));
    setShowAddQuiz(true);
    setViewingResultsQuiz(null);
  };

  const handleDeleteQuiz = (quizId) => {
    const qz = quizzes.find((q) => q._id === quizId);
    setConfirmState({
      title: 'Supprimer ce quiz',
      message: qz ? `Supprimer le quiz "${qz.title}" ?` : 'Voulez-vous vraiment supprimer ce quiz ?',
      details: 'Les résultats enregistrés par les élèves pour ce quiz seront également supprimés.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api(`/quizzes/${quizId}`, { method: 'DELETE' });
          setQuizzes(quizzes.filter(q => q._id !== quizId));
          if (editingQuizId === quizId) resetQuizForm();
          showToast('success', 'Quiz supprimé.');
        } catch (err) {
          showToast('error', err.message);
        }
      },
    });
  };

  const handleViewResults = async (quiz) => {
    setViewingResultsQuiz(quiz);
    setShowAddQuiz(false);
    setLoadingResults(true);
    try {
      const allResults = await api('/quizzes/teacher/results');
      setQuizResults(allResults.filter(r => r.quiz?._id === quiz._id));
    } catch (err) {
      console.error(err);
      setQuizResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  // Cloudinary sert les fichiers "raw" (dont les PDF) avec Content-Disposition: attachment
  // par défaut, ce qui force un téléchargement automatique dès que le navigateur charge l'URL
  // (par exemple dans la balise <embed> ci-dessous, sans même que l'utilisateur clique).
  // On force l'affichage inline avec le flag fl_attachment:false.
  const getInlinePdfUrl = (url) => {
    if (!url) return url;
    if (url.includes('fl_attachment')) return url;
    return url.replace('/upload/', '/upload/fl_attachment:false/');
  };

  const extractYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getLessonTypeIcon = (contentType) => {
    switch (contentType) {
      case 'video':
        return Video;
      case 'pdf':
        return FileText;
      case 'meet':
      case 'jitsi':
        return MeetIcon;
      default:
        return Play;
    }
  };

  const getLessonPrefix = (contentType) => {
    switch (contentType) {
      case 'video':
        return 'Vidéo : ';
      case 'pdf':
        return 'PDF : ';
      case 'meet':
      case 'jitsi':
        return 'Direct : ';
      default:
        return 'Contenu : ';
    }
  };

  const handlePayCourse = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.trim().length < 9) {
      setPayError('Veuillez entrer un numéro de téléphone valide');
      return;
    }
    setPaying(true);
    setPayError('');
    const prefix = paymentMethod === 'Wave' ? 'WV-' : 'OM-';
    const fakeTxId = prefix + Math.random().toString(36).substring(2, 10).toUpperCase();
    try {
      const res = await api('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          courseId: id,
          paymentMethod,
          transactionId: fakeTxId,
          amount: course.price || 6000,
          durationMonths: 12,
        }),
      });
      if (res?.emailPreviewUrl) setPayEmailPreview(res.emailPreviewUrl);
      setShowPayModal(false);
      setIsSubscribed(true);
      await fetchCourseDetails();
    } catch (err) {
      setPayError(err.message || 'Le paiement a échoué');
    } finally {
      setPaying(false);
    }
  };

  const handleEnrollFree = async () => {
    setEnrollingFree(true);
    setFreeEnrollError('');
    try {
      await api(`/subscriptions/enroll-free/${id}`, { method: 'POST' });
      setIsSubscribed(true);
      await fetchCourseDetails(); // Recharge le cours pour obtenir le contenu complet désormais débloqué
    } catch (err) {
      setFreeEnrollError(err.message || "Impossible d'activer ce cours gratuit pour le moment");
    } finally {
      setEnrollingFree(false);
    }
  };

  const handleToggleLessonComplete = async (lessonId, desiredState, nextLessonAfter = null) => {
    if (!lessonId) return;
    const targetId = String(lessonId);
    const alreadyDone = completedLessons.includes(targetId);
    const nextCompleted = typeof desiredState === 'boolean' ? desiredState : !alreadyDone;

    if (isStaff) {
      const nextList = nextCompleted
        ? [...new Set([...completedLessons, targetId])]
        : completedLessons.filter((item) => item !== targetId);
      setCompletedLessons(nextList);
      try {
        localStorage.setItem(`progress_${id}`, JSON.stringify(nextList));
      } catch {
        // ignore storage errors
      }
      if (nextCompleted && nextLessonAfter) {
        setActiveLesson(nextLessonAfter);
      }
      return;
    }

    setTogglingProgress(true);
    try {
      const res = await api(`/subscriptions/progress/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ lessonId: targetId, completed: nextCompleted }),
      });
      const nextList = Array.isArray(res.completedLessons)
        ? res.completedLessons.map(String)
        : nextCompleted
        ? [...new Set([...completedLessons, targetId])]
        : completedLessons.filter((item) => item !== targetId);
      setCompletedLessons(nextList);
      if (nextCompleted) {
        showToast('success', nextLessonAfter ? 'Leçon terminée ! Passage à la suite.' : 'Leçon marquée comme terminée !');
        if (nextLessonAfter) {
          setActiveLesson(nextLessonAfter);
        }
      }
    } catch (err) {
      showToast('error', err.message || 'Impossible de mettre à jour votre progression');
    } finally {
      setTogglingProgress(false);
    }
  };

  if (loading || checkingSub) {
    return (
      <CourseShell>
        <div className="min-h-[70vh] flex items-center justify-center pt-20">
          <div className="loader-spinner"></div>
        </div>
      </CourseShell>
    );
  }

  if (!course) {
    return (
      <CourseShell>
        <div className="min-h-[70vh] flex flex-col items-center justify-center pt-24 px-4 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Module introuvable</h2>
          <p className="text-sm text-slate-500 mb-6">Ce module n'existe pas ou a été supprimé.</p>
          <Link to="/courses" className="px-6 py-2.5 rounded-full bg-[#009688] hover:bg-[#00796b] text-white text-sm font-semibold transition">
            Voir tous les modules
          </Link>
        </div>
      </CourseShell>
    );
  }

  // IMPORTANT : on affiche un APERÇU public (page de présentation du cours, comme sur Bakeli)
  // à tous ceux qui n'ont pas d'accès complet — y compris les visiteurs non connectés
  // (user === null). Le contenu pédagogique réel (vidéos, PDF, liens Meet) reste caché :
  // seuls les titres des chapitres/leçons sont visibles, avec un cadenas.
  if (!isSubscribed && !isStaff) {
    const toggleChapter = (chapterId, currentlyOpen) => {
      setOpenPreviewChapters((prev) => ({ ...prev, [chapterId]: !currentlyOpen }));
    };

    const courseIsFree = course.isFree || course.price === 0;
    const coursePrice = courseIsFree ? 0 : (course.price || 6000);
    const levelLabel = course.level === 'TS' ? 'Terminale S' : course.level;
    const teacherName = course.teacher?.name || 'Aliou Sow';
    const teacherInitials = teacherName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || '')
      .join('') || 'AS';
    const chaptersCount = course.chaptersCount ?? course.chapters?.length ?? 0;
    const lessonsCount =
      course.lessonsCount ??
      (course.chapters || []).reduce((total, ch) => total + (ch.lessons?.length || 0), 0);
    const studentsCount = course.studentsCount ?? 0;
    const totalCoursesCount = course.totalCoursesCount ?? 1;

    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

    const previewTabs = [
      { key: 'content', label: 'Contenu' },
      { key: 'info', label: 'Informations de base' },
      { key: 'qa', label: 'Q&A' },
    ];

    const orangeBtn =
      'w-full bg-[#f59d0e] hover:bg-[#e08b00] disabled:opacity-60 text-white font-bold px-6 py-3 rounded-lg text-sm text-center flex items-center justify-center gap-2 transition cursor-pointer shadow-sm';

    return (
      <CourseShell>
        <div className={`min-h-screen bg-slate-50/70 pb-16 text-slate-800 ${user ? '' : 'pt-[72px]'}`}>
          {/* ===== Bannière pleine largeur (Format exact Bakeli Learning) ===== */}
          <section className="bg-[#009688] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-20 lg:pb-24">
              <div className="lg:w-2/3 lg:pr-12">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">
                    {course.subject}
                  </span>
                  <span className="text-xs bg-[#f59d0e] text-white px-3 py-1 rounded-full font-bold">
                    {levelLabel}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight">
                  {course.title}
                </h1>

                {course.description && (
                  <p className="mt-4 text-sm sm:text-[15px] text-white/95 leading-relaxed whitespace-pre-line">
                    {course.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 mt-6 text-sm text-white/95">
                  <span className="inline-flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-white/85" />
                    {chaptersCount} section{chaptersCount > 1 ? 's' : ''}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Users className="w-4 h-4 text-white/85" />
                    {studentsCount > 0 ? studentsCount : '--'} apprenant{studentsCount > 1 ? 's' : ''}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-white/85" />
                    {levelLabel}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ===== Corps : Onglets à gauche, Carte d'accès + Partage + Inclus + Formateur à droite ===== */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 -mt-10 grid grid-cols-1 lg:grid-cols-3 gap-7 items-start">
            {/* Colonne principale gauche */}
            <div className="order-2 lg:order-1 lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div role="tablist" className="flex border-b border-slate-200 px-3 sm:px-5 overflow-x-auto">
                  {previewTabs.map((tab) => (
                    <button
                      key={tab.key}
                      role="tab"
                      aria-selected={previewTab === tab.key}
                      onClick={() => setPreviewTab(tab.key)}
                      className={`px-4 sm:px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition cursor-pointer ${
                        previewTab === tab.key
                          ? 'border-[#009688] text-[#009688]'
                          : 'border-transparent text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* --- Onglet Contenu : sections ouvertes, leçons verrouillées avec cadenas --- */}
                {previewTab === 'content' && (
                  <div className="divide-y divide-slate-200">
                    {!course.chapters || course.chapters.length === 0 ? (
                      <p className="text-sm text-slate-400 py-12 px-6 text-center">
                        Le contenu de ce module sera bientôt disponible.
                      </p>
                    ) : (
                      course.chapters.map((chapter) => {
                        const isOpen = openPreviewChapters[chapter._id] ?? true;
                        const lessons = chapter.lessons || [];
                        return (
                          <div key={chapter._id}>
                            <button
                              type="button"
                              onClick={() => toggleChapter(chapter._id, isOpen)}
                              className="w-full flex items-center justify-between gap-3 px-5 sm:px-6 py-4 bg-white hover:bg-slate-50/80 text-left cursor-pointer transition"
                            >
                              <span className="font-bold text-sm sm:text-[15px] text-slate-900">
                                {chapter.title}
                              </span>
                              <ChevronDown
                                className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </button>

                            {isOpen && (
                              <ul className="pb-3 bg-white">
                                {lessons.length === 0 ? (
                                  <li className="px-6 py-2.5 text-sm text-slate-400">
                                    Aucune leçon pour le moment.
                                  </li>
                                ) : (
                                  lessons.map((lesson) => (
                                    <li
                                      key={lesson._id}
                                      className="flex items-center gap-3 px-6 sm:px-7 py-2 text-sm text-slate-600"
                                    >
                                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span className="truncate">
                                        {getLessonPrefix(lesson.contentType)}
                                        {lesson.title}
                                      </span>
                                    </li>
                                  ))
                                )}
                              </ul>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* --- Onglet Informations de base --- */}
                {previewTab === 'info' && (
                  <div className="p-5 sm:p-6 space-y-6 text-sm">
                    {course.description && (
                      <div>
                        <h3 className="font-bold text-slate-900 mb-2">À propos de ce module</h3>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{course.description}</p>
                      </div>
                    )}

                    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: 'Matière', value: course.subject },
                        { label: 'Niveau', value: levelLabel },
                        {
                          label: 'Contenu',
                          value: `${chaptersCount} section${chaptersCount > 1 ? 's' : ''} • ${lessonsCount} leçon${
                            lessonsCount > 1 ? 's' : ''
                          }`,
                        },
                        {
                          label: 'Tarif',
                          value: courseIsFree ? 'Gratuit (0 FCFA)' : `${Number(coursePrice).toLocaleString('fr-FR')} FCFA`,
                        },
                      ]
                        .filter((item) => item.value)
                        .map((item) => (
                          <div key={item.label} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              {item.label}
                            </dt>
                            <dd className="font-bold text-slate-900 mt-1">{item.value}</dd>
                          </div>
                        ))}
                    </dl>
                  </div>
                )}

                {/* --- Onglet Q&A --- */}
                {previewTab === 'qa' && (
                  <div className="p-8 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-teal-50 text-[#009688] flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Questions &amp; Réponses avec M. Aliou Sow</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      Inscrivez-vous à ce module pour poser vos questions directement à M. Aliou Sow et
                      échanger avec les autres élèves dans le salon de discussion.
                    </p>
                  </div>
                )}
              </div>

              {/* ===== Section Avis (sous le bloc onglets sur Bakeli) ===== */}
              {features.enableReviews !== false && (
                <CourseReviews
                  courseId={id}
                  canReview={user?.role === 'student' && isSubscribed}
                  isLoggedIn={!!user}
                />
              )}
            </div>

            {/* Colonne latérale droite (chevauche la bannière verte sur desktop) */}
            <aside className="order-1 lg:order-2 lg:col-span-1 space-y-5 lg:-mt-28 lg:sticky lg:top-24">
              {/* 1. Carte d'accès + tarif + bouton orange Bakeli */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md">
                <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                </div>

                <div className="p-5 space-y-3.5">
                  <div>
                    <div className="flex items-baseline gap-2.5 flex-wrap">
                      <p className="text-2xl font-extrabold text-slate-900">
                        {Number(coursePrice).toLocaleString('fr-FR')} <span className="text-base font-bold">FCFA</span>
                      </p>
                      {!courseIsFree && course.originalPrice > coursePrice && (
                        <span className="text-sm text-slate-400 line-through">
                          {Number(course.originalPrice).toLocaleString('fr-FR')} FCFA
                        </span>
                      )}
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {course.duration
                        ? `Accès pendant ${course.duration}`
                        : courseIsFree
                        ? 'Accès libre après inscription'
                        : 'Accès 1 mois (renouvelable)'}
                    </p>
                  </div>

                  {freeEnrollError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                      {freeEnrollError}
                    </p>
                  )}

                  {courseIsFree ? (
                    user ? (
                      user.role === 'student' ? (
                        features.enableFreeEnrollment === false ? (
                          <div className="w-full bg-slate-100 text-slate-600 font-semibold px-4 py-3 rounded-lg text-xs text-center">
                            Inscription libre temporairement désactivée.
                          </div>
                        ) : (
                          <button
                            onClick={handleEnrollFree}
                            disabled={enrollingFree}
                            className={orangeBtn}
                          >
                            {enrollingFree ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <span>Explorez maintenant !</span>
                            )}
                          </button>
                        )
                      ) : (
                        <Link to={user.role === 'admin' ? '/admin-dashboard' : '/teacher-dashboard'} className={orangeBtn}>
                          {user.role === 'admin' ? 'Back-Office Admin' : 'Tableau de bord enseignant'}
                        </Link>
                      )
                    ) : (
                      <Link to="/login" className={orangeBtn}>
                        Explorez maintenant !
                      </Link>
                    )
                  ) : user ? (
                    user.role === 'student' ? (
                      features.enablePayments === false ? (
                        <div className="w-full bg-amber-50 border border-amber-200 text-amber-800 font-semibold px-4 py-3 rounded-lg text-xs text-center">
                          Paiements en ligne momentanément en pause. Contactez le {settings.channels?.contactPhone || '+221 77 102 33 99'}.
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setPayError('');
                            setPhoneNumber('');
                            setShowPayModal(true);
                          }}
                          className={orangeBtn}
                        >
                          S&apos;abonner maintenant !
                        </button>
                      )
                    ) : (
                      <Link to={user.role === 'admin' ? '/admin-dashboard' : '/teacher-dashboard'} className={orangeBtn}>
                        {user.role === 'admin' ? 'Back-Office Admin' : 'Tableau de bord enseignant'}
                      </Link>
                    )
                  ) : (
                    <Link to="/login" className={orangeBtn}>
                      Explorez maintenant !
                    </Link>
                  )}

                  {!user && (
                    <p className="text-xs text-slate-400 text-center">
                      Pas encore de compte ?{' '}
                      <Link to="/register" className="text-[#009688] hover:underline font-semibold">
                        Inscrivez-vous
                      </Link>
                    </p>
                  )}
                </div>
              </div>

              {/* 2. Carte Partager (Facebook, WhatsApp, TikTok, YouTube) */}
              {features.enableShareButtons !== false && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-3 text-sm">Partager</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    title="Facebook"
                    className="w-10 h-10 rounded-full bg-[#1877F2] hover:opacity-90 text-white flex items-center justify-center transition"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
                    </svg>
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${course.title} — ${pageUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    title="WhatsApp"
                    className="w-10 h-10 rounded-full bg-[#25D366] hover:opacity-90 text-white flex items-center justify-center transition"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.47 0 .1 5.36.1 11.95c0 2.1.55 4.16 1.6 5.97L0 24l6.24-1.64a11.9 11.9 0 0 0 5.82 1.49h.01c6.59 0 11.95-5.36 11.95-11.95 0-3.19-1.24-6.19-3.5-8.42ZM12.07 21.84h-.01a9.87 9.87 0 0 1-5.04-1.38l-.36-.22-3.7.97.99-3.61-.24-.37a9.85 9.85 0 0 1-1.52-5.28c0-5.46 4.44-9.9 9.9-9.9 2.64 0 5.13 1.03 7 2.9a9.84 9.84 0 0 1 2.9 7c0 5.46-4.44 9.91-9.92 9.91Zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.21 5.08 4.5.71.31 1.27.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z" />
                    </svg>
                  </a>
                  <a
                    href={settings.channels?.tiktokUrl || 'https://www.tiktok.com/@aliousow9216'}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    title="TikTok"
                    className="w-10 h-10 rounded-full bg-slate-900 hover:opacity-90 text-white flex items-center justify-center transition"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.46v13.67a2.9 2.9 0 0 1-2.9 2.9 2.9 2.9 0 1 1 2.9-2.9c0-.24-.03-.48-.08-.71v-3.54a6.38 6.38 0 0 0-2.82-.66A6.38 6.38 0 1 0 15.84 17V9.95a8.2 8.2 0 0 0 4.8 1.54V8.03a4.85 4.85 0 0 1-1.05-.12Z" />
                    </svg>
                  </a>
                  <a
                    href={settings.channels?.youtubeUrl || 'https://youtube.com/@dermannaltv4340?si=Jk86Ads8TMVEx6vv'}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    title="YouTube"
                    className="w-10 h-10 rounded-full bg-[#FF0000] hover:opacity-90 text-white flex items-center justify-center transition"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23 12s0-3.6-.46-5.32a2.94 2.94 0 0 0-2.07-2.08C18.75 4.14 12 4.14 12 4.14s-6.75 0-8.47.46A2.94 2.94 0 0 0 1.46 6.68C1 8.4 1 12 1 12s0 3.6.46 5.32a2.94 2.94 0 0 0 2.07 2.08C5.25 19.86 12 19.86 12 19.86s6.75 0 8.47-.46a2.94 2.94 0 0 0 2.07-2.08C23 15.6 23 12 23 12ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z" />
                    </svg>
                  </a>
                </div>
              </div>
              )}

              {/* 3. Ce qui est inclus (5 lignes avec icônes colorées Bakeli adaptées au cahier de charge) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-4 text-sm">Ce qui est inclus</h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3.5">
                    <span className="w-9 h-9 rounded-lg bg-teal-50 text-[#009688] flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4" />
                    </span>
                    <div className="leading-tight">
                      <p className="text-sm font-bold text-slate-900">Vidéos &amp; cours en direct</p>
                      <p className="text-xs text-slate-400 mt-0.5">Séances Google Meet &amp; Jitsi</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3.5">
                    <span className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <div className="leading-tight">
                      <p className="text-sm font-bold text-slate-900">
                        {lessonsCount} leçon{lessonsCount > 1 ? 's' : ''} &amp; fiches PDF
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">Contenu structuré par chapitres</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3.5">
                    <span className="w-9 h-9 rounded-lg bg-amber-50 text-[#f59d0e] flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </span>
                    <div className="leading-tight">
                      <p className="text-sm font-bold text-slate-900">
                        {course.duration || (courseIsFree ? 'Accès flexible' : '1 mois renouvelable')}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">Accessible 24h/24 sur mobile &amp; PC</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3.5">
                    <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </span>
                    <div className="leading-tight">
                      <p className="text-sm font-bold text-slate-900">Salon de discussion</p>
                      <p className="text-xs text-slate-400 mt-0.5">Échangez avec M. Aliou Sow</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3.5">
                    <span className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4" />
                    </span>
                    <div className="leading-tight">
                      <p className="text-sm font-bold text-slate-900">Quiz interactifs corrigés</p>
                      <p className="text-xs text-slate-400 mt-0.5">Suivez votre score et progression</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* 4. Carte Formateur (Format exact Bakeli : Avatar + Nom + Stats Apprenants / Cours + Bio) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3.5 mb-4">
                  {course.teacher?.avatar ? (
                    <img
                      src={course.teacher.avatar}
                      alt={teacherName}
                      className="w-14 h-14 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <span className="w-14 h-14 rounded-full bg-slate-200 text-slate-700 font-bold text-base flex items-center justify-center shrink-0">
                      {teacherInitials}
                    </span>
                  )}
                  <div>
                    <div className="text-base font-bold text-slate-900">{teacherName}</div>
                    <div className="text-xs text-slate-500">Professeur de Mathématiques &amp; PC</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-slate-100 border-y border-slate-100 py-3 mb-3 text-center">
                  <div className="px-2">
                    <div className="text-base font-extrabold text-slate-900">{studentsCount}</div>
                    <div className="text-xs text-slate-400">Apprenant{studentsCount > 1 ? 's' : ''}</div>
                  </div>
                  <div className="px-2">
                    <div className="text-base font-extrabold text-slate-900">{totalCoursesCount}</div>
                    <div className="text-xs text-slate-400">Cours</div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {course.teacher?.bio ||
                    'Professeur de Mathématiques et Physique-Chimie, accompagnement complet de la 4ème à la Terminale S.'}
                </p>
              </div>
            </aside>
          </div>
        </div>

        {/* Modale de paiement Wave / Orange Money directement depuis la fiche module */}
        {showPayModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                aria-label="Fermer"
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <span className="w-11 h-11 rounded-xl bg-amber-50 text-[#f59d0e] flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Débloquer ce module</h3>
                  <p className="text-xs text-slate-500">{course.title}</p>
                </div>
              </div>

              {payError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-xs mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{payError}</span>
                </div>
              )}

              {payEmailPreview && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 rounded-lg text-xs mb-4">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Paiement confirmé !</span>
                </div>
              )}

              <form onSubmit={handlePayCourse} className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Montant à régler</span>
                    <span className="text-lg font-extrabold text-[#009688]">
                      {Number(coursePrice).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Wave : <strong>{settings.siteInfo?.waveNumber || '+221 77 102 33 99'}</strong> • OM :{' '}
                    <strong>{settings.siteInfo?.orangeMoneyNumber || '+221 77 102 33 99'}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Mode de paiement Mobile Money
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Wave', 'Orange Money'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                          paymentMethod === method
                            ? 'bg-teal-50 border-[#009688] text-[#00796b]'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Numéro {paymentMethod}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="77 123 45 67"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#009688] focus:ring-2 focus:ring-[#009688]/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={paying}
                  className={orangeBtn}
                >
                  {paying ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Confirmer et accéder au cours</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </CourseShell>
    );
  }
  // Calculs de progression & déverrouillage séquentiel (style Bakeli)
  const chapters = course.chapters || [];
  const allLessonsFlat = [];
  chapters.forEach((ch, cIdx) => {
    (ch.lessons || []).forEach((ls) => {
      allLessonsFlat.push({ lesson: ls, chapterIndex: cIdx, chapterId: ch._id });
    });
  });

  const totalLessonsCount = allLessonsFlat.length;
  const completedSet = new Set(completedLessons.map(String));
  const completedCount = allLessonsFlat.filter((item) => completedSet.has(String(item.lesson._id))).length;
  const progressPct = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

  const chapterStatusList = [];
  let prevChaptersDone = true;
  chapters.forEach((ch) => {
    const ls = ch.lessons || [];
    const chCompletedCount = ls.filter((l) => completedSet.has(String(l._id))).length;
    const chDone = ls.length === 0 ? true : chCompletedCount === ls.length;
    const unlocked = isStaff || !sequentialUnlock || prevChaptersDone;
    chapterStatusList.push({
      unlocked,
      done: ls.length > 0 && chDone,
      completedCount: chCompletedCount,
      totalCount: ls.length,
    });
    if (!chDone) prevChaptersDone = false;
  });

  const allSectionsCompleted = totalLessonsCount === 0 || completedCount >= totalLessonsCount;
  const quizUnlocked = isStaff || !sequentialUnlock || allSectionsCompleted;

  const activeLessonIndex = activeLesson
    ? allLessonsFlat.findIndex((item) => String(item.lesson._id) === String(activeLesson._id))
    : -1;
  const nextLessonEntry =
    activeLessonIndex >= 0 && activeLessonIndex + 1 < allLessonsFlat.length
      ? allLessonsFlat[activeLessonIndex + 1]
      : null;
  const prevLessonEntry =
    activeLessonIndex > 0 ? allLessonsFlat[activeLessonIndex - 1] : null;
  const isActiveLessonDone = activeLesson ? completedSet.has(String(activeLesson._id)) : false;

  const filteredQaMessages = messages.filter((msg) => {
    const term = qaSearch.trim().toLowerCase();
    if (!term) return true;
    return `${msg.message || ''} ${msg.sender?.name || ''}`.toLowerCase().includes(term);
  });

  const ringRadius = 18;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (progressPct / 100) * ringCircumference;

  const openQuizWorkspace = () => {
    if (features.enableQuiz === false && !isStaff) {
      showToast('error', 'Les quiz sont momentanément désactivés par l’administration.');
      return;
    }
    if (!quizUnlocked) {
      showToast('error', 'Terminez toutes les sections pour débloquer le quiz final.');
      return;
    }
    setActiveTab('quizzes');
    if (!isStaff && quizzes.length === 1) {
      handleSelectQuiz(quizzes[0]);
    }
  };

  return (
    <CourseShell>
      <div className="min-h-screen bg-[#f8fafc] pt-5 pb-12 px-4 sm:px-6 text-slate-800">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= COLONNE PRINCIPALE GAUCHE (LECTEUR + Q&R / AVIS OU QUIZ) ================= */}
          <div className="lg:col-span-8 space-y-5">
            {activeTab === 'quizzes' ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[62vh] flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('content');
                          setActiveQuiz(null);
                          setViewingResultsQuiz(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer transition"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Retour au cours
                      </button>
                      <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#f59d0e]" />
                        <span>Évaluations &amp; Quiz</span>
                      </h3>
                    </div>

                    {isStaff && (
                      <button
                        onClick={() => {
                          if (showAddQuiz) {
                            resetQuizForm();
                          } else {
                            setEditingQuizId(null);
                            setQuizTitle('');
                            setQuizQuestions([{ questionText: '', options: ['', ''], correctAnswerIndex: 0 }]);
                            setShowAddQuiz(true);
                            setViewingResultsQuiz(null);
                            setActiveQuiz(null);
                          }
                        }}
                        className="px-4 py-2 bg-[#009688] hover:bg-[#00796b] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{showAddQuiz ? 'Fermer' : 'Créer un Quiz'}</span>
                      </button>
                    )}
                  </div>

                  {/* FORMULAIRE DE CRÉATION DE QUIZ (PROF / ADMIN) */}
                  {showAddQuiz && isStaff && (
                    <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 mb-6 text-xs">
                      <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
                        {editingQuizId ? 'Modifier le Quiz' : 'Nouveau Quiz'}
                      </h4>
                      <form onSubmit={handleSaveQuiz} className="space-y-4">
                        <div className="space-y-1">
                          <label className="block text-slate-500 font-semibold">Titre du Quiz</label>
                          <input
                            type="text"
                            required
                            value={quizTitle}
                            onChange={(e) => setQuizTitle(e.target.value)}
                            className="input-animated p-2"
                            placeholder="ex: Quiz 1 : Les suites réelles"
                          />
                        </div>

                        <div className="space-y-4">
                          <label className="block text-slate-700 font-bold uppercase tracking-wider">Questions :</label>
                          {quizQuestions.map((question, qIdx) => (
                            <div key={qIdx} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 relative">
                              <button
                                type="button"
                                onClick={() => removeQuestionField(qIdx)}
                                className="absolute top-2 right-2 text-red-500 cursor-pointer"
                              >
                                ✕
                              </button>

                              <div className="space-y-1">
                                <label className="block text-slate-500 font-semibold">Question {qIdx + 1}</label>
                                <input
                                  type="text"
                                  required
                                  value={question.questionText}
                                  onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                                  className="input-animated p-2"
                                  placeholder="ex: Quel est le sens de variation de la suite u_n = 2^n ?"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="block text-slate-500 font-semibold">Options de réponse &amp; Bonne réponse</label>
                                {question.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="flex gap-2 items-center">
                                    <input
                                      type="radio"
                                      name={`correct-${qIdx}`}
                                      checked={question.correctAnswerIndex === oIdx}
                                      onChange={() => setCorrectAnswer(qIdx, oIdx)}
                                    />
                                    <input
                                      type="text"
                                      required
                                      value={opt}
                                      onChange={(e) => updateOptionText(qIdx, oIdx, e.target.value)}
                                      className="input-animated p-1.5 text-xs"
                                      placeholder={`Option ${oIdx + 1}`}
                                    />
                                    {question.options.length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => removeOptionField(qIdx, oIdx)}
                                        className="text-red-500 cursor-pointer"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addOptionField(qIdx)}
                                  className="text-[#009688] font-bold hover:underline cursor-pointer"
                                >
                                  + Ajouter option
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between border-t border-slate-200 pt-4">
                          <button
                            type="button"
                            onClick={addQuestionField}
                            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 cursor-pointer"
                          >
                            + Ajouter une question
                          </button>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={resetQuizForm}
                              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 cursor-pointer"
                            >
                              Annuler
                            </button>
                            <button
                              type="submit"
                              disabled={savingQuiz}
                              className="px-6 py-2 bg-[#009688] hover:bg-[#00796b] rounded text-white font-bold disabled:opacity-60 cursor-pointer"
                            >
                              {savingQuiz ? 'Enregistrement...' : editingQuizId ? 'Enregistrer les modifications' : 'Créer le Quiz'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* LISTE OU JEU DU QUIZ */}
                  {activeQuiz ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">{activeQuiz.title}</h4>
                          {isPreviewMode && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              Mode aperçu — non enregistré
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => { setActiveQuiz(null); setIsPreviewMode(false); }}
                          className="text-slate-500 hover:text-slate-800 text-xs font-bold cursor-pointer"
                        >
                          Tous les quiz
                        </button>
                      </div>

                      {quizScore ? (
                        <div className="text-center py-8 space-y-6">
                          <div className="w-16 h-16 bg-[#e0f2f1] border border-[#009688]/20 text-[#009688] rounded-full flex items-center justify-center mx-auto mb-2">
                            <Award className="w-10 h-10" />
                          </div>
                          <h4 className="text-2xl font-bold text-slate-900">Résultats</h4>
                          <p className="text-slate-500 text-sm">
                            {isPreviewMode ? 'Aperçu du score obtenu avec ces réponses :' : 'Vous avez terminé le quiz avec le score de :'}
                          </p>
                          <div className="text-4xl font-black text-[#009688]">{quizScore.score} / {quizScore.total}</div>
                          <p className="text-slate-400 text-xs">Pourcentage d&apos;exactitude : {quizScore.percentage}%</p>

                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-4 max-w-xl mx-auto text-xs max-h-60 overflow-y-auto">
                            <h5 className="font-bold text-slate-700">Correction :</h5>
                            {activeQuiz.questions.map((q, idx) => (
                              <div key={idx} className="border-b border-slate-200 pb-2">
                                <p className="font-semibold text-slate-800">{idx + 1}. {q.questionText}</p>
                                <p className="text-emerald-600 mt-1">Bonne réponse : {q.options[q.correctAnswerIndex]}</p>
                                {quizAnswers[idx] !== q.correctAnswerIndex && (
                                  <p className="text-red-600">Votre choix : {q.options[quizAnswers[idx]] || 'Aucun'}</p>
                                )}
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => { setActiveQuiz(null); setIsPreviewMode(false); }}
                            className="px-8 py-3 bg-[#009688] hover:bg-[#00796b] text-white font-bold rounded-xl cursor-pointer transition"
                          >
                            Terminer
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {activeQuiz.questions.map((q, idx) => (
                            <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                              <h5 className="font-bold text-slate-800 text-sm">{idx + 1}. {q.questionText}</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                {q.options.map((opt, oIdx) => (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => handleSelectQuizAnswer(idx, oIdx)}
                                    className={`p-3 rounded-xl text-left border transition font-medium cursor-pointer ${
                                      quizAnswers[idx] === oIdx
                                        ? 'bg-[#e0f2f1] border-[#009688] text-slate-900'
                                        : 'bg-white border-slate-200 hover:border-slate-400 text-slate-600'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}

                          <button
                            onClick={handleSubmitQuiz}
                            disabled={submittingQuiz}
                            className="w-full bg-[#f59d0e] hover:bg-[#e08b00] text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer text-sm"
                          >
                            {submittingQuiz ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <span>{isPreviewMode ? 'Voir le score (aperçu)' : 'Soumettre mes réponses'}</span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : viewingResultsQuiz ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h4 className="text-base font-bold text-slate-900">
                          Résultats — <span className="text-[#009688]">{viewingResultsQuiz.title}</span>
                        </h4>
                        <button
                          onClick={() => { setViewingResultsQuiz(null); setQuizResults([]); }}
                          className="text-slate-500 hover:text-slate-800 text-xs font-bold cursor-pointer"
                        >
                          Retour
                        </button>
                      </div>

                      {loadingResults ? (
                        <div className="flex justify-center py-12">
                          <div className="loader-spinner"></div>
                        </div>
                      ) : quizResults.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <p className="text-sm">Aucun élève n&apos;a encore soumis ce quiz.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {quizResults
                            .slice()
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                            .map((r) => (
                              <div key={r._id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={r.student?.avatar}
                                    alt={r.student?.name}
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                  />
                                  <div>
                                    <div className="font-bold text-slate-800">{r.student?.name || 'Élève'}</div>
                                    <div className="text-[10px] text-slate-400">
                                      {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-black text-[#009688]">{r.score} / {r.totalQuestions}</div>
                                  <div className="text-[10px] text-slate-400">{Math.round((r.score / r.totalQuestions) * 100)}%</div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {quizzes.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <p className="text-sm">Aucune évaluation programmée pour ce module.</p>
                        </div>
                      ) : (
                        quizzes.map((quiz) => (
                          <div key={quiz._id} className="flex flex-wrap justify-between items-center gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm hover:border-[#009688]/40 transition">
                            <div>
                              <div className="font-bold text-slate-900">{quiz.title}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{quiz.questions.length} question{quiz.questions.length > 1 ? 's' : ''} interactive{quiz.questions.length > 1 ? 's' : ''}</div>
                            </div>

                            {isStaff ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handlePreviewQuiz(quiz)}
                                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 cursor-pointer transition"
                                >
                                  Aperçu
                                </button>
                                <button
                                  onClick={() => handleEditQuiz(quiz)}
                                  className="px-3 py-1.5 bg-[#e0f2f1] border border-[#009688]/20 hover:bg-[#009688] hover:text-white rounded-lg text-xs font-bold text-[#009688] cursor-pointer transition"
                                >
                                  Modifier
                                </button>
                                <button
                                  onClick={() => handleViewResults(quiz)}
                                  className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold text-emerald-600 cursor-pointer transition"
                                >
                                  Résultats
                                </button>
                                <button
                                  onClick={() => handleDeleteQuiz(quiz._id)}
                                  title="Supprimer"
                                  className="p-1.5 bg-red-50 border border-red-100 hover:bg-red-600 hover:text-white rounded-lg text-red-600 cursor-pointer transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSelectQuiz(quiz)}
                                className="px-4 py-2 bg-[#f59d0e] hover:bg-[#e08b00] text-white rounded-lg text-xs font-bold cursor-pointer transition"
                              >
                                Faire le Quiz →
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* 1. CARTE PROGRESSION + LECTEUR PRINCIPAL (EXACT FORMAT BAKELI) */}
                <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  {/* En-tête Progression circulaire + titre de la leçon */}
                  <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                        <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                          <circle
                            cx="22"
                            cy="22"
                            r={ringRadius}
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="3.5"
                          />
                          <circle
                            cx="22"
                            cy="22"
                            r={ringRadius}
                            fill="none"
                            stroke={progressPct === 100 ? '#009688' : '#f59d0e'}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeDasharray={ringCircumference}
                            strokeDashoffset={ringOffset}
                          />
                        </svg>
                        <span className="absolute text-[10px] font-extrabold text-slate-800">
                          {progressPct}%
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          PROGRESSION DU MODULE
                        </p>
                        <h1 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                          {activeLesson?.title || course.title}
                        </h1>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {activeLesson && (
                        <button
                          type="button"
                          disabled={togglingProgress}
                          onClick={() => handleToggleLessonComplete(activeLesson._id)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            isActiveLessonDone
                              ? 'bg-teal-50 border-[#009688]/30 text-[#009688]'
                              : 'bg-white border-slate-200 hover:border-[#009688] text-slate-700 hover:text-[#009688]'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isActiveLessonDone ? 'Leçon terminée' : 'Marquer terminée'}</span>
                        </button>
                      )}

                      {activeLesson && nextLessonEntry && (
                        <button
                          type="button"
                          disabled={togglingProgress}
                          onClick={() =>
                            handleToggleLessonComplete(activeLesson._id, true, nextLessonEntry.lesson)
                          }
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold transition cursor-pointer"
                        >
                          <span>Terminer &amp; Suivant</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Formulaire création de leçon (Prof / Admin) */}
                  {selectedChapterId && isStaff && (
                    <div className="m-5 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                      <h4 className="text-sm font-bold text-slate-900 mb-4">Créer une Leçon</h4>
                      <form onSubmit={handleAddLesson} className="space-y-3 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-500 mb-1">Titre de la leçon</label>
                            <input
                              type="text"
                              required
                              value={newLessonTitle}
                              onChange={(e) => setNewLessonTitle(e.target.value)}
                              className="input-animated p-2"
                              placeholder="Introduction aux forces"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Type de contenu</label>
                            <select
                              value={newLessonType}
                              onChange={(e) => setNewLessonType(e.target.value)}
                              className="input-animated p-2 bg-white border border-slate-200 text-slate-800 rounded"
                            >
                              <option value="video">Vidéo YouTube</option>
                              <option value="pdf">Document PDF</option>
                              <option value="meet">Visioconférence Google Meet (lien externe)</option>
                              <option value="jitsi">Salle de classe en direct (intégrée - Jitsi)</option>
                              <option value="text">Texte / Exercice rédigé</option>
                            </select>
                          </div>
                        </div>

                        {newLessonType === 'video' && (
                          <div>
                            <label className="block text-slate-500 mb-1">Lien de la vidéo YouTube</label>
                            <input
                              type="url"
                              required
                              value={newLessonYoutube}
                              onChange={(e) => setNewLessonYoutube(e.target.value)}
                              className="input-animated p-2"
                              placeholder="https://www.youtube.com/watch?v=..."
                            />
                          </div>
                        )}

                        {newLessonType === 'jitsi' && (
                          <div className="flex items-center gap-3 bg-[#e0f2f1] border border-[#009688]/20 rounded-lg p-3">
                            <img src="https://cdn.jsdelivr.net/npm/@thesvg/icons/icons/jitsi.svg" alt="Jitsi" className="w-6 h-6 shrink-0" />
                            <p className="text-slate-600 text-[11px] leading-relaxed">
                              Une salle de classe virtuelle sera créée automatiquement pour cette leçon.
                              Les élèves rejoignent le direct directement depuis cette page.
                            </p>
                          </div>
                        )}

                        {newLessonType === 'meet' && (
                          <div>
                            <label className="block text-slate-500 mb-1">Lien Google Meet</label>
                            <input
                              type="url"
                              required
                              value={newLessonMeet}
                              onChange={(e) => setNewLessonMeet(e.target.value)}
                              className="input-animated p-2"
                              placeholder="https://meet.google.com/abc-defg-hij"
                            />
                          </div>
                        )}

                        {newLessonType === 'text' && (
                          <div>
                            <label className="block text-slate-500 mb-1">Contenu texte</label>
                            <textarea
                              required
                              value={newLessonContent}
                              onChange={(e) => setNewLessonContent(e.target.value)}
                              className="input-animated h-24 p-2 resize-none"
                              placeholder="Saisissez votre leçon rédigée ici..."
                            />
                          </div>
                        )}

                        {newLessonType === 'pdf' && (
                          <div>
                            <label className="block text-slate-500 mb-1">Fichier PDF (Téléverser vers Cloudinary)</label>
                            <input
                              type="file"
                              required
                              accept="application/pdf"
                              onChange={(e) => setNewLessonPdf(e.target.files[0])}
                              className="input-animated text-xs text-slate-500 p-2"
                            />
                          </div>
                        )}

                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setSelectedChapterId(null)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs cursor-pointer"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            disabled={addingLesson}
                            className="px-4 py-2 bg-[#009688] hover:bg-[#00796b] text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            {addingLesson ? 'Chargement...' : 'Enregistrer'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Corps du lecteur vidéo / PDF / Meet / Jitsi / Texte */}
                  <div className="p-4 sm:p-5">
                    {activeLesson ? (
                      <div className="space-y-4">
                        {activeLesson.contentType === 'video' && activeLesson.youtubeUrl && (
                          <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-black shadow-sm">
                            {extractYoutubeId(activeLesson.youtubeUrl) ? (
                              <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${extractYoutubeId(activeLesson.youtubeUrl)}`}
                                title={activeLesson.title}
                                allowFullScreen
                              ></iframe>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                                Lien de la vidéo YouTube non valide.
                              </div>
                            )}
                          </div>
                        )}

                        {activeLesson.contentType === 'pdf' && activeLesson.pdfPath && (
                          <div className="w-full space-y-4">
                            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                              <div className="flex items-center gap-3.5">
                                <span className="w-12 h-12 rounded-xl bg-teal-50 text-[#009688] flex items-center justify-center shrink-0">
                                  <FileText className="w-6 h-6" />
                                </span>
                                <div>
                                  <h4 className="text-sm font-bold text-slate-900">Fiche de cours PDF</h4>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    Consultez ou téléchargez le document pédagogique associé à cette leçon.
                                  </p>
                                </div>
                              </div>
                              {(features.enablePdfDownload !== false || isStaff) && (
                                <a
                                  href={getInlinePdfUrl(activeLesson.pdfPath)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-5 py-2.5 bg-[#009688] hover:bg-[#00796b] text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer transition"
                                >
                                  Ouvrir le PDF
                                </a>
                              )}
                            </div>

                            <div className="hidden md:block w-full h-[520px] rounded-xl overflow-hidden border border-slate-200">
                              <embed src={getInlinePdfUrl(activeLesson.pdfPath)} type="application/pdf" width="100%" height="100%" />
                            </div>
                          </div>
                        )}

                        {activeLesson.contentType === 'jitsi' && (
                          <div className="w-full space-y-3">
                            <div className="flex items-center gap-2 bg-[#e0f2f1] border border-[#009688]/20 rounded-xl p-3 text-xs text-slate-700">
                              <img src="https://cdn.jsdelivr.net/npm/@thesvg/icons/icons/jitsi.svg" alt="Jitsi" className="w-5 h-5 shrink-0" />
                              <span>Salle de classe en direct — activez votre caméra/micro ci-dessous pour rejoindre.</span>
                            </div>
                            <div className="w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 bg-black">
                              <iframe
                                src={`https://meet.jit.si/profsow-${course._id}-${activeLesson._id}`}
                                title={activeLesson.title}
                                allow="camera; microphone; fullscreen; display-capture; autoplay"
                                style={{ width: '100%', height: '100%', border: 0 }}
                              ></iframe>
                            </div>
                          </div>
                        )}

                        {activeLesson.contentType === 'meet' && activeLesson.meetLink && (
                          <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center flex flex-col items-center">
                            <div className="w-14 h-14 bg-teal-50 border border-teal-100 text-[#009688] rounded-full flex items-center justify-center mb-4">
                              <Video className="w-7 h-7" />
                            </div>
                            <h4 className="text-base font-bold text-slate-900 mb-1.5">Cours en direct avec {settings.siteInfo?.teacherDisplayName || 'M. Aliou Sow'}</h4>
                            <p className="text-slate-500 text-xs mb-5 max-w-sm">
                              Rejoignez la réunion virtuelle en cours pour assister au live ou poser vos questions.
                            </p>
                            <a
                              href={activeLesson.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-[#009688] hover:bg-[#00796b] text-white px-7 py-3 rounded-xl font-bold text-xs transition"
                            >
                              Rejoindre le Direct Google Meet
                            </a>
                          </div>
                        )}

                        {activeLesson.contentType === 'text' && (
                          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 leading-relaxed text-sm text-slate-700 whitespace-pre-wrap break-words">
                            {activeLesson.content}
                          </div>
                        )}

                        {/* Navigation rapide entre leçons */}
                        <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                          {prevLessonEntry ? (
                            <button
                              type="button"
                              onClick={() => setActiveLesson(prevLessonEntry.lesson)}
                              className="inline-flex items-center gap-1 hover:text-[#009688] font-semibold cursor-pointer"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              Leçon précédente
                            </button>
                          ) : (
                            <span></span>
                          )}
                          {nextLessonEntry && (
                            <button
                              type="button"
                              onClick={() => {
                                const targetChapter = chapterStatusList[nextLessonEntry.chapterIndex];
                                if (targetChapter && !targetChapter.unlocked) {
                                  showToast('error', 'Terminez la section en cours pour débloquer la suivante.');
                                  return;
                                }
                                setActiveLesson(nextLessonEntry.lesson);
                              }}
                              className="inline-flex items-center gap-1 hover:text-[#009688] font-semibold cursor-pointer"
                            >
                              Leçon suivante
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="py-16 text-center text-slate-400">
                        <Info className="w-11 h-11 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-slate-600">Aucune leçon sélectionnée.</p>
                        <p className="text-xs mt-1">
                          {isStaff
                            ? 'Ajoutez un chapitre dans "Parcours du module" à droite puis créez vos leçons.'
                            : 'Sélectionnez une leçon dans le parcours du module à droite.'}
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* 2. ONGLETS QUESTIONS & RÉPONSES / AVIS + BOUTON "PASSER AU QUIZZ" (EXACT FORMAT BAKELI) */}
                <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-200 px-5">
                    <div className="flex items-center gap-2">
                      {(features.enableForum !== false || isStaff) && (
                        <button
                          type="button"
                          onClick={() => setInteractionTab('qa')}
                          className={`py-4 px-3 text-sm font-bold border-b-2 -mb-px transition cursor-pointer ${
                            interactionTab === 'qa'
                              ? 'border-[#f59d0e] text-slate-900'
                              : 'border-transparent text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Questions &amp; Réponses
                        </button>
                      )}
                      {features.enableReviews !== false && (
                        <button
                          type="button"
                          onClick={() => setInteractionTab('avis')}
                          className={`py-4 px-3 text-sm font-bold border-b-2 -mb-px transition cursor-pointer ${
                            interactionTab === 'avis' || (features.enableForum === false && !isStaff)
                              ? 'border-[#f59d0e] text-slate-900'
                              : 'border-transparent text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Avis
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {interactionTab === 'qa' && (features.enableForum !== false || isStaff) ? (
                      <>
                        {/* Barre de recherche de questions */}
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={qaSearch}
                            onChange={(e) => setQaSearch(e.target.value)}
                            placeholder="Rechercher une question existante..."
                            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#009688]"
                          />
                        </div>

                        {/* Bouton / formulaire pointillé vert "Poser une question sur ce module" */}
                        {!showQaForm ? (
                          <button
                            type="button"
                            onClick={() => setShowQaForm(true)}
                            className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#009688]/60 hover:bg-teal-50/60 text-[#009688] text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                            <span>Poser une question sur ce module</span>
                          </button>
                        ) : (
                          <form
                            onSubmit={async (e) => {
                              await handleSendMessage(e);
                              setShowQaForm(false);
                            }}
                            className="p-4 rounded-xl border-2 border-dashed border-[#009688]/50 bg-teal-50/30 space-y-3"
                          >
                            <textarea
                              rows={3}
                              required
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder={`Posez votre question à ${settings.siteInfo?.teacherDisplayName || 'M. Aliou Sow'} ou aux autres élèves...`}
                              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#009688] resize-none"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setShowQaForm(false)}
                                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                              >
                                Annuler
                              </button>
                              <button
                                type="submit"
                                disabled={sendingMessage}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{sendingMessage ? 'Envoi...' : 'Publier'}</span>
                              </button>
                            </div>
                          </form>
                        )}

                        <p className="text-xs font-semibold text-slate-500">
                          {filteredQaMessages.length} question(s) sur ce module
                        </p>

                        {/* Liste des questions / discussions */}
                        {filteredQaMessages.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400 border border-slate-100 rounded-xl bg-slate-50/50">
                            Aucune question trouvée pour le moment. Soyez le premier à échanger !
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                            {filteredQaMessages
                              .slice()
                              .reverse()
                              .map((msg) => {
                                const senderName = msg.sender?.name || 'Apprenant';
                                const senderIsStaff =
                                  msg.sender?.role === 'teacher' || msg.sender?.role === 'admin';
                                const initials = senderName
                                  .split(' ')
                                  .filter(Boolean)
                                  .slice(0, 1)
                                  .map((p) => p[0].toUpperCase())
                                  .join('');
                                return (
                                  <div
                                    key={msg._id}
                                    className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 hover:border-slate-300 transition"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex items-center gap-3 min-w-0">
                                        {msg.sender?.avatar ? (
                                          <img
                                            src={msg.sender.avatar}
                                            alt={senderName}
                                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                                          />
                                        ) : (
                                          <span className="w-9 h-9 rounded-full bg-teal-50 text-[#009688] font-bold text-xs flex items-center justify-center shrink-0">
                                            {initials || 'É'}
                                          </span>
                                        )}
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-bold text-slate-900 truncate">
                                              {senderName}
                                            </span>
                                            {senderIsStaff && (
                                              <span className="text-[10px] font-bold bg-teal-50 text-[#009688] px-2 py-0.5 rounded-full">
                                                {msg.sender?.role === 'admin' ? 'Admin' : 'Professeur'}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-sm font-medium text-slate-800 mt-0.5 break-words">
                                            {msg.message}
                                          </p>
                                        </div>
                                      </div>
                                      <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                                        {formatRelativeTime(msg.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </>
                    ) : features.enableReviews !== false ? (
                      <CourseReviews
                        courseId={id}
                        canReview={user?.role === 'student' && isSubscribed}
                        isLoggedIn={!!user}
                      />
                    ) : null}

                    {/* Barre inférieure avec bouton orange "Passer au quizz ->" (Format Bakeli) */}
                    {(features.enableQuiz !== false || isStaff) && (
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                        <span className="text-xs text-slate-500">
                          {quizzes.length > 0
                            ? `${quizzes.length} évaluation${quizzes.length > 1 ? 's' : ''} liée${quizzes.length > 1 ? 's' : ''} à ce module`
                            : 'Aucune évaluation créée pour le moment'}
                        </span>
                        <button
                          type="button"
                          onClick={openQuizWorkspace}
                          className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f59d0e] hover:bg-[#e08b00] text-white text-sm font-bold shadow-sm transition cursor-pointer"
                        >
                          <span>Passer au quizz</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}
          </div>

          {/* ================= COLONNE LATÉRALE DROITE : PARCOURS DU MODULE (EXACT FORMAT BAKELI) ================= */}
          <aside className="lg:col-span-4 lg:sticky lg:top-[88px]">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col lg:max-h-[calc(100vh-110px)]">
              {/* En-tête Parcours */}
              <div className="p-4 border-b border-slate-100 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    PARCOURS DU MODULE
                  </span>
                  {isStaff && (
                    <button
                      type="button"
                      onClick={() => setShowAddChapter((v) => !v)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-[#009688] text-[#009688] hover:text-white text-[11px] font-bold transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Chapitre</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h2 className="text-sm font-extrabold text-slate-900 line-clamp-1">{course.title}</h2>
                    <p className="text-xs text-slate-500">
                      {course.subject} • {formatLevelLabel(course.level)}
                    </p>
                  </div>
                </div>

                {showAddChapter && isStaff && (
                  <form onSubmit={handleAddChapter} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      required
                      value={newChapterTitle}
                      onChange={(e) => setNewChapterTitle(e.target.value)}
                      className="flex-1 h-9 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#009688]"
                      placeholder="Nom du chapitre..."
                    />
                    <button
                      type="submit"
                      className="h-9 px-3 bg-[#009688] hover:bg-[#00796b] text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Ajouter
                    </button>
                  </form>
                )}
              </div>

              {/* Onglets Contenu | Section */}
              <div className="flex border-b border-slate-200 px-4">
                <button
                  type="button"
                  onClick={() => setCurriculumTab('content')}
                  className={`py-3 px-3 text-xs font-bold border-b-2 -mb-px transition cursor-pointer ${
                    curriculumTab === 'content'
                      ? 'border-[#f59d0e] text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Contenu
                </button>
                <button
                  type="button"
                  onClick={() => setCurriculumTab('section')}
                  className={`py-3 px-3 text-xs font-bold border-b-2 -mb-px transition cursor-pointer ${
                    curriculumTab === 'section'
                      ? 'border-[#f59d0e] text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Section
                </button>
              </div>

              {/* Corps défilable de l'accordéon */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                {curriculumTab === 'content' ? (
                  chapters.length === 0 ? (
                    <p className="text-xs text-slate-400 py-8 text-center">
                      Aucun chapitre créé pour ce module.
                    </p>
                  ) : (
                    chapters.map((chapter, idx) => {
                      const status = chapterStatusList[idx] || {
                        unlocked: true,
                        done: false,
                        completedCount: 0,
                        totalCount: 0,
                      };
                      const isOpen = openCurriculumChapters[chapter._id] ?? true;

                      return (
                        <div
                          key={chapter._id}
                          className={`rounded-xl border transition overflow-hidden ${
                            !status.unlocked
                              ? 'border-rose-200 bg-rose-50/20'
                              : status.done
                              ? 'border-teal-200 bg-teal-50/20'
                              : 'border-amber-200 bg-amber-50/20'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 px-3.5 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenCurriculumChapters((prev) => ({
                                  ...prev,
                                  [chapter._id]: !isOpen,
                                }))
                              }
                              className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                            >
                              {!status.unlocked && (
                                <span className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
                                  <Lock className="w-3.5 h-3.5" />
                                </span>
                              )}
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {chapter.title}
                              </span>
                            </button>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  !status.unlocked
                                    ? 'bg-rose-500 text-white'
                                    : status.done
                                    ? 'bg-[#009688] text-white'
                                    : 'bg-[#f59d0e] text-white'
                                }`}
                              >
                                {!status.unlocked
                                  ? 'VERROUILLÉ'
                                  : status.done
                                  ? 'TERMINÉ'
                                  : 'DÉBLOQUÉ'}
                              </span>

                              {isStaff && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedChapterId(chapter._id);
                                      setActiveTab('content');
                                    }}
                                    title="Ajouter une leçon"
                                    className="p-1 text-[#009688] hover:bg-teal-50 rounded cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteChapter(chapter._id)}
                                    title="Supprimer ce chapitre"
                                    className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  setOpenCurriculumChapters((prev) => ({
                                    ...prev,
                                    [chapter._id]: !isOpen,
                                  }))
                                }
                                className="text-slate-400 cursor-pointer"
                              >
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${
                                    isOpen ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          {isOpen && (
                            <div className="px-3 pb-3 space-y-1.5">
                              {(!chapter.lessons || chapter.lessons.length === 0) ? (
                                <p className="text-[11px] text-slate-400 px-2 py-1">
                                  Aucune leçon dans cette section.
                                </p>
                              ) : (
                                chapter.lessons.map((lesson) => {
                                  const isDone = completedSet.has(String(lesson._id));
                                  const isSelected = activeLesson?._id === lesson._id && activeTab === 'content';
                                  const LessonIcon = getLessonTypeIcon(lesson.contentType);
                                  return (
                                    <div
                                      key={lesson._id}
                                      onClick={() => {
                                        if (!status.unlocked) {
                                          showToast('error', 'Terminez la section précédente pour débloquer celle-ci.');
                                          return;
                                        }
                                        setActiveLesson(lesson);
                                        setActiveTab('content');
                                        setActiveQuiz(null);
                                      }}
                                      className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-xs transition ${
                                        !status.unlocked
                                          ? 'border-rose-100 bg-white/60 text-slate-400 cursor-not-allowed opacity-70'
                                          : isSelected
                                          ? 'border-[#f59d0e] bg-white text-slate-900 font-bold shadow-xs cursor-pointer'
                                          : 'border-slate-200 bg-white hover:border-[#009688]/50 text-slate-700 cursor-pointer'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <span
                                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                            isDone
                                              ? 'bg-[#009688] border-[#009688] text-white'
                                              : isSelected
                                              ? 'border-[#f59d0e]'
                                              : 'border-slate-300'
                                          }`}
                                        >
                                          {isDone && <Check className="w-2.5 h-2.5" />}
                                        </span>
                                        <span className="truncate">{lesson.title}</span>
                                      </div>

                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <LessonIcon className="w-3.5 h-3.5 text-slate-400" />
                                        {isStaff && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteLesson(chapter._id, lesson._id);
                                            }}
                                            className="p-0.5 text-red-400 hover:text-red-600 cursor-pointer shrink-0"
                                            title="Supprimer la leçon"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              )}

                              {!status.unlocked && (
                                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-rose-300 bg-rose-50/70 text-[11px] font-medium text-rose-700">
                                  <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                  <span>Terminez la section précédente pour débloquer.</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )
                ) : (
                  /* Onglet Section : récapitulatif & progression par chapitre */
                  <div className="space-y-4 p-1">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-800">
                        <span>Avancement global</span>
                        <span className="text-[#009688]">
                          {completedCount}/{totalLessonsCount} leçons ({progressPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-[#009688] rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {chapters.map((ch, i) => {
                        const st = chapterStatusList[i];
                        return (
                          <div
                            key={ch._id}
                            className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">
                                {i + 1}. {ch.title}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {st?.completedCount || 0}/{st?.totalCount || 0} leçons complétées
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                st?.done
                                  ? 'bg-teal-50 text-[#009688]'
                                  : st?.unlocked
                                  ? 'bg-amber-50 text-[#f59d0e]'
                                  : 'bg-rose-50 text-rose-600'
                              }`}
                            >
                              {st?.done ? 'Terminé' : st?.unlocked ? 'En cours' : 'Verrouillé'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex items-center gap-3">
                      <img
                        src={
                          course.teacher?.avatar ||
                          'https://api.dicebear.com/7.x/initials/svg?seed=' + (course.teacher?.name || 'Prof')
                        }
                        alt={course.teacher?.name || 'Professeur'}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-slate-900">
                          {course.teacher?.name || settings.siteInfo?.teacherDisplayName || 'M. Aliou Sow'}
                        </p>
                        <p className="text-slate-500">Auteur du module</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Carte Quiz Final épinglée en bas de Parcours du module (Exact Format Bakeli) */}
              {(features.enableQuiz !== false || isStaff) && (
                <div className="p-4 border-t border-slate-200 bg-white">
                  <div
                    onClick={openQuizWorkspace}
                    className={`rounded-xl p-3.5 border transition cursor-pointer ${
                      quizUnlocked
                        ? 'border-teal-200 bg-teal-50/40 hover:border-[#009688]'
                        : 'border-rose-200 bg-rose-50/40'
                    }`}
                  >
                    <span
                      className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white mb-2 ${
                        quizUnlocked ? 'bg-[#009688]' : 'bg-rose-500'
                      }`}
                    >
                      {quizUnlocked ? 'DÉBLOQUÉ' : 'VERROUILLÉ'}
                    </span>
                    <p className="text-xs font-extrabold text-slate-900 truncate">
                      Quiz final — {course.title}
                    </p>
                    <p
                      className={`text-[11px] mt-1 ${
                        quizUnlocked ? 'text-[#009688] font-semibold' : 'text-rose-600'
                      }`}
                    >
                      {quizUnlocked
                        ? 'Cliquez ici pour accéder aux quiz du module →'
                        : 'Terminez toutes les sections pour débloquer le quiz.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {toast.text && (
        <div
          className={`fixed bottom-5 right-5 z-[75] max-w-sm flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-teal-50 border-teal-200 text-[#009688]'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
          <span className="flex-1">{toast.text}</span>
          <button onClick={() => setToast({ type: '', text: '' })} className="cursor-pointer opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <ConfirmModal
        open={Boolean(confirmState)}
        title={confirmState?.title}
        message={confirmState?.message}
        details={confirmState?.details}
        confirmLabel={confirmState?.confirmLabel}
        variant={confirmState?.variant || 'danger'}
        loading={confirmLoading}
        onConfirm={executeConfirm}
        onCancel={() => !confirmLoading && setConfirmState(null)}
      />
    </CourseShell>
  );
};

export default CourseDetail;
