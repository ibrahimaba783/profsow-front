import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Play, FileText, Video, HelpCircle, Send, Plus, Trash2, Check, AlertCircle, Sparkles, MessageSquare, Info, Award, GraduationCap } from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content'); // content, discussion, quizzes
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checkingSub, setCheckingSub] = useState(true);

  // Leçon active
  const [activeLesson, setActiveLesson] = useState(null);

  // Édition Prof (Chapitres / Leçons)
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState('video');
  const [newLessonYoutube, setNewLessonYoutube] = useState('');
  const [newLessonMeet, setNewLessonMeet] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonPdf, setNewLessonPdf] = useState(null);
  const [addingLesson, setAddingLesson] = useState(false);

  // Discussions (Chat)
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef(null);

  // Quizzes
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  
  // Créateur / Édition de Quiz (Prof)
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null); // null = création, sinon id du quiz en cours de modification
  const [quizTitle, setQuizTitle] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([
    { questionText: '', options: ['', ''], correctAnswerIndex: 0 }
  ]);
  const [savingQuiz, setSavingQuiz] = useState(false);

  // Aperçu Prof (tester un quiz sans enregistrer de vraie tentative)
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Résultats des élèves pour un quiz donné (vue Prof)
  const [viewingResultsQuiz, setViewingResultsQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'discussion' && (isSubscribed || user?.role === 'teacher')) {
      fetchDiscussions();
    }
    if (activeTab === 'quizzes' && (isSubscribed || user?.role === 'teacher')) {
      fetchQuizzes();
    }
  }, [activeTab, isSubscribed]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const data = await api(`/courses/${id}`);
      setCourse(data);

      if (user?.role === 'teacher') {
        setIsSubscribed(true);
        setCheckingSub(false);
      } else if (user) {
        // Vérifier l'abonnement
        const subCheck = await api(`/subscriptions/check/${id}`);
        setIsSubscribed(subCheck.isSubscribed);
        setCheckingSub(false);
      } else {
        setCheckingSub(false);
      }

      // Sélectionner la première leçon par défaut si elle existe
      if (data.chapters?.[0]?.lessons?.[0]) {
        setActiveLesson(data.chapters[0].lessons[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussions = async () => {
    try {
      const messagesData = await api(`/discussions/${id}`);
      setMessages(messagesData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const quizData = await api(`/quizzes/course/${id}`);
      setQuizzes(quizData);
    } catch (err) {
      console.error(err);
    }
  };

  // --- ACTIONS PROF ---
  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!newChapterTitle) return;
    try {
      const updated = await api(`/courses/${id}/chapters`, {
        method: 'POST',
        body: JSON.stringify({ title: newChapterTitle }),
      });
      setCourse(updated);
      setNewChapterTitle('');
      setShowAddChapter(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Voulez-vous supprimer ce chapitre ?')) return;
    try {
      const updated = await api(`/courses/${id}/chapters/${chapterId}`, {
        method: 'DELETE',
      });
      setCourse(updated);
      if (activeLesson && !updated.chapters.some(c => c.lessons.some(l => l._id === activeLesson._id))) {
        setActiveLesson(null);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    setAddingLesson(true);
    const formData = new FormData();
    formData.append('title', newLessonTitle);
    formData.append('contentType', newLessonType);
    if (newLessonType === 'video') formData.append('youtubeUrl', newLessonYoutube);
    if (newLessonType === 'meet') formData.append('meetLink', newLessonMeet);
    if (newLessonType === 'text') formData.append('content', newLessonContent);
    if (newLessonType === 'pdf' && newLessonPdf) {
      formData.append('pdf', newLessonPdf);
    }

    try {
      const updated = await api(`/courses/${id}/chapters/${selectedChapterId}/lessons`, {
        method: 'POST',
        body: formData,
      });
      setCourse(updated);
      // Reset form
      setNewLessonTitle('');
      setNewLessonYoutube('');
      setNewLessonMeet('');
      setNewLessonContent('');
      setNewLessonPdf(null);
      setSelectedChapterId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingLesson(false);
    }
  };

  const handleDeleteLesson = async (chapterId, lessonId) => {
    if (!window.confirm('Voulez-vous supprimer cette leçon ?')) return;
    try {
      const updated = await api(`/courses/${id}/chapters/${chapterId}/lessons/${lessonId}`, {
        method: 'DELETE',
      });
      setCourse(updated);
      if (activeLesson?._id === lessonId) {
        setActiveLesson(null);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // --- DISCUSSION CHAT ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSendingMessage(true);

    try {
      const savedMessage = await api(`/discussions/${id}`, {
        method: 'POST',
        body: JSON.stringify({ message: newMessage }),
      });
      setMessages([...messages, savedMessage]);
      setNewMessage('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  // --- ACTIONS QUIZ ---
  const handleSelectQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setQuizAnswers({});
    setQuizScore(null);
    setIsPreviewMode(false);
    setShowAddQuiz(false);
    setViewingResultsQuiz(null);
  };

  // Le prof peut tester son propre quiz sans que ça enregistre une vraie
  // tentative en base (pas d'appel à /submit, calcul fait localement).
  const handlePreviewQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setQuizAnswers({});
    setQuizScore(null);
    setIsPreviewMode(true);
    setShowAddQuiz(false);
    setViewingResultsQuiz(null);
  };

  const handleSelectQuizAnswer = (questionIdx, answerIdx) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionIdx]: answerIdx
    });
  };

  const handleSubmitQuiz = async () => {
    // Mode aperçu (prof) : on calcule le score localement, sans appeler
    // l'API ni créer de QuizResult en base.
    if (isPreviewMode) {
      let score = 0;
      activeQuiz.questions.forEach((q, idx) => {
        if (quizAnswers[idx] !== undefined && quizAnswers[idx] === q.correctAnswerIndex) {
          score++;
        }
      });
      const total = activeQuiz.questions.length;
      setQuizScore({
        score,
        total,
        percentage: Math.round((score / total) * 100),
      });
      return;
    }

    setSubmittingQuiz(true);

    try {
      const res = await api(`/quizzes/${activeQuiz._id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers: quizAnswers })
      });
      setQuizScore({
        score: res.score,
        total: res.totalQuestions,
        percentage: res.percentage
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const addQuestionField = () => {
    setQuizQuestions([
      ...quizQuestions,
      { questionText: '', options: ['', ''], correctAnswerIndex: 0 }
    ]);
  };

  const removeQuestionField = (idx) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== idx));
  };

  const updateQuestionText = (idx, text) => {
    const updated = [...quizQuestions];
    updated[idx].questionText = text;
    setQuizQuestions(updated);
  };

  const updateOptionText = (qIdx, oIdx, text) => {
    const updated = [...quizQuestions];
    updated[qIdx].options[oIdx] = text;
    setQuizQuestions(updated);
  };

  const addOptionField = (qIdx) => {
    const updated = [...quizQuestions];
    updated[qIdx].options.push('');
    setQuizQuestions(updated);
  };

  const removeOptionField = (qIdx, oIdx) => {
    const updated = [...quizQuestions];
    updated[qIdx].options = updated[qIdx].options.filter((_, i) => i !== oIdx);
    setQuizQuestions(updated);
  };

  const setCorrectAnswer = (qIdx, oIdx) => {
    const updated = [...quizQuestions];
    updated[qIdx].correctAnswerIndex = oIdx;
    setQuizQuestions(updated);
  };

  const resetQuizForm = () => {
    setQuizTitle('');
    setQuizQuestions([{ questionText: '', options: ['', ''], correctAnswerIndex: 0 }]);
    setEditingQuizId(null);
    setShowAddQuiz(false);
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    setSavingQuiz(true);
    try {
      if (editingQuizId) {
        // Modification d'un quiz existant
        const updated = await api(`/quizzes/${editingQuizId}`, {
          method: 'PUT',
          body: JSON.stringify({ title: quizTitle, questions: quizQuestions }),
        });
        setQuizzes(quizzes.map(q => (q._id === editingQuizId ? updated : q)));
      } else {
        // Création d'un nouveau quiz
        const quiz = await api('/quizzes', {
          method: 'POST',
          body: JSON.stringify({
            courseId: id,
            title: quizTitle,
            questions: quizQuestions
          })
        });
        setQuizzes([...quizzes, quiz]);
      }
      resetQuizForm();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuizId(quiz._id);
    setQuizTitle(quiz.title);
    // Copie profonde pour ne pas modifier l'objet du state `quizzes` directement
    setQuizQuestions(quiz.questions.map(q => ({ ...q, options: [...q.options] })));
    setShowAddQuiz(true);
    setViewingResultsQuiz(null);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce quiz ? Les résultats des élèves associés seront aussi supprimés.')) return;
    try {
      await api(`/quizzes/${quizId}`, { method: 'DELETE' });
      setQuizzes(quizzes.filter(q => q._id !== quizId));
      if (editingQuizId === quizId) resetQuizForm();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleViewResults = async (quiz) => {
    setViewingResultsQuiz(quiz);
    setShowAddQuiz(false);
    setLoadingResults(true);
    try {
      const allResults = await api('/quizzes/teacher/results');
      setQuizResults(allResults.filter(r => r.quiz?._id === quiz._id));
    } catch (err) {
      console.error(err);
      setQuizResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  // Cloudinary sert les fichiers "raw" (dont les PDF) avec Content-Disposition: attachment
  // par défaut, ce qui force un téléchargement automatique dès que le navigateur charge l'URL
  // (par exemple dans la balise <embed> ci-dessous, sans même que l'utilisateur clique).
  // On force l'affichage inline avec le flag fl_attachment:false.
  const getInlinePdfUrl = (url) => {
    if (!url) return url;
    if (url.includes('fl_attachment')) return url;
    return url.replace('/upload/', '/upload/fl_attachment:false/');
  };

  const extractYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading || checkingSub) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  // IMPORTANT : on bloque tout le monde qui n'est pas prof-propriétaire et qui n'a pas
  // d'abonnement actif — y compris les visiteurs non connectés (user === null), pas
  // seulement les comptes explicitement "student". Auparavant la condition
  // `user?.role === 'student'` laissait passer les visiteurs anonymes.
  if (!isSubscribed && user?.role !== 'teacher') {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-red-500/20 text-center slide-in">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Accès Refusé</h2>
          <p className="text-slate-400 text-sm mb-6">
            {user
              ? "Vous devez souscrire à ce module de cours pour en visualiser le contenu."
              : "Connectez-vous et souscrivez à ce module pour en visualiser le contenu."}
          </p>
          <Link
            to={user ? '/student-dashboard' : '/login'}
            className="btn-neon text-white font-bold px-6 py-2.5 rounded-lg text-sm block"
          >
            {user ? 'Retourner au Tableau de Bord' : 'Se connecter'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pt-28 pb-12 px-4 md:px-8 text-slate-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Barre latérale gauche - Infos & Chapitres */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-semibold uppercase">
              {course.subject} • {course.level}
            </span>
            <h2 className="text-xl font-extrabold text-white mt-3 mb-2">{course.title}</h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">{course.description}</p>
            <div className="flex items-center gap-3 border-t border-white/5 pt-4">
              <img
                src={course.teacher?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + (course.teacher?.name || 'Prof')}
                alt={course.teacher?.name || 'Professeur'}
                className="w-9 h-9 rounded-full object-cover border border-white/10"
              />
              <div>
                <div className="text-xs font-bold text-slate-300">Prof. {course.teacher?.name || 'Non renseigné'}</div>
                <div className="text-[10px] text-slate-500">Auteur du cours</div>
              </div>
            </div>
          </div>

          {/* Onglets */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-1 rounded-xl border border-white/5 text-center text-xs font-bold">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-2 rounded-lg cursor-pointer transition ${activeTab === 'content' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Leçons
            </button>
            <button
              onClick={() => setActiveTab('discussion')}
              className={`py-2 rounded-lg cursor-pointer transition flex items-center justify-center gap-1 ${activeTab === 'discussion' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <span>Salon</span>
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`py-2 rounded-lg cursor-pointer transition ${activeTab === 'quizzes' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Quiz
            </button>
          </div>

          {/* Liste des Chapitres / Leçons si onglet Leçons */}
          {activeTab === 'content' && (
            <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Sommaire</span>
                {user?.role === 'teacher' && (
                  <button
                    onClick={() => setShowAddChapter(!showAddChapter)}
                    className="p-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded hover:bg-indigo-600 hover:text-white"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Création Chapitre */}
              {showAddChapter && (
                <form onSubmit={handleAddChapter} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    className="input-animated text-xs p-1.5"
                    placeholder="Nom du chapitre..."
                  />
                  <button type="submit" className="px-3 bg-indigo-600 rounded text-xs font-bold text-white">Ajouter</button>
                </form>
              )}

              {course.chapters?.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Aucun chapitre créé.</p>
              ) : (
                course.chapters.map((chapter) => (
                  <div key={chapter._id} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-300 bg-white/5 px-2 py-1.5 rounded">
                      <span className="truncate">{chapter.title}</span>
                      <div className="flex gap-1">
                        {user?.role === 'teacher' && (
                          <>
                            <button
                              onClick={() => setSelectedChapterId(chapter._id)}
                              className="p-0.5 text-indigo-400 hover:text-white"
                              title="Ajouter leçon"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteChapter(chapter._id)}
                              className="p-0.5 text-red-400 hover:text-white"
                              title="Supprimer chapitre"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 pl-2">
                      {chapter.lessons.map((lesson) => (
                        <div
                          key={lesson._id}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs transition cursor-pointer ${
                            activeLesson?._id === lesson._id
                              ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-semibold'
                              : 'hover:bg-white/5 border border-transparent text-slate-400'
                          }`}
                          onClick={() => {
                            setActiveLesson(lesson);
                            setActiveQuiz(null);
                          }}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {lesson.contentType === 'video' ? (
                              <Play className="w-3.5 h-3.5" />
                            ) : lesson.contentType === 'pdf' ? (
                              <FileText className="w-3.5 h-3.5" />
                            ) : lesson.contentType === 'jitsi' ? (
                              <img src="https://cdn.jsdelivr.net/npm/@thesvg/icons/icons/jitsi.svg" alt="Jitsi" className="w-3.5 h-3.5" />
                            ) : (
                              <Video className="w-3.5 h-3.5" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          {user?.role === 'teacher' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLesson(chapter._id, lesson._id);
                              }}
                              className="p-0.5 text-red-500/50 hover:text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Panneau Principal droit (Visualiseur de leçon, Chat, Quiz) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* LEÇONS */}
          {activeTab === 'content' && (
            <div className="glass-card p-6 rounded-3xl border border-white/5 min-h-[60vh] flex flex-col justify-between">
              {/* Module de création de Leçon */}
              {selectedChapterId && user?.role === 'teacher' && (
                <div className="bg-slate-900 border border-white/10 p-4 rounded-xl mb-6 slide-in">
                  <h4 className="text-sm font-bold text-white mb-4">Créer une Leçon</h4>
                  <form onSubmit={handleAddLesson} className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Titre de la leçon</label>
                        <input
                          type="text"
                          required
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          className="input-animated p-1.5"
                          placeholder="Introduction aux forces"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Type de contenu</label>
                        <select
                          value={newLessonType}
                          onChange={(e) => setNewLessonType(e.target.value)}
                          className="input-animated p-1.5 bg-slate-900 border border-white/10 text-white rounded"
                        >
                          <option value="video">Vidéo YouTube</option>
                          <option value="pdf">Document PDF</option>
                          <option value="meet">Visioconférence Google Meet (lien externe)</option>
                          <option value="jitsi">Salle de classe en direct (intégrée - Jitsi)</option>
                          <option value="text">Texte / Exercice rédigé</option>
                        </select>
                      </div>
                    </div>

                    {newLessonType === 'video' && (
                      <div>
                        <label className="block text-slate-400 mb-1">Lien de la vidéo YouTube</label>
                        <input
                          type="url"
                          required
                          value={newLessonYoutube}
                          onChange={(e) => setNewLessonYoutube(e.target.value)}
                          className="input-animated p-1.5"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>
                    )}

                    {newLessonType === 'jitsi' && (
                      <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                        <img src="https://cdn.jsdelivr.net/npm/@thesvg/icons/icons/jitsi.svg" alt="Jitsi" className="w-6 h-6 shrink-0" />
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          Une salle de classe virtuelle sera créée automatiquement pour cette leçon.
                          Aucun lien à saisir : les élèves rejoignent le direct directement depuis la
                          page du cours, sans quitter la plateforme.
                        </p>
                      </div>
                    )}

                    {newLessonType === 'meet' && (
                      <div>
                        <label className="block text-slate-400 mb-1">Lien Google Meet</label>
                        <input
                          type="url"
                          required
                          value={newLessonMeet}
                          onChange={(e) => setNewLessonMeet(e.target.value)}
                          className="input-animated p-1.5"
                          placeholder="https://meet.google.com/abc-defg-hij"
                        />
                      </div>
                    )}

                    {newLessonType === 'text' && (
                      <div>
                        <label className="block text-slate-400 mb-1">Contenu texte</label>
                        <textarea
                          required
                          value={newLessonContent}
                          onChange={(e) => setNewLessonContent(e.target.value)}
                          className="input-animated h-24 p-1.5 resize-none"
                          placeholder="Saisissez votre leçon rédigée ici..."
                        />
                      </div>
                    )}

                    {newLessonType === 'pdf' && (
                      <div>
                        <label className="block text-slate-400 mb-1">Fichier PDF (Téléverser vers Cloudinary)</label>
                        <input
                          type="file"
                          required
                          accept="application/pdf"
                          onChange={(e) => setNewLessonPdf(e.target.files[0])}
                          className="input-animated text-xs text-slate-400 p-1.5"
                        />
                      </div>
                    )}

                    <div className="flex gap-2 justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => setSelectedChapterId(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={addingLesson}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold"
                      >
                        {addingLesson ? 'Chargement Cloudinary...' : 'Enregistrer'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeLesson ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-xl font-bold text-white">{activeLesson.title}</h3>
                    <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded font-bold capitalize">
                      {activeLesson.contentType}
                    </span>
                  </div>

                  {/* Lecteur Vidéo */}
                  {activeLesson.contentType === 'video' && activeLesson.youtubeUrl && (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/5 bg-black shadow-lg">
                      {extractYoutubeId(activeLesson.youtubeUrl) ? (
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${extractYoutubeId(activeLesson.youtubeUrl)}`}
                          title={activeLesson.title}
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                          Lien de la vidéo YouTube non valide.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Visionneuse PDF */}
                  {activeLesson.contentType === 'pdf' && activeLesson.pdfPath && (
                    <div className="w-full space-y-4">
                      <div className="p-8 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
                        <FileText className="w-16 h-16 text-indigo-400 mb-4" />
                        <h4 className="text-base font-bold text-white mb-2">Fiche de cours PDF</h4>
                        <p className="text-slate-400 text-xs mb-6">
                          Téléchargez et visualisez le document PDF associé à cette leçon (hébergé de manière sécurisée).
                        </p>
                        <a
                          href={getInlinePdfUrl(activeLesson.pdfPath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-shiny px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md inline-block cursor-pointer"
                        >
                          Visualiser le PDF (Cloudinary)
                        </a>
                      </div>
                      
                      {/* Embed Option for desktop */}
                      <div className="hidden md:block w-full h-[500px] rounded-2xl overflow-hidden border border-white/5">
                        <embed src={getInlinePdfUrl(activeLesson.pdfPath)} type="application/pdf" width="100%" height="100%" />
                      </div>
                    </div>
                  )}

                  {/* Salle de classe en direct intégrée (Jitsi) */}
                  {activeLesson.contentType === 'jitsi' && (
                    <div className="w-full space-y-3">
                      <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 text-xs text-slate-300">
                        <img src="https://cdn.jsdelivr.net/npm/@thesvg/icons/icons/jitsi.svg" alt="Jitsi" className="w-5 h-5 shrink-0" />
                        <span>Salle de classe en direct — activez votre caméra/micro dans la fenêtre ci-dessous pour rejoindre.</span>
                      </div>
                      <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-white/5 bg-black">
                        <iframe
                          src={`https://meet.jit.si/profsow-${course._id}-${activeLesson._id}`}
                          title={activeLesson.title}
                          allow="camera; microphone; fullscreen; display-capture; autoplay"
                          style={{ width: '100%', height: '100%', border: 0 }}
                        ></iframe>
                      </div>
                    </div>
                  )}

                  {/* Google Meet Link */}
                  {activeLesson.contentType === 'meet' && activeLesson.meetLink && (
                    <div className="p-8 bg-white/5 border border-white/5 rounded-2xl text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
                        <Video className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-bold text-white mb-2">Cours en direct avec M. Sow</h4>
                      <p className="text-slate-400 text-xs mb-6 max-w-sm">
                        Rejoignez la réunion virtuelle en cours pour assister au live ou poser vos questions.
                      </p>
                      <a
                        href={activeLesson.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-neon text-white px-8 py-3.5 rounded-xl font-bold text-xs"
                      >
                        Rejoindre le Direct Google Meet
                      </a>
                    </div>
                  )}

                  {/* Contenu textuel */}
                  {activeLesson.contentType === 'text' && (
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 leading-relaxed text-sm text-slate-300 font-medium whitespace-pre-wrap">
                      {activeLesson.content}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-20 text-center">
                  <Info className="w-12 h-12 text-slate-600 mb-4" />
                  <p className="text-sm">Aucune leçon active sélectionnée.</p>
                  <p className="text-xs mt-1">Veuillez sélectionner ou ajouter une leçon dans le menu.</p>
                </div>
              )}
            </div>
          )}

          {/* FORUM DE DISCUSSION */}
          {activeTab === 'discussion' && (
            <div className="glass-card p-6 rounded-3xl border border-white/5 min-h-[60vh] flex flex-col justify-between">
              <h3 className="text-lg font-bold text-indigo-400 border-b border-white/5 pb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <span>Discussion & Soutien en Direct</span>
              </h3>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto max-h-96 my-4 space-y-4 pr-1">
                {messages.length === 0 ? (
                  <p className="text-xs text-slate-500 py-10 text-center">Aucun message. Lancez la discussion !</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg._id} className={`flex items-start gap-3 text-xs max-w-[80%] ${msg.sender?._id === user?._id ? 'ml-auto flex-row-reverse' : ''}`}>
                      <img src={msg.sender?.avatar} alt={msg.sender?.name} className="w-7 h-7 rounded-full object-cover border border-white/10" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold ${msg.sender?.role === 'teacher' ? 'text-indigo-400' : 'text-slate-300'}`}>
                            {msg.sender?.name}
                          </span>
                          <span className="text-[9px] text-slate-500">
                            {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className={`p-3 rounded-2xl leading-relaxed text-slate-200 ${msg.sender?._id === user?._id ? 'bg-indigo-600 rounded-tr-none' : 'bg-slate-900 rounded-tl-none'}`}>
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-white/5 pt-4">
                <input
                  type="text"
                  required
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="input-animated text-xs py-2.5 pl-4"
                  placeholder="Posez votre question à M. Sow ou aux autres élèves..."
                />
                <button
                  type="submit"
                  disabled={sendingMessage}
                  className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center justify-center cursor-pointer shadow"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* QUIZZES */}
          {activeTab === 'quizzes' && (
            <div className="glass-card p-6 rounded-3xl border border-white/5 min-h-[60vh] flex flex-col justify-between">
              
              {/* Header Quiz */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>Exercices d'Évaluation</span>
                </h3>
                {user?.role === 'teacher' && (
                  <button
                    onClick={() => {
                      if (showAddQuiz) {
                        resetQuizForm();
                      } else {
                        setEditingQuizId(null);
                        setQuizTitle('');
                        setQuizQuestions([{ questionText: '', options: ['', ''], correctAnswerIndex: 0 }]);
                        setShowAddQuiz(true);
                        setViewingResultsQuiz(null);
                      }
                    }}
                    className="btn-shiny px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Créer un Quiz</span>
                  </button>
                )}
              </div>

              {/* FORMULAIRE DE CRÉATION DE QUIZ (PROF) */}
              {showAddQuiz && user?.role === 'teacher' && (
                <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl space-y-4 mb-6 text-xs slide-in">
                  <h4 className="text-sm font-bold text-white border-b border-white/5 pb-2">
                    {editingQuizId ? 'Modifier le Quiz' : 'Nouveau Quiz'}
                  </h4>
                  <form onSubmit={handleSaveQuiz} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-slate-400">Titre du Quiz</label>
                      <input
                        type="text"
                        required
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        className="input-animated p-2"
                        placeholder="ex: Quiz 1 : Les suites réelles"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="block text-slate-300 font-bold uppercase tracking-wider">Questions :</label>
                      {quizQuestions.map((question, qIdx) => (
                        <div key={qIdx} className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => removeQuestionField(qIdx)}
                            className="absolute top-2 right-2 text-red-500"
                          >
                            ✕
                          </button>
                          
                          <div className="space-y-1">
                            <label className="block text-slate-400 font-semibold">Question {qIdx + 1}</label>
                            <input
                              type="text"
                              required
                              value={question.questionText}
                              onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                              className="input-animated p-2"
                              placeholder="ex: Quel est le sens de variation de la suite u_n = 2^n ?"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-slate-400 font-semibold">Options de réponse & Bonne réponse</label>
                            {question.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex gap-2 items-center">
                                <input
                                  type="radio"
                                  name={`correct-${qIdx}`}
                                  checked={question.correctAnswerIndex === oIdx}
                                  onChange={() => setCorrectAnswer(qIdx, oIdx)}
                                />
                                <input
                                  type="text"
                                  required
                                  value={opt}
                                  onChange={(e) => updateOptionText(qIdx, oIdx, e.target.value)}
                                  className="input-animated p-1.5 text-xs"
                                  placeholder={`Option ${oIdx + 1}`}
                                />
                                {question.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeOptionField(qIdx, oIdx)}
                                    className="text-red-500"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addOptionField(qIdx)}
                              className="text-indigo-400 font-bold hover:underline"
                            >
                              + Ajouter option
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between border-t border-white/5 pt-4">
                      <button
                        type="button"
                        onClick={addQuestionField}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                      >
                        + Ajouter une question
                      </button>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={resetQuizForm}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-white"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={savingQuiz}
                          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-white font-bold disabled:opacity-60"
                        >
                          {savingQuiz ? 'Enregistrement...' : editingQuizId ? 'Enregistrer les modifications' : 'Créer le Quiz'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* LISTE ET JEU DU QUIZ */}
              {activeQuiz ? (
                /* QUIZ ACTIF (RÉALISATION ÉLÈVE OU APERÇU PROF) */
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{activeQuiz.title}</h4>
                      {isPreviewMode && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Mode aperçu — non enregistré
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => { setActiveQuiz(null); setIsPreviewMode(false); }}
                      className="text-slate-400 hover:text-white text-xs font-bold"
                    >
                      Retour
                    </button>
                  </div>

                  {quizScore ? (
                    <div className="text-center py-8 space-y-6 slide-in">
                      <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Award className="w-10 h-10" />
                      </div>
                      <h4 className="text-2xl font-bold text-white">Résultats</h4>
                      <p className="text-slate-400 text-sm">
                        {isPreviewMode ? 'Aperçu du score obtenu avec ces réponses :' : 'Vous avez terminé le quiz avec le score de :'}
                      </p>
                      <div className="text-4xl font-black text-indigo-400">{quizScore.score} / {quizScore.total}</div>
                      <p className="text-slate-500 text-xs">Pourcentage d'exactitude : {quizScore.percentage}%</p>
                      {isPreviewMode && (
                        <p className="text-amber-400 text-xs">Cette tentative n'a pas été enregistrée (mode aperçu).</p>
                      )}
                      
                      {/* Correction recap */}
                      <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 text-left space-y-4 max-w-xl mx-auto text-xs max-h-60 overflow-y-auto">
                        <h5 className="font-bold text-slate-300">Correction :</h5>
                        {activeQuiz.questions.map((q, idx) => (
                          <div key={idx} className="border-b border-white/5 pb-2">
                            <p className="font-semibold text-slate-200">{idx+1}. {q.questionText}</p>
                            <p className="text-emerald-400 mt-1">Bonne réponse : {q.options[q.correctAnswerIndex]}</p>
                            {quizAnswers[idx] !== q.correctAnswerIndex && (
                              <p className="text-red-400">Votre choix : {q.options[quizAnswers[idx]] || 'Aucun'}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => { setActiveQuiz(null); setIsPreviewMode(false); }}
                        className="w-full max-w-xs btn-neon text-white font-bold py-3 rounded-xl cursor-pointer"
                      >
                        Terminer
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {activeQuiz.questions.map((q, idx) => (
                        <div key={idx} className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 slide-in">
                          <h5 className="font-bold text-slate-200 text-sm">{idx + 1}. {q.questionText}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            {q.options.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => handleSelectQuizAnswer(idx, oIdx)}
                                className={`p-3 rounded-xl text-left border transition font-medium cursor-pointer ${
                                  quizAnswers[idx] === oIdx
                                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                                    : 'bg-slate-900/60 border-white/5 hover:border-slate-500 text-slate-400'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={handleSubmitQuiz}
                        disabled={submittingQuiz}
                        className="w-full btn-neon text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer mt-6 text-sm"
                      >
                        {submittingQuiz ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span>{isPreviewMode ? 'Voir le score (aperçu)' : 'Soumettre mes réponses'}</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : viewingResultsQuiz ? (
                /* RÉSULTATS DES ÉLÈVES POUR CE QUIZ (PROF) */
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h4 className="text-base font-bold text-white">
                      Résultats — <span className="text-purple-400">{viewingResultsQuiz.title}</span>
                    </h4>
                    <button
                      onClick={() => { setViewingResultsQuiz(null); setQuizResults([]); }}
                      className="text-slate-400 hover:text-white text-xs font-bold"
                    >
                      Retour
                    </button>
                  </div>

                  {loadingResults ? (
                    <div className="flex justify-center py-12">
                      <div className="loader-spinner"></div>
                    </div>
                  ) : quizResults.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-sm">Aucun élève n'a encore soumis ce quiz.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {quizResults
                        .slice()
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map((r) => (
                        <div key={r._id} className="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-xl text-sm">
                          <div className="flex items-center gap-3">
                            <img
                              src={r.student?.avatar}
                              alt={r.student?.name}
                              className="w-8 h-8 rounded-full object-cover border border-white/10"
                            />
                            <div>
                              <div className="font-bold text-slate-200">{r.student?.name || 'Élève'}</div>
                              <div className="text-[10px] text-slate-500">
                                {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-indigo-400">{r.score} / {r.totalQuestions}</div>
                            <div className="text-[10px] text-slate-500">{Math.round((r.score / r.totalQuestions) * 100)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* LISTE DES QUIZZES DISPONIBLES */
                <div className="space-y-4">
                  {quizzes.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-sm">Aucune évaluation programmée.</p>
                    </div>
                  ) : (
                    quizzes.map((quiz) => (
                      <div key={quiz._id} className="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-xl text-sm hover:border-indigo-500/35 transition">
                        <div>
                          <div className="font-bold text-slate-200">{quiz.title}</div>
                          <div className="text-[10px] text-slate-500 mt-1">{quiz.questions.length} questions interactives</div>
                        </div>

                        {user?.role === 'teacher' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePreviewQuiz(quiz)}
                              title="Aperçu"
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-xs font-bold text-slate-300 cursor-pointer transition"
                            >
                              Aperçu
                            </button>
                            <button
                              onClick={() => handleEditQuiz(quiz)}
                              title="Modifier"
                              className="px-3 py-1.5 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold text-indigo-400 cursor-pointer transition"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleViewResults(quiz)}
                              title="Voir les résultats"
                              className="px-3 py-1.5 bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold text-emerald-400 cursor-pointer transition"
                            >
                              Résultats
                            </button>
                            <button
                              onClick={() => handleDeleteQuiz(quiz._id)}
                              title="Supprimer"
                              className="p-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-600 hover:text-white rounded-lg text-red-400 cursor-pointer transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSelectQuiz(quiz)}
                            className="px-4 py-1.5 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold text-indigo-400 cursor-pointer transition"
                          >
                            Faire le Quiz
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;