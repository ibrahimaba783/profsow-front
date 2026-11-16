import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Ban,
  Clock,
  KeyRound,
  Eye,
  Shield,
  Copy,
  Check,
  X,
  CreditCard,
  Award,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  UserCog,
  Settings,
  Gauge,
  Wallet,
  BookOpen,
  ShieldCheck,
  Smartphone,
  MessageSquare,
} from 'lucide-react';
import api from '../../utils/api';

const ROLE_LABELS = {
  admin: 'Admin',
  teacher: 'Professeur',
  student: 'Élève',
};

const ROLE_BADGE_CLS = {
  admin: 'bg-rose-50 text-rose-700 border border-rose-200',
  teacher: 'bg-amber-50 text-amber-800 border border-amber-200',
  student: 'bg-sky-50 text-sky-700 border border-sky-200',
};

const PERMISSION_ROWS = [
  { key: 'systemConfig', label: 'Configuration Système', icon: Settings },
  { key: 'globalDashboard', label: 'Tableau de bord global', icon: Gauge },
  { key: 'transactions', label: 'Transactions & Trésorerie', icon: Wallet },
  { key: 'courseCreation', label: 'Création cours & quiz', icon: BookOpen },
  { key: 'paymentVerification', label: 'Vérification paiements', icon: ShieldCheck },
  { key: 'withdrawals', label: 'Retraits Wave/OM', icon: Smartphone },
  { key: 'studentReplies', label: 'Réponse aux élèves', icon: MessageSquare },
];

const DEFAULT_ROLE_PERMISSIONS = {
  admin: {
    systemConfig: true,
    globalDashboard: true,
    transactions: true,
    courseCreation: true,
    paymentVerification: true,
    withdrawals: true,
    studentReplies: true,
  },
  teacher: {
    systemConfig: false,
    globalDashboard: true,
    transactions: true,
    courseCreation: true,
    paymentVerification: false,
    withdrawals: true,
    studentReplies: true,
  },
  moderator: {
    systemConfig: false,
    globalDashboard: false,
    transactions: false,
    courseCreation: false,
    paymentVerification: true,
    withdrawals: false,
    studentReplies: true,
  },
};

