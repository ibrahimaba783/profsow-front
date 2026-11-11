import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';
import GoogleLoginButton from '../components/GoogleLoginButton';

const STUDENT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
];

const inputClass =
  'w-full h-10 border border-slate-300 rounded-lg px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ff9800] focus:ring-2 focus:ring-orange-100 transition bg-white';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName) {
      setError('Veuillez renseigner votre prénom et votre nom');
      setSubmitting(false);
      return;
    }

    try {
      await register(fullName, email.trim(), password, 'student');
      navigate('/student-dashboard');
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte. Vérifiez vos informations.');
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-white flex flex-col justify-between overflow-x-hidden overflow-y-auto lg:overflow-hidden relative select-none">
      {/* Lien retour discret en haut à gauche */}
      <div className="pt-4 px-6 sm:px-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00897b] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour à l'accueil</span>
        </Link>
      </div>

      <div className="max-w-6xl w-full mx-auto px-4 sm:px-8 my-auto py-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* ============================================================== */}
          {/* CÔTÉ GAUCHE : Exactement conforme à la capture Bakeli (Image 1) */}
          {/* ============================================================== */}
          <div className="hidden lg:block lg:col-span-6 space-y-5 pr-4">
            <h1 className="text-3xl lg:text-[40px] font-black text-[#111827] leading-[1.14] tracking-tight">
              Améliorer vos compétences avec Aliou Sow Academy
            </h1>

            <p className="text-slate-600 text-sm leading-relaxed font-normal">
              Avec Aliou Sow Academy, suivez des cours en ligne, obtenez des bases solides en Mathématiques et Physique-Chimie, développez vos compétences scientifiques du collège au lycée, et boostez votre parcours pour décrocher le BFEM et le Baccalauréat avec mention.
            </p>

            <div className="pt-1">
              {/* Grand guillemet orange vif caractéristique Bakeli (Image 1) */}
              <div className="text-4xl font-serif font-black text-[#ff9800] leading-none mb-1">“</div>

              {/* Témoignage d'élève */}
              <p className="text-slate-700 text-sm leading-relaxed font-normal">
                Aliou Sow Academy a complètement changé ma façon d'apprendre. Les cours sont bien structurés, accessibles à tout moment, et adaptés à mon rythme. Grâce à cette plateforme, j'ai pu combler mes lacunes en sciences et réussir brillamment mes examens.
              </p>

              <p className="mt-2.5 text-sm font-bold text-slate-800 italic">
                -Youmané Diop (Terminale S)
              </p>

              {/* Les 4 avatars en rond sous le témoignage (Image 1) */}
              <div className="flex items-center gap-3 mt-3.5">
                {STUDENT_AVATARS.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Élève"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* CÔTÉ DROIT : Carte d'inscription Bakeli (Image 1) */}
          {/* ============================================================== */}
          <div className="lg:col-span-6 w-full max-w-[430px] mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-5 sm:p-7">
            <div className="text-center mb-3">
              <Link to="/" title="Retour à l'accueil" className="inline-block">
                <img src={logo} alt="Aliou Sow Academy" className="h-9 w-auto mx-auto mb-1.5" />
              </Link>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Inscrivez-vous</h2>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 p-2.5 rounded-xl text-xs font-semibold mb-3">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Bouton de connexion Google */}
            <div className="flex justify-center mb-3">
              <GoogleLoginButton onError={setError} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
              {/* Prénom et Nom côte à côte (Image 1) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                    placeholder="Entrez votre prénom"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                    placeholder="Entrez votre nom"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
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

              {/* Téléphone optionnel avec drapeau 🇸🇳 +221 (Image 1) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Téléphone <span className="text-slate-400 font-normal">(optionnel)</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 flex items-center gap-1.5 text-xs font-bold text-slate-600 pointer-events-none">
                    <span>🇸🇳</span>
                    <span>+221</span>
                    <span className="text-slate-300">|</span>
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`${inputClass} pl-20`}
                    placeholder="77 000 00 00"
                  />
                </div>
              </div>

              {/* Mot de passe avec oeil (Image 1) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
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
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Bouton Orange Bakeli plein (Image 1) */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-lg bg-[#ff9800] hover:bg-[#f57c00] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>S'inscrire</span>
                )}
              </button>
            </form>

            {/* Lien de bas de carte (Image 1) */}
            <div className="text-center mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600">
              <span>Vous avez déjà un compte ?</span>{' '}
              <Link to="/login" className="font-bold text-[#00897b] hover:underline">
                Connectez-vous
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-3 text-center text-[11px] text-slate-400">
        &copy; {new Date().getFullYear()} Aliou Sow Academy &bull; Tous droits réservés
      </div>
    </div>
  );
};

export default Register;