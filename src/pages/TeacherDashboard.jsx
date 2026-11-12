import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';
import api from '../utils/api';
import { formatLevel } from '../components/CourseCard';
import ConfirmModal from '../components/ConfirmModal';
import ExerciseModal from '../components/ExerciseModal';
import MathText from '../components/MathText';
import {
  Plus,
  BookOpen,
  Users,
  BarChart3,
  AlertCircle,
  Trash2,
  Edit,
  ExternalLink,
  X,
  AlignLeft,
  Layers,
  GraduationCap,
  Clock,
  ImagePlus,
  Sparkles,
  LayoutDashboard,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Settings,
  LogOut,
  Shield,
  Check,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Video,
  FileText,
  Play,
  MessageSquare,
  Star,
  Flag,
  Send,
  Megaphone,
  Bell,
  Calendar,
  Search,
  Ban,
  CheckCircle2,
  Mail,
  Award,
  Calculator,
  Globe,
  Menu,
  Zap,
} from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

const getSubscriptionState = (sub) => {
  if (!sub) return 'expired';
  if (sub.status === 'suspended') return 'suspended';
  if (sub.status === 'expired' || new Date(sub.expiresAt) <= new Date()) return 'expired';
  return 'active';
};

const formatDateShort = (val) =>
  val
    ? new Date(val).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

