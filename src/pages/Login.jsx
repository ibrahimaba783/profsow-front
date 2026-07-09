import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = await login(email, password);
      if (data.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Identifiants invalides');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 pt-16 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/5 relative z-10 slide-in">
        <div className="text-center mb-8">
          <img src={logo} alt="Aliou Sow Academy" className="h-16 w-auto mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-white tracking-wide">Bienvenue</h2>
          <p className="text-slate-400 text-sm mt-1">Connectez-vous pour accéder à vos cours</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-animated pl-10"
                placeholder="nom@exemple.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Mot de passe</label>
              <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-animated pl-10 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-neon text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Se connecter</span>
            )}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-8">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;