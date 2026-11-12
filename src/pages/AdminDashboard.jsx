import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';
import api from '../utils/api';
import { formatLevel } from '../components/CourseCard';
import ConfirmModal from '../components/ConfirmModal';
import {
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
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
  ChevronRight,
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
} from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

const ROLE_BADGES = {
  admin: 'bg-teal-50 text-[#009688] border-teal-200',
  teacher: 'bg-amber-50 text-[#f59d0e] border-amber-200',
  student: 'bg-sky-50 text-sky-700 border-sky-200',
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
  },
  {
    key: 'enableFreeEnrollment',
    title: 'Inscription gratuite en 1 clic',
    desc: 'Autorise les élèves à débloquer les modules à 0 FCFA sans passer par le paiement.',
  },
  {
    key: 'enablePayments',
    title: 'Paiements Wave & Orange Money',
    desc: 'Active les boutons et formulaires d’abonnement payant sur les fiches de modules.',
  },
  {
    key: 'enableLiveMeet',
    title: 'Séances en direct (Google Meet / Jitsi)',
    desc: 'Active les leçons vidéo en direct et l’accès à la salle interactive.',
  },
  {
    key: 'enableQuiz',
    title: 'Quiz interactifs & évaluations',
    desc: 'Affiche l’onglet Quiz dans les cours et enregistre les notes des élèves.',
  },
  {
    key: 'enableForum',
    title: 'Salon de discussion & Q/R',
    desc: 'Active l’espace d’échange entre les élèves et le professeur dans chaque module.',
  },
  {
    key: 'enableReviews',
    title: 'Avis & notes des apprenants',
    desc: 'Permet aux élèves abonnés de laisser une note et un commentaire sur les modules.',
  },
  {
    key: 'enablePdfDownload',
    title: 'Supports & fiches PDF',
    desc: 'Autorise la consultation et le téléchargement des supports PDF dans les leçons.',
  },
  {
    key: 'enableShareButtons',
    title: 'Boutons de partage social',
    desc: 'Affiche Facebook, WhatsApp, TikTok et YouTube sur les pages publiques de modules.',
  },
  {
    key: 'enableSequentialUnlock',
    title: 'Déblocage progressif des sections',
    desc: "Déverrouille les chapitres et le quiz final au fur et à mesure que l'élève termine chaque section (style Bakeli).",
  },
];

