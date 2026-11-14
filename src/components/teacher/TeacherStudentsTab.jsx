import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
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
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl shadow-2xs p-6 sm:p-7 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Suivi des Élèves &amp; Abonnements
              </h1>
              <span className="text-xs px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-200/70 shadow-2xs">
                {summary.total} élève{summary.total > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Consultez la progression, les scores aux quiz, relancez ou gérez les abonnements de vos élèves.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 2. KPI Cards Statut */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          onClick={() => setStatusFilter('active')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            statusFilter === 'active'
              ? 'bg-emerald-50/70 border-emerald-300 shadow-xs ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200/80 hover:border-emerald-200 shadow-2xs hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Actifs</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">{summary.active}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">Accès autorisés</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          onClick={() => setStatusFilter('expiring_soon')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            statusFilter === 'expiring_soon'
              ? 'bg-amber-50/70 border-amber-300 shadow-xs ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200/80 hover:border-amber-200 shadow-2xs hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Expirent sous 7j</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-2 tracking-tight">{summary.expiringSoon}</p>
          <p className="text-[11px] text-amber-600 font-bold mt-1">À relancer</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          onClick={() => setStatusFilter('expired')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            statusFilter === 'expired'
              ? 'bg-slate-100 border-slate-300 shadow-xs ring-2 ring-slate-400/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Expirés</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-700 mt-2 tracking-tight">{summary.expired}</p>
          <p className="text-[11px] text-slate-400 font-bold mt-1">Accès clos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.2 }}
          onClick={() => setStatusFilter('suspended')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            statusFilter === 'suspended'
              ? 'bg-rose-50/70 border-rose-300 shadow-xs ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200/80 hover:border-rose-200 shadow-2xs hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Bloqués</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <Ban className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-2 tracking-tight">{summary.suspended}</p>
          <p className="text-[11px] text-rose-600 font-bold mt-1">Suspendus</p>
        </motion.div>
      </div>

      {/* 3. Barre de recherche & Filtres */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-2xs border border-slate-200/80 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, téléphone..."
            className="w-full h-11 pl-10 pr-9 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition shadow-2xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filtres de statut */}
          <div className="flex bg-slate-100/80 p-1 rounded-2xl gap-1 text-xs">
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
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  statusFilter === t.id
                    ? 'bg-white text-slate-900 shadow-2xs'
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
            className="h-11 px-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs cursor-pointer"
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
      <div className="bg-white rounded-3xl shadow-2xs border border-slate-200/80 overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="py-14 text-center text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">Aucun élève trouvé</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Essayez d'ajuster vos filtres ou termes de recherche pour afficher les inscriptions.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredStudents.map((sub, sIdx) => {
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
                <motion.div
                  key={sub._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: sIdx * 0.03 }}
                  className="p-5 hover:bg-slate-50/70 transition flex flex-col lg:flex-row lg:items-center justify-between gap-5 text-xs"
                >
                  {/* Élève info avec photo */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                      {sub.student?.avatar ? (
                        <img src={sub.student.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-sm">
                          {sub.student?.name?.charAt(0) || 'E'}
                        </div>
                      )}
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          isActive ? 'bg-emerald-500' : isSuspended ? 'bg-rose-500' : 'bg-slate-400'
                        }`}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-sm">{sub.student?.name || 'Élève'}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isSuspended
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {isActive ? 'Actif' : isSuspended ? 'Bloqué' : 'Expiré'}
                        </span>
                      </div>
                      <p className="text-slate-500 truncate mt-0.5">{sub.student?.email}</p>
                      <p className="text-indigo-600 font-semibold mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-800">{sub.course?.title}</span>
                        <span>•</span>
                        {isActive ? (
                          <span className={diffDays <= 7 ? 'text-amber-600 font-bold' : 'text-slate-500'}>
                            Reste {diffDays} jour{diffDays > 1 ? 's' : ''} (jusqu'au {formatDateShort(sub.expiresAt)})
                          </span>
                        ) : (
                          <span className="text-rose-500 font-medium">Expiré le {formatDateShort(sub.expiresAt)}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Progression & Quiz & Actions */}
                  <div className="flex flex-wrap items-center gap-6 justify-between lg:justify-end">
                    {/* Progression bar */}
                    <div className="w-36">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                        <span>Progression</span>
                        <span className="font-bold text-indigo-700">{progressPct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                        {doneCount}/{totalLessons} leçons validées
                      </span>
                    </div>

                    {/* Quiz average */}
                    <div className="text-center min-w-[70px] bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Moy. Quiz</span>
                      <span className="font-black text-slate-900 text-sm">
                        {avgScore !== null ? `${avgScore}%` : '—'}
                      </span>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenRemindModal(sub)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer transition shadow-2xs hover:shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                        title="Envoyer un message de rappel"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Relancer</span>
                      </button>

                      {onExtendStudentSubscription && (
                        <button
                          type="button"
                          onClick={() => onExtendStudentSubscription(sub)}
                          className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold border border-teal-200 cursor-pointer transition inline-flex items-center gap-1 shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
                          title="Prolonger l'accès d'un mois"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          <span>+1m</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onToggleStudentStatus(sub)}
                        className={`px-3 py-2 rounded-xl font-bold inline-flex items-center gap-1.5 cursor-pointer transition shadow-2xs hover:scale-[1.02] active:scale-[0.98] ${
                          sub.status === 'suspended'
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200'
                        }`}
                        title={sub.status === 'suspended' ? 'Débloquer' : 'Suspendre'}
                      >
                        {sub.status === 'suspended' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Ban className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span className="hidden sm:inline">
                          {sub.status === 'suspended' ? 'Débloquer' : 'Bloquer'}
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherStudentsTab;
