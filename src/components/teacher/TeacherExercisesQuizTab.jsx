import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  Award,
  FileText,
  X,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
} from 'lucide-react';
import MathText from '../MathText';
import { formatLevel } from '../CourseCard';
import { matchesClassLevel } from '../../utils/education';

const isPhysicsSubject = (subject = '') =>
  String(subject).toLowerCase().includes('physique') ||
  String(subject).toLowerCase().includes('chimie');

const LATEX_SNIPPETS = [
  { label: '∑', insert: '$\\sum_{i=1}^{n} $', title: 'Somme' },
  { label: '∫', insert: '$\\int_{a}^{b} f(x)\\,dx$', title: 'Intégrale' },
  { label: 'a/b', insert: '$\\frac{a}{b}$', title: 'Fraction' },
  { label: 'xʸ', insert: '$x^{n}$', title: 'Puissance' },
  { label: '√x', insert: '$\\sqrt{x}$', title: 'Racine carrée' },
  { label: 'v⃗', insert: '$\\vec{v}$', title: 'Vecteur' },
  { label: '∞', insert: '$+\\infty$', title: 'Infini' },
  { label: '→', insert: '$\\rightarrow$', title: 'Réaction / Limite' },
];

const LEVEL_BARS = [
  { id: '4ème', label: '4ème', color: '#2563eb' },
  { id: '3ème', label: '3ème', color: '#059669' },
  { id: '2nde S', label: '2nde', color: '#059669' },
  { id: 'TS', label: 'Term', color: '#059669' },
];

const USE_MOCK = false; // TODO: supprimer

const MOCK_COURSES_EX = [
  { _id: 'mc-1', title: 'Maîtriser les Intégrales', subject: 'Mathématiques', level: 'TS', isFree: false },
  { _id: 'mc-2', title: 'Mécanique & Lois de Newton', subject: 'Physique-Chimie', level: 'TS', isFree: true },
  { _id: 'mc-3', title: 'Équations & Fonctions', subject: 'Mathématiques', level: '3ème', isFree: false },
];

const MOCK_QUIZZES = [
  {
    _id: 'mq-1',
    title: "TD n°1 : Calcul d'intégrales par parties",
    course: MOCK_COURSES_EX[0],
    isPublished: true,
    questions: [
      {
        questionText: 'Calculer $I = \\int_0^1 x \\ln(x + 1)\\,dx$.',
        questionType: 'qcm',
        options: [
          '$I = \\frac{1}{4}$',
          '$I = \\frac{1}{4} (2\\ln 2 - 1) + \\frac{1}{2}$',
          '$I = \\ln 2 - 1$',
          '$I = \\frac{1}{2}\\ln(2)$',
        ],
        correctAnswerIndex: 1,
      },
    ],
  },
  {
    _id: 'mq-2',
    title: 'Quiz : Lois de Newton & Mouvement',
    course: MOCK_COURSES_EX[1],
    isPublished: true,
    questions: [
      {
        questionText: 'Selon la deuxième loi de Newton, $\\sum \\vec{F}_{ext} = $ ?',
        questionType: 'qcm',
        options: ['$m\\vec{v}$', '$m\\vec{a}$', '$\\frac{1}{2}mv^2$', '$m\\vec{g}$'],
        correctAnswerIndex: 1,
      },
    ],
  },
];

const MOCK_EXERCISES = [
  {
    _id: 'me-1',
    title: "Fiche d'exercices : Équations du 1er degré",
    course: MOCK_COURSES_EX[2],
    exerciseType: 'pdf',
    difficulty: 'moyen',
    subscribersOnly: true,
    statementText: 'Résoudre dans $\\mathbb{R}$ : $3(x - 2) + 5 = 2x - 7$.',
  },
];

const MOCK_STUDENT_STATUS = [
  { id: 'ms-1', name: 'Fatou Diop', status: 'Rendu', isDone: true },
  { id: 'ms-2', name: 'Jean Dupont', status: 'Rendu', isDone: true },
  { id: 'ms-3', name: 'Mariama Diallo', status: 'En attente', isDone: false },
  { id: 'ms-4', name: 'Lika Badiane', status: 'En attente', isDone: false },
];

