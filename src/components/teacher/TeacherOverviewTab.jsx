import React, { useState, useMemo } from 'react';
import {
  Users,
  BookOpen,
  CreditCard,
  Award,
  TrendingUp,
  Clock,
  ArrowUpRight,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Zap,
  Plus,
  Calculator,
  Megaphone,
  Video,
  Star,
  ChevronRight,
  Filter,
  DollarSign,
  Smartphone,
  Trophy,
  Check,
  Eye,
  FileText,
} from 'lucide-react';

const TeacherOverviewTab = ({
  user,
  courses = [],
  students = [],
  exercises = [],
  exerciseSubmissions = [],
  quizzes = [],
  quizResults = [],
  discussions = [],
  reviews = [],
  metrics,
  onNavigateTab,
  onOpenCreateCourse,
  onOpenNewExercise,
  onOpenNewQuiz,
  onOpenLiveMeet,
  onOpenBroadcast,
  formatDateShort,
}) => {
  const [activityFilter, setActivityFilter] = useState('all'); // all, sub, homework, quiz, qa, review
  const [chartPeriod, setChartPeriod] = useState('6m'); // 6m

  const now = useMemo(() => new Date(), []);

  // --- 1. CALCULS FINANCIERS DÉTAILLÉS (Journalier, Hebdo, Mensuel, Total, Méthodes) ---
  const financialStats = useMemo(() => {
    let today = 0;
    let thisWeek = 0;
    let thisMonth = 0;
    let total = 0;
    let waveTotal = 0;
    let orangeTotal = 0;
    let freeTotal = 0;

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    students.forEach((sub) => {
      const amt = Number(sub.amount || 0);
      const subDate = new Date(sub.createdAt || sub.startDate || now);

      total += amt;
      if (subDate >= startOfToday) today += amt;
      if (subDate >= sevenDaysAgo) thisWeek += amt;
      if (subDate >= startOfMonth) thisMonth += amt;

      const method = (sub.paymentMethod || '').toLowerCase();
      if (method.includes('wave')) waveTotal += amt;
      else if (method.includes('orange') || method.includes('om')) orangeTotal += amt;
      else if (method.includes('gratuit') || method.includes('offert') || amt === 0) freeTotal++;
    });

    return { today, thisWeek, thisMonth, total, waveTotal, orangeTotal, freeTotal };
  }, [students, now]);

  // --- 2. ANALYTIQUE 6 MOIS (Inscriptions & Revenus) ---
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString('fr-FR', { month: 'short' });
      const year = d.getFullYear();
      const monthIndex = d.getMonth();

      let revenue = 0;
      let count = 0;

      students.forEach((sub) => {
        const subDate = new Date(sub.createdAt || sub.startDate || now);
        if (subDate.getFullYear() === year && subDate.getMonth() === monthIndex) {
          revenue += Number(sub.amount || 0);
          count++;
        }
      });

      months.push({ label: monthLabel, revenue, count });
    }
    return months;
  }, [students, now]);

  // Valeurs max pour échelle des graphiques SVG
  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 10000);
  const maxCount = Math.max(...monthlyData.map((m) => m.count), 5);

  // --- 3. PERFORMANCES DES ÉLÈVES & TAUX DE RÉUSSITE ---
  const performanceStats = useMemo(() => {
    const totalQuizAttempts = quizResults.length;
    let passedQuizAttempts = 0;
    let totalScoreSum = 0;

    quizResults.forEach((qr) => {
      const totalQ = Math.max(1, qr.totalQuestions || 5);
      const scorePct = Math.round((qr.score / totalQ) * 100);
      totalScoreSum += scorePct;
      if (scorePct >= 50) passedQuizAttempts++;
    });

    const avgQuizScore = totalQuizAttempts > 0 ? Math.round(totalScoreSum / totalQuizAttempts) : 0;
    const passRate = totalQuizAttempts > 0 ? Math.round((passedQuizAttempts / totalQuizAttempts) * 100) : 0;

    // Top élèves (Leaderboard)
    const studentPerformanceMap = {};
    students.forEach((sub) => {
      const sId = String(sub.student?._id || sub.student || '');
      if (!sId) return;
      if (!studentPerformanceMap[sId]) {
        studentPerformanceMap[sId] = {
          student: sub.student,
          completedLessons: Array.isArray(sub.completedLessons) ? sub.completedLessons.length : 0,
          courseTitle: sub.course?.title,
          scores: [],
        };
      } else {
        studentPerformanceMap[sId].completedLessons += Array.isArray(sub.completedLessons)
          ? sub.completedLessons.length
          : 0;
      }
    });

    quizResults.forEach((qr) => {
      const sId = String(qr.student?._id || qr.student || '');
      if (studentPerformanceMap[sId]) {
        const totalQ = Math.max(1, qr.totalQuestions || 5);
        studentPerformanceMap[sId].scores.push(Math.round((qr.score / totalQ) * 100));
      }
    });

    const topStudents = Object.values(studentPerformanceMap)
      .map((sp) => {
        const avg =
          sp.scores.length > 0 ? Math.round(sp.scores.reduce((a, b) => a + b, 0) / sp.scores.length) : null;
        return { ...sp, avgScore: avg };
      })
      .sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0) || b.completedLessons - a.completedLessons)
      .slice(0, 5);

    return { avgQuizScore, passRate, totalQuizAttempts, topStudents };
  }, [quizResults, students]);

  // --- 4. SUIVI DES COURS (Progression moyenne et finissants) ---
  const courseTrackings = useMemo(() => {
    return courses.map((course) => {
      const enrolled = students.filter(
        (s) => String(s.course?._id || s.course) === String(course._id) && s.status === 'active'
      );
      const totalLessons = (course.chapters || []).reduce(
        (sum, ch) => sum + (ch.lessons?.length || 0),
        0
      );

      let totalProgressSum = 0;
      let completedCount = 0;

      enrolled.forEach((sub) => {
        const done = Array.isArray(sub.completedLessons) ? sub.completedLessons.length : 0;
        const pct = totalLessons > 0 ? Math.min(100, Math.round((done / totalLessons) * 100)) : 0;
        totalProgressSum += pct;
        if (totalLessons > 0 && done >= totalLessons) completedCount++;
      });

      const avgProgress = enrolled.length > 0 ? Math.round(totalProgressSum / enrolled.length) : 0;

      return {
        _id: course._id,
        title: course.title,
        subject: course.subject,
        level: course.level,
        enrolledCount: enrolled.length,
        totalLessons,
        avgProgress,
        completedCount,
      };
    });
  }, [courses, students]);

  // --- 5. FLUX MULTI-SOURCES D'ACTIVITÉ RÉCENTE ---
  const combinedActivities = useMemo(() => {
    const list = [];

    // Inscriptions / Abonnements
    students.forEach((sub) => {
      list.push({
        id: `sub-${sub._id}`,
        type: 'sub',
        title: `Nouvel abonnement : ${sub.student?.name || 'Élève'}`,
        subtitle: `${sub.course?.title || 'Cours'} • ${Number(sub.amount || 0).toLocaleString('fr-FR')} FCFA (${sub.paymentMethod || 'Wave'})`,
        date: new Date(sub.createdAt || sub.startDate || now),
        avatar: sub.student?.avatar,
        studentName: sub.student?.name,
        targetTab: 'students',
        badge: 'Abonnement',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      });
    });

    // Devoirs soumis
    exerciseSubmissions.forEach((sub) => {
      list.push({
        id: `ex-${sub._id}`,
        type: 'homework',
        title: `Devoir soumis : ${sub.student?.name || 'Élève'}`,
        subtitle: `${sub.exercise?.title || 'Exercice'} • Statut: ${sub.status === 'submitted' ? 'À corriger' : 'Noté'}`,
        date: new Date(sub.submittedAt || sub.createdAt || now),
        avatar: sub.student?.avatar,
        studentName: sub.student?.name,
        targetTab: 'exercises',
        badge: sub.status === 'submitted' ? 'À corriger' : 'Noté',
        badgeColor: sub.status === 'submitted' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-700',
      });
    });

    // Quiz terminés
    quizResults.forEach((qr) => {
      const scorePct = Math.round((qr.score / Math.max(1, qr.totalQuestions || 5)) * 100);
      list.push({
        id: `quiz-${qr._id}`,
        type: 'quiz',
        title: `Quiz complété : ${qr.student?.name || 'Élève'}`,
        subtitle: `${qr.quiz?.title || 'Quiz'} • Score: ${scorePct}% (${qr.score}/${qr.totalQuestions})`,
        date: new Date(qr.createdAt || now),
        avatar: qr.student?.avatar,
        studentName: qr.student?.name,
        targetTab: 'quizzes',
        badge: `${scorePct}%`,
        badgeColor: scorePct >= 50 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-rose-50 text-rose-700 border-rose-200',
      });
    });

    // Questions Q&R
    discussions.forEach((d) => {
      list.push({
        id: `qa-${d._id}`,
        type: 'qa',
        title: `Question de ${d.sender?.name || 'Élève'}`,
        subtitle: `"${d.message?.slice(0, 60)}..." • ${d.course?.title || 'Cours'}`,
        date: new Date(d.createdAt || now),
        avatar: d.sender?.avatar,
        studentName: d.sender?.name,
        targetTab: 'qa',
        badge: d.isResolved ? 'Résolu' : 'En attente',
        badgeColor: d.isResolved ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700 border-amber-200',
      });
    });

    // Avis & Notes
    reviews.forEach((r) => {
      list.push({
        id: `rev-${r._id}`,
        type: 'review',
        title: `Avis de ${r.student?.name || 'Élève'}`,
        subtitle: `⭐ ${r.rating || 5}/5 - "${r.comment?.slice(0, 50)}..."`,
        date: new Date(r.createdAt || now),
        avatar: r.student?.avatar,
        studentName: r.student?.name,
        targetTab: 'reviews',
        badge: `${r.rating || 5}★`,
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      });
    });

    return list.sort((a, b) => b.date - a.date);
  }, [students, exerciseSubmissions, quizResults, discussions, reviews, now]);

  const filteredActivities = combinedActivities.filter((act) => {
    if (activityFilter === 'all') return true;
    return act.type === activityFilter;
  });

  return (
    <div className="space-y-6">
      {/* 1. HERO BANNER & SHORTCUTS */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4c3882] to-[#6b5cc4] text-white flex items-center justify-center shadow-lg shadow-indigo-900/20 shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <Users className="w-7 h-7" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Bonjour, M. {user?.name || 'Aliou Sow'} 👋
              </h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-[#eef2fb] text-[#4c3882] border border-indigo-200">
                Espace Pédagogique
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pilotez l'avancement de vos élèves, corrigez les devoirs, suivez vos encaissements et animez vos classes.
            </p>
          </div>
        </div>

        {/* Boutons d'actions rapides */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenCreateCourse}
            className="px-3.5 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouvelle matière
          </button>
          <button
            type="button"
            onClick={onOpenNewExercise}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5" />
            Nouvel exercice
          </button>
          <button
            type="button"
            onClick={onOpenNewQuiz}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            Créer un quiz
          </button>
          <button
            type="button"
            onClick={onOpenLiveMeet}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" />
            Séance direct
          </button>
        </div>
      </div>

      {/* 2. 4 CARTES STATISTIQUES INTERACTIVES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Carte 1: Élèves Actifs */}
        <div
          onClick={() => onNavigateTab('students')}
          className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Élèves Actifs</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4c3882] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{metrics.activeSubs.length}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> En cours
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {metrics.expiredSubs.length} expiré(s) • {metrics.suspendedSubs.length} bloqué(s)
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#4c3882]">
            <span>Gérer les accès</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Carte 2: Cours & Modules */}
        <div
          onClick={() => onNavigateTab('courses')}
          className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Matières &amp; Chapitres</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{metrics.publishedCourses}</span>
            <span className="text-xs font-semibold text-slate-400">/{courses.length} publiés</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {metrics.totalChapters} chapitres • {metrics.totalLessons} leçons
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-cyan-600">
            <span>Organiser le programme</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Carte 3: Revenus Encaissés */}
        <div
          onClick={() => {
            const el = document.getElementById('finance-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Encaissé</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#f59d0e] flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {financialStats.total.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs font-bold text-slate-500">FCFA</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Ce mois : <strong>{financialStats.thisMonth.toLocaleString('fr-FR')} FCFA</strong>
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#f59d0e]">
            <span>Voir détail financier</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Carte 4: Quiz & Évaluations */}
        <div
          onClick={() => onNavigateTab('quizzes')}
          className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Évaluations &amp; Quiz</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{quizzes.length}</span>
            <span className="text-xs font-bold text-emerald-600">{performanceStats.passRate}% réussite</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {performanceStats.totalQuizAttempts} participations • Moy: {performanceStats.avgQuizScore}%
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-purple-600">
            <span>Consulter les résultats</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* 3. SECTION GESTION FINANCIÈRE (Journalier, Hebdo, Mensuel, Total, Wave & OM) */}
      <section id="finance-section" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Gestion Financière &amp; Encaissements</h2>
              <p className="text-xs text-slate-400">Suivi des abonnements payés par les élèves</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Comptabilité en temps réel
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase">Aujourd'hui</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tabular-nums">
              {financialStats.today.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">FCFA</span>
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Encaissé ce jour</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase">Cette semaine (7j)</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tabular-nums">
              {financialStats.thisWeek.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">FCFA</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">7 derniers jours</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase">Ce mois-ci</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 tabular-nums">
              {financialStats.thisMonth.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">FCFA</span>
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Mois en cours</p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <p className="text-xs font-semibold text-[#4c3882] uppercase">Total Cumulé</p>
            <p className="text-xl sm:text-2xl font-black text-[#4c3882] mt-1 tabular-nums">
              {financialStats.total.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">FCFA</span>
            </p>
            <p className="text-[11px] text-[#4c3882] font-semibold mt-0.5">Toutes les matières</p>
          </div>
        </div>

        {/* Barres de répartition Wave / Orange Money */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Répartition des modes de paiement</span>
            <span className="text-slate-400">Wave &amp; Orange Money</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-cyan-700 font-bold">
                  <Smartphone className="w-3.5 h-3.5 text-[#1dc8f2]" /> Wave
                </span>
                <span className="font-bold text-slate-900">{financialStats.waveTotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${financialStats.total > 0 ? (financialStats.waveTotal / financialStats.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-orange-700 font-bold">
                  <Smartphone className="w-3.5 h-3.5 text-orange-500" /> Orange Money
                </span>
                <span className="font-bold text-slate-900">{financialStats.orangeTotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${financialStats.total > 0 ? (financialStats.orangeTotal / financialStats.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DEUX GRAPHIQUES STATISTIQUES INTERACTIFS (Revenus & Élèves) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique 1 : Évolution des revenus */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#4c3882]" />
                Évolution des Revenus (6 derniers mois)
              </h3>
              <p className="text-xs text-slate-400">Montant total encaissé en FCFA</p>
            </div>
            <span className="text-xs font-extrabold text-[#4c3882] bg-indigo-50 px-2.5 py-1 rounded-lg">
              FCFA
            </span>
          </div>

          <div className="h-48 w-full pt-4">
            <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="teacherRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4c3882" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4c3882" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Lignes horizontales de repère */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeDasharray="4 4" />

              {/* Tracé de la surface et ligne */}
              {(() => {
                const points = monthlyData.map((m, idx) => {
                  const x = 40 + idx * 84;
                  const y = 130 - (m.revenue / maxRevenue) * 110;
                  return { x, y, ...m };
                });

                const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
                const areaD = `${pathD} L ${points[points.length - 1].x} 130 L ${points[0].x} 130 Z`;

                return (
                  <>
                    <path d={areaD} fill="url(#teacherRevGrad)" />
                    <path d={pathD} fill="none" stroke="#4c3882" strokeWidth="3" strokeLinecap="round" />
                    {points.map((p, idx) => (
                      <g key={idx} className="cursor-pointer group">
                        <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#4c3882" strokeWidth="2.5" />
                        {/* Valeur au-dessus */}
                        <text
                          x={p.x}
                          y={p.y - 10}
                          textAnchor="middle"
                          className="text-[10px] font-bold fill-slate-700 select-none"
                        >
                          {p.revenue > 0 ? `${(p.revenue / 1000).toFixed(0)}k` : '0'}
                        </text>
                        {/* Nom du mois */}
                        <text
                          x={p.x}
                          y={150}
                          textAnchor="middle"
                          className="text-[11px] font-semibold fill-slate-400 capitalize select-none"
                        >
                          {p.label}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Graphique 2 : Évolution des Inscriptions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                Inscriptions &amp; Élèves (6 derniers mois)
              </h3>
              <p className="text-xs text-slate-400">Nombre de nouvelles inscriptions par mois</p>
            </div>
            <span className="text-xs font-extrabold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
              Élèves
            </span>
          </div>

          <div className="h-48 w-full pt-4">
            <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeDasharray="4 4" />

              {monthlyData.map((m, idx) => {
                const x = 30 + idx * 84;
                const barHeight = Math.max(8, (m.count / maxCount) * 110);
                const y = 130 - barHeight;

                return (
                  <g key={idx} className="cursor-pointer group">
                    <rect
                      x={x}
                      y={y}
                      width="34"
                      height={barHeight}
                      rx="6"
                      fill="#009688"
                      className="group-hover:fill-[#00796b] transition-colors"
                    />
                    <text
                      x={x + 17}
                      y={y - 8}
                      textAnchor="middle"
                      className="text-[11px] font-bold fill-slate-700 select-none"
                    >
                      {m.count}
                    </text>
                    <text
                      x={x + 17}
                      y={150}
                      textAnchor="middle"
                      className="text-[11px] font-semibold fill-slate-400 capitalize select-none"
                    >
                      {m.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* 5. PERFORMANCES DES ÉLÈVES & SUIVI DES COURS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne gauche (7 cols) : Suivi des cours & progression */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#4c3882]" />
              <h3 className="text-base font-extrabold text-slate-900">Suivi Pédagogique par Matière</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('courses')}
              className="text-xs font-bold text-[#4c3882] hover:underline"
            >
              Gérer les cours →
            </button>
          </div>

          <div className="space-y-3">
            {courseTrackings.map((c) => (
              <div
                key={c._id}
                className="p-4 rounded-xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-100 transition space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                    <p className="text-xs text-slate-400">
                      {c.subject} • {c.level} • {c.totalLessons} leçons
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200">
                    {c.enrolledCount} inscrit{c.enrolledCount > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Barre de progression moyenne */}
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Progression moyenne de la classe</span>
                    <span className="font-bold text-[#4c3882]">{c.avgProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#4c3882] to-[#2563eb] transition-all duration-500"
                      style={{ width: `${c.avgProgress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>{c.completedCount} élève{c.completedCount > 1 ? 's ont' : ' a'} terminé toutes les leçons</span>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('students')}
                    className="font-bold text-[#4c3882] hover:underline flex items-center gap-1"
                  >
                    Voir les inscrits <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne droite (5 cols) : Tableau d'honneur (Top 5 élèves) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-extrabold text-slate-900">Tableau d'Honneur</h3>
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md">
              Top Élèves
            </span>
          </div>

          {performanceStats.topStudents.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">Aucune note de quiz enregistrée pour l'instant.</p>
          ) : (
            <div className="space-y-3">
              {performanceStats.topStudents.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 text-center font-black text-slate-400 text-sm">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </div>
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-white border border-slate-200 shrink-0">
                      {item.student?.avatar ? (
                        <img src={item.student.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                          {item.student?.name?.charAt(0) || 'E'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item.student?.name || 'Élève'}</p>
                      <p className="text-[11px] text-slate-400 truncate">{item.completedLessons} leçon(s) validée(s)</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-emerald-600 text-sm">
                      {item.avgScore !== null ? `${item.avgScore}%` : '—'}
                    </span>
                    <span className="block text-[10px] text-slate-400">Score Quiz</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. FLUX D'ACTIVITÉ RÉCENTE MULTI-SOURCES */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#4c3882]" />
            <h3 className="text-base font-extrabold text-slate-900">Fil d'Activité Récente</h3>
          </div>

          {/* Filtres de fil */}
          <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl gap-1 text-xs font-semibold">
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'sub', label: 'Abonnements' },
              { id: 'homework', label: 'Devoirs' },
              { id: 'quiz', label: 'Quiz' },
              { id: 'qa', label: 'Questions' },
              { id: 'review', label: 'Avis' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActivityFilter(f.id)}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  activityFilter === f.id
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredActivities.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">Aucune activité dans cette catégorie.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredActivities.slice(0, 10).map((act) => (
              <div
                key={act.id}
                onClick={() => onNavigateTab(act.targetTab)}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    {act.avatar ? (
                      <img src={act.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-xs">
                        {act.studentName?.charAt(0) || 'E'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{act.title}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{act.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${act.badgeColor}`}>
                    {act.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    {formatDateShort(act.date)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TeacherOverviewTab;
