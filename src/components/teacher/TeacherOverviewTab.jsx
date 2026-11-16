import React, { useMemo } from 'react';
import { Users, BookOpen, MessageSquare } from 'lucide-react';
import { formatLevel } from '../CourseCard';

const USE_MOCK = false; // TODO: supprimer

const MOCK_OVERVIEW = {
  monthlyRevenue: 285000,
  growthPct: 18,
  studentsCount: 124,
  publishedCoursesCount: 8,
  pendingMessagesCount: 3,
  courses: [
    {
      _id: 'mock-c1',
      title: 'Maîtriser les Intégrales',
      level: 'TS',
      subject: 'Mathématiques',
      price: 10000,
      isFree: false,
      isPublished: true,
      enrolledCount: 48,
    },
    {
      _id: 'mock-c2',
      title: 'Mécanique & Lois de Newton',
      level: 'TS',
      subject: 'Physique-Chimie',
      price: 8000,
      isFree: false,
      isPublished: true,
      enrolledCount: 35,
    },
    {
      _id: 'mock-c3',
      title: 'Équations & Fonctions',
      level: '3ème',
      subject: 'Mathématiques',
      price: 5000,
      isFree: false,
      isPublished: true,
      enrolledCount: 41,
    },
    {
      _id: 'mock-c4',
      title: 'Cinétique Chimique & Titrage',
      level: '1ère S',
      subject: 'Physique-Chimie',
      price: 7500,
      isFree: false,
      isPublished: false,
      enrolledCount: 0,
    },
  ],
  transactions: [
    {
      _id: 'mock-t1',
      studentName: 'Fatou Diop',
      courseTitle: 'Maîtriser les Intégrales',
      amount: 10000,
      method: 'wave',
    },
    {
      _id: 'mock-t2',
      studentName: "Kouamé N'Guessan",
      courseTitle: 'Mécanique & Lois de Newton',
      amount: 8000,
      method: 'orange',
    },
    {
      _id: 'mock-t3',
      studentName: 'Aïssatou Sow',
      courseTitle: 'Équations & Fonctions',
      amount: 5000,
      method: 'wave',
    },
    {
      _id: 'mock-t4',
      studentName: 'Moussa Traoré',
      courseTitle: 'Maîtriser les Intégrales',
      amount: 10000,
      method: 'wave',
    },
  ],
};

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

