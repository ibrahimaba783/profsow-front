import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';
import { Play, FileText, Video, HelpCircle, Send, Plus, Trash2, Check, AlertCircle, Sparkles, MessageSquare, Info, Award, GraduationCap, Lock, Share2, Copy, MessageCircle as MeetIcon, CreditCard, Smartphone, Phone, CheckCircle2, BookOpen, Clock, ChevronDown, Star, Search, LogOut, User, ChevronLeft, ChevronRight, LayoutGrid, LayoutDashboard, Settings } from 'lucide-react';

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

  const isTeacher = user.role === 'teacher';
  const dashboardPath = isTeacher ? '/teacher-dashboard' : '/student-dashboard';
  const navItems = isTeacher
    ? [{ label: 'Mon espace', icon: LayoutDashboard, to: dashboardPath }]
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
const CourseReviews = ({ courseId, canReview }) => {
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
    <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6">
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

      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h3 className="text-lg font-bold text-slate-900">
          {reviews.length === 0 ? 'Aucun avis pour le moment' : `Avis des élèves (${reviews.length})`}
        </h3>
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
  );
};

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content'); // content, discussion, quizzes
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checkingSub, setCheckingSub] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [openPreviewChapters, setOpenPreviewChapters] = useState({});
  const [previewTab, setPreviewTab] = useState('content'); // content, info, qa (page publique du cours)
  const [enrollingFree, setEnrollingFree] = useState(false);
  const [freeEnrollError, setFreeEnrollError] = useState('');

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

  useEffect(() => {
    fetchCourseDetails();
  }, [id, user?._id]);

  useEffect(() => {
    if (activeTab === 'discussion' && (isSubscribed || user?.role === 'teacher')) {
      fetchDiscussions();
    }
    if (activeTab === 'quizzes' && (isSubscribed || user?.role === 'teacher')) {
      fetchQuizzes();
    }
  }, [activeTab, isSubscribed, user?.role, id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const data = await api(`/courses/${id}`);
      setCourse(data);

      if (user?.role === 'teacher') {
        setIsSubscribed(true);
        setCheckingSub(false);
      } else if (user) {
        // Vérifier l'abonnement
        const subCheck = await api(`/subscriptions/check/${id}`);
        setIsSubscribed(subCheck.isSubscribed);
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
      alert(err.message);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Voulez-vous supprimer ce chapitre ?')) return;
    try {
      const updated = await api(`/courses/${id}/chapters/${chapterId}`, {
        method: 'DELETE',
      });
      setCourse(updated);
      if (activeLesson && !updated.chapters.some(c => c.lessons.some(l => l._id === activeLesson._id))) {
        setActiveLesson(null);
      }
    } catch (err) {
      alert(err.message);
    }
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
      alert(err.message);
    } finally {
      setAddingLesson(false);
    }
  };

  const handleDeleteLesson = async (chapterId, lessonId) => {
    if (!window.confirm('Voulez-vous supprimer cette leçon ?')) return;
    try {
      const updated = await api(`/courses/${id}/chapters/${chapterId}/lessons/${lessonId}`, {
        method: 'DELETE',
      });
      setCourse(updated);
      if (activeLesson?._id === lessonId) {
        setActiveLesson(null);
      }
    } catch (err) {
      alert(err.message);
    }
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
      alert(err.message);
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
      alert(err.message);
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
      alert(err.message);
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

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce quiz ? Les résultats des élèves associés seront aussi supprimés.')) return;
    try {
      await api(`/quizzes/${quizId}`, { method: 'DELETE' });
      setQuizzes(quizzes.filter(q => q._id !== quizId));
      if (editingQuizId === quizId) resetQuizForm();
    } catch (err) {
      alert(err.message);
    }
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
        return MeetIcon;
      default:
        return Play;
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
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
  if (!isSubscribed && user?.role !== 'teacher') {
    // Ouvre / ferme un chapitre (on part de l'état réellement affiché, donc un seul clic suffit)
    const toggleChapter = (chapterId, currentlyOpen) => {
      setOpenPreviewChapters((prev) => ({ ...prev, [chapterId]: !currentlyOpen }));
    };

    // Filet de sécurité : un cours à 0 FCFA est considéré gratuit même si la case
    // "Cours gratuit" n'a pas été explicitement cochée à la création.
    const courseIsFree = course.isFree || course.price === 0;

    const levelLabel = course.level === 'TS' ? 'Terminale S' : course.level;
    const teacherName = course.teacher?.name || 'Aliou Sow';
    const chaptersCount = course.chaptersCount ?? course.chapters?.length ?? 0;
    const lessonsCount =
      course.lessonsCount ??
      (course.chapters || []).reduce((total, ch) => total + (ch.lessons?.length || 0), 0);

    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareLinks = [
      {
        label: 'Facebook',
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
        className: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
      },
      {
        label: 'WhatsApp',
        href: `https://wa.me/?text=${encodeURIComponent(`${course.title} ${pageUrl}`)}`,
        className: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
      },
      {
        label: 'X',
        href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(course.title)}`,
        className: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
      },
    ];

    const previewTabs = [
      { key: 'content', label: 'Contenu' },
      { key: 'info', label: 'Informations de base' },
      { key: 'qa', label: 'Questions / Réponses' },
    ];

    const primaryBtn =
      'w-full bg-[#009688] hover:bg-[#00796b] text-white font-bold px-6 py-3.5 rounded-full text-sm text-center block transition shadow-sm';

    return (
      <CourseShell>
        <div className={`min-h-screen bg-slate-50 pb-16 text-slate-800 ${user ? '' : 'pt-[72px]'}`}>
          {/* ===== Bannière pleine largeur : titre, description, chiffres clés ===== */}
          <section className="relative overflow-hidden bg-gradient-to-r from-[#00695c] via-[#00897b] to-[#009688] text-white">
            <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-white/5 pointer-events-none"></div>
            <div className="absolute -bottom-28 left-1/3 w-64 h-64 rounded-full bg-[#f59d0e]/15 pointer-events-none"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-24 lg:pb-28">
              <div className="lg:w-2/3 lg:pr-10">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-xs bg-white/15 px-3 py-1 rounded-full font-semibold">{course.subject}</span>
                  <span className="text-xs bg-[#f59d0e] text-white px-3 py-1 rounded-full font-bold">
                    {levelLabel}
                  </span>
                  {courseIsFree && (
                    <span className="text-xs bg-emerald-500 px-3 py-1 rounded-full font-bold">Gratuit</span>
                  )}
                </div>

                <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">{course.title}</h1>

                {course.description && (
                  <p className="mt-4 text-white/85 leading-relaxed whitespace-pre-line">{course.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6 text-sm text-white/90">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#f59d0e]" />
                    {chaptersCount} section{chaptersCount > 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-[#f59d0e]" />
                    {lessonsCount} leçon{lessonsCount > 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#f59d0e]" />
                    {levelLabel}
                  </span>
                  {course.duration && (
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#f59d0e]" />
                      {course.duration}
                    </span>
                  )}
                </div>

                <p className="mt-5 text-sm text-white/75">
                  Par <span className="font-semibold text-white">{teacherName}</span>
                </p>
              </div>
            </div>
          </section>

          {/* ===== Corps : onglets à gauche, carte d'accès à droite (elle chevauche la bannière) ===== */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 -mt-16 lg:-mt-20 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Colonne principale */}
            <div className="order-2 lg:order-1 lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div role="tablist" className="flex border-b border-slate-200 px-2 overflow-x-auto">
                  {previewTabs.map((tab) => (
                    <button
                      key={tab.key}
                      role="tab"
                      aria-selected={previewTab === tab.key}
                      onClick={() => setPreviewTab(tab.key)}
                      className={`px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition cursor-pointer ${
                        previewTab === tab.key
                          ? 'border-[#009688] text-[#009688]'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* --- Contenu : sections repliables, leçons verrouillées --- */}
                {previewTab === 'content' && (
                  <div className="p-4 sm:p-6">
                    {!course.chapters || course.chapters.length === 0 ? (
                      <p className="text-sm text-slate-400 py-10 text-center">
                        Le contenu de ce module sera bientôt disponible.
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-slate-500 mb-4">
                          {chaptersCount} section{chaptersCount > 1 ? 's' : ''} • {lessonsCount} leçon
                          {lessonsCount > 1 ? 's' : ''}
                        </p>
                        <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 overflow-hidden">
                          {course.chapters.map((chapter, idx) => {
                            const isOpen = openPreviewChapters[chapter._id] ?? idx === 0;
                            const lessons = chapter.lessons || [];
                            return (
                              <div key={chapter._id}>
                                <button
                                  onClick={() => toggleChapter(chapter._id, isOpen)}
                                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-slate-50 hover:bg-slate-100 text-left cursor-pointer transition"
                                >
                                  <span className="font-bold text-sm text-slate-900">{chapter.title}</span>
                                  <span className="flex items-center gap-3 shrink-0">
                                    <span className="text-xs text-slate-500">
                                      {lessons.length} leçon{lessons.length > 1 ? 's' : ''}
                                    </span>
                                    <ChevronDown
                                      className={`w-4 h-4 text-slate-500 transition-transform ${
                                        isOpen ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </span>
                                </button>

                                {isOpen && (
                                  <ul className="bg-white">
                                    {lessons.length === 0 ? (
                                      <li className="px-4 py-3 text-sm text-slate-400">
                                        Aucune leçon pour le moment.
                                      </li>
                                    ) : (
                                      lessons.map((lesson) => {
                                        const LessonIcon = getLessonTypeIcon(lesson.contentType);
                                        return (
                                          <li
                                            key={lesson._id}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 border-t border-slate-100 first:border-t-0"
                                          >
                                            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <LessonIcon className="w-4 h-4 text-slate-400 shrink-0" />
                                            <span className="truncate">{lesson.title}</span>
                                          </li>
                                        );
                                      })
                                    )}
                                  </ul>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* --- Informations de base --- */}
                {previewTab === 'info' && (
                  <div className="p-4 sm:p-6 space-y-6 text-sm">
                    {course.description && (
                      <div>
                        <h3 className="font-bold text-slate-900 mb-2">Description</h3>
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
                        { label: 'Durée', value: course.duration },
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

                {/* --- Questions / Réponses : réservé aux élèves abonnés --- */}
                {previewTab === 'qa' && (
                  <div className="p-8 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Salon de discussion</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      Les élèves abonnés peuvent poser leurs questions à M. Aliou Sow et échanger avec les autres
                      élèves dans le salon de ce cours.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne latérale : sur téléphone elle passe AVANT le contenu pour que le bouton d'accès soit visible */}
            <aside className="order-1 lg:order-2 lg:col-span-1 space-y-4 lg:sticky lg:top-20">
              {/* Carte d'accès */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg">
                <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <div className="flex items-baseline gap-2.5 flex-wrap">
                      <p className="text-2xl font-extrabold text-[#009688]">
                        {courseIsFree ? 'Gratuit' : `${Number(course.price || 6000).toLocaleString('fr-FR')} FCFA`}
                      </p>
                      {!courseIsFree && course.originalPrice > (course.price || 6000) && (
                        <span className="text-sm text-slate-400 line-through">
                          {Number(course.originalPrice).toLocaleString('fr-FR')} FCFA
                        </span>
                      )}
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Clock className="w-3.5 h-3.5 text-[#f59d0e]" />
                      Accès pendant {course.duration || (course.durationMonths ? `${course.durationMonths} mois` : '1 mois renouvelable')}
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
                        <button
                          onClick={handleEnrollFree}
                          disabled={enrollingFree}
                          className="w-full bg-[#009688] hover:bg-[#00796b] disabled:opacity-60 text-white font-bold px-6 py-3.5 rounded-full text-sm text-center flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
                        >
                          {enrollingFree ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>Explorez maintenant !</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <Link to="/student-dashboard" className={primaryBtn}>
                          Retourner au tableau de bord
                        </Link>
                      )
                    ) : (
                      <Link to="/login" className={primaryBtn}>
                        Se connecter pour accéder gratuitement
                      </Link>
                    )
                  ) : (
                    <Link to={user ? '/student-dashboard' : '/login'} className={primaryBtn}>
                      {user ? "S'abonner depuis mon espace" : 'Se connecter pour souscrire'}
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

              {/* Partager */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-3">Partager</h4>
                <div className="flex flex-wrap items-center gap-2">
                  {shareLinks.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold transition ${s.className}`}
                    >
                      {s.label}
                    </a>
                  ))}
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer transition"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Lien copié !</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Copier le lien</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instructeur */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-3">Instructeur</h4>
                <div className="flex items-center gap-3">
                  <img
                    src={
                      course.teacher?.avatar ||
                      'https://api.dicebear.com/7.x/initials/svg?seed=' + (course.teacher?.name || 'Prof')
                    }
                    alt={teacherName}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900">{teacherName}</div>
                    <div className="text-xs text-slate-400">Professeur de Mathématiques &amp; Physique-Chimie</div>
                  </div>
                </div>
                {course.teacher?.bio && (
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">{course.teacher.bio}</p>
                )}
              </div>

              {/* Ce qui est inclus */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-3">Ce qui est inclus</h4>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-3">
                    <Video className="w-4 h-4 text-[#009688] shrink-0" />
                    <span>Cours vidéo et séances en direct</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[#f59d0e] shrink-0" />
                    <span>Fiches et documents PDF</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Quiz et évaluations corrigés</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-[#f59d0e] shrink-0" />
                    <span>Salon de discussion avec le professeur</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>

          {/* ===== Avis des élèves ===== */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
            <CourseReviews courseId={id} canReview={user?.role === 'student' && isSubscribed} />
          </div>
        </div>
      </CourseShell>
    );
  }

  return (
    <CourseShell>
    <div className="min-h-screen bg-[#f8fafc] pt-8 pb-12 px-4 md:px-8 text-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Barre latérale gauche - Infos & Chapitres */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-100">
            <span className="text-xs bg-[#e0f2f1] text-[#00796b] border border-[#009688]/20 px-2 py-0.5 rounded font-semibold uppercase">
              {course.subject} • {course.level}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-3 mb-2">{course.title}</h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">{course.description}</p>
            <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
              <img
                src={course.teacher?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + (course.teacher?.name || 'Prof')}
                alt={course.teacher?.name || 'Professeur'}
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
              <div>
                <div className="text-xs font-bold text-slate-700">Prof. {course.teacher?.name || 'Non renseigné'}</div>
                <div className="text-[10px] text-slate-400">Auteur du cours</div>
              </div>
            </div>
          </div>

          {/* Onglets */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100 text-center text-xs font-bold">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-2 rounded-lg cursor-pointer transition ${activeTab === 'content' ? 'bg-[#009688] text-white' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Leçons
            </button>
            <button
              onClick={() => setActiveTab('discussion')}
              className={`py-2 rounded-lg cursor-pointer transition flex items-center justify-center gap-1 ${activeTab === 'discussion' ? 'bg-[#009688] text-white' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <span>Salon</span>
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`py-2 rounded-lg cursor-pointer transition ${activeTab === 'quizzes' ? 'bg-[#009688] text-white' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Quiz
            </button>
          </div>

          {/* Liste des Chapitres / Leçons si onglet Leçons */}
          {activeTab === 'content' && (
            <div className="glass-card p-4 rounded-2xl border border-slate-100 space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#009688]">Sommaire</span>
                {user?.role === 'teacher' && (
                  <button
                    onClick={() => setShowAddChapter(!showAddChapter)}
                    className="p-1 bg-[#e0f2f1] text-[#009688] border border-[#009688]/20 rounded hover:bg-[#009688] hover:text-white"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Création Chapitre */}
              {showAddChapter && (
                <form onSubmit={handleAddChapter} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    className="input-animated text-xs p-1.5"
                    placeholder="Nom du chapitre..."
                  />
                  <button type="submit" className="px-3 bg-[#009688] hover:bg-[#00796b] rounded text-xs font-bold text-white">Ajouter</button>
                </form>
              )}

              {course.chapters?.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Aucun chapitre créé.</p>
              ) : (
                course.chapters.map((chapter) => (
                  <div key={chapter._id} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-50 px-2 py-1.5 rounded">
                      <span className="truncate">{chapter.title}</span>
                      <div className="flex gap-1">
                        {user?.role === 'teacher' && (
                          <>
                            <button
                              onClick={() => setSelectedChapterId(chapter._id)}
                              className="p-0.5 text-[#009688] hover:text-[#00796b]"
                              title="Ajouter leçon"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteChapter(chapter._id)}
                              className="p-0.5 text-red-500 hover:text-red-700"
                              title="Supprimer chapitre"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 pl-2">
                      {chapter.lessons.map((lesson) => (
                        <div
                          key={lesson._id}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs transition cursor-pointer ${
                            activeLesson?._id === lesson._id
                              ? 'bg-[#e0f2f1] border border-[#009688]/30 text-[#00796b] font-semibold'
                              : 'hover:bg-slate-50 border border-transparent text-slate-500'
                          }`}
                          onClick={() => {
                            setActiveLesson(lesson);
                            setActiveQuiz(null);
                          }}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {lesson.contentType === 'video' ? (
                              <Play className="w-3.5 h-3.5" />
                            ) : lesson.contentType === 'pdf' ? (
                              <FileText className="w-3.5 h-3.5" />
                            ) : lesson.contentType === 'jitsi' ? (
                              <img src="https://cdn.jsdelivr.net/npm/@thesvg/icons/icons/jitsi.svg" alt="Jitsi" className="w-3.5 h-3.5" />
                            ) : (
                              <Video className="w-3.5 h-3.5" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          {user?.role === 'teacher' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLesson(chapter._id, lesson._id);
                              }}
                              className="p-0.5 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Panneau Principal droit (Visualiseur de leçon, Chat, Quiz) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* LEÇONS */}
          {activeTab === 'content' && (
            <div className="glass-card p-6 rounded-3xl border border-slate-100 min-h-[60vh] flex flex-col justify-between">
              {/* Module de création de Leçon */}
              {selectedChapterId && user?.role === 'teacher' && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6 slide-in">
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
                          className="input-animated p-1.5"
                          placeholder="Introduction aux forces"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">Type de contenu</label>
                        <select
                          value={newLessonType}
                          onChange={(e) => setNewLessonType(e.target.value)}
                          className="input-animated p-1.5 bg-white border border-slate-200 text-slate-800 rounded"
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
                          className="input-animated p-1.5"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>
                    )}

                    {newLessonType === 'jitsi' && (
                      <div className="flex items-center gap-3 bg-[#e0f2f1] border border-[#009688]/20 rounded-lg p-3">
                        <img src="https://cdn.jsdelivr.net/npm/@thesvg/icons/icons/jitsi.svg" alt="Jitsi" className="w-6 h-6 shrink-0" />
                        <p className="text-slate-500 text-[11px] leading-relaxed">
                          Une salle de classe virtuelle sera créée automatiquement pour cette leçon.
                          Aucun lien à saisir : les élèves rejoignent le direct directement depuis la
                          page du cours, sans quitter la plateforme.
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
                          className="input-animated p-1.5"
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
                          className="input-animated h-24 p-1.5 resize-none"
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
                          className="input-animated text-xs text-slate-500 p-1.5"
                        />
                      </div>
                    )}

                    <div className="flex gap-2 justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => setSelectedChapterId(null)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={addingLesson}
                        className="px-4 py-2 bg-[#009688] hover:bg-[#00796b] text-white rounded text-xs font-bold"
                      >
                        {addingLesson ? 'Chargement Cloudinary...' : 'Enregistrer'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeLesson ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-bold text-slate-900">{activeLesson.title}</h3>
                    <span className="text-xs bg-[#e0f2f1] text-[#00796b] border border-[#009688]/20 px-3 py-1 rounded font-bold capitalize">
                      {activeLesson.contentType}
                    </span>
                  </div>

                  {/* Lecteur Vidéo */}
                  {activeLesson.contentType === 'video' && activeLesson.youtubeUrl && (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 bg-black shadow-lg">
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

                  {/* Visionneuse PDF */}
                  {activeLesson.contentType === 'pdf' && activeLesson.pdfPath && (
                    <div className="w-full space-y-4">
                      <div className="p-8 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center">
                        <FileText className="w-16 h-16 text-[#009688] mb-4" />
                        <h4 className="text-base font-bold text-slate-900 mb-2">Fiche de cours PDF</h4>
                        <p className="text-slate-500 text-xs mb-6">
                          Téléchargez et visualisez le document PDF associé à cette leçon (hébergé de manière sécurisée).
                        </p>
                        <a
                          href={getInlinePdfUrl(activeLesson.pdfPath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-shiny px-6 py-3 bg-[#009688] hover:bg-[#00796b] text-white rounded-xl text-xs font-bold shadow-md inline-block cursor-pointer"
                        >
                          Visualiser le PDF (Cloudinary)
                        </a>
                      </div>
                      
                      {/* Embed Option for desktop */}
                      <div className="hidden md:block w-full h-[500px] rounded-2xl overflow-hidden border border-slate-100">
                        <embed src={getInlinePdfUrl(activeLesson.pdfPath)} type="application/pdf" width="100%" height="100%" />
                      </div>
                    </div>
                  )}

                  {/* Salle de classe en direct intégrée (Jitsi) */}
                  {activeLesson.contentType === 'jitsi' && (
                    <div className="w-full space-y-3">
                      <div className="flex items-center gap-2 bg-[#e0f2f1] border border-[#009688]/20 rounded-lg p-3 text-xs text-slate-600">
                        <img src="https://cdn.jsdelivr.net/npm/@thesvg/icons/icons/jitsi.svg" alt="Jitsi" className="w-5 h-5 shrink-0" />
                        <span>Salle de classe en direct — activez votre caméra/micro dans la fenêtre ci-dessous pour rejoindre.</span>
                      </div>
                      <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-slate-100 bg-black">
                        <iframe
                          src={`https://meet.jit.si/profsow-${course._id}-${activeLesson._id}`}
                          title={activeLesson.title}
                          allow="camera; microphone; fullscreen; display-capture; autoplay"
                          style={{ width: '100%', height: '100%', border: 0 }}
                        ></iframe>
                      </div>
                    </div>
                  )}

                  {/* Google Meet Link */}
                  {activeLesson.contentType === 'meet' && activeLesson.meetLink && (
                    <div className="p-8 bg-slate-50 border border-slate-100 rounded-2xl text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                        <Video className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mb-2">Cours en direct avec M. Sow</h4>
                      <p className="text-slate-500 text-xs mb-6 max-w-sm">
                        Rejoignez la réunion virtuelle en cours pour assister au live ou poser vos questions.
                      </p>
                      <a
                        href={activeLesson.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-neon text-white px-8 py-3.5 rounded-xl font-bold text-xs"
                      >
                        Rejoindre le Direct Google Meet
                      </a>
                    </div>
                  )}

                  {/* Contenu textuel */}
                  {activeLesson.contentType === 'text' && (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 leading-relaxed text-sm text-slate-700 font-medium whitespace-pre-wrap break-words">
                      {activeLesson.content}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-20 text-center">
                  <Info className="w-12 h-12 text-slate-300 mb-4" />
                  <p className="text-sm">Aucune leçon active sélectionnée.</p>
                  <p className="text-xs mt-1">Veuillez sélectionner ou ajouter une leçon dans le menu.</p>
                </div>
              )}
            </div>
          )}

          {/* FORUM DE DISCUSSION */}
          {activeTab === 'discussion' && (
            <div className="glass-card p-6 rounded-3xl border border-slate-100 min-h-[60vh] flex flex-col justify-between">
              <h3 className="text-lg font-bold text-[#009688] border-b border-slate-100 pb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <span>Discussion & Soutien en Direct</span>
              </h3>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto max-h-96 my-4 space-y-4 pr-1">
                {messages.length === 0 ? (
                  <p className="text-xs text-slate-400 py-10 text-center">Aucun message. Lancez la discussion !</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg._id} className={`flex items-start gap-3 text-xs max-w-[80%] ${msg.sender?._id === user?._id ? 'ml-auto flex-row-reverse' : ''}`}>
                      <img src={msg.sender?.avatar} alt={msg.sender?.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold ${msg.sender?.role === 'teacher' ? 'text-[#009688]' : 'text-slate-700'}`}>
                            {msg.sender?.name}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className={`p-3 rounded-2xl leading-relaxed ${msg.sender?._id === user?._id ? 'bg-[#009688] text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-slate-100 pt-4">
                <input
                  type="text"
                  required
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="input-animated text-xs py-2.5 pl-4"
                  placeholder="Posez votre question à M. Sow ou aux autres élèves..."
                />
                <button
                  type="submit"
                  disabled={sendingMessage}
                  className="px-4 bg-[#009688] hover:bg-[#00796b] text-white rounded-lg flex items-center justify-center cursor-pointer shadow"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* QUIZZES */}
          {activeTab === 'quizzes' && (
            <div className="glass-card p-6 rounded-3xl border border-slate-100 min-h-[60vh] flex flex-col justify-between">
              
              {/* Header Quiz */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                <h3 className="text-lg font-bold text-[#009688] flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>Exercices d'Évaluation</span>
                </h3>
                {user?.role === 'teacher' && (
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
                      }
                    }}
                    className="btn-shiny px-4 py-2 bg-[#009688] hover:bg-[#00796b] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Créer un Quiz</span>
                  </button>
                )}
              </div>

              {/* FORMULAIRE DE CRÉATION DE QUIZ (PROF) */}
              {showAddQuiz && user?.role === 'teacher' && (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 mb-6 text-xs slide-in">
                  <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
                    {editingQuizId ? 'Modifier le Quiz' : 'Nouveau Quiz'}
                  </h4>
                  <form onSubmit={handleSaveQuiz} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-slate-500">Titre du Quiz</label>
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
                            className="absolute top-2 right-2 text-red-500"
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
                            <label className="block text-slate-500 font-semibold">Options de réponse & Bonne réponse</label>
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
                                    className="text-red-500"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addOptionField(qIdx)}
                              className="text-[#009688] font-bold hover:underline"
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
                        className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700"
                      >
                        + Ajouter une question
                      </button>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={resetQuizForm}
                          className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={savingQuiz}
                          className="px-6 py-2 bg-[#009688] hover:bg-[#00796b] rounded text-white font-bold disabled:opacity-60"
                        >
                          {savingQuiz ? 'Enregistrement...' : editingQuizId ? 'Enregistrer les modifications' : 'Créer le Quiz'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* LISTE ET JEU DU QUIZ */}
              {activeQuiz ? (
                /* QUIZ ACTIF (RÉALISATION ÉLÈVE OU APERÇU PROF) */
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
                      className="text-slate-500 hover:text-slate-800 text-xs font-bold"
                    >
                      Retour
                    </button>
                  </div>

                  {quizScore ? (
                    <div className="text-center py-8 space-y-6 slide-in">
                      <div className="w-16 h-16 bg-[#e0f2f1] border border-[#009688]/20 text-[#009688] rounded-full flex items-center justify-center mx-auto mb-2">
                        <Award className="w-10 h-10" />
                      </div>
                      <h4 className="text-2xl font-bold text-slate-900">Résultats</h4>
                      <p className="text-slate-500 text-sm">
                        {isPreviewMode ? 'Aperçu du score obtenu avec ces réponses :' : 'Vous avez terminé le quiz avec le score de :'}
                      </p>
                      <div className="text-4xl font-black text-[#009688]">{quizScore.score} / {quizScore.total}</div>
                      <p className="text-slate-400 text-xs">Pourcentage d'exactitude : {quizScore.percentage}%</p>
                      {isPreviewMode && (
                        <p className="text-amber-600 text-xs">Cette tentative n'a pas été enregistrée (mode aperçu).</p>
                      )}
                      
                      {/* Correction recap */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-4 max-w-xl mx-auto text-xs max-h-60 overflow-y-auto">
                        <h5 className="font-bold text-slate-700">Correction :</h5>
                        {activeQuiz.questions.map((q, idx) => (
                          <div key={idx} className="border-b border-slate-200 pb-2">
                            <p className="font-semibold text-slate-800">{idx+1}. {q.questionText}</p>
                            <p className="text-emerald-600 mt-1">Bonne réponse : {q.options[q.correctAnswerIndex]}</p>
                            {quizAnswers[idx] !== q.correctAnswerIndex && (
                              <p className="text-red-600">Votre choix : {q.options[quizAnswers[idx]] || 'Aucun'}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => { setActiveQuiz(null); setIsPreviewMode(false); }}
                        className="w-full max-w-xs btn-neon text-white font-bold py-3 rounded-xl cursor-pointer"
                      >
                        Terminer
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {activeQuiz.questions.map((q, idx) => (
                        <div key={idx} className="glass-card p-6 rounded-2xl border border-slate-100 space-y-4 slide-in">
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
                                    : 'bg-white border-slate-200 hover:border-slate-400 text-slate-500'
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
                        className="w-full btn-neon text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer mt-6 text-sm"
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
                /* RÉSULTATS DES ÉLÈVES POUR CE QUIZ (PROF) */
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h4 className="text-base font-bold text-slate-900">
                      Résultats — <span className="text-[#009688]">{viewingResultsQuiz.title}</span>
                    </h4>
                    <button
                      onClick={() => { setViewingResultsQuiz(null); setQuizResults([]); }}
                      className="text-slate-500 hover:text-slate-800 text-xs font-bold"
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
                      <p className="text-sm">Aucun élève n'a encore soumis ce quiz.</p>
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
                /* LISTE DES QUIZZES DISPONIBLES */
                <div className="space-y-4">
                  {quizzes.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-sm">Aucune évaluation programmée.</p>
                    </div>
                  ) : (
                    quizzes.map((quiz) => (
                      <div key={quiz._id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm hover:border-[#009688]/40 transition">
                        <div>
                          <div className="font-bold text-slate-800">{quiz.title}</div>
                          <div className="text-[10px] text-slate-400 mt-1">{quiz.questions.length} questions interactives</div>
                        </div>

                        {user?.role === 'teacher' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePreviewQuiz(quiz)}
                              title="Aperçu"
                              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 cursor-pointer transition"
                            >
                              Aperçu
                            </button>
                            <button
                              onClick={() => handleEditQuiz(quiz)}
                              title="Modifier"
                              className="px-3 py-1.5 bg-[#e0f2f1] border border-[#009688]/20 hover:bg-[#009688] hover:text-white rounded-lg text-xs font-bold text-[#009688] cursor-pointer transition"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleViewResults(quiz)}
                              title="Voir les résultats"
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
                            className="px-4 py-1.5 bg-[#e0f2f1] border border-[#009688]/20 hover:bg-[#009688] hover:text-white rounded-lg text-xs font-bold text-[#009688] cursor-pointer transition"
                          >
                            Faire le Quiz
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8">
        <CourseReviews courseId={id} canReview={user?.role === 'student' && isSubscribed} />
      </div>
    </div>
    </CourseShell>
  );
};

export default CourseDetail;