const inputClass =
  'w-full h-10 px-3.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#009688] focus:ring-2 focus:ring-[#009688]/15 transition';

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

  // Modal Abonnement manuel
  const [showSubModal, setShowSubModal] = useState(false);
  const [subForm, setSubForm] = useState({
    studentId: '',
    courseId: '',
    paymentMethod: 'Offert (Admin)',
    amount: 0,
    durationMonths: 12,
  });
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
      const [ov, us, cs, subs, revs] = await Promise.all([
        api('/admin/overview'),
        api('/admin/users'),
        api('/courses'),
        api('/admin/subscriptions'),
        api('/admin/reviews'),
      ]);
      setOverview(ov);
      setUsersList(Array.isArray(us) ? us : []);
      setCourses(Array.isArray(cs) ? cs : []);
      setSubscriptions(Array.isArray(subs) ? subs : []);
      setReviews(Array.isArray(revs) ? revs : []);
    } catch (err) {
      showToast('error', err.message || 'Erreur lors du chargement du Back-Office');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllData();
    }
  }, [user?._id, user?.role]);

  if (authLoading || loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="loader-spinner"></div>
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
        showToast('success', 'Module mis à jour avec succès.');
      } else {
        await api('/courses', { method: 'POST', body: formData });
        showToast('success', 'Nouveau module créé avec succès.');
      }
      setShowCourseModal(false);
      await fetchAllData();
    } catch (err) {
      showToast('error', err.message || "Erreur lors de l'enregistrement du module");
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = (courseId) => {
    const target = courses.find((c) => c._id === courseId);
    setConfirmState({
      title: 'Supprimer le module',
      message: target
        ? `Voulez-vous vraiment supprimer le module "${target.title}" ?`
        : 'Supprimer définitivement ce module ?',
      details: 'Tous les chapitres, leçons, quiz et abonnements associés à ce module seront définitivement supprimés.',
      confirmLabel: 'Supprimer le module',
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
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      if (editingUser) {
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
      showToast('error', err.message || 'Erreur lors de la sauvegarde');
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
    setSubForm({
      studentId: studentsList[0]?._id || '',
      courseId: courses[0]?._id || '',
      paymentMethod: 'Offert (Admin)',
      amount: 0,
      durationMonths: 12,
    });
    setShowSubModal(true);
  };

  const handleGrantSub = async (e) => {
    e.preventDefault();
    setSavingSub(true);
    try {
      await api('/admin/subscriptions', {
        method: 'POST',
        body: JSON.stringify(subForm),
      });
      showToast('success', 'Abonnement accordé avec succès.');
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
    const nextFeatures = {
      ...draftSettings.features,
      [featureKey]: !draftSettings.features?.[featureKey],
    };
    const next = { ...draftSettings, features: nextFeatures };
    setDraftSettings(next);
    await persistSettings({ features: nextFeatures }, 'Fonctionnalité mise à jour immédiatement.');
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

  const sidebarItems = [
    { key: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
    { key: 'courses', label: 'Modules & Cours', icon: BookOpen, count: courses.length },
    { key: 'subscriptions', label: 'Abonnements', icon: CreditCard, count: subscriptions.length },
    { key: 'users', label: 'Utilisateurs', icon: Users, count: usersList.length },
    { key: 'features', label: 'Fonctionnalités', icon: Sliders },
    { key: 'content', label: 'Contenu & Avis', icon: Megaphone },
    { key: 'settings', label: 'Paramètres site', icon: Settings },
  ];

  const stats = overview?.stats || {
    users: { student: 0, teacher: 0, admin: 0, total: 0 },
    courses: { total: courses.length, free: 0, paid: 0 },
    subscriptions: { total: subscriptions.length, active: 0, expired: 0 },
    totalRevenue: 0,
    revenueByMethod: {},
    quizResultsCount: 0,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Barre du haut */}
      <header className="fixed top-0 inset-x-0 h-[72px] bg-white border-b border-slate-200 z-40 flex items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Aliou Sow Academy" className="h-9 w-auto" />
            <span className="hidden sm:block leading-tight">
              <span className="block text-sm font-extrabold text-slate-900 tracking-wide">ALIOU SOW</span>
              <span className="block text-[9px] font-bold tracking-[0.24em] text-[#009688]">ACADEMY</span>
            </span>
          </Link>
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-teal-50 text-[#009688] border border-teal-200 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            Back-Office Admin
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border border-slate-200 hover:border-[#009688] text-xs font-semibold text-slate-700 hover:text-[#009688] transition"
          >
            <Globe className="w-3.5 h-3.5" />
            Voir le site
          </Link>

          <button
            onClick={openCreateCourse}
            className="h-9 px-4 rounded-full bg-[#009688] hover:bg-[#00796b] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau Module</span>
          </button>

          <div className="relative">
            <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 cursor-pointer">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <span className="w-9 h-9 rounded-full bg-[#009688] text-white flex items-center justify-center text-sm font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              )}
              <span className="hidden md:block text-sm font-semibold text-slate-800 max-w-[140px] truncate">
                {user.name}
              </span>
              <ChevronDown className="hidden md:block w-4 h-4 text-slate-400" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-3 z-50">
                  <div className="px-4 pb-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-[#009688] uppercase">Administrateur</p>
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50"
                  >
                    <User className="w-4 h-4" />
                    Mon profil &amp; paramètres
                  </Link>
                  <Link
                    to="/teacher-dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Vue Enseignant
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 cursor-pointer"
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

      {/* Sidebar */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 top-[72px] bg-black/30 z-20"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      <aside
        className={`fixed top-[72px] bottom-0 left-0 w-64 bg-white border-r border-slate-200 z-30 px-4 py-6 overflow-y-auto transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <p className="text-[11px] font-bold tracking-wider text-slate-400 px-2 mb-3">
          ADMINISTRATION
        </p>
        <nav className="space-y-1.5">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setView(item.key);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  active ? 'bg-teal-50 text-[#009688]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    active ? 'bg-[#009688] text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className="flex-1 text-left truncate">{item.label}</span>
                {typeof item.count === 'number' && (
                  <span className="text-xs text-slate-400 font-bold">{item.count}</span>
                )}
              </button>
            );
          })}

          <div className="pt-3 mt-3 border-t border-slate-100">
            <Link
              to="/profile"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                <User className="w-4 h-4" />
              </span>
              <span className="flex-1 text-left">Mon profil complet</span>
            </Link>
          </div>
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
      <main className={`pt-[72px] min-h-screen transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Notification Toast */}
          {toast.text && (
            <div
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-sm ${
                toast.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-teal-50 border-teal-200 text-[#009688]'
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

          {/* ===================== 1. VUE D'ENSEMBLE ===================== */}
          {view === 'overview' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Pilotage de la Plateforme</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Vue globale en temps réel des revenus, utilisateurs, modules et fonctionnalités.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={openGrantSubModal}
                    className="px-4 py-2.5 rounded-lg bg-[#f59d0e] hover:bg-[#e08b00] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <CreditCard className="w-4 h-4" />
                    Accorder un abonnement
                  </button>
                  <button
                    onClick={() => setView('features')}
                    className="px-4 py-2.5 rounded-lg bg-white border border-slate-200 hover:border-[#009688] text-slate-700 hover:text-[#009688] text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Sliders className="w-4 h-4" />
                    Fonctionnalités sans code
                  </button>
                </div>
              </div>

              {/* 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Revenus totaux</span>
                    <span className="w-9 h-9 rounded-xl bg-amber-50 text-[#f59d0e] flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {Number(stats.totalRevenue || 0).toLocaleString('fr-FR')} <span className="text-sm font-bold">FCFA</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats.subscriptions.active} abonnement{stats.subscriptions.active > 1 ? 's' : ''} actif
                    {stats.subscriptions.active > 1 ? 's' : ''} / {stats.subscriptions.total}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Utilisateurs</span>
                    <span className="w-9 h-9 rounded-xl bg-teal-50 text-[#009688] flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">{stats.users.total}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats.users.student} élèves • {stats.users.teacher} profs • {stats.users.admin} admin
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Modules publiés</span>
                    <span className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">{stats.courses.total}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats.courses.paid} payants • {stats.courses.free} gratuits
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quiz &amp; Activité</span>
                    <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">{stats.quizResultsCount}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats.discussionsCount || 0} messages • {stats.reviewsCount || 0} avis
                  </p>
                </div>
              </div>

              {/* Répartition paiements + État système */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Répartition des encaissements</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.revenueByMethod || {}).length === 0 ? (
                      <p className="text-sm text-slate-400">Aucun paiement enregistré pour le moment.</p>
                    ) : (
                      Object.entries(stats.revenueByMethod).map(([method, amount]) => {
                        const pct = stats.totalRevenue > 0 ? Math.round((amount / stats.totalRevenue) * 100) : 0;
                        return (
                          <div key={method} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-700">{method}</span>
                              <span className="text-slate-900">
                                {Number(amount).toLocaleString('fr-FR')} FCFA ({pct}%)
                              </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#009688] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">État rapide de la plateforme</h3>
                    <button
                      onClick={() => setView('settings')}
                      className="text-xs font-bold text-[#009688] hover:underline cursor-pointer"
                    >
                      Configurer
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-slate-400 font-semibold">Matières configurées</p>
                      <p className="text-sm font-bold text-slate-900 mt-1 truncate">{availableSubjects.join(', ')}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-slate-400 font-semibold">Niveaux configurés</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">{availableLevels.length} niveaux actifs</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-slate-400 font-semibold">Bannière d&apos;annonce</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        {draftSettings.announcement?.active ? 'Visible sur le site' : 'Désactivée'}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-slate-400 font-semibold">Maintenance</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        {draftSettings.siteInfo?.maintenanceMode ? 'Mode maintenance ON' : 'En ligne'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activité récente */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">Derniers abonnements</h3>
                    <button
                      onClick={() => setView('subscriptions')}
                      className="text-xs font-bold text-[#009688] hover:underline cursor-pointer"
                    >
                      Tout voir
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(overview?.recentSubscriptions || []).slice(0, 5).map((sub) => (
                      <div key={sub._id} className="flex items-center justify-between text-sm bg-slate-50 p-3 rounded-xl">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{sub.student?.name || 'Élève'}</p>
                          <p className="text-xs text-slate-500 truncate">{sub.course?.title || 'Module'}</p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="font-bold text-[#009688] text-xs">
                            {Number(sub.amount || 0).toLocaleString('fr-FR')} F
                          </p>
                          <p className="text-[11px] text-slate-400">{sub.paymentMethod}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">Derniers comptes créés</h3>
                    <button
                      onClick={() => setView('users')}
                      className="text-xs font-bold text-[#009688] hover:underline cursor-pointer"
                    >
                      Tout voir
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(overview?.recentUsers || []).slice(0, 5).map((u) => (
                      <div key={u._id} className="flex items-center justify-between text-sm bg-slate-50 p-3 rounded-xl">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{u.name}</p>
                          <p className="text-xs text-slate-500 truncate">{u.email}</p>
                        </div>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                            ROLE_BADGES[u.role] || ROLE_BADGES.student
                          }`}
                        >
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== 2. MODULES & COURS ===================== */}
          {view === 'courses' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Gestion des Modules &amp; Cours</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Créez, modifiez, assignez un professeur ou ouvrez le gestionnaire de chapitres et quiz.
                  </p>
                </div>
                <button
                  onClick={openCreateCourse}
                  className="px-5 py-2.5 rounded-lg bg-[#009688] hover:bg-[#00796b] text-white text-sm font-bold flex items-center gap-2 cursor-pointer transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau Module
                </button>
              </div>

              <div className="relative max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Rechercher un module, matière, professeur..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#009688]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((c) => (
                  <div key={c._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden">
                        <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                        <span className="absolute top-3 right-3 text-[11px] font-bold bg-white/95 text-slate-800 px-2.5 py-1 rounded-full shadow-sm">
                          {c.studentsCount || 0} inscrit{(c.studentsCount || 0) > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full">
                            {c.subject}
                          </span>
                          <span className="text-[11px] font-semibold bg-amber-50 text-[#f59d0e] px-2.5 py-0.5 rounded-full">
                            {formatLevel(c.level)}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 line-clamp-2">{c.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                        <p className="text-xs text-slate-600 pt-1">
                          Prof : <strong>{c.teacher?.name || 'Non assigné'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-[#009688]">
                        {c.isFree || c.price === 0 ? 'Gratuit' : `${Number(c.price).toLocaleString('fr-FR')} FCFA`}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditCourse(c)}
                          className="p-2 rounded-lg bg-amber-50 text-[#f59d0e] hover:bg-[#f59d0e] hover:text-white transition cursor-pointer"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c._id)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/courses/${c._id}`}
                          className="p-2 rounded-lg bg-teal-50 text-[#009688] hover:bg-[#009688] hover:text-white transition"
                          title="Gérer chapitres, leçons & quiz"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== 3. ABONNEMENTS ===================== */}
          {view === 'subscriptions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Abonnements &amp; Paiements</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Suivez les paiements Wave / Orange Money, prolongez ou accordez des accès manuels.
                  </p>
                </div>
                <button
                  onClick={openGrantSubModal}
                  className="px-5 py-2.5 rounded-lg bg-[#f59d0e] hover:bg-[#e08b00] text-white text-sm font-bold flex items-center gap-2 cursor-pointer transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Accorder un abonnement
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                    placeholder="Rechercher un élève, module, n° transaction..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#009688]"
                  />
                </div>
                <div className="flex gap-2">
                  {[
                    { key: 'all', label: 'Tous' },
                    { key: 'active', label: 'Actifs' },
                    { key: 'expired', label: 'Expirés' },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setSubStatusFilter(f.key)}
                      className={`px-4 h-10 rounded-xl text-xs font-bold border cursor-pointer transition ${
                        subStatusFilter === f.key
                          ? 'bg-[#009688] text-white border-[#009688]'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-5 py-3.5">Élève</th>
                        <th className="px-5 py-3.5">Module</th>
                        <th className="px-5 py-3.5">Paiement</th>
                        <th className="px-5 py-3.5">Expire le</th>
                        <th className="px-5 py-3.5">Statut</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSubs.map((s) => {
                        const active = s.status === 'active' && new Date(s.expiresAt) > now;
                        return (
                          <tr key={s._id} className="hover:bg-slate-50/60">
                            <td className="px-5 py-3.5">
                              <p className="font-bold text-slate-900">{s.student?.name || 'Supprimé'}</p>
                              <p className="text-xs text-slate-400">{s.student?.email}</p>
                            </td>
                            <td className="px-5 py-3.5">
                              <p className="font-semibold text-slate-800">{s.course?.title || 'Module supprimé'}</p>
                              <p className="text-xs text-slate-400">{s.transactionId}</p>
                            </td>
                            <td className="px-5 py-3.5">
                              <p className="font-bold text-slate-900">
                                {Number(s.amount || 0).toLocaleString('fr-FR')} FCFA
                              </p>
                              <p className="text-xs text-slate-500">{s.paymentMethod}</p>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-600">
                              {new Date(s.expiresAt).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                  active ? 'bg-teal-50 text-[#009688]' : 'bg-red-50 text-red-600'
                                }`}
                              >
                                {active ? 'Actif' : 'Expiré'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() =>
                                    handleUpdateSub(s._id, { extendMonths: 1 }, 'Abonnement prolongé de 1 mois.')
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-teal-50 text-[#009688] hover:bg-[#009688] hover:text-white text-xs font-bold cursor-pointer transition inline-flex items-center gap-1"
                                  title="Prolonger de 1 mois"
                                >
                                  <CalendarPlus className="w-3.5 h-3.5" />
                                  +1m
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateSub(
                                      s._id,
                                      { status: active ? 'expired' : 'active' },
                                      active ? 'Abonnement suspendu.' : 'Abonnement réactivé.'
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-amber-50 text-[#f59d0e] hover:bg-[#f59d0e] hover:text-white text-xs font-bold cursor-pointer transition"
                                >
                                  {active ? 'Expirer' : 'Activer'}
                                </button>
                                <button
                                  onClick={() => handleDeleteSub(s._id)}
                                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white cursor-pointer transition"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== 4. UTILISATEURS ===================== */}
          {view === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Utilisateurs &amp; Rôles</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Gérez les élèves, le compte professeur et les accès administrateurs.
                  </p>
                </div>
                <button
                  onClick={openCreateUser}
                  className="px-5 py-2.5 rounded-lg bg-[#009688] hover:bg-[#00796b] text-white text-sm font-bold flex items-center gap-2 cursor-pointer transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un utilisateur
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Rechercher par nom, email ou téléphone..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#009688]"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'Tous' },
                    { key: 'student', label: 'Élèves' },
                    { key: 'teacher', label: 'Professeurs' },
                    { key: 'admin', label: 'Admins' },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setUserRoleFilter(f.key)}
                      className={`px-4 h-10 rounded-xl text-xs font-bold border cursor-pointer transition ${
                        userRoleFilter === f.key
                          ? 'bg-[#009688] text-white border-[#009688]'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-5 py-3.5">Utilisateur</th>
                        <th className="px-5 py-3.5">Rôle</th>
                        <th className="px-5 py-3.5">Activité</th>
                        <th className="px-5 py-3.5">Statut</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u) => {
                        const active = u.isActive !== false;
                        const isSelf = u._id === user._id;
                        return (
                          <tr key={u._id} className="hover:bg-slate-50/60">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={u.avatar}
                                  alt={u.name}
                                  referrerPolicy="no-referrer"
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                                <div>
                                  <p className="font-bold text-slate-900">
                                    {u.name} {isSelf && <span className="text-[10px] text-[#009688]">(Vous)</span>}
                                  </p>
                                  <p className="text-xs text-slate-500">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                  ROLE_BADGES[u.role] || ROLE_BADGES.student
                                }`}
                              >
                                {ROLE_LABELS[u.role] || u.role}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-600">
                              {u.role === 'teacher'
                                ? `${u.coursesCount || 0} cours`
                                : `${u.activeSubscriptionsCount || 0} abonnement(s)`}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                  active ? 'bg-teal-50 text-[#009688]' : 'bg-red-50 text-red-600'
                                }`}
                              >
                                {active ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                                {active ? 'Actif' : 'Suspendu'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => openEditUser(u)}
                                  className="p-2 rounded-lg bg-amber-50 text-[#f59d0e] hover:bg-[#f59d0e] hover:text-white transition cursor-pointer"
                                  title="Modifier / Rôle / Mot de passe"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {!isSelf && (
                                  <>
                                    <button
                                      onClick={() => handleToggleUserActive(u)}
                                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer transition"
                                    >
                                      {active ? 'Suspendre' : 'Activer'}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(u)}
                                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition cursor-pointer"
                                      title="Supprimer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== 5. FONCTIONNALITÉS NO-CODE ===================== */}
          {view === 'features' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">
                  Fonctionnalités &amp; Extensions (Sans Code)
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Activez des fonctionnalités, ajoutez de nouvelles matières, niveaux ou ressources à la demande du professeur sans modifier le code.
                </p>
              </div>

              {/* Interrupteurs de fonctionnalités */}
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="w-5 h-5 text-[#009688]" />
                  <h2 className="text-base font-bold text-slate-900">Modules fonctionnels de la plateforme</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FEATURE_LIST.map((f) => {
                    const enabled = draftSettings.features?.[f.key] !== false;
                    return (
                      <div
                        key={f.key}
                        onClick={() => handleToggleFeature(f.key)}
                        className={`flex items-center justify-between gap-4 p-4 rounded-xl border cursor-pointer transition ${
                          enabled ? 'bg-teal-50/40 border-teal-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">{f.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                        </div>
                        <div
                          className={`w-11 h-6 rounded-full relative transition-colors duration-300 shrink-0 ${
                            enabled ? 'bg-[#009688]' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                              enabled ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Matières & Niveaux dynamiques */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Layers className="w-5 h-5 text-[#009688]" />
                    <h2 className="text-base font-bold text-slate-900">Matières proposées</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSubjects.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-[#009688] border border-teal-200 text-xs font-bold"
                      >
                        {sub}
                        <button
                          onClick={() => handleRemoveSubject(sub)}
                          className="hover:text-red-600 cursor-pointer"
                          title="Retirer cette matière"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <form onSubmit={handleAddSubject} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Nouvelle matière (ex: SVT, Anglais...)"
                      className={inputClass}
                    />
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="px-4 h-10 rounded-lg bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Ajouter
                    </button>
                  </form>
                </section>

                <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <GraduationCap className="w-5 h-5 text-[#f59d0e]" />
                    <h2 className="text-base font-bold text-slate-900">Niveaux &amp; Classes</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableLevels.map((lvl) => (
                      <span
                        key={lvl.value}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-[#f59d0e] border border-amber-200 text-xs font-bold"
                      >
                        {lvl.label || lvl.value}
                        <button
                          onClick={() => handleRemoveLevel(lvl.value)}
                          className="hover:text-red-600 cursor-pointer"
                          title="Retirer ce niveau"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <form onSubmit={handleAddLevel} className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                    <input
                      type="text"
                      value={newLevelValue}
                      onChange={(e) => setNewLevelValue(e.target.value)}
                      placeholder="Code (ex: 6ème)"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={newLevelLabel}
                      onChange={(e) => setNewLevelLabel(e.target.value)}
                      placeholder="Nom affiché (ex: 6ème)"
                      className={inputClass}
                    />
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="h-10 rounded-lg bg-[#f59d0e] hover:bg-[#e08b00] text-white text-xs font-bold cursor-pointer"
                    >
                      Ajouter niveau
                    </button>
                  </form>
                </section>
              </div>

              {/* Extensions / Ressources personnalisées */}
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900">
                    Nouveaux services &amp; ressources personnalisées (Affichés sur l&apos;accueil)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ajoutez un bouton ou service demandé par le professeur (ex : Annales BFEM/BAC, Groupe WhatsApp, Stage de révision...).
                  </p>
                </div>

                {(draftSettings.extraLinks || []).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {draftSettings.extraLinks.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold bg-[#009688] text-white px-2 py-0.5 rounded-full">
                              {item.badge || 'Nouveau'}
                            </span>
                            <p className="text-sm font-bold text-slate-900 truncate">{item.title}</p>
                          </div>
                          {item.description && (
                            <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                          )}
                          <p className="text-[11px] text-[#009688] truncate mt-1">{item.url}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleToggleExtraLink(idx)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                              item.active ? 'bg-teal-100 text-[#009688]' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {item.active ? 'Actif' : 'Masqué'}
                          </button>
                          <button
                            onClick={() => handleRemoveExtraLink(idx)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleAddExtraLink} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  <input
                    type="text"
                    required
                    value={newExtraLink.title}
                    onChange={(e) => setNewExtraLink({ ...newExtraLink, title: e.target.value })}
                    placeholder="Titre (ex: Annales Bac)"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={newExtraLink.description}
                    onChange={(e) => setNewExtraLink({ ...newExtraLink, description: e.target.value })}
                    placeholder="Courte description"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    required
                    value={newExtraLink.url}
                    onChange={(e) => setNewExtraLink({ ...newExtraLink, url: e.target.value })}
                    placeholder="Lien URL ou /courses"
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newExtraLink.badge}
                      onChange={(e) => setNewExtraLink({ ...newExtraLink, badge: e.target.value })}
                      placeholder="Badge"
                      className={inputClass}
                    />
                    <button
                      type="submit"
                      className="px-4 h-10 rounded-lg bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Ajouter
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}

          {/* ===================== 6. CONTENU & AVIS ===================== */}
          {view === 'content' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Contenu, Annonces &amp; Modération</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Pilotez la bannière d&apos;annonce, les FAQ, les témoignages de l&apos;accueil et modérez les avis.
                </p>
              </div>

              {/* Bannière d'annonce */}
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-[#f59d0e]" />
                    <h2 className="text-base font-bold text-slate-900">Bannière d&apos;annonce globale</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDraftSettings((prev) => ({
                        ...prev,
                        announcement: { ...prev.announcement, active: !prev.announcement?.active },
                      }))
                    }
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition ${
                      draftSettings.announcement?.active
                        ? 'bg-[#009688] text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {draftSettings.announcement?.active ? 'Activée sur le site' : 'Désactivée'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Message affiché</label>
                    <input
                      type="text"
                      value={draftSettings.announcement?.message || ''}
                      onChange={(e) =>
                        setDraftSettings((prev) => ({
                          ...prev,
                          announcement: { ...prev.announcement, message: e.target.value },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Texte du bouton</label>
                    <input
                      type="text"
                      value={draftSettings.announcement?.buttonText || ''}
                      onChange={(e) =>
                        setDraftSettings((prev) => ({
                          ...prev,
                          announcement: { ...prev.announcement, buttonText: e.target.value },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Lien de redirection</label>
                    <input
                      type="text"
                      value={draftSettings.announcement?.link || ''}
                      onChange={(e) =>
                        setDraftSettings((prev) => ({
                          ...prev,
                          announcement: { ...prev.announcement, link: e.target.value },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() =>
                      persistSettings({ announcement: draftSettings.announcement }, 'Bannière mise à jour !')
                    }
                    className="px-5 py-2.5 rounded-lg bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold cursor-pointer"
                  >
                    Enregistrer la bannière
                  </button>
                </div>
              </section>

              {/* FAQs & Témoignages */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Foire aux Questions (FAQ)
                  </h2>
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {(draftSettings.faqs || []).map((f, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{f.question}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{f.answer}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveFaq(idx)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg self-start cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleAddFaq} className="space-y-2 pt-2">
                    <input
                      type="text"
                      required
                      value={newFaq.question}
                      onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                      placeholder="Question..."
                      className={inputClass}
                    />
                    <textarea
                      required
                      value={newFaq.answer}
                      onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                      placeholder="Réponse..."
                      className="w-full h-20 p-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#009688]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-[#009688] text-white text-xs font-bold cursor-pointer"
                    >
                      Ajouter cette FAQ
                    </button>
                  </form>
                </section>

                <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Témoignages de la page d&apos;accueil
                  </h2>
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {(draftSettings.testimonials || []).map((t, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {t.name} <span className="text-[#009688]">({t.level})</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">&ldquo;{t.quote}&rdquo;</p>
                        </div>
                        <button
                          onClick={() => handleRemoveTestimonial(idx)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg self-start cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleAddTestimonial} className="space-y-2 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={newTestimonial.name}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                        placeholder="Nom élève"
                        className={inputClass}
                      />
                      <input
                        type="text"
                        required
                        value={newTestimonial.level}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, level: e.target.value })}
                        placeholder="Classe (ex: Terminale S)"
                        className={inputClass}
                      />
                    </div>
                    <textarea
                      required
                      value={newTestimonial.quote}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, quote: e.target.value })}
                      placeholder="Témoignage..."
                      className="w-full h-20 p-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#009688]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-[#f59d0e] text-white text-xs font-bold cursor-pointer"
                    >
                      Ajouter ce témoignage
                    </button>
                  </form>
                </section>
              </div>

              {/* Modération des avis */}
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <MessageSquare className="w-5 h-5 text-[#009688]" />
                  <h2 className="text-base font-bold text-slate-900">Avis des élèves ({reviews.length})</h2>
                </div>
                {reviews.length === 0 ? (
                  <p className="text-sm text-slate-400">Aucun avis soumis sur les modules pour le moment.</p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((r) => (
                      <div key={r._id} className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{r.student?.name || 'Élève'}</span>
                            <span className="text-xs text-[#009688] font-semibold">• {r.course?.title}</span>
                          </div>
                          <div className="flex items-center gap-0.5 my-1 text-[#f59d0e]">
                            {Array.from({ length: r.rating || 5 }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                          <p className="text-xs text-slate-600">{r.comment}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteReview(r._id)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ===================== 7. PARAMÈTRES DU SITE ===================== */}
          {view === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Paramètres Généraux du Site</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Configurez l&apos;identité de la plateforme, les coordonnées, les numéros de paiement et les réseaux sociaux.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Identité &amp; Tarification par défaut
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Nom de la plateforme</label>
                      <input
                        type="text"
                        value={draftSettings.siteInfo?.platformName || ''}
                        onChange={(e) =>
                          setDraftSettings((prev) => ({
                            ...prev,
                            siteInfo: { ...prev.siteInfo, platformName: e.target.value },
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Nom affiché du professeur principal</label>
                      <input
                        type="text"
                        value={draftSettings.siteInfo?.teacherDisplayName || ''}
                        onChange={(e) =>
                          setDraftSettings((prev) => ({
                            ...prev,
                            siteInfo: { ...prev.siteInfo, teacherDisplayName: e.target.value },
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Tarif standard (FCFA)</label>
                        <input
                          type="number"
                          value={draftSettings.siteInfo?.defaultPrice ?? 6000}
                          onChange={(e) =>
                            setDraftSettings((prev) => ({
                              ...prev,
                              siteInfo: { ...prev.siteInfo, defaultPrice: Number(e.target.value) },
                            }))
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Durée standard</label>
                        <input
                          type="text"
                          value={draftSettings.siteInfo?.defaultDuration || ''}
                          onChange={(e) =>
                            setDraftSettings((prev) => ({
                              ...prev,
                              siteInfo: { ...prev.siteInfo, defaultDuration: e.target.value },
                            }))
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Numéro Wave</label>
                        <input
                          type="text"
                          value={draftSettings.siteInfo?.waveNumber || ''}
                          onChange={(e) =>
                            setDraftSettings((prev) => ({
                              ...prev,
                              siteInfo: { ...prev.siteInfo, waveNumber: e.target.value },
                            }))
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Numéro Orange Money</label>
                        <input
                          type="text"
                          value={draftSettings.siteInfo?.orangeMoneyNumber || ''}
                          onChange={(e) =>
                            setDraftSettings((prev) => ({
                              ...prev,
                              siteInfo: { ...prev.siteInfo, orangeMoneyNumber: e.target.value },
                            }))
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div
                      onClick={() =>
                        setDraftSettings((prev) => ({
                          ...prev,
                          siteInfo: {
                            ...prev.siteInfo,
                            maintenanceMode: !prev.siteInfo?.maintenanceMode,
                          },
                        }))
                      }
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900">Mode Maintenance</p>
                        <p className="text-xs text-slate-500">Affiche un bandeau de maintenance aux visiteurs.</p>
                      </div>
                      <div
                        className={`w-11 h-6 rounded-full relative transition-colors ${
                          draftSettings.siteInfo?.maintenanceMode ? 'bg-red-500' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            draftSettings.siteInfo?.maintenanceMode ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Coordonnées &amp; Réseaux sociaux
                  </h2>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Téléphone contact</label>
                        <input
                          type="text"
                          value={draftSettings.channels?.contactPhone || ''}
                          onChange={(e) =>
                            setDraftSettings((prev) => ({
                              ...prev,
                              channels: { ...prev.channels, contactPhone: e.target.value },
                            }))
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Numéro WhatsApp</label>
                        <input
                          type="text"
                          value={draftSettings.channels?.whatsappNumber || ''}
                          onChange={(e) =>
                            setDraftSettings((prev) => ({
                              ...prev,
                              channels: { ...prev.channels, whatsappNumber: e.target.value },
                            }))
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">E-mail de contact public</label>
                      <input
                        type="email"
                        value={draftSettings.channels?.contactEmail || ''}
                        onChange={(e) =>
                          setDraftSettings((prev) => ({
                            ...prev,
                            channels: { ...prev.channels, contactEmail: e.target.value },
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Lien TikTok</label>
                      <input
                        type="url"
                        value={draftSettings.channels?.tiktokUrl || ''}
                        onChange={(e) =>
                          setDraftSettings((prev) => ({
                            ...prev,
                            channels: { ...prev.channels, tiktokUrl: e.target.value },
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Lien YouTube</label>
                      <input
                        type="url"
                        value={draftSettings.channels?.youtubeUrl || ''}
                        onChange={(e) =>
                          setDraftSettings((prev) => ({
                            ...prev,
                            channels: { ...prev.channels, youtubeUrl: e.target.value },
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Lien Google Meet par défaut</label>
                      <input
                        type="url"
                        value={draftSettings.channels?.globalMeetLink || ''}
                        onChange={(e) =>
                          setDraftSettings((prev) => ({
                            ...prev,
                            channels: { ...prev.channels, globalMeetLink: e.target.value },
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                </section>
              </div>

              <div className="flex justify-end">
                <button
                  disabled={savingSettings}
                  onClick={() =>
                    persistSettings(
                      { siteInfo: draftSettings.siteInfo, channels: draftSettings.channels },
                      'Paramètres du site sauvegardés !'
                    )
                  }
                  className="h-11 px-8 rounded-lg bg-[#009688] hover:bg-[#00796b] text-white text-sm font-bold cursor-pointer transition"
                >
                  {savingSettings ? 'Enregistrement...' : 'Sauvegarder tous les paramètres'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ===================== MODAL COURS ===================== */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCourseModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-extrabold text-slate-900 mb-4">
              {editingCourse ? 'Modifier le module' : 'Créer un module de cours'}
            </h3>
            <form onSubmit={handleSaveCourse} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600">Titre du module</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Description</label>
                <textarea
                  required
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full h-20 p-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#009688]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Matière</label>
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
                  <label className="text-xs font-semibold text-slate-600">Niveau</label>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Professeur assigné</label>
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
                  <label className="text-xs font-semibold text-slate-600">Durée</label>
                  <input
                    type="text"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-sm font-semibold text-slate-700">Module gratuit</span>
                <input
                  type="checkbox"
                  checked={courseForm.isFree}
                  onChange={(e) => setCourseForm({ ...courseForm, isFree: e.target.checked })}
                  className="w-4 h-4 accent-[#009688]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    {courseForm.isFree ? 'Valeur normale barrée (FCFA)' : 'Tarif (FCFA)'}
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
                  <label className="text-xs font-semibold text-slate-600">Image de couverture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCourseImage(e.target.files[0])}
                    className="block w-full text-xs text-slate-500 mt-2"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={savingCourse}
                className="w-full h-11 rounded-lg bg-[#009688] hover:bg-[#00796b] text-white text-sm font-bold cursor-pointer mt-2"
              >
                {savingCourse ? 'Enregistrement...' : editingCourse ? 'Mettre à jour' : 'Créer le module'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL UTILISATEUR ===================== */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-extrabold text-slate-900 mb-4">
              {editingUser ? `Modifier : ${editingUser.name}` : 'Créer un compte utilisateur'}
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600">Nom complet</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Email</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Rôle</label>
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
                  <label className="text-xs font-semibold text-slate-600">Téléphone</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  {editingUser ? 'Nouveau mot de passe (laisser vide si inchangé)' : 'Mot de passe *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  minLength={6}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={savingUser}
                className="w-full h-11 rounded-lg bg-[#009688] hover:bg-[#00796b] text-white text-sm font-bold cursor-pointer mt-2"
              >
                {savingUser ? 'Enregistrement...' : 'Sauvegarder'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL ABONNEMENT MANUEL ===================== */}
      {showSubModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setShowSubModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-extrabold text-slate-900 mb-4">Accorder un abonnement manuel</h3>
            <form onSubmit={handleGrantSub} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600">Élève</label>
                <select
                  required
                  value={subForm.studentId}
                  onChange={(e) => setSubForm({ ...subForm, studentId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">-- Choisir un élève --</option>
                  {studentsList.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name} ({st.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Module de cours</label>
                <select
                  required
                  value={subForm.courseId}
                  onChange={(e) => setSubForm({ ...subForm, courseId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">-- Choisir un module --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.subject} - {formatLevel(c.level)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Mode</label>
                  <select
                    value={subForm.paymentMethod}
                    onChange={(e) => setSubForm({ ...subForm, paymentMethod: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Offert (Admin)">Offert (Admin)</option>
                    <option value="Wave">Wave (Validé)</option>
                    <option value="Orange Money">Orange Money (Validé)</option>
                    <option value="Espèces">Espèces</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Durée (mois)</label>
                  <input
                    type="number"
                    min={1}
                    max={36}
                    value={subForm.durationMonths}
                    onChange={(e) => setSubForm({ ...subForm, durationMonths: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Montant (FCFA)</label>
                <input
                  type="number"
                  min={0}
                  value={subForm.amount}
                  onChange={(e) => setSubForm({ ...subForm, amount: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={savingSub}
                className="w-full h-11 rounded-lg bg-[#f59d0e] hover:bg-[#e08b00] text-white text-sm font-bold cursor-pointer mt-2"
              >
                {savingSub ? 'Activation...' : "Activer l'accès élève"}
              </button>
            </form>
          </div>
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

export default AdminDashboard;