const TeacherExercisesQuizTab = ({
  courses = [],
  allCourses = [],
  exercises = [],
  exerciseSubmissions = [],
  quizzes = [],
  quizResults = [],
  // Exercise actions
  onOpenNewExercise,
  onEditExercise,
  onDeleteExercise,
  gradeDrafts,
  setGradeDrafts,
  handleSaveGrade,
  // Quiz actions
  editingQuizId,
  quizCourseId,
  setQuizCourseId,
  quizChapterId,
  setQuizChapterId,
  quizTitle,
  setQuizTitle,
  quizPassingScore,
  setQuizPassingScore,
  quizMaxAttempts,
  setQuizMaxAttempts,
  quizQuestions,
  setQuizQuestions,
  savingQuiz,
  handleSaveQuiz,
  startEditQuiz,
  resetQuizForm,
  handleDeleteQuiz,
  formatDateShort,
}) => {
  const [activeTab, setActiveTab] = useState('all'); // all | qcm | pdf | annales | submissions | results
  const [search, setSearch] = useState('');
  const [selectedItemKey, setSelectedItemKey] = useState(null);
  const [studioOpen, setStudioOpen] = useState(false);
  const [choiceMenuOpen, setChoiceMenuOpen] = useState(false);
  const [activeQIndex, setActiveQIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(true);
  const [monetizationMode, setMonetizationMode] = useState('paid_course'); // free_preview | paid_course | unit

  const effectiveExercises = USE_MOCK ? MOCK_EXERCISES : exercises;
  const effectiveQuizzes = USE_MOCK ? MOCK_QUIZZES : quizzes;
  const courseList = USE_MOCK
    ? MOCK_COURSES_EX
    : allCourses.length > 0
      ? allCourses
      : courses;
  const visibleCourseIds = useMemo(
    () => new Set((USE_MOCK ? MOCK_COURSES_EX : courses).map((c) => String(c._id))),
    [courses]
  );

  const filteredExercises = useMemo(() => {
    const q = search.trim().toLowerCase();
    return effectiveExercises.filter((ex) => {
      const cId = String(ex.course?._id || ex.course || '');
      if ((USE_MOCK ? MOCK_COURSES_EX : courses).length > 0 && !visibleCourseIds.has(cId)) return false;
      if (activeTab === 'annales' && ex.exerciseType !== 'annale' && !ex.title?.toLowerCase().includes('annale')) {
        return false;
      }
      if (!q) return true;
      return (
        ex.title?.toLowerCase().includes(q) ||
        ex.statementText?.toLowerCase().includes(q)
      );
    });
  }, [effectiveExercises, courses, visibleCourseIds, activeTab, search]);

  const filteredQuizzes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return effectiveQuizzes.filter((qz) => {
      const cId = String(qz.course?._id || qz.course || '');
      if ((USE_MOCK ? MOCK_COURSES_EX : courses).length > 0 && !visibleCourseIds.has(cId)) return false;
      if (!q) return true;
      return qz.title?.toLowerCase().includes(q);
    });
  }, [effectiveQuizzes, courses, visibleCourseIds, search]);

  const combinedItems = useMemo(() => {
    const list = [];
    if (activeTab === 'all' || activeTab === 'qcm') {
      filteredQuizzes.forEach((qz, idx) => {
        const courseObj =
          courseList.find((c) => String(c._id) === String(qz.course?._id || qz.course)) ||
          qz.course;
        const attempts = USE_MOCK
          ? idx === 0
            ? 45
            : 82
          : quizResults.filter(
              (r) => String(r.quiz?._id || r.quiz) === String(qz._id)
            ).length;
        list.push({
          key: `quiz-${qz._id}`,
          kind: 'quiz',
          raw: qz,
          title: qz.title,
          courseTitle: courseObj?.title || 'Cours',
          subject: courseObj?.subject || 'Mathématiques',
          level: courseObj?.level || 'TS',
          completions: attempts,
          isPaid: !courseObj?.isFree,
          isPublished: qz.isPublished !== false,
          subtitle: `${qz.questions?.length || 0} question(s) • QCM`,
        });
      });
    }
    if (activeTab === 'all' || activeTab === 'pdf' || activeTab === 'annales') {
      filteredExercises.forEach((ex) => {
        const courseObj =
          courseList.find((c) => String(c._id) === String(ex.course?._id || ex.course)) ||
          ex.course;
        const subs = USE_MOCK
          ? 38
          : exerciseSubmissions.filter(
              (s) => String(s.exercise?._id || s.exercise) === String(ex._id)
            ).length;
        list.push({
          key: `ex-${ex._id}`,
          kind: 'exercise',
          raw: ex,
          title: ex.title,
          courseTitle: courseObj?.title || 'Cours',
          subject: courseObj?.subject || 'Mathématiques',
          level: courseObj?.level || 'TS',
          completions: subs,
          isPaid: ex.subscribersOnly !== false,
          isPublished: true,
          subtitle: `${ex.exerciseType || 'TD'} • ${ex.difficulty || 'moyen'}`,
        });
      });
    }
    return list;
  }, [
    activeTab,
    filteredQuizzes,
    filteredExercises,
    courseList,
    quizResults,
    exerciseSubmissions,
  ]);

  const selectedItem = useMemo(() => {
    return (
      combinedItems.find((i) => i.key === selectedItemKey) ||
      combinedItems[0] ||
      null
    );
  }, [combinedItems, selectedItemKey]);

  // Student status card data (mapped from real submissions & quiz results)
  const studentStatusList = useMemo(() => {
    if (USE_MOCK) return MOCK_STUDENT_STATUS;
    if (!selectedItem) return [];
    if (selectedItem.kind === 'quiz') {
      return quizResults
        .filter((r) => String(r.quiz?._id || r.quiz) === String(selectedItem.raw._id))
        .slice(0, 5)
        .map((r) => ({
          id: r._id,
          name: r.student?.name || 'Élève',
          avatar: r.student?.avatar,
          status: 'Rendu',
          isDone: true,
        }));
    }
    return exerciseSubmissions
      .filter((s) => String(s.exercise?._id || s.exercise) === String(selectedItem.raw._id))
      .slice(0, 5)
      .map((s) => ({
        id: s._id,
        name: s.student?.name || 'Élève',
        avatar: s.student?.avatar,
        status: s.status === 'graded' ? 'Corrigé' : s.status === 'submitted' ? 'Rendu' : 'En attente',
        isDone: s.status === 'graded' || s.status === 'submitted',
      }));
  }, [selectedItem, quizResults, exerciseSubmissions]);

  // Bar chart stats by level
  const levelChartData = useMemo(() => {
    if (USE_MOCK) {
      return {
        counts: [
          { ...LEVEL_BARS[0], count: 148 },
          { ...LEVEL_BARS[1], count: 112 },
          { ...LEVEL_BARS[2], count: 84 },
          { ...LEVEL_BARS[3], count: 36 },
        ],
        maxVal: 150,
      };
    }
    const counts = LEVEL_BARS.map((lvl) => {
      const courseIdsForLevel = new Set(
        courseList.filter((c) => matchesClassLevel(c.level, lvl.id)).map((c) => String(c._id))
      );
      const quizCount = effectiveQuizzes.filter((q) =>
        courseIdsForLevel.has(String(q.course?._id || q.course))
      ).length;
      const exCount = effectiveExercises.filter((e) =>
        courseIdsForLevel.has(String(e.course?._id || e.course))
      ).length;
      return { ...lvl, count: quizCount + exCount };
    });
    const maxVal = Math.max(...counts.map((c) => c.count), 10);
    return { counts, maxVal };
  }, [courseList, effectiveQuizzes, effectiveExercises]);

  const pendingSubmissionsCount = exerciseSubmissions.filter(
    (s) => s.status === 'submitted'
  ).length;

  const openQuizStudioNew = () => {
    resetQuizForm();
    if (courses[0]?._id) setQuizCourseId(courses[0]._id);
    setActiveQIndex(0);
    setStudioOpen(true);
    setChoiceMenuOpen(false);
  };

  const openQuizStudioEdit = (quiz) => {
    startEditQuiz(quiz);
    setActiveQIndex(0);
    setStudioOpen(true);
  };

  const insertLatexIntoQuestion = (snippet) => {
    setQuizQuestions((prev) =>
      prev.map((q, idx) =>
        idx === activeQIndex
          ? { ...q, questionText: `${q.questionText || ''}${snippet}` }
          : q
      )
    );
  };

  const selectedQuizCourse =
    courseList.find((c) => String(c._id) === String(quizCourseId)) || null;

  if (studioOpen) {
    return (
      <div className="space-y-6 animate-fade-slide-up">
        {/* En-tête inline Studio (Image 8) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStudioOpen(false)}
              className="h-9 px-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Studio de création :{' '}
              {editingQuizId ? 'Modifier le Quiz' : 'Nouvel exercice / Quiz'}
            </h1>
          </div>
        </div>

        {/* Corps Studio (2 colonnes inline fidèles à Image 8) */}
        <form
          onSubmit={async (e) => {
            await handleSaveQuiz(e);
            setStudioOpen(false);
          }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          {/* Paramètres Généraux (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Paramètres Généraux
            </h2>

            <div>
              <input
                type="text"
                required
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="TD n°2 : Étude de fonctions et limites"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Matière
                </label>
                <div className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 flex items-center truncate">
                  {selectedQuizCourse?.subject || 'Mathématiques'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Niveau
                </label>
                <div className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 flex items-center truncate">
                  {formatLevel(selectedQuizCourse?.level || 'TS')}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Cours associé
              </label>
              <select
                required
                value={quizCourseId}
                onChange={(e) => {
                  setQuizCourseId(e.target.value);
                  setQuizChapterId('');
                }}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2563eb]"
              >
                {courseList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title} ({formatLevel(c.level)})
                  </option>
                ))}
              </select>
            </div>

            {selectedQuizCourse?.chapters?.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Chapitre (optionnel)
                </label>
                <select
                  value={quizChapterId}
                  onChange={(e) => setQuizChapterId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                >
                  <option value="">Tout le cours</option>
                  {selectedQuizCourse.chapters.map((ch) => (
                    <option key={ch._id} value={ch._id}>
                      {ch.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Score requis (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={quizPassingScore}
                  onChange={(e) => setQuizPassingScore(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Essais max (0=∞)
                </label>
                <input
                  type="number"
                  min="0"
                  value={quizMaxAttempts}
                  onChange={(e) => setQuizMaxAttempts(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <p className="text-xs font-bold text-slate-800">
                Options de monétisation
              </p>
              {[
                { id: 'free_preview', label: 'Gratuit en aperçu' },
                { id: 'paid_course', label: 'Inclus dans un cours payant' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="quiz-monetization"
                    checked={monetizationMode === opt.id}
                    onChange={() => setMonetizationMode(opt.id)}
                    className="text-[#2563eb] focus:ring-[#2563eb]"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Éditeur de Questions Scientifiques (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-extrabold text-slate-900">
                Éditeur de Questions Scientifiques
              </h2>

              <div className="flex flex-wrap items-center gap-1 bg-slate-50 border border-slate-200/80 p-1 rounded-xl">
                <span className="text-[11px] font-extrabold text-slate-600 px-2 font-serif">
                  LaTeX
                </span>
                {LATEX_SNIPPETS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    title={s.title}
                    onClick={() => insertLatexIntoQuestion(s.insert)}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-[#2563eb] text-xs font-bold border border-slate-200/70 cursor-pointer transition"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {quizQuestions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  onClick={() => setActiveQIndex(qIdx)}
                  className={`p-4 rounded-2xl border transition space-y-3 ${
                    activeQIndex === qIdx
                      ? 'border-[#2563eb] bg-blue-50/10'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-800">
                      Énoncé de la question {qIdx + 1}
                    </label>
                    {quizQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setQuizQuestions((prev) =>
                            prev.filter((_, i) => i !== qIdx)
                          )
                        }
                        className="text-xs text-rose-600 hover:underline cursor-pointer"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={2}
                    required
                    value={q.questionText}
                    onChange={(e) =>
                      setQuizQuestions((prev) =>
                        prev.map((item, i) =>
                          i === qIdx
                            ? { ...item, questionText: e.target.value }
                            : item
                        )
                      )
                    }
                    placeholder="ex: Calculer la limite en $+\infty$ de $f(x) = \frac{e^x - 1}{x^2}$."
                    className="w-full p-3 rounded-xl border border-[#2563eb]/40 bg-white text-sm focus:outline-none focus:border-[#2563eb]"
                  />

                  {q.questionText && (
                    <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                        Aperçu scientifique :
                      </span>
                      <MathText text={q.questionText} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Propositions de Réponses
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2563eb]">
                        <Check className="w-3.5 h-3.5" />
                        Bonne réponse
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                      {(q.options || []).map((opt, oIdx) => {
                        const isCorrect = q.correctAnswerIndex === oIdx;
                        return (
                          <div key={oIdx} className="relative">
                            {isCorrect && (
                              <span className="absolute -top-2.5 left-6 px-2 py-0.2 rounded-full bg-[#2563eb] text-white text-[9px] font-extrabold z-10">
                                Bonne réponse
                              </span>
                            )}
                            <div
                              className={`flex items-center rounded-xl border overflow-hidden ${
                                isCorrect
                                  ? 'border-[#2563eb] bg-blue-50/40 ring-1 ring-[#2563eb]/20'
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setQuizQuestions((prev) =>
                                    prev.map((item, i) =>
                                      i === qIdx
                                        ? { ...item, correctAnswerIndex: oIdx }
                                        : item
                                    )
                                  )
                                }
                                title="Définir comme bonne réponse"
                                className={`w-8 h-9 flex items-center justify-center text-xs font-extrabold shrink-0 cursor-pointer transition ${
                                  isCorrect
                                    ? 'bg-[#2563eb] text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </button>
                              <input
                                type="text"
                                required
                                value={opt}
                                onChange={(e) =>
                                  setQuizQuestions((prev) =>
                                    prev.map((item, i) =>
                                      i === qIdx
                                        ? {
                                            ...item,
                                            options: item.options.map((o, oi) =>
                                              oi === oIdx ? e.target.value : o
                                            ),
                                          }
                                        : item
                                    )
                                  )
                                }
                                placeholder={`Réponse ${String.fromCharCode(65 + oIdx)}`}
                                className="w-full h-9 px-2.5 bg-transparent text-xs font-medium text-slate-900 focus:outline-none"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowExplanation((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer"
              >
                <span>Explication détaillée du corrigé</span>
                {showExplanation ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
              {showExplanation && (
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Astuce : Utilisez <code>$...$</code> pour les formules en ligne et{' '}
                  <code>$$...$$</code> pour les équations centrées.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setQuizQuestions((prev) => [
                    ...prev,
                    {
                      questionText: '',
                      questionType: 'qcm',
                      options: ['', '', '', ''],
                      correctAnswerIndex: 0,
                      correctAnswerText: '',
                    },
                  ]);
                  setActiveQIndex(quizQuestions.length);
                }}
                className="h-9 px-4 rounded-xl border border-slate-200 hover:border-[#2563eb] text-xs font-bold text-slate-700 hover:text-[#2563eb] cursor-pointer"
              >
                + Ajouter une question
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStudioOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingQuiz}
                  className="h-10 px-5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 text-white text-xs font-bold cursor-pointer shadow-sm"
                >
                  {savingQuiz ? 'Enregistrement...' : "Publier l'exercice"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-slide-up">
      {/* En-tête + Recherche */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
          Exercices &amp; Quiz
        </h1>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un exercice, quiz..."
            className="w-full h-10 pl-10 pr-8 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2563eb] shadow-xs transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sous-onglets + Bouton + Nouvel exercice / Quiz */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-5">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'qcm', label: 'QCM' },
            { id: 'pdf', label: 'Exercices PDF corrigés' },
            { id: 'annales', label: 'Annales' },
            {
              id: 'submissions',
              label: 'Devoirs à corriger',
              badge: pendingSubmissionsCount,
            },
            { id: 'results', label: 'Résultats Quiz' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2.5 -mb-[13px] text-[13px] font-bold inline-flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                activeTab === tab.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-700">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setChoiceMenuOpen((v) => !v)}
            className="h-9 px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel exercice / Quiz</span>
          </button>

          {choiceMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setChoiceMenuOpen(false)}
              />
              <div className="absolute right-0 top-11 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-40 space-y-1">
                <button
                  type="button"
                  onClick={openQuizStudioNew}
                  className="w-full text-left p-3 rounded-xl hover:bg-blue-50/70 transition flex items-start gap-3 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Quiz QCM (Studio LaTeX)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Questions scientifiques à choix multiples
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setChoiceMenuOpen(false);
                    onOpenNewExercise();
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-emerald-50/70 transition flex items-start gap-3 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Exercice / TD / Annale PDF
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Énoncé texte/PDF + corrigé vidéo/PDF
                    </p>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* VUE CATALOGUE 3 COLONNES (Image 4) */}
      {(activeTab === 'all' || activeTab === 'qcm' || activeTab === 'pdf' || activeTab === 'annales') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Colonne 1 (4 cols) : Liste des TD / Quiz */}
          <div className="lg:col-span-4 space-y-3">
            {combinedItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
                <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">
                  Aucun exercice ou quiz trouvé
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Cliquez sur "+ Nouvel exercice / Quiz" pour commencer.
                </p>
              </div>
            ) : (
              combinedItems.map((item) => {
                const isSelected = selectedItem?.key === item.key;
                const physics = isPhysicsSubject(item.subject);
                const isPdfCard = item.kind === 'exercise';

                return (
                  <div
                    key={item.key}
                    onClick={() => setSelectedItemKey(item.key)}
                    className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer teacher-card-hover ${
                      isSelected
                        ? 'border-[#2563eb] ring-1 ring-[#2563eb]/30 shadow-sm'
                        : 'border-slate-200/80 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    {isPdfCard ? (
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-16 h-18 rounded-xl p-2 flex flex-col justify-between shrink-0 text-white ${
                            physics ? 'bg-[#0f5132]' : 'bg-[#163a5f]'
                          }`}
                        >
                          <p className="text-[9px] font-bold leading-tight line-clamp-3">
                            {item.title}
                          </p>
                          <span className="inline-block px-1.5 py-0.5 rounded bg-[#059669] text-[8px] font-extrabold w-fit">
                            Publié
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[14px] font-bold text-slate-900 leading-snug line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatLevel(item.level)} • {physics ? 'Physique' : 'Maths'}
                          </p>
                          <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-[11px] text-slate-500 font-medium">
                              {item.completions} complétions •
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                item.isPaid
                                  ? 'bg-slate-100 text-slate-700'
                                  : 'bg-emerald-50 text-[#059669]'
                              }`}
                            >
                              {item.isPaid ? (
                                <>
                                  <Lock className="w-3 h-3" />
                                  <span>Payant</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3 h-3" />
                                  <span>Aperçu Gratuit</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-[14px] font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h3>

                        <div className="flex items-center gap-2 mt-1.5">
                          {item.isPublished && !isSelected && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#059669] text-white text-[10px] font-bold shrink-0">
                              Publié
                            </span>
                          )}
                          <p className="text-xs text-slate-500">
                            {formatLevel(item.level)} • {physics ? 'Physique' : 'Maths'}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                                physics
                                  ? 'bg-[#059669] text-white'
                                  : 'bg-[#2563eb] text-white'
                              }`}
                            >
                              {physics ? 'Physique' : 'Maths'}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              • {item.completions} complétions
                            </span>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              item.isPaid
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-emerald-50 text-[#059669]'
                            }`}
                          >
                            {item.isPaid ? (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>Payant</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3 h-3" />
                                <span>Aperçu Gratuit</span>
                              </>
                            )}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Colonne 2 (5 cols) : Édition rapide */}
          <div className="lg:col-span-5">
            {!selectedItem ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
                <p className="text-sm font-semibold text-slate-500">
                  Sélectionnez un exercice ou quiz à gauche.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-extrabold text-slate-900">
                    Édition rapide
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedItem.kind === 'quiz') {
                          openQuizStudioEdit(selectedItem.raw);
                        } else {
                          onEditExercise(selectedItem.raw);
                        }
                      }}
                      className="h-7 px-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Éditer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedItem.kind === 'quiz') {
                          handleDeleteQuiz(selectedItem.raw);
                        } else {
                          onDeleteExercise(selectedItem.raw);
                        }
                      }}
                      className="h-7 w-7 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 inline-flex items-center justify-center transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Titre & Tags */}
                <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-900">
                  {selectedItem.title}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700">
                    {formatLevel(selectedItem.level)} •{' '}
                    {isPhysicsSubject(selectedItem.subject) ? 'Physique' : 'Maths'}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700">
                    Type : {selectedItem.kind === 'quiz' ? 'QCM' : 'Exercice / TD'}
                  </span>
                </div>

                {/* Aperçu Questions / Énoncé LaTeX */}
                {selectedItem.kind === 'quiz' ? (
                  <div className="space-y-3 pt-1">
                    {(selectedItem.raw.questions || []).slice(0, 1).map((q, idx) => (
                      <div key={idx} className="space-y-2.5">
                        <div className="text-[13px] text-slate-900 flex items-start gap-1.5 flex-wrap">
                          <span className="font-extrabold shrink-0">Question {idx + 1} :</span>
                          <MathText text={q.questionText} />
                        </div>

                        {q.questionType !== 'open' && (
                          <div className="space-y-2">
                            {(q.options || []).map((opt, oIdx) => {
                              const isCorrect = oIdx === q.correctAnswerIndex;
                              return (
                                <div
                                  key={oIdx}
                                  className={`px-3.5 py-2 rounded-xl border text-[13px] flex items-center gap-2 transition ${
                                    isCorrect
                                      ? 'bg-[#eff6ff] border-[#2563eb]/50 text-slate-900 font-semibold'
                                      : 'bg-white border-slate-200 text-slate-800'
                                  }`}
                                >
                                  <span className="font-bold text-slate-600 shrink-0">
                                    {String.fromCharCode(65 + oIdx)}.
                                  </span>
                                  <MathText text={opt} />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#f4f7fb] border border-slate-200/70 space-y-2">
                    <p className="text-[11px] font-bold uppercase text-slate-400">
                      Énoncé scientifique
                    </p>
                    <MathText
                      text={selectedItem.raw.statementText || 'Énoncé joint en PDF/Image.'}
                      className="text-[13px] text-slate-800"
                    />
                  </div>
                )}

                {/* Ligne Type : Payant + Toggle */}
                <div className="pt-1 flex items-center gap-2.5 text-xs">
                  <span className="font-bold text-slate-800">
                    Type :{' '}
                    <span className={selectedItem.isPaid ? 'text-slate-900' : 'text-[#059669]'}>
                      {selectedItem.isPaid ? 'Payant' : 'Aperçu Gratuit'}
                    </span>
                  </span>
                  <div
                    className={`w-11 h-6 rounded-full p-0.5 flex items-center transition ${
                      selectedItem.isPaid ? 'bg-[#2563eb] justify-end' : 'bg-emerald-500 justify-start'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white shadow-xs flex items-center justify-center">
                      {selectedItem.isPaid ? (
                        <Lock className="w-3 h-3 text-[#2563eb]" />
                      ) : (
                        <Unlock className="w-3 h-3 text-[#059669]" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Éditeur de formules (LaTeX) */}
                <div
                  onClick={() => {
                    if (selectedItem.kind === 'quiz') {
                      openQuizStudioEdit(selectedItem.raw);
                    } else {
                      onEditExercise(selectedItem.raw);
                    }
                  }}
                  className="rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-[#2563eb]/50 transition"
                >
                  <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Éditeur de formules (LaTeX)
                    </span>
                    <span className="text-[11px] font-bold text-[#2563eb]">
                      Ouvrir →
                    </span>
                  </div>
                  <div className="px-3.5 py-2.5 bg-white flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600">
                    <span className="font-serif">B</span>
                    <span className="italic font-serif">I</span>
                    <span className="underline">U</span>
                    <span className="line-through">S</span>
                    <span className="font-mono text-[11px]">&lt;&gt;</span>
                    <span>πₓ</span>
                    <span>∑</span>
                    <span>∫</span>
                    <span>a/b</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Colonne 3 (3 cols) : Statut des élèves + Graphique par niveau */}
          <div className="lg:col-span-3 space-y-5">
            {/* Carte Statut des élèves */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                Statut des élèves
              </h3>
              {studentStatusList.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Aucune soumission sur cet élément.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {studentStatusList.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          {st.avatar ? (
                            <img src={st.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-slate-600 text-[10px]">
                              {st.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-slate-800 truncate">
                          {st.name}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          st.isDone
                            ? 'bg-emerald-50 text-[#059669]'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {st.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Carte Graphique par niveau */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4">
              <div className="flex gap-2">
                {/* Axe Y */}
                <div className="flex flex-col justify-between text-[10px] font-semibold text-slate-400 tabular-nums h-36 pb-1 select-none">
                  {[1, 0.8, 0.6, 0.4, 0.2, 0].map((ratio) => (
                    <span key={ratio}>
                      {Math.round(levelChartData.maxVal * ratio)}
                    </span>
                  ))}
                </div>

                {/* Barres */}
                <div className="flex-1 flex flex-col">
                  <div className="h-36 flex items-end justify-between gap-2.5 px-1.5 border-b border-slate-200 relative">
                    {levelChartData.counts.map((bar) => {
                      const pct =
                        bar.count === 0
                          ? 6
                          : Math.max(8, Math.round((bar.count / levelChartData.maxVal) * 100));
                      return (
                        <div
                          key={bar.id}
                          title={`${bar.label} : ${bar.count}`}
                          className="flex-1 flex flex-col items-center justify-end h-full"
                        >
                          <div
                            className="w-5 sm:w-6 rounded-t-md transition-all duration-300"
                            style={{
                              height: `${pct}%`,
                              backgroundColor: bar.color,
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between gap-2.5 px-1.5 pt-1.5">
                    {levelChartData.counts.map((bar) => (
                      <span
                        key={bar.id}
                        className="flex-1 text-center text-[10px] font-semibold text-slate-500"
                      >
                        {bar.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VUE SOUMISSIONS À CORRIGER */}
      {activeTab === 'submissions' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {exerciseSubmissions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Aucune copie soumise par les élèves pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {exerciseSubmissions.map((sub) => {
                const draft = gradeDrafts[sub._id] || {
                  grade: sub.grade ?? '',
                  teacherComment: sub.teacherComment || '',
                  isPassed: sub.isPassed ?? true,
                };
                return (
                  <div
                    key={sub._id}
                    className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {sub.student?.name || 'Élève'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sub.status === 'graded'
                              ? 'bg-emerald-50 text-[#059669]'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {sub.status === 'graded' ? 'Corrigé' : 'À corriger'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Exercice : <strong>{sub.exercise?.title || 'TD'}</strong> • Soumis le{' '}
                        {formatDateShort(sub.submittedAt || sub.createdAt)}
                      </p>
                      {sub.answerText && (
                        <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 mt-1">
                          {sub.answerText}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        placeholder="Note /20"
                        value={draft.grade}
                        onChange={(e) =>
                          setGradeDrafts((prev) => ({
                            ...prev,
                            [sub._id]: { ...draft, grade: e.target.value },
                          }))
                        }
                        className="w-24 h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Appréciation..."
                        value={draft.teacherComment}
                        onChange={(e) =>
                          setGradeDrafts((prev) => ({
                            ...prev,
                            [sub._id]: { ...draft, teacherComment: e.target.value },
                          }))
                        }
                        className="w-48 h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveGrade(sub)}
                        className="h-9 px-4 rounded-lg bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VUE RÉSULTATS QUIZ */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {quizResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Aucun résultat de quiz enregistré pour l'instant.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Élève</th>
                    <th className="py-3 px-4">Quiz</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {quizResults.map((qr) => {
                    const pct = Math.round(
                      (qr.score / Math.max(1, qr.totalQuestions || 1)) * 100
                    );
                    return (
                      <tr key={qr._id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {qr.student?.name || 'Élève'}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {qr.quiz?.title || 'Quiz'}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-slate-900 tabular-nums">
                          {qr.score}/{qr.totalQuestions} ({pct}%)
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              pct >= 50
                                ? 'bg-emerald-50 text-[#059669]'
                                : 'bg-rose-50 text-rose-600'
                            }`}
                          >
                            {pct >= 50 ? 'Réussi' : 'À revoir'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {formatDateShort(qr.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Fin des vues Exercices & Quiz */}
    </div>
  );
};

export default TeacherExercisesQuizTab;
