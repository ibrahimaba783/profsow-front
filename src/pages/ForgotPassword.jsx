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
      setError(err.message || 'Une erreur est survenue. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 pt-[72px]">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-slate-200 shadow-sm slide-in">
        {success ? (
          <div className="text-center py-4 space-y-5">
            <div className="w-14 h-14 bg-teal-50 border border-teal-100 text-[#009688] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Email envoyé !</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Si un compte existe avec l&apos;adresse{' '}
              <strong className="text-slate-800">{email}</strong>, un lien de réinitialisation vient
              d&apos;être envoyé.
            </p>
            <Link
              to="/login"
              className="inline-block bg-[#009688] hover:bg-[#00796b] text-white font-bold px-8 py-3 rounded-lg transition"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-7">
              <img src={logo} alt="Aliou Sow Academy" className="h-12 w-auto mx-auto mb-3" />
              <h2 className="text-2xl font-extrabold text-slate-900">Mot de passe oublié ?</h2>
              <p className="text-slate-500 text-sm mt-1">
                Entrez votre email pour recevoir un lien de réinitialisation.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm mb-6">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-animated pl-10 pr-3"
                    placeholder="nom@exemple.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#009688] hover:bg-[#00796b] text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Envoyer le lien</span>
                )}
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-6">
              <Link to="/login" className="text-[#009688] hover:underline font-semibold">
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
