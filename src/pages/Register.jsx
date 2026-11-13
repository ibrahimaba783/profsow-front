import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';
import { AlertCircle, Sparkles, MailOpen, Eye, EyeOff, Check, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';
import profPhoto from '../assets/prof-aliou-sow.jpg';
import GoogleLoginButton from '../components/GoogleLoginButton';

const AUTH_POINTS = [
  'Cours vidéo et séances en direct sur Google Meet / Jitsi',
  'Fiches de cours et devoirs corrigés en PDF',
  'Quiz interactifs avec correction automatique',
  'Du collège à la Terminale S : BFEM et Baccalauréat',
];

const inputClass =
  'w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#009688] focus:ring-2 focus:ring-[#009688]/20 transition';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailPreview, setEmailPreview] = useState('');

  const { register } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailPreview('');
    setSubmitting(true);

    try {
      const data = await register(name, email, password, 'student');

      if (data?.emailPreviewUrl) {
        setEmailPreview(data.emailPreviewUrl);
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte');
      setSubmitting(false);
    }
  };

  const handleProceed = () => {
    navigate('/student-dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 sm:p-6 lg:p-8 lg:h-screen lg:overflow-hidden relative">
      <Link
        to="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-8 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour à l&apos;accueil</span>
      </Link>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
        {/* Côté gauche */}
        <div className="hidden lg:block">
          <h1 className="text-3xl xl:text-4xl font-extrabold text-slate-900 leading-tight mb-3 xl:mb-4">
            Améliorez vos compétences avec Aliou Sow Academy
          </h1>
          <p className="text-slate-600 text-sm xl:text-base leading-relaxed mb-5 xl:mb-6">
            Avec Aliou Sow Academy, suivez des cours de Mathématiques et de Physique-Chimie,
            regardez les vidéos, téléchargez les fiches PDF, testez-vous avec des quiz et
            participez aux séances en direct pour réussir le BFEM et le Baccalauréat.
          </p>

          <ul className="space-y-2.5 xl:space-y-3 mb-6 xl:mb-7">
            {AUTH_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-slate-700 font-medium text-sm xl:text-base">
                <Check className="w-5 h-5 text-[#009688] shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3.5">
            <img
              src={profPhoto}
              alt="M. Aliou Sow"
              className="w-14 h-14 xl:w-16 xl:h-16 rounded-full object-cover object-[50%_10%] ring-4 ring-[#f59d0e]/70"
            />
            <div className="leading-tight">
              <p className="font-extrabold text-slate-900 text-base xl:text-lg">M. Aliou Sow</p>
              <p className="text-xs xl:text-sm text-slate-500 mt-0.5">
                Professeur de Mathématiques &amp; Physique-Chimie
              </p>
            </div>
          </div>
        </div>

        {/* Côté droit : carte d'inscription */}
        <div className="w-full max-w-md mx-auto lg:max-w-lg bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 xl:p-7">
          {settings.features?.enableOpenRegistration === false ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-amber-50 text-[#f59d0e] rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">Inscriptions temporairement fermées</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Les nouvelles inscriptions publiques sont momentanément désactivées par l&apos;administrateur.
              </p>
              <Link
                to="/login"
                className="inline-block px-5 py-2 rounded-lg bg-[#009688] text-white text-xs sm:text-sm font-bold hover:bg-[#00796b] transition"
              >
                Se connecter à un compte existant
              </Link>
            </div>
          ) : emailPreview ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 text-[#009688] rounded-full flex items-center justify-center mx-auto mb-2">
                <MailOpen className="w-7 h-7" />
              </div>

              <h2 className="text-xl font-bold text-slate-900">Inscription réussie !</h2>

              <p className="text-slate-600 text-xs sm:text-sm max-w-sm mx-auto">
                Votre compte a été créé. Un e-mail de bienvenue a été envoyé à{' '}
                <strong>{email}</strong>.
              </p>

              <div className="bg-teal-50 border border-teal-100 p-3 rounded-xl text-left max-w-md mx-auto space-y-1.5">
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#009688]">
                  <Sparkles className="w-3 h-3" />
                  PRÉVISUALISATION DE L&apos;E-MAIL ENVOYÉ
                </span>

                <p className="text-slate-500 text-xs">
                  Vous pouvez prévisualiser l&apos;e-mail de bienvenue formaté en HTML envoyé à votre adresse.
                </p>

                <a
                  href={emailPreview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[#009688] hover:underline text-xs font-bold break-all"
                >
                  Ouvrir l&apos;e-mail envoyé dans le navigateur ↗
                </a>
              </div>

              <button
                onClick={handleProceed}
                className="bg-[#009688] hover:bg-[#00796b] text-white font-bold px-6 py-2.5 rounded-lg transition w-full max-w-xs mx-auto cursor-pointer text-sm"
              >
                Accéder à mon espace
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-3 sm:mb-3.5">
                <Link to="/" title="Retour à l'accueil" className="inline-block transition-transform hover:scale-105 cursor-pointer">
                  <img src={logo} alt="Aliou Sow Academy" className="h-9 sm:h-10 w-auto mx-auto mb-1.5" />
                </Link>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Inscrivez-vous</h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                  Rejoignez la classe de M. Aliou Sow en quelques secondes
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 p-2.5 rounded-lg text-xs sm:text-sm mb-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <GoogleLoginButton onError={setError} />

              <div className="flex items-center gap-3 my-2.5 sm:my-3">
                <div className="flex-1 border-t border-slate-200"></div>
                <span className="text-xs text-slate-400 font-medium">OU</span>
                <div className="flex-1 border-t border-slate-200"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                    Nom complet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="Alioune Diop"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="exemple@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClass} pr-10`}
                      placeholder="Minimum 6 caractères"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 cursor-pointer"
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#009688] hover:bg-[#00796b] text-white font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 mt-1 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "S'inscrire"
                  )}
                </button>
              </form>

              <div className="text-center mt-3 text-xs sm:text-sm text-slate-500">
                <span>Vous avez déjà un compte ? </span>
                <Link to="/login" className="font-bold text-[#f59d0e] hover:underline">
                  Connectez-vous
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
