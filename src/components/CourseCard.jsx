import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LayoutGrid, GraduationCap, ChevronRight } from 'lucide-react';
import { formatClassLabel, getSubjectMeta } from '../utils/education';

export const formatLevel = (level) => formatClassLabel(level);

export const getInitials = (name) =>
  (name || 'Aliou Sow')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

const CourseCard = ({ course, footerRight, topRightBadge, onClick }) => {
  const navigate = useNavigate();

  const teacherName = course.teacher?.name || 'Aliou Sow';
  const chaptersCount = course.chaptersCount ?? course.chapters?.length ?? 0;
  const studentsCount = course.studentsCount ?? 0;

  const subjectMeta = getSubjectMeta(course.subject);
  const SubjectIcon = subjectMeta?.icon || GraduationCap;

  const targetUrl = `/courses/${course._id}`;

  const handleCardClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      navigate(targetUrl);
    }
  };

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
        {/* En-tête : Matière + Classe (clair, sans badges redondants) */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-100 rounded-full px-2.5 py-0.5 truncate">
            <SubjectIcon className="w-3 h-3 shrink-0 text-sky-600" />
            <span className="truncate">{course.subject || 'Matière'}</span>
          </span>
          <span className="text-[11px] font-semibold bg-amber-50 text-[#d97706] border border-amber-100 rounded-full px-2.5 py-0.5 shrink-0">
            {formatClassLabel(course.level)}
          </span>
        </div>

        {/* Titre de la matière / programme */}
        <h3 className="text-[15px] font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.6rem] group-hover:text-[#009688] transition-colors">
          {course.title}
        </h3>

        {/* Durée & chapitres */}
        <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{course.duration || '3 mois'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-[#f59d0e] shrink-0" />
            <span className="font-medium text-slate-700">
              {chaptersCount} chapitre{chaptersCount > 1 ? 's' : ''}
            </span>
          </span>
        </div>

        {/* Pied de carte : enseignant + nombre d'élèves + CTA Commencer gratuitement */}
        <div className="mt-auto pt-3">
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 min-w-0">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                {getInitials(teacherName)}
              </span>
              <span className="text-xs font-medium text-slate-600 truncate">{teacherName}</span>
            </span>

            <span className="text-xs text-slate-500 shrink-0">
              <strong className="text-slate-700">{studentsCount}</strong> élève{studentsCount > 1 ? 's' : ''}
            </span>
          </div>

          {footerRight ? (
            <div className="mt-2.5">{footerRight}</div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleCardClick(e);
              }}
              className="w-full mt-3 py-2 px-3 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Commencer gratuitement</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleCardClick(e);
      }}
      className="group h-full flex flex-col bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 transition cursor-pointer"
    >
      {cardContent}
    </div>
  );
};

export default CourseCard;
