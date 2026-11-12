import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Briefcase,
  Camera,
  Check,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Bell,
  Search,
  ChevronDown,
  LayoutDashboard,
  Settings,
  LogOut,
  ArrowLeft,
  UserCog,
  X,
} from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

const DEFAULT_AVATAR =
  'https://res.cloudinary.com/dzegaldyo/image/upload/v1672531193/cld-sample.jpg';

const ROLE_META = {
  admin: {
    label: 'Administrateur',
    dashboardPath: '/admin-dashboard',
    badgeClass: 'bg-teal-50 text-[#009688] border-teal-200',
  },
  teacher: {
    label: 'Professeur',
    dashboardPath: '/teacher-dashboard',
    badgeClass: 'bg-amber-50 text-[#f59d0e] border-amber-200',
  },
  student: {
    label: 'Étudiant',
    dashboardPath: '/student-dashboard',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
};

const DISABILITY_OPTIONS = [
  'Aucun handicap déclaré',
  'Handicap moteur',
  'Handicap visuel',
  'Handicap auditif',
  'Trouble DYS / apprentissage',
  'Autre besoin spécifique',
];

const inputBoxClass =
  'w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#009688] focus:ring-2 focus:ring-[#009688]/15 transition';

const Profile = () => {
  const { user, loading: authLoading, updateProfile, logout } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);
  const navigate = useNavigate();

  // Identité / Carte haut-droite (style Bakeli)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [savingBasic, setSavingBasic] = useState(false);

  // Informations personnelles (carte inférieure 3 colonnes)
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [disabilityStatus, setDisabilityStatus] = useState('Aucun handicap déclaré');
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);

  // Modal Modifier (Photo, Sécurité, Préférences)
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('photo'); // 'photo' | 'security' | 'preferences'
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    liveReminders: true,
    newsletter: false,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [savingModal, setSavingModal] = useState(false);
  const fileInputRef = useRef(null);

  // Barre du haut + toast
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState({ type: '', text: '' });

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast((prev) => (prev.text === text ? { type: '', text: '' } : prev)), 4000);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      const parts = (user.name || '').trim().split(/\s+/);
      setFirstName(user.firstName || parts[0] || '');
      setLastName(user.lastName || parts.slice(1).join(' ') || '');
      setBirthDate(user.birthDate || '');
      setGender(user.gender || '');

      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setTitle(user.title || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setAddress(user.address || '');
      setDisabilityStatus(user.disabilityStatus || 'Aucun handicap déclaré');
      setSubjects(user.subjects || []);
      setLevels(user.levels || []);
      setPreferences({
        emailNotifications: user.preferences?.emailNotifications !== false,
        liveReminders: user.preferences?.liveReminders !== false,
        newsletter: Boolean(user.preferences?.newsletter),
      });
      setAvatarPreview(user.avatar || '');
      setAvatarError(false);
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  const roleInfo = ROLE_META[user.role] || ROLE_META.student;
  const isAdmin = user.role === 'admin';
  const isTeacher = user.role === 'teacher';
  const isStaff = isAdmin || isTeacher;

  const availableSubjects =
    settings?.subjects?.length > 0 ? settings.subjects : ['Mathématiques', 'Physique-Chimie'];
  const availableLevels =
    settings?.levels?.length > 0
      ? settings.levels.map((l) => (typeof l === 'string' ? l : l.value))
      : ['4ème', '3ème', '2nde S', '1ère S', 'TS'];

  const hasCustomAvatar =
    Boolean(avatarPreview) && !avatarError && avatarPreview !== DEFAULT_AVATAR;

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setAvatarError(false);
      setModalTab('photo');
      setAccountModalOpen(true);
    }
  };

  const toggleSubject = (subject) => {
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const toggleLevel = (level) => {
    setLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  // Sauvegarde carte haut-droite (Prénom, Nom, Date de naissance, Genre)
  const handleSaveBasic = async (e) => {
    e.preventDefault();
    setSavingBasic(true);
    try {
      const formData = new FormData();
      formData.append('firstName', firstName.trim());
      formData.append('lastName', lastName.trim());
      const combinedName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ').trim();
      if (combinedName) formData.append('name', combinedName);
      formData.append('birthDate', birthDate);
      formData.append('gender', gender);
      await updateProfile(formData);
      showToast('success', 'Informations de base enregistrées !');
    } catch (err) {
      showToast('error', err.message || 'Impossible de sauvegarder vos informations.');
    } finally {
      setSavingBasic(false);
    }
  };

  // Sauvegarde carte inférieure (Informations personnelles)
  const handleSavePersonal = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('error', 'Le nom complet et l’adresse e-mail sont obligatoires.');
      return;
    }
    setSavingPersonal(true);
    try {
      const parts = name.trim().split(/\s+/);
      const syncedFirst = parts[0] || '';
      const syncedLast = parts.slice(1).join(' ') || '';

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('firstName', syncedFirst);
      formData.append('lastName', syncedLast);
      formData.append('email', email.trim());
      formData.append('phone', phone.trim());
      formData.append('title', title.trim());
      formData.append('bio', bio);
      formData.append('location', location.trim());
      formData.append('address', address.trim());
      formData.append('disabilityStatus', disabilityStatus);
      if (isStaff) {
        formData.append('subjects', JSON.stringify(subjects));
        formData.append('levels', JSON.stringify(levels));
      }
      await updateProfile(formData);
      setEditingPersonal(false);
      showToast('success', 'Informations personnelles mises à jour !');
    } catch (err) {
      showToast('error', err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setSavingPersonal(false);
    }
  };

  // Sauvegarde Modal (Photo, Mot de passe, Préférences)
  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (password && password.length < 6) {
      showToast('error', 'Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password && password !== confirmPassword) {
      showToast('error', 'Les deux mots de passe ne correspondent pas.');
      return;
    }

    setSavingModal(true);
    try {
      const formData = new FormData();
      formData.append('preferences', JSON.stringify(preferences));
      if (password) formData.append('password', password);
      if (avatarFile) formData.append('avatar', avatarFile);

      await updateProfile(formData);
      setPassword('');
      setConfirmPassword('');
      setAvatarFile(null);
      setAccountModalOpen(false);
      showToast('success', 'Paramètres du compte enregistrés avec succès !');
    } catch (err) {
      showToast('error', err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSavingModal(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(roleInfo.dashboardPath, { state: { view: 'all', query: query.trim() } });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initial = user.name ? user.name.trim().charAt(0).toUpperCase() : '?';

  const passwordStrength = !password
    ? null
    : password.length >= 10
    ? { label: 'Fort', color: 'bg-[#009688] text-[#009688]', width: 'w-full' }
    : password.length >= 8
    ? { label: 'Moyen', color: 'bg-[#f59d0e] text-[#f59d0e]', width: 'w-2/3' }
    : { label: 'Court (min. 6)', color: 'bg-red-500 text-red-500', width: 'w-1/3' };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Barre du haut fixe (exact style Bakeli) */}
      <header className="fixed top-0 inset-x-0 h-[72px] bg-white border-b border-slate-200 z-40 flex items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="Aliou Sow Academy" className="h-9 w-auto" />
          <span className="hidden sm:block leading-tight">
            <span className="block text-sm font-extrabold text-slate-900 tracking-wide">ALIOU SOW</span>
            <span className="block text-[9px] font-bold tracking-[0.24em] text-[#009688]">ACADEMY</span>
          </span>
        </Link>

        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-xl hidden sm:flex items-center bg-slate-50 border border-slate-200 rounded-full pl-5 pr-1.5 py-1 focus-within:border-[#f59d0e]"
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

        <div className="relative shrink-0 ml-auto sm:ml-0">
          <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2.5 cursor-pointer">
            {hasCustomAvatar ? (
              <img
                src={avatarPreview}
                alt={user.name}
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <span className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold">
                <User className="w-5 h-5" />
              </span>
            )}
            <span className="hidden sm:block text-sm font-semibold text-slate-800 max-w-[150px] truncate">
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
                  to={roleInfo.dashboardPath}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {isAdmin ? 'Back-Office Admin' : 'Tableau de bord'}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setModalTab('security');
                    setAccountModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  Mot de passe &amp; Sécurité
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setModalTab('preferences');
                    setAccountModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                </button>
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

      {/* Contenu principal (Exact Format Paramètres Bakeli) */}
      <main className="pt-[88px] pb-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Barre discrète de navigation retour + raccourcis sécurité/préférences */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to={roleInfo.dashboardPath}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#009688] bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'Retour au Back-Office' : 'Retour à mon espace'}</span>
            </Link>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setModalTab('security');
                  setAccountModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#009688] bg-white border border-slate-200 px-3 py-2 rounded-xl cursor-pointer transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#009688]" />
                <span>Sécurité</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalTab('preferences');
                  setAccountModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#009688] bg-white border border-slate-200 px-3 py-2 rounded-xl cursor-pointer transition"
              >
                <Settings className="w-3.5 h-3.5 text-[#f59d0e]" />
                <span>Préférences</span>
              </button>
            </div>
          </div>

          {/* RANGÉE SUPÉRIEURE : 2 CARTES CÔTE À CÔTE (STYLE BAKELI) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Carte 1 : Avatar circulaire + Nom + Email + Bouton "Modifier" */}
            <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div className="flex items-center gap-5 sm:gap-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  title="Changer votre photo de profil"
                  className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                >
                  {hasCustomAvatar ? (
                    <img
                      src={avatarPreview}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="w-16 h-16 rounded-full border-2 border-slate-400 text-slate-400 flex items-center justify-center">
                      <User className="w-9 h-9" />
                    </span>
                  )}
                  <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight break-words">
                      {user.name}
                    </h1>
                    {isStaff && (
                      <span
                        className={`text-[10px] border px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${roleInfo.badgeClass}`}
                      >
                        {roleInfo.label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1 truncate">{user.email}</p>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setModalTab('photo');
                    setAccountModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-[#009688] cursor-pointer transition"
                >
                  <UserCog className="w-4 h-4" />
                  <span>Modifier</span>
                </button>
              </div>
            </section>

            {/* Carte 2 : Prénom / Nom / Date de naissance / Genre + Bouton "Enregistrer" */}
            <form
              onSubmit={handleSaveBasic}
              className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col justify-between gap-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Votre prénom"
                    className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-[#009688] focus:bg-slate-50/70 rounded px-1 -mx-1 py-1 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-[#009688] focus:bg-slate-50/70 rounded px-1 -mx-1 py-1 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-[#009688] focus:bg-slate-50/70 rounded px-1 -mx-1 py-1 text-sm text-slate-700 focus:outline-none transition cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">
                    Genre
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-[#009688] focus:bg-slate-50/70 rounded px-1 -mx-1 py-1 text-sm text-slate-700 focus:outline-none transition cursor-pointer"
                  >
                    <option value="">Sélectionnez votre genre</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                    <option value="Non précisé">Non précisé</option>
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={savingBasic}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-[#009688] disabled:opacity-50 cursor-pointer transition"
                >
                  {savingBasic ? (
                    <span>Enregistrement...</span>
                  ) : (
                    <span>Enregistrer</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* CARTE INFÉRIEURE PLEINE LARGEUR : INFORMATIONS PERSONNELLES (3 COLONNES STYLE BAKELI) */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-7">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Informations personnelles
              </h2>
              {title && !editingPersonal && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#009688] bg-teal-50 px-3 py-1 rounded-full">
                  <Briefcase className="w-3.5 h-3.5" />
                  {title}
                </span>
              )}
            </div>

            {!editingPersonal ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-7">
                  {/* Ligne 1 */}
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Nom complet</p>
                    <p className="text-sm text-slate-500 mt-1">{user.name || 'Non spécifié'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-800" />
                      <span>Adresse Email</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-1 break-all">{user.email || 'Non spécifié'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Situation de Handicap</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {disabilityStatus || 'Aucun handicap déclaré'}
                    </p>
                  </div>

                  {/* Ligne 2 */}
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Biographie</p>
                    <p className="text-sm text-slate-500 mt-1 whitespace-pre-wrap break-words">
                      {bio || 'Non spécifié'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-slate-800" />
                      <span>Adresse</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-1">{address || 'Non spécifié'}</p>
                  </div>

                  {isStaff ? (
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">Matières enseignées</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {subjects.length > 0 ? subjects.join(', ') : 'Non spécifié'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">Classe / Objectif</p>
                      <p className="text-sm text-slate-500 mt-1">{title || 'Non spécifié'}</p>
                    </div>
                  )}

                  {/* Ligne 3 */}
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-800" />
                      <span>Localisation</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-1">{location || 'Non spécifié'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-800" />
                      <span>Numéro de téléphone</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-1">{phone || 'Non spécifié'}</p>
                  </div>

                  {isStaff && (
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">Niveaux couverts</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {levels.length > 0
                          ? levels.map((l) => (l === 'TS' ? 'Terminale S' : l)).join(', ')
                          : 'Non spécifié'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingPersonal(true)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-[#009688] cursor-pointer transition"
                  >
                    <UserCog className="w-4 h-4" />
                    <span>Modifier</span>
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSavePersonal} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputBoxClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Adresse Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputBoxClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Situation de Handicap
                    </label>
                    <select
                      value={disabilityStatus}
                      onChange={(e) => setDisabilityStatus(e.target.value)}
                      className={inputBoxClass}
                    >
                      {DISABILITY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Localisation (Ville, Pays)
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="ex: Dakar, Sénégal"
                      className={inputBoxClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="ex: Parcelles Assainies Unité 14"
                      className={inputBoxClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+221 77 000 00 00"
                      className={inputBoxClass}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Biographie
                    </label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Présentez-vous en quelques lignes..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:border-[#009688] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Fonction / Classe
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={isStaff ? 'Administrateur / Professeur' : 'ex: Élève en Terminale S'}
                      className={inputBoxClass}
                    />
                  </div>
                </div>

                {isStaff && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-700 mb-2">Matières</p>
                      <div className="flex flex-wrap gap-2">
                        {availableSubjects.map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => toggleSubject(sub)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                              subjects.includes(sub)
                                ? 'bg-[#009688] text-white border-[#009688]'
                                : 'bg-white text-slate-600 border-slate-300'
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 mb-2">Niveaux</p>
                      <div className="flex flex-wrap gap-2">
                        {availableLevels.map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => toggleLevel(lvl)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                              levels.includes(lvl)
                                ? 'bg-[#f59d0e] text-white border-[#f59d0e]'
                                : 'bg-white text-slate-600 border-slate-300'
                            }`}
                          >
                            {lvl === 'TS' ? 'Terminale S' : lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingPersonal}
                    className="px-5 py-2.5 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold cursor-pointer transition disabled:opacity-60"
                  >
                    {savingPersonal ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPersonal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>

      {/* MODAL MODIFIER COMPTE (Photo, Mot de passe, Notifications) */}
      {accountModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Paramètres du compte</h3>
              <button
                type="button"
                onClick={() => setAccountModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Onglets du modal */}
            <div className="flex border-b border-slate-100 px-6 gap-4">
              {[
                { key: 'photo', label: 'Photo' },
                { key: 'security', label: 'Mot de passe' },
                { key: 'preferences', label: 'Notifications' },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setModalTab(t.key)}
                  className={`py-3 text-xs font-bold border-b-2 -mb-px cursor-pointer transition ${
                    modalTab === t.key
                      ? 'border-[#009688] text-[#009688]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-5">
              {modalTab === 'photo' && (
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-28 h-28 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                    {hasCustomAvatar ? (
                      <img src={avatarPreview} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-[#009688]">{initial}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:border-[#009688] text-xs font-bold text-slate-700 hover:text-[#009688] cursor-pointer transition"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Choisir une photo</span>
                  </button>
                  <p className="text-xs text-slate-400">
                    Format recommandé : JPG ou PNG carré. Cliquez sur « Enregistrer » pour valider.
                  </p>
                </div>
              )}

              {modalTab === 'security' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 caractères"
                        className={`${inputBoxClass} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordStrength && (
                      <div className="space-y-1 pt-1.5">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${passwordStrength.color} ${passwordStrength.width}`} />
                        </div>
                        <p className={`text-[11px] font-semibold ${passwordStrength.color.split(' ')[1]}`}>
                          Robustesse : {passwordStrength.label}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Répétez le mot de passe"
                      className={inputBoxClass}
                    />
                  </div>
                </div>
              )}

              {modalTab === 'preferences' && (
                <div className="space-y-3">
                  {[
                    {
                      key: 'emailNotifications',
                      title: 'Notifications par e-mail',
                      desc: 'Confirmations d’inscription, d’abonnement et messages importants.',
                    },
                    {
                      key: 'liveReminders',
                      title: 'Rappels des séances en direct',
                      desc: 'Alertes lors de la publication d’un cours ou direct Google Meet / Jitsi.',
                    },
                    {
                      key: 'newsletter',
                      title: 'Actualités & fiches de révision',
                      desc: 'Conseils de préparation BFEM / Bac et modules gratuits.',
                    },
                  ].map((item) => {
                    const checked = preferences[item.key];
                    return (
                      <div
                        key={item.key}
                        onClick={() =>
                          setPreferences((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                        }
                        className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-200 bg-slate-50/50 cursor-pointer transition"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                        <div
                          className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${
                            checked ? 'bg-[#009688]' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              checked ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAccountModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={savingModal}
                  className="px-5 py-2 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                >
                  {savingModal ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast notification élégante (sans popup navigateur) */}
      {toast.text && (
        <div
          className={`fixed bottom-5 right-5 z-[75] max-w-sm flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-teal-50 border-teal-200 text-[#009688]'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <Check className="w-4 h-4 shrink-0" />
          )}
          <span className="flex-1">{toast.text}</span>
          <button
            onClick={() => setToast({ type: '', text: '' })}
            className="cursor-pointer opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
