import React, { useState, useContext } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle, Eye, EyeOff, Check, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';
import profPhoto from '../assets/prof-aliou-sow.jpg';

const AUTH_POINTS = [
  'Cours vidéo et séances en direct sur Google Meet / Jitsi',
  'Fiches de cours et devoirs corrigés en PDF',
  'Quiz interactifs avec correction automatique',
  'Du collège à la Terminale S : BFEM et Baccalauréat',
];

const inputClass =
  'w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#f59d0e] focus:ring-2 focus:ring-[#f59d0e]/20 transition';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const redirectByRole = (role) => {
    if (redirectUrl && role === 'student') {
      navigate(redirectUrl);
      return;
    }
    if (role === 'admin') {
      navigate('/admin-dashboard');
    } else if (role === 'teacher') {
      navigate('/teacher-dashboard');
    } else {
      navigate('/student-dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = await login(email.trim(), password);
      redirectByRole(data.role);
    } catch (err) {
      setError(err.message || 'Identifiants invalides');
    } finally {
      setSubmitting(false);
    }
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
            Suivez des cours structurés de Mathématiques et de Physique-Chimie, téléchargez les
            fiches PDF, testez vos connaissances avec des quiz et participez aux séances en direct
            pour réussir le BFEM et le Baccalauréat.
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

        {/* Côté droit : carte de connexion Uiverse (Mode Clair) */}
        <div className="w-full max-w-md mx-auto lg:max-w-lg uiverse-form-card">
          <div className="uiverse-form-card2 p-6 sm:p-8">
            <div className="text-center mb-4">
              <Link to="/" title="Retour à l'accueil" className="inline-block transition-transform hover:scale-105 cursor-pointer">
                <img src={logo} alt="Aliou Sow Academy" className="h-9 sm:h-10 w-auto mx-auto mb-2" />
              </Link>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Connectez-vous</h2>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 p-2.5 rounded-xl text-xs sm:text-sm mb-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <GoogleLoginButton onError={setError} text="signin_with" />

            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="text-xs text-slate-400 font-medium">OU</span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="uiverse-form-field">
                <svg
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  height="16"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0 text-slate-500"
                >
                  <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z" />
                </svg>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="uiverse-form-input"
                  placeholder="Email (ex: exemple@gmail.com)"
                />
              </div>

              <div className="uiverse-form-field">
                <svg
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  height="16"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0 text-slate-500"
                >
                  <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="uiverse-form-input"
                  placeholder="Mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="uiverse-form-btn flex items-center justify-center"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Se connecter</span>
                  )}
                </button>
                <Link
                  to={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"}
                  className="uiverse-form-btn flex items-center justify-center text-center"
                >
                  S&apos;inscrire
                </Link>
              </div>

              <Link
                to="/forgot-password"
                className="uiverse-form-btn-danger block w-full text-center"
              >
                Mot de passe oublié ?
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
