import React from 'react';
import {
  CreditCard,
  Users,
  BookOpen,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  Sparkles,
  Download,
  Bell,
  Check,
  UserCheck,
} from 'lucide-react';

const AdminOverviewTab = ({
  overview,
  usersList,
  courses,
  subscriptions,
  reports,
  securityLogs,
  onNavigateTab,
  onOpenSubModal,
  onExportBackup,
  onOpenBroadcastModal,
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

  const monthlyAnalytics = overview?.monthlyAnalytics || [];

  // Calcul du max pour la mise à l'échelle des graphiques
  const maxRevenue = Math.max(...monthlyAnalytics.map((m) => m.revenue || 0), 10000);
  const maxRegistrations = Math.max(...monthlyAnalytics.map((m) => m.registrationsCount || 0), 5);

  const pendingReports = reports?.filter((r) => r.status === 'pending') || [];
  const recentCriticalLogs = securityLogs?.filter((l) => l.severity === 'critical' || l.severity === 'warning').slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Barre d'actions rapides en haut */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-white/60 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Tableau de bord de pilotage</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervision globale en temps réel : inscriptions, paiements Wave/OM, sécurité et activités.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenSubModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#f59d0e] to-[#e08b00] text-white text-xs font-bold hover:brightness-105 shadow-sm transition cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Accorder un abonnement</span>
          </button>
          <button
            type="button"
            onClick={onOpenBroadcastModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span>Diffuser une annonce</span>
          </button>
          <button
            type="button"
            onClick={onExportBackup}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Sauvegarde BD (JSON)</span>
          </button>
        </div>
      </div>

      {/* Cartes KPI dynamiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Revenus */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Revenus Totaux</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#f59d0e] flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {(stats.totalRevenue || 0).toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-bold text-slate-500">FCFA</span>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" /> Wave &amp; OM
            </span>
            <span>• {stats.subscriptions?.total || 0} transactions</span>
          </div>
        </div>

        {/* KPI 2 : Élèves & Utilisateurs */}
        <div
          onClick={() => onNavigateTab('users')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm cursor-pointer hover:border-[#2563eb]/50 transition relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Élèves &amp; Staff</span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.users?.total || 0}{' '}
            <span className="text-xs font-bold text-slate-500">inscrits</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>{stats.users?.student || 0} élèves</span>
            <span>{stats.users?.teacher || 0} prof(s)</span>
            <span>{stats.users?.admin || 0} admin</span>
          </div>
        </div>

        {/* KPI 3 : Abonnements & Alertes expirations */}
        <div
          onClick={() => onNavigateTab('subscriptions')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm cursor-pointer hover:border-emerald-500/50 transition relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Abonnements</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#009688] flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.subscriptions?.active || 0}{' '}
            <span className="text-xs font-bold text-emerald-600 font-semibold">actifs</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-400">{stats.subscriptions?.expired || 0} expirés</span>
            {stats.subscriptions?.expiringSoon > 0 ? (
              <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" /> {stats.subscriptions.expiringSoon} expirant &lt; 7j
              </span>
            ) : (
              <span className="text-slate-400">À jour</span>
            )}
          </div>
        </div>

        {/* KPI 4 : Sécurité & Signalements (PRIORITAIRE) */}
        <div
          onClick={() => onNavigateTab('security')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm cursor-pointer hover:border-rose-400 transition relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sécurité &amp; Signalements</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              pendingReports.length > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-600'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {pendingReports.length}{' '}
            <span className="text-xs font-bold text-rose-600">à traiter</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500">{reports?.length || 0} signalements total</span>
            {recentCriticalLogs.length > 0 && (
              <span className="font-bold text-rose-600">{recentCriticalLogs.length} alerte(s) 24h</span>
            )}
          </div>
        </div>
      </div>

      {/* Graphiques interactifs (Revenus 6 mois & Inscriptions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique 1 : Paiements & Revenus (6 derniers mois) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Évolution des Revenus (6 derniers mois)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Total des encaissements Wave, Orange Money et direct</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" /> En direct
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2">
            {monthlyAnalytics.map((item) => {
              const heightPct = Math.max(Math.round((item.revenue / maxRevenue) * 100), 8);
              return (
                <div key={item.monthKey} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[11px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(item.revenue || 0).toLocaleString('fr-FR')} F
                  </div>
                  <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden h-36 flex items-end">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-gradient-to-t from-[#f59d0e] to-[#fbbf24] rounded-t-xl transition-all duration-500 group-hover:brightness-110 shadow-sm"
                    ></div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 mt-1">{item.label.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Graphique 2 : Inscriptions d'Élèves (6 derniers mois) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Nouvelles Inscriptions d&apos;Élèves</h3>
              <p className="text-xs text-slate-400 mt-0.5">Nombre de comptes créés chaque mois</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">
              <Users className="w-3.5 h-3.5" /> Croissance
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2">
            {monthlyAnalytics.map((item) => {
              const heightPct = Math.max(Math.round((item.registrationsCount / maxRegistrations) * 100), 8);
              return (
                <div key={item.monthKey} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[11px] font-bold text-sky-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.registrationsCount} élève(s)
                  </div>
                  <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden h-36 flex items-end">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-gradient-to-t from-[#009688] to-[#26a69a] rounded-t-xl transition-all duration-500 group-hover:brightness-110 shadow-sm"
                    ></div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 mt-1">{item.label.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Flux d'activités récentes en temps réel (3 colonnes) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne 1 : Derniers Paiements / Abonnements */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#f59d0e]" />
              Dernières Transactions
            </h4>
            <button
              onClick={() => onNavigateTab('subscriptions')}
              className="text-xs font-bold text-[#009688] hover:underline"
            >
              Voir tout →
            </button>
          </div>
          <div className="space-y-3">
            {subscriptions.slice(0, 5).map((sub) => {
              const avatar =
                sub.student?.avatar ||
                usersList?.find((u) => u._id === sub.student?._id || u._id === sub.student || u.email === sub.student?.email)?.avatar;
              return (
                <div key={sub._id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-slate-200 shrink-0">
                      {avatar ? (
                        <img src={avatar} alt={sub.student?.name || 'Élève'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-[10px]">
                          {sub.student?.name?.charAt(0)?.toUpperCase() || 'E'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{sub.student?.name || 'Élève'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{sub.course?.title || 'Module'}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900">{(sub.amount || 0).toLocaleString('fr-FR')} F</span>
                    <span className="block text-[10px] text-slate-400 capitalize">{sub.paymentMethod || 'Wave'}</span>
                  </div>
                </div>
              );
            })}
            {subscriptions.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center">Aucun abonnement récent.</p>
            )}
          </div>
        </div>

        {/* Colonne 2 : Dernières Inscriptions d'Élèves */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" />
              Nouveaux Utilisateurs
            </h4>
            <button
              onClick={() => onNavigateTab('users')}
              className="text-xs font-bold text-[#009688] hover:underline"
            >
              Voir tout →
            </button>
          </div>
          <div className="space-y-3">
            {usersList.slice(0, 5).map((u) => (
              <div key={u._id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden shrink-0">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{u.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 bg-slate-200 text-slate-700">
                  {u.role === 'teacher' ? 'Prof' : u.role === 'admin' ? 'Admin' : 'Élève'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne 3 : Signalements & Alertes Sécurité (PRIORITAIRE) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Alertes &amp; Signalements
            </h4>
            <button
              onClick={() => onNavigateTab('security')}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Centre Sécurité →
            </button>
          </div>
          <div className="space-y-3">
            {pendingReports.slice(0, 3).map((r) => (
              <div key={r._id} className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-700 uppercase text-[10px] tracking-wider">
                    {r.targetType === 'user' ? 'Utilisateur signalé' : 'Contenu signalé'}
                  </span>
                  <span className="text-[10px] text-rose-500">En attente</span>
                </div>
                <p className="font-semibold text-slate-800 line-clamp-1">{r.description}</p>
                <p className="text-[10px] text-slate-400">Par {r.reporter?.name || 'Élève'}</p>
              </div>
            ))}

            {recentCriticalLogs.map((log) => (
              <div key={log._id} className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-700 uppercase text-[10px]">
                    {log.event.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-amber-600 font-bold">{log.severity}</span>
                </div>
                <p className="text-slate-700 line-clamp-1 text-[11px]">{log.message}</p>
              </div>
            ))}

            {pendingReports.length === 0 && recentCriticalLogs.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-1.5">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                <span>Aucune alerte de sécurité. Tout est sous contrôle !</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewTab;
