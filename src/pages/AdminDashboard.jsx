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
    title: 'Avis & notes des élèves',
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
  {
    key: 'enableAppInstall',
    title: "Guide & Bannière d'installation de l'application (PWA)",
    desc: "Affiche ou masque la section « Apprenez partout, même hors ligne » et le guide « Comment installer ? » sur la page d'accueil.",
  },
];

const inputClass =
  'w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 transition';

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
  const [userAvatarFile, setUserAvatarFile] = useState(null);
  const [userModalError, setUserModalError] = useState('');

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
      <div className="theme-myschools min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6372e8] via-[#6b5cc4] to-[#7c52a5]">
        <div className="bg-white/95 rounded-2xl p-6 shadow-xl">
          <div className="loader-spinner"></div>
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
    { key: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard, group: 'TABLEAU DE BORD' },
    { key: 'courses', label: 'Modules & Cours', icon: BookOpen, count: courses.length, group: 'GESTION' },
    { key: 'subscriptions', label: 'Abonnements', icon: CreditCard, count: subscriptions.length, group: 'GESTION' },
    { key: 'users', label: 'Utilisateurs', icon: Users, count: usersList.length, group: 'GESTION' },
    { key: 'features', label: 'Fonctionnalités', icon: Sliders, group: 'CONFIGURATION' },
    { key: 'content', label: 'Contenu & Avis', icon: Megaphone, group: 'CONFIGURATION' },
    { key: 'settings', label: 'Paramètres site', icon: Settings, group: 'CONFIGURATION' },
  ];

  const sidebarGroups = ['TABLEAU DE BORD', 'GESTION', 'CONFIGURATION'];

  const stats = overview?.stats || {
    users: { student: 0, teacher: 0, admin: 0, total: 0 },
    courses: { total: courses.length, free: 0, paid: 0 },
    subscriptions: { total: subscriptions.length, active: 0, expired: 0 },
    totalRevenue: 0,
    revenueByMethod: {},
    quizResultsCount: 0,
  };

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
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrateur
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
                            active ? 'bg-white text-[#4c3882]' : 'bg-white/15 text-white'
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

          <div className="space-y-1 pt-2 border-t border-white/10">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/55 px-3 pt-1 pb-1">
              RACCOURCIS
            </p>
            <Link
              to="/teacher-dashboard"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-white/85 hover:bg-white/10 hover:text-white transition"
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left truncate">Vue Enseignant</span>
            </Link>
            <Link
              to="/profile"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-white/85 hover:bg-white/10 hover:text-white transition"
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left truncate">Mon profil complet</span>
            </Link>
          </div>
        </nav>

        {/* Profil épinglé en bas de la sidebar */}
        <div className="border-t border-white/15 bg-black/15 p-3.5">
          <div className="flex items-center gap-2.5">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border-2 border-white/30 shrink-0"
              />
            ) : (
              <span className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                {user.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-white/70 truncate">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
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
                    Back-Office
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">Administration centrale de la plateforme</p>
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
                onClick={openCreateCourse}
                className="h-9 px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nouveau Module</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-[#eef2fb]/70 hover:bg-[#eef2fb] cursor-pointer transition"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-indigo-200"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-[#5c6be0] text-white flex items-center justify-center text-xs font-semibold">
                      {user.name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  )}
                  <span className="hidden md:block text-[13px] font-semibold text-slate-800 max-w-[130px] truncate">
                    {user.name}
                  </span>
                  <span className="hidden lg:inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ef4444] text-white">
                    Admin
                  </span>
                  <ChevronDown className="hidden md:block w-3.5 h-3.5 text-slate-400" />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                    <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50">
                      <div className="px-4 pb-3 border-b border-slate-100">
                        <p className="text-[11px] font-bold text-[#ef4444] uppercase">Administrateur</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-800 hover:bg-[#eef2fb]/60"
                      >
                        <User className="w-4 h-4 text-[#5c6be0]" />
                        Mon profil &amp; paramètres
                      </Link>
                      <Link
                        to="/teacher-dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-800 hover:bg-[#eef2fb]/60"
                      >
                        <GraduationCap className="w-4 h-4 text-[#5c6be0]" />
                        Vue Enseignant
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
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

          {/* ===================== 1. VUE D'ENSEMBLE ===================== */}
          {view === 'overview' && (
            <div className="space-y-5">
              {/* Bannière titre de section */}
              <div className="bg-white rounded-2xl shadow-md px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#5c6be0] to-[#4657d4] text-white flex items-center justify-center shadow-sm shrink-0">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-[22px] font-bold tracking-tight text-slate-800">Pilotage de la Plateforme</h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">
                      Vue globale en temps réel des revenus, utilisateurs, modules et fonctionnalités.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={openGrantSubModal}
                    className="px-4 py-2.5 rounded-xl bg-[#f59d0e] hover:bg-[#e08b00] text-white text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                  >
                    <CreditCard className="w-4 h-4" />
                    Accorder un abonnement
                  </button>
                  <button
                    onClick={() => setView('features')}
                    className="px-4 py-2.5 rounded-xl bg-[#eef2fb] hover:bg-indigo-100 text-[#4c3882] text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Sliders className="w-4 h-4" />
                    Fonctionnalités sans code
                  </button>
                </div>
              </div>

              {/* 4 KPI Cards Gradient */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-gradient-to-br from-[#5c6be0] to-[#4657d4] text-white rounded-2xl p-6 shadow-lg text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="text-[26px] sm:text-[28px] font-bold tracking-tight tabular-nums leading-tight">
                    {Number(stats.totalRevenue || 0).toLocaleString('fr-FR')} <span className="text-sm font-semibold">F</span>
                  </div>
                  <div className="text-[13px] font-semibold text-white/95 mt-1">
                    Revenus totaux
                  </div>
                  <p className="text-xs font-medium text-white/80 mt-1">
                    {stats.subscriptions.active} actif{stats.subscriptions.active > 1 ? 's' : ''} / {stats.subscriptions.total}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#ec4899] to-[#f43f5e] text-white rounded-2xl p-6 shadow-lg text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-[26px] sm:text-[28px] font-bold tracking-tight tabular-nums leading-tight">{stats.users.total}</div>
                  <div className="text-[13px] font-semibold text-white/95 mt-1">
                    Utilisateurs
                  </div>
                  <p className="text-xs font-medium text-white/80 mt-1">
                    {stats.users.student} élèves • {stats.users.teacher} profs • {stats.users.admin} admin
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#06b6d4] to-[#0ea5e9] text-white rounded-2xl p-6 shadow-lg text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="text-[26px] sm:text-[28px] font-bold tracking-tight tabular-nums leading-tight">{stats.courses.total}</div>
                  <div className="text-[13px] font-semibold text-white/95 mt-1">
                    Modules publiés
                  </div>
                  <p className="text-xs font-medium text-white/80 mt-1">
                    {stats.courses.paid} payants • {stats.courses.free} gratuits
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#10b981] to-[#2dd4bf] text-white rounded-2xl p-6 shadow-lg text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="text-[26px] sm:text-[28px] font-bold tracking-tight tabular-nums leading-tight">{stats.quizResultsCount}</div>
                  <div className="text-[13px] font-semibold text-white/95 mt-1">
                    Quiz &amp; Activité
                  </div>
                  <p className="text-xs font-medium text-white/80 mt-1">
                    {stats.discussionsCount || 0} messages • {stats.reviewsCount || 0} avis
                  </p>
                </div>
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
                    onClick={openCreateCourse}
                    className="px-4 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Créer un module
                  </button>
                  <button
                    type="button"
                    onClick={openGrantSubModal}
                    className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-sm"
                  >
                    <CreditCard className="w-4 h-4" />
                    Activer un abonnement
                  </button>
                  <button
                    type="button"
                    onClick={openCreateUser}
                    className="px-4 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-sm"
                  >
                    <Users className="w-4 h-4" />
                    Ajouter un utilisateur
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('settings')}
                    className="px-4 py-2.5 rounded-xl bg-[#f59d0e] hover:bg-[#d97706] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-sm"
                  >
                    <Settings className="w-4 h-4" />
                    Paramètres du site
                  </button>
                </div>
              </div>

              {/* Répartition paiements + État système */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <h3 className="text-base font-bold text-slate-800 mb-4 pb-2.5 border-b border-slate-100">
                    Répartition des encaissements
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(stats.revenueByMethod || {}).length === 0 ? (
                      <p className="text-sm text-slate-400">Aucun paiement enregistré pour le moment.</p>
                    ) : (
                      Object.entries(stats.revenueByMethod).map(([method, amount]) => {
                        const pct = stats.totalRevenue > 0 ? Math.round((amount / stats.totalRevenue) * 100) : 0;
                        return (
                          <div key={method} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-700">{method}</span>
                              <span className="text-slate-900 font-bold">
                                {Number(amount).toLocaleString('fr-FR')} FCFA ({pct}%)
                              </span>
                            </div>
                            <div className="h-2.5 bg-[#eef2fb] rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#5c6be0] to-[#2563eb] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">État rapide de la plateforme</h3>
                    <button
                      onClick={() => setView('settings')}
                      className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer"
                    >
                      Configurer
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#eef2fb]/60 border border-indigo-100">
                      <p className="text-slate-500 font-semibold">Matières configurées</p>
                      <p className="text-sm font-bold text-slate-900 mt-1 truncate">{availableSubjects.join(', ')}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#eef2fb]/60 border border-indigo-100">
                      <p className="text-slate-500 font-semibold">Niveaux configurés</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">{availableLevels.length} niveaux actifs</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#eef2fb]/60 border border-indigo-100">
                      <p className="text-slate-500 font-semibold">Bannière d&apos;annonce</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        {draftSettings.announcement?.active ? 'Visible sur le site' : 'Désactivée'}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#eef2fb]/60 border border-indigo-100">
                      <p className="text-slate-500 font-semibold">Maintenance</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        {draftSettings.siteInfo?.maintenanceMode ? 'Mode maintenance ON' : 'En ligne'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activité récente */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Derniers abonnements</h3>
                    <button
                      onClick={() => setView('subscriptions')}
                      className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer"
                    >
                      Tout voir
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {(overview?.recentSubscriptions || []).slice(0, 5).map((sub) => (
                      <div key={sub._id} className="flex items-center justify-between text-sm bg-[#eef2fb]/50 hover:bg-[#eef2fb] p-3 rounded-xl transition">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{sub.student?.name || 'Élève'}</p>
                          <p className="text-xs text-slate-500 truncate">{sub.course?.title || 'Module'}</p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="font-semibold text-[#059669] text-xs tabular-nums">
                            {Number(sub.amount || 0).toLocaleString('fr-FR')} F
                          </p>
                          <p className="text-[11px] text-slate-400">{sub.paymentMethod}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Derniers comptes créés</h3>
                    <button
                      onClick={() => setView('users')}
                      className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer"
                    >
                      Tout voir
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {(overview?.recentUsers || []).slice(0, 5).map((u) => (
                      <div key={u._id} className="flex items-center justify-between text-sm bg-[#eef2fb]/50 hover:bg-[#eef2fb] p-3 rounded-xl transition">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{u.name}</p>
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
            <div className="space-y-5">
              <div className="bg-white rounded-2xl shadow-md px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0ea5e9] text-white flex items-center justify-center shadow-sm shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-[22px] font-bold tracking-tight text-slate-800">Gestion des Modules &amp; Cours</h1>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Créez, modifiez, assignez un professeur ou ouvrez le gestionnaire de chapitres et quiz.
                    </p>
                  </div>
                </div>
                <button
                  onClick={openCreateCourse}
                  className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold flex items-center gap-2 cursor-pointer transition shrink-0 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau Module
                </button>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-md flex items-center">
                <div className="relative w-full max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Rechercher un module, matière, professeur..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-[#eef2fb]/50 text-sm focus:outline-none focus:bg-white focus:border-[#2563eb]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredCourses.map((c) => (
                  <div key={c._id} className="bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between">
                    <div>
                      <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden">
                        <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                        <span className="absolute top-3 right-3 text-[11px] font-bold bg-white/95 text-slate-800 px-3 py-1 rounded-full shadow">
                          {c.studentsCount || 0} inscrit{(c.studentsCount || 0) > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold bg-sky-500 text-white px-2.5 py-0.5 rounded-full">
                            {c.subject}
                          </span>
                          <span className="text-[11px] font-bold bg-amber-400 text-slate-900 px-2.5 py-0.5 rounded-full">
                            {formatLevel(c.level)}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-800 line-clamp-2">{c.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                        <p className="text-xs text-slate-600 pt-1">
                          Prof : <strong>{c.teacher?.name || 'Non assigné'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="px-5 py-3.5 bg-[#eef2fb]/50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#2563eb] tabular-nums">
                        {c.isFree || c.price === 0 ? 'Gratuit' : `${Number(c.price).toLocaleString('fr-FR')} FCFA`}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditCourse(c)}
                          className="p-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-900 transition cursor-pointer shadow-sm"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c._id)}
                          className="p-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition cursor-pointer shadow-sm"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/courses/${c._id}`}
                          className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-sm"
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
            <div className="space-y-5">
              <div className="bg-white rounded-2xl shadow-md px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ec4899] to-[#f43f5e] text-white flex items-center justify-center shadow-sm shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-[22px] font-bold tracking-tight text-slate-800">Abonnements &amp; Paiements</h1>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Suivez les paiements Wave / Orange Money, prolongez ou accordez des accès manuels.
                    </p>
                  </div>
                </div>
                <button
                  onClick={openGrantSubModal}
                  className="px-5 py-2.5 rounded-xl bg-[#f59d0e] hover:bg-[#d97706] text-white text-sm font-bold flex items-center gap-2 cursor-pointer transition shrink-0 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Accorder un abonnement
                </button>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                    placeholder="Rechercher un élève, module, n° transaction..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-[#eef2fb]/50 text-sm focus:outline-none focus:bg-white focus:border-[#2563eb]"
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
                      className={`px-4 h-10 rounded-xl text-xs font-bold cursor-pointer transition ${
                        subStatusFilter === f.key
                          ? 'bg-[#2563eb] text-white shadow-sm'
                          : 'bg-[#eef2fb] text-slate-700 hover:bg-indigo-100'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#eef2fb] border-b border-indigo-100 text-[11px] font-bold uppercase tracking-wider text-slate-600">
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
                          <tr key={s._id} className="hover:bg-[#f5f7ff] transition">
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
                                className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                                  active ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
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
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer transition inline-flex items-center gap-1 shadow-sm"
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
                                  className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold cursor-pointer transition shadow-sm"
                                >
                                  {active ? 'Expirer' : 'Activer'}
                                </button>
                                <button
                                  onClick={() => handleDeleteSub(s._id)}
                                  className="p-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white cursor-pointer transition shadow-sm"
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
            <div className="space-y-5">
              <div className="bg-white rounded-2xl shadow-md px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#5c6be0] to-[#4657d4] text-white flex items-center justify-center shadow-sm shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-[22px] font-bold tracking-tight text-slate-800">Utilisateurs &amp; Rôles</h1>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Gérez les élèves, le compte professeur et les accès administrateurs.
                    </p>
                  </div>
                </div>
                <button
                  onClick={openCreateUser}
                  className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold flex items-center gap-2 cursor-pointer transition shrink-0 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un utilisateur
                </button>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Rechercher par nom, email ou téléphone..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-[#eef2fb]/50 text-sm focus:outline-none focus:bg-white focus:border-[#2563eb]"
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
                      className={`px-4 h-10 rounded-xl text-xs font-bold cursor-pointer transition ${
                        userRoleFilter === f.key
                          ? 'bg-[#2563eb] text-white shadow-sm'
                          : 'bg-[#eef2fb] text-slate-700 hover:bg-indigo-100'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#eef2fb] border-b border-indigo-100 text-[11px] font-bold uppercase tracking-wider text-slate-600">
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
                          <tr key={u._id} className="hover:bg-[#f5f7ff] transition">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={u.avatar}
                                  alt={u.name}
                                  referrerPolicy="no-referrer"
                                  className="w-9 h-9 rounded-full object-cover border-2 border-indigo-100 shrink-0"
                                />
                                <div>
                                  <p className="font-bold text-slate-900">
                                    {u.name} {isSelf && <span className="text-[10px] text-[#2563eb]">(Vous)</span>}
                                  </p>
                                  <p className="text-xs text-slate-500">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${
                                  ROLE_BADGES[u.role] || ROLE_BADGES.student
                                }`}
                              >
                                {ROLE_LABELS[u.role] || u.role}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold">
                              {u.role === 'teacher'
                                ? `${u.coursesCount || 0} cours`
                                : `${u.activeSubscriptionsCount || 0} abonnement(s)`}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-0.5 rounded-full ${
                                  active ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
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
                                  className="p-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-900 transition cursor-pointer shadow-sm"
                                  title="Modifier / Rôle / Mot de passe"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {!isSelf && (
                                  <>
                                    <button
                                      onClick={() => handleToggleUserActive(u)}
                                      className="px-2.5 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-xs font-bold text-white cursor-pointer transition shadow-sm"
                                    >
                                      {active ? 'Suspendre' : 'Activer'}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(u)}
                                      className="p-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition cursor-pointer shadow-sm"
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
            <div className="space-y-5">
              <div className="bg-white rounded-2xl shadow-md px-6 py-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#10b981] to-[#2dd4bf] text-white flex items-center justify-center shadow-sm shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-[22px] font-bold tracking-tight text-slate-800">
                    Fonctionnalités &amp; Extensions (Sans Code)
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Activez des fonctionnalités, ajoutez de nouvelles matières, niveaux ou ressources à la demande du professeur sans modifier le code.
                  </p>
                </div>
              </div>

              {/* Interrupteurs de fonctionnalités */}
              <section className="bg-white rounded-2xl p-6 shadow-md space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="w-5 h-5 text-[#2563eb]" />
                  <h2 className="text-base font-bold text-slate-800">Modules fonctionnels de la plateforme</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FEATURE_LIST.map((f) => {
                    const enabled = draftSettings.features?.[f.key] !== false;
                    return (
                      <div
                        key={f.key}
                        onClick={() => handleToggleFeature(f.key)}
                        className={`flex items-center justify-between gap-4 p-4 rounded-xl border cursor-pointer transition ${
                          enabled ? 'bg-[#eef2fb]/70 border-indigo-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">{f.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                        </div>
                        <div
                          className={`w-11 h-6 rounded-full relative transition-colors duration-300 shrink-0 ${
                            enabled ? 'bg-[#2563eb]' : 'bg-slate-300'
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <section className="bg-white rounded-2xl p-6 shadow-md space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Layers className="w-5 h-5 text-[#2563eb]" />
                    <h2 className="text-base font-bold text-slate-800">Matières proposées</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSubjects.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eef2fb] text-[#4c3882] border border-indigo-200 text-xs font-bold"
                      >
                        {sub}
                        <button
                          onClick={() => handleRemoveSubject(sub)}
                          className="hover:text-rose-600 cursor-pointer"
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
                      className="px-4 h-10 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold shrink-0 cursor-pointer shadow-sm"
                    >
                      Ajouter
                    </button>
                  </form>
                </section>

                <section className="bg-white rounded-2xl p-6 shadow-md space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <GraduationCap className="w-5 h-5 text-[#f59d0e]" />
                    <h2 className="text-base font-bold text-slate-800">Niveaux &amp; Classes</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableLevels.map((lvl) => (
                      <span
                        key={lvl.value}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-900 border border-amber-300 text-xs font-bold"
                      >
                        {lvl.label || lvl.value}
                        <button
                          onClick={() => handleRemoveLevel(lvl.value)}
                          className="hover:text-rose-600 cursor-pointer"
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
                      className="h-10 rounded-xl bg-[#f59d0e] hover:bg-[#d97706] text-white text-xs font-bold cursor-pointer shadow-sm"
                    >
                      Ajouter niveau
                    </button>
                  </form>
                </section>
              </div>

              {/* Extensions / Ressources personnalisées */}
              <section className="bg-white rounded-2xl p-6 shadow-md space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-800">
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
                        className="flex items-start justify-between gap-3 p-4 rounded-xl border border-indigo-100 bg-[#eef2fb]/50"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold bg-[#2563eb] text-white px-2.5 py-0.5 rounded-full">
                              {item.badge || 'Nouveau'}
                            </span>
                            <p className="text-sm font-bold text-slate-900 truncate">{item.title}</p>
                          </div>
                          {item.description && (
                            <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                          )}
                          <p className="text-[11px] text-[#2563eb] truncate mt-1">{item.url}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleToggleExtraLink(idx)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                              item.active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {item.active ? 'Actif' : 'Masqué'}
                          </button>
                          <button
                            onClick={() => handleRemoveExtraLink(idx)}
                            className="p-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white cursor-pointer"
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
                      className="px-4 h-10 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold shrink-0 cursor-pointer shadow-sm"
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
            <div className="space-y-5">
              <div className="bg-white rounded-2xl shadow-md px-6 py-4 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ec4899] to-[#f43f5e] text-white flex items-center justify-center shadow-sm shrink-0">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-[22px] font-bold tracking-tight text-slate-800">Contenu, Annonces &amp; Modération</h1>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Pilotez la bannière d&apos;annonce, les FAQ, les témoignages de l&apos;accueil et modérez les avis.
                  </p>
                </div>
              </div>

              {/* Bannière d'annonce */}
              <section className="bg-white rounded-2xl p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-[#f59d0e]" />
                    <h2 className="text-base font-bold text-slate-800">Bannière d&apos;annonce globale</h2>
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
                        ? 'bg-emerald-500 text-white'
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
                    className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold cursor-pointer shadow-sm"
                  >
                    Enregistrer la bannière
                  </button>
                </div>
              </section>

              {/* FAQs & Témoignages */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <section className="bg-white rounded-2xl p-6 shadow-md space-y-4">
                  <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                    Foire aux Questions (FAQ)
                  </h2>
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {(draftSettings.faqs || []).map((f, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#eef2fb]/50 border border-indigo-100 flex justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{f.question}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{f.answer}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveFaq(idx)}
                          className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg self-start cursor-pointer"
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
                      className="w-full h-20 p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm focus:outline-none focus:bg-white focus:border-[#2563eb]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold cursor-pointer shadow-sm"
                    >
                      Ajouter cette FAQ
                    </button>
                  </form>
                </section>

                <section className="bg-white rounded-2xl p-6 shadow-md space-y-4">
                  <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                    Témoignages de la page d&apos;accueil
                  </h2>
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {(draftSettings.testimonials || []).map((t, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#eef2fb]/50 border border-indigo-100 flex justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {t.name} <span className="text-[#2563eb]">({t.level})</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">&ldquo;{t.quote}&rdquo;</p>
                        </div>
                        <button
                          onClick={() => handleRemoveTestimonial(idx)}
                          className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg self-start cursor-pointer"
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
                      className="w-full h-20 p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm focus:outline-none focus:bg-white focus:border-[#2563eb]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#f59d0e] hover:bg-[#d97706] text-white text-xs font-bold cursor-pointer shadow-sm"
                    >
                      Ajouter ce témoignage
                    </button>
                  </form>
                </section>
              </div>

              {/* Modération des avis */}
              <section className="bg-white rounded-2xl p-6 shadow-md space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <MessageSquare className="w-5 h-5 text-[#2563eb]" />
                  <h2 className="text-base font-bold text-slate-800">Avis des élèves ({reviews.length})</h2>
                </div>
                {reviews.length === 0 ? (
                  <p className="text-sm text-slate-400">Aucun avis soumis sur les modules pour le moment.</p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((r) => (
                      <div key={r._id} className="flex items-start justify-between gap-4 p-4 rounded-xl bg-[#eef2fb]/50 border border-indigo-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{r.student?.name || 'Élève'}</span>
                            <span className="text-xs text-[#2563eb] font-semibold">• {r.course?.title}</span>
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
                          className="p-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white cursor-pointer shadow-sm"
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
            <div className="space-y-5">
              <div className="bg-white rounded-2xl shadow-md px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#5c6be0] to-[#4657d4] text-white flex items-center justify-center shadow-sm shrink-0">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-[22px] font-bold tracking-tight text-slate-800">Paramètres Généraux du Site</h1>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Configurez l&apos;identité de la plateforme, les coordonnées, les numéros de paiement et les réseaux sociaux.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#ef4444] text-white text-xs font-bold">
                  Administration
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <section className="bg-white rounded-2xl p-6 shadow-md space-y-4">
                  <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
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
                      className="flex items-center justify-between p-3.5 rounded-xl border border-indigo-100 bg-[#eef2fb]/50 cursor-pointer"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900">Mode Maintenance</p>
                        <p className="text-xs text-slate-500">Affiche un bandeau de maintenance aux visiteurs.</p>
                      </div>
                      <div
                        className={`w-11 h-6 rounded-full relative transition-colors ${
                          draftSettings.siteInfo?.maintenanceMode ? 'bg-rose-500' : 'bg-slate-300'
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

                <section className="bg-white rounded-2xl p-6 shadow-md space-y-4">
                  <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
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
                  className="h-11 px-8 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold cursor-pointer transition shadow-md"
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
            <h3 className="text-lg font-bold text-slate-800 mb-4">
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
                  className="w-full h-20 p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm focus:outline-none focus:bg-white focus:border-[#2563eb]"
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
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#eef2fb]/60 border border-indigo-100">
                <span className="text-sm font-semibold text-slate-700">Module gratuit</span>
                <input
                  type="checkbox"
                  checked={courseForm.isFree}
                  onChange={(e) => setCourseForm({ ...courseForm, isFree: e.target.checked })}
                  className="w-4 h-4 accent-[#2563eb]"
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
                className="w-full h-11 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold cursor-pointer mt-2 shadow-sm"
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
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {editingUser ? `Modifier : ${editingUser.name}` : 'Créer un compte utilisateur'}
            </h3>
            {userModalError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {userModalError}
              </div>
            )}
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
              {editingUser && (
                <div>
                  <label className="text-xs font-semibold text-slate-600">Photo de profil (optionnel)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setUserAvatarFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-slate-500 mt-1"
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={savingUser}
                className="w-full h-11 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold cursor-pointer mt-2 shadow-sm"
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
            <h3 className="text-lg font-bold text-slate-800 mb-4">Accorder un abonnement manuel</h3>
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
                className="w-full h-11 rounded-xl bg-[#f59d0e] hover:bg-[#d97706] text-white text-sm font-bold cursor-pointer mt-2 shadow-sm"
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
