import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CalendarPlus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Plus,
  ArrowUpDown,
  History,
  X,
  ExternalLink,
  Smartphone,
  Check,
} from 'lucide-react';

const AdminSubscriptionsTab = ({
  subscriptions = [],
  usersList = [],
  onUpdateSub,
  onDeleteSub,
  onOpenGrantModal,
  setToast,
  setConfirmState,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, expired, expiring_soon
  const [methodFilter, setMethodFilter] = useState('all'); // all, wave, orange, free, card
  const [historyModalSub, setHistoryModalSub] = useState(null);
  const [extendModalSub, setExtendModalSub] = useState(null);
  const [extendMonths, setExtendMonths] = useState(1);

  const getStudentAvatar = (sub) => {
    if (sub?.student?.avatar) return sub.student.avatar;
    const studentId = sub?.student?._id || sub?.student;
    const found = usersList?.find((u) => u._id === studentId || u.email === sub?.student?.email);
    return found?.avatar || null;
  };

  const now = useMemo(() => new Date(), []);

  // Metrics
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let activeCount = 0;
    let expiredCount = 0;
    let expiringSoonCount = 0;
    let waveTotal = 0;
    let orangeTotal = 0;

    subscriptions.forEach((s) => {
      const amt = Number(s.amount || 0);
      totalRevenue += amt;
      const exp = new Date(s.expiresAt);
      const isActive = s.status === 'active' && exp > now;
      if (isActive) {
        activeCount++;
        const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7 && diffDays >= 0) expiringSoonCount++;
      } else {
        expiredCount++;
      }

      const method = (s.paymentMethod || '').toLowerCase();
      if (method.includes('wave')) waveTotal += amt;
      if (method.includes('orange') || method.includes('om')) orangeTotal += amt;
    });

    return { totalRevenue, activeCount, expiredCount, expiringSoonCount, waveTotal, orangeTotal };
  }, [subscriptions, now]);

  // Filtering
  const filteredSubs = useMemo(() => {
    return subscriptions.filter((s) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        s.student?.name?.toLowerCase().includes(q) ||
        s.student?.email?.toLowerCase().includes(q) ||
        s.course?.title?.toLowerCase().includes(q) ||
        s.transactionId?.toLowerCase().includes(q) ||
        s.phoneNumber?.toLowerCase().includes(q);

      const exp = new Date(s.expiresAt);
      const isActive = s.status === 'active' && exp > now;
      const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
      const isExpiringSoon = isActive && diffDays <= 7 && diffDays >= 0;

      let matchStatus = true;
      if (statusFilter === 'active') matchStatus = isActive;
      else if (statusFilter === 'expired') matchStatus = !isActive;
      else if (statusFilter === 'expiring_soon') matchStatus = isExpiringSoon;

      let matchMethod = true;
      const method = (s.paymentMethod || '').toLowerCase();
      if (methodFilter === 'wave') matchMethod = method.includes('wave');
      else if (methodFilter === 'orange') matchMethod = method.includes('orange') || method.includes('om');
      else if (methodFilter === 'free') matchMethod = method.includes('gratuit') || method.includes('offert') || s.amount === 0;
      else if (methodFilter === 'card') matchMethod = method.includes('carte') || method.includes('card');

      return matchSearch && matchStatus && matchMethod;
    });
  }, [subscriptions, search, statusFilter, methodFilter, now]);

  const handleApplyExtension = async () => {
    if (!extendModalSub) return;
    try {
      await onUpdateSub(
        extendModalSub._id,
        { extendMonths: Number(extendMonths) },
        `Abonnement prolongé de ${extendMonths} mois avec succès.`
      );
      setExtendModalSub(null);
    } catch (err) {
      setToast?.({ type: 'error', text: "Erreur lors de la prolongation de l'abonnement." });
    }
  };

  const confirmToggleStatus = (sub) => {
    const exp = new Date(sub.expiresAt);
    const isActive = sub.status === 'active' && exp > now;
    const newStatus = isActive ? 'expired' : 'active';
    const actionLabel = isActive ? 'forcer l’expiration' : 'réactiver';

    setConfirmState?.({
      title: `${isActive ? 'Expirer' : 'Réactiver'} l'abonnement`,
      message: `Voulez-vous vraiment ${actionLabel} l'abonnement de ${sub.student?.name || 'cet élève'} pour le module "${sub.course?.title || 'Module'}" ?`,
      confirmText: isActive ? 'Forcer expiration' : 'Réactiver',
      danger: isActive,
      onConfirm: async () => {
        await onUpdateSub(
          sub._id,
          { status: newStatus },
          isActive ? 'Abonnement marqué comme expiré.' : 'Abonnement réactivé.'
        );
      },
    });
  };

  const confirmDelete = (sub) => {
    setConfirmState?.({
      title: "Supprimer définitivement l'abonnement",
      message: `Êtes-vous sûr de vouloir supprimer cet abonnement (${sub.student?.name} - ${sub.course?.title}) ? Cette action est irréversible et révoquera immédiatement l'accès de l'élève.`,
      confirmText: 'Supprimer définitivement',
      danger: true,
      onConfirm: async () => {
        await onDeleteSub(sub._id);
      },
    });
  };

  const getMethodBadge = (method = '') => {
    const m = method.toLowerCase();
    if (m.includes('wave')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1dc8f2]/15 text-[#0c8ba8] border border-[#1dc8f2]/30">
          <Smartphone className="w-3 h-3 text-[#1dc8f2]" />
          Wave
        </span>
      );
    }
    if (m.includes('orange') || m.includes('om')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
          <Smartphone className="w-3 h-3 text-orange-600" />
          Orange Money
        </span>
      );
    }
    if (m.includes('gratuit') || m.includes('offert')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
          Offert
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
        {method || 'Standard'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-md px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#009688] to-[#00796b] text-white flex items-center justify-center shadow-sm shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Gestion des Abonnements & Paiements
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-[#009688] font-bold border border-teal-200">
                Paiements Wave & OM
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Historique complet des transactions, suivi des renouvellements et contrôle des accès élèves.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenGrantModal}
          className="px-5 py-2.5 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white text-sm font-bold flex items-center justify-center gap-2 transition shrink-0 shadow-sm shadow-[#009688]/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Accorder un abonnement
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Abonnements Actifs</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{metrics.activeCount}</p>
            <p className="text-[11px] text-emerald-600 font-medium">Accès cours validés</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expirant sous 7j</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-0.5">{metrics.expiringSoonCount}</p>
            <p className="text-[11px] text-amber-600 font-medium">À relancer pour réabonnement</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Abonnements Expirés</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{metrics.expiredCount}</p>
            <p className="text-[11px] text-slate-400 font-medium">Accès clôturés</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-[#009688] flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Encaissé</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {metrics.totalRevenue.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">FCFA</span>
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Wave: {metrics.waveTotal.toLocaleString('fr-FR')} | OM: {metrics.orangeTotal.toLocaleString('fr-FR')}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par élève, module, transaction ID..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:bg-white focus:border-[#009688] transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Status filters */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'active', label: 'Actifs' },
              { id: 'expiring_soon', label: 'Expirant sous 7j' },
              { id: 'expired', label: 'Expirés' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Payment method selector */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#009688]"
          >
            <option value="all">Toutes méthodes</option>
            <option value="wave">Wave</option>
            <option value="orange">Orange Money</option>
            <option value="free">Offert / Promo</option>
            <option value="card">Carte bancaire</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-3.5">Élève</th>
                <th className="px-5 py-3.5">Module & Sujet</th>
                <th className="px-5 py-3.5">Paiement & Montant</th>
                <th className="px-5 py-3.5">Période & Expiration</th>
                <th className="px-5 py-3.5">Statut</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    Aucun abonnement ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((s) => {
                  const exp = new Date(s.expiresAt);
                  const start = new Date(s.startDate || s.createdAt);
                  const isActive = s.status === 'active' && exp > now;
                  const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
                  const isExpiringSoon = isActive && diffDays <= 7 && diffDays >= 0;

                  const studentAvatar = getStudentAvatar(s);

                  return (
                    <tr key={s._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            {studentAvatar ? (
                              <img
                                src={studentAvatar}
                                alt={s.student?.name || 'Élève'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-xs">
                                {s.student?.name?.[0]?.toUpperCase() || 'E'}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{s.student?.name || 'Élève supprimé'}</p>
                            <p className="text-xs text-slate-400">{s.student?.email || 'N/A'}</p>
                            {s.phoneNumber && (
                              <p className="text-[11px] text-slate-500 font-mono">{s.phoneNumber}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800">{s.course?.title || 'Module supprimé'}</p>
                        <p className="text-xs text-slate-400 font-mono truncate max-w-[200px]" title={s.transactionId}>
                          Réf: {s.transactionId || 'MANUEL'}
                        </p>
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="font-extrabold text-slate-900">
                          {Number(s.amount || 0).toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">FCFA</span>
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                          {getMethodBadge(s.paymentMethod)}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5 text-xs">
                          <p className="text-slate-500">
                            Du {start.toLocaleDateString('fr-FR')} au {exp.toLocaleDateString('fr-FR')}
                          </p>
                          {isActive ? (
                            isExpiringSoon ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                                <Clock className="w-3 h-3" /> Expire dans {diffDays} jour{diffDays > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-[11px] text-emerald-600 font-medium">
                                Reste {diffDays} jours
                              </span>
                            )
                          ) : (
                            <span className="text-[11px] text-rose-500 font-medium">
                              Expiré depuis {Math.abs(diffDays)} jours
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-sm">
                            <CheckCircle className="w-3 h-3" />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500 text-white shadow-sm">
                            <AlertTriangle className="w-3 h-3" />
                            Expiré
                          </span>
                        )}
                        {s.autoRenew && (
                          <span className="block mt-1 text-[10px] text-teal-700 font-bold">
                            Renouvellement auto
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Prolonger */}
                          <button
                            type="button"
                            onClick={() => {
                              setExtendModalSub(s);
                              setExtendMonths(1);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#009688] hover:text-[#00796b] text-xs font-bold transition inline-flex items-center gap-1 border border-teal-200 cursor-pointer"
                            title="Prolonger la durée"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                            Prolonger
                          </button>

                          {/* Basculer Statut */}
                          <button
                            type="button"
                            onClick={() => confirmToggleStatus(s)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                              isActive
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}
                            title={isActive ? 'Forcer expiration' : 'Réactiver'}
                          >
                            {isActive ? 'Expirer' : 'Activer'}
                          </button>

                          {/* Historique */}
                          <button
                            type="button"
                            onClick={() => setHistoryModalSub(s)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="Voir l'historique"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {/* Supprimer */}
                          <button
                            type="button"
                            onClick={() => confirmDelete(s)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer border border-rose-200"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: PROLONGER ABONNEMENT */}
      {extendModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-[#009688]" />
                <h3 className="font-bold text-slate-900">Prolonger l'abonnement</h3>
              </div>
              <button
                type="button"
                onClick={() => setExtendModalSub(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-white border border-slate-200 shrink-0">
                  {getStudentAvatar(extendModalSub) ? (
                    <img
                      src={getStudentAvatar(extendModalSub)}
                      alt={extendModalSub.student?.name || 'Élève'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-sm">
                      {extendModalSub.student?.name?.charAt(0)?.toUpperCase() || 'E'}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Élève</p>
                  <p className="font-bold text-slate-800 text-sm truncate">{extendModalSub.student?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{extendModalSub.student?.email}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Module</p>
                <p className="font-bold text-slate-800 text-sm">{extendModalSub.course?.title}</p>
                <p className="text-xs text-slate-500">
                  Expiration actuelle : {new Date(extendModalSub.expiresAt).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Durée de prolongation à ajouter :
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { val: 1, label: '+1 mois' },
                    { val: 3, label: '+3 mois' },
                    { val: 6, label: '+6 mois' },
                    { val: 12, label: '+1 an' },
                  ].map((btn) => (
                    <button
                      key={btn.val}
                      type="button"
                      onClick={() => setExtendMonths(btn.val)}
                      className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        extendMonths === btn.val
                          ? 'bg-[#009688] text-white border-[#009688] shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-teal-50 rounded-xl text-xs text-teal-800 flex items-start gap-2 border border-teal-100">
                <Check className="w-4 h-4 text-[#009688] shrink-0 mt-0.5" />
                <p>
                  La nouvelle date d'expiration sera automatiquement repoussée de <strong>{extendMonths} mois</strong> à partir de la date d'expiration actuelle (ou d'aujourd'hui si déjà expiré).
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setExtendModalSub(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleApplyExtension}
                className="px-5 py-2 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold shadow-sm transition"
              >
                Confirmer la prolongation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HISTORIQUE DES MODIFICATIONS */}
      {historyModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-700" />
                <h3 className="font-bold text-slate-900">Historique des modifications</h3>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalSub(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="bg-slate-50 p-3.5 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-slate-200 shrink-0">
                  {getStudentAvatar(historyModalSub) ? (
                    <img
                      src={getStudentAvatar(historyModalSub)}
                      alt={historyModalSub.student?.name || 'Élève'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-xs">
                      {historyModalSub.student?.name?.charAt(0)?.toUpperCase() || 'E'}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-bold uppercase">Élève &amp; Module</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{historyModalSub.student?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{historyModalSub.course?.title}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Événements enregistrés
                </h4>
                {historyModalSub.history && historyModalSub.history.length > 0 ? (
                  <div className="space-y-2">
                    {historyModalSub.history.map((h, i) => (
                      <div key={i} className="p-3 rounded-xl border border-slate-100 bg-white text-xs">
                        <div className="flex items-center justify-between text-slate-500 mb-1">
                          <span className="font-bold text-slate-800 capitalize">{h.action || 'Modification'}</span>
                          <span>{h.date ? new Date(h.date).toLocaleString('fr-FR') : 'Date inconnue'}</span>
                        </div>
                        <p className="text-slate-600">{h.details || 'Abonnement mis à jour.'}</p>
                        {h.performedBy && <p className="text-[11px] text-slate-400 mt-1">Par: {h.performedBy}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    Aucune modification historique spécifique n'a encore été consignée pour cet abonnement.
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryModalSub(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptionsTab;
