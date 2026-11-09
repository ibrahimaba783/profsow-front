import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle, Sparkles, MailOpen, Eye, EyeOff, Check } from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';
import profPhoto from '../assets/prof-aliou-sow.jpg';
import GoogleLoginButton from '../components/GoogleLoginButton';

// Atouts affichés à gauche
const AUTH_POINTS = [
  'Cours vidéo et séances en direct sur Google Meet',
  'Fiches de cours et devoirs corrigés en PDF',
  'Quiz interactifs avec correction automatique',
  'Du collège à la Terminale S : BFEM et Baccalauréat',
];

const inputClass =
  'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2f4fd8] focus:ring-2 focus:ring-[#2f4fd8]/20 transition';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailPreview, setEmailPreview] = useState('');

  const { register } = useContext(AuthContext);
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
    <div className="h-screen bg-white pt-16 overflow-y-auto">
      <div className="max-w-6xl mx-auto min-h-full px-6 py-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Côté gauche : présentation + témoignage (masqué sur mobile) */}
        <div className="hidden lg:block">
          <h1 className="text-4xl font-extrabold text-slate-900 leading-tight mb-6">
            Améliorer vos compétences avec Aliou Sow Academy
          </h1>
          <p className="text-slate-700 leading-relaxed mb-8">
            Avec Aliou Sow Academy, suivez des cours de Mathématiques et de Physique-Chimie, regardez les
            vidéos, téléchargez les fiches PDF, testez-vous avec des quiz et participez aux séances en direct
            pour réussir le BFEM et le Baccalauréat.
          </p>

          <ul className="space-y-3 mb-8">
            {AUTH_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-slate-800 font-medium">
                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <img
              src={profPhoto}
              alt="M. Aliou Sow"
              className="w-16 h-16 rounded-full object-cover object-[50%_8%] ring-4 ring-[#d6a74a]"
            />
            <div className="leading-tight">
              <p className="font-extrabold text-[#0b1f49]">M. Aliou Sow</p>
              <p className="text-sm text-slate-500 mt-0.5">Professeur de Mathématiques &amp; Physique-Chimie</p>
            </div>
          </div>
        </div>

        {/* Côté droit : carte d'inscription */}
        <div className="w-full max-w-md mx-auto lg:max-w-none bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
          {emailPreview ? (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <MailOpen className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">Inscription réussie !</h2>

              <p className="text-slate-600 text-sm max-w-sm mx-auto">
                Votre compte a été créé. Un e-mail de bienvenue a été envoyé à <strong>{email}</strong>.
              </p>

              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-left max-w-md mx-auto space-y-2">
                <span className="flex items-center gap-1 text-xs font-bold text-indigo-600">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  SIMULATION D'ENVOI D'EMAIL RÉEL
                </span>

                <p className="text-slate-500 text-xs">
                  Comme le serveur utilise Nodemailer en mode test, vous pouvez prévisualiser l'e-mail de
                  bienvenue formaté en HTML réel envoyé.
                </p>

                <a
                  href={emailPreview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-indigo-600 hover:text-indigo-700 text-xs font-bold underline break-all"
                >
                  Ouvrir l'e-mail envoyé dans le navigateur ↗
                </a>
              </div>

              <button
                onClick={handleProceed}
                className="bg-[#0b1f49] hover:bg-[#2f4fd8] text-white font-bold px-8 py-3 rounded-lg transition w-full max-w-xs mx-auto cursor-pointer"
              >
                Accéder à mon espace
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <img src={logo} alt="Aliou Sow Academy" className="h-12 w-auto mx-auto mb-2" />
                <h2 className="text-2xl font-extrabold text-slate-900">Inscrivez-vous</h2>
                <p className="text-slate-500 text-sm mt-1">Rejoignez la classe de M. Aliou Sow en quelques secondes</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm mb-5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <GoogleLoginButton onError={setError} />

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 border-t border-slate-200"></div>
                <span className="text-xs text-slate-400 font-medium">OU</span>
                <div className="flex-1 border-t border-slate-200"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
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
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
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
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
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
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#0b1f49] hover:bg-[#2f4fd8] text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "S'inscrire"
                  )}
                </button>
              </form>

              <div className="text-center mt-4 text-sm text-slate-500">
                <p>Vous avez déjà un compte ?</p>
                <Link to="/login" className="font-bold text-[#2f4fd8] hover:underline">
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