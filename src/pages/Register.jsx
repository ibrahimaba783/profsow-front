import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  User,
  Mail,
  Lock,
  AlertCircle,
  Sparkles,
  MailOpen,
  Eye,
  EyeOff,
} from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';
import GoogleLoginButton from '../components/GoogleLoginButton';

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
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 pt-20 pb-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-200/40 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-lg glass-card rounded-2xl p-8 border border-slate-100 relative z-10 slide-in">
        {emailPreview ? (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <MailOpen className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Inscription réussie !
            </h2>

            <p className="text-slate-600 text-sm max-w-sm mx-auto">
              Votre compte a été créé. Un e-mail de bienvenue a été envoyé à{' '}
              <strong>{email}</strong>.
            </p>

            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-left max-w-md mx-auto space-y-2">
              <span className="flex items-center gap-1 text-xs font-bold text-indigo-600">
                <Sparkles className="w-3 h-3 animate-pulse" />
                SIMULATION D'ENVOI D'EMAIL RÉEL
              </span>

              <p className="text-slate-500 text-xs">
                Comme le serveur utilise Nodemailer en mode test, vous pouvez
                prévisualiser l'e-mail de bienvenue formaté en HTML réel envoyé.
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
              className="btn-neon text-white font-bold px-8 py-3 rounded-xl transition w-full max-w-xs mx-auto cursor-pointer"
            >
              Accéder à mon espace
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <img
                src={logo}
                alt="Aliou Sow Academy"
                className="h-16 w-auto mx-auto mb-4"
              />

              <h2 className="text-2xl font-extrabold text-slate-900 tracking-wide">
                Créer un compte Élève
              </h2>

              <p className="text-slate-500 text-sm mt-1">
                Rejoignez la classe de M. Aliou Sow en quelques secondes
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm mb-6">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Nom complet
                </label>

                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-animated pl-10"
                    placeholder="Alioune Diop"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Email
                </label>

                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-animated pl-10"
                    placeholder="nom@exemple.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Mot de passe
                </label>

                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-animated pl-10 pr-10"
                    placeholder="Minimum 6 caractères"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-neon text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "S'inscrire"
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="text-xs text-slate-400 uppercase">ou</span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>

            <GoogleLoginButton onError={setError} />

            <p className="text-center text-slate-500 text-sm mt-8">
              Déjà un compte ?{' '}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-700 font-semibold underline"
              >
                Se connecter
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;