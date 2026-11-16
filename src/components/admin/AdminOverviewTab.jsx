import React from 'react';
import {
  Bell,
  Download,
  Plus,
  CheckCircle,
  ShieldAlert,
  TrendingUp,
  Users,
  ArrowRight,
  Lock,
} from 'lucide-react';

const AdminOverviewTab = ({
  overview,
  usersList = [],
  courses = [],
  subscriptions = [],
  reports = [],
  securityLogs = [],
  onNavigateTab,
  onOpenSubModal,
  onOpenGrantSubModal,
  onExportBackup,
  onOpenBroadcastModal,
  globalSearch = '',
}) => {
  const stats = overview?.stats || {
    users: { student: 0, teacher: 0, admin: 0, total: 0, active: 0, blocked: 0 },
    courses: { total: courses.length, free: 0, paid: 0 },
    subscriptions: { total: subscriptions.length, active: 0, expired: 0, expiringSoon: 0 },
    totalRevenue: 0,
    revenueByMethod: {},
    pendingReportsCount: 0,
    securityAlertsCount: 0,
  };

  const handleManualAccess = onOpenGrantSubModal || onOpenSubModal;

  const monthlyAnalytics = overview?.monthlyAnalytics || [];
  const maxRevenue = Math.max(...monthlyAnalytics.map((m) => m.revenue || 0), 10000);
  const maxRegistrations = Math.max(...monthlyAnalytics.map((m) => m.registrationsCount || 0), 5);

  const pendingReports = reports?.filter((r) => r.status === 'pending') || [];
  const recentCriticalLogs =
    securityLogs?.filter((l) => l.severity === 'critical' || l.severity === 'warning').slice(0, 4) || [];
  const totalAlertsCount = pendingReports.length + recentCriticalLogs.length;

  // Calcul réel du taux de paiements réussis
  const validSubsCount = subscriptions.filter(
    (s) => s.status !== 'cancelled' && s.status !== 'failed'
  ).length;
  const paymentSuccessRate =
    subscriptions.length > 0
      ? Math.round((validSubsCount / subscriptions.length) * 1000) / 10
      : 0;

  // Contenu & chapitres réels
  const totalChapters = courses.reduce(
    (acc, c) => acc + (Array.isArray(c.chapters) ? c.chapters.length : 0),
    0
  );
  const contentRatio = Math.min(Math.max(Math.round((courses.length / Math.max(courses.length + 4, 10)) * 100), 15), 100);

  // Filtrage recherche globale sur les transactions récentes
  const q = globalSearch.trim().toLowerCase();
  const filteredTransactions = subscriptions
    .filter((sub) => {
      if (!q) return true;
      const studentName = (sub.student?.name || '').toLowerCase();
      const courseTitle = (sub.course?.title || '').toLowerCase();
      const method = (sub.paymentMethod || '').toLowerCase();
      return studentName.includes(q) || courseTitle.includes(q) || method.includes(q);
    })
    .slice(0, 6);

  // Combinaison des alertes sécurité pour le panneau droit
  const securityItems = [
    ...pendingReports.slice(0, 2).map((r) => ({
      id: r._id,
      title: r.targetType === 'user' ? 'Partage / Compte suspect' : 'Contenu signalé',
      subtitle: r.reporter?.name ? `Par ${r.reporter.name}` : r.description,
      level: 'Alerte',
      actionLabel: 'Bloquer',
    })),
    ...recentCriticalLogs.slice(0, 2).map((log) => ({
      id: log._id,
      title: (log.event || 'Alerte sécurité').replace(/_/g, ' '),
      subtitle: log.message || 'Activité inhabituelle détectée',
      level: log.severity === 'critical' ? 'Urgent' : 'Alerte',
      actionLabel: log.severity === 'critical' ? 'Inspecter' : 'Bloquer',
    })),
  ].slice(0, 3);

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

  return (
    <div className="space-y-6">
      {/* En-tête Vue d'ensemble + Actions discrètes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
            Vue d&apos;ensemble
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onOpenBroadcastModal && (
            <button
              type="button"
              onClick={onOpenBroadcastModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 text-xs font-semibold hover:border-indigo-600 hover:text-indigo-600 shadow-xs transition cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Diffuser une annonce</span>
            </button>
          )}
          {onExportBackup && (
            <button
              type="button"
              onClick={onExportBackup}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 text-xs font-semibold hover:border-slate-300 hover:bg-slate-50 shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sauvegarde BD (JSON)</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Cartes KPI (.uiverse-glow-card mode clair) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* KPI 1 : Chiffre d'affaires global */}
        <div
          onClick={() => onNavigateTab('subscriptions')}
          className="uiverse-glow-card p-6 cursor-pointer flex flex-col justify-between min-h-[132px]"
        >
          <div>
            <p className="text-[13px] font-medium text-slate-600">Chiffre d&apos;affaires global</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight">
              {(stats.totalRevenue || 0).toLocaleString('fr-FR')}{' '}
              <span className="text-base font-bold text-slate-700">F CFA</span>
            </p>
          </div>
          {/* Mini sparkline bleue */}
          <div className="mt-3 h-8 w-full overflow-hidden">
            <svg viewBox="0 0 220 40" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path
                d="M0 36 L35 28 L72 30 L108 19 L145 22 L182 12 L220 5 L220 40 L0 40 Z"
                fill="url(#adminRevGrad)"
              />
              <path
                d="M0 36 L35 28 L72 30 L108 19 L145 22 L182 12 L220 5"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 2 : Paiements réussis */}
        <div
          onClick={() => onNavigateTab('subscriptions')}
          className="uiverse-glow-card p-6 cursor-pointer flex flex-col justify-between min-h-[132px]"
        >
          <div>
            <p className="text-[13px] font-medium text-slate-600">Paiements réussis</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight">
              {paymentSuccessRate.toLocaleString('fr-FR')} %
            </p>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-sky-50 border border-sky-200/80 text-sky-700 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Wave
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900 text-orange-400 text-[11px] font-bold">
              OM
            </span>
            <span className="text-[11px] text-slate-400 font-medium ml-auto">
              {subscriptions.length} trans.
            </span>
          </div>
        </div>

        {/* KPI 3 : Alertes sécurité */}
        <div
          onClick={() => onNavigateTab('security')}
          className="uiverse-glow-card p-6 cursor-pointer flex flex-col justify-between min-h-[132px]"
        >
          <div>
            <p className="text-[13px] font-medium text-slate-600">Alertes sécurité</p>
            <p
              className={`text-xl font-extrabold mt-1 tracking-tight ${
                totalAlertsCount > 0 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {totalAlertsCount > 0
                ? `${totalAlertsCount} alerte${totalAlertsCount > 1 ? 's' : ''} active${totalAlertsCount > 1 ? 's' : ''}`
                : 'Aucune alerte'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/70 text-amber-800 text-[11px] font-semibold">
              Multi-connexions
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/70 text-amber-800 text-[11px] font-semibold">
              Partage suspect
            </span>
          </div>
        </div>

        {/* KPI 4 : Contenu & Stockage */}
        <div
          onClick={() => onNavigateTab('courses')}
          className="uiverse-glow-card p-6 cursor-pointer flex flex-col justify-between min-h-[132px]"
        >
          <div>
            <p className="text-[13px] font-medium text-slate-600">Contenu &amp; Matières</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight">
              {courses.length} cours{' '}
              <span className="text-sm font-medium text-slate-500">/ {totalChapters} chap.</span>
            </p>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                style={{ width: `${contentRatio}%` }}
                className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {stats.users?.total || usersList.length} utilisateurs inscrits
            </p>
          </div>
        </div>
      </div>

      {/* Grille principale 2 colonnes : Journal des transactions + Surveillance Sécurité & Système */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Colonne Gauche : Journal des transactions récentes */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-bold text-slate-900">
              Journal des transactions récentes (Wave / Orange Money)
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab('subscriptions')}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline shrink-0 cursor-pointer"
            >
              Tout voir <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Élève</th>
                  <th className="py-3 px-4">Cours</th>
                  <th className="py-3 px-4">Montant</th>
                  <th className="py-3 px-4">Méthode</th>
                  <th className="py-3 px-5 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {filteredTransactions.map((sub) => {
                  const avatar =
                    sub.student?.avatar ||
                    usersList?.find(
                      (u) =>
                        u._id === sub.student?._id ||
                        u._id === sub.student ||
                        u.email === sub.student?.email
                    )?.avatar;
                  const methodRaw = (sub.paymentMethod || 'Wave').toLowerCase();
                  const isOM = methodRaw.includes('orange') || methodRaw === 'om';
                  const isExpired = sub.status === 'expired' || sub.status === 'cancelled';

                  return (
                    <tr key={sub._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5 min-w-[110px]">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
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
                          <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                            {sub.student?.name || 'Élève'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-slate-700 font-medium max-w-[150px] truncate">
                          {sub.course?.title || 'Module'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatTxDate(sub.createdAt || sub.startDate)}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap tabular-nums">
                        {(sub.amount || 0).toLocaleString('fr-FR')} F CFA
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isOM ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-orange-400 text-[11px] font-bold">
                            OM
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                            Wave
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isExpired
                              ? 'bg-rose-50 text-rose-700 border border-rose-200/70'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                          }`}
                        >
                          {isExpired ? 'Expiré' : 'Validé'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      Aucune transaction récente trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleManualAccess}
              className="gradient-button gradient-button--sm !px-3.5 !py-1.5 !text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Accès manuel</span>
            </button>
            <span className="text-[11px] text-slate-400 font-medium">
              {stats.subscriptions?.active || validSubsCount} abonnement(s) actif(s)
            </span>
          </div>
        </div>

        {/* Colonne Droite : Surveillance Sécurité & Système */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[16px] font-bold text-slate-900">
              Surveillance Sécurité &amp; Système
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab('security')}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Centre Sécurité →
            </button>
          </div>

          {/* Liste des alertes actives */}
          <div className="space-y-3">
            {securityItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-slate-800 truncate capitalize">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      item.level === 'Urgent'
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-400 text-slate-900'
                    }`}
                  >
                    {item.level}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('security')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer transition"
                  >
                    {item.actionLabel}
                  </button>
                </div>
              </div>
            ))}

            {securityItems.length === 0 && (
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex items-center gap-3 text-xs text-emerald-800">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Aucune alerte de sécurité active. La plateforme est protégée.</span>
              </div>
            )}
          </div>

          {/* État des passerelles Système */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-[14px] font-bold text-slate-900">Système</h3>

            <div className="flex items-center justify-between text-[13px]">
              <span className="flex items-center gap-2.5 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                Passerelle Wave
              </span>
              <span className="font-semibold text-emerald-600">Connecté</span>
            </div>

            <div className="flex items-center justify-between text-[13px]">
              <span className="flex items-center gap-2.5 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                Passerelle Orange Money
              </span>
              <span className="font-semibold text-emerald-600">Connecté</span>
            </div>

            <div className="flex items-center justify-between text-[13px]">
              <span className="flex items-center gap-2.5 text-slate-700 font-medium">
                <Lock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                Filigrane PDF Sécurité
              </span>
              <span className="font-semibold text-emerald-600">Actif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques analytiques (6 derniers mois) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique 1 : Paiements & Revenus */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900">Évolution des Revenus (6 derniers mois)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Total des encaissements Wave, Orange Money et direct</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" /> En direct
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-3 px-1">
            {monthlyAnalytics.map((item) => {
              const heightPct = Math.max(Math.round((item.revenue / maxRevenue) * 100), 8);
              return (
                <div key={item.monthKey} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="text-[11px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(item.revenue || 0).toLocaleString('fr-FR')} F
                  </div>
                  <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden h-32 flex items-end">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-gradient-to-t from-[#2563eb] to-[#60a5fa] rounded-t-xl transition-all duration-500 group-hover:brightness-110"
                    ></div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 mt-0.5">{item.label.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Graphique 2 : Inscriptions d'Élèves */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900">Nouvelles Inscriptions d&apos;Élèves</h3>
              <p className="text-xs text-slate-400 mt-0.5">Nombre de comptes créés chaque mois</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">
              <Users className="w-3.5 h-3.5" /> Croissance
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-3 px-1">
            {monthlyAnalytics.map((item) => {
              const heightPct = Math.max(Math.round((item.registrationsCount / maxRegistrations) * 100), 8);
              return (
                <div key={item.monthKey} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="text-[11px] font-bold text-sky-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.registrationsCount} élève(s)
                  </div>
                  <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden h-32 flex items-end">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-gradient-to-t from-[#009688] to-[#26a69a] rounded-t-xl transition-all duration-500 group-hover:brightness-110"
                    ></div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 mt-0.5">{item.label.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewTab;
