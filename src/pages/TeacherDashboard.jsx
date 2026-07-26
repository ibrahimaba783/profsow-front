import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import {
  Plus,
  BookOpen,
  Users,
  BarChart3,
  AlertCircle,
  Trash2,
  Edit,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Mathématiques');
  const [level, setLevel] = useState('TS');
  const [duration, setDuration] = useState('3 mois');
  const [price, setPrice] = useState(6000);
  const [isFree, setIsFree] = useState(false);
  const [originalPrice, setOriginalPrice] = useState(6000);
  const [imageFile, setImageFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const allCourses = await api('/courses');
      const teacherCourses = allCourses.filter((c) => c.teacher?._id === user?._id);
      setCourses(teacherCourses);

      const enrolledStudents = await api('/subscriptions/teacher/students');
      setStudents(enrolledStudents);

      const scores = await api('/quizzes/teacher/results');
      setQuizResults(scores);
    } catch (err) {
      console.error('Erreur de récupération des données prof', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubject('Mathématiques');
    setLevel('TS');
    setDuration('3 mois');
    setPrice(6000);
    setIsFree(false);
    setOriginalPrice(6000);
    setImageFile(null);
    setErrorMsg('');
    setEditingCourse(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setTitle(course.title || '');
    setDescription(course.description || '');
    setSubject(course.subject || 'Mathématiques');
    setLevel(course.level || 'TS');
    setDuration(course.duration || '3 mois');
    setPrice(course.price || 6000);
    setIsFree(course.isFree || false);
    setOriginalPrice(course.originalPrice || course.price || 6000);
    setImageFile(null);
    setErrorMsg('');
    setShowCreateModal(true);
  };

  const handleSubmitCourse = async (e) => {
    e.preventDefault();
    setCreating(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('subject', subject);
    formData.append('level', level);
    formData.append('duration', duration);
    formData.append('price', isFree ? 0 : price);
    formData.append('isFree', isFree);

    if (isFree) {
      formData.append('originalPrice', originalPrice);
    }

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editingCourse) {
        await api(`/courses/${editingCourse._id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        await api('/courses', {
          method: 'POST',
          body: formData,
        });
      }

      resetForm();
      setShowCreateModal(false);
      await fetchDashboardData();
    } catch (err) {
      setErrorMsg(err.message || 'Erreur lors de l’enregistrement du cours');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (
      !window.confirm(
        'Voulez-vous vraiment supprimer ce cours ? Tous les chapitres, leçons, quiz et abonnements associés seront perdus.'
      )
    ) {
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
    <div className="min-h-screen gradient-bg pt-28 pb-12 px-6 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Espace Enseignant</h1>
            <p className="text-slate-500 mt-1">
              Gérez vos modules de cours, suivez vos élèves et analysez les scores.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="btn-neon text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-md mt-4 md:mt-0"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau Cours</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-indigo-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{courses.length}</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Cours Créés
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
            <div className="bg-purple-50 border border-purple-100 p-3 rounded-xl text-purple-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{students.length}</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Élèves Enrôlés
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{quizResults.length}</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Évaluations Rendues
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 text-indigo-600 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            <span>Gestion des Modules de Cours</span>
          </h2>

          {courses.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-slate-500 border border-dashed border-slate-200">
              <p>Vous n'avez créé aucun module de cours.</p>
              <button
                onClick={openCreateModal}
                className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-bold underline cursor-pointer"
              >
                Créer un premier cours maintenant
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow duration-300"
                >
                  <Link to={`/courses/${course._id}`} className="block">
                    <div
                      className="h-40 bg-cover bg-center"
                      style={{ backgroundImage: `url(${course.image})` }}
                    ></div>

                    <div className="p-6">
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-semibold">
                          {course.subject}
                        </span>
                        <span className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-0.5 rounded-full font-semibold">
                          {course.level}
                        </span>
                        {course.isFree && (
                          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full font-semibold">
                            Gratuit
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mt-4 mb-2 text-slate-900">
                        {course.title}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-2">{course.description}</p>
                    </div>
                  </Link>

                  <div className="p-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs bg-slate-50 border border-slate-200 text-indigo-600 font-bold px-3 py-1 rounded-full">
                      {course.chapters?.length || 0} chapitres
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-lg transition cursor-pointer"
                        title="Modifier le cours"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition cursor-pointer"
                        title="Supprimer le cours"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <Link
                        to={`/courses/${course._id}`}
                        className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition"
                        title="Gérer le cours"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-600 border-b border-slate-100 pb-3">
                <Users className="w-5 h-5" />
                <span>Élèves Inscrits & Paiements</span>
              </h3>
              {students.length === 0 ? (
                <p className="text-slate-400 text-sm py-4">
                  Aucun élève n'est encore inscrit à vos cours.
                </p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {students.map((sub) => (
                    <div
                      key={sub._id}
                      className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={sub.student?.avatar}
                          alt={sub.student?.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-800">{sub.student?.name}</div>
                          <div className="text-[10px] text-slate-400">{sub.student?.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded">
                          {sub.course?.title}
                        </span>
                        <div className="text-[10px] text-emerald-600 mt-1">
                          {sub.paymentMethod} • Valide
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-600 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-5 h-5" />
                <span>Notes des Exercices</span>
              </h3>
              {quizResults.length === 0 ? (
                <p className="text-slate-400 text-sm py-4">
                  Aucun résultat de quiz soumis pour le moment.
                </p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {quizResults.map((res) => (
                    <div
                      key={res._id}
                      className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={res.student?.avatar}
                          alt={res.student?.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-800">{res.student?.name}</div>
                          <div className="text-[10px] text-slate-400">{res.quiz?.title}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                          {res.score} / {res.totalQuestions}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 border border-slate-100 relative flex flex-col slide-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-6">
              {editingCourse ? 'Modifier le cours' : 'Créer un nouveau module'}
            </h3>

            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Titre du cours
                </label>
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
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Description
                </label>
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
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Matière
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="input-animated bg-white border-slate-200 text-slate-800 rounded-lg p-2"
                  >
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Physique-Chimie">Physique-Chimie</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Niveau
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="input-animated bg-white border-slate-200 text-slate-800 rounded-lg p-2"
                  >
                    <option value="4ème">4ème</option>
                    <option value="3ème">3ème</option>
                    <option value="2nde S">2nde S</option>
                    <option value="1ère S">1ère S</option>
                    <option value="TS">TS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Durée de la formation
                </label>
                <input
                  type="text"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="input-animated"
                  placeholder="ex: 3 mois, 1 an, 10h"
                />
                <p className="text-[11px] text-slate-400">
                  Affichée sur la carte du cours, à côté de l'icône horloge.
                </p>
              </div>

              <div
                onClick={() => setIsFree((prev) => !prev)}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                  isFree ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Cours gratuit (offre promotionnelle)
                  </p>
                  <p className="text-xs text-slate-500">
                    Les élèves y accèdent en un clic, sans paiement.
                  </p>
                </div>
                <div
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    isFree ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      isFree ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {isFree ? (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Valeur normale (FCFA)
                    </label>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(parseInt(e.target.value))}
                      className="input-animated"
                    />
                    <p className="text-[11px] text-slate-400">
                      Affichée barrée à côté de « Gratuit » sur les cartes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Tarif annuel (FCFA)
                    </label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(parseInt(e.target.value))}
                      className="input-animated"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Image de couverture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="input-animated text-xs text-slate-500"
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
                  <span>{editingCourse ? 'Mettre à jour le cours' : 'Créer le cours'}</span>
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