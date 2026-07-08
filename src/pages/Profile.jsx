import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Camera, Check, AlertCircle, Edit, FileText } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [password, setPassword] = useState('');
  
  // Rôles spécifiques au Prof
  const [subjects, setSubjects] = useState(user?.subjects || []);
  const [levels, setLevels] = useState(user?.levels || []);
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const availableSubjects = ['Mathématiques', 'Physique-Chimie'];
  const availableLevels = ['4ème', '3ème', '2nde S', '1ère S', 'TS'];

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const toggleSubject = (subject) => {
    if (subjects.includes(subject)) {
      setSubjects(subjects.filter(s => s !== subject));
    } else {
      setSubjects([...subjects, subject]);
    }
  };

  const toggleLevel = (level) => {
    if (levels.includes(level)) {
      setLevels(levels.filter(l => l !== level));
    } else {
      setLevels([...levels, level]);
    }
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pt-28 pb-12 px-4 flex justify-center">
      <div className="w-full max-w-2xl glass-card rounded-2xl p-6 md:p-10 border border-white/5 relative z-10 slide-in h-fit">
        
        <div className="flex flex-col items-center mb-8 relative">
          {/* Avatar upload container */}
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-indigo-500/50 shadow-lg relative">
              <img src={avatarPreview} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-slate-950/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
          <h2 className="text-xl font-bold mt-4">{user.name}</h2>
          <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full font-semibold mt-2 uppercase tracking-widest">
            {user.role === 'teacher' ? 'Professeur' : 'Étudiant'}
          </span>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm mb-6">
            <Check className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Biographie / Description</label>
            <div className="relative">
              <FileText className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input-animated pl-10 h-24 resize-none"
                placeholder="Racontez-nous un peu votre parcours..."
              />
            </div>
          </div>

          {user.role === 'teacher' && (
            <div className="space-y-4 border-t border-white/5 pt-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">Matières Enseignées</label>
                <div className="flex gap-2">
                  {availableSubjects.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleSubject(sub)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        subjects.includes(sub)
                          ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500'
                          : 'bg-transparent text-slate-400 border-white/10 hover:border-slate-500'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">Niveaux d'Enseignement</label>
                <div className="flex flex-wrap gap-2">
                  {availableLevels.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => toggleLevel(lvl)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        levels.includes(lvl)
                          ? 'bg-purple-600/20 text-purple-300 border-purple-500'
                          : 'bg-transparent text-slate-400 border-white/10 hover:border-slate-500'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1 border-t border-white/5 pt-4">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Changer le mot de passe (Optionnel)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-animated"
              placeholder="Saisissez un nouveau mot de passe"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-neon text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Sauvegarder les modifications</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
