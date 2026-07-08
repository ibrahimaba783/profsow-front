import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, Sparkles, MailOpen } from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      // L'inscription publique crée toujours un compte Élève.
      // Le compte Professeur (unique, M. Aliou Sow) est créé séparément,
      // hors de ce formulaire, pour des raisons de sécurité.
      const data = await register(name, email, password, 'student');

      // Si un email Ethereal a été généré pour la simulation réelle
      if (data.emailPreviewUrl) {
        setEmailPreview(data.emailPreviewUrl);
        // Ne pas naviguer immédiatement si on veut montrer le lien d'e-mail
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
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 pt-20 pb-12">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-lg glass-card rounded-2xl p-8 border border-white/5 relative z-10 slide-in">
        
        {/* Email Preview Modal overlay if sent */}
        {emailPreview ? (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <MailOpen className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Inscription réussie !</h2>
            <p className="text-slate-300 text-sm max-w-sm mx-auto">
              Votre compte a été créé. Un e-mail de bienvenue a été envoyé à <strong>{email}</strong>.
            </p>
            <div className="bg-indigo-500/10 border border-indigo-500/25 p-4 rounded-xl text-left max-w-md mx-auto space-y-2">
              <span className="flex items-center gap-1 text-xs font-bold text-indigo-400">
                <Sparkles className="w-3 h-3 animate-pulse" />
                SIMULATION D'ENVOI D'EMAIL RÉEL
              </span>
              <p className="text-slate-400 text-xs">
                Comme le serveur utilise Nodemailer en mode test, vous pouvez prévisualiser l'email de bienvenue formaté en HTML réel envoyé :
              </p>
              <a
                href={emailPreview}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-indigo-400 hover:text-indigo-300 text-xs font-bold underline break-all"
              >
                Ouvrir l'e-mail envoyé dans le navigateur ↗
              </a>
            </div>
            <button
              onClick={handleProceed}
              className="btn-neon text-white font-bold px-8 py-3 rounded-xl transition w-full max-w-xs cursor-pointer"
            >
              Accéder à mon espace
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <img src={logo} alt="Aliou Sow Academy" className="h-16 w-auto mx-auto mb-4" />
              <h2 className="text-2xl font-extrabold text-white tracking-wide">Créer un compte Élève</h2>
              <p className="text-slate-400 text-sm mt-1">Rejoignez la classe de M. Aliou Sow en quelques secondes</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Nom Complet</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
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
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
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
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Mot de passe</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-animated pl-10"
                    placeholder="Min. 6 caractères"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-neon text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>S'inscrire</span>
                )}
              </button>
            </form>

            <p className="text-center text-slate-400 text-sm mt-8">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
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