const WaveBadge = () => (
  <span
    title="Wave"
    className="w-7 h-7 rounded-md bg-sky-100 border border-sky-200 flex items-center justify-center shrink-0"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 14c2-4 4-4 6 0s4 4 6 0 4-4 6 0"
        stroke="#0284c7"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

const OrangeMoneyBadge = () => (
  <span
    title="Orange Money"
    className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center shrink-0"
  >
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 17L17 6M17 6H9M17 6V14"
        stroke="#f97316"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

const TeacherOverviewTab = ({
  courses = [],
  students = [],
  discussions = [],
  metrics,
  onNavigateTab,
  onSelectCourse,
  onEditCourse,
}) => {
  const now = useMemo(() => new Date(), []);

  const revenueStats = useMemo(() => {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    let thisMonth = 0;
    let prevMonth = 0;

    students.forEach((sub) => {
      if (sub.status === 'suspended') return;
      const amt = Number(sub.amount || 0);
      const d = new Date(sub.createdAt || sub.startDate || now);
      if (d >= startOfMonth) thisMonth += amt;
      else if (d >= startOfPrevMonth && d < startOfMonth) prevMonth += amt;
    });

    const growthPct =
      prevMonth > 0
        ? Math.round(((thisMonth - prevMonth) / prevMonth) * 100)
        : thisMonth > 0
        ? 100
        : 0;

    return { thisMonth, growthPct };
  }, [students, now]);

  const enrolledByCourse = useMemo(() => {
    const map = {};
    students.forEach((s) => {
      const cId = String(s.course?._id || s.course || '');
      if (!cId) return;
      map[cId] = (map[cId] || 0) + 1;
    });
    return map;
  }, [students]);

  const realCoursesList = useMemo(() => {
    return [...courses]
      .sort((a, b) => (enrolledByCourse[b._id] || 0) - (enrolledByCourse[a._id] || 0))
      .slice(0, 5)
      .map((c) => ({
        ...c,
        enrolledCount: enrolledByCourse[c._id] || 0,
      }));
  }, [courses, enrolledByCourse]);

  const realTransactions = useMemo(() => {
    return [...students]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.startDate || 0) -
          new Date(a.createdAt || a.startDate || 0)
      )
      .slice(0, 4)
      .map((sub) => {
        const m = String(sub.paymentMethod || 'wave').toLowerCase();
        return {
          _id: sub._id,
          studentName: sub.student?.name || 'Élève',
          courseTitle: sub.course?.title || 'Formation',
          amount: Number(sub.amount || 0),
          method: m.includes('orange') || m.includes('om') ? 'orange' : 'wave',
        };
      });
  }, [students]);

  const uniqueStudentsCount = useMemo(() => {
    const ids = new Set();
    students.forEach((s) => {
      const id = String(s.student?._id || s.student?.email || s._id);
      ids.add(id);
    });
    return ids.size;
  }, [students]);

  const unansweredCount =
    metrics?.unansweredQuestions?.length ??
    discussions.filter((d) => !d.isResolved && (!d.replies || d.replies.length === 0))
      .length;

  const publishedCount =
    metrics?.publishedCourses ?? courses.filter((c) => c.isPublished !== false).length;

  const displayRevenue = USE_MOCK ? MOCK_OVERVIEW.monthlyRevenue : revenueStats.thisMonth;
  const displayGrowth = USE_MOCK ? MOCK_OVERVIEW.growthPct : revenueStats.growthPct;
  const displayStudents = USE_MOCK ? MOCK_OVERVIEW.studentsCount : uniqueStudentsCount;
  const displayPublished = USE_MOCK ? MOCK_OVERVIEW.publishedCoursesCount : publishedCount;
  const displayMessages = USE_MOCK ? MOCK_OVERVIEW.pendingMessagesCount : unansweredCount;
  const displayCourses = USE_MOCK ? MOCK_OVERVIEW.courses : realCoursesList;
  const displayTransactions = USE_MOCK ? MOCK_OVERVIEW.transactions : realTransactions;

  return (
    <div className="space-y-6 animate-fade-slide-up">
      {/* 1. 4 CARTES KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 : Revenus du mois */}
        <button
          type="button"
          onClick={() => onNavigateTab('revenue')}
          className="text-left uiverse-glow-card p-6 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-700">
              Revenus du mois
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                displayGrowth >= 0
                  ? 'bg-emerald-50 text-[#059669]'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {displayGrowth >= 0 ? `+${displayGrowth}%` : `${displayGrowth}%`}
            </span>
          </div>
          <div className="mt-4 flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[28px] font-bold text-slate-900 tabular-nums leading-none">
                {displayRevenue.toLocaleString('fr-FR')}
              </span>
              <span className="text-base font-medium text-slate-700">F CFA</span>
            </div>
            <svg width="40" height="24" viewBox="0 0 52 22" className="shrink-0">
              <path
                d="M2 19 C 10 17, 15 11, 22 13 C 30 15, 36 7, 50 4"
                fill="none"
                stroke="#059669"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </button>

        {/* KPI 2 : Élèves inscrits */}
        <button
          type="button"
          onClick={() => onNavigateTab('students')}
          className="text-left uiverse-glow-card p-6 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-700">
              Élèves inscrits
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center">
              <Users className="w-[18px] h-[18px]" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-slate-900 tabular-nums leading-none">
              {displayStudents}
            </span>
            <span className="text-xl font-medium text-slate-700">
              élève{displayStudents > 1 ? 's' : ''}
            </span>
          </div>
        </button>

        {/* KPI 3 : Cours publiés */}
        <button
          type="button"
          onClick={() => onNavigateTab('courses')}
          className="text-left uiverse-glow-card p-6 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-700">
              Cours publiés
            </span>
            <BookOpen className="w-[18px] h-[18px] text-[#2563eb]" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-slate-900 tabular-nums leading-none">
              {displayPublished}
            </span>
            <span className="text-xl font-medium text-slate-700">
              formation{displayPublished > 1 ? 's' : ''}
            </span>
          </div>
        </button>

        {/* KPI 4 : Questions en attente */}
        <button
          type="button"
          onClick={() => onNavigateTab('qa')}
          className="text-left uiverse-glow-card p-6 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-700">
              Questions en attente
            </span>
            <MessageSquare className="w-[18px] h-[18px] text-amber-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-slate-900 tabular-nums leading-none">
              {displayMessages}
            </span>
            <span className="text-xl font-medium text-slate-700">
              message{displayMessages > 1 ? 's' : ''}
            </span>
          </div>
        </button>
      </div>

      {/* 2. GRILLE PRINCIPALE : MES COURS EN LIGNE + DERNIÈRES VENTES & RETRAITS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Colonne gauche (8 cols) : Mes cours en ligne */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6 sm:p-7">
          <h2 className="text-xl font-semibold text-slate-900 mb-5">
            Mes cours en ligne
          </h2>

          {displayCourses.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/40">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">
                Aucun cours pour ce filtre
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Ajustez le niveau dans l'en-tête ou cliquez sur « + Créer un cours ».
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200/80">
              {displayCourses.map((course) => {
                const physics = isPhysicsSubject(course.subject);
                const published = course.isPublished !== false;

                return (
                  <div
                    key={course._id}
                    className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Vignette carrée sombre avec titre miniature + badge Publié intégré */}
                      <div
                        className={`w-14 h-14 rounded-lg flex flex-col items-center justify-between p-1 shrink-0 text-white overflow-hidden ${
                          physics ? 'bg-[#0f5132]' : 'bg-[#163a5f]'
                        }`}
                      >
                        <span className="text-[8px] font-semibold leading-tight text-center line-clamp-2 text-white/90 pt-0.5">
                          {course.title}
                        </span>
                        <span
                          className={`w-full text-center py-0.5 rounded text-[9px] font-bold leading-none ${
                            published ? 'bg-[#059669]' : 'bg-slate-500'
                          }`}
                        >
                          {published ? 'Publié' : 'Brouillon'}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-900 truncate">
                          {course.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-0.5">
                          {formatLevel(course.level)} • {formatShortSubject(course.subject)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0">
                      <span className="text-sm font-medium text-slate-800 tabular-nums">
                        {course.isFree
                          ? 'Gratuit'
                          : `${Number(course.price || 0).toLocaleString('fr-FR')} F CFA`}
                      </span>

                      {published ? (
                        <>
                          <span className="text-sm text-slate-700 inline-flex items-center gap-1.5 min-w-[88px]">
                            <Users className="w-4 h-4 text-slate-500" />
                            <span>
                              {course.enrolledCount} élève{course.enrolledCount > 1 ? 's' : ''}
                            </span>
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              if (USE_MOCK) return;
                              if (onSelectCourse) onSelectCourse(course._id);
                              else if (onEditCourse) onEditCourse(course);
                            }}
                            className="h-10 px-5 rounded-lg border border-slate-300 hover:border-[#2563eb] bg-white text-sm font-medium text-slate-800 hover:text-[#2563eb] transition cursor-pointer"
                          >
                            Éditer
                          </button>
                        </>
                      ) : (
                        <span className="px-3.5 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-sm font-medium">
                          Brouillon
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Colonne droite (4 cols) : Dernières ventes & Retraits */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-5">
              Dernières ventes &amp; Retraits
            </h2>

            {displayTransactions.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/40">
                <p className="text-xs font-medium text-slate-500">
                  Aucune transaction enregistrée pour le moment.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200/80">
                {displayTransactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-slate-900 truncate">
                        {tx.studentName}
                      </p>
                      <p className="text-[13px] text-slate-600 truncate mt-0.5">
                        {tx.courseTitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-sm font-medium text-[#059669] tabular-nums">
                        +{tx.amount.toLocaleString('fr-FR')} F CFA
                      </span>
                      {tx.method === 'orange' ? <OrangeMoneyBadge /> : <WaveBadge />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('revenue')}
            className="mt-6 w-full h-12 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold transition cursor-pointer"
          >
            Retirer mes gains
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherOverviewTab;