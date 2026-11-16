import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  MessageSquare,
  Mail,
  CalendarPlus,
  Ban,
  TrendingUp,
  X,
} from 'lucide-react';
import { formatLevel } from '../CourseCard';
import { matchesClassLevel } from '../../utils/education';

const USE_MOCK = false; // TODO: supprimer

const MOCK_STUDENTS = [
  {
    _id: 'ms-1',
    student: { name: 'Fatou Diop', email: 'fatou.diop@exemple.sn', level: 'TS' },
    course: { _id: 'mc-1', title: 'Maîtriser les Intégrales', level: 'TS' },
    amount: 10000,
    status: 'active',
    expiresAt: '2027-06-30T00:00:00Z',
    mockProgress: 85,
  },
  {
    _id: 'ms-2',
    student: { name: 'Moussa Traoré', email: 'moussa.traore@exemple.sn', level: '1ère S' },
    course: { _id: 'mc-2', title: 'Mécanique & Lois de Newton', level: '1ère S' },
    amount: 8000,
    status: 'active',
    expiresAt: '2027-06-30T00:00:00Z',
    mockProgress: 60,
  },
  {
    _id: 'ms-3',
    student: { name: 'Aïssatou Sow', email: 'aissatou.sow@exemple.sn', level: '1ère S' },
    course: { _id: 'mc-3', title: 'Équations & Fonctions', level: '1ère S' },
    amount: 5000,
    status: 'active',
    expiresAt: '2027-06-30T00:00:00Z',
    mockProgress: 100,
  },
  {
    _id: 'ms-4',
    student: { name: 'Cheikh Ndiaye', email: 'cheikh.ndiaye@exemple.sn', level: '3ème' },
    course: { _id: 'mc-3', title: 'Équations & Fonctions', level: '3ème' },
    amount: 5000,
    status: 'active',
    expiresAt: '2027-06-30T00:00:00Z',
    mockProgress: 75,
  },
  {
    _id: 'ms-5',
    student: { name: 'Mariama Ba', email: 'mariama.ba@exemple.sn', level: '3ème' },
    course: { _id: 'mc-3', title: 'Équations & Fonctions', level: '3ème' },
    amount: 5000,
    status: 'active',
    expiresAt: '2027-06-30T00:00:00Z',
    mockProgress: 90,
  },
];

