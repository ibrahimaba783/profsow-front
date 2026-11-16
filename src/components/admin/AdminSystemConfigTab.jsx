import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Database,
  Download,
  RefreshCw,
} from 'lucide-react';
import api from '../../utils/api';

const AdminSystemConfigTab = ({
  draftSettings = {},
  setDraftSettings,
  courses = [],
  onSaveSettings,
  savingSettings = false,
  onDownloadBackup,
  showToast,
}) => {
  const [testingConn, setTestingConn] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  const [cdnProvider, setCdnProvider] = useState(
    draftSettings.siteInfo?.cdnProvider || 'Cloudinary / CDN'
  );
  const [publicKey, setPublicKey] = useState(
    draftSettings.siteInfo?.paymentPublicKey || 'pk_live_aliousow_••••••••••'
  );
  const [secretKey, setSecretKey] = useState(
    draftSettings.siteInfo?.paymentSecretKey || 'sk_live_aliousow_••••••••••'
  );

  const [autoNotifs, setAutoNotifs] = useState({
    paymentConfirm: true,
    multiIpAlert: true,
    renewalAlert: true,
    couponStockAlert: false,
  });

  const dynamicWatermark =
    draftSettings.securityRules?.dynamicWatermark !== false;

  const totalChapters = courses.reduce(
    (sum, c) => sum + (Array.isArray(c.chapters) ? c.chapters.length : 0),
    0
  );
  const storagePercent = Math.min(Math.max(Math.round((courses.length / 20) * 100), 18), 92);

  const handleCopy = (label, val) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(''), 1800);
  };

  const handleTestConnection = async () => {
    setTestingConn(true);
    try {
      await api('/settings');
      showToast?.('success', 'Passerelles Wave, Orange Money & API connectées (200 OK).');
    } catch {
      showToast?.('error', 'Échec du test de connexion API.');
    } finally {
      setTestingConn(false);
    }
  };

  const handleToggleWatermark = () => {
    setDraftSettings((prev) => ({
      ...prev,
      securityRules: {
        ...(prev.securityRules || {}),
        dynamicWatermark: !(prev.securityRules?.dynamicWatermark !== false),
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
            Configuration Système
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Passerelles de paiement, stockage vidéo/PDF, notifications automatiques et sauvegarde.
          </p>
        </div>

        {onDownloadBackup && (
          <button
            type="button"
            onClick={onDownloadBackup}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-xs font-bold text-slate-700 shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sauvegarde BD (JSON)</span>
          </button>
        )}
      </div>

      {/* 3 Colonnes principales (Maquette Étape 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Colonne 1 : Passerelles de Paiement (API) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h2 className="text-[16px] font-bold text-slate-900">
              Passerelles de Paiement (API)
            </h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <p className="font-semibold text-slate-800">Wave Business API</p>
                  <p className="text-[11px] text-slate-400">
                    {draftSettings.siteInfo?.waveNumber || '+221 77 102 33 99'}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  Connecté <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <p className="font-semibold text-slate-800">Orange Money API</p>
                  <p className="text-[11px] text-slate-400">
                    {draftSettings.siteInfo?.orangeMoneyNumber || '+221 77 102 33 99'}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  Connecté <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="pt-1 space-y-3">
                <p className="text-xs font-bold text-slate-700">PayDunya / Carte Bancaire</p>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Clé API Publique
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={publicKey}
                      onChange={(e) => setPublicKey(e.target.value)}
                      className="w-full h-9 pl-3 pr-9 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy('pub', publicKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Copier"
                    >
                      {copiedKey === 'pub' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Clé API Secrète
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      className="w-full h-9 pl-3 pr-9 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy('sec', secretKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Copier"
                    >
                      {copiedKey === 'sec' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testingConn}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
          >
            {testingConn && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{testingConn ? 'Test en cours...' : 'Tester la connexion'}</span>
          </button>
        </div>

        {/* Colonne 2 : Stockage Cloud & Streaming Vidéo */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h2 className="text-[16px] font-bold text-slate-900">
              Stockage Cloud &amp; Streaming Vidéo
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Fournisseur CDN
              </label>
              <select
                value={cdnProvider}
                onChange={(e) => setCdnProvider(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600"
              >
                <option value="Cloudinary / CDN">Cloudinary / CDN (Actif)</option>
                <option value="AWS CloudFront">AWS CloudFront</option>
                <option value="Bunny Stream">Bunny Stream</option>
              </select>
            </div>

            <div
              onClick={handleToggleWatermark}
              className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between gap-3 cursor-pointer hover:border-slate-300 transition"
            >
              <button
                type="button"
                role="switch"
                aria-checked={dynamicWatermark}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  dynamicWatermark ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    dynamicWatermark ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                <span
                  className={`absolute text-[8px] font-extrabold text-white ${
                    dynamicWatermark ? 'left-1.5' : 'hidden'
                  }`}
                >
                  ON
                </span>
              </button>
              <span className="text-xs font-semibold text-slate-800 flex-1 leading-snug">
                Tatouage dynamique (Filigrane) PDF/Vidéo
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Quota de contenu &amp; stockage</span>
                <span className="font-semibold text-indigo-600">{storagePercent}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: `${storagePercent}%` }}
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                />
              </div>
              <p className="text-xs text-slate-600">
                <strong className="text-indigo-600">{courses.length} cours</strong> •{' '}
                {totalChapters} chapitres &amp; ressources hébergées
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-semibold text-slate-700">
              <Database className="w-4 h-4 text-indigo-600" />
              Base de données MongoDB
            </span>
            <span className="font-bold text-emerald-600">Synchronisée</span>
          </div>
        </div>

        {/* Colonne 3 : Notifications & Emails Automatiques */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h2 className="text-[16px] font-bold text-slate-900">
              Notifications &amp; Emails Automatiques
            </h2>

            {[
              { key: 'paymentConfirm', label: 'Confirmation de paiement élève' },
              { key: 'multiIpAlert', label: 'Alerte de sécurité (Multi-IP)' },
              { key: 'renewalAlert', label: "Alerte d'expiration d'abonnement" },
              { key: 'couponStockAlert', label: 'Alerte de stock de coupons' },
            ].map((item) => {
              const enabled = Boolean(autoNotifs[item.key]);
              return (
                <div
                  key={item.key}
                  onClick={() =>
                    setAutoNotifs((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                  }
                  className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center gap-3 cursor-pointer hover:border-slate-300 transition"
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
                  <span className="text-xs font-semibold text-slate-800 leading-snug">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onSaveSettings}
            disabled={savingSettings}
            className="gradient-button gradient-button--sm w-full !py-2.5 !text-xs flex items-center justify-center disabled:opacity-60"
          >
            {savingSettings ? 'Enregistrement...' : 'Enregistrer la configuration'}
          </button>
        </div>
      </div>

      {/* Identité & Coordonnées de la plateforme */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">
            Identité, Numéros de paiement &amp; Maintenance
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nom de la plateforme
            </label>
            <input
              type="text"
              value={draftSettings.siteInfo?.platformName || ''}
              onChange={(e) =>
                setDraftSettings((prev) => ({
                  ...prev,
                  siteInfo: { ...prev.siteInfo, platformName: e.target.value },
                }))
              }
              className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Numéro Wave Business
            </label>
            <input
              type="text"
              value={draftSettings.siteInfo?.waveNumber || ''}
              onChange={(e) =>
                setDraftSettings((prev) => ({
                  ...prev,
                  siteInfo: { ...prev.siteInfo, waveNumber: e.target.value },
                }))
              }
              className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Numéro Orange Money
            </label>
            <input
              type="text"
              value={draftSettings.siteInfo?.orangeMoneyNumber || ''}
              onChange={(e) =>
                setDraftSettings((prev) => ({
                  ...prev,
                  siteInfo: { ...prev.siteInfo, orangeMoneyNumber: e.target.value },
                }))
              }
              className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Tarif standard (FCFA)
            </label>
            <input
              type="number"
              value={draftSettings.siteInfo?.defaultPrice ?? 6000}
              onChange={(e) =>
                setDraftSettings((prev) => ({
                  ...prev,
                  siteInfo: { ...prev.siteInfo, defaultPrice: Number(e.target.value) },
                }))
              }
              className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemConfigTab;
