import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Plus,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  PlaySquare,
  FileText,
  FileEdit,
  Radio,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ExternalLink,
  Check,
  X,
  MoreHorizontal,
  FolderPlus,
} from 'lucide-react';
import { formatLevel } from '../CourseCard';

const USE_MOCK = false; // TODO: supprimer

const MOCK_COURSES = [
  {
    _id: 'mock-course-1',
    title: 'Maîtriser les Intégrales',
    level: 'TS',
    subject: 'Mathématiques',
    price: 10000,
    isFree: false,
    isPublished: true,
    chapters: [
      {
        _id: 'mock-ch-1',
        title: 'Chapitre 1 : Primitives & Fonctions',
        isFree: false,
        isLocked: false,
        lessons: [
          {
            _id: 'mock-l-1',
            title: 'Introduction aux Primitives',
            contentType: 'video',
            isFree: true,
          },
          {
            _id: 'mock-l-2',
            title: 'Règles de Calcul de Primitives',
            contentType: 'pdf',
            isFree: false,
            subtitle: 'PDF sommaire',
          },
          {
            _id: 'mock-l-3',
            title: 'Applications sur Fonctions Usuelles',
            contentType: 'text',
            isFree: false,
          },
        ],
      },
      {
        _id: 'mock-ch-2',
        title: 'Chapitre 2 : Calcul Intégral & Aires',
        isFree: false,
        isLocked: false,
        lessons: [
          {
            _id: 'mock-l-4',
            title: 'Intégration par parties',
            contentType: 'video',
            isFree: false,
          },
        ],
      },
    ],
  },
  {
    _id: 'mock-course-2',
    title: 'Mécanique & Lois de Newton',
    level: 'TS',
    subject: 'Physique-Chimie',
    price: 8000,
    isFree: false,
    isPublished: false,
    chapters: [
      {
        _id: 'mock-ch-3',
        title: 'Chapitre 1 : Cinématique du point',
        isFree: true,
        isLocked: false,
        lessons: [
          {
            _id: 'mock-l-5',
            title: 'Vecteurs vitesse et accélération',
            contentType: 'video',
            isFree: true,
          },
        ],
      },
    ],
  },
  {
    _id: 'mock-course-3',
    title: 'Équations & Fonctions',
    level: '3ème',
    subject: 'Mathématiques',
    price: 5000,
    isFree: false,
    isPublished: true,
    chapters: [
      {
        _id: 'mock-ch-4',
        title: 'Chapitre 1 : Équations du 1er degré',
        isFree: false,
        isLocked: false,
        lessons: [],
      },
    ],
  },
];

const isPhysicsSubject = (subject = '') =>
  String(subject).toLowerCase().includes('physique') ||
  String(subject).toLowerCase().includes('chimie');

const formatShortSubject = (subject = '') => {
  const s = String(subject).toLowerCase();
  if (s.includes('chimie') && !s.includes('physique')) return 'Chimie';
  if (s.includes('physique')) return 'Physique';
  if (s.includes('math')) return 'Maths';
  return subject || 'Maths';
};

