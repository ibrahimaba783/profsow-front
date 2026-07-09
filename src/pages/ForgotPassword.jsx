import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Une erreur est survenue. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 pt-16 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/5 relative z-10 slide-in">
        {success ? (
          <div className="text-center py-4 space-y-5">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Email envoyé !</h2>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Si un compte existe avec l'adresse <strong className="text-slate-200">{email}</strong>, un lien de réinitialisation vient d'être envoyé.
            </p>
            <Link
              to="/login"
              className="inline-block btn-neon text-white font-bold px-8 py-3 rounded-xl transition"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <img src={logo} alt="Aliou Sow Academy" className="h-14 w-auto mx-auto mb-4" />
              <h2 className="text-2xl font-extrabold text-white tracking-wide">Mot de passe oublié ?</h2>
              <p className="text-slate-400 text-sm mt-1">Entrez votre email pour recevoir un lien de réinitialisation.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-neon text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Envoyer le lien</span>
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

export default ForgotPassword;