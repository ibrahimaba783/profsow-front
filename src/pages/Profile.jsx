import React, { useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  User,
  Mail,
  Camera,
  Check,
  AlertCircle,
  FileText,
  Lock,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Settings,
  LogOut,
} from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

const inputClass =
  'w-full h-11 pl-10 pr-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#009688] focus:ring-2 focus:ring-[#009688]/15 transition';

const Profile = () => {
  const { user, updateProfile, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [password, setPassword] = useState('');

  const [subjects, setSubjects] = useState(user?.subjects || []);
  const [levels, setLevels] = useState(user?.levels || []);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  const availableSubjects = ['Mathématiques', 'Physique-Chimie'];
  const availableLevels = ['4ème', '3ème', '2nde S', '1ère S', 'TS'];

  const isTeacher = user?.role === 'teacher';
  const dashboardPath = isTeacher ? '/teacher-dashboard' : '/student-dashboard';

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const toggleSubject = (subject) => {
    setSubjects(subjects.includes(subject) ? subjects.filter((s) => s !== subject) : [...subjects, subject]);
  };

  const toggleLevel = (level) => {
    setLevels(levels.includes(level) ? levels.filter((l) => l !== level) : [...levels, level]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('bio', bio);
    if (password) formData.append('password', password);
    if (avatarFile) formData.append('avatar', avatarFile);

    if (user.role === 'teacher') {
      formData.append('subjects', JSON.stringify(subjects));
      formData.append('levels', JSON.stringify(levels));
    }

    try {
      await updateProfile(formData);
      setSuccess('Profil mis à jour avec succès !');
      setPassword('');
      setAvatarFile(null);
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/student-dashboard', { state: { view: 'all', query: query.trim() } });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  const initial = user.name ? user.name.trim().charAt(0).toUpperCase() : '?';

  const sidebarItems = isTeacher
    ? [{ to: '/teacher-dashboard', label: 'Tableau de bord', icon: LayoutDashboard }]
    : [
        { to: '/student-dashboard', state: { view: 'all' }, label: 'Tous les cours', icon: BookOpen },
        { to: '/student-dashboard', state: { view: 'mine' }, label: 'Mes cours', icon: GraduationCap },
      ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Barre du haut */}
      <header className="fixed top-0 inset-x-0 h-[72px] bg-white border-b border-slate-200 z-40 flex items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="Aliou Sow Academy" className="h-9 w-auto" />
          <span className="hidden sm:block leading-tight">
            <span className="block text-sm font-extrabold text-slate-900 tracking-wide">ALIOU SOW</span>
            <span className="block text-[9px] font-bold tracking-[0.24em] text-[#009688]">ACADEMY</span>
          </span>
        </Link>

        {!isTeacher && (
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-xl hidden sm:flex items-center bg-white border border-slate-200 rounded-full pl-4 pr-1.5 py-1"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Qu'est-ce que vous souhaitez apprendre ?"
              className="flex-1 min-w-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Rechercher"
              className="w-8 h-8 rounded-full bg-[#f59d0e] hover:bg-[#e08b00] text-white flex items-center justify-center shrink-0 cursor-pointer transition"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="relative shrink-0 ml-auto">
          <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 cursor-pointer">
            {avatarPreview ? (
              <img src={avatarPreview} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
            ) : (
              <span className="w-9 h-9 rounded-full bg-[#009688] text-white flex items-center justify-center">
                <User className="w-5 h-5" />
              </span>
            )}
            <span className="hidden sm:block text-sm font-semibold text-slate-800 max-w-[140px] truncate">
              {user.name}
            </span>
            <ChevronDown className="hidden sm:block w-4 h-4 text-slate-400" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
              <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-3 z-50">
                <div className="px-4 pb-3 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-500">{user.name}</p>
                  <p className="text-sm text-slate-800 truncate">{user.email}</p>
                </div>
                <Link
                  to={dashboardPath}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Tableau de bord
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50"
                >
                  <Settings className="w-4 h-4" />
                  Paramètres
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Menu latéral repliable */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 top-[72px] bg-black/30 z-20"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      <aside
        className={`fixed top-[72px] bottom-0 left-0 w-64 bg-white border-r border-slate-200 z-30 px-4 py-6 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <p className="text-[11px] font-bold tracking-wider text-slate-400 px-2 mb-3">
          {isTeacher ? 'ESPACE PROFESSEUR' : 'ESPACE ÉLÈVE'}
        </p>
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                state={item.state}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="flex-1 text-left">{item.label}</span>
              </Link>
            );
          })}

          <Link
            to="/profile"
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold bg-teal-50 text-[#009688]"
          >
            <span className="w-9 h-9 rounded-lg bg-[#009688] text-white flex items-center justify-center">
              <User className="w-4 h-4" />
            </span>
            <span className="flex-1 text-left">Mon profil</span>
            <ChevronRight className="w-4 h-4 text-[#009688]" />
          </Link>
        </nav>
      </aside>

      <button
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label={sidebarOpen ? 'Replier le menu' : 'Ouvrir le menu'}
        className={`fixed top-[5.5rem] z-30 w-7 h-7 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center text-slate-600 hover:text-[#009688] cursor-pointer transition-all duration-300 ${
          sidebarOpen ? 'left-[15.125rem]' : 'left-2'
        }`}
      >
        {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Contenu principal */}
      <main className={`pt-[72px] min-h-screen transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-extrabold text-slate-900">Paramètres</h1>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Gérez vos informations personnelles et votre mot de passe.
          </p>

          {success && (
            <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 text-[#009688] p-3 rounded-lg text-sm mb-6">
              <Check className="w-4 h-4" />
              <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm mb-6">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Carte photo */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#f59d0e] bg-slate-100 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-[#009688]">{initial}</span>
                  )}
                </div>
                <div className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
                <p className="text-sm text-slate-500">{user.email}</p>
                <span className="inline-block text-xs bg-amber-50 text-[#f59d0e] border border-amber-200 px-3 py-1 rounded-full font-semibold mt-2 uppercase tracking-widest">
                  {isTeacher ? 'Professeur' : 'Étudiant'}
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="block mt-3 text-sm font-semibold text-[#009688] hover:underline cursor-pointer"
                >
                  Changer la photo
                </button>
              </div>
            </section>

            {/* Informations personnelles */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <h3 className="text-base font-bold text-slate-900">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Nom complet <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Biographie / Description</label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full h-24 pl-10 pr-3 py-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#009688] focus:ring-2 focus:ring-[#009688]/15 resize-none transition"
                    placeholder="Racontez-nous un peu votre parcours..."
                  />
                </div>
              </div>
            </section>

            {/* Spécifique professeur */}
            {isTeacher && (
              <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                <h3 className="text-base font-bold text-slate-900">Enseignement</h3>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Matières enseignées</label>
                  <div className="flex flex-wrap gap-2">
                    {availableSubjects.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleSubject(sub)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition cursor-pointer ${
                          subjects.includes(sub)
                            ? 'bg-[#009688] text-white border-[#009688]'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Niveaux d&apos;enseignement</label>
                  <div className="flex flex-wrap gap-2">
                    {availableLevels.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => toggleLevel(lvl)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition cursor-pointer ${
                          levels.includes(lvl)
                            ? 'bg-[#f59d0e] text-white border-[#f59d0e]'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Mot de passe */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <h3 className="text-base font-bold text-slate-900">Mot de passe</h3>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nouveau mot de passe (optionnel)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Laissez vide pour ne pas le changer"
                    minLength={6}
                  />
                </div>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="h-11 px-8 rounded-lg bg-[#009688] hover:bg-[#00796b] disabled:opacity-60 text-white text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Sauvegarder les modifications</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;