const TeacherStudentsTab = ({
  students = [],
  courses = [],
  quizResults = [],
  unansweredQuestionsCount = 0,
  onToggleStudentStatus,
  onOpenRemindModal,
  onExtendStudentSubscription,
  formatDateShort,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, TS, 1ère S, 3ème, expired, suspended
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const effectiveStudents = USE_MOCK ? MOCK_STUDENTS : students;
  const effectiveQuestionsCount = USE_MOCK ? 3 : unansweredQuestionsCount;
  const now = useMemo(() => new Date(), []);

  const summary = useMemo(() => {
    if (USE_MOCK) {
      return {
        total: 124,
        active: 118,
        expiringSoon: 4,
        expired: 2,
        suspended: 0,
        avgCompletion: 76,
      };
    }

    let active = 0;
    let expiringSoon = 0;
    let expired = 0;
    let suspended = 0;
    let totalProgress = 0;

    effectiveStudents.forEach((s) => {
      const exp = new Date(s.expiresAt);
      const isExp = exp <= now;
      const isSuspended = s.status === 'suspended';
      const isActive = s.status === 'active' && !isExp;

      if (isSuspended) suspended++;
      else if (isActive) {
        active++;
        const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7 && diffDays >= 0) expiringSoon++;
      } else {
        expired++;
      }

      const courseObj =
        courses.find((c) => c._id === (s.course?._id || s.course)) || s.course;
      const totalLessons =
        (courseObj?.chapters || []).reduce(
          (sum, ch) => sum + (ch.lessons?.length || 0),
          0
        ) || 0;
      const doneCount = Array.isArray(s.completedLessons)
        ? s.completedLessons.length
        : 0;
      const pct =
        typeof s.mockProgress === 'number'
          ? s.mockProgress
          : totalLessons > 0
            ? Math.min(100, Math.round((doneCount / totalLessons) * 100))
            : 0;
      totalProgress += pct;
    });

    const avgCompletion =
      effectiveStudents.length > 0
        ? Math.round(totalProgress / effectiveStudents.length)
        : 0;

    return {
      total: effectiveStudents.length,
      active,
      expiringSoon,
      expired,
      suspended,
      avgCompletion,
    };
  }, [effectiveStudents, courses, now]);

  const filteredStudents = useMemo(() => {
    return effectiveStudents.filter((sub) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        sub.student?.name?.toLowerCase().includes(q) ||
        sub.student?.email?.toLowerCase().includes(q) ||
        sub.student?.phone?.toLowerCase().includes(q) ||
        sub.course?.title?.toLowerCase().includes(q) ||
        sub.transactionId?.toLowerCase().includes(q);

      const matchCourse =
        courseFilter === 'all' ||
        String(sub.course?._id || sub.course) === String(courseFilter);

      const exp = new Date(sub.expiresAt);
      const isExp = exp <= now;
      const isSuspended = sub.status === 'suspended';
      const isActive = sub.status === 'active' && !isExp;
      const courseObj =
        courses.find((c) => c._id === (sub.course?._id || sub.course)) || sub.course;
      const studentLevel = courseObj?.level || sub.student?.level || '';

      let matchStatus = true;
      if (statusFilter === 'active') matchStatus = isActive;
      else if (statusFilter === 'TS') matchStatus = matchesClassLevel(studentLevel, 'TS');
      else if (statusFilter === '1ère S') matchStatus = matchesClassLevel(studentLevel, '1ère S');
      else if (statusFilter === '2nde S') matchStatus = matchesClassLevel(studentLevel, '2nde S');
      else if (statusFilter === '3ème') matchStatus = matchesClassLevel(studentLevel, '3ème');
      else if (statusFilter === '4ème') matchStatus = matchesClassLevel(studentLevel, '4ème');
      else if (statusFilter === 'expired') matchStatus = isExp && !isSuspended;
      else if (statusFilter === 'suspended') matchStatus = isSuspended;

      return matchSearch && matchCourse && matchStatus;
    });
  }, [effectiveStudents, courses, search, courseFilter, statusFilter, now]);

  return (
    <div className="space-y-5 animate-fade-slide-up">
      {/* En-tête + Recherche */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
          Élèves inscrits
        </h1>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un élève par nom ou email..."
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

      {/* Onglets de filtre + Sélecteur de cours */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-5">
          {[
            { id: 'all', label: `Tous (${summary.total})` },
            { id: 'active', label: 'Actifs' },
            { id: 'TS', label: 'Terminale S' },
            { id: '1ère S', label: '1ère S' },
            { id: '2nde S', label: '2nde S' },
            { id: '3ème', label: '3ème' },
            { id: '4ème', label: '4ème' },
            ...(summary.expired > 0 ? [{ id: 'expired', label: `Expirés (${summary.expired})` }] : []),
            ...(summary.suspended > 0 ? [{ id: 'suspended', label: `Bloqués (${summary.suspended})` }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`pb-2.5 -mb-[13px] text-[13px] font-bold border-b-2 transition cursor-pointer ${
                statusFilter === tab.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {courses.length > 0 && (
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#2563eb] cursor-pointer"
          >
            <option value="all">Tous les cours</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="uiverse-glow-card p-5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Total élèves :{' '}
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums ml-1">
              {summary.total}
            </span>
          </p>
        </div>

        <div className="uiverse-glow-card p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600">
                Taux de complétion moyen :
              </p>
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums leading-tight">
                {summary.avgCompletion}%
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="uiverse-glow-card p-5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600">
              Questions en attente :
            </p>
            <p className="text-2xl font-extrabold text-slate-900 tabular-nums leading-tight">
              {effectiveQuestionsCount}
            </p>
          </div>
        </div>
      </div>

      {/* Tableau des élèves inscrits */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-5 sm:p-6">
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/40 py-12 px-4 text-center">
              <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                {effectiveStudents.length === 0
                  ? 'Aucun élève inscrit à vos cours pour le moment'
                  : 'Aucun élève trouvé'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {effectiveStudents.length === 0
                  ? "Dès qu'un élève rejoint l'un de vos cours, sa progression et son statut de paiement apparaîtront ici."
                  : 'Ajustez votre recherche ou vos filtres pour afficher d’autres élèves.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500">
                  <th className="py-3.5 px-5">Élève</th>
                  <th className="py-3.5 px-4">Niveau</th>
                  <th className="py-3.5 px-4">Cours achetés</th>
                  <th className="py-3.5 px-4">Progression</th>
                  <th className="py-3.5 px-4">Statut paiement</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {filteredStudents.map((sub) => {
                  const exp = new Date(sub.expiresAt);
                  const isExp = exp <= now;
                  const isSuspended = sub.status === 'suspended';
                  const isActive = sub.status === 'active' && !isExp;

                  const courseObj =
                    courses.find((c) => c._id === (sub.course?._id || sub.course)) ||
                    sub.course;
                  const totalLessons =
                    (courseObj?.chapters || []).reduce(
                      (sum, ch) => sum + (ch.lessons?.length || 0),
                      0
                    ) || 0;
                  const doneCount = Array.isArray(sub.completedLessons)
                    ? sub.completedLessons.length
                    : 0;
                  const progressPct =
                    typeof sub.mockProgress === 'number'
                      ? sub.mockProgress
                      : totalLessons > 0
                        ? Math.min(100, Math.round((doneCount / totalLessons) * 100))
                        : 0;

                  const studentResults = quizResults.filter(
                    (qr) =>
                      String(qr.student?._id || qr.student) ===
                        String(sub.student?._id || sub.student) &&
                      String(qr.quiz?.course?._id || qr.quiz?.course) ===
                        String(sub.course?._id || sub.course)
                  );
                  const avgScore =
                    studentResults.length > 0
                      ? Math.round(
                          studentResults.reduce(
                            (sum, r) =>
                              sum + (r.score / Math.max(1, r.totalQuestions)) * 100,
                            0
                          ) / studentResults.length
                        )
                      : null;

                  return (
                    <tr
                      key={sub._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Élève */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            {sub.student?.avatar ? (
                              <img
                                src={sub.student.avatar}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-slate-600 text-xs">
                                {sub.student?.name?.charAt(0)?.toUpperCase() || 'E'}
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-slate-900 truncate">
                            {sub.student?.name || 'Élève'}
                          </span>
                        </div>
                      </td>

                      {/* Niveau */}
                      <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {formatLevel(courseObj?.level || sub.student?.level || '—')}
                      </td>

                      {/* Cours achetés */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800">
                          {courseObj?.title || 'Formation'} •{' '}
                          {Number(sub.amount || 0).toLocaleString('fr-FR')} F CFA
                        </span>
                      </td>

                      {/* Progression */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5 min-w-[130px]">
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#2563eb] transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="font-semibold text-slate-700 tabular-nums w-10 text-right text-xs">
                            {progressPct}%
                          </span>
                        </div>
                      </td>

                      {/* Statut paiement */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            isActive
                              ? 'bg-emerald-50 text-[#059669]'
                              : isSuspended
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {isActive ? 'Payé' : isSuspended ? 'Bloqué' : 'Expiré'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedStudent({
                                sub,
                                courseObj,
                                progressPct,
                                avgScore,
                                isActive,
                                isSuspended,
                              })
                            }
                            className="h-8 px-3 rounded-lg border border-slate-200 hover:border-[#2563eb] bg-white text-slate-800 hover:text-[#2563eb] text-xs font-semibold inline-flex items-center transition cursor-pointer"
                          >
                            Voir profil
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenRemindModal(sub)}
                            className="h-8 w-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563eb] inline-flex items-center justify-center transition cursor-pointer"
                            title="Envoyer un message / relance"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Voir Profil Élève */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-100 shadow-2xl space-y-4 relative animate-fade-slide-up">
            <button
              type="button"
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                {selectedStudent.sub.student?.avatar ? (
                  <img
                    src={selectedStudent.sub.student.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-extrabold text-slate-500">
                    {selectedStudent.sub.student?.name?.charAt(0)?.toUpperCase() || 'E'}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-slate-900 truncate">
                  {selectedStudent.sub.student?.name || 'Élève'}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  {selectedStudent.sub.student?.email}
                </p>
                {selectedStudent.sub.student?.phone && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedStudent.sub.student.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 font-semibold block">Formation</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {selectedStudent.courseObj?.title || 'Cours'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 font-semibold block">Montant payé</span>
                <span className="font-bold text-[#059669] mt-0.5 block">
                  {Number(selectedStudent.sub.amount || 0).toLocaleString('fr-FR')} F CFA
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 font-semibold block">Progression</span>
                <span className="font-bold text-[#2563eb] mt-0.5 block">
                  {selectedStudent.progressPct}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 font-semibold block">Moyenne Quiz</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {selectedStudent.avgScore !== null ? `${selectedStudent.avgScore}%` : '—'}
                </span>
              </div>
            </div>

            {selectedStudent.sub.expiresAt && (
              <p className="text-[11px] text-slate-400">
                Expire le {formatDateShort(selectedStudent.sub.expiresAt)}
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              {onExtendStudentSubscription && (
                <button
                  type="button"
                  onClick={() => {
                    const sub = selectedStudent.sub;
                    setSelectedStudent(null);
                    onExtendStudentSubscription(sub);
                  }}
                  className="h-9 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#059669] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>+1 mois</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const sub = selectedStudent.sub;
                  setSelectedStudent(null);
                  onToggleStudentStatus(sub);
                }}
                className={`h-9 px-3 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                  selectedStudent.isSuspended
                    ? 'bg-emerald-50 text-[#059669]'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
                <span>{selectedStudent.isSuspended ? 'Débloquer' : 'Bloquer'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const sub = selectedStudent.sub;
                  setSelectedStudent(null);
                  onOpenRemindModal(sub);
                }}
                className="h-9 px-4 rounded-xl bg-[#2563eb] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Envoyer un message</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudentsTab;