const TeacherDashboard = () => {
  const { user, logout, updateProfile } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);
  const navigate = useNavigate();

  const availableSubjects = settings.subjects?.length
    ? settings.subjects
    : ['Mathématiques', 'Physique-Chimie'];
  const availableLevels = settings.levels?.length
    ? settings.levels
    : [
        { value: '4ème', label: '4ème' },
        { value: '3ème', label: '3ème' },
        { value: '2nde S', label: '2nde S' },
        { value: '1ère S', label: '1ère S' },
        { value: 'TS', label: 'Terminale S' },
      ];

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [exerciseSubmissions, setExerciseSubmissions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState('overview'); // overview | courses | exercises | quizzes | students | qa | reviews | communication | profile
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  );
  const [menuOpen, setMenuOpen] = useState(false);

  // Toast & confirmation modal
  const [toast, setToast] = useState({ type: '', text: '' });
  const [confirmState, setConfirmState] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Course CRUD modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Mathématiques');
  const [level, setLevel] = useState('TS');
  const [duration, setDuration] = useState('3 mois');
  const [price, setPrice] = useState(6000);
  const [isFree, setIsFree] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [originalPrice, setOriginalPrice] = useState(6000);
  const [imageFile, setImageFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Chapter & Lesson manager inside Courses view
  const [managingCourseId, setManagingCourseId] = useState(null);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterLocked, setNewChapterLocked] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [editingChapterTitle, setEditingChapterTitle] = useState('');
  const [lessonModal, setLessonModal] = useState(null); // { courseId, chapterId, lesson? }
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState('video');
  const [lessonYoutube, setLessonYoutube] = useState('');
  const [lessonMeet, setLessonMeet] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonPdf, setLessonPdf] = useState(null);
  const [savingLesson, setSavingLesson] = useState(false);

  // Quiz builder & analytics state
  const [quizTab, setQuizTab] = useState('list'); // list | builder | results
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [quizCourseId, setQuizCourseId] = useState('');
  const [quizChapterId, setQuizChapterId] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizPassingScore, setQuizPassingScore] = useState(50);
  const [quizMaxAttempts, setQuizMaxAttempts] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([
    { questionText: '', questionType: 'qcm', options: ['', ''], correctAnswerIndex: 0, correctAnswerText: '' },
  ]);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [selectedStatsQuizId, setSelectedStatsQuizId] = useState('all');

  // Students filters & remind modal
  const [studentSearch, setStudentSearch] = useState('');
  const [studentCourseFilter, setStudentCourseFilter] = useState('all');
  const [studentStatusFilter, setStudentStatusFilter] = useState('all');
  const [remindModalSub, setRemindModalSub] = useState(null);
  const [remindMessage, setRemindMessage] = useState('');
  const [sendingRemind, setSendingRemind] = useState(false);

  // Q&A filters & inline actions
  const [qaFilter, setQaFilter] = useState('unanswered'); // all | unanswered | unresolved | resolved
  const [qaCourseFilter, setQaCourseFilter] = useState('all');
  const [replyDrafts, setReplyDrafts] = useState({});
  const [editingQa, setEditingQa] = useState(null); // { msgId, replyId?, text }

  // Reviews reply & report state
  const [reviewReplyDrafts, setReviewReplyDrafts] = useState({});
  const [reportModalReview, setReportModalReview] = useState(null);

  // Exercises management & grading state
  const [exerciseTab, setExerciseTab] = useState('catalog'); // catalog | submissions
  const [exerciseCourseFilter, setExerciseCourseFilter] = useState('all');
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState('all');
  const [exerciseModalState, setExerciseModalState] = useState({
    open: false,
    courseId: '',
    chapterId: '',
    editing: null,
  });
  const [gradeDrafts, setGradeDrafts] = useState({});
  const [reportReason, setReportReason] = useState('');

  // Communication (Announcements)
  const [annCourseId, setAnnCourseId] = useState('');
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annSendEmail, setAnnSendEmail] = useState(true);
  const [postingAnn, setPostingAnn] = useState(false);

  // Teacher Profile & Preferences quick editor
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [profileSubjects, setProfileSubjects] = useState(user?.subjects || []);
  const [profilePassword, setProfilePassword] = useState('');
  const [profileAvatarFile, setProfileAvatarFile] = useState(null);
  const [prefEmailNotifs, setPrefEmailNotifs] = useState(user?.preferences?.emailNotifications !== false);
  const [prefLiveReminders, setPrefLiveReminders] = useState(user?.preferences?.liveReminders !== false);
  const [savingProfile, setSavingProfile] = useState(false);

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
    if (!user || !['teacher', 'admin'].includes(user.role)) return;
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, user?.role]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
      setProfilePhone(user.phone || '');
      setProfileBio(user.bio || '');
      setProfileSubjects(Array.isArray(user.subjects) ? user.subjects : []);
      setPrefEmailNotifs(user.preferences?.emailNotifications !== false);
      setPrefLiveReminders(user.preferences?.liveReminders !== false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [allCourses, enrolledStudents, exerciseData, teacherQuizzes, scores, qaList, reviewsList] =
        await Promise.all([
          api('/courses'),
          api('/subscriptions/teacher/students').catch(() => []),
          api('/exercises/teacher/all').catch(() => ({ exercises: [], submissions: [] })),
          api('/quizzes/teacher/all').catch(() => []),
          api('/quizzes/teacher/results').catch(() => []),
          api('/discussions/teacher/all').catch(() => []),
          api('/reviews/teacher/all').catch(() => []),
        ]);
      const teacherCourses =
        user?.role === 'admin'
          ? allCourses
          : allCourses.filter((c) => (c.teacher?._id || c.teacher) === user?._id);

      setCourses(teacherCourses);
      setStudents(Array.isArray(enrolledStudents) ? enrolledStudents : []);
      setExercises(Array.isArray(exerciseData?.exercises) ? exerciseData.exercises : []);
      setExerciseSubmissions(
        Array.isArray(exerciseData?.submissions) ? exerciseData.submissions : []
      );
      setQuizzes(Array.isArray(teacherQuizzes) ? teacherQuizzes : []);
      setQuizResults(Array.isArray(scores) ? scores : []);
      setDiscussions(Array.isArray(qaList) ? qaList : []);
      setReviews(Array.isArray(reviewsList) ? reviewsList : []);

      if (teacherCourses.length > 0) {
        setQuizCourseId((prev) => prev || teacherCourses[0]._id);
        setAnnCourseId((prev) => prev || teacherCourses[0]._id);
      }
    } catch (err) {
      console.error('Erreur de récupération des données prof', err);
      showToast('error', 'Impossible de charger toutes les données de votre espace.');
    } finally {
      setLoading(false);
    }
  };

  const replaceCourseInState = (updatedCourse) => {
    if (!updatedCourse?._id) return;
    setCourses((prev) => prev.map((c) => (c._id === updatedCourse._id ? { ...c, ...updatedCourse } : c)));
  };

  // ================= CALCULS STATISTIQUES & NOTIFICATIONS =================
  const metrics = useMemo(() => {
    const activeSubs = students.filter((s) => getSubscriptionState(s) === 'active');
    const expiredSubs = students.filter((s) => getSubscriptionState(s) === 'expired');
    const suspendedSubs = students.filter((s) => getSubscriptionState(s) === 'suspended');
    const totalRevenue = students.reduce(
      (sum, s) => sum + (s.status !== 'suspended' ? Number(s.amount || 0) : 0),
      0
    );
    const totalChapters = courses.reduce((sum, c) => sum + (c.chapters?.length || 0), 0);
    const totalLessons = courses.reduce(
      (sum, c) => sum + (c.chapters || []).reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0),
      0
    );
    const publishedCourses = courses.filter((c) => c.isPublished !== false).length;
    const unansweredQuestions = discussions.filter(
      (d) => !d.isResolved && (!d.replies || d.replies.length === 0)
    );
    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : '—';

    return {
      activeSubs,
      expiredSubs,
      suspendedSubs,
      totalRevenue,
      totalChapters,
      totalLessons,
      publishedCourses,
      unansweredQuestions,
      avgRating,
    };
  }, [courses, students, discussions, reviews]);

  const recentActivity = useMemo(() => {
    const items = [];
    discussions.slice(0, 6).forEach((d) =>
      items.push({
        id: `qa-${d._id}`,
        type: 'question',
        title: `Question de ${d.sender?.name || 'Élève'}`,
        subtitle: `${d.course?.title || 'Cours'} — "${d.message}"`,
        date: d.createdAt,
        actionView: 'qa',
      })
    );
    reviews.slice(0, 6).forEach((r) =>
      items.push({
        id: `rev-${r._id}`,
        type: 'review',
        title: `Avis ${r.rating}★ de ${r.student?.name || 'Élève'}`,
        subtitle: `${r.course?.title || 'Cours'}${r.comment ? ` — "${r.comment}"` : ''}`,
        date: r.createdAt,
        actionView: 'reviews',
      })
    );
    quizResults.slice(0, 6).forEach((qr) =>
      items.push({
        id: `quiz-${qr._id}`,
        type: 'quiz',
        title: `${qr.student?.name || 'Élève'} a passé "${qr.quiz?.title || 'Quiz'}"`,
        subtitle: `Score : ${qr.score}/${qr.totalQuestions} (${Math.round(
          (qr.score / Math.max(1, qr.totalQuestions)) * 100
        )}%)`,
        date: qr.createdAt,
        actionView: 'quizzes',
      })
    );
    return items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
  }, [discussions, reviews, quizResults]);

  // ================= GESTION DES COURS (CRUD + PUBLICATION) =================
  const resetCourseForm = () => {
    const defaultPrice = settings.siteInfo?.defaultPrice ?? 6000;
    const defaultDuration = settings.siteInfo?.defaultDuration || '3 mois';
    setTitle('');
    setDescription('');
    setSubject(availableSubjects[0] || 'Mathématiques');
    setLevel(availableLevels[availableLevels.length - 1]?.value || 'TS');
    setDuration(defaultDuration);
    setPrice(defaultPrice);
    setIsFree(false);
    setIsPublished(true);
    setOriginalPrice(defaultPrice);
    setImageFile(null);
    setErrorMsg('');
    setEditingCourse(null);
  };

  const openCreateModal = () => {
    resetCourseForm();
    setShowCourseModal(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setTitle(course.title || '');
    setDescription(course.description || '');
    setSubject(course.subject || availableSubjects[0] || 'Mathématiques');
    setLevel(course.level || 'TS');
    setDuration(course.duration || '3 mois');
    setPrice(course.price ?? 6000);
    setIsFree(course.isFree || false);
    setIsPublished(course.isPublished !== false);
    setOriginalPrice(course.originalPrice || course.price || 6000);
    setImageFile(null);
    setErrorMsg('');
    setShowCourseModal(true);
  };

  const handleSubmitCourse = async (e) => {
    e.preventDefault();
    setCreating(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('subject', subject);
    formData.append('level', level);
    formData.append('duration', duration);
    formData.append('price', isFree ? 0 : price);
    formData.append('isFree', isFree);
    formData.append('isPublished', isPublished);
    if (isFree) formData.append('originalPrice', originalPrice);
    if (imageFile) formData.append('image', imageFile);

    try {
      if (editingCourse) {
        await api(`/courses/${editingCourse._id}`, { method: 'PUT', body: formData });
        showToast('success', 'Cours mis à jour.');
      } else {
        await api('/courses', { method: 'POST', body: formData });
        showToast('success', 'Nouveau cours créé.');
      }
      resetCourseForm();
      setShowCourseModal(false);
      await fetchDashboardData();
    } catch (err) {
      setErrorMsg(err.message || 'Erreur lors de l’enregistrement du cours');
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePublishCourse = async (course) => {
    const nextState = !(course.isPublished !== false);
    try {
      const updated = await api(`/courses/${course._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isPublished: nextState }),
      });
      replaceCourseInState(updated);
      showToast('success', nextState ? 'Cours publié aux élèves.' : 'Cours passé en brouillon.');
    } catch (err) {
      showToast('error', err.message || 'Impossible de modifier la publication');
    }
  };

  const handleDeleteCourse = (id) => {
    const target = courses.find((c) => c._id === id);
    setConfirmState({
      title: 'Supprimer ce cours',
      message: target ? `Supprimer le cours "${target.title}" ?` : 'Voulez-vous supprimer ce cours ?',
      details: 'Tous les chapitres, leçons, quiz et abonnements associés seront définitivement perdus.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api(`/courses/${id}`, { method: 'DELETE' });
          if (managingCourseId === id) setManagingCourseId(null);
          showToast('success', 'Cours supprimé avec succès.');
          await fetchDashboardData();
        } catch (err) {
          showToast('error', err.message || 'Erreur lors de la suppression');
        }
      },
    });
  };

  // ================= GESTION DES CHAPITRES & LEÇONS =================
  const managedCourse = courses.find((c) => c._id === managingCourseId) || null;

  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!managedCourse || !newChapterTitle.trim()) return;
    try {
      const updated = await api(`/courses/${managedCourse._id}/chapters`, {
        method: 'POST',
        body: JSON.stringify({ title: newChapterTitle.trim(), isLocked: newChapterLocked }),
      });
      replaceCourseInState(updated);
      setNewChapterTitle('');
      setNewChapterLocked(false);
      showToast('success', 'Chapitre ajouté.');
    } catch (err) {
      showToast('error', err.message || "Erreur lors de l'ajout du chapitre");
    }
  };

  const handleSaveChapterRename = async (courseId, chapterId) => {
    if (!editingChapterTitle.trim()) return;
    try {
      const updated = await api(`/courses/${courseId}/chapters/${chapterId}`, {
        method: 'PUT',
        body: JSON.stringify({ title: editingChapterTitle.trim() }),
      });
      replaceCourseInState(updated);
      setEditingChapterId(null);
      setEditingChapterTitle('');
      showToast('success', 'Chapitre renommé.');
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleToggleChapterLock = async (courseId, chapter) => {
    try {
      const updated = await api(`/courses/${courseId}/chapters/${chapter._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isLocked: !chapter.isLocked }),
      });
      replaceCourseInState(updated);
      showToast(
        'success',
        !chapter.isLocked ? `Chapitre "${chapter.title}" verrouillé.` : `Chapitre "${chapter.title}" débloqué.`
      );
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleMoveChapter = async (course, index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= (course.chapters?.length || 0)) return;
    const ids = course.chapters.map((c) => c._id);
    [ids[index], ids[targetIdx]] = [ids[targetIdx], ids[index]];
    try {
      const updated = await api(`/courses/${course._id}/chapters/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ chapterIds: ids }),
      });
      replaceCourseInState(updated);
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleDeleteChapter = (courseId, chapter) => {
    setConfirmState({
      title: 'Supprimer ce chapitre',
      message: `Supprimer le chapitre "${chapter.title}" ?`,
      details: 'Toutes les leçons de ce chapitre seront supprimées.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const updated = await api(`/courses/${courseId}/chapters/${chapter._id}`, { method: 'DELETE' });
          replaceCourseInState(updated);
          showToast('success', 'Chapitre supprimé.');
        } catch (err) {
          showToast('error', err.message);
        }
      },
    });
  };

  const openLessonModal = (courseId, chapterId, lesson = null) => {
    setLessonModal({ courseId, chapterId, lesson });
    setLessonTitle(lesson?.title || '');
    setLessonType(lesson?.contentType || 'video');
    setLessonYoutube(lesson?.youtubeUrl || '');
    setLessonMeet(lesson?.meetLink || '');
    setLessonContent(lesson?.content || '');
    setLessonPdf(null);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!lessonModal) return;
    setSavingLesson(true);
    const { courseId, chapterId, lesson } = lessonModal;

    const formData = new FormData();
    formData.append('title', lessonTitle.trim());
    formData.append('contentType', lessonType);
    if (lessonType === 'video') formData.append('youtubeUrl', lessonYoutube.trim());
    if (lessonType === 'meet') formData.append('meetLink', lessonMeet.trim());
    if (lessonType === 'text') formData.append('content', lessonContent);
    if (lessonType === 'pdf' && lessonPdf) formData.append('pdf', lessonPdf);

    try {
      const url = lesson
        ? `/courses/${courseId}/chapters/${chapterId}/lessons/${lesson._id}`
        : `/courses/${courseId}/chapters/${chapterId}/lessons`;
      const method = lesson ? 'PUT' : 'POST';
      const updated = await api(url, { method, body: formData });
      replaceCourseInState(updated);
      setLessonModal(null);
      showToast('success', lesson ? 'Leçon mise à jour.' : 'Leçon ajoutée.');
    } catch (err) {
      showToast('error', err.message || "Erreur lors de l'enregistrement de la leçon");
    } finally {
      setSavingLesson(false);
    }
  };

  const handleMoveLesson = async (courseId, chapter, lIndex, direction) => {
    const targetIdx = lIndex + direction;
    if (targetIdx < 0 || targetIdx >= (chapter.lessons?.length || 0)) return;
    const lessonIds = chapter.lessons.map((l) => l._id);
    [lessonIds[lIndex], lessonIds[targetIdx]] = [lessonIds[targetIdx], lessonIds[lIndex]];
    try {
      const updated = await api(`/courses/${courseId}/chapters/${chapter._id}`, {
        method: 'PUT',
        body: JSON.stringify({ lessonIds }),
      });
      replaceCourseInState(updated);
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleDeleteLesson = (courseId, chapterId, lesson) => {
    setConfirmState({
      title: 'Supprimer cette leçon',
      message: `Supprimer la leçon "${lesson.title}" ?`,
      details: 'Cette ressource ne sera plus accessible aux élèves.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const updated = await api(`/courses/${courseId}/chapters/${chapterId}/lessons/${lesson._id}`, {
            method: 'DELETE',
          });
          replaceCourseInState(updated);
          showToast('success', 'Leçon supprimée.');
        } catch (err) {
          showToast('error', err.message);
        }
      },
    });
  };

  // ================= QUIZ & ÉVALUATIONS =================
  const resetQuizForm = () => {
    setEditingQuizId(null);
    setQuizCourseId(courses[0]?._id || '');
    setQuizChapterId('');
    setQuizTitle('');
    setQuizPassingScore(50);
    setQuizMaxAttempts(0);
    setQuizQuestions([
      { questionText: '', questionType: 'qcm', options: ['', ''], correctAnswerIndex: 0, correctAnswerText: '' },
    ]);
  };

  const startEditQuiz = (quiz) => {
    setEditingQuizId(quiz._id);
    setQuizCourseId(quiz.course?._id || quiz.course || '');
    setQuizChapterId(quiz.chapterId || '');
    setQuizTitle(quiz.title || '');
    setQuizPassingScore(quiz.passingScore ?? 50);
    setQuizMaxAttempts(quiz.maxAttempts ?? 0);
    setQuizQuestions(
      (quiz.questions || []).map((q) => ({
        questionText: q.questionText || '',
        questionType: q.questionType || 'qcm',
        options: Array.isArray(q.options) && q.options.length > 0 ? [...q.options] : ['', ''],
        correctAnswerIndex: q.correctAnswerIndex ?? 0,
        correctAnswerText: q.correctAnswerText || '',
      }))
    );
    setQuizTab('builder');
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!quizCourseId || !quizTitle.trim()) return;
    setSavingQuiz(true);
    const targetCourse = courses.find((c) => c._id === quizCourseId);
    const targetChapter = targetCourse?.chapters?.find((ch) => String(ch._id) === String(quizChapterId));
    const payload = {
      courseId: quizCourseId,
      title: quizTitle.trim(),
      chapterId: quizChapterId || '',
      chapterTitle: targetChapter?.title || '',
      passingScore: Number(quizPassingScore) || 50,
      maxAttempts: Number(quizMaxAttempts) || 0,
      questions: quizQuestions,
    };

    try {
      if (editingQuizId) {
        const updated = await api(`/quizzes/${editingQuizId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setQuizzes((prev) => prev.map((q) => (q._id === editingQuizId ? updated : q)));
        showToast('success', 'Quiz mis à jour.');
      } else {
        const created = await api('/quizzes', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setQuizzes((prev) => [created, ...prev]);
        showToast('success', 'Quiz créé avec succès.');
      }
      resetQuizForm();
      setQuizTab('list');
    } catch (err) {
      showToast('error', err.message || 'Erreur lors de la sauvegarde du quiz');
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleDeleteQuiz = (quiz) => {
    setConfirmState({
      title: 'Supprimer ce quiz',
      message: `Supprimer le quiz "${quiz.title}" ?`,
      details: 'Tous les scores et statistiques d’élèves pour ce quiz seront supprimés.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api(`/quizzes/${quiz._id}`, { method: 'DELETE' });
          setQuizzes((prev) => prev.filter((q) => q._id !== quiz._id));
          setQuizResults((prev) => prev.filter((r) => (r.quiz?._id || r.quiz) !== quiz._id));
          showToast('success', 'Quiz supprimé.');
        } catch (err) {
          showToast('error', err.message);
        }
      },
    });
  };

  // ================= SUIVI DES ÉLÈVES =================
  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return students.filter((sub) => {
      if (studentCourseFilter !== 'all' && (sub.course?._id || sub.course) !== studentCourseFilter) {
        return false;
      }
      const state = getSubscriptionState(sub);
      if (studentStatusFilter !== 'all' && state !== studentStatusFilter) return false;
      if (!q) return true;
      return `${sub.student?.name || ''} ${sub.student?.email || ''} ${sub.course?.title || ''}`
        .toLowerCase()
        .includes(q);
    });
  }, [students, studentSearch, studentCourseFilter, studentStatusFilter]);

  const handleToggleStudentStatus = (sub) => {
    const isCurrentlySuspended = sub.status === 'suspended';
    setConfirmState({
      title: isCurrentlySuspended ? 'Débloquer cet élève' : 'Bloquer cet élève',
      message: isCurrentlySuspended
        ? `Rétablir l'accès de ${sub.student?.name || 'cet élève'} au cours "${sub.course?.title}" ?`
        : `Suspendre l'accès de ${sub.student?.name || 'cet élève'} au cours "${sub.course?.title}" ?`,
      details: isCurrentlySuspended
        ? "L'élève retrouvera immédiatement l'accès aux leçons et quiz."
        : "L'élève ne pourra plus consulter le contenu de ce cours tant qu'il est bloqué.",
      confirmLabel: isCurrentlySuspended ? 'Débloquer' : 'Bloquer',
      variant: isCurrentlySuspended ? 'primary' : 'danger',
      onConfirm: async () => {
        try {
          const updated = await api(`/subscriptions/${sub._id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: isCurrentlySuspended ? 'active' : 'suspended' }),
          });
          setStudents((prev) => prev.map((s) => (s._id === sub._id ? updated : s)));
          showToast('success', isCurrentlySuspended ? 'Accès rétabli.' : 'Élève bloqué sur ce cours.');
        } catch (err) {
          showToast('error', err.message);
        }
      },
    });
  };

  const handleSendRemind = async (e) => {
    e.preventDefault();
    if (!remindModalSub) return;
    setSendingRemind(true);
    try {
      const res = await api(`/subscriptions/${remindModalSub._id}/remind`, {
        method: 'POST',
        body: JSON.stringify({ message: remindMessage }),
      });
      showToast('success', res.message || 'Relance envoyée.');
      setRemindModalSub(null);
      setRemindMessage('');
    } catch (err) {
      showToast('error', err.message || "Erreur lors de l'envoi de la relance");
    } finally {
      setSendingRemind(false);
    }
  };

  // ================= QUESTIONS & RÉPONSES =================
  const filteredDiscussions = useMemo(() => {
    return discussions.filter((d) => {
      if (qaCourseFilter !== 'all' && (d.course?._id || d.course) !== qaCourseFilter) return false;
      const hasReplies = Array.isArray(d.replies) && d.replies.length > 0;
      if (qaFilter === 'unanswered') return !d.isResolved && !hasReplies;
      if (qaFilter === 'unresolved') return !d.isResolved;
      if (qaFilter === 'resolved') return Boolean(d.isResolved);
      return true;
    });
  }, [discussions, qaCourseFilter, qaFilter]);

  const handleReplyDiscussion = async (d) => {
    const text = (replyDrafts[d._id] || '').trim();
    if (!text) return;
    try {
      const updated = await api(`/discussions/${d.course?._id || d.course}/${d._id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      });
      setDiscussions((prev) => prev.map((item) => (item._id === d._id ? updated : item)));
      setReplyDrafts((prev) => ({ ...prev, [d._id]: '' }));
      showToast('success', 'Réponse publiée.');
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleToggleResolveDiscussion = async (d) => {
    try {
      const updated = await api(`/discussions/message/${d._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isResolved: !d.isResolved }),
      });
      setDiscussions((prev) => prev.map((item) => (item._id === d._id ? updated : item)));
      showToast('success', !d.isResolved ? 'Question marquée comme résolue.' : 'Question rouverte.');
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleSaveEditQa = async (e) => {
    e.preventDefault();
    if (!editingQa || !editingQa.text.trim()) return;
    try {
      const body = editingQa.replyId
        ? { replyId: editingQa.replyId, replyText: editingQa.text.trim() }
        : { message: editingQa.text.trim() };
      const updated = await api(`/discussions/message/${editingQa.msgId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      setDiscussions((prev) => prev.map((item) => (item._id === editingQa.msgId ? updated : item)));
      setEditingQa(null);
      showToast('success', 'Message modifié.');
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleDeleteQa = (msgId, replyId = null) => {
    setConfirmState({
      title: replyId ? 'Supprimer cette réponse' : 'Supprimer cette question',
      message: 'Confirmer la suppression définitive de ce message ?',
      details: 'Cette action de modération est irréversible.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const url = replyId
            ? `/discussions/message/${msgId}?replyId=${replyId}`
            : `/discussions/message/${msgId}`;
          const res = await api(url, { method: 'DELETE' });
          if (replyId && res?.discussion) {
            setDiscussions((prev) => prev.map((item) => (item._id === msgId ? res.discussion : item)));
          } else {
            setDiscussions((prev) => prev.filter((item) => item._id !== msgId));
          }
          showToast('success', 'Message supprimé.');
        } catch (err) {
          showToast('error', err.message);
        }
      },
    });
  };

  // ================= AVIS ÉLÈVES =================
  const handleReplyReview = async (reviewId) => {
    const reply = (reviewReplyDrafts[reviewId] || '').trim();
    if (!reply) return;
    try {
      const updated = await api(`/reviews/${reviewId}/reply`, {
        method: 'PUT',
        body: JSON.stringify({ reply }),
      });
      setReviews((prev) => prev.map((r) => (r._id === reviewId ? updated : r)));
      setReviewReplyDrafts((prev) => ({ ...prev, [reviewId]: '' }));
      showToast('success', 'Réponse à l’avis publiée.');
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleSubmitReportReview = async (e) => {
    e.preventDefault();
    if (!reportModalReview) return;
    try {
      const updated = await api(`/reviews/${reportModalReview._id}/report`, {
        method: 'PUT',
        body: JSON.stringify({ isReported: true, reason: reportReason.trim() || 'Avis abusif' }),
      });
      setReviews((prev) => prev.map((r) => (r._id === reportModalReview._id ? updated : r)));
      setReportModalReview(null);
      setReportReason('');
      showToast('success', "Avis signalé à l'administration.");
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleUnreportReview = async (reviewId) => {
    try {
      const updated = await api(`/reviews/${reviewId}/report`, {
        method: 'PUT',
        body: JSON.stringify({ isReported: false }),
      });
      setReviews((prev) => prev.map((r) => (r._id === reviewId ? updated : r)));
      showToast('success', 'Signalement retiré.');
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // ================= COMMUNICATION & PROFIL =================
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!annCourseId || !annTitle.trim() || !annMessage.trim()) return;
    setPostingAnn(true);
    try {
      const updated = await api(`/courses/${annCourseId}/announcements`, {
        method: 'POST',
        body: JSON.stringify({
          title: annTitle.trim(),
          message: annMessage.trim(),
          sendEmailToStudents: annSendEmail,
        }),
      });
      replaceCourseInState(updated);
      setAnnTitle('');
      setAnnMessage('');
      showToast('success', annSendEmail ? 'Annonce publiée et e-mails envoyés.' : 'Annonce publiée.');
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setPostingAnn(false);
    }
  };

  const handleDeleteAnnouncement = async (courseId, annId) => {
    try {
      const updated = await api(`/courses/${courseId}/announcements/${annId}`, { method: 'DELETE' });
      replaceCourseInState(updated);
      showToast('success', 'Annonce supprimée.');
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleSaveTeacherProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', profileName.trim());
      formData.append('email', profileEmail.trim().toLowerCase());
      formData.append('phone', profilePhone.trim());
      formData.append('bio', profileBio.trim());
      formData.append('subjects', JSON.stringify(profileSubjects));
      formData.append(
        'preferences',
        JSON.stringify({
          ...(user?.preferences || {}),
          emailNotifications: prefEmailNotifs,
          liveReminders: prefLiveReminders,
        })
      );
      if (profilePassword.trim()) {
        formData.append('password', profilePassword.trim());
      }
      if (profileAvatarFile) {
        formData.append('avatar', profileAvatarFile);
      }
      await updateProfile(formData);
      setProfilePassword('');
      setProfileAvatarFile(null);
      showToast('success', 'Profil et préférences enregistrés.');
    } catch (err) {
      showToast('error', err.message || 'Erreur lors de la sauvegarde du profil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="theme-myschools min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6372e8] via-[#6b5cc4] to-[#7c52a5]">
        <div className="bg-white/95 rounded-2xl p-6 shadow-xl">
          <div className="loader-spinner"></div>
        </div>
      </div>
    );
  }

  const pendingHomeworkCount = exerciseSubmissions.filter((s) => s.status === 'submitted').length;

  const handleExerciseSaved = async (saved, isEdit) => {
    showToast('success', isEdit ? 'Exercice mis à jour.' : 'Exercice créé et ajouté au module.');
    try {
      const exerciseData = await api('/exercises/teacher/all');
      setExercises(Array.isArray(exerciseData?.exercises) ? exerciseData.exercises : []);
      setExerciseSubmissions(
        Array.isArray(exerciseData?.submissions) ? exerciseData.submissions : []
      );
    } catch {
      if (saved?._id) {
        setExercises((prev) =>
          isEdit ? prev.map((ex) => (ex._id === saved._id ? saved : ex)) : [saved, ...prev]
        );
      }
    }
  };

  const handleDeleteExercise = (ex) => {
    setConfirmState({
      title: 'Supprimer cet exercice',
      message: `Supprimer l'exercice "${ex.title}" ?`,
      details: 'Toutes les copies et tentatives associées seront également supprimées.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api(`/exercises/${ex._id}`, { method: 'DELETE' });
          setExercises((prev) => prev.filter((item) => item._id !== ex._id));
          setExerciseSubmissions((prev) =>
            prev.filter((s) => (s.exercise?._id || s.exercise) !== ex._id)
          );
          showToast('success', 'Exercice supprimé.');
        } catch (err) {
          showToast('error', err.message || 'Erreur lors de la suppression');
        }
      },
    });
  };

  const handleSaveGrade = async (sub) => {
    const draft = gradeDrafts[sub._id] || {
      grade: sub.grade ?? '',
      teacherComment: sub.teacherComment || '',
      isPassed: sub.isPassed ?? true,
    };
    try {
      const updated = await api(`/exercises/submissions/${sub._id}/grade`, {
        method: 'PUT',
        body: JSON.stringify({
          grade: draft.grade,
          teacherComment: draft.teacherComment,
          isPassed: draft.isPassed,
        }),
      });
      setExerciseSubmissions((prev) => prev.map((s) => (s._id === sub._id ? updated : s)));
      showToast('success', `Correction enregistrée pour ${sub.student?.name || "l'élève"}.`);
    } catch (err) {
      showToast('error', err.message || "Erreur lors de l'enregistrement de la note");
    }
  };

  const sidebarItems = [
    { key: 'overview', label: 'Tableau de bord', icon: LayoutDashboard, group: 'TABLEAU DE BORD' },
    { key: 'courses', label: 'Cours & Contenu', icon: BookOpen, count: courses.length, group: 'PÉDAGOGIE' },
    {
      key: 'exercises',
      label: 'Exercices & Devoirs',
      icon: Calculator,
      count: pendingHomeworkCount > 0 ? pendingHomeworkCount : exercises.length,
      alert: pendingHomeworkCount > 0,
      group: 'PÉDAGOGIE',
    },
    { key: 'quizzes', label: 'Quiz & Évaluations', icon: Award, count: quizzes.length, group: 'PÉDAGOGIE' },
    { key: 'students', label: 'Suivi des élèves', icon: Users, count: metrics.activeSubs.length, group: 'SUIVI & ÉCHANGE' },
    {
      key: 'qa',
      label: 'Questions & Réponses',
      icon: MessageSquare,
      count: metrics.unansweredQuestions.length,
      alert: metrics.unansweredQuestions.length > 0,
      group: 'SUIVI & ÉCHANGE',
    },
    { key: 'reviews', label: 'Avis élèves', icon: Star, count: reviews.length, group: 'SUIVI & ÉCHANGE' },
    { key: 'communication', label: 'Communication', icon: Megaphone, group: 'SUIVI & ÉCHANGE' },
    { key: 'profile', label: 'Profil & Paramètres', icon: Settings, group: 'PARAMÉTRAGE' },
  ];

  const sidebarGroups = ['TABLEAU DE BORD', 'PÉDAGOGIE', 'SUIVI & ÉCHANGE', 'PARAMÉTRAGE'];

  // ================= RENDU : 1. TABLEAU DE BORD =================
  const renderOverview = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-[#5c6be0] to-[#4657d4] text-white p-6 rounded-2xl shadow-lg text-center">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-[26px] sm:text-[28px] font-bold tracking-tight tabular-nums leading-tight">{metrics.activeSubs.length}</div>
          <div className="text-[13px] font-semibold text-white/95 mt-1">Élèves actifs</div>
          <div className="text-xs font-medium text-white/80 mt-1">
            {metrics.expiredSubs.length} expiré(s) • {metrics.suspendedSubs.length} bloqué(s)
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#06b6d4] to-[#0ea5e9] text-white p-6 rounded-2xl shadow-lg text-center">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="text-[26px] sm:text-[28px] font-bold tracking-tight tabular-nums leading-tight">
            {metrics.publishedCourses}
            <span className="text-base font-semibold text-white/75">/{courses.length}</span>
          </div>
          <div className="text-[13px] font-semibold text-white/95 mt-1">Cours publiés</div>
          <div className="text-xs font-medium text-white/80 mt-1">
            {metrics.totalChapters} chapitres • {metrics.totalLessons} leçons
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#10b981] to-[#2dd4bf] text-white p-6 rounded-2xl shadow-lg text-center">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="text-[26px] sm:text-[28px] font-bold tracking-tight tabular-nums leading-tight">
            {metrics.totalRevenue.toLocaleString('fr-FR')} <span className="text-sm font-semibold">F</span>
          </div>
          <div className="text-[13px] font-semibold text-white/95 mt-1">Revenus générés</div>
          <div className="text-xs font-medium text-white/80 mt-1">Note moyenne : {metrics.avgRating} ★</div>
        </div>

        <button
          type="button"
          onClick={() => setView('qa')}
          className="bg-gradient-to-br from-[#ec4899] to-[#f43f5e] text-white p-6 rounded-2xl shadow-lg text-center transition hover:brightness-105 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Bell className="w-6 h-6" />
          </div>
          <div className="text-[26px] sm:text-[28px] font-bold tracking-tight tabular-nums leading-tight">
            {metrics.unansweredQuestions.length}
          </div>
          <div className="text-[13px] font-semibold text-white/95 mt-1">À traiter (Q&amp;R)</div>
          <div className="text-xs text-white/90 font-semibold mt-1">
            {metrics.unansweredQuestions.length > 0 ? 'Répondre aux élèves →' : 'Tout est à jour'}
          </div>
        </button>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-2xl p-5 shadow-md space-y-3">
        <div className="flex items-center gap-2 text-[15px] font-bold text-slate-800">
          <Zap className="w-4 h-4 text-[#f59d0e]" />
          <span>Actions rapides</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nouveau cours
          </button>
          <button
            type="button"
            disabled={courses.length === 0}
            onClick={() =>
              setExerciseModalState({
                open: true,
                courseId: courses[0]?._id || '',
                chapterId: '',
                editing: null,
              })
            }
            className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-sm disabled:opacity-50"
          >
            <Calculator className="w-4 h-4" />
            Nouvel exercice
          </button>
          <button
            type="button"
            onClick={() => {
              resetQuizForm();
              setQuizTab('builder');
              setView('quizzes');
            }}
            className="px-4 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-sm"
          >
            <Award className="w-4 h-4" />
            Créer un quiz
          </button>
          <button
            type="button"
            onClick={() => setView('communication')}
            className="px-4 py-2.5 rounded-xl bg-[#f59d0e] hover:bg-[#d97706] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-sm"
          >
            <Megaphone className="w-4 h-4" />
            Publier une annonce
          </button>
        </div>
      </div>

      {/* Notifications prioritaires */}
      {metrics.unansweredQuestions.length > 0 && (
        <div className="bg-amber-50/95 border border-amber-200 rounded-2xl p-5 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#f59d0e]" />
              <h3 className="font-bold text-slate-800 text-sm">
                Questions en attente de réponse ({metrics.unansweredQuestions.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setView('qa')}
              className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer"
            >
              Ouvrir l&apos;espace Q&amp;R →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {metrics.unansweredQuestions.slice(0, 4).map((q) => (
              <div key={q._id} className="bg-white border border-amber-100 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {q.sender?.name || 'Élève'} • <span className="text-[#2563eb]">{q.course?.title}</span>
                  </p>
                  <p className="text-xs text-slate-600 truncate mt-0.5">{q.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setQaFilter('unanswered');
                    setView('qa');
                  }}
                  className="px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                >
                  Répondre
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Abonnements récents & Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2563eb]" />
              <span>Abonnements récents</span>
            </h3>
            <button
              type="button"
              onClick={() => setView('students')}
              className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer"
            >
              Tout voir
            </button>
          </div>
          {students.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">Aucun abonnement enregistré.</p>
          ) : (
            <div className="space-y-2.5">
              {students.slice(0, 6).map((sub) => {
                const st = getSubscriptionState(sub);
                return (
                  <div
                    key={sub._id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#eef2fb]/50 hover:bg-[#eef2fb] border border-indigo-100/70 text-xs transition"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{sub.student?.name || 'Élève'}</p>
                      <p className="text-slate-500 truncate">{sub.course?.title}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          st === 'active'
                            ? 'bg-emerald-500 text-white'
                            : st === 'suspended'
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {st === 'active' ? 'Actif' : st === 'suspended' ? 'Bloqué' : 'Expiré'}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {Number(sub.amount || 0).toLocaleString('fr-FR')} FCFA • {formatDateShort(sub.expiresAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <Clock className="w-5 h-5 text-[#f59d0e]" />
            <span>Activité récente</span>
          </h3>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">Aucune activité récente.</p>
          ) : (
            <div className="space-y-2.5">
              {recentActivity.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.actionView)}
                  className="w-full text-left flex items-start justify-between gap-3 p-3 rounded-xl bg-[#eef2fb]/50 hover:bg-[#eef2fb] border border-indigo-100/70 transition cursor-pointer text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.title}</p>
                    <p className="text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">{formatDateShort(item.date)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ================= RENDU : 2 & 3. COURS + CHAPITRES & LEÇONS =================
  const renderCoursesSection = () => (
    <div className="space-y-5">
      {managedCourse ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-4 bg-[#eef2fb]/70">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setManagingCourseId(null)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 bg-white hover:bg-[#eef2fb] text-xs font-bold text-[#4c3882] cursor-pointer transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Tous les cours
              </button>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{managedCourse.title}</h2>
                <p className="text-xs text-slate-500">
                  {managedCourse.subject} • {formatLevel(managedCourse.level)} • Gestion des chapitres &amp; leçons
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/courses/${managedCourse._id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-sm"
              >
                <Eye className="w-4 h-4" />
                Prévisualiser comme élève
              </Link>
              <button
                type="button"
                onClick={() => handleEditCourse(managedCourse)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold transition cursor-pointer shadow-sm"
              >
                <Edit className="w-4 h-4" />
                Infos du cours
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Ajouter un chapitre */}
            <form onSubmit={handleAddChapter} className="bg-[#eef2fb]/60 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                type="text"
                required
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                placeholder="Titre du nouveau chapitre (ex: Chapitre 1 — Nombres complexes)..."
                className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2563eb]"
              />
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 px-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newChapterLocked}
                  onChange={(e) => setNewChapterLocked(e.target.checked)}
                />
                Verrouillé par défaut
              </label>
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Ajouter un chapitre
              </button>
            </form>

            {/* Liste des chapitres */}
            {!managedCourse.chapters || managedCourse.chapters.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-indigo-200 rounded-2xl text-slate-400 text-sm">
                Aucun chapitre créé. Commencez par ajouter le premier chapitre ci-dessus.
              </div>
            ) : (
              <div className="space-y-4">
                {managedCourse.chapters.map((chapter, cIdx) => {
                  const lessons = chapter.lessons || [];
                  const isEditingThisChapter = editingChapterId === chapter._id;

                  return (
                    <div key={chapter._id} className="border border-indigo-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <div className="px-4 py-3.5 bg-[#eef2fb]/70 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-7 h-7 rounded-lg bg-[#5c6be0] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                            {cIdx + 1}
                          </span>

                          {isEditingThisChapter ? (
                            <div className="flex items-center gap-2 flex-1 max-w-md">
                              <input
                                type="text"
                                value={editingChapterTitle}
                                onChange={(e) => setEditingChapterTitle(e.target.value)}
                                className="flex-1 h-8 px-2.5 rounded-lg border border-slate-300 text-xs bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveChapterRename(managedCourse._id, chapter._id)}
                                className="px-2.5 py-1 bg-[#2563eb] text-white rounded-lg text-xs font-bold cursor-pointer"
                              >
                                OK
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingChapterId(null)}
                                className="px-2 py-1 text-slate-500 text-xs cursor-pointer"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 truncate">{chapter.title}</h4>
                              <span
                                className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0 ${
                                  chapter.isLocked
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-emerald-500 text-white'
                                }`}
                              >
                                {chapter.isLocked ? 'Verrouillé' : 'Débloqué'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            disabled={cIdx === 0}
                            onClick={() => handleMoveChapter(managedCourse, cIdx, -1)}
                            title="Monter le chapitre"
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-40 cursor-pointer"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={cIdx === managedCourse.chapters.length - 1}
                            onClick={() => handleMoveChapter(managedCourse, cIdx, 1)}
                            title="Descendre le chapitre"
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-40 cursor-pointer"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleChapterLock(managedCourse._id, chapter)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition ${
                              chapter.isLocked
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                : 'bg-rose-500 hover:bg-rose-600 text-white'
                            }`}
                          >
                            {chapter.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            <span>{chapter.isLocked ? 'Débloquer' : 'Verrouiller'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingChapterId(chapter._id);
                              setEditingChapterTitle(chapter.title);
                            }}
                            title="Renommer"
                            className="p-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-900 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openLessonModal(managedCourse._id, chapter._id)}
                            className="px-3 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Leçon
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setExerciseModalState({
                                open: true,
                                courseId: managedCourse._id,
                                chapterId: chapter._id,
                                editing: null,
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-[#f59d0e] hover:bg-[#d97706] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Exercice
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteChapter(managedCourse._id, chapter)}
                            title="Supprimer ce chapitre"
                            className="p-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        {lessons.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">Aucune leçon dans ce chapitre.</p>
                        ) : (
                          lessons.map((lesson, lIdx) => {
                            const Icon =
                              lesson.contentType === 'video'
                                ? Video
                                : lesson.contentType === 'pdf'
                                ? FileText
                                : lesson.contentType === 'meet' || lesson.contentType === 'jitsi'
                                ? Calendar
                                : Play;
                            return (
                              <div
                                key={lesson._id}
                                className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[#eef2fb]/50 border border-indigo-100/80 text-xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="w-7 h-7 rounded-lg bg-white border border-indigo-100 text-[#2563eb] flex items-center justify-center shrink-0">
                                    <Icon className="w-3.5 h-3.5" />
                                  </span>
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-800 truncate">{lesson.title}</p>
                                    <p className="text-[11px] text-slate-400 uppercase">{lesson.contentType}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={lIdx === 0}
                                    onClick={() => handleMoveLesson(managedCourse._id, chapter, lIdx, -1)}
                                    className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={lIdx === lessons.length - 1}
                                    onClick={() => handleMoveLesson(managedCourse._id, chapter, lIdx, 1)}
                                    className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openLessonModal(managedCourse._id, chapter._id, lesson)}
                                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-lg font-bold cursor-pointer"
                                  >
                                    Modifier
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteLesson(managedCourse._id, chapter._id, lesson)}
                                    className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}

                        {(() => {
                          const chapterExercises = exercises.filter(
                            (ex) =>
                              (ex.course?._id || ex.course) === managedCourse._id &&
                              String(ex.chapterId) === String(chapter._id)
                          );
                          if (chapterExercises.length === 0) return null;
                          return (
                            <div className="pt-2 mt-2 border-t border-dashed border-indigo-200 space-y-2">
                              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#f59d0e]">
                                Exercices du chapitre ({chapterExercises.length})
                              </p>
                              {chapterExercises.map((ex) => (
                                <div
                                  key={ex._id}
                                  className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="w-7 h-7 rounded-lg bg-white border border-amber-200 text-[#f59d0e] flex items-center justify-center shrink-0">
                                      <Calculator className="w-3.5 h-3.5" />
                                    </span>
                                    <div className="min-w-0">
                                      <p className="font-bold text-slate-900 truncate">{ex.title}</p>
                                      <p className="text-[11px] text-slate-500">
                                        {ex.exerciseType} • {ex.difficulty} • {ex.submissionsCount || 0} rendu(s)
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExerciseModalState({
                                          open: true,
                                          courseId: managedCourse._id,
                                          chapterId: chapter._id,
                                          editing: ex,
                                        })
                                      }
                                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-lg font-bold cursor-pointer"
                                    >
                                      Modifier
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteExercise(ex)}
                                      className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {(() => {
              const moduleExercises = exercises.filter(
                (ex) => (ex.course?._id || ex.course) === managedCourse._id && !ex.chapterId
              );
              return (
                <div className="border-t border-slate-200 pt-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-800">
                      Exercices généraux du module ({moduleExercises.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        setExerciseModalState({
                          open: true,
                          courseId: managedCourse._id,
                          chapterId: '',
                          editing: null,
                        })
                      }
                      className="px-3.5 py-2 rounded-xl bg-[#f59d0e] hover:bg-[#d97706] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter un exercice au module
                    </button>
                  </div>
                  {moduleExercises.length > 0 && (
                    <div className="space-y-2">
                      {moduleExercises.map((ex) => (
                        <div
                          key={ex._id}
                          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{ex.title}</p>
                            <p className="text-[11px] text-slate-500">
                              {ex.exerciseType} • {ex.difficulty} • {ex.submissionsCount || 0} rendu(s)
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setExerciseModalState({
                                  open: true,
                                  courseId: managedCourse._id,
                                  chapterId: '',
                                  editing: ex,
                                })
                              }
                              className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-lg font-bold cursor-pointer"
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExercise(ex)}
                              className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-slate-500 shadow-md">
          <BookOpen className="w-10 h-10 text-[#5c6be0] mx-auto mb-3 opacity-70" />
          <p className="font-semibold text-slate-700">Vous n&apos;avez créé aucun cours.</p>
          <button
            onClick={openCreateModal}
            className="mt-4 text-[#2563eb] hover:underline text-sm font-bold cursor-pointer"
          >
            Créer un premier cours maintenant
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map((course) => {
            const published = course.isPublished !== false;
            return (
              <div
                key={course._id}
                className="bg-white rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-xl transition"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    <span
                      className={`absolute top-3 left-3 text-[11px] font-bold px-3 py-1 rounded-full shadow ${
                        published ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white'
                      }`}
                    >
                      {published ? 'Publié' : 'Brouillon'}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[11px] bg-sky-500 text-white px-2.5 py-0.5 rounded-full font-bold">
                        {course.subject}
                      </span>
                      <span className="text-[11px] bg-amber-400 text-slate-900 px-2.5 py-0.5 rounded-full font-bold">
                        {formatLevel(course.level)}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800 line-clamp-2 mb-1.5">{course.title}</h3>
                    <p className="text-slate-500 text-xs line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-slate-100">
                      <span className="text-slate-500">
                        {course.chapters?.length || 0} chapitre{(course.chapters?.length || 0) > 1 ? 's' : ''} •{' '}
                        {course.studentsCount ?? 0} abonné{(course.studentsCount ?? 0) > 1 ? 's' : ''}
                      </span>
                      <span className="font-bold text-[#2563eb] tabular-nums">
                        {course.isFree || course.price === 0
                          ? 'Gratuit'
                          : `${Number(course.price).toLocaleString('fr-FR')} FCFA`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-[#eef2fb]/60 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setManagingCourseId(course._id)}
                    className="px-3 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold cursor-pointer transition shadow-sm"
                  >
                    Chapitres &amp; Leçons
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleTogglePublishCourse(course)}
                      title={published ? 'Dépublier (passer en brouillon)' : 'Publier ce cours'}
                      className="p-2 bg-white border border-indigo-100 text-slate-700 hover:bg-[#eef2fb] rounded-lg transition cursor-pointer shadow-sm"
                    >
                      {published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditCourse(course)}
                      className="p-2 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-lg transition cursor-pointer shadow-sm"
                      title="Modifier les informations"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/courses/${course._id}`}
                      className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition shadow-sm"
                      title="Prévisualiser comme élève"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(course._id)}
                      className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition cursor-pointer shadow-sm"
                      title="Supprimer le cours"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ================= RENDU : EXERCICES & DEVOIRS =================
  const typeLabelMap = {
    application: 'Application',
    probleme: 'Problème',
    devoir: 'Devoir maison',
    annale: 'Sujet de bac / Annale',
  };

  const visibilityLabelMap = {
    immediate: 'Correction immédiate',
    after_attempt: 'Après tentative',
    after_deadline: 'Après date limite',
  };

  const filteredExercises = exercises.filter((ex) => {
    if (exerciseCourseFilter !== 'all' && (ex.course?._id || ex.course) !== exerciseCourseFilter) {
      return false;
    }
    if (exerciseTypeFilter !== 'all' && ex.exerciseType !== exerciseTypeFilter) return false;
    return true;
  });

  const filteredExerciseSubmissions = exerciseSubmissions.filter(
    (s) =>
      exerciseCourseFilter === 'all' ||
      String(s.course?._id || s.course) === String(exerciseCourseFilter)
  );

  const renderExercisesSection = () => (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setExerciseTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
              exerciseTab === 'catalog'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'bg-[#eef2fb] text-slate-700 hover:bg-indigo-100'
            }`}
          >
            Exercices créés ({exercises.length})
          </button>
          <button
            type="button"
            onClick={() => setExerciseTab('submissions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
              exerciseTab === 'submissions'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'bg-[#eef2fb] text-slate-700 hover:bg-indigo-100'
            }`}
          >
            Copies &amp; Rendus ({exerciseSubmissions.length})
            {pendingHomeworkCount > 0 ? ` • ${pendingHomeworkCount} à corriger` : ''}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={exerciseCourseFilter}
            onChange={(e) => setExerciseCourseFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 text-xs bg-[#eef2fb]/50 font-semibold"
          >
            <option value="all">Tous les modules</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>

          {exerciseTab === 'catalog' && (
            <select
              value={exerciseTypeFilter}
              onChange={(e) => setExerciseTypeFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 text-xs bg-[#eef2fb]/50 font-semibold"
            >
              <option value="all">Tous les types</option>
              <option value="application">Application</option>
              <option value="probleme">Problème</option>
              <option value="devoir">Devoir maison</option>
              <option value="annale">Sujet / Annale</option>
            </select>
          )}

          <button
            type="button"
            disabled={courses.length === 0}
            onClick={() =>
              setExerciseModalState({
                open: true,
                courseId: exerciseCourseFilter !== 'all' ? exerciseCourseFilter : courses[0]?._id || '',
                chapterId: '',
                editing: null,
              })
            }
            className="h-9 px-4 rounded-xl bg-[#f59d0e] hover:bg-[#d97706] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouvel exercice
          </button>
        </div>
      </div>

      {exerciseTab === 'catalog' ? (
        filteredExercises.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-sm text-slate-400 shadow-md">
            Aucun exercice enregistré pour le moment.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExercises.map((ex) => (
              <div
                key={ex._id}
                className="bg-white rounded-2xl p-5 space-y-3 shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold bg-[#5c6be0] text-white px-2.5 py-0.5 rounded-full">
                        {typeLabelMap[ex.exerciseType] || ex.exerciseType}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          ex.difficulty === 'difficile'
                            ? 'bg-rose-500 text-white'
                            : ex.difficulty === 'facile'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-400 text-slate-900'
                        }`}
                      >
                        {ex.difficulty}
                      </span>
                      <span className="text-[11px] font-semibold bg-[#eef2fb] text-[#4c3882] px-2.5 py-0.5 rounded-full">
                        {ex.isRequired !== false ? 'Obligatoire' : 'Facultatif'}
                      </span>
                      <span className="text-[11px] font-semibold bg-sky-100 text-sky-700 px-2.5 py-0.5 rounded-full">
                        {visibilityLabelMap[ex.correctionVisibility] || ex.correctionVisibility}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-800">{ex.title}</h4>
                    <p className="text-xs text-slate-500">
                      {ex.course?.title}
                      {ex.chapterTitle ? ` • Chapitre : ${ex.chapterTitle}` : ' • Module entier'}
                      {ex.deadline ? ` • Date limite : ${formatDateShort(ex.deadline)}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right mr-2">
                      <div className="text-xs font-bold text-[#2563eb] tabular-nums">
                        {ex.submissionsCount > 0 ? `${ex.successRate}% réussite` : 'Aucun rendu'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {ex.passedCount || 0}/{ex.submissionsCount || 0} validé(s)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setExerciseModalState({
                          open: true,
                          courseId: ex.course?._id || ex.course,
                          chapterId: ex.chapterId || '',
                          editing: ex,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold cursor-pointer transition shadow-sm"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExercise(ex)}
                      className="p-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white cursor-pointer transition shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {ex.statementText && (
                  <div className="bg-[#eef2fb]/60 border border-indigo-100 rounded-xl p-3 text-xs text-slate-700 line-clamp-3">
                    <MathText text={ex.statementText} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : filteredExerciseSubmissions.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-sm text-slate-400 shadow-md">
          Aucune copie ou tentative soumise par les élèves pour le moment.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExerciseSubmissions.map((sub) => {
            const draft = gradeDrafts[sub._id] || {
              grade: sub.grade ?? '',
              teacherComment: sub.teacherComment || '',
              isPassed: sub.isPassed ?? true,
            };

            return (
              <div
                key={sub._id}
                className="bg-white rounded-2xl p-5 space-y-4 shadow-md text-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={sub.student?.avatar}
                      alt={sub.student?.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{sub.student?.name || 'Élève'}</p>
                      <p className="text-slate-500">
                        {sub.course?.title} • <strong>{sub.exercise?.title}</strong> (
                        {typeLabelMap[sub.exercise?.exerciseType] || sub.exercise?.exerciseType})
                      </p>
                      <p className="text-[11px] text-slate-400">Déposé le {formatDateShort(sub.submittedAt)}</p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      sub.status === 'graded'
                        ? 'bg-emerald-500 text-white'
                        : sub.status === 'submitted'
                        ? 'bg-amber-400 text-slate-900'
                        : 'bg-[#eef2fb] text-[#4c3882]'
                    }`}
                  >
                    {sub.status === 'graded'
                      ? `Corrigé (${sub.grade !== null ? `${sub.grade}/20` : 'Validé'})`
                      : sub.status === 'submitted'
                      ? 'Copie déposée — À corriger'
                      : 'Tentative enregistrée'}
                  </span>
                </div>

                {sub.answerText && (
                  <div className="bg-[#eef2fb]/60 border border-indigo-100 rounded-xl p-3 text-slate-700 whitespace-pre-wrap">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Réponse rédigée</p>
                    {sub.answerText}
                  </div>
                )}

                {sub.fileUrl && (
                  <div className="flex items-center justify-between bg-[#eef2fb] border border-indigo-200 rounded-xl p-3">
                    <span className="font-semibold text-[#4c3882]">
                      Pièce jointe de l&apos;élève ({sub.fileType === 'pdf' ? 'PDF' : 'Photo'})
                    </span>
                    <a
                      href={sub.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ouvrir la copie
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2 border-t border-slate-100">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Note (/20)</label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step="0.5"
                      value={draft.grade}
                      onChange={(e) =>
                        setGradeDrafts((prev) => ({
                          ...prev,
                          [sub._id]: { ...draft, grade: e.target.value },
                        }))
                      }
                      className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-slate-50/60"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Commentaire / Correction prof
                    </label>
                    <input
                      type="text"
                      value={draft.teacherComment}
                      onChange={(e) =>
                        setGradeDrafts((prev) => ({
                          ...prev,
                          [sub._id]: { ...draft, teacherComment: e.target.value },
                        }))
                      }
                      placeholder="Remarques sur la rédaction, méthode..."
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50/60"
                    />
                  </div>
                  <label className="md:col-span-2 inline-flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer pt-4">
                    <input
                      type="checkbox"
                      checked={Boolean(draft.isPassed)}
                      onChange={(e) =>
                        setGradeDrafts((prev) => ({
                          ...prev,
                          [sub._id]: { ...draft, isPassed: e.target.checked },
                        }))
                      }
                    />
                    Réussi
                  </label>
                  <div className="md:col-span-3 pt-4 md:text-right">
                    <button
                      type="button"
                      onClick={() => handleSaveGrade(sub)}
                      className="w-full md:w-auto px-4 h-9 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold cursor-pointer shadow-sm"
                    >
                      Enregistrer la note
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ================= RENDU : 4. QUIZ & ÉVALUATIONS =================
  const selectedStatsQuiz =
    selectedStatsQuizId !== 'all' ? quizzes.find((q) => q._id === selectedStatsQuizId) : null;
  const filteredQuizResults = quizResults.filter(
    (r) => selectedStatsQuizId === 'all' || (r.quiz?._id || r.quiz) === selectedStatsQuizId
  );

  const renderQuizzesSection = () => {
    const selectedCourseForQuiz = courses.find((c) => c._id === quizCourseId);

    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-md">
          <div className="flex items-center gap-2">
            {[
              { id: 'list', label: `Quiz créés (${quizzes.length})` },
              { id: 'builder', label: editingQuizId ? 'Modifier le quiz' : 'Nouveau quiz' },
              { id: 'results', label: `Résultats & Statistiques (${quizResults.length})` },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  if (t.id === 'builder' && quizTab !== 'builder' && !editingQuizId) {
                    resetQuizForm();
                  }
                  setQuizTab(t.id);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                  quizTab === t.id
                    ? 'bg-[#2563eb] text-white shadow-sm'
                    : 'bg-[#eef2fb] text-slate-700 hover:bg-indigo-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {quizTab === 'list' && (
          <div className="bg-white rounded-2xl p-6 space-y-3 shadow-md">
            {quizzes.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                Aucun quiz créé pour le moment.{' '}
                <button
                  type="button"
                  onClick={() => {
                    resetQuizForm();
                    setQuizTab('builder');
                  }}
                  className="text-[#2563eb] font-bold hover:underline cursor-pointer"
                >
                  Créer votre premier quiz
                </button>
              </div>
            ) : (
              quizzes.map((q) => {
                const attempts = quizResults.filter((r) => (r.quiz?._id || r.quiz) === q._id);
                return (
                  <div
                    key={q._id}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#eef2fb]/60 border border-indigo-100"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm">{q.title}</h4>
                        <span className="text-[11px] bg-[#5c6be0] text-white px-2.5 py-0.5 rounded-full font-bold">
                          {q.chapterTitle ? `Chapitre : ${q.chapterTitle}` : 'Quiz final'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {q.course?.title} • {q.questions?.length || 0} question(s) • Seuil : {q.passingScore ?? 50}% •{' '}
                        {q.maxAttempts > 0 ? `${q.maxAttempts} essai(s) max` : 'Tentatives illimitées'} •{' '}
                        <strong>{attempts.length} passage(s)</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStatsQuizId(q._id);
                          setQuizTab('results');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer transition shadow-sm"
                      >
                        Résultats &amp; Stats
                      </button>
                      <button
                        type="button"
                        onClick={() => startEditQuiz(q)}
                        className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold cursor-pointer transition shadow-sm"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuiz(q)}
                        className="p-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white cursor-pointer transition shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {quizTab === 'builder' && (
          <form onSubmit={handleSaveQuiz} className="bg-white rounded-2xl p-6 space-y-5 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Cours associé</label>
                <select
                  required
                  value={quizCourseId}
                  onChange={(e) => {
                    setQuizCourseId(e.target.value);
                    setQuizChapterId('');
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Portée du quiz</label>
                <select
                  value={quizChapterId}
                  onChange={(e) => setQuizChapterId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm"
                >
                  <option value="">Quiz final du cours</option>
                  {(selectedCourseForQuiz?.chapters || []).map((ch) => (
                    <option key={ch._id} value={ch._id}>
                      Chapitre : {ch.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-600 mb-1">Titre du quiz</label>
                <input
                  type="text"
                  required
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="ex: Évaluation Suites & Limites"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Note de réussite (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={quizPassingScore}
                  onChange={(e) => setQuizPassingScore(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tentatives max (0 = illimité)</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={quizMaxAttempts}
                  onChange={(e) => setQuizMaxAttempts(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              {quizQuestions.map((question, qIdx) => (
                <div key={qIdx} className="bg-[#eef2fb]/60 border border-indigo-100 rounded-2xl p-4 space-y-3 relative">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-[#4c3882]">Question {qIdx + 1}</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={question.questionType || 'qcm'}
                        onChange={(e) => {
                          const t = e.target.value;
                          setQuizQuestions((prev) =>
                            prev.map((item, idx) =>
                              idx !== qIdx
                                ? item
                                : {
                                    ...item,
                                    questionType: t,
                                    options: t === 'true_false' ? ['Vrai', 'Faux'] : t === 'qcm' ? (item.options?.length >= 2 ? item.options : ['', '']) : [],
                                    correctAnswerIndex: 0,
                                  }
                            )
                          );
                        }}
                        className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                      >
                        <option value="qcm">QCM (choix multiples)</option>
                        <option value="true_false">Vrai / Faux</option>
                        <option value="text">Réponse libre (courte)</option>
                      </select>
                      {quizQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setQuizQuestions((prev) => prev.filter((_, i) => i !== qIdx))}
                          className="p-1.5 bg-rose-500 text-white rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <input
                    type="text"
                    required
                    value={question.questionText}
                    onChange={(e) =>
                      setQuizQuestions((prev) =>
                        prev.map((item, idx) => (idx === qIdx ? { ...item, questionText: e.target.value } : item))
                      )
                    }
                    placeholder="Saisissez l'énoncé de la question..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm"
                  />

                  {question.questionType === 'text' ? (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Réponse attendue (correction automatique, insensible à la casse)
                      </label>
                      <input
                        type="text"
                        required
                        value={question.correctAnswerText || ''}
                        onChange={(e) =>
                          setQuizQuestions((prev) =>
                            prev.map((item, idx) =>
                              idx === qIdx ? { ...item, correctAnswerText: e.target.value } : item
                            )
                          )
                        }
                        placeholder="ex: 9,81 m/s² ou Newton"
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                      />
                    </div>
                  ) : question.questionType === 'true_false' ? (
                    <div className="flex items-center gap-4 text-xs">
                      {['Vrai', 'Faux'].map((lbl, oIdx) => (
                        <label key={lbl} className="inline-flex items-center gap-2 font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name={`tf-${qIdx}`}
                            checked={Number(question.correctAnswerIndex) === oIdx}
                            onChange={() =>
                              setQuizQuestions((prev) =>
                                prev.map((item, idx) =>
                                  idx === qIdx ? { ...item, correctAnswerIndex: oIdx } : item
                                )
                              )
                            }
                          />
                          <span>{lbl}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(question.options || []).map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`qcm-${qIdx}`}
                            checked={Number(question.correctAnswerIndex) === oIdx}
                            onChange={() =>
                              setQuizQuestions((prev) =>
                                prev.map((item, idx) =>
                                  idx === qIdx ? { ...item, correctAnswerIndex: oIdx } : item
                                )
                              )
                            }
                          />
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) =>
                              setQuizQuestions((prev) =>
                                prev.map((item, idx) =>
                                  idx !== qIdx
                                    ? item
                                    : {
                                        ...item,
                                        options: item.options.map((o, j) => (j === oIdx ? e.target.value : o)),
                                      }
                                )
                              )
                            }
                            placeholder={`Option ${oIdx + 1}`}
                            className="flex-1 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                          />
                          {question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() =>
                                setQuizQuestions((prev) =>
                                  prev.map((item, idx) =>
                                    idx !== qIdx
                                      ? item
                                      : { ...item, options: item.options.filter((_, j) => j !== oIdx) }
                                  )
                                )
                              }
                              className="text-rose-500 text-xs px-1 cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setQuizQuestions((prev) =>
                            prev.map((item, idx) =>
                              idx === qIdx ? { ...item, options: [...item.options, ''] } : item
                            )
                          )
                        }
                        className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer"
                      >
                        + Ajouter une option
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  setQuizQuestions((prev) => [
                    ...prev,
                    {
                      questionText: '',
                      questionType: 'qcm',
                      options: ['', ''],
                      correctAnswerIndex: 0,
                      correctAnswerText: '',
                    },
                  ])
                }
                className="px-4 py-2 rounded-xl bg-[#eef2fb] hover:bg-indigo-100 text-xs font-bold text-[#4c3882] cursor-pointer"
              >
                + Ajouter une question
              </button>

              <div className="flex items-center gap-2">
                {editingQuizId && (
                  <button
                    type="button"
                    onClick={() => {
                      resetQuizForm();
                      setQuizTab('list');
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
                  >
                    Annuler
                  </button>
                )}
                <button
                  type="submit"
                  disabled={savingQuiz}
                  className="px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold cursor-pointer disabled:opacity-60 shadow-sm"
                >
                  {savingQuiz ? 'Enregistrement...' : editingQuizId ? 'Mettre à jour le quiz' : 'Enregistrer le quiz'}
                </button>
              </div>
            </div>
          </form>
        )}

        {quizTab === 'results' && (
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold text-slate-800 text-sm">Filtrer par quiz :</h3>
              <select
                value={selectedStatsQuizId}
                onChange={(e) => setSelectedStatsQuizId(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-[#eef2fb]/50 font-semibold"
              >
                <option value="all">Tous les quiz ({quizResults.length} passages)</option>
                {quizzes.map((q) => (
                  <option key={q._id} value={q._id}>
                    {q.title} ({q.course?.title})
                  </option>
                ))}
              </select>
            </div>

            {/* Statistiques par question si un quiz est sélectionné */}
            {selectedStatsQuiz && selectedStatsQuiz.questions?.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">
                  Statistiques par question — {selectedStatsQuiz.title}
                </h4>
                <div className="space-y-3">
                  {selectedStatsQuiz.questions.map((q, qIdx) => {
                    const answeredList = filteredQuizResults.filter(
                      (r) => r.answers && r.answers[qIdx] !== undefined && r.answers[qIdx] !== null
                    );
                    const correctCount = answeredList.filter((r) => {
                      const ans = r.answers[qIdx];
                      if (q.questionType === 'text') {
                        return (
                          String(ans).trim().toLowerCase() ===
                          String(q.correctAnswerText || '').trim().toLowerCase()
                        );
                      }
                      return Number(ans) === Number(q.correctAnswerIndex);
                    }).length;
                    const rate =
                      answeredList.length > 0 ? Math.round((correctCount / answeredList.length) * 100) : 0;

                    return (
                      <div key={qIdx} className="p-3.5 rounded-xl bg-[#eef2fb]/60 border border-indigo-100 space-y-1.5">
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="font-bold text-slate-800">
                            {qIdx + 1}. {q.questionText}
                          </span>
                          <span className="font-bold text-[#2563eb] tabular-nums shrink-0">
                            {answeredList.length > 0 ? `${rate}% de réussite (${correctCount}/${answeredList.length})` : 'Aucune donnée'}
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-indigo-100 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#5c6be0] to-[#2563eb] rounded-full" style={{ width: `${rate}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Liste des résultats par élève */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h4 className="font-bold text-slate-800 text-sm mb-4">Résultats par élève</h4>
              {filteredQuizResults.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">Aucun résultat pour cette sélection.</p>
              ) : (
                <div className="space-y-2.5">
                  {filteredQuizResults.map((res) => {
                    const pct = Math.round((res.score / Math.max(1, res.totalQuestions)) * 100);
                    const threshold = res.quiz?.passingScore ?? 50;
                    const passed = res.passed !== undefined ? res.passed : pct >= threshold;
                    return (
                      <div
                        key={res._id}
                        className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#eef2fb]/60 border border-indigo-100 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={res.student?.avatar}
                            alt={res.student?.name}
                            className="w-9 h-9 rounded-full object-cover border-2 border-indigo-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{res.student?.name || 'Élève'}</p>
                            <p className="text-slate-500 truncate">
                              {res.quiz?.title} • {formatDateShort(res.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              passed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                            }`}
                          >
                            {passed ? 'Réussi' : 'Échec'}
                          </span>
                          <span className="font-bold text-[#2563eb] tabular-nums bg-white px-3 py-1 rounded-lg border border-indigo-100">
                            {res.score} / {res.totalQuestions} ({pct}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ================= RENDU : 5. SUIVI DES ÉLÈVES =================
  const renderStudentsSection = () => (
    <div className="space-y-5">
      <div className="bg-white p-4 rounded-2xl shadow-md flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            placeholder="Rechercher un élève par nom, email..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-[#eef2fb]/50 text-sm focus:outline-none focus:bg-white focus:border-[#2563eb]"
          />
        </div>
        <select
          value={studentCourseFilter}
          onChange={(e) => setStudentCourseFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-[#eef2fb]/50 font-semibold"
        >
          <option value="all">Tous les cours</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>
        <select
          value={studentStatusFilter}
          onChange={(e) => setStudentStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-[#eef2fb]/50 font-semibold"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="expired">Expirés</option>
          <option value="suspended">Bloqués</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md">
        {filteredStudents.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Aucun élève ne correspond aux critères.</p>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((sub) => {
              const st = getSubscriptionState(sub);
              const courseObj = courses.find((c) => c._id === (sub.course?._id || sub.course)) || sub.course;
              const totalLessons =
                (courseObj?.chapters || []).reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0) || 0;
              const doneCount = Array.isArray(sub.completedLessons) ? sub.completedLessons.length : 0;
              const progressPct = totalLessons > 0 ? Math.min(100, Math.round((doneCount / totalLessons) * 100)) : 0;

              const studentResults = quizResults.filter(
                (qr) =>
                  String(qr.student?._id || qr.student) === String(sub.student?._id || sub.student) &&
                  String(qr.quiz?.course?._id || qr.quiz?.course) === String(sub.course?._id || sub.course)
              );
              const avgScore =
                studentResults.length > 0
                  ? Math.round(
                      studentResults.reduce(
                        (sum, r) => sum + (r.score / Math.max(1, r.totalQuestions)) * 100,
                        0
                      ) / studentResults.length
                    )
                  : null;

              return (
                <div
                  key={sub._id}
                  className="p-4 rounded-xl bg-[#eef2fb]/50 hover:bg-[#eef2fb] border border-indigo-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={sub.student?.avatar}
                      alt={sub.student?.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{sub.student?.name || 'Élève'}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            st === 'active'
                              ? 'bg-emerald-500 text-white'
                              : st === 'suspended'
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {st === 'active' ? 'Actif' : st === 'suspended' ? 'Bloqué' : 'Expiré'}
                        </span>
                      </div>
                      <p className="text-slate-500 truncate">{sub.student?.email}</p>
                      <p className="text-[#2563eb] font-semibold mt-0.5">
                        {sub.course?.title} • Expire le {formatDateShort(sub.expiresAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-5">
                    <div className="w-40">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                        <span>Progression</span>
                        <span>{progressPct}% ({doneCount}/{totalLessons})</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-indigo-100 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#5c6be0] to-[#2563eb] rounded-full" style={{ width: `${progressPct}%` }}></div>
                      </div>
                    </div>

                    <div className="text-center min-w-[75px]">
                      <div className="text-[11px] text-slate-400 font-semibold">Moy. Quiz</div>
                      <div className="font-bold text-slate-800 text-sm">
                        {avgScore !== null ? `${avgScore}%` : '—'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRemindModalSub(sub);
                          setRemindMessage(
                            `Bonjour ${sub.student?.name || ''}, n'oubliez pas de poursuivre vos chapitres et quiz sur "${sub.course?.title}".`
                          );
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold inline-flex items-center gap-1 cursor-pointer shadow-sm"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Relancer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStudentStatus(sub)}
                        className={`px-3 py-1.5 rounded-lg font-bold inline-flex items-center gap-1 cursor-pointer transition shadow-sm ${
                          sub.status === 'suspended'
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-rose-500 hover:bg-rose-600 text-white'
                        }`}
                      >
                        {sub.status === 'suspended' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        {sub.status === 'suspended' ? 'Débloquer' : 'Bloquer'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ================= RENDU : 6. QUESTIONS & RÉPONSES =================
  const renderQaSection = () => (
    <div className="space-y-5">
      <div className="bg-white p-4 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'unanswered', label: 'Sans réponse' },
            { id: 'unresolved', label: 'Non résolues' },
            { id: 'resolved', label: 'Résolues' },
            { id: 'all', label: 'Toutes' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setQaFilter(f.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                qaFilter === f.id ? 'bg-[#2563eb] text-white shadow-sm' : 'bg-[#eef2fb] text-slate-700 hover:bg-indigo-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={qaCourseFilter}
          onChange={(e) => setQaCourseFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-[#eef2fb]/50 font-semibold"
        >
          <option value="all">Tous les cours</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {filteredDiscussions.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-sm text-slate-400 shadow-md">
            Aucune question trouvée dans ce filtre.
          </div>
        ) : (
          filteredDiscussions.map((d) => (
            <div key={d._id} className="bg-white rounded-2xl p-5 space-y-4 shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <img
                    src={d.sender?.avatar}
                    alt={d.sender?.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{d.sender?.name || 'Élève'}</span>
                      <span className="text-[11px] font-bold bg-[#5c6be0] text-white px-2.5 py-0.5 rounded-full">
                        {d.course?.title}
                      </span>
                      {(d.exercise?.title || d.exerciseTitle) && (
                        <span className="text-[11px] font-bold bg-amber-400 text-slate-900 px-2.5 py-0.5 rounded-full">
                          Exercice : {d.exercise?.title || d.exerciseTitle}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          d.isResolved ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {d.isResolved ? 'Résolue' : 'En attente'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 mt-1.5 whitespace-pre-wrap">{d.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{formatDateShort(d.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleResolveDiscussion(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition shadow-sm ${
                      d.isResolved
                        ? 'bg-[#eef2fb] text-slate-700 hover:bg-indigo-100'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {d.isResolved ? 'Rouvrir' : 'Marquer résolue'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingQa({ msgId: d._id, text: d.message })}
                    title="Modifier"
                    className="p-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-900 cursor-pointer shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQa(d._id)}
                    title="Supprimer ce message"
                    className="p-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white cursor-pointer shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Réponses existantes */}
              {Array.isArray(d.replies) && d.replies.length > 0 && (
                <div className="pl-4 sm:pl-10 space-y-2 border-l-2 border-indigo-200">
                  {d.replies.map((rep) => (
                    <div
                      key={rep._id}
                      className="bg-[#eef2fb]/60 border border-indigo-100 rounded-xl p-3 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{rep.sender?.name || 'Professeur'}</span>
                          {(rep.sender?.role === 'teacher' || rep.sender?.role === 'admin') && (
                            <span className="text-[10px] font-bold bg-[#ef4444] text-white px-2 py-0.5 rounded-full">
                              Professeur
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 mt-1 whitespace-pre-wrap">{rep.message}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingQa({ msgId: d._id, replyId: rep._id, text: rep.message })}
                          className="p-1.5 rounded-lg bg-amber-400 text-slate-900 cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQa(d._id, rep._id)}
                          className="p-1.5 rounded-lg bg-rose-500 text-white cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Répondre */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyDrafts[d._id] || ''}
                  onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [d._id]: e.target.value }))}
                  placeholder="Écrire une réponse à l'élève..."
                  className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-sm focus:outline-none focus:bg-white focus:border-[#2563eb]"
                />
                <button
                  type="button"
                  onClick={() => handleReplyDiscussion(d)}
                  className="px-4 h-10 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Répondre
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ================= RENDU : 7. AVIS ÉLÈVES =================
  const renderReviewsSection = () => (
    <div className="space-y-5">
      {/* Moyenne par cours */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courses.map((c) => {
          const courseRevs = reviews.filter((r) => (r.course?._id || r.course) === c._id);
          const avg =
            courseRevs.length > 0
              ? (courseRevs.reduce((s, r) => s + r.rating, 0) / courseRevs.length).toFixed(1)
              : '—';
          return (
            <div key={c._id} className="bg-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{c.title}</p>
                <p className="text-xs text-slate-500">{courseRevs.length} avis reçu(s)</p>
              </div>
              <div className="flex items-center gap-1 bg-amber-400 text-slate-900 px-3 py-1.5 rounded-xl font-extrabold text-sm shrink-0">
                <Star className="w-4 h-4 fill-slate-900" />
                <span>{avg}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-sm text-slate-400 shadow-md">
            Aucun avis publié sur vos cours pour le moment.
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev._id} className="bg-white rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">{rev.student?.name || 'Élève'}</span>
                    <span className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`w-3.5 h-3.5 ${
                            n <= rev.rating ? 'text-[#f59d0e] fill-[#f59d0e]' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </span>
                    <span className="text-[11px] bg-[#5c6be0] text-white px-2.5 py-0.5 rounded-full font-bold">
                      {rev.course?.title}
                    </span>
                    {rev.isReported && (
                      <span className="text-[10px] font-bold bg-rose-500 text-white px-2.5 py-0.5 rounded-full">
                        Signalé ({rev.reportReason})
                      </span>
                    )}
                  </div>
                  {rev.comment && <p className="text-sm text-slate-700 mt-1.5">{rev.comment}</p>}
                  <p className="text-[11px] text-slate-400 mt-1">{formatDateShort(rev.createdAt)}</p>
                </div>

                {rev.isReported ? (
                  <button
                    type="button"
                    onClick={() => handleUnreportReview(rev._id)}
                    className="px-3 py-1.5 rounded-lg bg-[#eef2fb] text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Annuler signalement
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setReportModalReview(rev);
                      setReportReason('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition shadow-sm"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    Signaler
                  </button>
                )}
              </div>

              {rev.teacherReply && (
                <div className="bg-[#eef2fb] border border-indigo-100 rounded-xl p-3 text-xs text-slate-700">
                  <span className="font-bold text-[#2563eb]">Votre réponse : </span>
                  {rev.teacherReply}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={reviewReplyDrafts[rev._id] ?? rev.teacherReply ?? ''}
                  onChange={(e) => setReviewReplyDrafts((prev) => ({ ...prev, [rev._id]: e.target.value }))}
                  placeholder="Répondre à cet avis..."
                  className="flex-1 h-9 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs focus:outline-none focus:bg-white focus:border-[#2563eb]"
                />
                <button
                  type="button"
                  onClick={() => handleReplyReview(rev._id)}
                  className="px-4 h-9 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold cursor-pointer shadow-sm"
                >
                  {rev.teacherReply ? 'Mettre à jour' : 'Répondre'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ================= RENDU : 8. COMMUNICATION & SÉANCES EN DIRECT =================
  const liveLessons = courses.flatMap((course) =>
    (course.chapters || []).flatMap((ch) =>
      (ch.lessons || [])
        .filter((l) => l.contentType === 'jitsi' || l.contentType === 'meet')
        .map((l) => ({
          ...l,
          courseId: course._id,
          courseTitle: course.title,
          chapterTitle: ch.title,
        }))
    )
  );

  const allAnnouncements = courses
    .flatMap((course) =>
      (course.announcements || []).map((a) => ({
        ...a,
        courseId: course._id,
        courseTitle: course.title,
      }))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const renderCommunicationSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Annonces aux élèves d'un cours */}
      <div className="bg-white rounded-2xl p-6 space-y-5 shadow-md">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Megaphone className="w-5 h-5 text-[#2563eb]" />
          <span>Publier une annonce aux élèves</span>
        </h3>

        <form onSubmit={handlePostAnnouncement} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Cours ciblé</label>
            <select
              required
              value={annCourseId}
              onChange={(e) => setAnnCourseId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Titre de l&apos;annonce</label>
            <input
              type="text"
              required
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="ex: Séance de révision Bac ce samedi à 10h"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Message</label>
            <textarea
              required
              rows={3}
              value={annMessage}
              onChange={(e) => setAnnMessage(e.target.value)}
              placeholder="Rédigez votre annonce pour les élèves inscrits..."
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm resize-none"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={annSendEmail}
              onChange={(e) => setAnnSendEmail(e.target.checked)}
            />
            Envoyer également par e-mail aux élèves abonnés
          </label>
          <button
            type="submit"
            disabled={postingAnn || courses.length === 0}
            className="w-full h-10 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {postingAnn ? 'Envoi en cours...' : "Publier l'annonce"}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Annonces récentes</h4>
          {allAnnouncements.length === 0 ? (
            <p className="text-xs text-slate-400">Aucune annonce publiée pour le moment.</p>
          ) : (
            allAnnouncements.map((ann) => (
              <div key={ann._id} className="p-3 rounded-xl bg-[#eef2fb]/60 border border-indigo-100 flex items-start justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">{ann.title}</p>
                  <p className="text-[#2563eb] font-semibold text-[11px]">{ann.courseTitle}</p>
                  <p className="text-slate-600 mt-1 whitespace-pre-wrap">{ann.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAnnouncement(ann.courseId, ann._id)}
                  className="p-1.5 bg-rose-500 text-white rounded-lg cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Séances en direct (Meet / Jitsi) */}
      <div className="bg-white rounded-2xl p-6 space-y-4 shadow-md">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Video className="w-5 h-5 text-[#f59d0e]" />
          <span>Séances en direct &amp; Visioconférences ({liveLessons.length})</span>
        </h3>
        {liveLessons.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Aucune séance en direct (Jitsi ou Google Meet) programmée dans vos chapitres.
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setView('courses')}
                className="text-[#2563eb] font-bold hover:underline cursor-pointer"
              >
                Ajouter un cours en direct depuis &laquo; Cours &amp; Contenu &raquo; →
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {liveLessons.map((live) => (
              <div
                key={live._id}
                className="p-4 rounded-xl bg-[#eef2fb]/60 border border-indigo-100 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-900 px-2.5 py-0.5 rounded-full">
                    {live.contentType === 'jitsi' ? 'Salle intégrée Jitsi' : 'Google Meet'}
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-1.5 truncate">{live.title}</p>
                  <p className="text-slate-500 truncate">
                    {live.courseTitle} • {live.chapterTitle}
                  </p>
                </div>
                {live.contentType === 'meet' && live.meetLink ? (
                  <a
                    href={live.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold shrink-0 shadow-sm"
                  >
                    Ouvrir Meet
                  </a>
                ) : (
                  <Link
                    to={`/courses/${live.courseId}`}
                    className="px-3.5 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold shrink-0 shadow-sm"
                  >
                    Lancer le direct
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ================= RENDU : 9. PROFIL & PARAMÈTRES =================
  const renderProfileSection = () => (
    <form onSubmit={handleSaveTeacherProfile} className="bg-white rounded-2xl p-6 space-y-6 shadow-md max-w-4xl">
      {user?.role === 'admin' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-900">
          Vous consultez la vue Professeur avec votre session <strong>Administrateur ({user.email})</strong>. Les
          modifications ci-dessous concernent votre compte personnel. Pour modifier le compte d&apos;un autre
          enseignant, passez par{' '}
          <Link to="/admin-dashboard" className="font-bold underline text-[#2563eb]">
            Back-Office Admin → Utilisateurs
          </Link>
          .
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-800">{user?.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ef4444] text-white text-[10px] font-bold">
                Professeur
              </span>
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <label className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563eb] hover:underline cursor-pointer mt-1">
              <ImagePlus className="w-3.5 h-3.5" />
              <span>{profileAvatarFile ? profileAvatarFile.name : 'Changer la photo'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setProfileAvatarFile(e.target.files[0])}
              />
            </label>
          </div>
        </div>
        <Link
          to="/profile"
          className="px-4 py-2 rounded-xl bg-[#eef2fb] hover:bg-indigo-100 text-xs font-bold text-[#4c3882]"
        >
          Page Profil Complète →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Nom complet</label>
          <input
            type="text"
            required
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm focus:outline-none focus:bg-white focus:border-[#2563eb]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Adresse Email</label>
          <input
            type="email"
            required
            value={profileEmail}
            onChange={(e) => setProfileEmail(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm focus:outline-none focus:bg-white focus:border-[#2563eb]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Téléphone</label>
          <input
            type="tel"
            value={profilePhone}
            onChange={(e) => setProfilePhone(e.target.value)}
            placeholder="+221 77 ..."
            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm focus:outline-none focus:bg-white focus:border-[#2563eb]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Nouveau mot de passe (optionnel)</label>
          <input
            type="password"
            value={profilePassword}
            onChange={(e) => setProfilePassword(e.target.value)}
            placeholder="Laisser vide pour ne pas changer"
            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm focus:outline-none focus:bg-white focus:border-[#2563eb]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">Biographie &amp; Présentation</label>
        <textarea
          rows={3}
          value={profileBio}
          onChange={(e) => setProfileBio(e.target.value)}
          placeholder="Présentez votre parcours et vos méthodes pédagogiques aux élèves..."
          className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm resize-none focus:outline-none focus:bg-white focus:border-[#2563eb]"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-2">Matières enseignées</label>
        <div className="flex flex-wrap gap-2">
          {availableSubjects.map((subName) => {
            const active = profileSubjects.includes(subName);
            return (
              <button
                key={subName}
                type="button"
                onClick={() =>
                  setProfileSubjects((prev) =>
                    prev.includes(subName) ? prev.filter((x) => x !== subName) : [...prev, subName]
                  )
                }
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition ${
                  active
                    ? 'bg-[#2563eb] border-[#2563eb] text-white shadow-sm'
                    : 'bg-[#eef2fb] border-indigo-100 text-[#4c3882]'
                }`}
              >
                {subName}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#eef2fb]/60 border border-indigo-100 space-y-2.5">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Préférences de notification</h4>
        <label className="flex items-center justify-between text-sm text-slate-700 cursor-pointer">
          <span>Recevoir les notifications par e-mail (nouvelles questions, abonnements)</span>
          <input
            type="checkbox"
            checked={prefEmailNotifs}
            onChange={(e) => setPrefEmailNotifs(e.target.checked)}
          />
        </label>
        <label className="flex items-center justify-between text-sm text-slate-700 cursor-pointer">
          <span>Rappels avant les séances en direct</span>
          <input
            type="checkbox"
            checked={prefLiveReminders}
            onChange={(e) => setPrefLiveReminders(e.target.checked)}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={savingProfile}
        className="px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold cursor-pointer disabled:opacity-60 shadow-sm"
      >
        {savingProfile ? 'Enregistrement...' : 'Enregistrer les modifications'}
      </button>
    </form>
  );

  const activeSidebarItem = sidebarItems.find((i) => i.key === view);
  const ActiveBannerIcon = activeSidebarItem?.icon || LayoutDashboard;

  return (
    <div className="theme-myschools min-h-screen bg-gradient-to-br from-[#6372e8] via-[#6b5cc4] to-[#7c52a5] text-slate-800 antialiased">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-950/50 backdrop-blur-[1px] z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar verticale violet-indigo style My Schools */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-gradient-to-b from-[#4c3882] via-[#5b4397] to-[#3f2d70] text-white z-40 flex flex-col shadow-2xl transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo + Badge Rôle */}
        <div className="px-5 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between gap-2">
            <Link to="/" className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
                <img src={logo} alt="Aliou Sow Academy" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0 leading-tight">
                <span className="block text-[15px] font-bold tracking-tight text-white truncate">
                  Aliou Sow
                </span>
                <span className="block text-[10px] font-semibold tracking-[0.18em] text-indigo-200 uppercase">
                  Academy
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              aria-label="Fermer le menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ef4444] text-white text-xs font-semibold shadow-sm">
              <GraduationCap className="w-3.5 h-3.5" />
              Professeur
            </span>
          </div>
        </div>

        {/* Navigation groupée */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {sidebarGroups.map((group) => (
            <div key={group} className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/55 px-3 pt-1 pb-1">
                {group}
              </p>
              {sidebarItems
                .filter((i) => i.group === group)
                .map((item) => {
                  const Icon = item.icon;
                  const active = view === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setView(item.key);
                        if (item.key !== 'courses') setManagingCourseId(null);
                        if (window.innerWidth < 768) setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] transition cursor-pointer ${
                        active
                          ? 'bg-white/20 text-white font-semibold shadow-sm border-l-4 border-white'
                          : 'text-white/85 font-medium hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {typeof item.count === 'number' && (
                        <span
                          className={`text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full ${
                            item.alert
                              ? 'bg-[#ef4444] text-white shadow-sm'
                              : active
                              ? 'bg-white text-[#4c3882]'
                              : 'bg-white/15 text-white'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}

          {user?.role === 'admin' && (
            <div className="space-y-1 pt-2 border-t border-white/10">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/55 px-3 pt-1 pb-1">
                RACCOURCIS
              </p>
              <Link
                to="/admin-dashboard"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-white/85 hover:bg-white/10 hover:text-white transition"
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left truncate">Back-Office Admin</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Profil épinglé en bas de la sidebar */}
        <div className="border-t border-white/15 bg-black/15 p-3.5">
          <div className="flex items-center gap-2.5">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border-2 border-white/30 shrink-0"
              />
            ) : (
              <span className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'P'}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-white/70 truncate">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Se déconnecter"
              className="p-2 rounded-lg bg-white/10 hover:bg-rose-500 text-white transition cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className={`min-h-screen transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
          {/* Barre supérieure flottante blanche */}
          <header className="bg-white/95 backdrop-blur rounded-2xl shadow-lg px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 border border-white/70">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen((v) => !v)}
                aria-label={sidebarOpen ? 'Replier le menu' : 'Ouvrir le menu'}
                className="w-9 h-9 rounded-xl bg-[#eef2fb] hover:bg-indigo-100 text-[#4c3882] flex items-center justify-center cursor-pointer transition shrink-0"
              >
                {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] sm:text-base font-bold tracking-tight text-slate-800 truncate">
                    Aliou Sow Academy
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#eef2fb] text-[#4c3882]">
                    Espace Enseignant
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  Gérez vos cours, exercices, quiz, élèves, Q&amp;R et communication
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200 hover:border-[#2563eb] text-[13px] font-semibold text-slate-700 hover:text-[#2563eb] transition"
              >
                <Globe className="w-3.5 h-3.5" />
                Voir le site
              </Link>

              <button
                onClick={openCreateModal}
                className="h-9 px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nouveau Cours</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-[#eef2fb]/70 hover:bg-[#eef2fb] cursor-pointer transition"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-indigo-200"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-[#5c6be0] text-white flex items-center justify-center text-xs font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'P'}
                    </span>
                  )}
                  <span className="hidden md:block text-[13px] font-semibold text-slate-800 max-w-[130px] truncate">
                    {user?.name}
                  </span>
                  <span className="hidden lg:inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ef4444] text-white">
                    Professeur
                  </span>
                  <ChevronDown className="hidden md:block w-3.5 h-3.5 text-slate-400" />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                    <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50">
                      <div className="px-4 pb-3 border-b border-slate-100">
                        <p className="text-[11px] font-bold text-[#ef4444] uppercase">Professeur</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin-dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#5c6be0] hover:bg-[#eef2fb]/60"
                        >
                          <Shield className="w-4 h-4" />
                          Back-Office Admin
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-800 hover:bg-[#eef2fb]/60"
                      >
                        <Settings className="w-4 h-4 text-[#5c6be0]" />
                        Paramètres du profil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Se déconnecter
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Bannière titre de section */}
          <div className="bg-white rounded-2xl shadow-md px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#5c6be0] to-[#4657d4] text-white flex items-center justify-center shadow-sm shrink-0">
                <ActiveBannerIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-[22px] font-bold tracking-tight text-slate-800">
                  {activeSidebarItem?.label || 'Espace Enseignant'}
                </h1>
                <p className="text-[13px] text-slate-500 mt-0.5">
                  Aliou Sow Academy — Gérez vos cours, exercices, quiz, élèves, Q&amp;R et communication.
                </p>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition text-[13px] shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Cours</span>
            </button>
          </div>

          {view === 'overview' && renderOverview()}
          {view === 'courses' && renderCoursesSection()}
          {view === 'exercises' && renderExercisesSection()}
          {view === 'quizzes' && renderQuizzesSection()}
          {view === 'students' && renderStudentsSection()}
          {view === 'qa' && renderQaSection()}
          {view === 'reviews' && renderReviewsSection()}
          {view === 'communication' && renderCommunicationSection()}
          {view === 'profile' && renderProfileSection()}
        </div>
      </main>

      {/* Modal Création / Édition de cours */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 border border-slate-100 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowCourseModal(false);
                resetCourseForm();
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-6">
              <div className="bg-[#eef2fb] p-2.5 rounded-xl text-[#5c6be0]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                {editingCourse ? 'Modifier le cours' : 'Créer un nouveau cours'}
              </h3>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitCourse} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#5c6be0]" />
                  Titre du cours
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-animated pl-4 pr-3"
                  placeholder="ex: Mécanique de Newton et Forces"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <AlignLeft className="w-3.5 h-3.5 text-[#5c6be0]" />
                  Description
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-animated h-20 resize-none pl-4 pr-3"
                  placeholder="Détaillez le programme de ce cours..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Layers className="w-3.5 h-3.5 text-[#5c6be0]" />
                    Matière
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="input-animated select-animated bg-white border-slate-200 text-slate-800 rounded-xl pl-4"
                  >
                    {(availableSubjects.includes(subject)
                      ? availableSubjects
                      : [subject, ...availableSubjects].filter(Boolean)
                    ).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <GraduationCap className="w-3.5 h-3.5 text-[#5c6be0]" />
                    Niveau
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="input-animated select-animated bg-white border-slate-200 text-slate-800 rounded-xl pl-4"
                  >
                    {(availableLevels.some((l) => l.value === level) || !level
                      ? availableLevels
                      : [{ value: level, label: level }, ...availableLevels]
                    ).map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#5c6be0]" />
                  Durée d&apos;accès
                </label>
                <input
                  type="text"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="input-animated pl-4 pr-3"
                  placeholder="ex: 3 mois, 1 an"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-[#eef2fb]/40">
                <div>
                  <p className="text-sm font-bold text-slate-800">Visibilité du cours</p>
                  <p className="text-xs text-slate-500">
                    {isPublished ? 'Publié : visible dans le catalogue élèves.' : 'Brouillon : visible uniquement par vous.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublished((v) => !v)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                    isPublished ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-800'
                  }`}
                >
                  {isPublished ? 'Publié' : 'Brouillon'}
                </button>
              </div>

              <div
                onClick={() => setIsFree((prev) => !prev)}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                  isFree ? 'bg-[#eef2fb] border-indigo-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-slate-800">Cours gratuit (offre promotionnelle)</p>
                  <p className="text-xs text-slate-500">Accès en un clic sans paiement.</p>
                </div>
                <div
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    isFree ? 'bg-[#2563eb]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      isFree ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {isFree ? (
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">
                      Valeur normale (FCFA)
                    </label>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(parseInt(e.target.value, 10) || 0)}
                      className="input-animated pl-4 pr-3"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">
                      Tarif (FCFA)
                    </label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
                      className="input-animated pl-4 pr-3"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <ImagePlus className="w-3.5 h-3.5 text-[#5c6be0]" />
                    Couverture
                  </label>
                  <div className="file-input-wrapper">
                    <div className="file-input-label">
                      <ImagePlus className="w-4 h-4 shrink-0" />
                      <span className="truncate">{imageFile ? imageFile.name : 'Choisir...'}</span>
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {creating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>{editingCourse ? 'Mettre à jour le cours' : 'Créer le cours'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajouter / Modifier une Leçon */}
      {lessonModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 border border-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setLessonModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {lessonModal.lesson ? 'Modifier la leçon' : 'Ajouter une leçon'}
            </h3>
            <form onSubmit={handleSaveLesson} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Titre de la leçon</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-[#5c6be0] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Type de ressource</label>
                <select
                  value={lessonType}
                  onChange={(e) => setLessonType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white focus:border-[#5c6be0] focus:outline-none"
                >
                  <option value="video">Vidéo YouTube</option>
                  <option value="pdf">Document PDF téléchargeable</option>
                  <option value="text">Exercice / Cours rédigé</option>
                  <option value="jitsi">Classe en direct intégrée (Jitsi)</option>
                  <option value="meet">Visioconférence Google Meet</option>
                </select>
              </div>
              {lessonType === 'video' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Lien YouTube</label>
                  <input
                    type="url"
                    required
                    value={lessonYoutube}
                    onChange={(e) => setLessonYoutube(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-[#5c6be0] focus:outline-none"
                  />
                </div>
              )}
              {lessonType === 'meet' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Lien Google Meet</label>
                  <input
                    type="url"
                    required
                    value={lessonMeet}
                    onChange={(e) => setLessonMeet(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-[#5c6be0] focus:outline-none"
                  />
                </div>
              )}
              {lessonType === 'text' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Contenu / Exercice</label>
                  <textarea
                    rows={5}
                    required
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 resize-none focus:border-[#5c6be0] focus:outline-none"
                  />
                </div>
              )}
              {lessonType === 'pdf' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Fichier PDF {lessonModal.lesson ? '(optionnel si inchangé)' : ''}
                  </label>
                  <input
                    type="file"
                    required={!lessonModal.lesson}
                    accept="application/pdf"
                    onChange={(e) => setLessonPdf(e.target.files[0])}
                    className="w-full text-xs"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLessonModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingLesson}
                  className="px-5 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold cursor-pointer disabled:opacity-60 shadow-sm"
                >
                  {savingLesson ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Relance Élève */}
      {remindModalSub && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSendRemind}
            className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-100 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-slate-800">
              Relancer {remindModalSub.student?.name}
            </h3>
            <p className="text-xs text-slate-500">Cours : {remindModalSub.course?.title}</p>
            <textarea
              rows={4}
              required
              value={remindMessage}
              onChange={(e) => setRemindMessage(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm resize-none focus:border-[#5c6be0] focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRemindModalSub(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={sendingRemind}
                className="px-5 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold cursor-pointer shadow-sm"
              >
                {sendingRemind ? 'Envoi...' : 'Envoyer la relance'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Édition Q&R */}
      {editingQa && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEditQa}
            className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-100 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-slate-800">Modifier le message</h3>
            <textarea
              rows={4}
              required
              value={editingQa.text}
              onChange={(e) => setEditingQa((prev) => ({ ...prev, text: e.target.value }))}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm resize-none focus:border-[#5c6be0] focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingQa(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold cursor-pointer shadow-sm"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Signalement d'avis abusif */}
      {reportModalReview && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitReportReview}
            className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-100 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-slate-800">Signaler un avis abusif</h3>
            <p className="text-xs text-slate-500">
              Avis de <strong>{reportModalReview.student?.name}</strong>
            </p>
            <input
              type="text"
              required
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Motif du signalement (propos déplacés, spam...)"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:border-[#5c6be0] focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReportModalReview(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer shadow-sm"
              >
                Signaler
              </button>
            </div>
          </form>
        </div>
      )}

      <ExerciseModal
        open={exerciseModalState.open}
        onClose={() => setExerciseModalState({ open: false, courseId: '', chapterId: '', editing: null })}
        courses={courses}
        defaultCourseId={exerciseModalState.courseId}
        defaultChapterId={exerciseModalState.chapterId}
        editingExercise={exerciseModalState.editing}
        onSaved={handleExerciseSaved}
      />

      {toast.text && (
        <div
          className={`fixed bottom-5 right-5 z-[75] max-w-sm flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-sm font-semibold shadow-xl ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <Check className="w-4 h-4 shrink-0" />
          )}
          <span className="flex-1">{toast.text}</span>
          <button
            onClick={() => setToast({ type: '', text: '' })}
            className="cursor-pointer opacity-70 hover:opacity-100"
          >
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
    </div>
  );
};

export default TeacherDashboard;
