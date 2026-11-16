import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  X,
  Tag,
} from 'lucide-react';
import api from '../../utils/api';

const LEVEL_OPTIONS = ['Tous', '4ème', '3ème', '2nde S', '1ère S', 'Terminale S'];

const AdminCatalogPromoTab = ({
  courses = [],
  subscriptions = [],
  settings = {},
  courseSearch = '',
  setCourseSearch,
  globalSearch = '',
  onOpenCreateCourse,
  onOpenEditCourse,
  onDeleteCourse,
  onRefresh,
  showToast,
  setConfirmState,
  formatLevel = (l) => l,
}) => {
  const [promoCodes, setPromoCodes] = useState(settings?.promoCodes || []);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showAllPromos, setShowAllPromos] = useState(false);
  const [savingPromo, setSavingPromo] = useState(false);

  // Formulaire Modal Étape 6
  const [promoForm, setPromoForm] = useState({
    code: '',
    discountType: 'percent', // 'percent' | 'fixed'
    discountValue: 20,
    expiresAt: '',
    maxUses: '',
    eligibleLevels: ['Tous'],
  });

  useEffect(() => {
    if (Array.isArray(settings?.promoCodes)) {
      setPromoCodes(settings.promoCodes);
    }
  }, [settings?.promoCodes]);

  const effectiveSearch = (courseSearch || globalSearch).trim().toLowerCase();

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (!effectiveSearch) return true;
      return (
        (c.title || '').toLowerCase().includes(effectiveSearch) ||
        (c.subject || '').toLowerCase().includes(effectiveSearch) ||
        (c.level || '').toLowerCase().includes(effectiveSearch) ||
        (c.teacher?.name || '').toLowerCase().includes(effectiveSearch)
      );
    });
  }, [courses, effectiveSearch]);

  const publishedCoursesCount = useMemo(
    () => courses.filter((c) => c.isPublished !== false).length,
    [courses]
  );

  const activePromos = useMemo(
    () => promoCodes.filter((p) => p.active !== false),
    [promoCodes]
  );

  const promoRevenueTotal = useMemo(() => {
    return subscriptions.reduce((sum, s) => {
      const m = (s.paymentMethod || '').toLowerCase();
      if (m.includes('promo') || m.includes('gratuit') || s.promoCode) {
        return sum + Number(s.amount || 0);
      }
      return sum;
    }, 0);
  }, [subscriptions]);

  const totalCatalogRevenue = useMemo(
    () => subscriptions.reduce((sum, s) => sum + Number(s.amount || 0), 0),
    [subscriptions]
  );

  const handleToggleCourseStatus = async (course) => {
    try {
      const nextPublished = course.isPublished === false;
      await api(`/courses/${course._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isPublished: nextPublished }),
      });
      showToast?.(
        'success',
        nextPublished ? `"${course.title}" est maintenant en ligne.` : `"${course.title}" passé en révision.`
      );
      if (onRefresh) await onRefresh();
    } catch (err) {
      showToast?.('error', err.message || 'Impossible de modifier le statut du cours.');
    }
  };

  const handleToggleLevel = (lvl) => {
    setPromoForm((prev) => {
      if (lvl === 'Tous') {
        return { ...prev, eligibleLevels: ['Tous'] };
      }
      const withoutTous = prev.eligibleLevels.filter((item) => item !== 'Tous');
      const exists = withoutTous.includes(lvl);
      const next = exists ? withoutTous.filter((item) => item !== lvl) : [...withoutTous, lvl];
      return { ...prev, eligibleLevels: next.length === 0 ? ['Tous'] : next };
    });
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    const cleanCode = promoForm.code.trim().toUpperCase();
    if (!cleanCode) {
      showToast?.('error', 'Veuillez saisir un nom de code promo.');
      return;
    }
    if (promoCodes.some((p) => p.code?.toUpperCase() === cleanCode)) {
      showToast?.('error', `Le code ${cleanCode} existe déjà.`);
      return;
    }

    setSavingPromo(true);
    const newPromo = {
      code: cleanCode,
      discountType: promoForm.discountType,
      discountValue: Math.max(1, Number(promoForm.discountValue) || 10),
      expiresAt: promoForm.expiresAt || undefined,
      maxUses: Math.max(0, Number(promoForm.maxUses) || 0),
      usedCount: 0,
      eligibleLevels: promoForm.eligibleLevels,
      active: true,
      createdAt: new Date().toISOString(),
    };

    const updatedList = [newPromo, ...promoCodes];
    try {
      await api('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ promoCodes: updatedList }),
      });
      setPromoCodes(updatedList);
      setShowPromoModal(false);
      setPromoForm({
        code: '',
        discountType: 'percent',
        discountValue: 20,
        expiresAt: '',
        maxUses: '',
        eligibleLevels: ['Tous'],
      });
      showToast?.('success', `Code promo ${cleanCode} activé avec succès !`);
      if (onRefresh) await onRefresh();
    } catch (err) {
      showToast?.('error', err.message || 'Erreur lors de la création du code promo.');
    } finally {
      setSavingPromo(false);
    }
  };

  const handleTogglePromoActive = async (codeToToggle) => {
    const updatedList = promoCodes.map((p) =>
      p.code === codeToToggle ? { ...p, active: p.active === false } : p
    );
    try {
      await api('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ promoCodes: updatedList }),
      });
      setPromoCodes(updatedList);
      showToast?.('success', 'Statut du code promo mis à jour.');
    } catch (err) {
      showToast?.('error', err.message || 'Erreur lors de la mise à jour.');
    }
  };

  const handleDeletePromo = (codeToDelete) => {
    setConfirmState?.({
      title: 'Supprimer ce code promo',
      message: `Voulez-vous vraiment supprimer le code promo ${codeToDelete} ?`,
      confirmText: 'Supprimer',
      danger: true,
      onConfirm: async () => {
        const updatedList = promoCodes.filter((p) => p.code !== codeToDelete);
        await api('/admin/settings', {
          method: 'PUT',
          body: JSON.stringify({ promoCodes: updatedList }),
        });
        setPromoCodes(updatedList);
        showToast?.('success', `Code promo ${codeToDelete} supprimé.`);
      },
    });
  };

  const previewDiscountBadge =
    promoForm.discountType === 'fixed'
      ? `-${Number(promoForm.discountValue || 0).toLocaleString('fr-FR')} F CFA`
      : `-${Number(promoForm.discountValue || 0)}%`;

  const displayedPromos = showAllPromos ? promoCodes : promoCodes.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
            Catalogue &amp; Codes Promo
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Modération des cours publiés, tarification et gestion des campagnes promotionnelles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenCreateCourse}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-xs font-bold text-slate-700 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Cours</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPromoModal(true)}
            className="gradient-button gradient-button--sm !px-3.5 !py-2 !text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créer un code promo</span>
          </button>
        </div>
      </div>

      {/* 3 Cartes KPI (.uiverse-glow-card) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1 : Cours publiés en ligne */}
        <div className="uiverse-glow-card p-6 flex flex-col justify-between min-h-[132px]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-medium text-slate-600">Cours publiés en ligne</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight">
                {publishedCoursesCount} formation{publishedCoursesCount > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Maths &amp; Physique-Chimie</p>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-400 shrink-0" />
          </div>
          <div className="mt-2 h-7 w-full overflow-hidden">
            <svg viewBox="0 0 220 40" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="catalogSparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path
                d="M0 36 L40 28 L80 31 L120 19 L160 22 L200 10 L220 6 L220 40 L0 40 Z"
                fill="url(#catalogSparkGrad)"
              />
              <path
                d="M0 36 L40 28 L80 31 L120 19 L160 22 L200 10 L220 6"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 2 : Codes promo actifs */}
        <div className="uiverse-glow-card p-6 flex flex-col justify-between min-h-[132px]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-medium text-slate-600">Codes promo actifs</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight">
                {activePromos.length} campagne{activePromos.length > 1 ? 's' : ''}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
          </div>
          <p className="text-xs text-slate-500 mt-3 truncate">
            {activePromos[0]
              ? `ex: ${activePromos[0].code} (${
                  activePromos[0].discountType === 'fixed'
                    ? `-${activePromos[0].discountValue} F`
                    : `-${activePromos[0].discountValue}%`
                })`
              : 'Aucune campagne active'}
          </p>
        </div>

        {/* KPI 3 : Ventes catalogue */}
        <div className="uiverse-glow-card p-6 flex flex-col justify-between min-h-[132px]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-medium text-slate-600">
                {promoRevenueTotal > 0 ? 'Ventes avec remise' : 'Volume catalogue'}
              </p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight">
                {(promoRevenueTotal > 0 ? promoRevenueTotal : totalCatalogRevenue).toLocaleString('fr-FR')}{' '}
                <span className="text-base font-bold text-slate-700">F CFA</span>
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0" />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            {courses.length} cours au total dans le catalogue
          </p>
        </div>
      </div>

      {/* Grille principale 2 colonnes : Modération Catalogue + Codes Promo Actifs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Colonne Gauche : Modération du Catalogue des Cours */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-[16px] font-bold text-slate-900">
              Modération du Catalogue des Cours
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={courseSearch}
                onChange={(e) => setCourseSearch?.(e.target.value)}
                placeholder="Rechercher un cours, niveau..."
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Titre du Cours</th>
                  <th className="py-3.5 px-4">Prix</th>
                  <th className="py-3.5 px-4">Matière</th>
                  <th className="py-3.5 px-4">Niveau</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {filteredCourses.map((c) => {
                  const isOnline = c.isPublished !== false;
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-5">
                        <p className="font-semibold text-slate-900 line-clamp-1 max-w-[200px]">
                          {c.title}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {c.studentsCount || 0} inscrit{(c.studentsCount || 0) > 1 ? 's' : ''}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap tabular-nums">
                        {c.isFree || c.price === 0
                          ? 'Gratuit'
                          : `${Number(c.price || 0).toLocaleString('fr-FR')} F CFA`}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                        {c.subject}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                          {formatLevel(c.level)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isOnline
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                          }`}
                        >
                          {isOnline ? 'En ligne' : 'En révision'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isOnline}
                            onClick={() => handleToggleCourseStatus(c)}
                            title={isOnline ? 'Passer en révision' : 'Mettre en ligne'}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                              isOnline ? 'bg-indigo-600' : 'bg-slate-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                isOnline ? 'translate-x-4.5' : 'translate-x-1'
                              }`}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenEditCourse?.(c)}
                            title="Modifier"
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-500 hover:text-amber-700 border border-slate-200/80 transition cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            to={`/courses/${c._id}`}
                            title="Gérer chapitres, leçons & quiz"
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-indigo-600 border border-slate-200/80 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => onDeleteCourse?.(c._id)}
                            title="Supprimer"
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredCourses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-slate-400">
                      Aucun cours trouvé dans le catalogue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Colonne Droite : Codes Promo & Réductions Actifs */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[16px] font-bold text-slate-900">
              Codes Promo &amp; Réductions Actifs
            </h2>
          </div>

          <div className="space-y-3">
            {displayedPromos.map((promo) => {
              const isActive = promo.active !== false;
              const discountText =
                promo.discountType === 'fixed'
                  ? `-${Number(promo.discountValue).toLocaleString('fr-FR')} F`
                  : `-${promo.discountValue}%`;
              const levelsText = Array.isArray(promo.eligibleLevels)
                ? promo.eligibleLevels.join(', ')
                : 'Tous niveaux';

              return (
                <div
                  key={promo.code}
                  className={`p-3.5 rounded-xl border transition space-y-2 ${
                    isActive
                      ? 'bg-slate-50/70 border-slate-200/80'
                      : 'bg-slate-50/30 border-slate-100 opacity-65'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-sm text-slate-900 tracking-wide">
                      {promo.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTogglePromoActive(promo.code)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isActive ? 'Actif' : 'Inactif'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePromo(promo.code)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong className="text-indigo-600">{discountText}</strong> • {levelsText} •{' '}
                    {promo.usedCount || 0} utilisation{(promo.usedCount || 0) > 1 ? 's' : ''}
                  </p>

                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold">
                      Wave
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-900 text-orange-400 text-[10px] font-bold">
                      OM
                    </span>
                  </div>
                </div>
              );
            })}

            {promoCodes.length === 0 && (
              <div className="py-8 text-center space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Tag className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500">Aucun code promo créé pour le moment.</p>
                <button
                  type="button"
                  onClick={() => setShowPromoModal(true)}
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  + Créer un code promo
                </button>
              </div>
            )}
          </div>

          {promoCodes.length > 4 && (
            <button
              type="button"
              onClick={() => setShowAllPromos((v) => !v)}
              className="w-full pt-2 text-center text-xs font-bold text-slate-600 hover:text-indigo-600 cursor-pointer"
            >
              {showAllPromos ? 'Réduire' : `Voir tout (${promoCodes.length})`}
            </button>
          )}
        </div>
      </div>

      {/* ================= MODAL ÉTAPE 6 : CRÉER UN NOUVEAU CODE PROMO ================= */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <form
            onSubmit={handleSavePromo}
            className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="text-lg font-extrabold text-slate-900">
                Créer un nouveau code promo
              </h3>
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Champs du formulaire */}
              <div className="md:col-span-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nom du code
                    </label>
                    <input
                      type="text"
                      required
                      value={promoForm.code}
                      onChange={(e) =>
                        setPromoForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                      }
                      placeholder="ex: BAC2027"
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold uppercase text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Date d&apos;expiration
                    </label>
                    <input
                      type="date"
                      value={promoForm.expiresAt}
                      onChange={(e) =>
                        setPromoForm((prev) => ({ ...prev, expiresAt: e.target.value }))
                      }
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Type de réduction
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => setPromoForm((prev) => ({ ...prev, discountType: 'percent' }))}
                        className={`py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          promoForm.discountType === 'percent'
                            ? 'bg-white text-indigo-600 shadow-xs'
                            : 'text-slate-600'
                        }`}
                      >
                        % Pourcentage
                      </button>
                      <button
                        type="button"
                        onClick={() => setPromoForm((prev) => ({ ...prev, discountType: 'fixed' }))}
                        className={`py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          promoForm.discountType === 'fixed'
                            ? 'bg-white text-indigo-600 shadow-xs'
                            : 'text-slate-600'
                        }`}
                      >
                        F CFA Fixe
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Max utilisations
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={promoForm.maxUses}
                      onChange={(e) =>
                        setPromoForm((prev) => ({ ...prev, maxUses: e.target.value }))
                      }
                      placeholder="0 = illimité"
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Valeur de la remise
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={promoForm.discountValue}
                      onChange={(e) =>
                        setPromoForm((prev) => ({ ...prev, discountValue: e.target.value }))
                      }
                      placeholder={promoForm.discountType === 'percent' ? 'ex: 20' : 'ex: 2000'}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Cours ou Niveaux éligibles
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      {LEVEL_OPTIONS.map((lvl) => {
                        const checked = promoForm.eligibleLevels.includes(lvl);
                        return (
                          <label
                            key={lvl}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleLevel(lvl)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-[#2563eb]"
                            />
                            <span className="truncate">{lvl}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Aperçu en direct */}
              <div className="md:col-span-4 bg-slate-50 rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-700">Aperçu en direct</p>
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-extrabold text-sm shadow-sm">
                    <span>{promoForm.code || 'BAC2027'}</span>
                    <span className="opacity-90">{previewDiscountBadge}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                    <p>Niveaux : {promoForm.eligibleLevels.join(', ')}</p>
                    <p>
                      Limite :{' '}
                      {Number(promoForm.maxUses) > 0 ? `${promoForm.maxUses} utilisations` : 'Illimitée'}
                    </p>
                    {promoForm.expiresAt && (
                      <p>Expire le : {new Date(promoForm.expiresAt).toLocaleDateString('fr-FR')}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingPromo}
                  className="gradient-button gradient-button--sm w-full !py-2.5 !text-xs flex items-center justify-center disabled:opacity-60"
                >
                  {savingPromo ? 'Activation...' : 'Activer le code promo'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminCatalogPromoTab;
