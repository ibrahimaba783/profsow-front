import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import {
  Plus,
  BookOpen,
  Users,
  BarChart3,
  Trash2,
  Edit,
  ExternalLink,
  ShieldCheck,
  X,
  Layers,
  GraduationCap,
  Clock,
  Sparkles,
  Award,
  Video,
  Share2,
  Copy,
  Check,
  Search,
  Mail,
  Calendar,
  LogOut,
  ChevronRight,
  Gift,
  QrCode,
  Menu,
  Sliders,
  Bell,
  MessageCircle,
  FileText,
  Palette,
  CheckCircle2,
  Save,
  HelpCircle,
  Globe,
  Star,
  Eye,
  EyeOff,
  Lock,
  UserCheck,
  UserPlus,
  ArrowUpDown,
  CreditCard,
  DollarSign,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import profPhoto from '../assets/prof-aliou-sow.jpg';

const TeacherDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Mode de prévisualisation "Voir en tant que professeur" pour l'administrateur
  const [previewAsTeacher, setPreviewAsTeacher] = useState(false);
  const [simulatedTeacherId, setSimulatedTeacherId] = useState(null);

  // Rôles effectifs
  const isActualAdmin = user?.role === 'admin';
  const isEffectiveAdmin = isActualAdmin && !previewAsTeacher;
  const isEffectiveTeacher = user?.role === 'teacher' || (isActualAdmin && previewAsTeacher);

  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');

  // Navigation par onglets
  const [activeTab, setActiveTab] = useState(urlTab || 'overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  // Données principales
  const [courses, setCourses] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtre utilisateurs & recherche
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('student');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState('');

  // État du modal de cours (Création / Modification)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Mathématiques');
  const [level, setLevel] = useState('TS');
  const [duration, setDuration] = useState('1 an');
  const [price, setPrice] = useState(6000);
  const [isFree, setIsFree] = useState(false);
  const [originalPrice, setOriginalPrice] = useState(6000);
  const [assignedTeacherId, setAssignedTeacherId] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtre de cours par prof (vue admin)
  const [courseTeacherFilter, setCourseTeacherFilter] = useState('all');

  // Recherche d'élèves
  const [studentSearch, setStudentSearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Statistiques financières (Admin)
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    freeSubscriptions: 0,
  });

  // Paramètres de la plateforme (No-Code Hub)
  const [platformSettings, setPlatformSettings] = useState({
    theme: 'bakeli',
    features: {
      enableLiveMeet: true,
      enableQuiz: true,
      enableForum: true,
      enablePdfDownload: true,
      enableWhatsAppButton: true,
      enableFreeEnrollment: true,
      enableOpenRegistration: true,
      showAnnouncementBanner: false,
    },
    announcement: {
      active: false,
      message: 'Séance de révision en direct ce vendredi à 18h sur Google Meet !',
      type: 'info',
      link: '',
      buttonText: 'Rejoindre le direct',
    },
    channels: {
      whatsappNumber: '+221771023399',
      globalMeetLink: 'https://meet.google.com/new',
      youtubeUrl: 'https://youtube.com/@dermannaltv4340?si=Jk86Ads8TMVEx6vv',
    },
    faqs: [
      {
        question: 'Comment fonctionne Aliou Sow Academy ?',
        answer: 'Inscrivez-vous en 30 secondes et accédez aux cours, vidéos, fiches PDF et séances Meet.',
      },
    ],
    testimonials: [
      {
        name: 'Fatou Diagne',
        level: 'Terminale S',
        quote: "Grâce aux cours de M. Sow, j'ai eu 16/20 en maths au Baccalauréat !",
        rating: 5,
      },
    ],
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [newTestimonialName, setNewTestimonialName] = useState('');
  const [newTestimonialLevel, setNewTestimonialLevel] = useState('Terminale S');
  const [newTestimonialQuote, setNewTestimonialQuote] = useState('');

  const registerUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/register`
    : 'https://profsow-front.vercel.app/register';

  useEffect(() => {
    // Rediriger les élèves non autorisés
    if (user && user.role === 'student') {
      navigate('/student-dashboard');
      return;
    }
    fetchDashboardData();
  }, [user, previewAsTeacher]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Récupération des cours (filtrés par le serveur selon le rôle)
      const coursesData = await api('/courses/manage').catch(() => []);
      setCourses(coursesData);

      // 2. Récupération des profs (pour la liste d'assignation)
      const teachersData = await api('/auth/teachers').catch(() => []);
      setTeachersList(teachersData);

      // 3. Récupération des élèves & abonnements
      if (isEffectiveAdmin) {
        // Mode Administrateur : données complètes
        const [subsData, usersData, remoteSettings] = await Promise.all([
          api('/subscriptions/admin/all').catch(() => ({ stats: {}, subscriptions: [] })),
          api('/auth/users').catch(() => []),
          api('/settings').catch(() => null),
        ]);

        if (subsData.subscriptions) {
          setSubscriptions(subsData.subscriptions);
          setFinancialStats(subsData.stats || {});
        }
        setAllUsers(usersData);

        if (remoteSettings) {
          setPlatformSettings((prev) => ({
            ...prev,
            ...remoteSettings,
            features: { ...prev.features, ...remoteSettings.features },
            announcement: { ...prev.announcement, ...remoteSettings.announcement },
            channels: { ...prev.channels, ...remoteSettings.channels },
            faqs: remoteSettings.faqs?.length ? remoteSettings.faqs : prev.faqs,
            testimonials: remoteSettings.testimonials?.length ? remoteSettings.testimonials : prev.testimonials,
          }));
        }
      } else {
        // Mode Enseignant : uniquement ses élèves inscrits (sans montants)
        const enrolledStudents = await api('/subscriptions/teacher/students').catch(() => []);
        setAllStudents(enrolledStudents);
      }

      // Quiz & Évaluations
      const scores = await api('/quizzes/teacher/results').catch(() => []);
      setQuizResults(scores);
    } catch (err) {
      console.error('Erreur chargement dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // ACTIONS GESTION DES MODULES (ADMIN & PROF ASSIGNÉ)
  // =========================================================================
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubject('Mathématiques');
    setLevel('TS');
    setDuration('1 an');
    setPrice(6000);
    setIsFree(false);
    setOriginalPrice(6000);
    setAssignedTeacherId(user?._id || '');
    setImageFile(null);
    setErrorMsg('');
    setEditingCourse(null);
  };

  const openCreateModal = () => {
    if (!isEffectiveAdmin) {
      alert("Seul un administrateur peut créer de nouveaux modules.");
      return;
    }
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setTitle(course.title || '');
    setDescription(course.description || '');
    setSubject(course.subject || 'Mathématiques');
    setLevel(course.level || 'TS');
    setDuration(course.duration || '1 an');
    setPrice(course.price || 6000);
    setIsFree(course.isFree || false);
    setOriginalPrice(course.originalPrice || course.price || 6000);
    setAssignedTeacherId(course.teacher?._id || course.teacher || user?._id || '');
    setImageFile(null);
    setErrorMsg('');
    setShowCreateModal(true);
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

    if (isFree) {
      formData.append('originalPrice', originalPrice);
    }
    if (isEffectiveAdmin && assignedTeacherId) {
      formData.append('teacher', assignedTeacherId);
    }
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editingCourse) {
        await api(`/courses/${editingCourse._id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        await api('/courses', {
          method: 'POST',
          body: formData,
        });
      }

      resetForm();
      setShowCreateModal(false);
      await fetchDashboardData();
    } catch (err) {
      setErrorMsg(err.message || "Erreur lors de l'enregistrement du module");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!isEffectiveAdmin) {
      alert("Action refusée : Seul un administrateur peut supprimer un module.");
      return;
    }
    if (!window.confirm('Voulez-vous vraiment supprimer définitivement ce module ?')) return;
    try {
      await api(`/courses/${id}`, { method: 'DELETE' });
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleToggleCourseStatus = async (id, currentStatus) => {
    if (!isEffectiveAdmin) return;
    try {
      await api(`/courses/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      setCourses((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isActive: !currentStatus } : c))
      );
    } catch (err) {
      alert(err.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const handleAssignTeacher = async (courseId, newTeacherId) => {
    if (!isEffectiveAdmin) return;
    try {
      const updated = await api(`/courses/${courseId}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ teacherId: newTeacherId }),
      });
      setCourses((prev) =>
        prev.map((c) => (c._id === courseId ? { ...c, teacher: updated.teacher } : c))
      );
    } catch (err) {
      alert(err.message || "Erreur lors de l'assignation");
    }
  };

  const handleMoveCourse = async (index, direction) => {
    if (!isEffectiveAdmin) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= courses.length) return;

    const newCourses = [...courses];
    const temp = newCourses[index];
    newCourses[index] = newCourses[targetIndex];
    newCourses[targetIndex] = temp;

    setCourses(newCourses);

    const orderList = newCourses.map((c, idx) => ({ id: c._id, order: idx }));
    try {
      await api('/courses/reorder', {
        method: 'PUT',
        body: JSON.stringify({ orderList }),
      });
    } catch (err) {
      console.error('Erreur réordonnancement', err);
    }
  };

  // =========================================================================
  // ACTIONS GESTION DES UTILISATEURS (ADMIN SEULEMENT)
  // =========================================================================
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    setCreateUserError('');

    try {
      await api('/auth/users', {
        method: 'POST',
        body: JSON.stringify({
          name: newUserName.trim(),
          email: newUserEmail.trim(),
          password: newUserPassword,
          role: newUserRole,
        }),
      });

      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('student');
      setShowCreateUserModal(false);
      await fetchDashboardData();
    } catch (err) {
      setCreateUserError(err.message || "Erreur lors de la création de l'utilisateur");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleChangeUserRole = async (userId, newRole) => {
    if (!isEffectiveAdmin) return;
    try {
      await api(`/auth/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });
      setAllUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      // Mettre à jour la liste des profs si nécessaire
      const updatedTeachers = await api('/auth/teachers').catch(() => []);
      setTeachersList(updatedTeachers);
    } catch (err) {
      alert(err.message || 'Erreur lors du changement de rôle');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!isEffectiveAdmin) return;
    if (userId === user?._id) {
      alert('Vous ne pouvez pas supprimer votre propre compte administrateur.');
      return;
    }
    if (!window.confirm(`Supprimer définitivement le compte de ${userName} ?`)) return;

    try {
      await api(`/auth/users/${userId}`, { method: 'DELETE' });
      setAllUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  // =========================================================================
  // ACTIONS ABONNEMENTS & PAIEMENTS (ADMIN SEULEMENT)
  // =========================================================================
  const handleUpdateSubscriptionStatus = async (subId, status, extendMonths = 0) => {
    if (!isEffectiveAdmin) return;
    try {
      const updated = await api(`/subscriptions/admin/${subId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, extendMonths }),
      });
      setSubscriptions((prev) =>
        prev.map((s) => (s._id === subId ? { ...s, ...updated } : s))
      );
    } catch (err) {
      alert(err.message || "Erreur lors de la mise à jour de l'abonnement");
    }
  };

  // =========================================================================
  // ACTIONS PARAMÈTRES SANS CODER (ADMIN SEULEMENT)
  // =========================================================================
  const handleSaveSettings = async (updated) => {
    if (!isEffectiveAdmin) {
      alert("Seul un administrateur peut modifier les paramètres.");
      return;
    }
    setSavingSettings(true);
    setSaveSuccessMsg('');
    const toSave = updated || platformSettings;
    try {
      await api('/settings', {
        method: 'PUT',
        body: JSON.stringify(toSave),
      });
      setPlatformSettings(toSave);
      setSaveSuccessMsg('Modifications enregistrées avec succès sans code !');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      setPlatformSettings(toSave);
      setSaveSuccessMsg('Paramètres appliqués localement !');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleFeature = (featureKey) => {
    const updated = {
      ...platformSettings,
      features: {
        ...platformSettings.features,
        [featureKey]: !platformSettings.features[featureKey],
      },
    };
    handleSaveSettings(updated);
  };

  const handleAddFaq = (e) => {
    e.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    const updatedFaqs = [
      ...platformSettings.faqs,
      { question: newFaqQuestion.trim(), answer: newFaqAnswer.trim() },
    ];
    setNewFaqQuestion('');
    setNewFaqAnswer('');
    handleSaveSettings({ ...platformSettings, faqs: updatedFaqs });
  };

  const handleDeleteFaq = (index) => {
    const updatedFaqs = platformSettings.faqs.filter((_, i) => i !== index);
    handleSaveSettings({ ...platformSettings, faqs: updatedFaqs });
  };

  const handleAddTestimonial = (e) => {
    e.preventDefault();
    if (!newTestimonialName.trim() || !newTestimonialQuote.trim()) return;
    const updatedTestimonials = [
      ...platformSettings.testimonials,
      {
        name: newTestimonialName.trim(),
        level: newTestimonialLevel,
        quote: newTestimonialQuote.trim(),
        rating: 5,
      },
    ];
    setNewTestimonialName('');
    setNewTestimonialQuote('');
    handleSaveSettings({ ...platformSettings, testimonials: updatedTestimonials });
  };

  const handleDeleteTestimonial = (index) => {
    const updated = {
      ...platformSettings,
      testimonials: platformSettings.testimonials.filter((_, i) => i !== index),
    };
    handleSaveSettings(updated);
  };

  const handleCopyRegisterLink = () => {
    navigator.clipboard.writeText(registerUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Thème dynamique
  const sidebarGradients = {
    bakeli: 'bg-gradient-to-b from-[#00796b] via-[#00897b] to-[#004d40]',
    gradient: 'bg-gradient-to-b from-[#f43f5e] via-[#a855f7] to-[#6366f1]',
    navy: 'bg-gradient-to-b from-[#0b1f49] via-[#1d3a8a] to-[#0f172a]',
    dark: 'bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#020617]',
  };
  const currentSidebarGradient = sidebarGradients[platformSettings.theme] || sidebarGradients.bakeli;

  // Calculs & Filtrages
  const totalCoursesCount = courses.length;
  const filteredUsers = allUsers.filter((u) => {
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchSearch =
      !userSearch.trim() ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    return matchRole && matchSearch;
  });

  const displayedCourses = isEffectiveAdmin
    ? courseTeacherFilter === 'all'
      ? courses
      : courses.filter((c) => c.teacher?._id === courseTeacherFilter)
    : courses;

  // Menu de navigation adapté selon le rôle
  const adminNavItems = [
    { id: 'overview', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'courses', label: 'Gestion des Modules', icon: BookOpen, badge: totalCoursesCount },
    { id: 'subscriptions', label: 'Abonnements & Paiements', icon: CreditCard, badge: subscriptions.length },
    { id: 'users', label: 'Gestion des Utilisateurs', icon: Users, badge: allUsers.length },
    { id: 'live', label: 'Séances en Direct', icon: Video },
    { id: 'nocode', label: 'Gestion Sans Coder', icon: Sliders, special: true },
  ];

  const teacherNavItems = [
    { id: 'overview', label: 'Mon Espace Enseignant', icon: BarChart3 },
    { id: 'courses', label: 'Mes Modules Assignés', icon: BookOpen, badge: totalCoursesCount },
    { id: 'students', label: 'Mes Élèves', icon: Users, badge: allStudents.length },
    { id: 'live', label: 'Séances en Direct', icon: Video },
  ];

  const navItems = isEffectiveAdmin ? adminNavItems : teacherNavItems;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#00897b] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex flex-col lg:flex-row antialiased text-slate-800">
      {/* ============================================================== */}
      {/* BARRE LATÉRALE GAUCHE RBAC */}
      {/* ============================================================== */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-72 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-72'
        } p-3 shrink-0 flex flex-col`}
      >
        <div
          className={`h-full rounded-3xl ${currentSidebarGradient} text-white flex flex-col shadow-2xl p-5 relative overflow-hidden transition-all duration-500`}
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none"></div>

          {/* En-tête Sidebar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/15 relative z-10">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#00897b] flex items-center justify-center font-black shadow-md text-base">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <span className="block font-black text-sm tracking-wider uppercase">PROFSOW</span>
                <span className="block text-[10px] font-bold text-white/80">
                  {isEffectiveAdmin ? 'Back Office Admin' : 'Espace Enseignant'}
                </span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg bg-white/10 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Badge Rôle Actuel */}
          <div className="mt-3 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isEffectiveAdmin ? 'bg-emerald-400 animate-pulse' : 'bg-amber-300'
                }`}
              ></span>
              {isEffectiveAdmin ? 'Rôle Administrateur' : 'Rôle Enseignant'}
            </span>
            <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-md font-bold uppercase">
              {isEffectiveAdmin ? 'Plein Accès' : 'Restreint'}
            </span>
          </div>

          {/* Navigation selon le rôle */}
          <nav className="mt-4 space-y-1.5 flex-1 overflow-y-auto pr-1 relative z-10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-lg scale-[1.02]'
                      : 'text-white/90 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#ff9800]' : 'text-white'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        isActive ? 'bg-orange-100 text-[#ff9800]' : 'bg-white/20 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.special && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#ff9800] text-white font-extrabold">
                      NO-CODE
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bas de Sidebar */}
          <div className="pt-3 border-t border-white/15 relative z-10 space-y-2">
            <Link
              to="/"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-white/80" />
                Voir le site public
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            <div className="flex items-center gap-3 p-2 rounded-2xl bg-black/20">
              <img
                src={user?.avatar || profPhoto}
                alt={user?.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate">{user?.name}</p>
                <p className="text-[10px] text-white/70 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Se déconnecter"
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* CONTENU PRINCIPAL */}
      {/* ============================================================== */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* ============================================================== */}
        {/* BANNIÈRE MODE PRÉVISUALISATION (SI ACTIVÉ PAR L'ADMIN) */}
        {/* ============================================================== */}
        {previewAsTeacher && (
          <div className="bg-amber-400 text-amber-950 px-6 py-2.5 text-xs font-black flex items-center justify-between shadow-md border-b border-amber-500">
            <div className="flex items-center gap-2.5">
              <Eye className="w-4 h-4 shrink-0 text-amber-900" />
              <span>
                MODE PRÉVISUALISATION PROFESSEUR ACTIF — Vous testez actuellement l'interface restreinte telle qu'un enseignant la voit. Les sections Abonnements, Utilisateurs et Paramètres sont verrouillées.
              </span>
            </div>
            <button
              onClick={() => setPreviewAsTeacher(false)}
              className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-900 rounded-lg text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
            >
              Quitter la prévisualisation &rarr;
            </button>
          </div>
        )}

        {/* Barre du haut */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span>{isEffectiveAdmin ? 'Espace Administrateur' : 'Espace Enseignant'}</span>
                <span>/</span>
                <span className="text-[#00897b] font-bold capitalize">
                  {navItems.find((n) => n.id === activeTab)?.label || 'Tableau de bord'}
                </span>
              </div>
              <h1 className="text-lg md:text-xl font-black text-slate-900 mt-0.5">
                {activeTab === 'overview' && (isEffectiveAdmin ? 'Tableau de Bord Global' : 'Mon Tableau de Bord Enseignant')}
                {activeTab === 'courses' && (isEffectiveAdmin ? 'Gestion des Modules & Formations' : 'Mes Modules Assignés')}
                {activeTab === 'students' && 'Mes Élèves Inscrits'}
                {activeTab === 'subscriptions' && 'Abonnements & Transactions (Paiements)'}
                {activeTab === 'users' && 'Gestion des Utilisateurs & Rôles (RBAC)'}
                {activeTab === 'live' && 'Séances en Direct (Google Meet)'}
                {activeTab === 'nocode' && 'Gestionnaire de Fonctionnalités & Contenus (Sans Coder)'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* FONCTION "VOIR EN TANT QUE PROFESSEUR" POUR L'ADMIN */}
            {isActualAdmin && (
              <button
                onClick={() => setPreviewAsTeacher(!previewAsTeacher)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition shadow-sm cursor-pointer ${
                  previewAsTeacher
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
                title="Tester l'interface en tant qu'enseignant"
              >
                {previewAsTeacher ? <EyeOff className="w-4 h-4 text-amber-700" /> : <Eye className="w-4 h-4" />}
                <span>{previewAsTeacher ? 'Quitter Vue Prof' : 'Voir en tant que Prof'}</span>
              </button>
            )}

            {/* Bouton Nouveau Module réservé à l'Admin */}
            {isEffectiveAdmin && (
              <button
                onClick={openCreateModal}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#ff9800] hover:bg-[#f57c00] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Nouveau Module
              </button>
            )}
          </div>
        </header>

        {/* ============================================================== */}
        {/* ÉCRAN D'ACCÈS REFUSÉ EN CAS DE TENTATIVE D'ACCÈS ILLICITE */}
        {/* ============================================================== */}
        {isEffectiveTeacher && (activeTab === 'subscriptions' || activeTab === 'users' || activeTab === 'nocode') && (
          <div className="p-8 my-12 max-w-lg mx-auto bg-white rounded-3xl border border-red-200 shadow-md text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Accès Refusé</h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Cette section est strictement réservée aux administrateurs de la plateforme. En tant qu'enseignant, vous avez accès uniquement à vos modules assignés et à vos élèves.
            </p>
            <button
              onClick={() => setActiveTab('overview')}
              className="px-6 py-2.5 rounded-full bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-bold transition shadow"
            >
              Retourner à mon tableau de bord
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* VUE 1 : TABLEAU DE BORD (OVERVIEW) */}
        {/* ============================================================== */}
        {activeTab === 'overview' && (
          <div className="p-6 md:p-8 space-y-8 max-w-7xl">
            {/* VUE OVERVIEW : ADMIN */}
            {isEffectiveAdmin ? (
              <>
                {/* 6 KPI Cards vibrants pour l'Admin */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <div className="p-5 rounded-3xl bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                    <p className="text-xs font-bold text-blue-100">Total Utilisateurs</p>
                    <h3 className="text-3xl font-black mt-2">{allUsers.length}</h3>
                    <p className="text-[11px] text-blue-100 mt-1">Élèves & Enseignants</p>
                  </div>

                  <div className="p-5 rounded-3xl bg-purple-600 text-white shadow-lg shadow-purple-600/20">
                    <p className="text-xs font-bold text-purple-100">Total Modules</p>
                    <h3 className="text-3xl font-black mt-2">{totalCoursesCount}</h3>
                    <p className="text-[11px] text-purple-100 mt-1">Formations créées</p>
                  </div>

                  <div className="p-5 rounded-3xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                    <p className="text-xs font-bold text-emerald-100">Revenus Totaux</p>
                    <h3 className="text-2xl font-black mt-2">
                      {financialStats.totalRevenue?.toLocaleString() || '0'} <span className="text-xs font-normal">FCFA</span>
                    </h3>
                    <p className="text-[11px] text-emerald-100 mt-1">Paiements validés</p>
                  </div>

                  <div className="p-5 rounded-3xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                    <p className="text-xs font-bold text-orange-100">Abonnements Actifs</p>
                    <h3 className="text-3xl font-black mt-2">{financialStats.activeSubscriptions || subscriptions.length}</h3>
                    <p className="text-[11px] text-orange-100 mt-1">Accès en cours</p>
                  </div>

                  <div className="p-5 rounded-3xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
                    <p className="text-xs font-bold text-teal-100">Professeurs</p>
                    <h3 className="text-3xl font-black mt-2">{teachersList.length}</h3>
                    <p className="text-[11px] text-teal-100 mt-1">Comptes enseignants</p>
                  </div>

                  <div className="p-5 rounded-3xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                    <p className="text-xs font-bold text-amber-100">Offres Gratuites</p>
                    <h3 className="text-3xl font-black mt-2">{courses.filter((c) => c.isFree).length}</h3>
                    <p className="text-[11px] text-amber-100 mt-1">Modules promotionnels</p>
                  </div>
                </div>

                {/* Liens rapides Admin */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    onClick={() => setActiveTab('users')}
                    className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">Gérer les Utilisateurs</h4>
                      <p className="text-xs text-slate-500 mt-1">Créer un compte prof, changer les rôles, gérer les élèves</p>
                    </div>
                    <span className="w-10 h-10 rounded-2xl bg-teal-50 text-[#00897b] flex items-center justify-center font-bold">
                      &rarr;
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveTab('courses')}
                    className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">Gérer & Assigner les Modules</h4>
                      <p className="text-xs text-slate-500 mt-1">Assigner un module à un prof, réordonner, activer</p>
                    </div>
                    <span className="w-10 h-10 rounded-2xl bg-orange-50 text-[#ff9800] flex items-center justify-center font-bold">
                      &rarr;
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveTab('subscriptions')}
                    className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">Abonnements & Revenus</h4>
                      <p className="text-xs text-slate-500 mt-1">Détails des transactions, plans et prolongations</p>
                    </div>
                    <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      &rarr;
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* VUE OVERVIEW : ENSEIGNANT */
              <>
                <div className="bg-gradient-to-r from-[#00897b] to-teal-700 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                      Espace Formateur
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black mt-3">
                      Bienvenue, M. {user?.name || 'Professeur'}
                    </h2>
                    <p className="text-xs sm:text-sm text-teal-100 max-w-xl mt-2 leading-relaxed">
                      Voici votre espace dédié pour animer vos cours, enrichir le contenu de vos modules assignés (vidéos, devoirs PDF corrigés, séances Meet) et suivre la réussite de vos élèves.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('courses')}
                    className="px-6 py-3 rounded-full bg-white text-[#00897b] hover:bg-teal-50 font-black text-xs shadow-md transition shrink-0 cursor-pointer"
                  >
                    Accéder à mes modules &rarr;
                  </button>
                </div>

                {/* 4 KPIs Enseignant */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-500">Mes Modules Assignés</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2">{courses.length}</h3>
                    <p className="text-[11px] text-[#00897b] font-semibold mt-1">Gérés par vous</p>
                  </div>

                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-500">Mes Élèves Inscrits</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2">{allStudents.length}</h3>
                    <p className="text-[11px] text-teal-600 font-semibold mt-1">Inscrits à vos cours</p>
                  </div>

                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-500">Mes Leçons & Contenus</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2">
                      {courses.reduce(
                        (sum, c) =>
                          sum +
                          (c.chapters || []).reduce((chSum, ch) => chSum + (ch.lessons?.length || 0), 0),
                        0
                      )}
                    </h3>
                    <p className="text-[11px] text-orange-600 font-semibold mt-1">Vidéos, PDF et séances</p>
                  </div>

                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-500">Séances Google Meet</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2">En Direct</h3>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">Disponibles en 1 clic</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VUE 2 : GESTION DES MODULES (ADMIN & ENSEIGNANT) */}
        {/* ============================================================== */}
        {activeTab === 'courses' && (
          <div className="p-6 md:p-8 space-y-6 max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {isEffectiveAdmin ? 'Catalogue Général des Modules' : 'Mes Modules Assignés'}
                </h2>
                <p className="text-slate-500 text-xs">
                  {isEffectiveAdmin
                    ? 'Gérez tous les cours, assignez-les aux professeurs et activez/désactivez leur publication.'
                    : 'Consultez et enrichissez le contenu (chapitres, leçons, devoirs PDF, Meet) des modules qui vous sont assignés.'}
                </p>
              </div>

              {isEffectiveAdmin && (
                <div className="flex items-center gap-3">
                  <select
                    value={courseTeacherFilter}
                    onChange={(e) => setCourseTeacherFilter(e.target.value)}
                    className="h-10 px-4 rounded-full border border-slate-300 bg-white text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="all">Tous les professeurs</option>
                    {teachersList.map((t) => (
                      <option key={t._id} value={t._id}>
                        Prof : {t.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={openCreateModal}
                    className="px-6 py-2.5 rounded-full bg-[#ff9800] hover:bg-[#f57c00] text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    Créer un module
                  </button>
                </div>
              )}
            </div>

            {displayedCourses.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-base">
                  {isEffectiveAdmin ? 'Aucun module trouvé' : 'Aucun module ne vous est actuellement assigné'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isEffectiveAdmin
                    ? 'Cliquez sur "Créer un module" pour publier le premier cours.'
                    : "L'administrateur vous assignera vos modules de cours prochainement."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedCourses.map((course, idx) => (
                  <div
                    key={course._id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Image & Badges */}
                      <div className="relative aspect-video bg-slate-100 overflow-hidden">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover hover:scale-105 transition duration-500"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-black/60 text-white backdrop-blur-md">
                            {course.subject}
                          </span>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#00897b] text-white">
                            {course.level}
                          </span>
                        </div>

                        {course.isFree ? (
                          <span className="absolute top-3 right-3 text-[10px] font-extrabold px-3 py-1 rounded-md bg-emerald-500 text-white shadow">
                            GRATUIT
                          </span>
                        ) : (
                          <span className="absolute top-3 right-3 text-[10px] font-extrabold px-3 py-1 rounded-md bg-slate-900/80 text-white backdrop-blur-sm">
                            {course.price ? `${course.price.toLocaleString()} FCFA` : '6 000 FCFA'}
                          </span>
                        )}

                        {/* Statut Actif/Inactif */}
                        <div className="absolute bottom-3 left-3">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                              course.isActive !== false
                                ? 'bg-emerald-600/90 text-white'
                                : 'bg-red-600/90 text-white'
                            }`}
                          >
                            {course.isActive !== false ? '● En ligne' : '○ Masqué'}
                          </span>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="font-black text-base text-slate-900 line-clamp-1">
                          {course.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                          {course.description}
                        </p>

                        {/* Professeur assigné */}
                        <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-semibold">Professeur :</span>
                          {isEffectiveAdmin ? (
                            <select
                              value={course.teacher?._id || course.teacher || ''}
                              onChange={(e) => handleAssignTeacher(course._id, e.target.value)}
                              className="text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none"
                            >
                              {teachersList.map((t) => (
                                <option key={t._id} value={t._id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="font-bold text-[#00897b]">
                              {course.teacher?.name || 'M. Aliou Sow'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {course.duration || '1 an'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            {(course.chapters || []).length} chapitres
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions sur le module */}
                    <div className="p-5 pt-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/courses/${course._id}`}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#00897b] text-xs font-bold transition text-center flex items-center justify-center gap-1.5"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          Gérer le contenu
                        </Link>

                        <button
                          onClick={() => handleEditCourse(course)}
                          title="Modifier les infos"
                          className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Suppression uniquement pour l'administrateur */}
                        {isEffectiveAdmin && (
                          <button
                            onClick={() => handleDeleteCourse(course._id)}
                            title="Supprimer définitivement"
                            className="p-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Contrôles d'ordre et de statut pour l'Admin */}
                      {isEffectiveAdmin && (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                          <button
                            onClick={() => handleToggleCourseStatus(course._id, course.isActive !== false)}
                            className={`font-bold transition cursor-pointer ${
                              course.isActive !== false ? 'text-red-500 hover:underline' : 'text-emerald-600 hover:underline'
                            }`}
                          >
                            {course.isActive !== false ? 'Désactiver' : 'Activer'}
                          </button>

                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">Ordre :</span>
                            <button
                              onClick={() => handleMoveCourse(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveCourse(idx, 'down')}
                              disabled={idx === displayedCourses.length - 1}
                              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VUE 3 : GESTION DES UTILISATEURS & RÔLES (ADMIN SEULEMENT) */}
        {/* ============================================================== */}
        {isEffectiveAdmin && activeTab === 'users' && (
          <div className="p-6 md:p-8 space-y-6 max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Gestion des Utilisateurs & Rôles</h2>
                <p className="text-slate-500 text-xs">
                  Administrez tous les comptes élèves, enseignants et administrateurs de l'académie.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="px-5 py-2.5 rounded-full bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow"
                >
                  <UserPlus className="w-4 h-4" />
                  Ajouter un utilisateur
                </button>
              </div>
            </div>

            {/* Filtres par Rôle & Barre de recherche */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: `Tous (${allUsers.length})` },
                  { id: 'student', label: `Élèves (${allUsers.filter((u) => u.role === 'student').length})` },
                  { id: 'teacher', label: `Professeurs (${allUsers.filter((u) => u.role === 'teacher').length})` },
                  { id: 'admin', label: `Admins (${allUsers.filter((u) => u.role === 'admin').length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setUserRoleFilter(f.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                      userRoleFilter === f.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher nom ou email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00897b]"
                />
              </div>
            </div>

            {/* Table des utilisateurs */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-4 px-6">Utilisateur</th>
                      <th className="py-4 px-6">Email</th>
                      <th className="py-4 px-6">Rôle Actuel</th>
                      <th className="py-4 px-6">Date de création</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-10 text-center text-slate-400">
                          Aucun utilisateur trouvé
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
                                alt={u.name}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                              />
                              <div>
                                <span className="font-bold text-slate-900 block">{u.name}</span>
                                {u._id === user?._id && (
                                  <span className="text-[10px] text-teal-600 font-bold">(Votre compte)</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-600 font-medium">{u.email}</td>
                          <td className="py-4 px-6">
                            <select
                              value={u.role}
                              onChange={(e) => handleChangeUserRole(u._id, e.target.value)}
                              disabled={u._id === user?._id}
                              className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition cursor-pointer ${
                                u.role === 'admin'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : u.role === 'teacher'
                                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              <option value="student">Élève</option>
                              <option value="teacher">Professeur</option>
                              <option value="admin">Administrateur</option>
                            </select>
                          </td>
                          <td className="py-4 px-6 text-slate-500">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '-'}
                          </td>
                          <td className="py-4 px-6 text-right">
                            {u._id !== user?._id && (
                              <button
                                onClick={() => handleDeleteUser(u._id, u.name)}
                                title="Supprimer ce compte"
                                className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VUE 4 : ABONNEMENTS & TRANSACTIONS (ADMIN SEULEMENT) */}
        {/* ============================================================== */}
        {isEffectiveAdmin && activeTab === 'subscriptions' && (
          <div className="p-6 md:p-8 space-y-6 max-w-7xl">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Abonnements & Suivi des Paiements</h2>
              <p className="text-slate-500 text-xs">
                Contrôlez les statuts des abonnements, les méthodes de paiement et renouvelez les accès.
              </p>
            </div>

            {/* Statistiques financières */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-slate-400 text-xs font-semibold">Total Revenus</span>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">
                  {financialStats.totalRevenue?.toLocaleString()} FCFA
                </h3>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-slate-400 text-xs font-semibold">Total Abonnements</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {financialStats.totalSubscriptions || subscriptions.length}
                </h3>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-slate-400 text-xs font-semibold">Abonnements Actifs</span>
                <h3 className="text-2xl font-black text-[#00897b] mt-1">
                  {financialStats.activeSubscriptions || 0}
                </h3>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-slate-400 text-xs font-semibold">Offres Gratuites</span>
                <h3 className="text-2xl font-black text-orange-500 mt-1">
                  {financialStats.freeSubscriptions || 0}
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-4 px-6">Élève</th>
                      <th className="py-4 px-6">Module</th>
                      <th className="py-4 px-6">Montant</th>
                      <th className="py-4 px-6">Méthode</th>
                      <th className="py-4 px-6">Statut</th>
                      <th className="py-4 px-6">Expiration</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscriptions.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-10 text-center text-slate-400">
                          Aucun abonnement enregistré
                        </td>
                      </tr>
                    ) : (
                      subscriptions.map((sub) => (
                        <tr key={sub._id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-6">
                            <span className="font-bold text-slate-900 block">{sub.student?.name || 'Élève'}</span>
                            <span className="text-[11px] text-slate-400">{sub.student?.email}</span>
                          </td>
                          <td className="py-4 px-6 text-slate-700 font-medium">
                            {sub.course?.title || 'Module'}
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-900">
                            {sub.amount === 0 ? 'Gratuit (Promo)' : `${sub.amount?.toLocaleString()} FCFA`}
                          </td>
                          <td className="py-4 px-6 text-slate-600">{sub.paymentMethod || 'Wave'}</td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                sub.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {sub.status === 'active' ? 'Actif' : sub.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-500">
                            {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString('fr-FR') : '-'}
                          </td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <button
                              onClick={() => handleUpdateSubscriptionStatus(sub._id, 'active', 12)}
                              title="Prolonger de 1 an"
                              className="px-2.5 py-1 rounded-lg border border-teal-200 text-teal-700 hover:bg-teal-50 text-[11px] font-bold transition cursor-pointer"
                            >
                              +1 an
                            </button>
                            {sub.status === 'active' ? (
                              <button
                                onClick={() => handleUpdateSubscriptionStatus(sub._id, 'cancelled')}
                                title="Suspendre l'accès"
                                className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold transition cursor-pointer"
                              >
                                Suspendre
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateSubscriptionStatus(sub._id, 'active')}
                                title="Réactiver l'accès"
                                className="px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-[11px] font-bold transition cursor-pointer"
                              >
                                Activer
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VUE 5 : MES ÉLÈVES (VUE ENSEIGNANT RESTREINTE) */}
        {/* ============================================================== */}
        {!isEffectiveAdmin && activeTab === 'students' && (
          <div className="p-6 md:p-8 space-y-6 max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Mes Élèves Inscrits</h2>
                <p className="text-slate-500 text-xs">
                  Consultez la liste des élèves suivant vos modules assignés.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher un élève..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00897b]"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-4 px-6">Élève</th>
                      <th className="py-4 px-6">Module Suivi</th>
                      <th className="py-4 px-6">Matière / Niveau</th>
                      <th className="py-4 px-6">Statut</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6 text-right">Contacter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allStudents.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-10 text-center text-slate-400">
                          Aucun élève inscrit à vos modules pour le moment
                        </td>
                      </tr>
                    ) : (
                      allStudents
                        .filter(
                          (sub) =>
                            !studentSearch.trim() ||
                            sub.student?.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
                            sub.student?.email?.toLowerCase().includes(studentSearch.toLowerCase())
                        )
                        .map((sub) => (
                          <tr key={sub._id} className="hover:bg-slate-50/80 transition">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={sub.student?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(sub.student?.name || 'E')}`}
                                  alt={sub.student?.name}
                                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                                />
                                <div>
                                  <span className="font-bold text-slate-900 block">{sub.student?.name || 'Élève'}</span>
                                  <span className="text-[10px] text-slate-400">{sub.student?.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 font-semibold text-slate-700">{sub.course?.title || 'Cours'}</td>
                            <td className="py-4 px-6 text-slate-600">
                              {sub.course?.subject} ({sub.course?.level})
                            </td>
                            <td className="py-4 px-6">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                Actif
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-400">
                              {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('fr-FR') : '-'}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <a
                                href={`mailto:${sub.student?.email}`}
                                className="p-1.5 inline-flex rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </a>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VUE 6 : SÉANCES EN DIRECT (GOOGLE MEET) */}
        {/* ============================================================== */}
        {activeTab === 'live' && (
          <div className="p-6 md:p-8 space-y-6 max-w-7xl">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Classes en Direct (Google Meet)</h2>
              <p className="text-slate-500 text-xs">
                Organisez vos cours en direct sur Google Meet pour les élèves de l'académie.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#00897b]" />
                  Démarrer une réunion Google Meet
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Vous pouvez lancer une réunion instantanée sur Google Meet, puis copier le lien et l'ajouter à vos cours pour que les élèves s'y connectent en 1 clic.
                </p>

                <div className="pt-2">
                  <a
                    href="https://meet.google.com/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-bold shadow-md transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Créer une réunion sur Google Meet
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#ff9800]" />
                  Intégrer le direct à un cours
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pour associer un lien Meet à un cours, ouvrez le cours souhaité dans <strong>"Gestion des Cours" &gt; "Gérer le contenu"</strong>, ajoutez une leçon de type <strong>"Séance en direct (Google Meet)"</strong>.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('courses')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Aller aux cours
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VUE 7 : GESTIONNAIRE SANS CODER (ADMIN SEULEMENT) */}
        {/* ============================================================== */}
        {isEffectiveAdmin && activeTab === 'nocode' && (
          <div className="p-6 md:p-8 space-y-8 max-w-6xl">
            {saveSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Gestionnaire de Fonctionnalités & Contenus (Sans Coder)
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Activez ou désactivez des fonctions, changez les couleurs et publiez des annonces en temps réel.
              </p>
            </div>

            {/* Interrupteurs des fonctionnalités */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#ff9800]" />
                Fonctionnalités de la Plateforme (Activer / Désactiver en 1 clic)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    key: 'enableLiveMeet',
                    label: 'Séances Google Meet',
                    desc: 'Affiche les boutons de visioconférence directe',
                  },
                  {
                    key: 'enableQuiz',
                    label: 'Quiz & Évaluations',
                    desc: 'Active les QCM auto-corrigés pour les élèves',
                  },
                  {
                    key: 'enableForum',
                    label: 'Forum / Discussions',
                    desc: 'Permet aux élèves de poser des questions sous les leçons',
                  },
                  {
                    key: 'enablePdfDownload',
                    label: 'Téléchargement PDF',
                    desc: 'Autorise le téléchargement des fiches de révision',
                  },
                  {
                    key: 'enableWhatsAppButton',
                    label: 'Bouton WhatsApp Prof',
                    desc: 'Affiche le bouton vert WhatsApp flottant',
                  },
                  {
                    key: 'enableFreeEnrollment',
                    label: 'Inscription Gratuite',
                    desc: "Permet d'activer les cours gratuits sans carte",
                  },
                ].map((item) => {
                  const isChecked = !!platformSettings.features[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleToggleFeature(item.key)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isChecked
                          ? 'bg-teal-50/60 border-[#00897b]/40 shadow-sm'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-900">{item.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                      <div
                        className={`w-10 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                          isChecked ? 'bg-[#00897b] justify-end' : 'bg-slate-300 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bannière Flash d'Annonce */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#00897b]" />
                  Bandeau d'Annonce en Tête de Site
                </h3>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={platformSettings.announcement.active}
                    onChange={(e) =>
                      handleSaveSettings({
                        ...platformSettings,
                        announcement: {
                          ...platformSettings.announcement,
                          active: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-[#00897b]"
                  />
                  Activer la bannière
                </label>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={platformSettings.announcement.message}
                  onChange={(e) =>
                    setPlatformSettings({
                      ...platformSettings,
                      announcement: { ...platformSettings.announcement, message: e.target.value },
                    })
                  }
                  placeholder="Texte de l'annonce..."
                  className="w-full h-11 border border-slate-300 rounded-xl px-4 text-xs font-medium focus:outline-none focus:border-[#00897b]"
                />
                <button
                  onClick={() => handleSaveSettings()}
                  disabled={savingSettings}
                  className="px-6 py-2.5 rounded-full bg-[#00897b] text-white text-xs font-bold hover:bg-[#00796b] cursor-pointer"
                >
                  {savingSettings ? 'Enregistrement...' : 'Mettre à jour l’annonce'}
                </button>
              </div>
            </div>

            {/* Questions fréquentes FAQ */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                Questions Fréquentes (FAQ) affichées aux visiteurs
              </h3>

              <div className="space-y-3">
                {platformSettings.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{faq.question}</p>
                      <p className="text-slate-600 mt-1 leading-relaxed">{faq.answer}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteFaq(idx)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddFaq} className="space-y-3 pt-3 border-t border-slate-100">
                <input
                  type="text"
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                  placeholder="Nouvelle question..."
                  className="w-full h-10 border border-slate-300 rounded-xl px-4 text-xs"
                />
                <textarea
                  value={newFaqAnswer}
                  onChange={(e) => setNewFaqAnswer(e.target.value)}
                  placeholder="Réponse explicative..."
                  rows={2}
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  + Ajouter cette question
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL AJOUT / MODIFICATION D'UN MODULE DE COURS */}
      {/* ============================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              {editingCourse ? 'Modifier le Module' : 'Créer un Nouveau Module'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Remplissez les détails du programme pédagogique.
            </p>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Titre du module *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Analyse & Fonctions Numériques"
                  className="w-full h-11 border border-slate-300 rounded-xl px-4 text-xs focus:outline-none focus:border-[#ff9800]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description détaillée *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Objectifs et notions abordées..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-[#ff9800]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Matière *</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-11 border border-slate-300 rounded-xl px-3 text-xs bg-white"
                  >
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Physique-Chimie">Physique-Chimie</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Niveau *</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full h-11 border border-slate-300 rounded-xl px-3 text-xs bg-white"
                  >
                    <option value="4ème">4ème</option>
                    <option value="3ème">3ème (BFEM)</option>
                    <option value="2nde S">2nde S</option>
                    <option value="1ère S">1ère S</option>
                    <option value="TS">Terminale S (BAC)</option>
                  </select>
                </div>
              </div>

              {/* Sélection du professeur assigné (ADMIN UNIQUEMENT) */}
              {isEffectiveAdmin && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Professeur assigné *</label>
                  <select
                    value={assignedTeacherId}
                    onChange={(e) => setAssignedTeacherId(e.target.value)}
                    className="w-full h-11 border border-slate-300 rounded-xl px-3 text-xs bg-white font-bold text-[#00897b]"
                  >
                    {teachersList.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.email}) - {t.role === 'admin' ? 'Admin' : 'Professeur'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tarifs (modifiables uniquement par l'admin) */}
              {isEffectiveAdmin && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={(e) => setIsFree(e.target.checked)}
                      className="w-4 h-4 rounded text-[#00897b]"
                    />
                    Module offert gratuitement (Promotion)
                  </label>

                  {!isFree && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tarif (FCFA) *</label>
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full h-10 border border-slate-300 rounded-xl px-4 text-xs bg-white"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image de couverture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-[#00897b]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-7 py-2.5 rounded-full bg-[#ff9800] hover:bg-[#f57c00] text-white font-bold shadow-md cursor-pointer"
                >
                  {creating ? 'Enregistrement...' : editingCourse ? 'Mettre à jour' : 'Créer le module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL CRÉATION UTILISATEUR RBAC (ADMIN SEULEMENT) */}
      {/* ============================================================== */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative my-auto">
            <button
              onClick={() => setShowCreateUserModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1">Ajouter un Utilisateur</h3>
            <p className="text-xs text-slate-500 mb-6">
              Créez un compte élève, enseignant ou administrateur.
            </p>

            {createUserError && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-200">
                {createUserError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ex: Ibrahima Sow"
                  className="w-full h-11 border border-slate-300 rounded-xl px-4 text-xs focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Adresse Email *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="exemple@gmail.com"
                  className="w-full h-11 border border-slate-300 rounded-xl px-4 text-xs focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mot de passe temporaire *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 border border-slate-300 rounded-xl px-4 text-xs focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rôle attribué *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full h-11 border border-slate-300 rounded-xl px-3 text-xs bg-white font-bold"
                >
                  <option value="student">Élève (Accès public & cours souscrits)</option>
                  <option value="teacher">Professeur (Accès modules assignés uniquement)</option>
                  <option value="admin">Administrateur (Accès complet à la plateforme)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-7 py-2.5 rounded-full bg-[#00897b] hover:bg-[#00796b] text-white font-bold shadow-md cursor-pointer"
                >
                  {creatingUser ? 'Création...' : 'Créer l’utilisateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
