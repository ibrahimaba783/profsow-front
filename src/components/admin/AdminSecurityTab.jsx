import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Check,
  X,
  Search,
  Eye,
  TrendingUp,
  ArrowRight,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import api from '../../utils/api';

const REASON_LABELS = {
  inappropriate_content: 'Contenu inapproprié',
  harassment: 'Harcèlement / Comportement abusif',
  spam: 'Spam ou publicité non autorisée',
  suspect_behavior: 'Comportement suspect',
  cheating: 'Triche ou fraude',
  hate_speech: 'Propos haineux ou insultes',
  other: 'Autre motif',
};

const STATUS_BADGES = {
  pending: 'bg-rose-50 text-rose-700 border-rose-200',
  in_review: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-slate-100 text-slate-600 border-slate-200',
};

const STATUS_LABELS = {
  pending: 'En attente',
  in_review: 'En cours',
  resolved: 'Résolu',
  rejected: 'Ignoré',
};

const DEFAULT_SECURITY_RULES = {
  limitDevices: true,
  dynamicWatermark: true,
  antiVideoDownload: true,
};

const AdminSecurityTab = ({
  reports = [],
  securityLogs = [],
  usersList = [],
  courses = [],
  settings = {},
  onRefresh,
  showToast,
  setToast,
  globalSearch = '',
}) => {
  const notify = (type, text) => {
    if (showToast) showToast(type, text);
    else if (setToast) setToast({ type, text });
  };

  const [subTab, setSubTab] = useState('alerts'); // 'alerts' | 'reports' | 'logs'
  const [search, setSearch] = useState('');
  const [dismissedLogIds, setDismissedLogIds] = useState([]);

  // Traitement d'un signalement
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionOnTarget, setActionOnTarget] = useState('none');
  const [treatingReport, setTreatingReport] = useState(false);

  // Règles de protection actives
  const [securityRules, setSecurityRules] = useState(
    settings?.securityRules || DEFAULT_SECURITY_RULES
  );
  const [savingRules, setSavingRules] = useState(false);

  useEffect(() => {
    if (settings?.securityRules) {
      setSecurityRules({ ...DEFAULT_SECURITY_RULES, ...settings.securityRules });
    }
  }, [settings?.securityRules]);

  // Modal Étape 8 : Verrouiller les sessions suspectes & Forcer la déconnexion
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockScope, setLockScope] = useState('single'); // 'single' | 'course' | 'global'
  const [lockTargetInput, setLockTargetInput] = useState('');
  const [lockCourseId, setLockCourseId] = useState('');
  const [lockDisconnectMode, setLockDisconnectMode] = useState('suspect'); // 'suspect' | 'all'
  const [lockActionMode, setLockActionMode] = useState('sessions_only'); // 'sessions_only' | 'temp_block_24h'
  const [applyingLock, setApplyingLock] = useState(false);

  useEffect(() => {
    if (!lockCourseId && courses.length > 0) {
      setLockCourseId(courses[0]._id);
    }
  }, [courses, lockCourseId]);

  const pendingReports = useMemo(
    () => reports.filter((r) => r.status === 'pending'),
    [reports]
  );

  const criticalOrWarningLogs = useMemo(
    () =>
      securityLogs.filter(
        (l) =>
          (l.severity === 'critical' || l.severity === 'warning') &&
          !dismissedLogIds.includes(l._id)
      ),
    [securityLogs, dismissedLogIds]
  );

  const totalDocumentsCount = useMemo(() => {
    return courses.reduce(
      (sum, c) => sum + (Array.isArray(c.chapters) ? c.chapters.length : 0),
      0
    );
  }, [courses]);

  const effectiveSearch = (search || globalSearch).trim().toLowerCase();

  // Flux unifié pour le tableau principal "Journal des alertes & Partage de compte"
  const unifiedAlerts = useMemo(() => {
    const fromReports = pendingReports.map((r) => ({
      id: r._id,
      kind: 'report',
      raw: r,
      studentName: r.targetUser?.name || r.reporter?.name || 'Utilisateur',
      studentEmail: r.targetUser?.email || r.reporter?.email || '',
      userId: r.targetUser?._id || null,
      alertType: REASON_LABELS[r.reason] || r.reason || 'Signalement',
      deviceInfo: r.description || 'Signalement en attente',
      severity: 'critical',
    }));

    const fromLogs = criticalOrWarningLogs.map((l) => ({
      id: l._id,
      kind: 'log',
      raw: l,
      studentName: l.user?.name || l.email || 'Session inconnue',
      studentEmail: l.email || l.user?.email || '',
      userId: l.user?._id || l.user || null,
      alertType: (l.event || 'Alerte sécurité').replace(/_/g, ' '),
      deviceInfo: [l.ip, l.message].filter(Boolean).join(' • ') || 'Activité détectée',
      severity: l.severity || 'warning',
    }));

    const merged = [...fromReports, ...fromLogs];
    if (!effectiveSearch) return merged;
    return merged.filter(
      (item) =>
        item.studentName.toLowerCase().includes(effectiveSearch) ||
        item.studentEmail.toLowerCase().includes(effectiveSearch) ||
        item.alertType.toLowerCase().includes(effectiveSearch) ||
        item.deviceInfo.toLowerCase().includes(effectiveSearch)
    );
  }, [pendingReports, criticalOrWarningLogs, effectiveSearch]);

  const filteredReports = useMemo(() => {
    if (!effectiveSearch) return reports;
    return reports.filter(
      (r) =>
        (r.description || '').toLowerCase().includes(effectiveSearch) ||
        (r.reporter?.name || '').toLowerCase().includes(effectiveSearch) ||
        (REASON_LABELS[r.reason] || '').toLowerCase().includes(effectiveSearch)
    );
  }, [reports, effectiveSearch]);

  const filteredLogs = useMemo(() => {
    if (!effectiveSearch) return securityLogs;
    return securityLogs.filter(
      (l) =>
        (l.email || '').toLowerCase().includes(effectiveSearch) ||
        (l.message || '').toLowerCase().includes(effectiveSearch) ||
        (l.ip || '').toLowerCase().includes(effectiveSearch)
    );
  }, [securityLogs, effectiveSearch]);

  const handleToggleRule = async (ruleKey) => {
    const updated = { ...securityRules, [ruleKey]: !securityRules[ruleKey] };
    setSecurityRules(updated);
    setSavingRules(true);
    try {
      await api('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ securityRules: updated }),
      });
      notify('success', 'Règle de protection mise à jour.');
    } catch (err) {
      notify('error', err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSavingRules(false);
    }
  };

  const handleIgnoreAlert = async (alertItem) => {
    if (alertItem.kind === 'report') {
      try {
        await api(`/reports/${alertItem.id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'rejected', adminNotes: 'Ignoré depuis le centre sécurité' }),
        });
        notify('success', 'Alerte ignorée.');
        if (onRefresh) await onRefresh();
      } catch (err) {
        notify('error', err.message || 'Impossible de mettre à jour ce signalement.');
      }
    } else {
      setDismissedLogIds((prev) => [...prev, alertItem.id]);
      notify('success', 'Alerte masquée de la file active.');
    }
  };

  const handleQuickBlockAlert = (alertItem) => {
    // Ouvre le modal Étape 8 pré-rempli sur cet élève pour confirmer le verrouillage/blocage
    setLockScope('single');
    setLockTargetInput(alertItem.studentEmail || alertItem.studentName || '');
    setLockActionMode('temp_block_24h');
    setShowLockModal(true);
  };

  const handleResolveReport = async (status) => {
    if (!selectedReport) return;
    setTreatingReport(true);
    try {
      await api(`/reports/${selectedReport._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          adminNotes,
          actionOnTarget: status === 'resolved' ? actionOnTarget : 'none',
        }),
      });
      notify('success', `Signalement marqué comme ${status === 'resolved' ? 'résolu' : 'ignoré'}.`);
      setSelectedReport(null);
      if (onRefresh) await onRefresh();
    } catch (err) {
      notify('error', err.message || 'Erreur lors du traitement du signalement.');
    } finally {
      setTreatingReport(false);
    }
  };

  // Trouver l'utilisateur ciblé dans le modal Étape 8
  const matchedUser = useMemo(() => {
    const q = lockTargetInput.trim().toLowerCase();
    if (!q) return null;
    return usersList.find(
      (u) =>
        (u.email && u.email.toLowerCase() === q) ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        u._id === q
    );
  }, [lockTargetInput, usersList]);

  const handleApplyLock = async (e) => {
    e.preventDefault();
    setApplyingLock(true);
    try {
      if (lockScope === 'single') {
        if (!matchedUser) {
          notify('error', 'Aucun élève correspondant trouvé. Saisissez un email ou nom valide.');
          setApplyingLock(false);
          return;
        }
        if (lockActionMode === 'temp_block_24h') {
          await api(`/admin/users/${matchedUser._id}/suspend`, {
            method: 'POST',
            body: JSON.stringify({
              days: 1,
              reason: 'Verrouillage sécurité 24h (sessions suspectes)',
            }),
          });
          notify('success', `Compte de ${matchedUser.name} verrouillé pour 24h.`);
        } else {
          await api(`/admin/users/${matchedUser._id}/reset-password`, { method: 'POST' });
          notify('success', `Sessions de ${matchedUser.name} révoquées avec succès.`);
        }
      } else if (lockScope === 'course') {
        const courseObj = courses.find((c) => c._id === lockCourseId);
        notify(
          'success',
          `Verrouillage appliqué sur le groupe "${courseObj?.title || 'Cours'}" (${
            lockDisconnectMode === 'all' ? 'tous les appareils' : 'sessions suspectes'
          }).`
        );
      } else {
        await api('/admin/settings', {
          method: 'PUT',
          body: JSON.stringify({
            securityRules: { ...securityRules, limitDevices: true },
          }),
        });
        notify('success', 'Politique globale de verrouillage des sessions activée.');
      }
      setShowLockModal(false);
      if (onRefresh) await onRefresh();
    } catch (err) {
      notify('error', err.message || 'Erreur lors du verrouillage.');
    } finally {
      setApplyingLock(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
            Sécurité &amp; Anti-piratage
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Détection multi-IP, protection des PDF/vidéos, signalements et verrouillage des sessions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowLockModal(true)}
          className="gradient-button gradient-button--sm !px-3.5 !py-2 !text-xs inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Verrouiller les sessions suspectes</span>
        </button>
      </div>

      {/* 3 Cartes KPI (.uiverse-glow-card mode clair) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1 : Connexions / Événements surveillés */}
        <div className="uiverse-glow-card p-6 flex flex-col justify-between min-h-[132px]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-medium text-slate-600">Événements sécurité</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight">
                {securityLogs.length} journalisé{securityLogs.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {criticalOrWarningLogs.length} critique(s) / alerte(s)
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-400 shrink-0" />
          </div>
          <div className="mt-2 h-7 w-full overflow-hidden">
            <svg viewBox="0 0 220 40" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="secSparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path
                d="M0 35 L40 28 L80 31 L120 18 L160 24 L200 11 L220 7 L220 40 L0 40 Z"
                fill="url(#secSparkGrad)"
              />
              <path
                d="M0 35 L40 28 L80 31 L120 18 L160 24 L200 11 L220 7"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 2 : Documents / Cours protégés */}
        <div className="uiverse-glow-card p-6 flex flex-col justify-between min-h-[132px]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-medium text-slate-600">Contenus filigranés</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight">
                {totalDocumentsCount > 0 ? totalDocumentsCount : courses.length} document
                {(totalDocumentsCount > 0 ? totalDocumentsCount : courses.length) > 1 ? 's' : ''}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-3">
            {securityRules.dynamicWatermark ? 'Protection active' : 'Protection en pause'}
          </p>
        </div>

        {/* KPI 3 : Tentatives suspectes */}
        <div className="uiverse-glow-card p-6 flex flex-col justify-between min-h-[132px]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-medium text-slate-600">Tentatives suspectes</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight">
                {unifiedAlerts.length} alerte{unifiedAlerts.length > 1 ? 's' : ''} active
                {unifiedAlerts.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            {pendingReports.length} signalement(s) en attente
          </p>
        </div>
      </div>

      {/* Grille principale 2 colonnes : Journal des alertes + Règles de protection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Colonne Gauche : Journal des alertes & Partage de compte */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-[16px] font-bold text-slate-900">
                Journal des alertes &amp; Partage de compte
              </h2>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher élève, IP, alerte..."
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: 'alerts', label: `Alertes actives (${unifiedAlerts.length})` },
                { key: 'reports', label: `Signalements (${reports.length})` },
                { key: 'logs', label: `Logs complets (${securityLogs.length})` },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setSubTab(t.key)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                    subTab === t.key
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vue 1 : Alertes actives unifiées */}
          {subTab === 'alerts' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Élève</th>
                    <th className="py-3.5 px-4">Type d&apos;alerte</th>
                    <th className="py-3.5 px-4">Appareil / Localisation</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {unifiedAlerts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-5 font-semibold text-slate-900 whitespace-nowrap">
                        {item.studentName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium capitalize">
                        {item.alertType}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs max-w-[220px] truncate">
                        {item.deviceInfo}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {item.kind === 'report' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReport(item.raw);
                                setAdminNotes(item.raw.adminNotes || '');
                                setActionOnTarget('none');
                              }}
                              title="Examiner le signalement"
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-indigo-600 border border-slate-200 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleQuickBlockAlert(item)}
                            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 cursor-pointer transition"
                          >
                            Bloquer
                          </button>
                          <button
                            type="button"
                            onClick={() => handleIgnoreAlert(item)}
                            className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 cursor-pointer transition"
                          >
                            Ignorer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {unifiedAlerts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-sm text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                          <span>Aucune alerte active pour le moment.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Vue 2 : Tous les Signalements */}
          {subTab === 'reports' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Signalé par</th>
                    <th className="py-3.5 px-4">Motif</th>
                    <th className="py-3.5 px-4">Statut</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {filteredReports.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        {r.reporter?.name || 'Élève'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs max-w-[240px] truncate">
                        {REASON_LABELS[r.reason] || r.description}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            STATUS_BADGES[r.status] || STATUS_BADGES.pending
                          }`}
                        >
                          {STATUS_LABELS[r.status] || r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReport(r);
                            setAdminNotes(r.adminNotes || '');
                            setActionOnTarget('none');
                          }}
                          className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-xs font-semibold text-slate-700 cursor-pointer"
                        >
                          Traiter
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-slate-400">
                        Aucun signalement enregistré.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Vue 3 : Journal complet des logs */}
          {subTab === 'logs' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Compte / IP</th>
                    <th className="py-3.5 px-4">Événement</th>
                    <th className="py-3.5 px-4">Gravité</th>
                    <th className="py-3.5 px-5 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {filteredLogs.slice(0, 30).map((l) => (
                    <tr key={l._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-5 font-medium text-slate-800">
                        {l.email || l.ip || 'Système'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs max-w-[220px] truncate">
                        {l.message || (l.event || '').replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            l.severity === 'critical'
                              ? 'bg-rose-100 text-rose-700'
                              : l.severity === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {l.severity || 'info'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right text-xs text-slate-500 whitespace-nowrap">
                        {l.createdAt ? new Date(l.createdAt).toLocaleString('fr-FR') : '—'}
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-slate-400">
                        Aucun log enregistré.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Colonne Droite : Règles de protection actives */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[16px] font-bold text-slate-900">
              Règles de protection actives
            </h2>
            {savingRules && (
              <span className="text-[11px] font-semibold text-indigo-600 animate-pulse">
                Sauvegarde...
              </span>
            )}
          </div>

          <div className="space-y-3">
            {[
              {
                key: 'limitDevices',
                label: 'Limiter à 2 appareils max par élève',
              },
              {
                key: 'dynamicWatermark',
                label: 'Filigrane dynamique (Nom + Téléphone sur PDF)',
              },
              {
                key: 'antiVideoDownload',
                label: 'Protection anti-téléchargement vidéo',
              },
            ].map((rule) => {
              const enabled = Boolean(securityRules[rule.key]);
              return (
                <div
                  key={rule.key}
                  onClick={() => handleToggleRule(rule.key)}
                  className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between gap-3 cursor-pointer hover:border-slate-300 transition"
                >
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                      enabled ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                    <span
                      className={`absolute text-[8px] font-extrabold text-white ${
                        enabled ? 'left-1.5' : 'hidden'
                      }`}
                    >
                      ON
                    </span>
                  </button>
                  <span className="text-xs font-semibold text-slate-800 flex-1 leading-snug">
                    {rule.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= MODAL ÉTAPE 8 : VERROUILLER LES SESSIONS SUSPECTES ================= */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <form
            onSubmit={handleApplyLock}
            className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="text-lg font-extrabold text-slate-900">
                Verrouiller les sessions suspectes &amp; Forcer la déconnexion
              </h3>
              <button
                type="button"
                onClick={() => setShowLockModal(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Verrouiller par
                    </label>
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80">
                      {[
                        { key: 'single', label: 'Élève unique' },
                        { key: 'course', label: 'Groupe' },
                        { key: 'global', label: 'Global' },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setLockScope(opt.key)}
                          className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            lockScope === opt.key
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lockScope === 'course'
                        ? 'Cours concerné'
                        : lockScope === 'global'
                        ? 'Portée'
                        : 'Identifiant élève / Email'}
                    </label>
                    {lockScope === 'single' ? (
                      <input
                        type="text"
                        value={lockTargetInput}
                        onChange={(e) => setLockTargetInput(e.target.value)}
                        placeholder="ex: fatou@email.com ou nom"
                        className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600"
                      />
                    ) : lockScope === 'course' ? (
                      <select
                        value={lockCourseId}
                        onChange={(e) => setLockCourseId(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                      >
                        {courses.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="h-9 px-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center text-xs font-semibold text-slate-600">
                        Toute la plateforme
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Forcer la déconnexion de
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'suspect', label: 'Sessions actives suspectes' },
                      { key: 'all', label: 'Tous les appareils connectés' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setLockDisconnectMode(opt.key)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          lockDisconnectMode === opt.key
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Action de blocage
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'sessions_only', label: 'Uniquement sessions actives' },
                      { key: 'temp_block_24h', label: 'Blocage temporaire compte (24h)' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setLockActionMode(opt.key)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          lockActionMode === opt.key
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">
                      {lockScope === 'single'
                        ? matchedUser
                          ? `${matchedUser.name} (${matchedUser.email})`
                          : lockTargetInput || 'Sélectionnez un élève'
                        : lockScope === 'course'
                        ? 'Verrouillage par groupe de cours'
                        : 'Verrouillage global de sécurité'}
                    </p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      {lockActionMode === 'temp_block_24h'
                        ? 'Le compte sera suspendu pendant 24 heures.'
                        : 'Les jetons de session actifs seront immédiatement révoqués.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Panneau Aperçu du blocage */}
              <div className="md:col-span-4 bg-slate-50 rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between gap-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Aperçu du blocage</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Portée :{' '}
                    <strong>
                      {lockScope === 'single'
                        ? matchedUser?.name || 'Élève unique'
                        : lockScope === 'course'
                        ? 'Groupe de cours'
                        : 'Système global'}
                    </strong>
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Déconnexion :{' '}
                    <strong>
                      {lockDisconnectMode === 'all' ? 'Tous appareils' : 'Sessions suspectes'}
                    </strong>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={applyingLock}
                  className="gradient-button gradient-button--sm w-full !py-2.5 !text-xs flex items-center justify-center disabled:opacity-60"
                >
                  {applyingLock ? 'Application...' : 'Appliquer le verrouillage'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL TRAITEMENT D'UN SIGNALEMENT ================= */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-slate-900">Traiter le signalement</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
              <p className="font-bold text-slate-900">
                {REASON_LABELS[selectedReport.reason] || selectedReport.reason}
              </p>
              <p className="text-slate-600">{selectedReport.description}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Sanction éventuelle
              </label>
              <select
                value={actionOnTarget}
                onChange={(e) => setActionOnTarget(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
              >
                <option value="none">Aucune sanction (résoudre uniquement)</option>
                <option value="suspend_user">Suspendre l&apos;utilisateur (7 jours)</option>
                <option value="block_user">Bloquer définitivement le compte</option>
                <option value="delete_content">Supprimer le contenu signalé</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Notes administrateur
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800"
                placeholder="Décision prise..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={treatingReport}
                onClick={() => handleResolveReport('rejected')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Ignorer
              </button>
              <button
                type="button"
                disabled={treatingReport}
                onClick={() => handleResolveReport('resolved')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-[#1d4ed8] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Marquer résolu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSecurityTab;
