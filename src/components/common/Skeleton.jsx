import React from 'react';

/**
 * Bloc de chargement squelette de base avec effet de vague lumineuse (shimmer)
 */
export const Skeleton = ({ className = '', rounded = 'rounded-xl', ...props }) => {
  return (
    <div
      className={`skeleton-shimmer ${rounded} ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
};

/**
 * Squelette pour les cartes de cours / matières (ratio 16:9, badges, titre, prof)
 */
export const CourseCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col h-full">
      {/* Vignette ratio 16:9 */}
      <Skeleton className="aspect-[16/9] w-full" rounded="rounded-none" />

      <div className="p-4 flex flex-col flex-1 space-y-3">
        {/* Badges matière & classe */}
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Titre 2 lignes */}
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Métadonnées (durée + chapitres) */}
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-20" />
        </div>

        {/* Pied de carte : prof et bouton */}
        <div className="mt-auto pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};

/**
 * Squelette pour les cartes de classes (6e à Terminale)
 */
export const ClassCardSkeleton = () => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-12 rounded-lg" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-3 w-full" />
      <div className="pt-2 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
};

/**
 * Squelette pour la section des chiffres clés
 */
export const StatCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm text-center flex flex-col items-center space-y-2.5">
      <Skeleton className="w-12 h-12 rounded-2xl" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
};

export default Skeleton;
