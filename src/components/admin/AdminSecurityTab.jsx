import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  UserX,
  Trash2,
  Check,
  X,
  Search,
  Filter,
  Eye,
  Lock,
  Activity,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
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
  rejected: 'Rejeté',
};

const SEVERITY_BADGES = {
  critical: 'bg-rose-500 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-slate-500 text-white',
};

const AdminSecurityTab = ({ reports = [], securityLogs = [], onRefresh, showToast }) => {
  const [subTab, setSubTab] = useState('reports'); // 'reports' | 'logs' | 'protection'
  const [reportFilter, setReportFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionOnTarget, setActionOnTarget] = useState('none'); // 'none' | 'suspend_user' | 'block_user' | 'delete_content'
  const [treatingReport, setTreatingReport] = useState(false);

  // Filtres logs
  const [logSeverity, setLogSeverity] = useState('all');
  const [logSearch, setLogSearch] = useState('');

  const filteredReports = reports.filter((r) => {
    if (reportFilter === 'all') return true;
    return r.status === reportFilter;
  });

  const filteredLogs = securityLogs.filter((l) => {
    const matchSeverity = logSeverity === 'all' || l.severity === logSeverity;
    const q = logSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.message && l.message.toLowerCase().includes(q)) ||
      (l.ip && l.ip.includes(q));
    return matchSeverity && matchSearch;
  });

  const handleOpenReport = (r) => {
    setSelectedReport(r);
    setAdminNotes(r.adminNotes || '');
    setActionOnTarget('none');
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
      showToast('success', `Signalement marqué comme ${status === 'resolved' ? 'résolu' : 'rejeté'}.`);
      setSelectedReport(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast('error', err.message || 'Erreur lors du traitement du signalement.');
    } finally {
      setTreatingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête & Onglets de navigation */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Centre de Sécurité &amp; Signalements</h2>
              <p className="text-xs text-slate-500">
                Traitement des signalements d&apos;élèves, détection de force-brute et journal d&apos;audit de sécurité.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100">
          <button
            type="button"
            onClick={() => setSubTab('reports')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === 'reports' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Signalements ({reports.filter((r) => r.status === 'pending').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('logs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === 'logs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-500" />
            <span>Journal de Sécurité</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('protection')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === 'protection' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Politiques Actives</span>
          </button>
        </div>
      </div>

      {/* ================= SOUS-ONGLET 1 : SIGNALEMENTS ================= */}
      {subTab === 'reports' && (
        <div className="space-y-4">
          {/* Filtres de statut */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['all', 'pending', 'in_review', 'resolved', 'rejected'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setReportFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition shrink-0 cursor-pointer ${
                  reportFilter === st
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st === 'all' ? 'Tous les signalements' : STATUS_LABELS[st]}
              </button>
            ))}
          </div>

          {/* Liste des signalements */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Signalé par</th>
                    <th className="py-3 px-4">Cible</th>
                    <th className="py-3 px-4">Motif</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredReports.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{r.reporter?.name || 'Anonyme'}</div>
                        <div className="text-[11px] text-slate-400">{r.reporter?.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {r.targetType === 'user' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                            <User className="w-3 h-3" />
                            {r.targetUser?.name || 'Utilisateur'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                            <FileText className="w-3 h-3" />
                            Contenu ({r.contentType || 'Module'})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{REASON_LABELS[r.reason] || r.reason}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{r.description}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            STATUS_BADGES[r.status] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {STATUS_LABELS[r.status] || r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenReport(r)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
                        >
                          Examiner
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        Aucun signalement ne correspond à ce filtre.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= SOUS-ONGLET 2 : JOURNAL DE SÉCURITÉ ================= */}
      {subTab === 'logs' && (
        <div className="space-y-4">
          {/* Filtres et recherche */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sévérité :</span>
              {['all', 'info', 'warning', 'critical'].map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setLogSeverity(sev)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                    logSeverity === sev
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sev === 'all' ? 'Toutes' : sev}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrer par email, IP ou mot-clé..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-slate-900"
              />
            </div>
          </div>

          {/* Table du journal d'audit */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Date/Heure</th>
                    <th className="py-3 px-4">Sévérité</th>
                    <th className="py-3 px-4">Événement</th>
                    <th className="py-3 px-4">Utilisateur / Cible</th>
                    <th className="py-3 px-4">Adresse IP</th>
                    <th className="py-3 px-4">Message &amp; Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-sans">
                        {new Date(log.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            SEVERITY_BADGES[log.severity] || 'bg-slate-500 text-white'
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900">
                        {log.event}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-sans text-slate-700">
                        {log.email || log.user?.email || '—'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        {log.ip || '127.0.0.1'}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-700 max-w-md truncate">
                        {log.message}
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400 font-sans">
                        Aucun journal ne correspond à votre recherche.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= SOUS-ONGLET 3 : POLITIQUES & PROTECTIONS ================= */}
      {subTab === 'protection' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Anti Brute-Force Actif</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verrouille automatiquement tout compte pendant 15 minutes dès que 5 tentatives consécutives de mot de passe échouent.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <Check className="w-4 h-4" /> Opérationnel &amp; surveillé
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Cryptage Fort des Mots de Passe</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mots de passe sécurisés par l&apos;algorithme Bcrypt (salage dynamique 10 tours). Les jetons de récupération sont hachés en SHA-256.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-sky-600">
              <Check className="w-4 h-4" /> Chiffrement irréversible
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Surveillance &amp; Traçabilité IP</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Chaque connexion et tentative d&apos;authentification est horodatée avec adresse IP et navigateur client pour audit judiciaire ou interne.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-purple-600">
              <Check className="w-4 h-4" /> Traçabilité 100% active
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL D'EXAMEN D'UN SIGNALEMENT ================= */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200 slide-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Traitement du Signalement</h3>
                <p className="text-xs text-slate-500">ID: {selectedReport._id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Auteur du signalement :</span>
                  <span className="font-extrabold text-slate-900">{selectedReport.reporter?.name} ({selectedReport.reporter?.email})</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Motif :</span>
                  <span className="font-extrabold text-rose-600">{REASON_LABELS[selectedReport.reason] || selectedReport.reason}</span>
                </div>
                {selectedReport.targetUser && (
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">Utilisateur incriminé :</span>
                    <span className="font-extrabold text-slate-900">{selectedReport.targetUser.name} ({selectedReport.targetUser.email})</span>
                  </div>
                )}
                <div>
                  <span className="font-bold text-slate-500 block mb-1">Description fournie :</span>
                  <p className="text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed font-sans">
                    {selectedReport.description}
                  </p>
                </div>
              </div>

              {/* Action immédiate sur la cible */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-slate-800">
                  Action corrective automatique à appliquer :
                </label>
                <select
                  value={actionOnTarget}
                  onChange={(e) => setActionOnTarget(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-slate-900"
                >
                  <option value="none">Aucune sanction automatique (marquer résolu)</option>
                  {selectedReport.targetUser && (
                    <>
                      <option value="suspend_user">Suspendre le compte de l&apos;utilisateur (7 jours)</option>
                      <option value="block_user">Bloquer définitivement le compte de l&apos;utilisateur</option>
                    </>
                  )}
                  {selectedReport.targetContentId && (
                    <option value="delete_content">Supprimer définitivement le contenu signalé</option>
                  )}
                </select>
              </div>

              {/* Note de résolution admin */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Notes administratives (justification / résolution) :
                </label>
                <textarea
                  rows="3"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Expliquez la décision prise ou la démarche effectuée..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-slate-900 font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={treatingReport}
                onClick={() => handleResolveReport('rejected')}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Rejeter le signalement
              </button>
              <button
                type="button"
                disabled={treatingReport}
                onClick={() => handleResolveReport('resolved')}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Accepter &amp; Résoudre</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSecurityTab;