const TeacherCoursesTab = ({
  courses = [],
  managingCourseId,
  setManagingCourseId,
  onOpenCreateCourse,
  onEditCourse,
  onTogglePublishCourse,
  onDeleteCourse,
  // Chapters
  newChapterTitle,
  setNewChapterTitle,
  newChapterIsFree,
  setNewChapterIsFree,
  handleAddChapter,
  editingChapterId,
  editingChapterTitle,
  setEditingChapterId,
  setEditingChapterTitle,
  handleSaveChapterRename,
  handleToggleChapterLock,
  handleToggleChapterFree,
  handleMoveChapter,
  handleDeleteChapter,
  // Lessons
  openLessonModal,
  handleMoveLesson,
  handleDeleteLesson,
}) => {
  const [courseSearch, setCourseSearch] = useState('');
  const [openMenuLessonId, setOpenMenuLessonId] = useState(null);
  const [showAddChapterBar, setShowAddChapterBar] = useState(false);
  // Par défaut, seul le Chapitre 1 (index 0) est ouvert ; on stocke les surcharges par chapterId
  const [chapterOpenOverrides, setChapterOpenOverrides] = useState({});

  const sourceCourses = USE_MOCK ? MOCK_COURSES : courses;

  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    if (!q) return sourceCourses;
    return sourceCourses.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        c.subject?.toLowerCase().includes(q) ||
        c.level?.toLowerCase().includes(q)
    );
  }, [sourceCourses, courseSearch]);

  const selectedCourse = useMemo(() => {
    return (
      filteredCourses.find((c) => c._id === managingCourseId) ||
      sourceCourses.find((c) => c._id === managingCourseId) ||
      filteredCourses[0] ||
      null
    );
  }, [filteredCourses, sourceCourses, managingCourseId]);

  const activeCourseId = selectedCourse?._id || null;

  const totalLessonsCount = useMemo(() => {
    if (!selectedCourse) return 0;
    return (selectedCourse.chapters || []).reduce(
      (sum, ch) => sum + (ch.lessons?.length || 0),
      0
    );
  }, [selectedCourse]);

  const isChapterOpen = (chapterId, cIdx) => {
    if (Object.prototype.hasOwnProperty.call(chapterOpenOverrides, chapterId)) {
      return chapterOpenOverrides[chapterId];
    }
    return cIdx === 0;
  };

  const handleToggleChapter = (chapterId, cIdx) => {
    const current = isChapterOpen(chapterId, cIdx);
    setChapterOpenOverrides((prev) => ({ ...prev, [chapterId]: !current }));
  };

  const getLessonIconBox = (type) => {
    switch (type) {
      case 'pdf':
        return (
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        );
      case 'meet':
      case 'jitsi':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4" />
          </div>
        );
      case 'text':
        return (
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <FileEdit className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
            <PlaySquare className="w-4 h-4" />
          </div>
        );
    }
  };

  const getLessonSubtitle = (lesson) => {
    if (lesson.subtitle) return lesson.subtitle;
    if (lesson.contentType === 'pdf') return 'PDF sommaire';
    if (lesson.contentType === 'meet' || lesson.contentType === 'jitsi') {
      return 'Séance en direct';
    }
    return '';
  };

  return (
    <div className="space-y-5 animate-fade-slide-up">
      {/* En-tête : Titre gros et gras + champ de recherche arrondi à droite */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-[26px] sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
          Mes Cours &amp; Leçons
        </h1>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            placeholder="Rechercher un élève, un cours, un TP..."
            className="w-full h-10 pl-10 pr-8 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2563eb] transition"
          />
          {courseSearch && (
            <button
              type="button"
              onClick={() => setCourseSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grille Master-Detail (~40% gauche / ~60% droite) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* COLONNE GAUCHE (5 cols ~ 42%) : Cartes de cours */}
        <div className="lg:col-span-5 space-y-3">
          {filteredCourses.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-8 text-center">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Aucun cours trouvé</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Créez votre première formation ou ajustez les filtres.
              </p>
              <button
                type="button"
                onClick={onOpenCreateCourse}
                className="px-4 py-2 rounded-lg bg-[#2563eb] text-white text-xs font-bold cursor-pointer"
              >
                + Créer un cours
              </button>
            </div>
          ) : (
            filteredCourses.map((course) => {
              const isSelected = activeCourseId === course._id;
              const physics = isPhysicsSubject(course.subject);
              const published = course.isPublished !== false;

              return (
                <div
                  key={course._id}
                  onClick={() => {
                    setManagingCourseId(course._id);
                    setOpenMenuLessonId(null);
                  }}
                  className={`bg-white rounded-xl p-4 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#2563eb] ring-1 ring-[#2563eb]/20 shadow-sm'
                      : 'border-slate-200/80 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Miniature sombre avec mini-titre + badge unique */}
                    <div
                      className={`w-16 h-16 rounded-lg flex flex-col items-center justify-between p-1.5 shrink-0 text-white overflow-hidden ${
                        physics ? 'bg-[#0f5132]' : 'bg-[#163a5f]'
                      }`}
                    >
                      <span className="text-[8px] font-semibold leading-tight text-center line-clamp-2 text-white/90 pt-0.5">
                        {course.title}
                      </span>
                      {published ? (
                        <span className="w-full text-center py-0.5 rounded bg-[#059669] text-[9px] font-bold leading-none text-white">
                          Publié
                        </span>
                      ) : (
                        <span className="w-full text-center py-0.5 rounded bg-slate-200 text-[9px] font-bold leading-none text-slate-700">
                          Brouillon
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-bold text-slate-900 truncate">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatLevel(course.level)} • {formatShortSubject(course.subject)}
                      </p>
                      <p className="text-sm font-extrabold text-slate-900 tabular-nums mt-1.5">
                        {course.isFree
                          ? 'Gratuit'
                          : `${Number(course.price || 0).toLocaleString('fr-FR')} F CFA`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* COLONNE DROITE (7 cols ~ 58%) : Programme du cours */}
        <div className="lg:col-span-7">
          {!selectedCourse ? (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-12 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">
                Sélectionnez un cours à gauche pour gérer son programme
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
              {/* Titre du programme + Actions discrètes */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base sm:text-[17px] font-bold text-slate-900">
                  Programme du cours : {selectedCourse.title} ({totalLessonsCount} leçon
                  {totalLessonsCount > 1 ? 's' : ''})
                </h2>

                {!USE_MOCK && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowAddChapterBar((v) => !v)}
                      title="Ajouter un chapitre"
                      className="h-8 px-2.5 rounded-lg border border-slate-200 hover:border-[#2563eb] text-xs font-semibold text-slate-600 hover:text-[#2563eb] inline-flex items-center gap-1 transition cursor-pointer"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Chapitre</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditCourse(selectedCourse)}
                      title="Modifier le cours"
                      className="h-8 w-8 rounded-lg border border-slate-200 hover:border-[#2563eb] text-slate-600 hover:text-[#2563eb] inline-flex items-center justify-center transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onTogglePublishCourse(selectedCourse)}
                      title={
                        selectedCourse.isPublished !== false
                          ? 'Passer en brouillon'
                          : 'Publier'
                      }
                      className="h-8 w-8 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-600 inline-flex items-center justify-center transition cursor-pointer"
                    >
                      {selectedCourse.isPublished !== false ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <Link
                      to={`/courses/${selectedCourse._id}`}
                      title="Aperçu élève"
                      className="h-8 w-8 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-600 inline-flex items-center justify-center transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDeleteCourse(selectedCourse._id)}
                      title="Supprimer le cours"
                      className="h-8 w-8 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 inline-flex items-center justify-center transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Formulaire d'ajout de chapitre (dépliable pour garder la composition épurée) */}
              {showAddChapterBar && !USE_MOCK && (
                <form
                  onSubmit={(e) => {
                    if (managingCourseId !== selectedCourse._id) {
                      setManagingCourseId(selectedCourse._id);
                    }
                    handleAddChapter(e);
                  }}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80"
                >
                  <input
                    type="text"
                    value={newChapterTitle}
                    onChange={(e) => {
                      if (managingCourseId !== selectedCourse._id) {
                        setManagingCourseId(selectedCourse._id);
                      }
                      setNewChapterTitle(e.target.value);
                    }}
                    placeholder="Titre du chapitre (ex: Chapitre 3 : Équations différentielles)"
                    className="flex-1 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#2563eb]"
                  />
                  <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 px-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newChapterIsFree}
                      onChange={(e) => setNewChapterIsFree(e.target.checked)}
                      className="rounded border-slate-300 text-[#059669] focus:ring-[#059669]"
                    />
                    <span>Gratuit</span>
                  </label>
                  <button
                    type="submit"
                    className="h-9 px-3.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold cursor-pointer shrink-0"
                  >
                    Ajouter
                  </button>
                </form>
              )}

              {/* Liste des chapitres */}
              {(!selectedCourse.chapters || selectedCourse.chapters.length === 0) ? (
                <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/40">
                  <p className="text-sm font-semibold text-slate-600">
                    Aucun chapitre dans ce cours
                  </p>
                  {!USE_MOCK && (
                    <button
                      type="button"
                      onClick={() => setShowAddChapterBar(true)}
                      className="mt-3 h-9 px-4 rounded-lg bg-[#2563eb] text-white text-xs font-bold cursor-pointer"
                    >
                      + Ajouter un chapitre
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedCourse.chapters.map((chapter, cIdx) => {
                    const open = isChapterOpen(chapter._id, cIdx);
                    const lessons = chapter.lessons || [];
                    const isEditingName = editingChapterId === chapter._id;

                    return (
                      <div key={chapter._id} className="space-y-2.5">
                        {/* Barre Chapitre : bleu clair + bordure bleue quand ouvert, blanc/gris quand fermé */}
                        <div
                          onClick={() => {
                            if (!isEditingName) handleToggleChapter(chapter._id, cIdx);
                          }}
                          className={`px-4 py-3 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition ${
                            open
                              ? 'bg-[#eff6ff] border-[#2563eb]/50'
                              : 'bg-slate-50/80 border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {isEditingName ? (
                              <div
                                className="flex items-center gap-1.5 flex-1 max-w-md"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  value={editingChapterTitle}
                                  onChange={(e) => setEditingChapterTitle(e.target.value)}
                                  className="h-8 px-2.5 rounded-lg border border-[#2563eb] bg-white text-xs font-bold text-slate-900 flex-1 focus:outline-none"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSaveChapterRename(selectedCourse._id, chapter._id)
                                  }
                                  className="p-1.5 rounded-lg bg-[#059669] text-white cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingChapterId(null);
                                    setEditingChapterTitle('');
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-200 text-slate-600 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm font-bold text-slate-900 truncate">
                                {chapter.title}
                              </span>
                            )}
                          </div>

                          <div
                            className="flex items-center gap-1 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {!USE_MOCK && open && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleChapterFree(selectedCourse._id, chapter)
                                  }
                                  title={chapter.isFree ? 'Passer en payant' : 'Rendre gratuit'}
                                  className="p-1 rounded hover:bg-white/80 text-slate-500 cursor-pointer"
                                >
                                  {chapter.isFree ? (
                                    <Unlock className="w-3.5 h-3.5 text-[#059669]" />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingChapterId(chapter._id);
                                    setEditingChapterTitle(chapter.title);
                                  }}
                                  title="Renommer le chapitre"
                                  className="p-1 rounded hover:bg-white/80 text-slate-500 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={cIdx === 0}
                                  onClick={() => handleMoveChapter(selectedCourse, cIdx, -1)}
                                  title="Monter"
                                  className="p-1 rounded hover:bg-white/80 text-slate-400 disabled:opacity-30 cursor-pointer"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={cIdx === selectedCourse.chapters.length - 1}
                                  onClick={() => handleMoveChapter(selectedCourse, cIdx, 1)}
                                  title="Descendre"
                                  className="p-1 rounded hover:bg-white/80 text-slate-400 disabled:opacity-30 cursor-pointer"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteChapter(selectedCourse._id, chapter)
                                  }
                                  title="Supprimer le chapitre"
                                  className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => handleToggleChapter(chapter._id, cIdx)}
                              className="p-1 text-slate-600 cursor-pointer"
                            >
                              {open ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Contenu du chapitre ouvert */}
                        {open && (
                          <div className="space-y-3 pl-1 pr-1 pb-1">
                            {lessons.length === 0 ? (
                              <p className="text-xs text-slate-400 text-center py-3">
                                Aucune leçon dans ce chapitre.
                              </p>
                            ) : (
                              <div className="divide-y divide-slate-100">
                                {lessons.map((lesson, lIdx) => {
                                  const isPreviewFree =
                                    Boolean(lesson.isFree) ||
                                    Boolean(chapter.isFree) ||
                                    Boolean(selectedCourse.isFree);
                                  const subtitle = getLessonSubtitle(lesson);
                                  const showPriceInBadge =
                                    !isPreviewFree &&
                                    lesson.contentType === 'pdf' &&
                                    Number(selectedCourse.price || 0) > 0;

                                  return (
                                    <div
                                      key={lesson._id}
                                      className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                                    >
                                      <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <span className="text-xs font-semibold text-slate-500 w-6 shrink-0 tabular-nums">
                                          {cIdx + 1}.{lIdx + 1}
                                        </span>
                                        {getLessonIconBox(lesson.contentType)}
                                        <div className="min-w-0">
                                          <p className="text-[14px] font-semibold text-slate-900 truncate">
                                            {lesson.title}
                                          </p>
                                          {subtitle && (
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                              {subtitle}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2.5 shrink-0 relative">
                                        {isPreviewFree ? (
                                          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-[#059669] text-[11px] font-semibold">
                                            Aperçu Gratuit
                                          </span>
                                        ) : (
                                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1">
                                            <Lock className="w-3 h-3 text-slate-500" />
                                            <span>
                                              {showPriceInBadge
                                                ? `Payant (${Number(
                                                    selectedCourse.price
                                                  ).toLocaleString('fr-FR')} F CFA)`
                                                : 'Payant'}
                                            </span>
                                          </span>
                                        )}

                                        {/* Menu ⋯ avec toutes les actions existantes */}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setOpenMenuLessonId((prev) =>
                                              prev === lesson._id ? null : lesson._id
                                            )
                                          }
                                          className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
                                          title="Actions de la leçon"
                                        >
                                          <MoreHorizontal className="w-4 h-4" />
                                        </button>

                                        {openMenuLessonId === lesson._id && !USE_MOCK && (
                                          <>
                                            <div
                                              className="fixed inset-0 z-20"
                                              onClick={() => setOpenMenuLessonId(null)}
                                            />
                                            <div className="absolute right-0 top-8 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 text-xs font-semibold">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setOpenMenuLessonId(null);
                                                  openLessonModal(
                                                    selectedCourse._id,
                                                    chapter._id,
                                                    lesson
                                                  );
                                                }}
                                                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                                              >
                                                <Edit3 className="w-3.5 h-3.5 text-[#2563eb]" />
                                                <span>Modifier</span>
                                              </button>
                                              <button
                                                type="button"
                                                disabled={lIdx === 0}
                                                onClick={() => {
                                                  setOpenMenuLessonId(null);
                                                  handleMoveLesson(
                                                    selectedCourse._id,
                                                    chapter,
                                                    lIdx,
                                                    -1
                                                  );
                                                }}
                                                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 disabled:opacity-40 flex items-center gap-2 cursor-pointer"
                                              >
                                                <ChevronUp className="w-3.5 h-3.5" />
                                                <span>Monter</span>
                                              </button>
                                              <button
                                                type="button"
                                                disabled={lIdx === lessons.length - 1}
                                                onClick={() => {
                                                  setOpenMenuLessonId(null);
                                                  handleMoveLesson(
                                                    selectedCourse._id,
                                                    chapter,
                                                    lIdx,
                                                    1
                                                  );
                                                }}
                                                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 disabled:opacity-40 flex items-center gap-2 cursor-pointer"
                                              >
                                                <ChevronDown className="w-3.5 h-3.5" />
                                                <span>Descendre</span>
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setOpenMenuLessonId(null);
                                                  handleDeleteLesson(
                                                    selectedCourse._id,
                                                    chapter._id,
                                                    lesson
                                                  );
                                                }}
                                                className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Supprimer</span>
                                              </button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Bouton bleu pleine largeur + Ajouter une leçon */}
                            <button
                              type="button"
                              onClick={() => {
                                if (USE_MOCK) return;
                                openLessonModal(selectedCourse._id, chapter._id, null);
                              }}
                              className="w-full h-10 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Ajouter une leçon</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherCoursesTab;
