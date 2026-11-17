import React, { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';
import api from '../utils/api';
import { formatLevel } from '../components/CourseCard';
import ConfirmModal from '../components/ConfirmModal';
import AdminOverviewTab from '../components/admin/AdminOverviewTab';
import AdminSecurityTab from '../components/admin/AdminSecurityTab';
import AdminUsersTab from '../components/admin/AdminUsersTab';
import AdminSubscriptionsTab from '../components/admin/AdminSubscriptionsTab';
import AdminCatalogPromoTab from '../components/admin/AdminCatalogPromoTab';
import AdminSystemConfigTab from '../components/admin/AdminSystemConfigTab';
import AdminContentTab from '../components/admin/AdminContentTab';
import AdminNotificationsTab from '../components/admin/AdminNotificationsTab';
import AdminTroubleshootingTab from '../components/admin/AdminTroubleshootingTab';
import {
  ShieldCheck,
  ShieldAlert,
  Wrench,
  Bell,
  Database,
  Download,
  LayoutDashboard,
  BookOpen,
  ImagePlus,
  CreditCard,
  Users,
  Sliders,
  MessageSquare,
  Settings,
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  Check,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronDown,
  LogOut,
  User,
  Award,
  Sparkles,
  Megaphone,
  Star,
  CalendarPlus,
  Ban,
  CheckCircle2,
  Globe,
  Layers,
  GraduationCap,
  Menu,
  Zap,
  UserPlus,
  Gift,
  Video,
  HelpCircle,
  FileText,
  Share2,
  Smartphone,
  Lock,
  Unlock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

const ROLE_BADGES = {
  admin: 'bg-rose-500 text-white border-rose-500',
  teacher: 'bg-amber-400 text-slate-900 border-amber-400',
  student: 'bg-sky-500 text-white border-sky-500',
};

const ROLE_LABELS = {
  admin: 'Admin',
  teacher: 'Professeur',
  student: 'Élève',
};

const FEATURE_LIST = [
  {
    key: 'enableOpenRegistration',
    title: 'Inscriptions publiques ouvertes',
    desc: "Permet aux nouveaux élèves de créer un compte librement depuis la page d'inscription.",
    icon: UserPlus,
    category: 'Accès & Comptes',
  },
  {
    key: 'enableFreeEnrollment',
    title: 'Inscription gratuite en 1 clic',
    desc: 'Autorise les élèves à débloquer les modules à 0 FCFA sans passer par le paiement.',
    icon: Gift,
    category: 'Accès & Tarifs',
  },
  {
    key: 'enablePayments',
    title: 'Paiements Wave & Orange Money',
    desc: 'Active les boutons et formulaires d’abonnement payant sur les fiches de modules.',
    icon: CreditCard,
    category: 'Monétisation',
  },
  {
    key: 'enableLiveMeet',
    title: 'Séances en direct (Google Meet / Jitsi)',
    desc: 'Active les leçons vidéo en direct et l’accès à la salle interactive.',
    icon: Video,
    category: 'Pédagogie & Échanges',
  },
  {
    key: 'enableQuiz',
    title: 'Quiz interactifs & évaluations',
    desc: 'Affiche l’onglet Quiz dans les cours et enregistre les notes des élèves.',
    icon: HelpCircle,
    category: 'Évaluations',
  },
  {
    key: 'enableForum',
    title: 'Salon de discussion & Q/R',
    desc: 'Active l’espace d’échange entre les élèves et le professeur dans chaque module.',
    icon: MessageSquare,
    category: 'Pédagogie & Échanges',
  },
  {
    key: 'enableReviews',
    title: 'Avis & notes des élèves',
    desc: 'Permet aux élèves abonnés de laisser une note et un commentaire sur les modules.',
    icon: Star,
    category: 'Communauté',
  },
  {
    key: 'enablePdfDownload',
    title: 'Supports & fiches PDF',
    desc: 'Autorise la consultation et le téléchargement des supports PDF dans les leçons.',
    icon: FileText,
    category: 'Ressources',
  },
  {
    key: 'enableShareButtons',
    title: 'Boutons de partage social',
    desc: 'Affiche Facebook, WhatsApp, TikTok et YouTube sur les pages publiques de modules.',
    icon: Share2,
    category: 'Réseaux & Partage',
  },
  {
    key: 'enableSequentialUnlock',
    title: 'Déblocage progressif des sections',
    desc: "Déverrouille les chapitres et le quiz final au fur et à mesure que l'élève termine chaque section (style Bakeli).",
    icon: Lock,
    category: 'Pédagogie & Progression',
  },
  {
    key: 'enableAppInstall',
    title: "Guide & Bannière d'installation de l'application (PWA)",
    desc: "Affiche ou masque la section « Apprenez partout, même hors ligne » et le guide « Comment installer ? » sur la page d'accueil.",
    icon: Smartphone,
    category: 'Application Mobile',
  },
];

const inputClass =
  'w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-[#2563eb]/15 transition';

const AdminDashboard = () => {
  const { user, loading: authLoading, logout } = useContext(AuthContext);
  const { settings, saveSettings } = useContext(SettingsContext);
  const navigate = useNavigate();

  const [view, setView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [menuOpen, setMenuOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reports, setReports] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [toast, setToast] = useState({ type: '', text: '' });
  const [confirmState, setConfirmState] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

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

  // Filtres & recherche
  const [globalSearch, setGlobalSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [subSearch, setSubSearch] = useState('');
  const [subStatusFilter, setSubStatusFilter] = useState('all');

  // Modal Cours
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    subject: 'Mathématiques',
    level: 'TS',
    duration: '3 mois',
    price: 6000,
    isFree: false,
    originalPrice: 6000,
    teacherId: '',
  });
  const [courseImage, setCourseImage] = useState(null);
  const [savingCourse, setSavingCourse] = useState(false);

  // Modal Utilisateur
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    title: '',
    isActive: true,
  });
  const [savingUser, setSavingUser] = useState(false);
  const [userAvatarFile, setUserAvatarFile] = useState(null);
  const [userModalError, setUserModalError] = useState('');

  // Modal Abonnement manuel
  const [showSubModal, setShowSubModal] = useState(false);
  const [subStudentSearch, setSubStudentSearch] = useState('');
  const [subLevelFilter, setSubLevelFilter] = useState('Tous');
  const [subReason, setSubReason] = useState('');
  const [subNotifyEmail, setSubNotifyEmail] = useState(true);
  const [subForm, setSubForm] = useState({
    studentId: '',
    courseId: '',
    paymentMethod: 'Offert (Admin)',
    amount: 0,
    durationMonths: 12,
  });
  const [subSelectedCourseIds, setSubSelectedCourseIds] = useState([]);
  const [savingSub, setSavingSub] = useState(false);

  // Brouillon local des paramètres no-code
  const [draftSettings, setDraftSettings] = useState(settings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newLevelValue, setNewLevelValue] = useState('');
  const [newLevelLabel, setNewLevelLabel] = useState('');
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [newTestimonial, setNewTestimonial] = useState({ name: '', level: '', quote: '', rating: 5 });
  const [newExtraLink, setNewExtraLink] = useState({
    title: '',
    description: '',
    url: '',
    badge: 'Nouveau',
    active: true,
  });

  useEffect(() => {
    setDraftSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (user.role !== 'admin') {
        navigate(user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
      }
    }
  }, [user, authLoading, navigate]);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast((prev) => (prev.text === text ? { type: '', text: '' } : prev)), 4000);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [ov, us, cs, subs, revs, reps, notifs, logs] = await Promise.all([
        api('/admin/overview').catch(() => null),
        api('/admin/users').catch(() => []),
        api('/courses').catch(() => []),
        api('/admin/subscriptions').catch(() => []),
        api('/admin/reviews').catch(() => []),
        api('/reports').catch(() => []),
        api('/notifications').catch(() => []),
        api('/admin/security/logs').catch(() => []),
      ]);
      setOverview(ov);
      setUsersList(Array.isArray(us) ? us : []);
      setCourses(Array.isArray(cs) ? cs : []);
      setSubscriptions(Array.isArray(subs) ? subs : []);
      setReviews(Array.isArray(revs) ? revs : []);
      setReports(Array.isArray(reps) ? reps : []);
      setNotifications(Array.isArray(notifs) ? notifs : []);
      setSecurityLogs(Array.isArray(logs) ? logs : []);
    } catch (err) {
      showToast('error', err.message || 'Erreur lors du chargement du Back-Office');
    } finally {
      setLoading(false);
    }
  };

  // --- NOUVEAUX GESTIONNAIRES UTILISATEURS & SÉCURITÉ ---
  const handleSuspendUser = async (userId, payload) => {
    await api(`/admin/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await fetchAllData();
  };

  const handleToggleBlockUser = async (userId) => {
    await api(`/admin/users/${userId}/toggle-block`, {
      method: 'POST',
    });
    await fetchAllData();
  };

  const handleResetPassword = async (userId) => {
    const data = await api(`/admin/users/${userId}/reset-password`, {
      method: 'POST',
    });
    await fetchAllData();
    return data;
  };

  const handleUpdateReport = async (reportId, payload) => {
    await api(`/reports/${reportId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    await fetchAllData();
  };

  const handleRefreshLogs = async () => {
    const logs = await api('/admin/security/logs');
    setSecurityLogs(Array.isArray(logs) ? logs : []);
  };

  const handleDownloadBackup = async () => {
    try {
      showToast('info', 'Génération de la sauvegarde de la base de données...');
      const res = await api('/admin/backup');
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute('href', dataStr);
      dlAnchor.setAttribute('download', `backup-profsow-${new Date().toISOString().slice(0, 10)}.json`);
      dlAnchor.click();
      showToast('success', 'Sauvegarde exportée avec succès !');
    } catch (err) {
      showToast('error', err.message || 'Erreur lors de l’export de la sauvegarde.');
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllData();
    }
  }, [user?._id, user?.role]);

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7fb] px-4">
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-lg border border-slate-200/80 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
              <div className="w-3.5 h-3.5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          </div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            Aliou Sow Academy
          </h2>
          <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5 mb-2">
            Espace Administrateur
          </p>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            Vérification de votre session administrateur...
          </p>
        </div>
      </div>
    );
  }

  const teachersList = usersList.filter((u) => u.role === 'teacher' || u.role === 'admin');
  const studentsList = usersList.filter((u) => u.role === 'student');

  const availableSubjects =
    draftSettings.subjects?.length > 0 ? draftSettings.subjects : ['Mathématiques', 'Physique-Chimie'];
  const availableLevels =
    draftSettings.levels?.length > 0
      ? draftSettings.levels
      : [
          { value: '4ème', label: '4ème' },
          { value: '3ème', label: '3ème' },
          { value: '2nde S', label: '2nde S' },
          { value: '1ère S', label: '1ère S' },
          { value: 'TS', label: 'Terminale S' },
        ];

  // --- ACTIONS COURS ---
  const openCreateCourse = () => {
    setEditingCourse(null);
    const defaultTeacher = usersList.find((u) => u.role === 'teacher') || user;
    setCourseForm({
      title: '',
      description: '',
      subject: availableSubjects[0] || 'Mathématiques',
      level: availableLevels[0]?.value || 'TS',
      duration: draftSettings.siteInfo?.defaultDuration || '3 mois',
      price: draftSettings.siteInfo?.defaultPrice ?? 6000,
      isFree: false,
      originalPrice: draftSettings.siteInfo?.defaultPrice ?? 6000,
      teacherId: defaultTeacher?._id || '',
    });
    setCourseImage(null);
    setShowCourseModal(true);
  };

  const openEditCourse = (c) => {
    setEditingCourse(c);
    setCourseForm({
      title: c.title || '',
      description: c.description || '',
      subject: c.subject || availableSubjects[0],
      level: c.level || availableLevels[0]?.value || 'TS',
      duration: c.duration || '3 mois',
      price: c.price ?? 6000,
      isFree: Boolean(c.isFree),
      originalPrice: c.originalPrice || 6000,
      teacherId: c.teacher?._id || '',
    });
    setCourseImage(null);
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setSavingCourse(true);
    try {
      const formData = new FormData();
      formData.append('title', courseForm.title);
      formData.append('description', courseForm.description);
      formData.append('subject', courseForm.subject);
      formData.append('level', courseForm.level);
      formData.append('duration', courseForm.duration);
      formData.append('isFree', courseForm.isFree);
      formData.append('price', courseForm.isFree ? 0 : courseForm.price);
      formData.append('originalPrice', courseForm.originalPrice);
      if (courseForm.teacherId) formData.append('teacherId', courseForm.teacherId);
      if (courseImage) formData.append('image', courseImage);

      if (editingCourse) {
        await api(`/courses/${editingCourse._id}`, { method: 'PUT', body: formData });
        showToast('success', 'Matière mise à jour avec succès.');
      } else {
        await api('/courses', { method: 'POST', body: formData });
        showToast('success', 'Nouvelle matière créée avec succès.');
      }
      setShowCourseModal(false);
      await fetchAllData();
    } catch (err) {
      showToast('error', err.message || "Erreur lors de l'enregistrement de la matière");
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = (courseId) => {
    const target = courses.find((c) => c._id === courseId);
    setConfirmState({
      title: 'Supprimer la matière',
      message: target
        ? `Voulez-vous vraiment supprimer la matière "${target.title}" ?`
        : 'Supprimer définitivement cette matière ?',
      details: 'Tous les chapitres, leçons, quiz et abonnements associés à cette matière seront définitivement supprimés.',
      confirmLabel: 'Supprimer la matière',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api(`/courses/${courseId}`, { method: 'DELETE' });
          showToast('success', 'Module supprimé.');
          await fetchAllData();
        } catch (err) {
          showToast('error', err.message);
        }
      },
    });
  };

  // --- ACTIONS UTILISATEURS ---
  const openCreateUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'student',
      phone: '',
      title: '',
      isActive: true,
    });
    setUserAvatarFile(null);
    setUserModalError('');
    setShowUserModal(true);
  };

  const openEditUser = (u) => {
    setEditingUser(u);
    setUserForm({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'student',
      phone: u.phone || '',
      title: u.title || '',
      isActive: u.isActive !== false,
    });
    setUserAvatarFile(null);
    setUserModalError('');
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSavingUser(true);
    setUserModalError('');
    try {
      if (editingUser) {
        if (userAvatarFile) {
          const formData = new FormData();
          formData.append('name', userForm.name);
          formData.append('email', userForm.email);
          formData.append('role', userForm.role);
          formData.append('phone', userForm.phone);
          formData.append('title', userForm.title);
          formData.append('isActive', String(userForm.isActive));
          if (userForm.password.trim()) formData.append('password', userForm.password.trim());
          formData.append('avatar', userAvatarFile);
          await api(`/admin/users/${editingUser._id}`, {
            method: 'PUT',
            body: formData,
          });
        } else {
          const payload = {
            name: userForm.name,
            email: userForm.email,
            role: userForm.role,
            phone: userForm.phone,
            title: userForm.title,
            isActive: userForm.isActive,
          };
          if (userForm.password.trim()) payload.password = userForm.password.trim();
          await api(`/admin/users/${editingUser._id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
        }
        showToast('success', 'Compte utilisateur mis à jour.');
      } else {
        await api('/admin/users', {
          method: 'POST',
          body: JSON.stringify(userForm),
        });
        showToast('success', 'Nouvel utilisateur créé.');
      }
      setShowUserModal(false);
      await fetchAllData();
    } catch (err) {
      const msg = err.message || 'Erreur lors de la sauvegarde';
      setUserModalError(msg);
      showToast('error', msg);
    } finally {
      setSavingUser(false);
    }
  };

  const handleToggleUserActive = async (u) => {
    try {
      await api(`/admin/users/${u._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: u.isActive === false }),
      });
      showToast(
        'success',
        u.isActive === false ? `Compte de ${u.name} réactivé.` : `Compte de ${u.name} suspendu.`
      );
      await fetchAllData();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleDeleteUser = (u) => {
    setConfirmState({
      title: 'Supprimer ce compte utilisateur',
      message: `Supprimer définitivement le compte de ${u.name} (${u.email}) ?`,
      details: 'Cette action est irréversible. Les données et accès liés à ce compte seront retirés.',
      confirmLabel: 'Supprimer le compte',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api(`/admin/users/${u._id}`, { method: 'DELETE' });
          showToast('success', 'Utilisateur supprimé.');
          await fetchAllData();
        } catch (err) {
          showToast('error', err.message);
        }
      },
    });
  };

  // --- ACTIONS ABONNEMENTS ---
  const openGrantSubModal = () => {
    const firstCourseId = courses[0]?._id || '';
    setSubForm({
      studentId: studentsList[0]?._id || '',
      courseId: firstCourseId,
      paymentMethod: 'Offert (Admin)',
      amount: 0,
      durationMonths: 12,
    });
    setSubSelectedCourseIds(firstCourseId ? [firstCourseId] : []);
    setSubStudentSearch('');
    setSubLevelFilter('Tous');
    setShowSubModal(true);
  };

  const handleGrantSub = async (e) => {
    e.preventDefault();
    const targetCourseIds =
      subSelectedCourseIds.length > 0
        ? subSelectedCourseIds
        : subForm.courseId
        ? [subForm.courseId]
        : [];
    if (!subForm.studentId || targetCourseIds.length === 0) {
      showToast('error', 'Veuillez sélectionner un élève et au moins un cours.');
      return;
    }
    setSavingSub(true);
    try {
      for (const cid of targetCourseIds) {
        await api('/admin/subscriptions', {
          method: 'POST',
          body: JSON.stringify({ ...subForm, courseId: cid }),
        });
      }
      showToast(
        'success',
        targetCourseIds.length > 1
          ? `${targetCourseIds.length} accès accordés avec succès.`
          : 'Abonnement accordé avec succès.'
      );
      setShowSubModal(false);
      await fetchAllData();
    } catch (err) {
      showToast('error', err.message || "Impossible d'accorder cet abonnement");
    } finally {
      setSavingSub(false);
    }
  };

  const handleUpdateSub = async (subId, payload, msg) => {
    try {
      await api(`/admin/subscriptions/${subId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      showToast('success', msg);
      await fetchAllData();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleDeleteSub = (subId) => {
    const target = subscriptions.find((s) => s._id === subId);
    setConfirmState({
      title: "Supprimer l'abonnement",
      message: target?.student?.name
        ? `Supprimer l'abonnement de ${target.student.name} au module "${target.course?.title || 'Module'}" ?`
        : 'Supprimer cet abonnement ?',
      details: "L'élève perdra immédiatement l'accès aux ressources de ce module.",
      confirmLabel: 'Supprimer',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api(`/admin/subscriptions/${subId}`, { method: 'DELETE' });
          showToast('success', 'Abonnement supprimé.');
          await fetchAllData();
        } catch (err) {
          showToast('error', err.message);
        }
      },
    });
  };

  // --- ACTIONS PARAMÈTRES & FONCTIONNALITÉS ---
  const persistSettings = async (nextSettings, msg = 'Paramètres enregistrés !') => {
    setSavingSettings(true);
    try {
      const updated = await saveSettings(nextSettings);
      setDraftSettings(updated);
      showToast('success', msg);
    } catch (err) {
      showToast('error', err.message || 'Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleFeature = async (featureKey) => {
    const currentEnabled = draftSettings.features?.[featureKey] !== false;
    const nextFeatures = {
      ...draftSettings.features,
      [featureKey]: !currentEnabled,
    };
    const next = { ...draftSettings, features: nextFeatures };
    setDraftSettings(next);
    await persistSettings({ features: nextFeatures }, 'Fonctionnalité mise à jour avec succès.');
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    const clean = newSubject.trim();
    if (!clean) return;
    if (availableSubjects.includes(clean)) {
      showToast('error', 'Cette matière existe déjà.');
      return;
    }
    const nextSubjects = [...availableSubjects, clean];
    setNewSubject('');
    await persistSettings({ subjects: nextSubjects }, `Matière « ${clean} » ajoutée !`);
  };

  const handleRemoveSubject = async (sub) => {
    if (availableSubjects.length <= 1) {
      showToast('error', 'Il faut conserver au moins une matière.');
      return;
    }
    const nextSubjects = availableSubjects.filter((s) => s !== sub);
    await persistSettings({ subjects: nextSubjects }, `Matière « ${sub} » retirée.`);
  };

  const handleAddLevel = async (e) => {
    e.preventDefault();
    const val = newLevelValue.trim();
    const lbl = (newLevelLabel || val).trim();
    if (!val) return;
    if (availableLevels.some((l) => l.value.toLowerCase() === val.toLowerCase())) {
      showToast('error', 'Ce niveau existe déjà.');
      return;
    }
    const nextLevels = [...availableLevels, { value: val, label: lbl }];
    setNewLevelValue('');
    setNewLevelLabel('');
    await persistSettings({ levels: nextLevels }, `Niveau « ${lbl} » ajouté !`);
  };

  const handleRemoveLevel = async (val) => {
    if (availableLevels.length <= 1) {
      showToast('error', 'Il faut conserver au moins un niveau.');
      return;
    }
    const nextLevels = availableLevels.filter((l) => l.value !== val);
    await persistSettings({ levels: nextLevels }, 'Niveau retiré.');
  };

  const handleAddExtraLink = async (e) => {
    e.preventDefault();
    if (!newExtraLink.title.trim() || !newExtraLink.url.trim()) return;
    const nextLinks = [...(draftSettings.extraLinks || []), newExtraLink];
    setNewExtraLink({ title: '', description: '', url: '', badge: 'Nouveau', active: true });
    await persistSettings({ extraLinks: nextLinks }, 'Nouvelle fonctionnalité / ressource ajoutée !');
  };

  const handleToggleExtraLink = async (idx) => {
    const nextLinks = (draftSettings.extraLinks || []).map((item, i) =>
      i === idx ? { ...item, active: !item.active } : item
    );
    await persistSettings({ extraLinks: nextLinks }, 'Statut mis à jour.');
  };

  const handleRemoveExtraLink = async (idx) => {
    const nextLinks = (draftSettings.extraLinks || []).filter((_, i) => i !== idx);
    await persistSettings({ extraLinks: nextLinks }, 'Élément supprimé.');
  };

  const handleAddFaq = async (e) => {
    e.preventDefault();
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return;
    const nextFaqs = [...(draftSettings.faqs || []), newFaq];
    setNewFaq({ question: '', answer: '' });
    await persistSettings({ faqs: nextFaqs }, 'FAQ ajoutée !');
  };

  const handleRemoveFaq = async (idx) => {
    const nextFaqs = (draftSettings.faqs || []).filter((_, i) => i !== idx);
    await persistSettings({ faqs: nextFaqs }, 'FAQ supprimée.');
  };

  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    if (!newTestimonial.name.trim() || !newTestimonial.quote.trim()) return;
    const nextTests = [...(draftSettings.testimonials || []), newTestimonial];
    setNewTestimonial({ name: '', level: '', quote: '', rating: 5 });
    await persistSettings({ testimonials: nextTests }, 'Témoignage ajouté !');
  };

  const handleRemoveTestimonial = async (idx) => {
    const nextTests = (draftSettings.testimonials || []).filter((_, i) => i !== idx);
    await persistSettings({ testimonials: nextTests }, 'Témoignage supprimé.');
  };

  const handleDeleteReview = (reviewId) => {
    setConfirmState({
      title: "Supprimer l'avis élève",
      message: 'Voulez-vous retirer définitivement cet avis de la plateforme ?',
      details: "L'avis ne sera plus visible sur la page du module.",
      confirmLabel: 'Supprimer',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api(`/admin/reviews/${reviewId}`, { method: 'DELETE' });
          showToast('success', 'Avis supprimé.');
          await fetchAllData();
        } catch (err) {
          showToast('error', err.message);
        }
      },
    });
  };

  const filteredCourses = courses.filter((c) => {
    const q = courseSearch.trim().toLowerCase();
    return !q || `${c.title} ${c.subject} ${c.level} ${c.teacher?.name || ''}`.toLowerCase().includes(q);
  });

  const filteredUsers = usersList.filter((u) => {
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const q = userSearch.trim().toLowerCase();
    const matchQ = !q || `${u.name} ${u.email} ${u.phone || ''}`.toLowerCase().includes(q);
    return matchRole && matchQ;
  });

  const now = new Date();
  const filteredSubs = subscriptions.filter((s) => {
    const isActuallyActive = s.status === 'active' && new Date(s.expiresAt) > now;
    const matchStatus =
      subStatusFilter === 'all' ||
      (subStatusFilter === 'active' && isActuallyActive) ||
      (subStatusFilter === 'expired' && !isActuallyActive);
    const q = subSearch.trim().toLowerCase();
    const matchQ =
      !q ||
      `${s.student?.name || ''} ${s.student?.email || ''} ${s.course?.title || ''} ${s.transactionId || ''} ${s.paymentMethod || ''}`
        .toLowerCase()
        .includes(q);
    return matchStatus && matchQ;
  });

  const unreadAlertsCount = notifications.filter((n) => !n.read).length;
  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  const sidebarItems = [
    { key: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard, group: 'TOUR DE CONTRÔLE' },
    { key: 'subscriptions', label: 'Transactions', icon: CreditCard, count: subscriptions.length, group: 'TOUR DE CONTRÔLE' },
    { key: 'users', label: 'Utilisateurs & Accès', icon: Users, count: usersList.length, group: 'TOUR DE CONTRÔLE' },
    { key: 'courses', label: 'Catalogue & Promo', icon: BookOpen, count: courses.length, group: 'TOUR DE CONTRÔLE' },
    {
      key: 'security',
      label: 'Sécurité',
      icon: ShieldAlert,
      count: pendingReportsCount,
      group: 'TOUR DE CONTRÔLE',
      priority: true,
    },
    { key: 'settings', label: 'Configuration Système', icon: Settings, group: 'TOUR DE CONTRÔLE' },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: Bell,
      count: unreadAlertsCount,
      group: 'OUTILS AVANCÉS',
    },
    { key: 'troubleshooting', label: 'Résolution Problèmes', icon: Wrench, group: 'OUTILS AVANCÉS' },
    { key: 'features', label: 'Fonctionnalités', icon: Sliders, group: 'OUTILS AVANCÉS' },
    { key: 'content', label: 'Contenu & Avis', icon: Megaphone, group: 'OUTILS AVANCÉS' },
  ];

  const sidebarGroups = ['TOUR DE CONTRÔLE', 'OUTILS AVANCÉS'];

  const stats = overview?.stats || {
    users: { student: 0, teacher: 0, admin: 0, total: 0 },
    courses: { total: courses.length, free: 0, paid: 0 },
    subscriptions: { total: subscriptions.length, active: 0, expired: 0 },
    totalRevenue: 0,
    revenueByMethod: {},
    quizResultsCount: 0,
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900 antialiased font-sans overflow-x-hidden">
      {/* Topbar blanche sticky */}
      <header className="sticky top-0 z-40 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Gauche : Burger + Logo + Badge Tour de Contrôle */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2 shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? 'Replier le menu' : 'Ouvrir le menu'}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center cursor-pointer transition shrink-0"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4 hidden lg:block" /> : null}
            <Menu className={`w-4 h-4 ${sidebarOpen ? 'lg:hidden' : ''}`} />
          </button>

          <Link to="/" className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-slate-100 p-1.5 flex items-center justify-center shrink-0">
              <img src={logo} alt="Aliou Sow Academy" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0 flex flex-col leading-tight gap-0.5">
              <span className="text-[14px] sm:text-[15px] font-bold tracking-tight text-slate-900 truncate">
                Aliou Sow
              </span>
              <span className="inline-flex items-center w-fit px-2 py-[2px] rounded-md bg-slate-900 text-indigo-300 border border-indigo-500/30 text-[9px] font-bold tracking-wider uppercase whitespace-nowrap">
                ADMIN • TOUR DE CONTRÔLE
              </span>
            </div>
          </Link>
        </div>

        {/* Centre : Barre de recherche globale */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Rechercher une transaction, un élève, un cours..."
            className="w-full h-9 pl-9 pr-8 rounded-full bg-slate-50 border border-slate-200/90 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-blue-500/15 transition"
          />
          {globalSearch && (
            <button
              type="button"
              onClick={() => setGlobalSearch('')}
              className="absolute right-2.5 p-0.5 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Droite : Statut système + Badge ADMIN + Nouvelle Matière + Cloche + Avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Système en ligne
          </span>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold tracking-wide">
            <span className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center text-[10px]">A</span>
            ADMIN
          </span>

          <button
            type="button"
            onClick={openCreateCourse}
            className="gradient-button gradient-button--sm !px-3 !py-1.5 !text-xs flex items-center gap-1.5 shrink-0"
            title="Nouvelle Matière"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nouvelle Matière</span>
          </button>

          {/* Cloche de notifications */}
          <button
            type="button"
            onClick={() => setView('notifications')}
            className="relative w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0"
            title="Notifications et alertes"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Menu profil */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 cursor-pointer transition"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <span className="w-8 h-8 rounded-full bg-[#1e293b] text-white flex items-center justify-center text-xs font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                <div className="absolute right-0 top-11 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-3 z-50 isolate">
                  <div className="px-4 pb-3 border-b border-slate-100">
                    <p className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">Administrateur</p>
                    <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{user.name}</p>
                    <p className="text-xs font-medium text-slate-500 truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition"
                    >
                      <User className="w-4 h-4 text-indigo-600" />
                      Mon profil &amp; paramètres
                    </Link>
                    <Link
                      to="/teacher-dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition"
                    >
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      Vue Enseignant
                    </Link>
                    <Link
                      to="/"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition"
                    >
                      <Globe className="w-4 h-4 text-slate-500" />
                      Voir le site
                    </Link>
                  </div>
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
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

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-[1px] z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar claire latérale */}
      <aside
        className={`fixed top-0 lg:top-14 bottom-0 left-0 w-[272px] bg-slate-900 text-slate-300 border-r border-slate-800 z-50 lg:z-30 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* En-tête mobile de la sidebar */}
        <div className="lg:hidden px-4 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2 min-w-0">
            <img src={logo} alt="Aliou Sow Academy" className="w-7 h-7 object-contain shrink-0" />
            <span className="text-sm font-bold text-white truncate">Tour de Contrôle</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            aria-label="Fermer le menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation groupée */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sidebarGroups.map((group) => (
            <div key={group} className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 px-3 pb-1">
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
                      type="button"
                      onClick={() => {
                        setView(item.key);
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                      className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] transition-all duration-200 cursor-pointer ${
                        active
                          ? 'uiverse-nav-pill--dark-active text-white font-semibold shadow-lg shadow-indigo-600/30'
                          : 'uiverse-nav-pill--dark text-slate-300 font-medium hover:text-white hover:translate-x-1'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                      <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                      {typeof item.count === 'number' && item.count > 0 && (
                        <span
                          className={`text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
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

          <div className="space-y-1 pt-3 border-t border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 px-3 pb-1">
              RACCOURCIS
            </p>
            <Link
              to="/teacher-dashboard"
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13.5px] font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all duration-200"
            >
              <GraduationCap className="w-4 h-4 shrink-0 text-slate-400" />
              <span className="flex-1 text-left truncate">Vue Enseignant</span>
            </Link>
            <Link
              to="/profile"
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13.5px] font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all duration-200"
            >
              <User className="w-4 h-4 shrink-0 text-slate-400" />
              <span className="flex-1 text-left truncate">Mon profil complet</span>
            </Link>
          </div>
        </nav>

        {/* Profil épinglé en bas de la sidebar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/95">
          <div className="uiverse-profile-glow--dark flex items-center gap-2.5 p-3">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border border-slate-600 shrink-0"
              />
            ) : (
              <span className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                {user.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              title="Se déconnecter"
              className="p-2 rounded-xl bg-slate-700/60 border border-slate-600/50 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 text-slate-300 transition cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className={`min-h-[calc(100vh-3.5rem)] transition-all duration-300 ${sidebarOpen ? 'lg:pl-[272px]' : ''}`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {/* Notification Toast */}
          {toast.text && (
            <div
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold shadow-lg ${
                toast.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
                <span>{toast.text}</span>
              </div>
              <button onClick={() => setToast({ type: '', text: '' })} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="space-y-6"
          >
          {/* ===================== 1. VUE D'ENSEMBLE ===================== */}
          {view === 'overview' && (
            <AdminOverviewTab
              overview={overview}
              courses={courses}
              usersList={usersList}
              subscriptions={subscriptions}
              reports={reports}
              securityLogs={securityLogs}
              onNavigateTab={(tab) => setView(tab)}
              onOpenCreateCourse={openCreateCourse}
              onOpenGrantSubModal={openGrantSubModal}
              onOpenSubModal={openGrantSubModal}
              onExportBackup={handleDownloadBackup}
              onOpenBroadcastModal={() => setView('notifications')}
              globalSearch={globalSearch}
            />
          )}

          {/* ===================== 2. MODULES & COURS ===================== */}
          {view === 'courses' && (
            <AdminCatalogPromoTab
              courses={courses}
              subscriptions={subscriptions}
              settings={draftSettings}
              courseSearch={courseSearch}
              setCourseSearch={setCourseSearch}
              globalSearch={globalSearch}
              onOpenCreateCourse={openCreateCourse}
              onOpenEditCourse={openEditCourse}
              onDeleteCourse={handleDeleteCourse}
              onRefresh={fetchAllData}
              showToast={showToast}
              setConfirmState={setConfirmState}
              formatLevel={formatLevel}
            />
          )}

          {/* ===================== 3. ABONNEMENTS ===================== */}
          {view === 'subscriptions' && (
            <AdminSubscriptionsTab
              subscriptions={subscriptions}
              usersList={usersList}
              onUpdateSub={async (id, payload, successMsg) => {
                await api(`/admin/subscriptions/${id}`, {
                  method: 'PUT',
                  body: JSON.stringify(payload),
                });
                showToast('success', successMsg || 'Abonnement mis à jour !');
                await fetchAllData();
              }}
              onDeleteSub={async (id) => {
                await api(`/admin/subscriptions/${id}`, { method: 'DELETE' });
                showToast('success', 'Abonnement supprimé avec succès.');
                await fetchAllData();
              }}
              onOpenGrantModal={openGrantSubModal}
              setToast={setToast}
              setConfirmState={setConfirmState}
              globalSearch={globalSearch}
            />
          )}

          {/* ===================== 4. UTILISATEURS ===================== */}
          {view === 'users' && (
            <AdminUsersTab
              usersList={usersList}
              subscriptions={subscriptions}
              courses={courses}
              settings={draftSettings}
              currentAdminId={user._id}
              onSuspendUser={handleSuspendUser}
              onToggleBlockUser={handleToggleBlockUser}
              onResetPassword={handleResetPassword}
              onDeleteUser={async (userId) => {
                const target = usersList.find((u) => u._id === userId);
                if (target) handleDeleteUser(target);
              }}
              onUpdateUserRole={async (userId, newRole) => {
                try {
                  await api(`/admin/users/${userId}/role`, {
                    method: 'PUT',
                    body: JSON.stringify({ role: newRole }),
                  });
                  showToast('success', 'Rôle mis à jour avec succès.');
                  await fetchAllData();
                } catch (err) {
                  showToast('error', err.message || 'Erreur lors du changement de rôle.');
                }
              }}
              onOpenCreateUser={openCreateUser}
              onOpenEditUser={openEditUser}
              onRefresh={fetchAllData}
              showToast={showToast}
              setConfirmState={setConfirmState}
              globalSearch={globalSearch}
            />
          )}

          {/* ===================== RÉSOLUTION DES PROBLÈMES & SUPPORT ===================== */}
          {view === 'troubleshooting' && (
            <AdminTroubleshootingTab
              courses={courses}
              usersList={usersList}
              subscriptions={subscriptions}
              reports={reports}
              onRefresh={fetchAllData}
              showToast={showToast}
              setConfirmState={setConfirmState}
              globalSearch={globalSearch}
            />
          )}

          {/* ===================== SÉCURITÉ & SIGNALEMENTS (PRIORITAIRE) ===================== */}
          {view === 'security' && (
            <AdminSecurityTab
              reports={reports}
              securityLogs={securityLogs}
              usersList={usersList}
              courses={courses}
              settings={draftSettings}
              onRefresh={fetchAllData}
              showToast={showToast}
              onUpdateReport={handleUpdateReport}
              onRefreshLogs={handleRefreshLogs}
              onSuspendUser={handleSuspendUser}
              onToggleBlockUser={handleToggleBlockUser}
              onDeleteContent={async (type, id) => {
                try {
                  if (type === 'course') {
                    await api(`/courses/${id}`, { method: 'DELETE' });
                    showToast('success', 'Module supprimé suite au signalement.');
                  } else if (type === 'review') {
                    await api(`/admin/reviews/${id}`, { method: 'DELETE' });
                    showToast('success', 'Avis supprimé suite au signalement.');
                  } else if (type === 'comment' || type === 'message') {
                    await api(`/admin/discussions/${id}`, { method: 'DELETE' });
                    showToast('success', 'Message de discussion supprimé suite au signalement.');
                  }
                  await fetchAllData();
                } catch (err) {
                  showToast('error', err.message || 'Erreur lors de la suppression du contenu.');
                }
              }}
              setToast={setToast}
              setConfirmState={setConfirmState}
              globalSearch={globalSearch}
            />
          )}

          {/* ===================== NOTIFICATIONS & ALERTES ===================== */}
          {view === 'notifications' && (
            <AdminNotificationsTab
              notifications={notifications}
              onRefreshNotifications={fetchAllData}
              onNavigateTab={(tab) => setView(tab)}
              setToast={setToast}
            />
          )}

          {/* ===================== 5. FONCTIONNALITÉS NO-CODE ===================== */}
          {view === 'features' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* En-tête de section moderne */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                        Fonctionnalités &amp; Extensions (Sans Code)
                      </h1>
                      <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                        No-Code Config
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Activez des fonctionnalités, ajoutez de nouvelles matières, niveaux ou ressources à la demande du professeur sans modifier le code.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
                  {savingSettings ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Synchronisation...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Paramètres synchronisés
                    </span>
                  )}
                </div>
              </div>

              {/* Interrupteurs de fonctionnalités de la plateforme */}
              <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        Modules fonctionnels de la plateforme
                      </h2>
                      <p className="text-xs text-slate-500">
                        Basculez instantanément les fonctionnalités clés en un clic.
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 self-start sm:self-auto">
                    {FEATURE_LIST.length} modules disponibles
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FEATURE_LIST.map((f) => {
                    const enabled = draftSettings.features?.[f.key] !== false;
                    const IconComponent = f.icon || Sparkles;
                    return (
                      <motion.div
                        key={f.key}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleToggleFeature(f.key)}
                        className={`group flex items-center justify-between gap-4 p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
                          enabled
                            ? 'bg-gradient-to-r from-blue-50/60 to-indigo-50/40 border-blue-200 shadow-xs'
                            : 'bg-slate-50/70 border-slate-200/90 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              enabled
                                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {f.title}
                              </p>
                              {f.category && (
                                <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 border border-slate-200 text-slate-500">
                                  {f.category}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                              {f.desc}
                            </p>
                          </div>
                        </div>

                        {/* Switch animé */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[11px] font-bold hidden sm:inline ${
                              enabled ? 'text-blue-700' : 'text-slate-400'
                            }`}
                          >
                            {enabled ? 'Actif' : 'Inactif'}
                          </span>
                          <div
                            className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-250 flex items-center cursor-pointer ${
                              enabled ? 'bg-blue-600' : 'bg-slate-300'
                            }`}
                          >
                            <motion.div
                              layout
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                                enabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>

              {/* Matières & Niveaux dynamiques */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Matières proposées */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-slate-900">Matières proposées</h2>
                          <p className="text-xs text-slate-500">Disciplines scientifiques et modules actifs.</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {availableSubjects.length} active{availableSubjects.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 min-h-[44px]">
                      {availableSubjects.map((sub) => (
                        <span
                          key={sub}
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50/80 text-indigo-900 border border-indigo-200 text-xs font-bold shadow-2xs hover:bg-indigo-100/70 transition"
                        >
                          <span>{sub}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(sub)}
                            className="w-4 h-4 rounded-full flex items-center justify-center text-indigo-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Retirer cette matière"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleAddSubject} className="flex gap-2 pt-3 border-t border-slate-100">
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Nouvelle matière (ex: SVT, Informatique...)"
                      className={inputClass}
                    />
                    <button
                      type="submit"
                      disabled={savingSettings || !newSubject.trim()}
                      className="px-5 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shrink-0 inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter</span>
                    </button>
                  </form>
                </section>

                {/* 2. Niveaux & Classes */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-slate-900">Niveaux &amp; Classes</h2>
                          <p className="text-xs text-slate-500">Classes sénégalaises du collège au lycée.</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {availableLevels.length} classe{availableLevels.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 min-h-[44px]">
                      {availableLevels.map((lvl) => (
                        <span
                          key={lvl.value}
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-950 border border-amber-200/90 text-xs font-bold shadow-2xs hover:bg-amber-100/70 transition"
                        >
                          <span>{lvl.label || lvl.value}</span>
                          <span className="text-[10px] text-amber-600 font-semibold px-1 rounded bg-amber-100/70">
                            {lvl.value}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveLevel(lvl.value)}
                            className="w-4 h-4 rounded-full flex items-center justify-center text-amber-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Retirer ce niveau"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleAddLevel} className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-3 border-t border-slate-100">
                    <input
                      type="text"
                      value={newLevelValue}
                      onChange={(e) => setNewLevelValue(e.target.value)}
                      placeholder="Code (ex: 4ème)"
                      className={`sm:col-span-2 ${inputClass}`}
                    />
                    <input
                      type="text"
                      value={newLevelLabel}
                      onChange={(e) => setNewLevelLabel(e.target.value)}
                      placeholder="Nom affiché (ex: Classe de 4ème)"
                      className={`sm:col-span-2 ${inputClass}`}
                    />
                    <button
                      type="submit"
                      disabled={savingSettings || !newLevelValue.trim()}
                      className="sm:col-span-1 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer shadow-sm transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter</span>
                    </button>
                  </form>
                </section>
              </div>

              {/* Extensions / Ressources personnalisées affichées sur l'accueil */}
              <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#009688] flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        Nouveaux services &amp; ressources personnalisées (Affichés sur l'accueil)
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Ajoutez un bouton ou service demandé par le professeur (ex : Annales BFEM/BAC, Groupe WhatsApp, Stage de révision...). Ces cartes s'affichent automatiquement sur la page d'accueil.
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 self-start sm:self-auto">
                    {(draftSettings.extraLinks || []).length} ressource{(draftSettings.extraLinks || []).length > 1 ? 's' : ''}
                  </span>
                </div>

                {(draftSettings.extraLinks || []).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {draftSettings.extraLinks.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col justify-between p-4.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all shadow-2xs"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
                              {item.badge || 'Nouveau'}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.active !== false
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {item.active !== false ? 'Actif sur l\'accueil' : 'Masqué'}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {item.title}
                          </h3>

                          {item.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}

                          <p className="text-[11px] text-blue-600 font-mono truncate bg-white px-2.5 py-1 rounded-lg border border-slate-200/80">
                            {item.url}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-200/70">
                          <button
                            type="button"
                            onClick={() => handleToggleExtraLink(idx)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              item.active !== false
                                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {item.active !== false ? 'Masquer' : 'Activer'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveExtraLink(idx)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Supprimer cette ressource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                    <p className="text-xs text-slate-500">
                      Aucune ressource personnalisée active. Remplissez le formulaire ci-dessous pour en créer une.
                    </p>
                  </div>
                )}

                {/* Formulaire d'ajout de ressource */}
                <form onSubmit={handleAddExtraLink} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-2">
                  <div className="lg:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Titre de la ressource
                    </label>
                    <input
                      type="text"
                      required
                      value={newExtraLink.title}
                      onChange={(e) => setNewExtraLink({ ...newExtraLink, title: e.target.value })}
                      placeholder="ex: Annales BFEM & BAC"
                      className={inputClass}
                    />
                  </div>

                  <div className="lg:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Courte description
                    </label>
                    <input
                      type="text"
                      value={newExtraLink.description}
                      onChange={(e) => setNewExtraLink({ ...newExtraLink, description: e.target.value })}
                      placeholder="ex: Sujets d'examen officiels avec corrigés types"
                      className={inputClass}
                    />
                  </div>

                  <div className="lg:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Lien URL ou page locale
                    </label>
                    <input
                      type="text"
                      required
                      value={newExtraLink.url}
                      onChange={(e) => setNewExtraLink({ ...newExtraLink, url: e.target.value })}
                      placeholder="ex: /courses ou https://..."
                      className={inputClass}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Badge
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newExtraLink.badge}
                        onChange={(e) => setNewExtraLink({ ...newExtraLink, badge: e.target.value })}
                        placeholder="Nouveau"
                        className={inputClass}
                      />
                      <button
                        type="submit"
                        disabled={savingSettings || !newExtraLink.title.trim() || !newExtraLink.url.trim()}
                        className="px-4 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shrink-0 inline-flex items-center gap-1 cursor-pointer shadow-sm transition"
                        title="Ajouter la ressource"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Ajouter</span>
                      </button>
                    </div>
                  </div>
                </form>
              </section>
            </motion.div>
          )}

          {/* ===================== 6. CONTENU & AVIS ===================== */}
          {view === 'content' && (
            <AdminContentTab
              draftSettings={draftSettings}
              setDraftSettings={setDraftSettings}
              persistSettings={persistSettings}
              reviews={reviews}
              onDeleteReview={handleDeleteReview}
              setToast={setToast}
              setConfirmState={setConfirmState}
              globalSearch={globalSearch}
            />
          )}

          {/* ===================== 7. PARAMÈTRES DU SITE ===================== */}
          {view === 'settings' && (
            <AdminSystemConfigTab
              draftSettings={draftSettings}
              setDraftSettings={setDraftSettings}
              courses={courses}
              onSaveSettings={() => persistSettings(draftSettings, 'Configuration système enregistrée !')}
              savingSettings={savingSettings}
              onDownloadBackup={handleDownloadBackup}
              showToast={showToast}
            />
          )}
          </motion.div>
        </div>
      </main>

      {/* ===================== MODAL COURS ===================== */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_25px_70px_rgba(15,23,42,0.25)] relative max-h-[92vh] overflow-y-auto"
          >
            <button
              onClick={() => setShowCourseModal(false)}
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
                  Renseignez les paramètres académiques, le niveau et le tarif du module.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Titre de la matière
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Mécanique de Newton et Lois du mouvement"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  required
                  placeholder="Décrivez les objectifs et chapitres de cette matière..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full h-24 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-[#2563eb]/10 transition shadow-2xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Matière
                  </label>
                  <select
                    value={courseForm.subject}
                    onChange={(e) => setCourseForm({ ...courseForm, subject: e.target.value })}
                    className={inputClass}
                  >
                    {availableSubjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Niveau
                  </label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                    className={inputClass}
                  >
                    {availableLevels.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label || l.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Professeur assigné
                  </label>
                  <select
                    value={courseForm.teacherId}
                    onChange={(e) => setCourseForm({ ...courseForm, teacherId: e.target.value })}
                    className={inputClass}
                  >
                    {teachersList.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({ROLE_LABELS[t.role]})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Durée
                  </label>
                  <input
                    type="text"
                    placeholder="ex: 3 mois"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                <div>
                  <span className="text-sm font-bold text-slate-800 block">Module gratuit</span>
                  <span className="text-xs text-slate-500">Accessible sans abonnement par tous les élèves</span>
                </div>
                <input
                  type="checkbox"
                  checked={courseForm.isFree}
                  onChange={(e) => setCourseForm({ ...courseForm, isFree: e.target.checked })}
                  className="w-5 h-5 rounded text-indigo-600 accent-[#2563eb] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {courseForm.isFree ? 'Valeur barrée (FCFA)' : 'Tarif (FCFA)'}
                  </label>
                  <input
                    type="number"
                    value={courseForm.isFree ? courseForm.originalPrice : courseForm.price}
                    onChange={(e) =>
                      setCourseForm(
                        courseForm.isFree
                          ? { ...courseForm, originalPrice: Number(e.target.value) }
                          : { ...courseForm, price: Number(e.target.value) }
                      )
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Image de couverture
                  </label>
                  <label className="flex items-center gap-2 px-3 h-11 bg-slate-50/70 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 rounded-xl cursor-pointer transition shadow-2xs">
                    <ImagePlus className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate text-xs font-semibold text-slate-600">
                      {courseImage ? courseImage.name : 'Choisir une image...'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCourseImage(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingCourse}
                  className="px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold transition shadow-md shadow-blue-600/25 hover:shadow-lg disabled:opacity-60 cursor-pointer"
                >
                  {savingCourse ? 'Enregistrement...' : editingCourse ? 'Mettre à jour' : 'Créer la matière'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ===================== MODAL UTILISATEUR ===================== */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_25px_70px_rgba(15,23,42,0.25)] relative max-h-[92vh] overflow-y-auto"
          >
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* En-tête */}
            <div className="flex items-center gap-3.5 mb-6 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {editingUser ? `Modifier : ${editingUser.name}` : 'Créer un compte utilisateur'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gérez les coordonnées, le rôle et les accès de l'utilisateur.
                </p>
              </div>
            </div>

            {userModalError && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{userModalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Mamadou Diallo"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Adresse email
                </label>
                <input
                  type="email"
                  required
                  placeholder="ex: mamadou.diallo@gmail.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Rôle
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className={inputClass}
                  >
                    <option value="student">Élève</option>
                    <option value="teacher">Professeur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    placeholder="+221 ..."
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {editingUser ? 'Nouveau mot de passe (laisser vide si inchangé)' : 'Mot de passe (requis)'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  minLength={6}
                  placeholder={editingUser ? '••••••••' : 'Minimum 6 caractères'}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className={inputClass}
                />
              </div>

              {editingUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Photo de profil (optionnel)
                  </label>
                  <label className="flex items-center gap-2 px-3 h-11 bg-slate-50/70 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 rounded-xl cursor-pointer transition shadow-2xs">
                    <ImagePlus className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate text-xs font-semibold text-slate-600">
                      {userAvatarFile ? userAvatarFile.name : 'Choisir une photo de profil...'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUserAvatarFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold transition shadow-md shadow-blue-600/25 hover:shadow-lg disabled:opacity-60 cursor-pointer"
                >
                  {savingUser ? 'Enregistrement...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ===================== MODAL ABONNEMENT MANUEL ===================== */}
      {showSubModal && (() => {
        const qSub = subStudentSearch.trim().toLowerCase();
        const filteredSubStudents = studentsList.filter(
          (st) =>
            !qSub ||
            (st.name || '').toLowerCase().includes(qSub) ||
            (st.email || '').toLowerCase().includes(qSub)
        );
        const filteredSubCourses = courses.filter(
          (c) => subLevelFilter === 'Tous' || formatLevel(c.level) === subLevelFilter || c.level === subLevelFilter
        );
        const selectedStudentObj = studentsList.find((st) => st._id === subForm.studentId);
        const selectedCourseObj = courses.find((c) => c._id === subForm.courseId);

        return (
          <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form
              onSubmit={handleGrantSub}
              className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Ouvrir un accès manuel à un élève
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Colonne gauche : Formulaire */}
                <div className="md:col-span-8 space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Rechercher un élève (Nom / Email)
                    </label>
                    <input
                      type="text"
                      value={subStudentSearch}
                      onChange={(e) => {
                        setSubStudentSearch(e.target.value);
                        const match = studentsList.find(
                          (st) =>
                            st.name?.toLowerCase().includes(e.target.value.toLowerCase()) ||
                            st.email?.toLowerCase().includes(e.target.value.toLowerCase())
                        );
                        if (match) setSubForm((prev) => ({ ...prev, studentId: match._id }));
                      }}
                      placeholder="ex: Fatou D. Sow ou email..."
                      className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 mb-1.5 focus:outline-none focus:bg-white focus:border-indigo-500"
                    />
                    <select
                      required
                      value={subForm.studentId}
                      onChange={(e) => setSubForm({ ...subForm, studentId: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                    >
                      <option value="">-- Choisir un élève --</option>
                      {filteredSubStudents.map((st) => (
                        <option key={st._id} value={st._id}>
                          {st.name} ({st.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Matière &amp; Cours à débloquer ({subSelectedCourseIds.length} sélectionné{subSelectedCourseIds.length > 1 ? 's' : ''})
                      </label>
                      <div className="max-h-32 overflow-y-auto rounded-xl bg-slate-50 border border-slate-200 p-2 space-y-1">
                        {filteredSubCourses.map((c) => {
                          const checked = subSelectedCourseIds.includes(c._id);
                          return (
                            <label
                              key={c._id}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition ${
                                checked ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-white'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setSubSelectedCourseIds((prev) =>
                                    prev.includes(c._id)
                                      ? prev.filter((id) => id !== c._id)
                                      : [...prev, c._id]
                                  );
                                }}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-[#2563eb]"
                              />
                              <span className="truncate">{c.title}</span>
                              <span className="text-[10px] text-slate-400 ml-auto shrink-0">
                                {formatLevel(c.level)}
                              </span>
                            </label>
                          );
                        })}
                        {filteredSubCourses.length === 0 && (
                          <p className="text-[11px] text-slate-400 py-2 text-center">Aucun cours pour ce niveau.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Niveau
                      </label>
                      <select
                        value={subLevelFilter}
                        onChange={(e) => setSubLevelFilter(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                      >
                        {['Tous', '4ème', '3ème', '2nde S', '1ère S', 'Terminale S'].map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Raison de l&apos;accès manuel
                    </label>
                    <input
                      type="text"
                      value={subReason}
                      onChange={(e) => setSubReason(e.target.value)}
                      placeholder="ex: Paiement espèces reçu, Cas exceptionnel..."
                      className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Durée (mois)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={36}
                        value={subForm.durationMonths}
                        onChange={(e) =>
                          setSubForm({ ...subForm, durationMonths: Number(e.target.value) })
                        }
                        className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mode
                      </label>
                      <select
                        value={subForm.paymentMethod}
                        onChange={(e) => setSubForm({ ...subForm, paymentMethod: e.target.value })}
                        className="w-full h-9 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                      >
                        <option value="Offert (Admin)">Offert</option>
                        <option value="Espèces">Espèces</option>
                        <option value="Wave">Wave direct</option>
                        <option value="Orange Money">Orange Money</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Montant (F CFA)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={subForm.amount}
                        onChange={(e) => setSubForm({ ...subForm, amount: Number(e.target.value) })}
                        className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-600 mr-1">Notification :</span>
                      <button
                        type="button"
                        onClick={() => setSubNotifyEmail(false)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                          !subNotifyEmail
                            ? 'bg-[#1e293b] text-white border-[#1e293b]'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        Ne pas notifier
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubNotifyEmail(true)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                          subNotifyEmail
                            ? 'bg-[#1e293b] text-white border-[#1e293b]'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        Envoyer Email confirmation
                      </button>
                    </div>

                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                      Accès Validé - Validité: {subForm.durationMonths || 1} Mois
                    </span>
                  </div>
                </div>

                {/* Colonne droite : Aperçu de l'accès */}
                <div className="md:col-span-4 bg-slate-50 rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between gap-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Aperçu de l&apos;accès</span>
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-1.5 pt-1">
                      <p>
                        Élève :{' '}
                        <strong className="text-slate-900">
                          {selectedStudentObj?.name || 'Non sélectionné'}
                        </strong>
                      </p>
                      <p>
                        Cours :{' '}
                        <strong className="text-slate-900">
                          {selectedCourseObj?.title || 'Non sélectionné'}
                        </strong>
                      </p>
                      <p>
                        Durée : <strong>{subForm.durationMonths || 1} mois</strong>
                      </p>
                      <p>
                        Paiement : <strong>{subForm.paymentMethod}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingSub}
                    className="gradient-button gradient-button--sm w-full !py-2.5 !text-xs flex items-center justify-center disabled:opacity-60"
                  >
                    {savingSub ? 'Activation...' : "Ouvrir l'accès maintenant"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        );
      })()}

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

export default AdminDashboard;
