import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Plus,
  CalendarPlus,
  Trash2,
  History,
  X,
  Check,
  Hourglass,
  TrendingUp,
  ArrowRight,
  FileText,
  Power,
  Printer,
} from 'lucide-react';

const AdminSubscriptionsTab = ({
  subscriptions = [],
  usersList = [],
  onUpdateSub,
  onDeleteSub,
  onOpenGrantModal,
  setToast,
  setConfirmState,
  globalSearch = '',
}) => {
  const [search, setSearch] = useState('');
  const [activePill, setActivePill] = useState('all'); // all, wave, orange, expired, free
  const [historyModalSub, setHistoryModalSub] = useState(null);
  const [extendModalSub, setExtendModalSub] = useState(null);
  const [receiptModalSub, setReceiptModalSub] = useState(null);
  const [extendMonths, setExtendMonths] = useState(1);

  const getStudentAvatar = (sub) => {
    if (sub?.student?.avatar) return sub.student.avatar;
    const studentId = sub?.student?._id || sub?.student;
    const found = usersList?.find((u) => u._id === studentId || u.email === sub?.student?.email);
    return found?.avatar || null;
  };

  const now = useMemo(() => new Date(), []);

  // Calcul des métriques financières réelles
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let activeCount = 0;
    let expiredCount = 0;
    let expiringSoonCount = 0;

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
    });

    const netTeacher = Math.round(totalRevenue * 0.8);
    const pendingBalance = Math.max(totalRevenue - netTeacher, 0);

    return {
      totalRevenue,
      netTeacher,
      pendingBalance,
      activeCount,
      expiredCount,
      expiringSoonCount,
    };
  }, [subscriptions, now]);

  // Filtrage combiné (recherche locale + globale + pilule active)
  const effectiveSearch = (search || globalSearch).trim().toLowerCase();

  const filteredSubs = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchSearch =
        !effectiveSearch ||
        s.student?.name?.toLowerCase().includes(effectiveSearch) ||
        s.student?.email?.toLowerCase().includes(effectiveSearch) ||
        s.course?.title?.toLowerCase().includes(effectiveSearch) ||
        s.transactionId?.toLowerCase().includes(effectiveSearch) ||
        s._id?.toLowerCase().includes(effectiveSearch) ||
        s.phoneNumber?.toLowerCase().includes(effectiveSearch);

      const exp = new Date(s.expiresAt);
      const isActive = s.status === 'active' && exp > now;
      const method = (s.paymentMethod || '').toLowerCase();

      let matchPill = true;
      if (activePill === 'wave') matchPill = method.includes('wave');
      else if (activePill === 'orange') matchPill = method.includes('orange') || method.includes('om');
      else if (activePill === 'expired') matchPill = !isActive || s.status === 'failed' || s.status === 'cancelled';
      else if (activePill === 'free') matchPill = method.includes('gratuit') || method.includes('offert') || Number(s.amount || 0) === 0;

      return matchSearch && matchPill;
    });
  }, [subscriptions, effectiveSearch, activePill, now]);

  const handleExportCSV = () => {
    const headers = ['ID Transaction', 'Elève', 'Email', 'Cours acheté', 'Montant (F CFA)', 'Méthode', 'Date', 'Statut'];
    const rows = filteredSubs.map((s) => {
      const txId = s.transactionId || `TRX_${(s._id || '').slice(-6).toUpperCase()}`;
      const exp = new Date(s.expiresAt);
      const isActive = s.status === 'active' && exp > now;
      const statusLabel = isActive ? 'Validé' : 'Expiré';
      const dateStr = s.createdAt ? new Date(s.createdAt).toLocaleString('fr-FR') : '';
      return [
        txId,
        s.student?.name || 'Élève',
        s.student?.email || '',
        s.course?.title || 'Matière',
        s.amount || 0,
        s.paymentMethod || 'Wave',
        dateStr,
        statusLabel,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions-aliou-sow-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setToast?.({ type: 'success', text: 'Export CSV téléchargé avec succès.' });
  };

  const handleApplyExtension = async () => {
    if (!extendModalSub) return;
    try {
      await onUpdateSub(
        extendModalSub._id,
        { extendMonths: Number(extendMonths) },
        `Abonnement prolongé de ${extendMonths} mois avec succès.`
      );
      setExtendModalSub(null);
    } catch {
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
      message: `Voulez-vous vraiment ${actionLabel} l'abonnement de ${sub.student?.name || 'cet élève'} pour la matière "${sub.course?.title || 'Matière'}" ?`,
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

  const formatTxDate = (dateValue) => {
    if (!dateValue) return '—';
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMethodBadge = (method = '') => {
    const m = method.toLowerCase();
    if (m.includes('orange') || m.includes('om')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-900 text-orange-400 text-[11px] font-bold">
          OM
        </span>
      );
    }
    if (m.includes('gratuit') || m.includes('offert')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
          Offert
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
        Wave
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête : Titre + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
            Transactions &amp; Trésorerie
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des encaissements Wave / Orange Money, part professeur et gestion des accès élèves.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenGrantModal}
            className="gradient-button gradient-button--sm !px-3.5 !py-2 !text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Accorder un accès</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* 3 Cartes KPI financières (.uiverse-glow-card) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1 : Volume brut encaissé */}
        <div className="uiverse-glow-card p-6 flex flex-col justify-between min-h-[132px]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-medium text-slate-600">Volume brut encaissé</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight">
                {metrics.totalRevenue.toLocaleString('fr-FR')}{' '}
                <span className="text-base font-bold text-slate-700">F CFA</span>
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-400 shrink-0" />
          </div>
          <div className="mt-3 h-8 w-full overflow-hidden">
            <svg viewBox="0 0 220 40" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="treasuryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path
                d="M0 36 L35 28 L72 30 L108 18 L145 22 L182 10 L220 6 L220 40 L0 40 Z"
                fill="url(#treasuryGrad)"
              />
              <path
                d="M0 36 L35 28 L72 30 L108 18 L145 22 L182 10 L220 6"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 2 : Net reversé au Professeur */}
        <div className="uiverse-glow-card p-6 flex flex-col justify-between min-h-[132px]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-medium text-slate-600">Net reversé au Professeur</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight">
                {metrics.netTeacher.toLocaleString('fr-FR')}{' '}
                <span className="text-base font-bold text-slate-700">F CFA</span>{' '}
                <span className="text-sm font-semibold text-slate-500">(80 %)</span>
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            80 % après commission plateforme (20 %) • {metrics.activeCount} accès actif(s)
          </p>
        </div>

        {/* KPI 3 : Solde en attente de virement */}
        <div className="uiverse-glow-card p-6 flex flex-col justify-between min-h-[132px]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-medium text-slate-600">Solde &amp; Frais plateforme (20 %)</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight">
                {metrics.pendingBalance.toLocaleString('fr-FR')}{' '}
                <span className="text-base font-bold text-slate-700">F CFA</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center shrink-0">
              <Hourglass className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            {metrics.expiringSoonCount > 0
              ? `${metrics.expiringSoonCount} abonnement(s) expirant sous 7j`
              : `${metrics.expiredCount} abonnement(s) expiré(s)`}
          </p>
        </div>
      </div>

      {/* Journal détaillé des transactions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="text-[16px] font-bold text-slate-900">
              Journal détaillé des transactions
            </h2>

            {/* Recherche locale */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher élève, cours, ID..."
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

          {/* Pilules de filtre */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'all', label: 'Tous', activeCls: 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20' },
              { key: 'wave', label: 'Wave', activeCls: 'bg-sky-50 text-sky-700 border-sky-300' },
              { key: 'orange', label: 'Orange Money', activeCls: 'bg-orange-50 text-orange-700 border-orange-300' },
              { key: 'expired', label: 'Échecs / Expirés', activeCls: 'bg-rose-50 text-rose-700 border-rose-300' },
              { key: 'free', label: 'Offerts / Manuels', activeCls: 'bg-purple-50 text-purple-700 border-purple-300' },
            ].map((pill) => {
              const isActive = activePill === pill.key;
              return (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setActivePill(pill.key)}
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
            <span className="text-xs text-slate-400 ml-auto font-medium">
              {filteredSubs.length} résultat(s)
            </span>
          </div>
        </div>

        {/* Tableau complet */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Élève</th>
                <th className="py-3.5 px-4">Cours acheté</th>
                <th className="py-3.5 px-4">Montant</th>
                <th className="py-3.5 px-4">Méthode</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {filteredSubs.map((sub) => {
                const avatar = getStudentAvatar(sub);
                const exp = new Date(sub.expiresAt);
                const isActive = sub.status === 'active' && exp > now;
                const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
                const isExpiringSoon = isActive && diffDays <= 7 && diffDays >= 0;
                const txId = sub.transactionId || `TRX_${(sub._id || '').slice(-5).toUpperCase()}`;

                return (
                  <tr key={sub._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5 min-w-[140px]">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={sub.student?.name || 'Élève'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-[10px]">
                              {sub.student?.name?.charAt(0)?.toUpperCase() || 'E'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate max-w-[145px]">
                            {sub.student?.name || 'Élève'}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">{txId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-slate-700 font-medium max-w-[170px] truncate">
                        {sub.course?.title || 'Matière'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatTxDate(sub.createdAt || sub.startDate)}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap tabular-nums">
                      {(sub.amount || 0).toLocaleString('fr-FR')} F CFA
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderMethodBadge(sub.paymentMethod)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isExpiringSoon ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                          En attente renouv.
                        </span>
                      ) : isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          Validé
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                          Expiré
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setReceiptModalSub(sub)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer transition"
                        >
                          Reçu
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setExtendModalSub(sub);
                            setExtendMonths(1);
                          }}
                          title="Prolonger l'abonnement"
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-indigo-600 border border-slate-200/80 transition cursor-pointer"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setHistoryModalSub(sub)}
                          title="Historique"
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200/80 transition cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmToggleStatus(sub)}
                          title={isActive ? "Forcer l'expiration" : 'Réactiver'}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            isActive
                              ? 'bg-slate-50 hover:bg-amber-50 text-slate-500 hover:text-amber-600 border-slate-200/80'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmDelete(sub)}
                          title="Supprimer"
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredSubs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-slate-400">
                    Aucune transaction ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL : APERÇU REÇU DE TRANSACTION */}
      {receiptModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">Reçu de transaction</h3>
              </div>
              <button
                type="button"
                onClick={() => setReceiptModalSub(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">Référence</span>
                <span className="font-mono font-bold text-slate-900">
                  {receiptModalSub.transactionId || `TRX_${(receiptModalSub._id || '').slice(-6).toUpperCase()}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Élève</span>
                <span className="font-bold text-slate-900">{receiptModalSub.student?.name || 'Élève'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cours acheté</span>
                <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
                  {receiptModalSub.course?.title || 'Matière'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Méthode</span>
                <span>{renderMethodBadge(receiptModalSub.paymentMethod)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Date</span>
                <span className="text-slate-700">{formatTxDate(receiptModalSub.createdAt || receiptModalSub.startDate)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="font-bold text-slate-700">Montant payé</span>
                <span className="text-lg font-extrabold text-indigo-600">
                  {(receiptModalSub.amount || 0).toLocaleString('fr-FR')} F CFA
                </span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer
              </button>
              <button
                type="button"
                onClick={() => setReceiptModalSub(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROLONGER L'ABONNEMENT */}
      {extendModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">Prolonger l&apos;abonnement</h3>
              </div>
              <button
                type="button"
                onClick={() => setExtendModalSub(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
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
                <p className="text-xs font-semibold text-slate-400 uppercase">Matière</p>
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
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-800 flex items-start gap-2 border border-blue-100">
                <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  La nouvelle date d&apos;expiration sera automatiquement repoussée de <strong>{extendMonths} mois</strong> à partir de la date d&apos;expiration actuelle (ou d&apos;aujourd&apos;hui si déjà expiré).
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setExtendModalSub(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleApplyExtension}
                className="gradient-button gradient-button--sm !px-4 !py-2 !text-xs"
              >
                Confirmer la prolongation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HISTORIQUE DES MODIFICATIONS */}
      {historyModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-700" />
                <h3 className="font-bold text-slate-900">Historique des modifications</h3>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalSub(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
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
                  <p className="text-xs text-slate-400 font-bold uppercase">Élève &amp; Matière</p>
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
                    Aucune modification historique spécifique n&apos;a encore été consignée pour cet abonnement.
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryModalSub(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
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
