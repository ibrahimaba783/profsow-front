import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle, Eye, EyeOff, Check } from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';
import profPhoto from '../assets/prof-aliou-sow.jpg';

// Atouts affichés à gauche
const AUTH_POINTS = [
  'Cours vidéo et séances en direct sur Google Meet',
  'Fiches de cours et devoirs corrigés en PDF',
  'Quiz interactifs avec correction automatique',
  'Du collège à la Terminale S : BFEM et Baccalauréat',
];

const inputClass =
  'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2f4fd8] focus:ring-2 focus:ring-[#2f4fd8]/20 transition';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const redirectByRole = (role) => {
    if (role === 'teacher') {
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

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setSubmitting(true);

    try {
      const data = await googleLogin(credentialResponse.credential);
      redirectByRole(data.role);
    } catch (err) {
      setError(err.message || 'Connexion Google impossible');
    } finally {
      setSubmitting(false);
    }
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

        {/* Côté droit : carte de connexion */}
        <div className="w-full max-w-md mx-auto lg:max-w-none bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
          <div className="text-center mb-4">
            <img src={logo} alt="Aliou Sow Academy" className="h-12 w-auto mx-auto mb-2" />
            <h2 className="text-2xl font-extrabold text-slate-900">Connectez-vous</h2>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('La connexion avec Google a échoué. Veuillez réessayer.')}
              text="signin_with"
              shape="rectangular"
              theme="outline"
              size="large"
              locale="fr"
            />
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="text-xs text-slate-400 font-medium">OU</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                autoComplete="email"
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#0b1f49] hover:bg-[#2f4fd8] text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Connecter</span>
              )}
            </button>
          </form>

          <div className="text-right mt-3">
            <Link to="/forgot-password" className="text-sm text-slate-500 hover:text-[#2f4fd8]">
              Mot de passe oublié ?
            </Link>
          </div>

          <div className="text-center mt-4 text-sm text-slate-500">
            <p>Vous n'avez pas de compte ?</p>
            <Link to="/register" className="font-bold text-[#2f4fd8] hover:underline">
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;