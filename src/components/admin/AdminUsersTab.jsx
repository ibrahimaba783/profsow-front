import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Clock,
  KeyRound,
  Eye,
  Shield,
  GraduationCap,
  User,
  Copy,
  Check,
  X,
  BookOpen,
  CreditCard,
  Award,
} from 'lucide-react';
import api from '../../utils/api';

const ROLE_BADGES = {
  admin: 'bg-rose-500 text-white',
  teacher: 'bg-amber-400 text-slate-900',
  student: 'bg-sky-500 text-white',
};

const ROLE_LABELS = {
  admin: 'Admin',
  teacher: 'Professeur',
  student: 'Élève',
};

const AdminUsersTab = ({
  usersList = [],
  onOpenCreateUser,
  onOpenEditUser,
  onDeleteUser,
  onRefresh,
  showToast,
  setConfirmState,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'suspended' | 'blocked'

  // Modal Activité & Profil
  const [selectedUserActivity, setSelectedUserActivity] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Modal Suspension
  const [suspendingUser, setSuspendingUser] = useState(null);
  const [suspensionDays, setSuspensionDays] = useState(7);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [submittingSuspend, setSubmittingSuspend] = useState(false);

  // Modal Mot de passe réinitialisé
  const [resetResult, setResetResult] = useState(null); // { user, tempPassword }
  const [copied, setCopied] = useState(false);

  const filteredUsers = usersList.filter((u) => {
    const q = search.toLowerCase().trim();
    const matchQ =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q));

    const matchRole = roleFilter === 'all' || u.role === roleFilter;

    let matchStatus = true;
    if (statusFilter === 'active') matchStatus = u.isActive !== false && u.status !== 'blocked' && u.status !== 'suspended';
    else if (statusFilter === 'suspended') matchStatus = u.status === 'suspended';
    else if (statusFilter === 'blocked') matchStatus = u.isActive === false || u.status === 'blocked';

    return matchQ && matchRole && matchStatus;
  });

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
          if (onRefresh) onRefresh();
        } catch (err) {
          showToast('error', err.message);
        }
      },
    });
  };

  const handleOpenSuspend = (u) => {
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
      details: "L'ancien mot de passe deviendra immédiatement invalide. Le nouveau mot de passe vous sera communiqué pour transmission à l'élève.",
      confirmLabel: 'Réinitialiser le mot de passe',
      variant: 'warning',
      onConfirm: async () => {
        try {
          const res = await api(`/admin/users/${u._id}/reset-password`, { method: 'POST' });
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

  return (
    <div className="space-y-6">
      {/* En-tête & Filtres */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Gestion des Utilisateurs</h2>
          <p className="text-xs text-slate-500">
            {usersList.length} comptes enregistrés : profils, statuts, suspensions et sécurité d&apos;accès.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateUser}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Utilisateur</span>
        </button>
      </div>

      {/* Barre de recherche et filtres de rôle / statut */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, adresse email ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtre Rôle */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
          >
            <option value="all">Tous les rôles</option>
            <option value="student">Élèves uniquement</option>
            <option value="teacher">Professeurs uniquement</option>
            <option value="admin">Administrateurs</option>
          </select>

          {/* Filtre Statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Comptes Actifs</option>
            <option value="suspended">Comptes Suspendus</option>
            <option value="blocked">Comptes Bloqués</option>
          </select>
        </div>
      </div>

      {/* Table des utilisateurs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Utilisateur</th>
                <th className="py-3.5 px-4">Rôle</th>
                <th className="py-3.5 px-4">Statut &amp; Sécurité</th>
                <th className="py-3.5 px-4">Modules / Abonnements</th>
                <th className="py-3.5 px-4">Dernière Connexion</th>
                <th className="py-3.5 px-4 text-right">Actions de Contrôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.map((u) => {
                const isBlocked = u.isActive === false || u.status === 'blocked';
                const isSuspended = u.status === 'suspended' && u.suspendedUntil && new Date(u.suspendedUntil) > new Date();

                return (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden shrink-0">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                              {u.name?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => handleViewActivity(u)}
                            className="font-bold text-slate-900 hover:text-[#009688] transition truncate text-left block"
                          >
                            {u.name}
                          </button>
                          <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                          {u.phone && <div className="text-[10px] text-slate-400">{u.phone}</div>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${ROLE_BADGES[u.role] || 'bg-slate-500 text-white'}`}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isBlocked ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full text-[10px] border border-rose-200">
                          <Ban className="w-3 h-3" /> Bloqué
                        </span>
                      ) : isSuspended ? (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] border border-amber-200">
                          <Clock className="w-3 h-3" /> Suspendu ({new Date(u.suspendedUntil).toLocaleDateString('fr-FR')})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Actif
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {u.role === 'teacher' ? (
                        <span className="text-slate-600 font-semibold">{u.coursesCount || 0} module(s) créés</span>
                      ) : (
                        <span className="text-slate-600 font-semibold">{u.activeSubscriptionsCount || 0} abonnement(s)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      {u.lastLoginAt ? (
                        <div>
                          <span>{new Date(u.lastLoginAt).toLocaleDateString('fr-FR')}</span>
                          <span className="block text-[10px] text-slate-400">{new Date(u.lastLoginAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Jamais connecté</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* Consulter activité & profil */}
                        <button
                          type="button"
                          onClick={() => handleViewActivity(u)}
                          title="Fiche Profil & Activité"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Réinitialiser mot de passe */}
                        <button
                          type="button"
                          onClick={() => handleResetPassword(u)}
                          title="Réinitialiser les accès / mot de passe"
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Suspendre temporairement */}
                        <button
                          type="button"
                          onClick={() => handleOpenSuspend(u)}
                          title="Suspendre temporairement"
                          className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition cursor-pointer"
                        >
                          <Clock className="w-4 h-4" />
                        </button>

                        {/* Bloquer / Débloquer */}
                        <button
                          type="button"
                          onClick={() => handleToggleBlock(u)}
                          title={isBlocked ? 'Débloquer' : 'Bloquer le compte'}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isBlocked ? 'text-emerald-600 hover:bg-emerald-50' : 'text-rose-600 hover:bg-rose-50'
                          }`}
                        >
                          <Ban className="w-4 h-4" />
                        </button>

                        {/* Modifier */}
                        <button
                          type="button"
                          onClick={() => onOpenEditUser(u)}
                          title="Modifier les infos"
                          className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 transition cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Supprimer */}
                        <button
                          type="button"
                          onClick={() => onDeleteUser(u._id)}
                          title="Supprimer définitivement"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Aucun utilisateur trouvé pour ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL SUSPENSION TEMPORAIRE ================= */}
      {suspendingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 slide-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-black text-slate-900">Suspension Temporaire</h3>
              </div>
              <button
                type="button"
                onClick={() => setSuspendingUser(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmSuspend} className="space-y-3.5 text-xs">
              <p className="text-slate-600">
                Vous suspendez l&apos;accès de <strong>{suspendingUser.name}</strong> ({suspendingUser.email}).
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Durée de la suspension :</label>
                <select
                  value={suspensionDays}
                  onChange={(e) => setSuspensionDays(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white text-xs"
                >
                  <option value={3}>3 jours</option>
                  <option value={7}>7 jours (1 semaine)</option>
                  <option value={14}>14 jours (2 semaines)</option>
                  <option value={30}>30 jours (1 mois)</option>
                  <option value={90}>90 jours (3 mois)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motif de la suspension (notifié à l&apos;élève) :</label>
                <textarea
                  rows="3"
                  required
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Ex : Non-respect des règles du salon d'entraide, propos inappropriés..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white text-xs font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSuspendingUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingSuspend}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md"
                >
                  {submittingSuspend ? 'Suspension...' : 'Confirmer la suspension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL MOT DE PASSE GÉNÉRÉ ================= */}
      {resetResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 slide-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Mot de passe réinitialisé !</h3>
              <p className="text-xs text-slate-500">
                Transmettez ce mot de passe temporaire à <strong>{resetResult.user.name}</strong> ({resetResult.user.email}).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <span className="font-mono text-base font-black text-slate-900 tracking-wider">
                {resetResult.tempPassword}
              </span>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setResetResult(null)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL FICHE PROFIL & ACTIVITÉ COMPLÈTE ================= */}
      {selectedUserActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto slide-in">
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
                  <h3 className="text-lg font-black text-slate-900">{selectedUserActivity.user.name}</h3>
                  <p className="text-xs text-slate-500">{selectedUserActivity.user.email} • {ROLE_LABELS[selectedUserActivity.user.role]}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserActivity(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Résumé état & sécurité */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">Statut compte</span>
                  <span className="font-bold text-slate-900 capitalize">{selectedUserActivity.user.status || 'Actif'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">Inscrit le</span>
                  <span className="font-bold text-slate-900">{new Date(selectedUserActivity.user.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">Dernière IP</span>
                  <span className="font-bold text-slate-900">{selectedUserActivity.user.lastLoginIp || '—'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">Abonnements</span>
                  <span className="font-bold text-emerald-600">{selectedUserActivity.subscriptions?.length || 0}</span>
                </div>
              </div>

              {/* Abonnements & Modules souscrits */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                  <CreditCard className="w-3.5 h-3.5 text-[#f59d0e]" />
                  Abonnements et Modules Souscrits
                </h4>
                <div className="space-y-2">
                  {selectedUserActivity.subscriptions?.map((s) => (
                    <div key={s._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{s.course?.title || 'Module'}</p>
                        <p className="text-[11px] text-slate-400">Expire le {new Date(s.expiresAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        new Date(s.expiresAt) > new Date() ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {new Date(s.expiresAt) > new Date() ? 'Actif' : 'Expiré'}
                      </span>
                    </div>
                  ))}
                  {(!selectedUserActivity.subscriptions || selectedUserActivity.subscriptions.length === 0) && (
                    <p className="text-slate-400 italic">Aucun abonnement actif ou passé.</p>
                  )}
                </div>
              </div>

              {/* Quiz passés */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Award className="w-3.5 h-3.5 text-sky-500" />
                  Quiz &amp; Évaluations Réalisées ({selectedUserActivity.quizzes?.length || 0})
                </h4>
                <div className="space-y-1.5">
                  {selectedUserActivity.quizzes?.slice(0, 5).map((q) => (
                    <div key={q._id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                      <span className="font-semibold text-slate-800">{q.quiz?.title || 'Quiz'}</span>
                      <span className="font-bold text-sky-600">{q.score}% ({q.passed ? 'Réussi' : 'Échoué'})</span>
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
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
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
