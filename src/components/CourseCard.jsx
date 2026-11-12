import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, LayoutGrid } from 'lucide-react';

export const formatLevel = (level) => (level === 'TS' ? 'Terminale S' : level);

export const getInitials = (name) =>
  (name || 'Aliou Sow')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

const CourseCard = ({ course, footerRight, topRightBadge, onClick }) => {
  const teacherName = course.teacher?.name || 'Aliou Sow';
  const sectionsCount = course.chaptersCount ?? course.chapters?.length ?? 0;
  const studentsCount = course.studentsCount ?? 0;
  const courseIsFree = course.isFree || course.price === 0;
  const displayPrice = courseIsFree
    ? 'Gratuit'
    : `${(course.price ?? 6000).toLocaleString('fr-FR')} FCFA`;

  const cardContent = (
    <>
      <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
        <img
          src={course.image}
          alt={course.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        {topRightBadge && <div className="absolute top-2.5 right-2.5">{topRightBadge}</div>}
      </div>

      <div className="flex flex-col flex-1 p-4">
        {/* Badges matière et niveau (format Bakeli) */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold bg-sky-50 text-sky-600 rounded-full px-2.5 py-0.5 truncate">
            {course.subject}
          </span>
          <span className="text-[11px] font-semibold bg-orange-50 text-[#f59d0e] rounded-full px-2.5 py-0.5 shrink-0">
            {formatLevel(course.level)}
          </span>
        </div>

        {/* Titre du module */}
        <h3 className="text-[15px] font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.6rem] group-hover:text-[#009688] transition-colors">
          {course.title}
        </h3>

        {/* Nombre d'apprenants aligné à droite comme sur Bakeli */}
        <div className="text-right text-xs text-slate-500 mt-2.5">
          <span className="font-semibold text-slate-700">{studentsCount}</span>{' '}
          apprenant{studentsCount > 1 ? 's' : ''}
        </div>

        {/* Durée & sections */}
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{course.duration || '3 mois'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-[#f59d0e] shrink-0" />
            <span>
              {sectionsCount} section{sectionsCount > 1 ? 's' : ''}
            </span>
          </span>
        </div>

        {/* Pied de carte : professeur à gauche, prix ou action à droite */}
        <div className="mt-auto pt-3.5">
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 rounded bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                {getInitials(teacherName)}
              </span>
              <span className="text-xs font-medium text-slate-600 truncate">{teacherName}</span>
            </span>

            {footerRight ? (
              footerRight
            ) : (
              <div className="text-right shrink-0">
                {courseIsFree && course.originalPrice > 0 && (
                  <span className="text-[11px] text-slate-400 line-through mr-1.5">
                    {course.originalPrice.toLocaleString('fr-FR')}
                  </span>
                )}
                <span className="text-sm font-bold text-[#009688]">{displayPrice}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <div
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onClick();
        }}
        className="group h-full flex flex-col bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 transition cursor-pointer"
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      to={`/courses/${course._id}`}
      className="group h-full flex flex-col bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 transition"
    >
      {cardContent}
    </Link>
  );
};

export default CourseCard;
