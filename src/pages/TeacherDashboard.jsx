import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { formatLevel } from '../components/CourseCard';
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
  X,
  AlignLeft,
  Layers,
  GraduationCap,
  Clock,
  ImagePlus,
  Sparkles,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import logo from '../assets/logo-aliou-sow-academy-navbar.png';

const TeacherDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState('overview'); // 'overview' | 'courses' | 'students' | 'results'
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  );
  const [menuOpen, setMenuOpen] = useState(false);

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
      const [allCourses, enrolledStudents, scores] = await Promise.all([
        api('/courses'),
        api('/subscriptions/teacher/students'),
        api('/quizzes/teacher/results'),
      ]);
      const teacherCourses = allCourses.filter((c) => c.teacher?._id === user?._id);
      setCourses(teacherCourses);
      setStudents(enrolledStudents);
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
    setPrice(course.price ?? 6000);
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  const sidebarItems = [
    { key: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
    { key: 'courses', label: 'Mes modules', icon: BookOpen, count: courses.length },
    { key: 'students', label: 'Élèves inscrits', icon: Users, count: students.length },
    { key: 'results', label: 'Notes des quiz', icon: BarChart3, count: quizResults.length },
  ];

  const renderCoursesGrid = () =>
    courses.length === 0 ? (
      <div className="bg-white rounded-2xl p-10 text-center text-slate-500 border border-dashed border-slate-300">
        <BookOpen className="w-10 h-10 text-[#009688] mx-auto mb-3 opacity-60" />
        <p className="font-semibold text-slate-700">Vous n&apos;avez créé aucun module de cours.</p>
        <button
          onClick={openCreateModal}
          className="mt-4 text-[#009688] hover:underline text-sm font-bold cursor-pointer"
        >
          Créer un premier cours maintenant
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition"
          >
            <Link to={`/courses/${course._id}`} className="block">
              <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] bg-sky-50 text-sky-600 px-2.5 py-0.5 rounded-full font-semibold">
                    {course.subject}
                  </span>
                  <span className="text-[11px] bg-orange-50 text-[#f59d0e] px-2.5 py-0.5 rounded-full font-semibold">
                    {formatLevel(course.level)}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 line-clamp-2 mb-1.5">
                  {course.title}
                </h3>
                <p className="text-slate-500 text-xs line-clamp-2">{course.description}</p>
              </div>
            </Link>

            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-full">
                  {course.chapters?.length || 0} section{(course.chapters?.length || 0) > 1 ? 's' : ''}
                </span>
                <span className="text-xs font-bold text-[#009688]">
                  {course.isFree || course.price === 0 ? 'Gratuit' : `${course.price} FCFA`}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleEditCourse(course)}
                  className="p-2 bg-amber-50 text-[#f59d0e] hover:bg-[#f59d0e] hover:text-white rounded-lg transition cursor-pointer"
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
                  className="p-2 bg-teal-50 text-[#009688] hover:bg-[#009688] hover:text-white rounded-lg transition"
                  title="Gérer chapitres, leçons et quiz"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );

  const renderStudentsList = () => (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
        <Users className="w-5 h-5 text-[#f59d0e]" />
        <span>Élèves Inscrits &amp; Paiements</span>
      </h3>
      {students.length === 0 ? (
        <p className="text-slate-400 text-sm py-4">
          Aucun élève n&apos;est encore inscrit à vos cours.
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {students.map((sub) => (
            <div
              key={sub._id}
              className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={sub.student?.avatar}
                  alt={sub.student?.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 truncate">{sub.student?.name}</div>
                  <div className="text-xs text-slate-400 truncate">{sub.student?.email}</div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <span className="text-[11px] font-bold bg-teal-50 text-[#009688] px-2.5 py-0.5 rounded-full">
                  {sub.course?.title}
                </span>
                <div className="text-[11px] text-slate-500 mt-1">
                  {sub.paymentMethod} • Valide jusqu&apos;au{' '}
                  {new Date(sub.expiresAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderQuizResultsList = () => (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
        <ShieldCheck className="w-5 h-5 text-[#009688]" />
        <span>Notes des Exercices &amp; Évaluations</span>
      </h3>
      {quizResults.length === 0 ? (
        <p className="text-slate-400 text-sm py-4">
          Aucun résultat de quiz soumis pour le moment.
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {quizResults.map((res) => (
            <div
              key={res._id}
              className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={res.student?.avatar}
                  alt={res.student?.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 truncate">{res.student?.name}</div>
                  <div className="text-xs text-slate-400 truncate">{res.quiz?.title}</div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <span className="text-sm font-bold text-[#009688] bg-teal-50 px-2.5 py-1 rounded-lg">
                  {res.score} / {res.totalQuestions}
                </span>
                <div className="text-[11px] text-slate-400 mt-1">
                  {Math.round((res.score / res.totalQuestions) * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

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

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="h-10 px-4 rounded-full bg-[#009688] hover:bg-[#00796b] text-white text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau Cours</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 cursor-pointer"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <span className="w-9 h-9 rounded-full bg-[#009688] text-white flex items-center justify-center">
                  <User className="w-5 h-5" />
                </span>
              )}
              <span className="hidden md:block text-sm font-semibold text-slate-800 max-w-[140px] truncate">
                {user?.name}
              </span>
              <ChevronDown className="hidden md:block w-4 h-4 text-slate-400" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-3 z-50">
                  <div className="px-4 pb-3 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-500">{user?.name}</p>
                    <p className="text-sm text-slate-800 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50"
                  >
                    <Settings className="w-4 h-4" />
                    Paramètres du profil
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
        </div>
      </header>

      {/* Sidebar */}
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
          ESPACE ENSEIGNANT
        </p>
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  active ? 'bg-teal-50 text-[#009688]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    active ? 'bg-[#009688] text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {typeof item.count === 'number' && (
                  <span className="text-xs text-slate-400">{item.count}</span>
                )}
              </button>
            );
          })}

          <Link
            to="/profile"
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
              <User className="w-4 h-4" />
            </span>
            <span className="flex-1 text-left">Mon profil</span>
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
      <main
        className={`pt-[72px] min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'md:pl-64' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Espace Enseignant</h1>
              <p className="text-slate-500 mt-1 text-sm">
                Gérez vos modules de Mathématiques &amp; Physique-Chimie, suivez vos élèves et
                analysez les scores.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-[#009688] hover:bg-[#00796b] text-white font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Module</span>
            </button>
          </div>

          {/* Cartes statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="bg-teal-50 p-3 rounded-xl text-[#009688]">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{courses.length}</div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Modules Créés
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="bg-amber-50 p-3 rounded-xl text-[#f59d0e]">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{students.length}</div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Élèves Inscrits
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="bg-sky-50 p-3 rounded-xl text-sky-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{quizResults.length}</div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Évaluations Rendues
                </div>
              </div>
            </div>
          </div>

          {view === 'courses' && (
            <div>
              <h2 className="text-xl font-bold mb-5 text-slate-900">Gestion des Modules</h2>
              {renderCoursesGrid()}
            </div>
          )}

          {view === 'students' && renderStudentsList()}

          {view === 'results' && renderQuizResultsList()}

          {view === 'overview' && (
            <>
              <div>
                <h2 className="text-xl font-bold mb-5 text-slate-900">
                  Gestion des Modules de Cours
                </h2>
                {renderCoursesGrid()}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderStudentsList()}
                {renderQuizResultsList()}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modal Création / Édition de cours */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-backdrop-anim">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl relative flex flex-col modal-pop max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 modal-close-btn cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <div className="bg-teal-50 p-2 rounded-xl text-[#009688]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {editingCourse ? 'Modifier le cours' : 'Créer un nouveau module'}
              </h3>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#009688]" />
                  Titre du cours
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-animated pl-4 pr-3"
                  placeholder="ex: Mécanique de Newton et Forces"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5 text-[#009688]" />
                  Description
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-animated h-20 resize-none pl-4 pr-3"
                  placeholder="Détaillez le programme de ce cours..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#009688]" />
                    Matière
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="input-animated select-animated bg-white border-slate-200 text-slate-800 rounded-lg pl-4"
                  >
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Physique-Chimie">Physique-Chimie</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#009688]" />
                    Niveau
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="input-animated select-animated bg-white border-slate-200 text-slate-800 rounded-lg pl-4"
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
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#009688]" />
                  Durée de la formation
                </label>
                <input
                  type="text"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="input-animated pl-4 pr-3"
                  placeholder="ex: 3 mois, 1 an, 10h"
                />
              </div>

              <div
                onClick={() => setIsFree((prev) => !prev)}
                className={`toggle-free-card flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                  isFree ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-200'
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
                  className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${
                    isFree ? 'bg-[#009688]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
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
                      className="input-animated pl-4 pr-3"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Tarif (FCFA)
                    </label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(parseInt(e.target.value))}
                      className="input-animated pl-4 pr-3"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <ImagePlus className="w-3.5 h-3.5 text-[#009688]" />
                    Image de couverture
                  </label>
                  <div className="file-input-wrapper">
                    <div className="file-input-label">
                      <ImagePlus className="w-4 h-4 shrink-0" />
                      <span className="truncate">
                        {imageFile ? imageFile.name : 'Choisir une image...'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-[#009688] hover:bg-[#00796b] text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer mt-4"
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
