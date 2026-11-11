import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
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
        body: JSON.stringify({ email: email.trim() }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col justify-between overflow-hidden relative select-none">
      <div className="pt-4 px-6 sm:px-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00897b] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour à la connexion</span>
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto px-4 my-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-7">
          {success ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Email envoyé !</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Si un compte est associé à <strong>{email}</strong>, un lien sécurisé de réinitialisation vous a été envoyé.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full h-11 inline-flex items-center justify-center rounded-xl bg-[#00897b] hover:bg-[#00796b] text-white font-bold text-xs shadow-md transition"
                >
                  Retour à la connexion
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-5">
                <Link to="/" title="Retour à l'accueil" className="inline-block">
                  <img src={logo} alt="Aliou Sow Academy" className="h-9 w-auto mx-auto mb-2" />
                </Link>
                <h2 className="text-xl font-black text-slate-900">Mot de passe oublié</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Entrez votre adresse email pour recevoir un lien de réinitialisation.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 p-2.5 rounded-xl text-xs font-semibold mb-4">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Adresse Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemple@gmail.com"
                      className="w-full h-10 border border-slate-300 rounded-lg pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ff9800] focus:ring-2 focus:ring-orange-100 transition bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 rounded-lg bg-[#ff9800] hover:bg-[#f57c00] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Envoyer le lien de réinitialisation</span>
                  )}
                </button>
              </form>

              <div className="text-center mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <Link to="/login" className="font-bold text-[#00897b] hover:underline">
                  &larr; Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="pb-3 text-center text-[11px] text-slate-400">
        &copy; {new Date().getFullYear()} Aliou Sow Academy &bull; Tous droits réservés
      </div>
    </div>
  );
};

export default ForgotPassword;