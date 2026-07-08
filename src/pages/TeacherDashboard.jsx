import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Plus, BookOpen, Users, BarChart3, AlertCircle, Trash2, Edit, ExternalLink, ShieldCheck } from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulaire de création de cours
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Mathématiques');
  const [level, setLevel] = useState('TS');
  const [price, setPrice] = useState(6000);
  const [imageFile, setImageFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Récupérer les cours créés par le prof (en filtrant côté client ou serveur)
      const allCourses = await api('/courses');
      const teacherCourses = allCourses.filter(c => c.teacher?._id === user?._id);
      setCourses(teacherCourses);

      // Récupérer les étudiants inscrits
      const enrolledStudents = await api('/subscriptions/teacher/students');
      setStudents(enrolledStudents);

      // Récupérer les scores des quiz
      const scores = await api('/quizzes/teacher/results');
      setQuizResults(scores);
    } catch (err) {
      console.error("Erreur de récupération des données prof", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreating(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('subject', subject);
    formData.append('level', level);
    formData.append('price', price);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await api('/courses', {
        method: 'POST',
        body: formData,
      });

      // Reset form & close modal
      setTitle('');
      setDescription('');
      setImageFile(null);
      setShowCreateModal(false);
      
      // Refresh
      await fetchDashboardData();
    } catch (err) {
      setErrorMsg(err.message || 'Erreur lors de la création du cours');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce cours ? Tous les chapitres, leçons, quiz et abonnements associés seront perdus.')) {
      return;
    }

    try {
      await api(`/courses/${id}`, { method: 'DELETE' });
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pt-28 pb-12 px-6 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold">Espace Enseignant</h1>
            <p className="text-slate-400 mt-1">Gérez vos modules de cours, suivez vos élèves et analysez les scores.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-neon text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-md mt-4 md:mt-0"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau Cours</span>
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl text-indigo-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black">{courses.length}</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Cours Créés</div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
            <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black">{students.length}</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Élèves Enrôlés</div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-emerald-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black">{quizResults.length}</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Évaluations Rendues</div>
            </div>
          </div>
        </div>

        {/* Section Mes Cours */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-indigo-400 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            <span>Gestion des Modules de Cours</span>
          </h2>

          {courses.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-slate-400 border border-dashed border-white/10">
              <p>Vous n'avez créé aucun module de cours.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-bold underline cursor-pointer"
              >
                Créer un premier cours maintenant
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div key={course._id} className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between">
                  <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${course.image})` }}></div>
                  <div className="p-6">
                    <div className="flex gap-2">
                      <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-semibold">{course.subject}</span>
                      <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-semibold">{course.level}</span>
                    </div>
                    <h3 className="text-xl font-bold mt-4 mb-2">{course.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2">{course.description}</p>
                  </div>
                  <div className="p-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs bg-slate-900 border border-white/5 text-indigo-400 font-bold px-3 py-1 rounded-full">
                      {course.chapters.length} chapitres
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/courses/${course._id}`}
                        className="p-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg transition"
                        title="Gérer le cours"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="p-2 bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition cursor-pointer"
                        title="Supprimer le cours"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section Élèves et Résultats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Suivi Inscriptions */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-400 border-b border-white/5 pb-3">
                <Users className="w-5 h-5" />
                <span>Élèves Inscrits & Paiements</span>
              </h3>
              {students.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">Aucun élève n'est encore inscrit à vos cours.</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {students.map((sub) => (
                    <div key={sub._id} className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl text-sm">
                      <div className="flex items-center gap-3">
                        <img src={sub.student?.avatar} alt={sub.student?.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                        <div>
                          <div className="font-bold text-slate-200">{sub.student?.name}</div>
                          <div className="text-[10px] text-slate-400">{sub.student?.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                          {sub.course?.title}
                        </span>
                        <div className="text-[10px] text-emerald-400 mt-1">{sub.paymentMethod} • Valide</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Suivi Quiz/Notes */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-400 border-b border-white/5 pb-3">
                <ShieldCheck className="w-5 h-5" />
                <span>Notes des Exercices</span>
              </h3>
              {quizResults.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">Aucun résultat de quiz soumis pour le moment.</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {quizResults.map((res) => (
                    <div key={res._id} className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl text-sm">
                      <div className="flex items-center gap-3">
                        <img src={res.student?.avatar} alt={res.student?.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                        <div>
                          <div className="font-bold text-slate-200">{res.student?.name}</div>
                          <div className="text-[10px] text-slate-400">{res.quiz?.title}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                          {res.score} / {res.totalQuestions}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {Math.round((res.score / res.totalQuestions) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODALE DE CRÉATION DE COURS */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 border border-white/10 relative flex flex-col slide-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-white mb-6">Créer un nouveau module</h3>

            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Titre du cours</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-animated"
                  placeholder="ex: Mécanique de Newton et Forces"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-animated h-20 resize-none"
                  placeholder="Détaillez le programme de ce cours..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Matière</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="input-animated bg-slate-900 border-white/10 text-white rounded-lg p-2"
                  >
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Physique-Chimie">Physique-Chimie</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Niveau</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="input-animated bg-slate-900 border-white/10 text-white rounded-lg p-2"
                  >
                    <option value="4ème">4ème</option>
                    <option value="3ème">3ème</option>
                    <option value="2nde S">2nde S</option>
                    <option value="1ère S">1ère S</option>
                    <option value="TS">TS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Tarif annuel (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value))}
                    className="input-animated"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Image de couverture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="input-animated text-xs text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full btn-neon text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                {creating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Créer le cours</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
