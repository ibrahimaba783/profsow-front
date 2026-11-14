import React, { useEffect, useState, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FolderPlus,
  Sparkles,
  LayoutDashboard,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  TrendingUp,
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
  History,
  Smartphone,
  DollarSign,
  Trophy,
} from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';
import TeacherOverviewTab from '../components/teacher/TeacherOverviewTab';
import TeacherStudentsTab from '../components/teacher/TeacherStudentsTab';
import TeacherHistoryModal from '../components/teacher/TeacherHistoryModal';

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
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

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
  const [newChapterIsFree, setNewChapterIsFree] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [editingChapterTitle, setEditingChapterTitle] = useState('');
  const [collapsedChapters, setCollapsedChapters] = useState({});
  const toggleChapterCollapse = (chapterId) => {
    setCollapsedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };
  const [lessonModal, setLessonModal] = useState(null); // { courseId, chapterId, lesson? }
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonIsFree, setLessonIsFree] = useState(false);
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

  const pendingHomeworkCount = exerciseSubmissions.filter((s) => s.status === 'submitted').length;

  const pendingTeacherAlerts = useMemo(() => {
    const unanswered = metrics.unansweredQuestions?.length || 0;
    const pendingHomework = pendingHomeworkCount || 0;
    return unanswered + pendingHomework;
  }, [metrics.unansweredQuestions, pendingHomeworkCount]);

  const teacherActivities = useMemo(() => {
    const acts = [];
    students.forEach((s) => {
      acts.push({
        id: `sub-${s._id}`,
        type: 'sub',
        title: `Inscription : ${s.student?.name || 'Élève'}`,
        subtitle: `Module : ${s.course?.title || 'Cours'} (${Number(s.amount || 0).toLocaleString('fr-FR')} FCFA via ${s.paymentMethod || 'Wave'})`,
        date: s.createdAt,
      });
    });
    exerciseSubmissions.forEach((sub) => {
      acts.push({
        id: `hw-${sub._id}`,
        type: 'homework',
        title: `Devoir soumis : ${sub.student?.name || 'Élève'}`,
        subtitle: `Exercice : ${sub.exercise?.title || 'Devoir'} — ${sub.status === 'graded' ? `Noté ${sub.grade}/20` : 'En attente de correction'}`,
        date: sub.submittedAt || sub.createdAt,
      });
    });
    quizResults.forEach((q) => {
      acts.push({
        id: `qz-${q._id}`,
        type: 'quiz',
        title: `Quiz évalué : ${q.student?.name || 'Élève'}`,
        subtitle: `Score : ${q.score}% (${q.isPassed ? 'Réussi' : 'Échoué'})`,
        date: q.completedAt || q.createdAt,
      });
    });
    discussions.forEach((d) => {
      acts.push({
        id: `qa-${d._id}`,
        type: 'qa',
        title: `Question de ${d.sender?.name || 'Élève'}`,
        subtitle: `"${d.message?.slice(0, 60)}..."`,
        date: d.createdAt,
      });
    });
    return acts.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [students, exerciseSubmissions, quizResults, discussions]);

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
        showToast('success', 'Matière mise à jour.');
      } else {
        await api('/courses', { method: 'POST', body: formData });
        showToast('success', 'Nouvelle matière créée.');
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
        body: JSON.stringify({ title: newChapterTitle.trim(), isLocked: newChapterLocked, isFree: newChapterIsFree }),
      });
      replaceCourseInState(updated);
      setNewChapterTitle('');
      setNewChapterLocked(false);
      setNewChapterIsFree(false);
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

  const handleToggleChapterFree = async (courseId, chapter) => {
    try {
      const nextFree = !chapter.isFree;
      const updated = await api(`/courses/${courseId}/chapters/${chapter._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isFree: nextFree }),
      });
      replaceCourseInState(updated);
      showToast(
        'success',
        nextFree
          ? `Chapitre "${chapter.title}" désormais gratuit (Freemium).`
          : `Chapitre "${chapter.title}" désormais payant (réservé aux abonnés).`
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
    setLessonIsFree(Boolean(lesson?.isFree));
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
    formData.append('isFree', String(lessonIsFree));

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

  const handleExtendStudentSubscription = async (sub, months = 1) => {
    try {
      const updated = await api(`/subscriptions/${sub._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ extendMonths: months }),
      });
      setStudents((prev) => prev.map((s) => (s._id === sub._id ? updated : s)));
      showToast('success', `Abonnement de ${sub.student?.name || "l'élève"} prolongé de ${months} mois.`);
    } catch (err) {
      showToast('error', err.message || "Erreur lors de la prolongation de l'abonnement");
    }
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
      <div className="theme-myschools min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6372e8] via-[#6b5cc4] to-[#7c52a5] px-4">
        <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#6372e8] shadow-sm">
              <GraduationCap className="w-8 h-8 text-[#6372e8]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
              <div className="w-3.5 h-3.5 border-2 border-indigo-200 border-t-[#6372e8] rounded-full animate-spin" />
            </div>
          </div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            Aliou Sow Academy
          </h2>
          <p className="text-[11px] font-bold text-[#6372e8] uppercase tracking-wider mt-0.5 mb-2">
            Espace Enseignant
          </p>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            Chargement de vos cours, devoirs, élèves et quiz...
          </p>
          <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-gradient-to-r from-[#6372e8] to-[#7c52a5] rounded-full animate-pulse w-full"></div>
          </div>
        </div>
      </div>
    );
  }


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
    { key: 'courses', label: 'Matières & Contenu', icon: BookOpen, count: courses.length, group: 'PÉDAGOGIE' },
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
    <TeacherOverviewTab
      user={user}
      courses={courses}
      students={students}
      exercises={exercises}
      exerciseSubmissions={exerciseSubmissions}
      quizzes={quizzes}
      quizResults={quizResults}
      discussions={discussions}
      reviews={reviews}
      metrics={metrics}
      onNavigateTab={(tab) => {
        setView(tab);
        if (window.innerWidth < 768) setSidebarOpen(false);
      }}
      onOpenCreateCourse={openCreateModal}
      onOpenNewExercise={() => {
        setView('exercises');
        setExerciseTab('catalog');
        setExerciseModalState({
          open: true,
          courseId: courses[0]?._id || '',
          chapterId: courses[0]?.chapters?.[0]?._id || '',
          editing: null,
        });
      }}
      onOpenNewQuiz={() => {
        setView('quizzes');
        setQuizTab('builder');
        setEditingQuizId(null);
      }}
      onOpenLiveMeet={() => {
        setView('courses');
        showToast('info', 'Sélectionnez une leçon pour configurer un lien Google Meet / Jitsi.');
      }}
      onOpenBroadcast={() => {
        setView('communication');
      }}
      formatDateShort={formatDateShort}
    />
  );

  // ================= RENDU : 2 & 3. COURS + CHAPITRES & LEÇONS =================
  const renderCoursesSection = () => {
    const totalChapters = managedCourse?.chapters?.length || 0;
    const totalLessons = (managedCourse?.chapters || []).reduce((acc, c) => acc + (c.lessons?.length || 0), 0);
    const courseExercises = managedCourse
      ? exercises.filter((ex) => (ex.course?._id || ex.course) === managedCourse._id)
      : [];
    const totalExercises = courseExercises.length;

    return (
      <div className="space-y-6">
        {managedCourse ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
            {/* Bannière supérieure de la matière en cours de gestion */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-slate-50/90 via-indigo-50/20 to-white">
              <div className="flex items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => setManagingCourseId(null)}
                  className="group inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer shadow-2xs transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Tous les cours</span>
                </button>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{managedCourse.title}</h2>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                      {managedCourse.subject}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/70">
                      {formatLevel(managedCourse.level)}
                    </span>
                    {managedCourse.isFree || managedCourse.price === 0 ? (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/70">
                        Gratuit
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {Number(managedCourse.price).toLocaleString('fr-FR')} FCFA
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                    <span>Gestion pédagogique du programme</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{totalChapters} chapitre{totalChapters > 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{totalLessons} leçon{totalLessons > 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{totalExercises} exercice{totalExercises > 1 ? 's' : ''}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <Link
                  to={`/courses/${managedCourse._id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold transition shadow-sm shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Eye className="w-4 h-4" />
                  <span>Prévisualiser comme élève</span>
                </Link>
                <button
                  type="button"
                  onClick={() => handleEditCourse(managedCourse)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Edit className="w-4 h-4 text-amber-600" />
                  <span>Infos du cours</span>
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-7 space-y-7">
              {/* Barre d'ajout d'un nouveau chapitre */}
              <div className="bg-gradient-to-r from-slate-50 via-indigo-50/20 to-white border border-indigo-100/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    <FolderPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Ajouter un nouveau chapitre</h3>
                    <p className="text-[11px] text-slate-500">Créez une section structurée pour regrouper vos leçons et exercices.</p>
                  </div>
                </div>

                <form onSubmit={handleAddChapter} className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      required
                      value={newChapterTitle}
                      onChange={(e) => setNewChapterTitle(e.target.value)}
                      placeholder="Titre du chapitre (ex : Chapitre 1 — Nombres complexes et trigonométrie)..."
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs transition"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNewChapterLocked((v) => !v)}
                      className={`inline-flex items-center gap-1.5 h-11 px-3.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        newChapterLocked
                          ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {newChapterLocked ? <Lock className="w-3.5 h-3.5 text-rose-600" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
                      <span>Verrouillé par défaut</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewChapterIsFree((v) => !v)}
                      className={`inline-flex items-center gap-1.5 h-11 px-3.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        newChapterIsFree
                          ? 'bg-teal-50 text-teal-700 border-teal-200 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${newChapterIsFree ? 'text-teal-600' : 'text-slate-400'}`} />
                      <span>Gratuit (Freemium)</span>
                    </button>

                    <button
                      type="submit"
                      className="h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-sm shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter le chapitre</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Liste des chapitres */}
              {!managedCourse.chapters || managedCourse.chapters.length === 0 ? (
                <div className="py-14 px-4 text-center border-2 border-dashed border-indigo-100 rounded-3xl bg-slate-50/40">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">Aucun chapitre pour le moment</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Commencez par saisir le titre de votre premier chapitre dans le formulaire ci-dessus pour lancer le programme.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {managedCourse.chapters.map((chapter, cIdx) => {
                    const lessons = chapter.lessons || [];
                    const isEditingThisChapter = editingChapterId === chapter._id;
                    const isCollapsed = Boolean(collapsedChapters[chapter._id]);
                    const chapterExercises = exercises.filter(
                      (ex) =>
                        (ex.course?._id || ex.course) === managedCourse._id &&
                        String(ex.chapterId) === String(chapter._id)
                    );

                    return (
                      <motion.div
                        key={chapter._id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: cIdx * 0.04 }}
                        className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs hover:shadow-sm transition-shadow"
                      >
                        {/* En-tête du chapitre */}
                        <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-slate-50/90 via-indigo-50/30 to-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white text-xs font-black flex items-center justify-center shadow-2xs shrink-0">
                              {cIdx + 1}
                            </div>

                            {isEditingThisChapter ? (
                              <div className="flex items-center gap-2 flex-1 max-w-lg">
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingChapterTitle}
                                  onChange={(e) => setEditingChapterTitle(e.target.value)}
                                  className="flex-1 h-9 px-3 rounded-xl border border-indigo-400 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                  placeholder="Titre du chapitre..."
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveChapterRename(managedCourse._id, chapter._id)}
                                  className="px-3 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-2xs transition"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Valider</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingChapterId(null)}
                                  className="px-2.5 h-9 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                                >
                                  Annuler
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                                <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                                  {chapter.title}
                                </h4>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span
                                    className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0 border ${
                                      chapter.isLocked
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}
                                  >
                                    {chapter.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                    <span>{chapter.isLocked ? 'Verrouillé' : 'Débloqué'}</span>
                                  </span>
                                  <span
                                    className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0 border ${
                                      cIdx === 0 || chapter.isFree
                                        ? 'bg-teal-50 text-teal-700 border-teal-200'
                                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                    }`}
                                  >
                                    {cIdx === 0 || chapter.isFree ? (
                                      <Sparkles className="w-3 h-3 text-teal-600" />
                                    ) : (
                                      <Shield className="w-3 h-3 text-indigo-600" />
                                    )}
                                    <span>{cIdx === 0 || chapter.isFree ? 'Gratuit' : 'Payant'}</span>
                                  </span>
                                  <span className="text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                                    {lessons.length} leçon{lessons.length > 1 ? 's' : ''} • {chapterExercises.length} exo{chapterExercises.length > 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Barre d'outils du chapitre */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Réorganisation haut/bas */}
                            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
                              <button
                                type="button"
                                disabled={cIdx === 0}
                                onClick={() => handleMoveChapter(managedCourse, cIdx, -1)}
                                title="Monter le chapitre"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={cIdx === managedCourse.chapters.length - 1}
                                onClick={() => handleMoveChapter(managedCourse, cIdx, 1)}
                                title="Descendre le chapitre"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Toggle Verrouillage */}
                            <button
                              type="button"
                              onClick={() => handleToggleChapterLock(managedCourse._id, chapter)}
                              title={chapter.isLocked ? "Débloquer pour les élèves" : "Verrouiller pour les élèves"}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer border transition shadow-2xs ${
                                chapter.isLocked
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                  : 'bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border-slate-200 hover:border-rose-200'
                              }`}
                            >
                              {chapter.isLocked ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
                              <span>{chapter.isLocked ? 'Débloquer' : 'Verrouiller'}</span>
                            </button>

                            {/* Toggle Gratuit / Payant */}
                            <button
                              type="button"
                              onClick={() => handleToggleChapterFree(managedCourse._id, chapter)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer border transition shadow-2xs ${
                                cIdx === 0 || chapter.isFree
                                  ? 'bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border-slate-200 hover:border-indigo-200'
                                  : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200'
                              }`}
                              title="Basculer entre gratuit et payant"
                            >
                              <Sparkles className={`w-3.5 h-3.5 ${cIdx === 0 || chapter.isFree ? 'text-slate-500' : 'text-teal-600'}`} />
                              <span>{cIdx === 0 || chapter.isFree ? 'Rendre payant' : 'Rendre gratuit'}</span>
                            </button>

                            {/* Boutons d'ajout : Leçon et Exercice */}
                            <button
                              type="button"
                              onClick={() => openLessonModal(managedCourse._id, chapter._id)}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs transition hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Leçon</span>
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
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs transition hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Exercice</span>
                            </button>

                            {/* Renommer */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingChapterId(chapter._id);
                                setEditingChapterTitle(chapter.title);
                              }}
                              title="Renommer le chapitre"
                              className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer shadow-2xs transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Supprimer */}
                            <button
                              type="button"
                              onClick={() => handleDeleteChapter(managedCourse._id, chapter)}
                              title="Supprimer ce chapitre"
                              className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 cursor-pointer shadow-2xs transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Replier / Déplier accordéon */}
                            <button
                              type="button"
                              onClick={() => toggleChapterCollapse(chapter._id)}
                              title={isCollapsed ? 'Déplier ce chapitre' : 'Replier ce chapitre'}
                              className="p-2 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 cursor-pointer shadow-2xs transition"
                            >
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`} />
                            </button>
                          </div>
                        </div>

                        {/* Contenu du chapitre (Leçons & Exercices) */}
                        <AnimatePresence initial={false}>
                          {!isCollapsed && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 sm:p-5 space-y-4 bg-slate-50/30">
                                {/* Liste des leçons */}
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-2.5">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 inline-flex items-center gap-1.5">
                                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                                      <span>Leçons du chapitre ({lessons.length})</span>
                                    </span>
                                    {lessons.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => openLessonModal(managedCourse._id, chapter._id)}
                                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer inline-flex items-center gap-1"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Ajouter une leçon</span>
                                      </button>
                                    )}
                                  </div>

                                  {lessons.length === 0 ? (
                                    <div className="py-6 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-white/70">
                                      <p className="text-xs text-slate-400 font-medium mb-2">Aucune leçon dans ce chapitre.</p>
                                      <button
                                        type="button"
                                        onClick={() => openLessonModal(managedCourse._id, chapter._id)}
                                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Créer la première leçon</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {lessons.map((lesson, lIdx) => {
                                        const Icon =
                                          lesson.contentType === 'video'
                                            ? Video
                                            : lesson.contentType === 'pdf'
                                            ? FileText
                                            : lesson.contentType === 'meet' || lesson.contentType === 'jitsi'
                                            ? Calendar
                                            : Play;
                                        const typeBadge =
                                          lesson.contentType === 'video'
                                            ? { label: 'Vidéo', bg: 'bg-rose-50 text-rose-700 border-rose-200', iconColor: 'text-rose-600 bg-rose-50 border-rose-100' }
                                            : lesson.contentType === 'pdf'
                                            ? { label: 'Document PDF', bg: 'bg-blue-50 text-blue-700 border-blue-200', iconColor: 'text-blue-600 bg-blue-50 border-blue-100' }
                                            : lesson.contentType === 'meet' || lesson.contentType === 'jitsi'
                                            ? { label: 'Direct', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
                                            : { label: 'Texte / Lecture', bg: 'bg-purple-50 text-purple-700 border-purple-200', iconColor: 'text-purple-600 bg-purple-50 border-purple-100' };

                                        return (
                                          <div
                                            key={lesson._id}
                                            className="group flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-200 shadow-2xs hover:shadow-xs transition"
                                          >
                                            <div className="flex items-center gap-3 min-w-0">
                                              <span className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${typeBadge.iconColor}`}>
                                                <Icon className="w-4 h-4" />
                                              </span>
                                              <div className="min-w-0">
                                                <p className="font-bold text-slate-800 text-xs sm:text-sm truncate group-hover:text-indigo-900 transition-colors">
                                                  {lesson.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${typeBadge.bg}`}>
                                                    {typeBadge.label}
                                                  </span>
                                                  {lesson.isFree && (
                                                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                                                      Gratuit
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                              {/* Réorganisation */}
                                              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                                                <button
                                                  type="button"
                                                  disabled={lIdx === 0}
                                                  onClick={() => handleMoveLesson(managedCourse._id, chapter, lIdx, -1)}
                                                  title="Monter la leçon"
                                                  className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition"
                                                >
                                                  <ChevronUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  type="button"
                                                  disabled={lIdx === lessons.length - 1}
                                                  onClick={() => handleMoveLesson(managedCourse._id, chapter, lIdx, 1)}
                                                  title="Descendre la leçon"
                                                  className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition"
                                                >
                                                  <ChevronDown className="w-3.5 h-3.5" />
                                                </button>
                                              </div>

                                              <button
                                                type="button"
                                                onClick={() => openLessonModal(managedCourse._id, chapter._id, lesson)}
                                                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition shadow-2xs"
                                              >
                                                <Edit className="w-3 h-3 text-amber-600" />
                                                <span>Modifier</span>
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleDeleteLesson(managedCourse._id, chapter._id, lesson)}
                                                title="Supprimer cette leçon"
                                                className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg cursor-pointer transition shadow-2xs"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Exercices du chapitre */}
                                {chapterExercises.length > 0 && (
                                  <div className="pt-3 mt-3 border-t border-dashed border-amber-200 space-y-2.5">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 inline-flex items-center gap-1.5">
                                        <Calculator className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Exercices du chapitre ({chapterExercises.length})</span>
                                      </span>
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
                                        className="text-[11px] font-bold text-amber-700 hover:text-amber-900 hover:underline cursor-pointer inline-flex items-center gap-1"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Ajouter un exercice</span>
                                      </button>
                                    </div>

                                    <div className="space-y-2">
                                      {chapterExercises.map((ex) => {
                                        const diffBadge =
                                          ex.difficulty === 'difficile'
                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                            : ex.difficulty === 'facile'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-amber-50 text-amber-700 border-amber-200';

                                        return (
                                          <div
                                            key={ex._id}
                                            className="group flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-50/40 hover:bg-amber-50/80 border border-amber-200/80 hover:border-amber-300 shadow-2xs transition"
                                          >
                                            <div className="flex items-center gap-3 min-w-0">
                                              <span className="w-8 h-8 rounded-xl bg-white border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                                                <Calculator className="w-4 h-4" />
                                              </span>
                                              <div className="min-w-0">
                                                <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{ex.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                                    {ex.exerciseType || 'Application'}
                                                  </span>
                                                  <span className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded-md border ${diffBadge}`}>
                                                    {ex.difficulty || 'Moyen'}
                                                  </span>
                                                  <span className="text-[10px] font-semibold text-slate-500">
                                                    {ex.submissionsCount || 0} rendu(s)
                                                  </span>
                                                </div>
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
                                                className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition shadow-2xs"
                                              >
                                                <Edit className="w-3 h-3 text-amber-600" />
                                                <span>Modifier</span>
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleDeleteExercise(ex)}
                                                title="Supprimer cet exercice"
                                                className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg cursor-pointer transition shadow-2xs"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Exercices généraux du module */}
              {(() => {
                const moduleExercises = exercises.filter(
                  (ex) => (ex.course?._id || ex.course) === managedCourse._id && !ex.chapterId
                );
                return (
                  <div className="border-t border-slate-200/90 pt-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                          <Calculator className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-800">
                              Exercices généraux du module
                            </h4>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {moduleExercises.length}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">Devoirs globaux ou synthèses non rattachés à un chapitre.</p>
                        </div>
                      </div>

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
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs transition hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajouter un exercice au module</span>
                      </button>
                    </div>

                    {moduleExercises.length > 0 && (
                      <div className="space-y-2">
                        {moduleExercises.map((ex) => (
                          <div
                            key={ex._id}
                            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white border border-amber-200/80 hover:border-amber-300 shadow-2xs transition"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                                <Calculator className="w-4 h-4" />
                              </span>
                              <div>
                                <p className="font-bold text-slate-900 text-xs sm:text-sm">{ex.title}</p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {ex.exerciseType || 'Application'} • {ex.difficulty || 'Moyen'} • {ex.submissionsCount || 0} rendu(s)
                                </p>
                              </div>
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
                                className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition shadow-2xs"
                              >
                                <Edit className="w-3 h-3 text-amber-600" />
                                <span>Modifier</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteExercise(ex)}
                                title="Supprimer cet exercice"
                                className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg cursor-pointer transition shadow-2xs"
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
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 shadow-sm border border-slate-200/80">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Vous n'avez créé aucune matière</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
              Créez votre première matière pour commencer à publier vos cours, chapitres et exercices.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Créer une première matière</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course) => {
              const published = course.isPublished !== false;
              return (
                <div
                  key={course._id}
                  className="group bg-white rounded-3xl overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md border border-slate-200/80 transition-all duration-200"
                >
                  <div>
                    <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                      <span
                        className={`absolute top-3.5 left-3.5 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-md ${
                          published
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-slate-900/90 text-white'
                        }`}
                      >
                        {published ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200/70 px-2.5 py-0.5 rounded-full font-bold">
                          {course.subject}
                        </span>
                        <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200/70 px-2.5 py-0.5 rounded-full font-bold">
                          {formatLevel(course.level)}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 line-clamp-2 mb-1.5 group-hover:text-indigo-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{course.description}</p>
                      <div className="flex items-center justify-between text-xs mt-4 pt-3.5 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">
                          {course.chapters?.length || 0} chapitre{(course.chapters?.length || 0) > 1 ? 's' : ''} •{' '}
                          {course.studentsCount ?? 0} abonné{(course.studentsCount ?? 0) > 1 ? 's' : ''}
                        </span>
                        <span className="font-extrabold text-indigo-600 tabular-nums">
                          {course.isFree || course.price === 0
                            ? 'Gratuit'
                            : `${Number(course.price).toLocaleString('fr-FR')} FCFA`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setManagingCourseId(course._id)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition shadow-2xs hover:shadow-xs inline-flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Chapitres &amp; Leçons</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTogglePublishCourse(course)}
                        title={published ? 'Dépublier (passer en brouillon)' : 'Publier ce cours'}
                        className="p-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer shadow-2xs"
                      >
                        {published ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditCourse(course)}
                        className="p-2 bg-white border border-slate-200 hover:bg-amber-50 text-slate-700 hover:text-amber-700 rounded-xl transition cursor-pointer shadow-2xs"
                        title="Modifier les informations"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/courses/${course._id}`}
                        className="p-2 bg-white border border-slate-200 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl transition shadow-2xs"
                        title="Prévisualiser comme élève"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(course._id)}
                        className="p-2 bg-white border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition cursor-pointer shadow-2xs"
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
  };

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
    <div className="space-y-6">
      {/* Barre d'outils et filtres */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl shadow-2xs border border-slate-200/80">
        <div className="flex flex-wrap items-center bg-slate-100/80 p-1.5 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setExerciseTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
              exerciseTab === 'catalog'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Exercices créés ({exercises.length})
          </button>
          <button
            type="button"
            onClick={() => setExerciseTab('submissions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition inline-flex items-center gap-2 ${
              exerciseTab === 'submissions'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Copies &amp; Rendus ({exerciseSubmissions.length})</span>
            {pendingHomeworkCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                {pendingHomeworkCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={exerciseCourseFilter}
            onChange={(e) => setExerciseCourseFilter(e.target.value)}
            className="h-11 px-3.5 rounded-2xl border border-slate-200 text-xs bg-slate-50/70 font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs cursor-pointer"
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
              className="h-11 px-3.5 rounded-2xl border border-slate-200 text-xs bg-slate-50/70 font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs cursor-pointer"
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
            className="h-11 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-2xs hover:shadow-xs transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel exercice</span>
          </button>
        </div>
      </div>

      {exerciseTab === 'catalog' ? (
        filteredExercises.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200/80 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <Calculator className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">Aucun exercice enregistré pour le moment</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
              Créez des exercices d'application, devoirs maison ou annales d'examen pour vos élèves.
            </p>
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
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Créer le premier exercice</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExercises.map((ex, eIdx) => {
              const diffBadge =
                ex.difficulty === 'difficile'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : ex.difficulty === 'facile'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200';

              return (
                <motion.div
                  key={ex._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: eIdx * 0.03 }}
                  className="bg-white rounded-3xl p-5 sm:p-6 space-y-3.5 shadow-2xs hover:shadow-xs border border-slate-200/80 transition"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/70 px-2.5 py-0.5 rounded-full">
                          {typeLabelMap[ex.exerciseType] || ex.exerciseType}
                        </span>
                        <span className={`text-[10px] font-bold capitalize px-2.5 py-0.5 rounded-full border ${diffBadge}`}>
                          {ex.difficulty || 'Moyen'}
                        </span>
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full">
                          {ex.isRequired !== false ? 'Obligatoire' : 'Facultatif'}
                        </span>
                        <span className="text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-full">
                          {visibilityLabelMap[ex.correctionVisibility] || ex.correctionVisibility}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 tracking-tight">{ex.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        <strong className="text-slate-700">{ex.course?.title}</strong>
                        {ex.chapterTitle ? ` • Chapitre : ${ex.chapterTitle}` : ' • Module entier'}
                        {ex.deadline ? ` • Date limite : ${formatDateShort(ex.deadline)}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="text-right mr-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <div className="text-xs font-black text-indigo-600 tabular-nums">
                          {ex.submissionsCount > 0 ? `${ex.successRate}% réussite` : 'Aucun rendu'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
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
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold cursor-pointer transition shadow-2xs hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5 text-amber-600" />
                        <span>Modifier</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExercise(ex)}
                        className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 cursor-pointer transition shadow-2xs"
                        title="Supprimer l'exercice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {ex.statementText && (
                    <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed line-clamp-3">
                      <MathText text={ex.statementText} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )
      ) : filteredExerciseSubmissions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200/80 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800">Aucune copie soumise pour le moment</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Les devoirs et fichiers rendus par vos élèves apparaîtront ici pour correction et notation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExerciseSubmissions.map((sub, sIdx) => {
            const draft = gradeDrafts[sub._id] || {
              grade: sub.grade ?? '',
              teacherComment: sub.teacherComment || '',
              isPassed: sub.isPassed ?? true,
            };

            return (
              <motion.div
                key={sub._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: sIdx * 0.03 }}
                className="bg-white rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs border border-slate-200/80 text-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      {sub.student?.avatar ? (
                        <img src={sub.student?.avatar} alt={sub.student?.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-sm">
                          {sub.student?.name?.charAt(0) || 'E'}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm">{sub.student?.name || 'Élève'}</p>
                      <p className="text-slate-500 mt-0.5">
                        <strong className="text-slate-800">{sub.course?.title}</strong> • {sub.exercise?.title} (
                        {typeLabelMap[sub.exercise?.exerciseType] || sub.exercise?.exerciseType})
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Déposé le {formatDateShort(sub.submittedAt)}</p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                      sub.status === 'graded'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : sub.status === 'submitted'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
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
                  <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 text-slate-700 whitespace-pre-wrap leading-relaxed">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Réponse rédigée par l'élève</p>
                    {sub.answerText}
                  </div>
                )}

                {sub.fileUrl && (
                  <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4">
                    <span className="font-bold text-indigo-900 text-xs">
                      Document joint par l&apos;élève ({sub.fileType === 'pdf' ? 'PDF' : 'Photo'})
                    </span>
                    <a
                      href={sub.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ouvrir la copie</span>
                    </a>
                  </div>
                )}

                {/* Console de notation */}
                <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
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
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-black text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Commentaire / Remarques du professeur
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
                      placeholder="Conseils méthodologiques, encouragements..."
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2 pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        setGradeDrafts((prev) => ({
                          ...prev,
                          [sub._id]: { ...draft, isPassed: !draft.isPassed },
                        }))
                      }
                      className={`w-full h-10 rounded-xl text-xs font-bold border transition cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                        draft.isPassed
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${draft.isPassed ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{draft.isPassed ? 'Réussi' : 'Non validé'}</span>
                    </button>
                  </div>
                  <div className="md:col-span-3 pt-4 md:text-right">
                    <button
                      type="button"
                      onClick={() => handleSaveGrade(sub)}
                      className="w-full md:w-auto h-10 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold cursor-pointer shadow-2xs hover:shadow-xs transition hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Enregistrer la note
                    </button>
                  </div>
                </div>
              </motion.div>
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
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl shadow-2xs border border-slate-200/80">
          <div className="flex flex-wrap items-center bg-slate-100/80 p-1.5 rounded-2xl gap-1">
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
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {quizTab === 'list' && (
          <div className="space-y-4">
            {quizzes.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200/80 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">Aucun quiz créé pour le moment</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                  Créez des QCM interactifs ou des questions à réponse libre pour évaluer la compréhension de vos élèves.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    resetQuizForm();
                    setQuizTab('builder');
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Créer votre premier quiz</span>
                </button>
              </div>
            ) : (
              quizzes.map((q, qIdx) => {
                const attempts = quizResults.filter((r) => (r.quiz?._id || r.quiz) === q._id);
                return (
                  <motion.div
                    key={q._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: qIdx * 0.03 }}
                    className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-slate-900 text-base tracking-tight">{q.title}</h4>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full">
                          {q.chapterTitle ? `Chapitre : ${q.chapterTitle}` : 'Quiz final'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-2 flex-wrap">
                        <strong className="text-slate-800">{q.course?.title}</strong>
                        <span>•</span>
                        <span>{q.questions?.length || 0} question(s)</span>
                        <span>•</span>
                        <span>Seuil : {q.passingScore ?? 50}%</span>
                        <span>•</span>
                        <span>{q.maxAttempts > 0 ? `${q.maxAttempts} essai(s) max` : 'Tentatives illimitées'}</span>
                        <span>•</span>
                        <strong className="text-indigo-600">{attempts.length} passage(s)</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStatsQuizId(q._id);
                          setQuizTab('results');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold cursor-pointer transition shadow-2xs"
                      >
                        Résultats &amp; Stats
                      </button>
                      <button
                        type="button"
                        onClick={() => startEditQuiz(q)}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold cursor-pointer transition shadow-2xs"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuiz(q)}
                        className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 cursor-pointer transition shadow-2xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {quizTab === 'builder' && (
          <form onSubmit={handleSaveQuiz} className="bg-white rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xs border border-slate-200/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Cours associé</label>
                <select
                  required
                  value={quizCourseId}
                  onChange={(e) => {
                    setQuizCourseId(e.target.value);
                    setQuizChapterId('');
                  }}
                  className="w-full h-11 px-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs cursor-pointer"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Portée pédagogique du quiz</label>
                <select
                  value={quizChapterId}
                  onChange={(e) => setQuizChapterId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs cursor-pointer"
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
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Titre du quiz</label>
                <input
                  type="text"
                  required
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="ex: Évaluation Suites & Limites"
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Note de réussite requise (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={quizPassingScore}
                  onChange={(e) => setQuizPassingScore(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Tentatives max (0 = illimité)</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={quizMaxAttempts}
                  onChange={(e) => setQuizMaxAttempts(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Questions du quiz ({quizQuestions.length})</h4>
              {quizQuestions.map((question, qIdx) => (
                <div key={qIdx} className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-3.5 relative">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-2.5 py-0.5 rounded-full">
                      Question {qIdx + 1}
                    </span>
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
                        className="h-8 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs"
                      >
                        <option value="qcm">QCM (choix multiples)</option>
                        <option value="true_false">Vrai / Faux</option>
                        <option value="text">Réponse libre (courte)</option>
                      </select>
                      {quizQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setQuizQuestions((prev) => prev.filter((_, i) => i !== qIdx))}
                          className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg cursor-pointer transition shadow-2xs"
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
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-indigo-500 shadow-2xs"
                  />

                  {question.questionType === 'text' ? (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Réponse attendue (correction automatique)
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
                        className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                      />
                    </div>
                  ) : question.questionType === 'true_false' ? (
                    <div className="flex items-center gap-4 text-xs">
                      {['Vrai', 'Faux'].map((lbl, oIdx) => (
                        <label key={lbl} className="inline-flex items-center gap-2 font-bold cursor-pointer">
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
                    <div className="space-y-2.5">
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
                            className="flex-1 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs"
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
                              className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
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
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Ajouter une option</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
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
                className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-xs font-bold text-indigo-700 cursor-pointer transition inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une question</span>
              </button>

              <div className="flex items-center gap-2.5">
                {editingQuizId && (
                  <button
                    type="button"
                    onClick={() => {
                      resetQuizForm();
                      setQuizTab('list');
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Annuler
                  </button>
                )}
                <button
                  type="submit"
                  disabled={savingQuiz}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60 shadow-2xs hover:shadow-xs transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  {savingQuiz ? 'Enregistrement...' : editingQuizId ? 'Mettre à jour le quiz' : 'Enregistrer le quiz'}
                </button>
              </div>
            </div>
          </form>
        )}

        {quizTab === 'results' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-3xl shadow-2xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Filtrer par quiz :</h3>
              </div>
              <select
                value={selectedStatsQuizId}
                onChange={(e) => setSelectedStatsQuizId(e.target.value)}
                className="h-11 px-4 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/70 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs cursor-pointer"
              >
                <option value="all">Tous les quiz ({quizResults.length} passages)</option>
                {quizzes.map((q) => (
                  <option key={q._id} value={q._id}>
                    {q.title} ({q.course?.title})
                  </option>
                ))}
              </select>
            </div>

            {/* Statistiques par question */}
            {selectedStatsQuiz && selectedStatsQuiz.questions?.length > 0 && (
              <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-2xs border border-slate-200/80 space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm">
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
                      <div key={qIdx} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="font-bold text-slate-800">
                            {qIdx + 1}. {q.questionText}
                          </span>
                          <span className="font-black text-indigo-600 tabular-nums shrink-0">
                            {answeredList.length > 0 ? `${rate}% de réussite (${correctCount}/${answeredList.length})` : 'Aucune donnée'}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${rate}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Résultats par élève */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-2xs border border-slate-200/80">
              <h4 className="font-extrabold text-slate-900 text-sm mb-4">Résultats individuels par élève</h4>
              {filteredQuizResults.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">Aucun résultat pour cette sélection.</p>
              ) : (
                <div className="space-y-2.5">
                  {filteredQuizResults.map((res) => {
                    const pct = Math.round((res.score / Math.max(1, res.totalQuestions)) * 100);
                    const threshold = res.quiz?.passingScore ?? 50;
                    const passed = res.passed !== undefined ? res.passed : pct >= threshold;
                    return (
                      <div
                        key={res._id}
                        className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 text-xs hover:bg-indigo-50/30 transition"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-white border border-slate-200 shrink-0">
                            {res.student?.avatar ? (
                              <img src={res.student?.avatar} alt={res.student?.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                                {res.student?.name?.charAt(0) || 'E'}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{res.student?.name || 'Élève'}</p>
                            <p className="text-slate-500 truncate mt-0.5">
                              {res.quiz?.title} • {formatDateShort(res.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              passed
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {passed ? 'Réussi' : 'Échec'}
                          </span>
                          <span className="font-black text-indigo-700 tabular-nums bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
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
    <TeacherStudentsTab
      students={students}
      courses={courses}
      quizResults={quizResults}
      onToggleStudentStatus={handleToggleStudentStatus}
      onOpenRemindModal={(sub) => setRemindModalSub(sub)}
      onExtendStudentSubscription={handleExtendStudentSubscription}
      formatDateShort={formatDateShort}
    />
  );

  // ================= RENDU : 6. QUESTIONS & RÉPONSES =================
  const renderQaSection = () => (
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-2xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center bg-slate-100/80 p-1.5 rounded-2xl gap-1">
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
                qaFilter === f.id
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={qaCourseFilter}
          onChange={(e) => setQaCourseFilter(e.target.value)}
          className="h-11 px-4 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/70 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs cursor-pointer"
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
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200/80 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">Aucune question dans cette catégorie</p>
            <p className="text-xs text-slate-400 mt-1">Les interrogations des élèves apparaîtront ici.</p>
          </div>
        ) : (
          filteredDiscussions.map((d, dIdx) => (
            <motion.div
              key={d._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: dIdx * 0.03 }}
              className="bg-white rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs border border-slate-200/80"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    {d.sender?.avatar ? (
                      <img src={d.sender?.avatar} alt={d.sender?.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                        {d.sender?.name?.charAt(0) || 'E'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-sm">{d.sender?.name || 'Élève'}</span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/70 px-2.5 py-0.5 rounded-full">
                        {d.course?.title}
                      </span>
                      {(d.exercise?.title || d.exerciseTitle) && (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
                          Exercice : {d.exercise?.title || d.exerciseTitle}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          d.isResolved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {d.isResolved ? 'Résolue' : 'En attente'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 mt-2 whitespace-pre-wrap leading-relaxed">{d.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">{formatDateShort(d.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleResolveDiscussion(d)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs ${
                      d.isResolved
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {d.isResolved ? 'Rouvrir' : 'Marquer résolue'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingQa({ msgId: d._id, text: d.message })}
                    title="Modifier"
                    className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 cursor-pointer shadow-2xs"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQa(d._id)}
                    className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 cursor-pointer shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  // ================= RENDU : 7. AVIS ÉLÈVES & NOTATIONS =================
  const renderReviewsSection = () => (
    <div className="space-y-6">
      {/* Moyenne par cours */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {courses.map((c) => {
          const courseRevs = reviews.filter((r) => (r.course?._id || r.course) === c._id);
          const avg =
            courseRevs.length > 0
              ? (courseRevs.reduce((s, r) => s + r.rating, 0) / courseRevs.length).toFixed(1)
              : '—';
          return (
            <div key={c._id} className="bg-white rounded-3xl p-5 shadow-2xs border border-slate-200/80 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-extrabold text-slate-900 text-sm truncate">{c.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{courseRevs.length} avis reçu(s)</p>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl font-black text-sm shrink-0 shadow-2xs">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{avg}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200/80 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <p className="text-sm font-bold text-slate-800">Aucun avis publié pour le moment</p>
            <p className="text-xs text-slate-400 mt-1">Les retours d'expérience et notes de vos élèves s'afficheront ici.</p>
          </div>
        ) : (
          reviews.map((rev, rIdx) => (
            <motion.div
              key={rev._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: rIdx * 0.03 }}
              className="bg-white rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs border border-slate-200/80"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-extrabold text-slate-900 text-sm">{rev.student?.name || 'Élève'}</span>
                    <span className="flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`w-3.5 h-3.5 ${
                            n <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/70 px-2.5 py-0.5 rounded-full">
                      {rev.course?.title}
                    </span>
                    {rev.isReported && (
                      <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        Signalé ({rev.reportReason})
                      </span>
                    )}
                  </div>
                  {rev.comment && <p className="text-sm text-slate-700 mt-2 leading-relaxed">{rev.comment}</p>}
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">{formatDateShort(rev.createdAt)}</p>
                </div>

                {rev.isReported ? (
                  <button
                    type="button"
                    onClick={() => handleUnreportReview(rev._id)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
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
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Signaler</span>
                  </button>
                )}
              </div>

              {rev.teacherReply && (
                <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 text-xs text-slate-700">
                  <span className="font-extrabold text-indigo-700">Votre réponse : </span>
                  {rev.teacherReply}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={reviewReplyDrafts[rev._id] ?? rev.teacherReply ?? ''}
                  onChange={(e) => setReviewReplyDrafts((prev) => ({ ...prev, [rev._id]: e.target.value }))}
                  placeholder="Répondre à cet avis..."
                  className="flex-1 h-10 px-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => handleReplyReview(rev._id)}
                  className="px-5 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold cursor-pointer shadow-2xs hover:shadow-xs transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  {rev.teacherReply ? 'Mettre à jour' : 'Répondre'}
                </button>
              </div>
            </motion.div>
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
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const renderCommunicationSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Annonces aux élèves d'un cours */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xs border border-slate-200/80">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Megaphone className="w-4 h-4" />
          </div>
          <span>Publier une annonce aux élèves</span>
        </h3>

        <form onSubmit={handlePostAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Cours ciblé</label>
            <select
              required
              value={annCourseId}
              onChange={(e) => setAnnCourseId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs cursor-pointer"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Titre de l&apos;annonce</label>
            <input
              type="text"
              required
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="ex: Séance de révision Bac ce samedi à 10h"
              className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Message</label>
            <textarea
              required
              rows={3}
              value={annMessage}
              onChange={(e) => setAnnMessage(e.target.value)}
              placeholder="Rédigez votre annonce pour les élèves inscrits..."
              className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm resize-none focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs leading-relaxed"
            />
          </div>
          <button
            type="button"
            onClick={() => setAnnSendEmail((v) => !v)}
            className={`w-full h-11 px-4 rounded-2xl border text-xs font-bold transition cursor-pointer flex items-center justify-between ${
              annSendEmail
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Envoyer également par e-mail aux élèves abonnés</span>
            <Check className={`w-4 h-4 ${annSendEmail ? 'text-indigo-600' : 'text-slate-300'}`} />
          </button>
          <button
            type="submit"
            disabled={postingAnn || courses.length === 0}
            className="w-full h-11 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 shadow-2xs hover:shadow-xs transition hover:scale-[1.02] active:scale-[0.98]"
          >
            {postingAnn ? 'Envoi en cours...' : "Publier l'annonce"}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Annonces récentes</h4>
          {allAnnouncements.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Aucune annonce publiée pour le moment.</p>
          ) : (
            allAnnouncements.map((ann) => (
              <div key={ann._id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-start justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900">{ann.title}</p>
                  <p className="text-indigo-600 font-bold text-[11px] mt-0.5">{ann.courseTitle}</p>
                  <p className="text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">{ann.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAnnouncement(ann.courseId, ann._id)}
                  className="p-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer shrink-0 shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Séances en direct (Meet / Jitsi) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xs border border-slate-200/80">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Video className="w-4 h-4" />
          </div>
          <span>Séances en direct &amp; Visioconférences ({liveLessons.length})</span>
        </h3>
        {liveLessons.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-400 flex items-center justify-center mx-auto mb-3">
              <Video className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">Aucune séance en direct programmée</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto mb-4">
              Configurez des liens Google Meet ou Jitsi dans vos leçons pour animer vos sessions en direct.
            </p>
            <button
              type="button"
              onClick={() => setView('courses')}
              className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
            >
              <span>Ajouter un cours en direct depuis &laquo; Matières &amp; Contenu &raquo;</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {liveLessons.map((ll) => (
              <div
                key={ll._id}
                className="p-4 sm:p-5 rounded-2xl bg-purple-50/40 border border-purple-200/80 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{ll.title}</h4>
                  <p className="text-xs text-purple-700 font-semibold mt-0.5">
                    {ll.courseTitle} • Chapitre : {ll.chapterTitle}
                  </p>
                </div>
                {ll.meetLink && (
                  <a
                    href={ll.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Lancer la séance</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ================= RENDU : 9. PROFIL PROFESSEUR & PARAMÈTRES =================
  const renderProfileSection = () => (
    <form onSubmit={handleSaveTeacherProfile} className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs border border-slate-200/80 max-w-4xl">
      {user?.role === 'admin' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 text-xs text-amber-900 font-medium">
          Vous consultez la vue Professeur avec votre session <strong>Administrateur ({user.email})</strong>. Les
          modifications ci-dessous concernent votre compte personnel. Pour modifier le compte d&apos;un autre
          enseignant, passez par{' '}
          <Link to="/admin-dashboard" className="font-bold underline text-indigo-600">
            Back-Office Admin → Utilisateurs
          </Link>
          .
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
            {profileAvatarFile ? (
              <img src={URL.createObjectURL(profileAvatarFile)} alt="" className="w-full h-full object-cover" />
            ) : user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-lg">
                {user?.name?.charAt(0) || 'P'}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">{user?.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                Professeur
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
            <label className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer mt-1">
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
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
        >
          Page Profil Complète →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Nom complet</label>
          <input
            type="text"
            required
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Adresse Email</label>
          <input
            type="email"
            required
            value={profileEmail}
            onChange={(e) => setProfileEmail(e.target.value)}
            className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Téléphone</label>
          <input
            type="tel"
            value={profilePhone}
            onChange={(e) => setProfilePhone(e.target.value)}
            placeholder="+221 77 ..."
            className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Nouveau mot de passe (optionnel)</label>
          <input
            type="password"
            value={profilePassword}
            onChange={(e) => setProfilePassword(e.target.value)}
            placeholder="Laisser vide pour ne pas changer"
            className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">Biographie &amp; Présentation</label>
        <textarea
          rows={3}
          value={profileBio}
          onChange={(e) => setProfileBio(e.target.value)}
          placeholder="Présentez votre parcours et vos méthodes pédagogiques aux élèves..."
          className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm resize-none focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs leading-relaxed"
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
                className={`px-4 py-2 rounded-2xl text-xs font-bold border cursor-pointer transition shadow-2xs ${
                  active
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 border-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {subName}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Préférences de notification</h4>
        <button
          type="button"
          onClick={() => setPrefEmailNotifs((v) => !v)}
          className="w-full flex items-center justify-between text-xs text-slate-700 font-semibold cursor-pointer p-2 rounded-xl hover:bg-white transition"
        >
          <span>Recevoir les notifications par e-mail (nouvelles questions, abonnements)</span>
          <div className={`w-11 h-6 rounded-full transition-colors relative ${prefEmailNotifs ? 'bg-indigo-600' : 'bg-slate-300'}`}>
            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${prefEmailNotifs ? 'right-0.5' : 'left-0.5'}`} />
          </div>
        </button>
        <button
          type="button"
          onClick={() => setPrefLiveReminders((v) => !v)}
          className="w-full flex items-center justify-between text-xs text-slate-700 font-semibold cursor-pointer p-2 rounded-xl hover:bg-white transition"
        >
          <span>Rappels avant les séances en direct</span>
          <div className={`w-11 h-6 rounded-full transition-colors relative ${prefLiveReminders ? 'bg-indigo-600' : 'bg-slate-300'}`}>
            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${prefLiveReminders ? 'right-0.5' : 'left-0.5'}`} />
          </div>
        </button>
      </div>

      <button
        type="submit"
        disabled={savingProfile}
        className="px-7 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60 shadow-2xs hover:shadow-xs transition hover:scale-[1.02] active:scale-[0.98]"
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
                          ? 'bg-white text-[#4c3882] font-bold shadow-md shadow-black/10'
                          : 'text-white/85 font-medium hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#4c3882]' : 'text-white/80'}`} />
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {typeof item.count === 'number' && (
                        <span
                          className={`text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-full ${
                            item.alert
                              ? 'bg-[#ef4444] text-white shadow-sm'
                              : active
                              ? 'bg-[#4c3882] text-white'
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
          <header className="bg-white rounded-2xl shadow-lg px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 border border-slate-100 relative z-30">
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

              {/* Bouton Nouveau Cours (placé exactement avant la cloche, comme sur l'Admin) */}
              <button
                onClick={openCreateModal}
                className="h-9 px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nouvelle Matière</span>
              </button>

              {/* Cloche de notifications enseignant (identique à Admin) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifMenu((v) => !v)}
                  aria-label="Notifications"
                  className="relative w-9 h-9 rounded-xl bg-[#eef2fb] hover:bg-indigo-100 text-[#4c3882] flex items-center justify-center cursor-pointer transition shrink-0"
                  title="Notifications et alertes"
                >
                  <Bell className="w-4 h-4" />
                  {pendingTeacherAlerts > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ef4444] text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm animate-pulse">
                      {pendingTeacherAlerts > 99 ? '99+' : pendingTeacherAlerts}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifMenu(false)} />
                    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 isolate">
                      <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#4c3882]" />
                          <span className="text-sm font-bold text-slate-900">Notifications Pédagogiques</span>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-[#4c3882]">
                          {pendingTeacherAlerts} active(s)
                        </span>
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                        {metrics.unansweredQuestions?.slice(0, 4).map((q) => (
                          <button
                            key={q._id}
                            onClick={() => {
                              setView('qa');
                              setQaFilter('unanswered');
                              setShowNotifMenu(false);
                            }}
                            className="w-full text-left p-3.5 hover:bg-slate-50 flex items-start gap-3 transition cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-800 truncate">
                                Question de {q.sender?.name || 'Élève'}
                              </p>
                              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">"{q.message}"</p>
                              <span className="text-[10px] text-blue-600 font-semibold mt-1 inline-block">
                                Cliquer pour répondre →
                              </span>
                            </div>
                          </button>
                        ))}
                        {exerciseSubmissions
                          ?.filter((s) => s.status === 'submitted')
                          .slice(0, 4)
                          .map((sub) => (
                            <button
                              key={sub._id}
                              onClick={() => {
                                setView('exercises');
                                setExerciseTab('submissions');
                                setShowNotifMenu(false);
                              }}
                              className="w-full text-left p-3.5 hover:bg-slate-50 flex items-start gap-3 transition cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                                <Calculator className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-800 truncate">
                                  Devoir soumis : {sub.student?.name || 'Élève'}
                                </p>
                                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                  {sub.exercise?.title || 'Exercice'}
                                </p>
                                <span className="text-[10px] text-amber-600 font-semibold mt-1 inline-block">
                                  Cliquer pour corriger →
                                </span>
                              </div>
                            </button>
                          ))}
                        {pendingTeacherAlerts === 0 && (
                          <div className="p-6 text-center text-xs text-slate-400">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                            Toutes les questions sont répondues et tous les devoirs sont corrigés !
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profil enseignant avec dropdown haute netteté */}
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
                    <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 isolate">
                      <div className="px-4 pb-3 border-b border-slate-100">
                        <p className="text-[11px] font-extrabold text-[#ef4444] uppercase tracking-wider">Professeur</p>
                        <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{user?.name}</p>
                        <p className="text-xs font-medium text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin-dashboard"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-[#5c6be0] hover:bg-[#eef2fb]/60 transition"
                          >
                            <Shield className="w-4 h-4 text-[#5c6be0]" />
                            Back-Office Admin
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            setShowHistoryModal(true);
                          }}
                          className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-[#5c6be0] hover:bg-[#eef2fb]/60 transition cursor-pointer"
                        >
                          <History className="w-4 h-4 text-[#5c6be0]" />
                          Historique d'activité
                        </button>
                        <Link
                          to="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-[#5c6be0] hover:bg-[#eef2fb]/60 transition"
                        >
                          <Settings className="w-4 h-4 text-[#5c6be0]" />
                          Paramètres du profil
                        </Link>
                      </div>
                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer transition"
                        >
                          <LogOut className="w-4 h-4" />
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Bannière titre de section (uniquement pour les sous-vues, pour éviter les doublons sur l'overview) */}
          {view !== 'overview' && (
            <div className="bg-white rounded-2xl shadow-md px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-100">
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
            </div>
          )}

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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_25px_70px_rgba(15,23,42,0.25)] relative flex flex-col max-h-[92vh] overflow-y-auto"
          >
            <button
              onClick={() => {
                setShowCourseModal(false);
                resetCourseForm();
              }}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* En-tête */}
            <div className="flex items-center gap-3.5 mb-6 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#5c6be0] flex items-center justify-center shrink-0 shadow-xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {editingCourse ? 'Modifier la matière' : 'Créer une nouvelle matière'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configurez le titre, la matière, la classe et le tarif de votre cours.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-semibold mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#5c6be0]" />
                  <span>Titre de la matière</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#5c6be0] focus:ring-4 focus:ring-[#5c6be0]/10 transition shadow-2xs"
                  placeholder="ex: Mécanique de Newton et Forces"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5 text-[#5c6be0]" />
                  <span>Description</span>
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-24 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#5c6be0] focus:ring-4 focus:ring-[#5c6be0]/10 transition shadow-2xs resize-none"
                  placeholder="Détaillez le programme et les notions abordées..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#5c6be0]" />
                    <span>Matière</span>
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-sm text-slate-900 focus:outline-none focus:border-[#5c6be0] shadow-2xs"
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#5c6be0]" />
                    <span>Niveau</span>
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-sm text-slate-900 focus:outline-none focus:border-[#5c6be0] shadow-2xs"
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#5c6be0]" />
                  <span>Durée d'accès</span>
                </label>
                <input
                  type="text"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#5c6be0] shadow-2xs"
                  placeholder="ex: 3 mois, 1 an"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70">
                <div>
                  <p className="text-sm font-bold text-slate-800">Visibilité du cours</p>
                  <p className="text-xs text-slate-500">
                    {isPublished ? 'Publié : visible dans le catalogue élèves.' : 'Brouillon : visible uniquement par vous.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublished((v) => !v)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                    isPublished ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isPublished ? 'Publié' : 'Brouillon'}
                </button>
              </div>

              <div
                onClick={() => setIsFree((prev) => !prev)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                  isFree ? 'bg-indigo-50/60 border-indigo-200' : 'bg-slate-50/70 border-slate-200'
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
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Valeur normale (FCFA)
                    </label>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(parseInt(e.target.value, 10) || 0)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/60 text-sm focus:outline-none focus:border-[#5c6be0]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tarif (FCFA)
                    </label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/60 text-sm focus:outline-none focus:border-[#5c6be0]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <ImagePlus className="w-3.5 h-3.5 text-[#5c6be0]" />
                    <span>Couverture</span>
                  </label>
                  <label className="flex items-center gap-2 px-3 h-11 bg-slate-50/70 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 rounded-xl cursor-pointer transition shadow-2xs">
                    <ImagePlus className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate text-xs font-semibold text-slate-600">
                      {imageFile ? imageFile.name : 'Choisir une image...'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCourseModal(false);
                    resetCourseForm();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/25 hover:shadow-lg disabled:opacity-60"
                >
                  {creating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>{editingCourse ? 'Mettre à jour le cours' : 'Créer le cours'}</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Ajouter / Modifier une Leçon */}
      {lessonModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_25px_70px_rgba(15,23,42,0.25)] relative max-h-[92vh] overflow-y-auto"
          >
            <button
              onClick={() => setLessonModal(null)}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* En-tête */}
            <div className="flex items-center gap-3.5 mb-6 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {lessonModal.lesson ? 'Modifier la leçon' : 'Ajouter une leçon'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publiez une vidéo de cours, un support PDF ou planifiez une séance.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Titre de la leçon
                </label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="ex: Leçon 1 : Définition et domaines de définition"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#5c6be0] focus:ring-4 focus:ring-[#5c6be0]/10 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Type de ressource
                </label>
                <select
                  value={lessonType}
                  onChange={(e) => setLessonType(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-sm text-slate-900 focus:outline-none focus:border-[#5c6be0] shadow-2xs"
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Lien YouTube
                  </label>
                  <input
                    type="url"
                    required
                    value={lessonYoutube}
                    onChange={(e) => setLessonYoutube(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#5c6be0] focus:ring-4 focus:ring-[#5c6be0]/10 transition shadow-2xs"
                  />
                </div>
              )}

              {lessonType === 'meet' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Lien Google Meet
                  </label>
                  <input
                    type="url"
                    required
                    value={lessonMeet}
                    onChange={(e) => setLessonMeet(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#5c6be0] focus:ring-4 focus:ring-[#5c6be0]/10 transition shadow-2xs"
                  />
                </div>
              )}

              {lessonType === 'text' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contenu rédigé / Cours
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    placeholder="Rédigez le contenu de la leçon ou les consignes..."
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#5c6be0] focus:ring-4 focus:ring-[#5c6be0]/10 transition shadow-2xs resize-y"
                  />
                </div>
              )}

              {lessonType === 'pdf' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Fichier PDF {lessonModal.lesson ? '(optionnel si inchangé)' : '(requis)'}
                  </label>
                  <label className="flex items-center gap-2 px-3 h-11 bg-slate-50/70 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 rounded-xl cursor-pointer transition shadow-2xs">
                    <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate text-xs font-semibold text-slate-600">
                      {lessonPdf ? lessonPdf.name : 'Sélectionner le document PDF...'}
                    </span>
                    <input
                      type="file"
                      required={!lessonModal.lesson}
                      accept="application/pdf"
                      onChange={(e) => setLessonPdf(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div>
                  <span className="text-sm font-bold text-emerald-950 block">Leçon gratuite (Freemium)</span>
                  <span className="text-xs text-emerald-700/80">Accessible en libre accès pour faire découvrir le cours</span>
                </div>
                <input
                  type="checkbox"
                  checked={lessonIsFree}
                  onChange={(e) => setLessonIsFree(e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLessonModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingLesson}
                  className="px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold transition shadow-md shadow-blue-600/25 hover:shadow-lg disabled:opacity-60 cursor-pointer"
                >
                  {savingLesson ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </motion.div>
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

      <TeacherHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        activities={teacherActivities}
        formatDateShort={formatDateShort}
      />

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
