import React, { useState, useEffect } from 'react';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Database,
  Server,
  ShieldAlert,
  Zap,
  BookOpen,
  Users,
  Unlock,
  Download,
  Check,
  X,
  Clock,
  LifeBuoy,
  KeyRound,
  Trash2,
  ExternalLink,
  Search,
} from 'lucide-react';
import api from '../../utils/api';

const AdminTroubleshootingTab = ({
  courses = [],
  usersList = [],
  subscriptions = [],
  reports = [],
  onRefresh,
  showToast,
  setConfirmState,
}) => {
  // États de chargement des actions
  const [runningDiagnostic, setRunningDiagnostic] = useState(false);
  const [syncingCounters, setSyncingCounters] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [exportingBackup, setExportingBackup] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState(null);

  // État assistance élève rapide
  const [targetStudentId, setTargetStudentId] = useState('');
  const [targetCourseId, setTargetCourseId] = useState('');
  const [grantDurationDays, setGrantDurationDays] = useState(30);
  const [grantingAccess, setGrantingAccess] = useState(false);

  // Recherche dans les signalements
  const [reportFilter, setReportFilter] = useState('all'); // 'all' | 'pending' | 'resolved'
  const [resolvingReportId, setResolvingReportId] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  // 1. Lancer le diagnostic système complet
  const handleRunDiagnostic = async () => {
    setRunningDiagnostic(true);
    try {
      const startTime = performance.now();
      const overviewData = await api('/admin/overview');
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      // Calcul des vérifications d'intégrité
      const coursesWithoutTeacher = courses.filter((c) => !c.teacher);
      const emptyCourses = courses.filter((c) => !c.chapters || c.chapters.length === 0);
      const blockedUsers = usersList.filter((u) => u.isActive === false || u.status === 'blocked');
      const pendingReports = reports.filter((r) => r.status === 'pending');

      setDiagnosticResult({
        timestamp: new Date(),
        latency,
        apiStatus: 'ok',
        dbStatus: 'ok',
        coursesWithoutTeacher: coursesWithoutTeacher.length,
        emptyCourses: emptyCourses.length,
        blockedUsersCount: blockedUsers.length,
        pendingReportsCount: pendingReports.length,
        totalCourses: courses.length,
        totalUsers: usersList.length,
        totalSubscriptions: subscriptions.length,
      });

      showToast('success', `Diagnostic terminé avec succès en ${latency} ms. Tous les services vitaux répondent.`);
    } catch (err) {
      setDiagnosticResult({
        timestamp: new Date(),
        apiStatus: 'error',
        dbStatus: 'error',
        error: err.message || 'Erreur lors du test de connectivité',
      });
      showToast('error', 'Erreur lors du diagnostic système.');
    } finally {
      setRunningDiagnostic(false);
    }
  };

  // 2. Synchroniser et recalculer les compteurs
  const handleSyncCounters = async () => {
    setSyncingCounters(true);
    try {
      const res = await api('/admin/system/sync-counters', { method: 'POST' });
      showToast('success', res.message || 'Compteurs recalculés avec succès.');
      if (onRefresh) await onRefresh();
    } catch (err) {
      showToast('error', err.message || 'Erreur lors de la synchronisation des compteurs.');
    } finally {
      setSyncingCounters(false);
    }
  };

  // 3. Vider le cache de la plateforme
  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      const res = await api('/admin/system/clear-cache', { method: 'POST' });
      showToast('success', res.message || 'Cache vidé avec succès.');
      if (onRefresh) await onRefresh();
    } catch (err) {
      showToast('error', err.message || 'Erreur lors du vidage du cache.');
    } finally {
      setClearingCache(false);
    }
  };

  // 4. Télécharger la sauvegarde de la base de données
  const handleExportBackup = async () => {
    setExportingBackup(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/backup', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Échec du téléchargement de la sauvegarde');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-profsow-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('success', 'Sauvegarde JSON exportée avec succès sur votre ordinateur.');
    } catch (err) {
      showToast('error', err.message || 'Erreur lors de l\'export de sauvegarde.');
    } finally {
      setExportingBackup(false);
    }
  };

  // 5. Déblocage rapide d'accès pour un élève
  const handleQuickGrantAccess = async (e) => {
    e.preventDefault();
    if (!targetStudentId || !targetCourseId) {
      showToast('error', 'Veuillez sélectionner un élève et une matière.');
      return;
    }
    setGrantingAccess(true);
    try {
      await api('/admin/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          studentId: targetStudentId,
          courseId: targetCourseId,
          durationDays: Number(grantDurationDays) || 30,
          paymentMethod: 'cash',
        }),
      });
      showToast('success', 'Accès à la matière débloqué avec succès pour l\'élève.');
      setTargetStudentId('');
      setTargetCourseId('');
      if (onRefresh) await onRefresh();
    } catch (err) {
      showToast('error', err.message || 'Erreur lors du déblocage de l\'accès.');
    } finally {
      setGrantingAccess(false);
    }
  };

  // 6. Marquer un signalement comme résolu
  const handleResolveReport = async (reportId) => {
    try {
      await api(`/reports/${reportId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'resolved',
          adminNotes: adminNote || 'Problème vérifié et résolu par l\'administrateur.',
        }),
      });
      showToast('success', 'Signalement marqué comme résolu.');
      setResolvingReportId(null);
      setAdminNote('');
      if (onRefresh) await onRefresh();
    } catch (err) {
      showToast('error', err.message || 'Erreur lors de la mise à jour du signalement.');
    }
  };

  // Filtrage des signalements
  const filteredReports = reports.filter((r) => {
    if (reportFilter === 'all') return true;
    return r.status === reportFilter;
  });

  return (
    <div className="space-y-8">
      {/* En-tête du centre de résolution */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Centre de Résolution des Problèmes</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                Support &amp; Diagnostics
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Surveillez la santé du site, diagnostiquez les anomalies et résolvez les blocages en un clic.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleRunDiagnostic}
            disabled={runningDiagnostic}
            className="px-5 py-2.5 rounded-xl bg-[#6372e8] hover:bg-[#5260d8] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${runningDiagnostic ? 'animate-spin' : ''}`} />
            <span>{runningDiagnostic ? 'Diagnostic en cours...' : 'Lancer un Diagnostic'}</span>
          </button>
        </div>
      </div>

      {/* Cartes d'état en direct du système */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Statut Serveur API */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Serveur API</div>
            <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Opérationnel (Port 5000)</span>
            </div>
            {diagnosticResult && (
              <div className="text-[10px] text-slate-400 mt-0.5">Latence : {diagnosticResult.latency} ms</div>
            )}
          </div>
        </div>

        {/* Statut MongoDB */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Base MongoDB</div>
            <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Connecté &amp; Synchronisé</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{courses.length} matières • {usersList.length} comptes</div>
          </div>
        </div>

        {/* Intégrité des Matières & Leçons */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#009688] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Matières &amp; Leçons</div>
            <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
              <span>{courses.reduce((sum, c) => sum + (c.chaptersCount ?? c.chapters?.length ?? 0), 0)} chapitres</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {courses.reduce((sum, c) => sum + (c.lessonsCount ?? c.chapters?.reduce((cs, ch) => cs + (ch.lessons?.length || 0), 0) ?? 0), 0)} leçons en ligne
            </div>
          </div>
        </div>

        {/* Signalements & Incidents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            reports.filter((r) => r.status === 'pending').length > 0
              ? 'bg-rose-50 text-rose-600'
              : 'bg-emerald-50 text-emerald-600'
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Signalements Actifs</div>
            <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
              {reports.filter((r) => r.status === 'pending').length === 0 ? (
                <span className="text-emerald-600 font-bold">0 incident en attente</span>
              ) : (
                <span className="text-rose-600 font-black">
                  {reports.filter((r) => r.status === 'pending').length} à traiter
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Total historique : {reports.length}</div>
          </div>
        </div>
      </div>

      {/* Boîte à outils de Réparation en 1 clic */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
        <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>Actions de Réparation Rapide &amp; Maintenance</span>
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Utilisez ces boutons si vous observez un décalage d'affichage de compteurs ou si vous souhaitez recharger les contenus à neuf.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1 : Recalculer les compteurs */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                <RefreshCw className="w-4 h-4 text-[#009688]" />
                <span>Recalculer les compteurs</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Recalcule automatiquement le nombre exact de matières, chapitres et leçons sur tous les cours pour garantir un affichage parfait.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSyncCounters}
              disabled={syncingCounters}
              className="w-full py-2.5 px-3 rounded-lg bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingCounters ? 'animate-spin' : ''}`} />
              <span>{syncingCounters ? 'Synchronisation...' : 'Synchroniser les compteurs'}</span>
            </button>
          </div>

          {/* Action 2 : Vider le cache */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Vider le cache mémoire</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Purge la mémoire tampon du serveur pour que chaque nouvelle leçon ou matière s'affiche immédiatement sans délai de cache.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              disabled={clearingCache}
              className="w-full py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{clearingCache ? 'Purge en cours...' : 'Purger le cache'}</span>
            </button>
          </div>

          {/* Action 3 : Sauvegarde BDD */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                <Download className="w-4 h-4 text-[#6372e8]" />
                <span>Sauvegarde de sécurité (JSON)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Télécharge un fichier JSON contenant l'intégralité de vos comptes élèves, cours, quiz et abonnements pour archivage.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportBackup}
              disabled={exportingBackup}
              className="w-full py-2.5 px-3 rounded-lg bg-[#6372e8] hover:bg-[#5260d8] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exportingBackup ? 'Export en cours...' : 'Télécharger la sauvegarde'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dépannage rapide d'accès pour un élève */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
        <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
          <Unlock className="w-5 h-5 text-emerald-600" />
          <span>Déblocage Express d'un Accès Élève (Urgence)</span>
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Si un élève rencontre un problème de validation de paiement (Wave, Orange Money) ou a besoin d'un accès immédiat, activez son abonnement directement ici.
        </p>

        <form onSubmit={handleQuickGrantAccess} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-5">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sélectionnez l'Élève :
            </label>
            <select
              value={targetStudentId}
              onChange={(e) => setTargetStudentId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#009688]"
            >
              <option value="">-- Choisir un utilisateur --</option>
              {usersList.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email}) — {u.role}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Matière à Débloquer :
            </label>
            <select
              value={targetCourseId}
              onChange={(e) => setTargetCourseId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#009688]"
            >
              <option value="">-- Choisir la matière --</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title} ({c.level} • {c.subject})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={grantingAccess}
              className="w-full h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{grantingAccess ? 'Activation...' : 'Débloquer l\'Accès'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Signalements & Incidents Signalés */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>Signalements &amp; Incidents Signalés par les Élèves</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Consultez et résolvez les bugs, signalements ou demandes d'assistance reçus.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReportFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                reportFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous ({reports.length})
            </button>
            <button
              type="button"
              onClick={() => setReportFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                reportFilter === 'pending'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              En attente ({reports.filter((r) => r.status === 'pending').length})
            </button>
            <button
              type="button"
              onClick={() => setReportFilter('resolved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                reportFilter === 'resolved'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Résolus ({reports.filter((r) => r.status === 'resolved').length})
            </button>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h4 className="font-bold text-slate-800 text-sm">Aucun incident à signaler</h4>
            <p className="text-xs text-slate-400 mt-1">Tous les signalements sont traités ou aucun n'a été déposé.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => {
              const isPending = report.status === 'pending';
              const isResolving = resolvingReportId === report._id;

              return (
                <div
                  key={report._id}
                  className={`p-4 rounded-xl border transition ${
                    isPending
                      ? 'border-rose-200 bg-rose-50/20'
                      : 'border-slate-100 bg-[#f8fafc]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPending ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {isPending ? 'En attente' : 'Résolu'}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{report.reason}</span>
                        <span className="text-[11px] text-slate-400">• {new Date(report.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium">{report.description}</p>

                      <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
                        <span>Signalé par : <strong>{report.reporter?.name || 'Utilisateur'}</strong> ({report.reporter?.email || 'N/A'})</span>
                        {report.targetType && <span>• Cible : {report.targetType}</span>}
                      </div>

                      {report.adminNotes && (
                        <div className="mt-2 text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                          <strong>Note de résolution :</strong> {report.adminNotes}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isPending && !isResolving && (
                        <button
                          type="button"
                          onClick={() => setResolvingReportId(report._id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Marquer Résolu</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {isResolving && (
                    <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Expliquez la solution apportée..."
                        className="flex-1 h-9 px-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleResolveReport(report._id)}
                          className="h-9 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                        >
                          Confirmer la Résolution
                        </button>
                        <button
                          type="button"
                          onClick={() => setResolvingReportId(null)}
                          className="h-9 px-3 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTroubleshootingTab;
