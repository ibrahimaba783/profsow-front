import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Ban,
  Mail,
  CalendarPlus,
  ArrowUpDown,
  BookOpen,
  Award,
  ChevronRight,
  X,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

const TeacherStudentsTab = ({
  students = [],
  courses = [],
  quizResults = [],
  onToggleStudentStatus,
  onOpenRemindModal,
  onExtendStudentSubscription,
  formatDateShort,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, expiring_soon, expired, suspended
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  const now = useMemo(() => new Date(), []);

  // Summary counts
  const summary = useMemo(() => {
    let active = 0;
    let expiringSoon = 0;
    let expired = 0;
    let suspended = 0;

    students.forEach((s) => {
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
    });

    return { total: students.length, active, expiringSoon, expired, suspended };
  }, [students, now]);

  // Filtering
  const filteredStudents = useMemo(() => {
    return students.filter((sub) => {
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
      const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
      const isExpiringSoon = isActive && diffDays <= 7 && diffDays >= 0;

      let matchStatus = true;
      if (statusFilter === 'active') matchStatus = isActive;
      else if (statusFilter === 'expiring_soon') matchStatus = isExpiringSoon;
      else if (statusFilter === 'expired') matchStatus = isExp && !isSuspended;
      else if (statusFilter === 'suspended') matchStatus = isSuspended;

      return matchSearch && matchCourse && matchStatus;
    });
  }, [students, search, courseFilter, statusFilter, now]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4c3882] to-[#6b5cc4] text-white flex items-center justify-center shadow-sm shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Suivi des Élèves &amp; Abonnements
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#4c3882] font-bold border border-indigo-200">
                {summary.total} élève{summary.total > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Consultez la progression, les scores aux quiz, relancez ou gérez les abonnements de vos élèves.
            </p>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards Statut */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('active')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'active'
              ? 'bg-emerald-50 border-emerald-300 shadow-sm'
              : 'bg-white border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Actifs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{summary.active}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Accès autorisés</p>
        </div>

        <div
          onClick={() => setStatusFilter('expiring_soon')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'expiring_soon'
              ? 'bg-amber-50 border-amber-300 shadow-sm'
              : 'bg-white border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Expirent sous 7j</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">{summary.expiringSoon}</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">À relancer</p>
        </div>

        <div
          onClick={() => setStatusFilter('expired')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'expired'
              ? 'bg-slate-100 border-slate-300 shadow-sm'
              : 'bg-white border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Expirés</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-700 mt-1">{summary.expired}</p>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Accès clos</p>
        </div>

        <div
          onClick={() => setStatusFilter('suspended')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'suspended'
              ? 'bg-rose-50 border-rose-300 shadow-sm'
              : 'bg-white border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Bloqués</span>
            <Ban className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-1">{summary.suspended}</p>
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5">Suspendus</p>
        </div>
      </div>

      {/* 3. Barre de recherche & Filtres */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, téléphone..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:bg-white focus:border-[#4c3882] transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtres de statut */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'active', label: 'Actifs' },
              { id: 'expiring_soon', label: 'Sous 7j' },
              { id: 'expired', label: 'Expirés' },
              { id: 'suspended', label: 'Bloqués' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setStatusFilter(t.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  statusFilter === t.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Sélecteur de cours */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#4c3882]"
          >
            <option value="all">Toutes les matières</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Liste des élèves */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">Aucun élève trouvé</p>
            <p className="text-xs text-slate-400 mt-1">Essayez d'ajuster vos filtres ou termes de recherche.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredStudents.map((sub) => {
              const exp = new Date(sub.expiresAt);
              const isExp = exp <= now;
              const isSuspended = sub.status === 'suspended';
              const isActive = sub.status === 'active' && !isExp;
              const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

              const courseObj = courses.find((c) => c._id === (sub.course?._id || sub.course)) || sub.course;
              const totalLessons =
                (courseObj?.chapters || []).reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0) || 0;
              const doneCount = Array.isArray(sub.completedLessons) ? sub.completedLessons.length : 0;
              const progressPct = totalLessons > 0 ? Math.min(100, Math.round((doneCount / totalLessons) * 100)) : 0;

              const studentResults = quizResults.filter(
                (qr) =>
                  String(qr.student?._id || qr.student) === String(sub.student?._id || sub.student) &&
                  String(qr.quiz?.course?._id || qr.quiz?.course) === String(sub.course?._id || sub.course)
              );
              const avgScore =
                studentResults.length > 0
                  ? Math.round(
                      studentResults.reduce((sum, r) => sum + (r.score / Math.max(1, r.totalQuestions)) * 100, 0) /
                        studentResults.length
                    )
                  : null;

              return (
                <div
                  key={sub._id}
                  className="p-4 hover:bg-slate-50/80 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
                >
                  {/* Élève info avec photo */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      {sub.student?.avatar ? (
                        <img src={sub.student.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-sm">
                          {sub.student?.name?.charAt(0) || 'E'}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{sub.student?.name || 'Élève'}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-500 text-white'
                              : isSuspended
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isActive ? 'Actif' : isSuspended ? 'Bloqué' : 'Expiré'}
                        </span>
                      </div>
                      <p className="text-slate-500 truncate">{sub.student?.email}</p>
                      <p className="text-[#4c3882] font-semibold mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>{sub.course?.title}</span>
                        <span>•</span>
                        {isActive ? (
                          <span className={diffDays <= 7 ? 'text-amber-600 font-bold' : 'text-slate-500'}>
                            Reste {diffDays} jour{diffDays > 1 ? 's' : ''} (jusqu'au {formatDateShort(sub.expiresAt)})
                          </span>
                        ) : (
                          <span className="text-rose-500">Expiré le {formatDateShort(sub.expiresAt)}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Progression & Quiz & Actions */}
                  <div className="flex flex-wrap items-center gap-5 justify-between lg:justify-end">
                    {/* Progression bar */}
                    <div className="w-36">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                        <span>Progression</span>
                        <span className="font-bold">{progressPct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#4c3882] to-[#2563eb] rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {doneCount}/{totalLessons} leçons
                      </span>
                    </div>

                    {/* Quiz average */}
                    <div className="text-center min-w-[70px]">
                      <span className="text-[11px] text-slate-400 block font-semibold">Moy. Quiz</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {avgScore !== null ? `${avgScore}%` : '—'}
                      </span>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenRemindModal(sub)}
                        className="px-3 py-1.5 rounded-lg bg-[#4c3882] hover:bg-[#3a2966] text-white font-bold inline-flex items-center gap-1 cursor-pointer transition shadow-sm"
                        title="Envoyer un message de rappel"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Relancer</span>
                      </button>

                      {onExtendStudentSubscription && (
                        <button
                          type="button"
                          onClick={() => onExtendStudentSubscription(sub)}
                          className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold border border-teal-200 cursor-pointer transition inline-flex items-center gap-1"
                          title="Prolonger l'accès"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          <span>+1m</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onToggleStudentStatus(sub)}
                        className={`px-3 py-1.5 rounded-lg font-bold inline-flex items-center gap-1 cursor-pointer transition shadow-sm ${
                          sub.status === 'suspended'
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-rose-500 hover:bg-rose-600 text-white'
                        }`}
                        title={sub.status === 'suspended' ? 'Débloquer' : 'Suspendre'}
                      >
                        {sub.status === 'suspended' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Ban className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">
                          {sub.status === 'suspended' ? 'Débloquer' : 'Bloquer'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherStudentsTab;
