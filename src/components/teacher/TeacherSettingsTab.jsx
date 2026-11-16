import React, { useState } from 'react';
import { Upload, Save, ChevronDown } from 'lucide-react';

const TeacherSettingsTab = ({
  user,
  profileName,
  setProfileName,
  profileEmail,
  setProfileEmail,
  profilePhone,
  setProfilePhone,
  profileBio,
  setProfileBio,
  profilePassword,
  setProfilePassword,
  profileAvatarFile,
  setProfileAvatarFile,
  platformTitle,
  setPlatformTitle,
  waveNumber,
  setWaveNumber,
  orangeNumber,
  setOrangeNumber,
  autoPayout,
  setAutoPayout,
  watermarkEnabled,
  setWatermarkEnabled,
  freePreviewCount,
  setFreePreviewCount,
  prefEmailNotifs,
  setPrefEmailNotifs,
  prefLiveReminders,
  setPrefLiveReminders,
  savingProfile,
  handleSaveTeacherProfile,
}) => {
  const [showAccountFields, setShowAccountFields] = useState(false);

  const avatarPreview = profileAvatarFile
    ? URL.createObjectURL(profileAvatarFile)
    : user?.avatar;

  return (
    <form
      onSubmit={handleSaveTeacherProfile}
      className="space-y-6 animate-fade-slide-up"
    >
      <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
        Paramètres de la plateforme
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Carte 1 : Profil du Professeur & Marque */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
          <h2 className="text-base font-extrabold text-slate-900">
            Profil du Professeur &amp; Marque
          </h2>

          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar + Upload */}
            <div className="flex flex-col items-center gap-2.5 shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={profileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-extrabold text-slate-400">
                    {profileName?.charAt(0)?.toUpperCase() || 'P'}
                  </span>
                )}
              </div>
              <label className="h-8 px-3.5 rounded-xl border border-slate-200 hover:border-[#2563eb] bg-white text-xs font-semibold text-slate-700 hover:text-[#2563eb] inline-flex items-center gap-1.5 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setProfileAvatarFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {/* Champs texte */}
            <div className="flex-1 w-full space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Nom complet (ex. M. Diop)"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#2563eb] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bio / Diplômes (Maths &amp; Physique-Chimie)
                </label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Bio / Diplômes (Maths & Physique-Chimie)..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#2563eb] transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Titre de la plateforme
                </label>
                <input
                  type="text"
                  value={platformTitle}
                  onChange={(e) => setPlatformTitle(e.target.value)}
                  placeholder="Titre de la plateforme (ex. Studio de Sciences)"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#2563eb] transition"
                />
              </div>

              {/* Identifiants & Contact (repliable pour garder la carte fidèle à la maquette) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAccountFields((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563eb] hover:underline cursor-pointer"
                >
                  <span>Email, téléphone &amp; mot de passe</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      showAccountFields ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showAccountFields && (
                  <div className="mt-3 space-y-3 pt-3 border-t border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#2563eb]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Téléphone principal
                        </label>
                        <input
                          type="text"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          placeholder="+221 77 ..."
                          className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#2563eb]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nouveau mot de passe (laisser vide pour conserver)
                      </label>
                      <input
                        type="password"
                        value={profilePassword}
                        onChange={(e) => setProfilePassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#2563eb]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Carte 2 : Configuration des Paiements & Retraits */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
          <h2 className="text-base font-extrabold text-slate-900">
            Configuration des Paiements &amp; Retraits
          </h2>

          <div className="flex items-center gap-3">
            <div className="w-14 h-12 rounded-xl bg-sky-50 border border-[#2563eb]/40 flex items-center justify-center font-black text-sky-600 text-sm">
              Wave
            </div>
            <div className="w-14 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-orange-500 text-sm">
              OM
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Numéro Wave
              </label>
              <input
                type="text"
                value={waveNumber}
                onChange={(e) => setWaveNumber(e.target.value)}
                placeholder="Numéro Wave (F CFA)"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#2563eb] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Numéro Orange Money
              </label>
              <input
                type="text"
                value={orangeNumber}
                onChange={(e) => setOrangeNumber(e.target.value)}
                placeholder="Numéro Orange Money (F CFA)"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#2563eb] transition"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 inline-flex items-center gap-2">
              <span>F CFA</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-800">
                Paiement automatique des gains
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={autoPayout}
                onClick={() => setAutoPayout((v) => !v)}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  autoPayout ? 'bg-[#2563eb]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                    autoPayout ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Carte 3 : Paramètres des Cours & Sécurité */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">
            Paramètres des Cours &amp; Sécurité
          </h2>

          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-sm font-medium text-slate-800">
              Filigrane sur PDFs &amp; Vidéos
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={watermarkEnabled}
              onClick={() => setWatermarkEnabled((v) => !v)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ${
                watermarkEnabled ? 'bg-[#2563eb]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  watermarkEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-sm font-medium text-slate-800">
              Durée d'aperçu de leçon gratuite
            </span>
            <select
              value={freePreviewCount}
              onChange={(e) => setFreePreviewCount(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#2563eb] cursor-pointer"
            >
              <option value="1">1 leçon</option>
              <option value="2">2 leçons</option>
              <option value="3">3 leçons</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-sm font-medium text-slate-800">
              Notifications élèves (inscriptions, nouveaux cours)
            </span>
            <select
              value={prefEmailNotifs ? 'students' : 'off'}
              onChange={(e) => setPrefEmailNotifs(e.target.value === 'students')}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#2563eb] cursor-pointer"
            >
              <option value="students">Élèves</option>
              <option value="off">Désactivées</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-600">
              Rappels automatiques des séances en direct
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={prefLiveReminders}
              onClick={() => setPrefLiveReminders((v) => !v)}
              className={`w-10 h-5 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ${
                prefLiveReminders ? 'bg-[#2563eb]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                  prefLiveReminders ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bouton Enregistrer */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={savingProfile}
          className="gradient-button gradient-button--sm"
        >
          <span className="gradient-text">
            <Save className="w-4 h-4 text-[#4ecdc4]" />
            <span>
              {savingProfile
                ? 'Enregistrement...'
                : 'Enregistrer les modifications'}
            </span>
          </span>
        </button>
      </div>
    </form>
  );
};

export default TeacherSettingsTab;