const AdminUsersTab = ({
  usersList = [],
  subscriptions = [],
  courses = [],
  settings = {},
  currentAdminId,
  onUpdateUserRole,
  onOpenEditUser,
  onDeleteUser,
  onRefresh,
  showToast,
  setConfirmState,
  globalSearch = '',
}) => {
  const [subView, setSubView] = useState('directory'); // 'directory' | 'advanced'
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'student' | 'teacher' | 'admin'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'suspended' | 'blocked'

  // Formulaire Étape 4 : Ajouter un élève (Accès manuel)
  const [manualName, setManualName] = useState('');
  const [manualContact, setManualContact] = useState('');
  const [manualLevel, setManualLevel] = useState('Terminale S');
  const [manualCourseId, setManualCourseId] = useState('');
  const [manualPaymentMethod, setManualPaymentMethod] = useState('Offert');
  const [submittingManual, setSubmittingManual] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  // Matrice Rôles & Permissions
  const [rolePermissions, setRolePermissions] = useState(
    settings?.rolePermissions || DEFAULT_ROLE_PERMISSIONS
  );
  const [savingPerms, setSavingPerms] = useState(false);

  useEffect(() => {
    if (settings?.rolePermissions) {
      setRolePermissions(settings.rolePermissions);
    }
  }, [settings?.rolePermissions]);

  useEffect(() => {
    if (!manualCourseId && courses.length > 0) {
      setManualCourseId(courses[0]._id);
    }
  }, [courses, manualCourseId]);

  // Modals existants
  const [manageUser, setManageUser] = useState(null);
  const [selectedUserActivity, setSelectedUserActivity] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [suspendingUser, setSuspendingUser] = useState(null);
  const [suspensionDays, setSuspensionDays] = useState(7);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [submittingSuspend, setSubmittingSuspend] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Associer le dernier cours acheté à chaque utilisateur
  const userLatestCourseMap = useMemo(() => {
    const map = {};
    subscriptions.forEach((s) => {
      const uid = s.student?._id || s.student;
      if (!uid) return;
      if (!map[uid] && s.course?.title) {
        map[uid] = s.course.title;
      }
    });
    return map;
  }, [subscriptions]);

  // KPIs réels depuis usersList
  const kpis = useMemo(() => {
    const students = usersList.filter((u) => u.role === 'student');
    const totalStudents = students.length;
    const activeStudents = students.filter(
      (u) => u.isActive !== false && u.status !== 'blocked' && u.status !== 'suspended'
    ).length;
    const activityRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;
    const watchedAccounts = usersList.filter(
      (u) => u.isActive === false || u.status === 'blocked' || u.status === 'suspended'
    ).length;

    return { totalStudents, activeStudents, activityRate, watchedAccounts };
  }, [usersList]);

  const effectiveSearch = (search || globalSearch).toLowerCase().trim();

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchQ =
        !effectiveSearch ||
        (u.name || '').toLowerCase().includes(effectiveSearch) ||
        (u.email || '').toLowerCase().includes(effectiveSearch) ||
        (u.phone && u.phone.includes(effectiveSearch)) ||
        (u.level && u.level.toLowerCase().includes(effectiveSearch));

      const matchRole = roleFilter === 'all' || u.role === roleFilter;

      let matchStatus = true;
      if (statusFilter === 'active') {
        matchStatus = u.isActive !== false && u.status !== 'blocked' && u.status !== 'suspended';
      } else if (statusFilter === 'suspended') {
        matchStatus = u.status === 'suspended';
      } else if (statusFilter === 'blocked') {
        matchStatus = u.isActive === false || u.status === 'blocked';
      }

      return matchQ && matchRole && matchStatus;
    });
  }, [usersList, effectiveSearch, roleFilter, statusFilter]);

  const handleTogglePermission = async (roleKey, permKey) => {
    if (roleKey === 'admin' && permKey === 'systemConfig') {
      showToast?.('error', "La permission Système reste requise pour l'Administrateur.");
      return;
    }

    const updated = {
      ...rolePermissions,
      [roleKey]: {
        ...(rolePermissions[roleKey] || {}),
        [permKey]: !rolePermissions[roleKey]?.[permKey],
      },
    };
    setRolePermissions(updated);
    setSavingPerms(true);
    try {
      await api('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ rolePermissions: updated }),
      });
      showToast?.('success', 'Permissions mises à jour.');
    } catch (err) {
      showToast?.('error', err.message || 'Erreur lors de la sauvegarde des permissions.');
    } finally {
      setSavingPerms(false);
    }
  };

  const handleManualActivateStudent = async (e) => {
    e.preventDefault();
    const name = manualName.trim();
    const contact = manualContact.trim();
    if (!name || !contact) {
      showToast?.('error', 'Veuillez renseigner le nom complet et le téléphone ou email.');
      return;
    }

    setSubmittingManual(true);
    setCreatedCredentials(null);
    try {
      const isEmail = contact.includes('@');
      const cleanDigits = contact.replace(/[^0-9]/g, '');
      const email = isEmail
        ? contact.toLowerCase()
        : `${name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'eleve'}${cleanDigits.slice(-4) || Math.floor(1000 + Math.random() * 9000)}@aliousow.sn`;
      const phone = isEmail ? '' : contact;
      const tempPassword = `Sow@${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. Vérifier si l'utilisateur existe déjà ou le créer
      let studentUser = usersList.find(
        (u) => u.email?.toLowerCase() === email || (phone && u.phone === phone)
      );

      if (!studentUser) {
        const res = await api('/admin/users', {
          method: 'POST',
          body: JSON.stringify({
            name,
            email,
            phone,
            level: manualLevel,
            role: 'student',
            password: tempPassword,
            isActive: true,
          }),
        });
        studentUser = res?.user || res;
        setCreatedCredentials({ name, email, tempPassword });
      }

      // 2. Débloquer le cours sélectionné si présent
      if (manualCourseId && studentUser?._id) {
        const selectedCourse = courses.find((c) => c._id === manualCourseId);
        const amount =
          manualPaymentMethod === 'Offert' ? 0 : Number(selectedCourse?.price || 0);
        await api('/admin/subscriptions', {
          method: 'POST',
          body: JSON.stringify({
            studentId: studentUser._id,
            courseId: manualCourseId,
            paymentMethod: manualPaymentMethod,
            amount,
            durationMonths: 12,
          }),
        });
      }

      showToast?.('success', `Accès activé pour ${name} avec succès !`);
      setManualName('');
      setManualContact('');
      if (onRefresh) await onRefresh();
    } catch (err) {
      showToast?.('error', err.message || "Impossible d'activer cet accès élève.");
    } finally {
      setSubmittingManual(false);
    }
  };

  const handleToggleBlock = (targetUser) => {
    const willBlock = targetUser.isActive !== false && targetUser.status !== 'blocked';
    setConfirmState({
      title: willBlock ? 'Bloquer ce compte' : 'Débloquer ce compte',
      message: willBlock
        ? `Êtes-vous sûr de vouloir bloquer l'accès de ${targetUser.name} (${targetUser.email}) ?`
        : `Débloquer et réactiver l'accès de ${targetUser.name} ?`,
      details: willBlock
        ? "L'utilisateur ne pourra plus se connecter jusqu'à ce qu'un administrateur réactive son compte."
        : 'Le compte sera immédiatement réactivé et pourra se connecter.',
      confirmLabel: willBlock ? 'Bloquer le compte' : 'Débloquer le compte',
      variant: willBlock ? 'danger' : 'success',
      onConfirm: async () => {
        try {
          await api(`/admin/users/${targetUser._id}/toggle-block`, { method: 'POST' });
          showToast('success', willBlock ? 'Compte bloqué avec succès.' : 'Compte débloqué.');
          setManageUser(null);
          if (onRefresh) onRefresh();
        } catch (err) {
          showToast('error', err.message);
        }
      },
    });
  };

  const handleOpenSuspend = (u) => {
    setManageUser(null);
    setSuspendingUser(u);
    setSuspensionDays(7);
    setSuspensionReason('');
  };

  const handleConfirmSuspend = async (e) => {
    e.preventDefault();
    if (!suspendingUser) return;
    setSubmittingSuspend(true);
    try {
      await api(`/admin/users/${suspendingUser._id}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ days: suspensionDays, reason: suspensionReason }),
      });
      showToast('success', `Compte suspendu pour ${suspensionDays} jours.`);
      setSuspendingUser(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setSubmittingSuspend(false);
    }
  };

  const handleResetPassword = (u) => {
    setConfirmState({
      title: 'Réinitialiser les accès',
      message: `Générer un nouveau mot de passe temporaire pour ${u.name} (${u.email}) ?`,
      details:
        "L'ancien mot de passe deviendra immédiatement invalide. Le nouveau mot de passe vous sera communiqué pour transmission à l'élève.",
      confirmLabel: 'Réinitialiser le mot de passe',
      variant: 'warning',
      onConfirm: async () => {
        try {
          const res = await api(`/admin/users/${u._id}/reset-password`, { method: 'POST' });
          setManageUser(null);
          setResetResult({ user: u, tempPassword: res.tempPassword });
          showToast('success', 'Nouveau mot de passe généré.');
          if (onRefresh) onRefresh();
        } catch (err) {
          showToast('error', err.message);
        }
      },
    });
  };

  const handleViewActivity = async (u) => {
    setLoadingActivity(true);
    try {
      const data = await api(`/admin/users/${u._id}/activity`);
      setManageUser(null);
      setSelectedUserActivity(data);
    } catch (err) {
      showToast('error', err.message || "Erreur de chargement de l'activité");
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleCopyPassword = () => {
    if (resetResult?.tempPassword) {
      navigator.clipboard.writeText(resetResult.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const formatJoinDate = (val) => {
    if (!val) return '—';
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // =========================================================================
  // ÉTAPE 4 : GESTION AVANCÉE DES ACCÈS & RÔLES
  // =========================================================================
  if (subView === 'advanced') {
    return (
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
              Gestion Avancée des Accès &amp; Rôles
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Création rapide d&apos;accès élève hors-ligne et matrice des permissions par rôle.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSubView('directory')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-xs font-bold text-slate-700 shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à l&apos;annuaire</span>
          </button>
        </div>

        {/* Grille 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Panneau gauche : Formulaire Ajouter un élève (Accès manuel) */}
          <form
            onSubmit={handleManualActivateStudent}
            className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4"
          >
            <h2 className="text-[16px] font-bold text-slate-900">
              Formulaire : Ajouter un élève (Accès manuel)
            </h2>

            {createdCredentials && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p className="font-bold">Compte créé pour {createdCredentials.name}</p>
                <p>
                  Email : <span className="font-mono font-semibold">{createdCredentials.email}</span>
                </p>
                <p>
                  Mot de passe temporaire :{' '}
                  <span className="font-mono font-bold">{createdCredentials.tempPassword}</span>
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nom complet
              </label>
              <input
                type="text"
                required
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="ex: Fatou D. Sow"
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Numéro de téléphone / Email
              </label>
              <input
                type="text"
                required
                value={manualContact}
                onChange={(e) => setManualContact(e.target.value)}
                placeholder="ex: 77 123 45 67 ou fatou@email.com"
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Niveau scolaire
              </label>
              <select
                value={manualLevel}
                onChange={(e) => setManualLevel(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 transition"
              >
                <option value="4ème">4ème</option>
                <option value="3ème">3ème</option>
                <option value="Seconde S">Seconde S</option>
                <option value="Première S">Première S</option>
                <option value="Terminale S">Terminale S</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Cours à débloquer
              </label>
              <select
                value={manualCourseId}
                onChange={(e) => setManualCourseId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 transition"
              >
                <option value="">Compte seul (sans cours)</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title} ({c.level}) — {c.isFree ? 'Gratuit' : `${(c.price || 0).toLocaleString('fr-FR')} F CFA`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Mode de paiement hors-ligne
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Espèces', 'Wave direct', 'Offert'].map((method) => {
                  const selected = manualPaymentMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setManualPaymentMethod(method)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        selected
                          ? 'bg-[#eff6ff] border-indigo-600 text-[#1e3a8a] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selected ? 'border-indigo-600' : 'border-slate-300'
                        }`}
                      >
                        {selected && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                      </span>
                      <span>{method}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingManual}
              className="gradient-button gradient-button--sm w-full !py-2.5 !text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submittingManual ? 'Activation en cours...' : "Activer l'accès élève"}
            </button>
          </form>

          {/* Panneau droit : Gérer les rôles & Permissions */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[16px] font-bold text-slate-900">
                Panneau : Gérer les rôles &amp; Permissions
              </h2>
              {savingPerms && (
                <span className="text-[11px] font-semibold text-indigo-600 animate-pulse">
                  Enregistrement...
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 text-xs font-bold text-slate-600">
                    <th className="py-3 pr-3">Permission / Accès</th>
                    <th className="py-3.5 px-4 text-center">
                      Administrateur
                      <span className="block text-[10px] font-medium text-slate-400">(Accès total)</span>
                    </th>
                    <th className="py-3.5 px-4 text-center">
                      Professeur
                      <span className="block text-[10px] font-medium text-slate-400">Unique</span>
                    </th>
                    <th className="py-3 pl-3 text-center">
                      Modérateur /
                      <span className="block text-[10px] font-medium text-slate-400">Support</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {PERMISSION_ROWS.map((row) => {
                    const Icon = row.icon;
                    return (
                      <tr key={row.key} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 pr-3">
                          <div className="flex items-center gap-2.5 font-medium text-slate-800">
                            <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>{row.label}</span>
                          </div>
                        </td>
                        {['admin', 'teacher', 'moderator'].map((roleKey) => {
                          const enabled = Boolean(rolePermissions?.[roleKey]?.[row.key]);
                          return (
                            <td key={roleKey} className="py-3.5 px-3 text-center">
                              <button
                                type="button"
                                role="switch"
                                aria-checked={enabled}
                                onClick={() => handleTogglePermission(roleKey, row.key)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                                  enabled ? 'bg-indigo-600' : 'bg-slate-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                                    enabled ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ÉTAPE 3 : ANNUAIRE UTILISATEURS & ACCÈS
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* En-tête : Titre + Boutons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
            Utilisateurs &amp; Accès
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {usersList.length} comptes enregistrés : annuaire, rôles, statuts et contrôle des accès.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSubView('advanced')}
            className="gradient-button gradient-button--sm !px-3.5 !py-2 !text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter un élève (Accès manuel)</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('advanced')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <UserCog className="w-3.5 h-3.5" />
            <span>Gérer les rôles</span>
          </button>
        </div>
      </div>

      {/* 3 Cartes KPI (.uiverse-glow-card mode clair) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1 : Total élèves inscrits */}
        <div className="uiverse-glow-card p-6 flex flex-col justify-between min-h-[132px]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-medium text-slate-600">Total élèves inscrits</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight">
                {kpis.totalStudents.toLocaleString('fr-FR')}
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-400 shrink-0" />
          </div>
          <div className="mt-3 h-8 w-full overflow-hidden">
            <svg viewBox="0 0 220 40" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="usersSparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path
                d="M0 35 L35 29 L72 31 L108 19 L145 23 L182 11 L220 6 L220 40 L0 40 Z"
                fill="url(#usersSparkGrad)"
              />
              <path
                d="M0 35 L35 29 L72 31 L108 19 L145 23 L182 11 L220 6"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 2 : Élèves actifs */}
        <div className="uiverse-glow-card p-6 flex flex-col justify-between min-h-[132px]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-medium text-slate-600">Élèves actifs</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight">
                {kpis.activeStudents.toLocaleString('fr-FR')}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            {kpis.activityRate} % de taux d&apos;activité
          </p>
        </div>

        {/* KPI 3 : Comptes sous surveillance */}
        <div
          onClick={() => setStatusFilter((prev) => (prev === 'blocked' ? 'all' : 'blocked'))}
          className="uiverse-glow-card p-6 flex flex-col justify-between min-h-[132px] cursor-pointer"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-medium text-slate-600">Comptes sous surveillance</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight">
                {kpis.watchedAccounts}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Comptes suspendus ou bloqués • Cliquer pour filtrer
          </p>
        </div>
      </div>

      {/* Annuaire détaillé des élèves */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="text-[16px] font-bold text-slate-900">
              Annuaire détaillé des élèves
            </h2>

            {/* Recherche locale */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un élève, email, niveau..."
                className="w-full h-9 pl-9 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Pilules Statut + Rôle */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: 'all', label: 'Tous', activeCls: 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20' },
                { key: 'active', label: 'Actifs', activeCls: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
                { key: 'suspended', label: 'Suspendus', activeCls: 'bg-amber-50 text-amber-800 border-amber-300' },
                { key: 'blocked', label: 'Bloqués', activeCls: 'bg-rose-50 text-rose-700 border-rose-300' },
              ].map((pill) => {
                const isActive = statusFilter === pill.key;
                return (
                  <button
                    key={pill.key}
                    type="button"
                    onClick={() => setStatusFilter(pill.key)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                      isActive
                        ? pill.activeCls
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'all', label: 'Tous rôles' },
                { key: 'student', label: 'Élèves' },
                { key: 'teacher', label: 'Professeurs' },
                { key: 'admin', label: 'Admins' },
              ].map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRoleFilter(r.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                    roleFilter === r.key
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Élève / Utilisateur</th>
                <th className="py-3.5 px-4">Niveau / Rôle</th>
                <th className="py-3.5 px-4">Cours acheté</th>
                <th className="py-3.5 px-4">Date d&apos;inscription</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {filteredUsers.map((u) => {
                const isBlocked = u.isActive === false || u.status === 'blocked';
                const isSuspended = !isBlocked && u.status === 'suspended';
                const latestCourse = userLatestCourseMap[u._id] || '—';

                return (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5 min-w-[160px]">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-xs">
                              {u.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate max-w-[160px]">{u.name}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {u.role === 'student' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                          {u.level || 'Élève'}
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${
                            ROLE_BADGE_CLS[u.role] || ROLE_BADGE_CLS.student
                          }`}
                        >
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-medium max-w-[180px] truncate">
                      {latestCourse}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                      {formatJoinDate(u.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isBlocked ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                          Bloqué
                        </span>
                      ) : isSuspended ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                          Suspendu
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          Validé
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleViewActivity(u)}
                          disabled={loadingActivity}
                          title="Voir fiche activité"
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-indigo-600 border border-slate-200/80 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setManageUser(u)}
                          className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-xs font-semibold text-slate-700 transition cursor-pointer"
                        >
                          Gérer l&apos;accès
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-slate-400">
                    Aucun utilisateur trouvé pour ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL GÉRER L'ACCÈS ================= */}
      {manageUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5 min-w-0">
                <Shield className="w-5 h-5 text-indigo-600 shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">Gérer l&apos;accès — {manageUser.name}</h3>
                  <p className="text-[11px] text-slate-500 truncate">{manageUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setManageUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {onUpdateUserRole && manageUser._id !== currentAdminId && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Rôle du compte
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['student', 'teacher', 'admin'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={async () => {
                          await onUpdateUserRole(manageUser._id, r);
                          setManageUser((prev) => (prev ? { ...prev, role: r } : null));
                        }}
                        className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          manageUser.role === r
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {ROLE_LABELS[r]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const target = manageUser;
                    setManageUser(null);
                    onOpenEditUser?.(target);
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-indigo-600" />
                  Modifier le profil
                </button>

                <button
                  type="button"
                  onClick={() => handleViewActivity(manageUser)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-600" />
                  Fiche activité
                </button>

                <button
                  type="button"
                  onClick={() => handleResetPassword(manageUser)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  Reset mot de passe
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenSuspend(manageUser)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Suspendre (jours)
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleBlock(manageUser)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-50/70 hover:bg-rose-100 border border-rose-200 text-xs font-semibold text-rose-700 cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" />
                  {manageUser.isActive === false || manageUser.status === 'blocked'
                    ? 'Débloquer'
                    : 'Bloquer le compte'}
                </button>

                {manageUser._id !== currentAdminId && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = manageUser._id;
                      setManageUser(null);
                      onDeleteUser?.(id);
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-50/70 hover:bg-rose-100 border border-rose-200 text-xs font-semibold text-rose-700 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL SUSPENSION TEMPORAIRE ================= */}
      {suspendingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <form
            onSubmit={handleConfirmSuspend}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900">Suspendre {suspendingUser.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSuspendingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Durée de suspension (jours)
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={suspensionDays}
                onChange={(e) => setSuspensionDays(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Motif (optionnel)
              </label>
              <textarea
                rows={3}
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="Ex: Partage de compte détecté..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSuspendingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submittingSuspend}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
              >
                {submittingSuspend ? 'Enregistrement...' : 'Confirmer la suspension'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL MOT DE PASSE GÉNÉRÉ ================= */}
      {resetResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Mot de passe réinitialisé !</h3>
              <p className="text-xs text-slate-500">
                Transmettez ce mot de passe temporaire à <strong>{resetResult.user.name}</strong> ({resetResult.user.email}).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <span className="font-mono text-base font-bold text-slate-900 tracking-wider">
                {resetResult.tempPassword}
              </span>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setResetResult(null)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL FICHE PROFIL & ACTIVITÉ COMPLÈTE ================= */}
      {selectedUserActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  {selectedUserActivity.user.avatar ? (
                    <img src={selectedUserActivity.user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                      {selectedUserActivity.user.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">{selectedUserActivity.user.name}</h3>
                  <p className="text-xs text-slate-500">
                    {selectedUserActivity.user.email} • {ROLE_LABELS[selectedUserActivity.user.role]}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserActivity(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">Statut compte</span>
                  <span className="font-bold text-slate-900 capitalize">
                    {selectedUserActivity.user.status || 'Actif'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">Inscrit le</span>
                  <span className="font-bold text-slate-900">
                    {new Date(selectedUserActivity.user.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">Dernière IP</span>
                  <span className="font-bold text-slate-900">{selectedUserActivity.user.lastLoginIp || '—'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">Abonnements</span>
                  <span className="font-bold text-emerald-600">
                    {selectedUserActivity.subscriptions?.length || 0}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                  <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                  Abonnements et Modules Souscrits
                </h4>
                <div className="space-y-2">
                  {selectedUserActivity.subscriptions?.map((s) => (
                    <div
                      key={s._id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{s.course?.title || 'Module'}</p>
                        <p className="text-[11px] text-slate-400">
                          Expire le {new Date(s.expiresAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          new Date(s.expiresAt) > new Date()
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {new Date(s.expiresAt) > new Date() ? 'Actif' : 'Expiré'}
                      </span>
                    </div>
                  ))}
                  {(!selectedUserActivity.subscriptions || selectedUserActivity.subscriptions.length === 0) && (
                    <p className="text-slate-400 italic">Aucun abonnement actif ou passé.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Award className="w-3.5 h-3.5 text-sky-500" />
                  Quiz &amp; Évaluations Réalisées ({selectedUserActivity.quizzes?.length || 0})
                </h4>
                <div className="space-y-1.5">
                  {selectedUserActivity.quizzes?.slice(0, 5).map((q) => (
                    <div key={q._id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                      <span className="font-semibold text-slate-800">{q.quiz?.title || 'Quiz'}</span>
                      <span className="font-bold text-sky-600">
                        {q.score}% ({q.passed ? 'Réussi' : 'Échoué'})
                      </span>
                    </div>
                  ))}
                  {(!selectedUserActivity.quizzes || selectedUserActivity.quizzes.length === 0) && (
                    <p className="text-slate-400 italic">Aucun quiz passé pour le moment.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setSelectedUserActivity(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
              >
                Fermer la fiche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersTab;
