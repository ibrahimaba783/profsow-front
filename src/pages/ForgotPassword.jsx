import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas');
      return;
    }

    setSubmitting(true);
    try {
      await api(`/auth/reset-password/${token}`, {
        method: 'PUT',
        body: JSON.stringify({ password }),
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message || 'Ce lien est invalide ou a expiré. Demandez-en un nouveau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 pt-16">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/5 relative z-10 slide-in">
        {success ? (
          <div className="text-center py-4 space-y-5">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Mot de passe réinitialisé !</h2>
            <p className="text-slate-400 text-sm">Redirection vers la page de connexion...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <img src={logo} alt="Aliou Sow Academy" className="h-14 w-auto mx-auto mb-4" />
              <h2 className="text-2xl font-extrabold text-white tracking-wide">Nouveau mot de passe</h2>
              <p className="text-slate-400 text-sm mt-1">Choisissez un nouveau mot de passe pour votre compte.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-animated pl-10 pr-10"
                    placeholder="Min. 6 caractères"
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

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-animated pl-10 pr-10"
                    placeholder="Retapez le mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                  <span>Réinitialiser le mot de passe</span>
                )}
              </button>
            </form>

            <p className="text-center text-slate-400 text-sm mt-8">
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
                Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;