import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, GraduationCap, ArrowRight, Play, Users } from 'lucide-react';
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
  const [imageError, setImageError] = useState(false);

  const teacherName = course.teacher?.name || 'Aliou Sow';
  const chaptersCount = course.chaptersCount ?? course.chapters?.length ?? 0;
  const lessonsCount =
    course.lessonsCount ??
    course.chapters?.reduce((sum, ch) => sum + (ch.lessonsCount ?? ch.lessons?.length ?? 0), 0) ??
    0;
  const studentsCount = course.studentsCount ?? course.enrolledStudentsCount ?? 0;

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

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleCardClick(e);
      }}
      className="group h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_45px_rgba(0,150,136,0.16)] hover:-translate-y-1.5 transition-all duration-300 border border-slate-200/80 hover:border-[#009688]/40 cursor-pointer"
    >
      {/* Vignette 16/9 avec bouton Play */}
      <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
        {course.image && !imageError ? (
          <img
            src={course.image}
            alt={course.title}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#009688] to-[#00796b] flex flex-col items-center justify-center text-white/90 p-4">
            <SubjectIcon className="w-12 h-12 mb-1 opacity-80" />
            <span className="text-xs font-semibold tracking-wide uppercase opacity-90">
              {course.subject || 'Sciences'}
            </span>
          </div>
        )}

        {/* Voile sombre léger au survol */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Bouton lecture circulaire en bas à droite */}
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/95 text-[#009688] flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#009688] group-hover:text-white transition-all duration-300 z-10">
          <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
        </div>

        {topRightBadge && (
          <div className="absolute top-2.5 right-2.5 z-10">{topRightBadge}</div>
        )}
      </div>

      {/* Contenu de la carte */}
      <div className="flex flex-col flex-1 p-5">
        {/* Badges : Matière + Classe */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-sky-50 text-sky-700 rounded-lg px-2.5 py-1 border border-sky-100">
            <SubjectIcon className="w-3 h-3 shrink-0 text-sky-600" />
            <span>{course.subject || 'Matière'}</span>
          </span>
          <span className="text-[11px] font-bold bg-amber-50 text-amber-800 rounded-lg px-2.5 py-1 border border-amber-200/60">
            {formatClassLabel(course.level)}
          </span>
        </div>

        {/* Titre */}
        <h3 className="text-base font-extrabold text-slate-900 leading-snug line-clamp-2 mb-3 group-hover:text-[#009688] transition-colors">
          {course.title}
        </h3>

        {/* Durée, chapitres & leçons */}
        <div className="flex items-center gap-3.5 text-xs text-slate-500 mb-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{course.duration || '3 mois'}</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {chaptersCount} chapitre{chaptersCount > 1 ? 's' : ''}
            </span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Play className="w-3.5 h-3.5 text-[#009688]" />
            <span>
              {lessonsCount} leçon{lessonsCount > 1 ? 's' : ''}
            </span>
          </span>
        </div>

        {/* Enseignant & nombre d'élèves */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#009688] to-[#00796b] text-white text-[11px] font-black flex items-center justify-center shrink-0 shadow-xs">
              {getInitials(teacherName)}
            </span>
            <div className="min-w-0">
              <span className="block text-[10px] text-slate-400 leading-none">Votre professeur</span>
              <span className="block text-xs font-bold text-slate-800 truncate">{teacherName}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-700">{studentsCount || 1}</span>
          </div>
        </div>

        {/* Bouton CTA */}
        {footerRight ? (
          <div className="mt-4">{footerRight}</div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleCardClick(e);
            }}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-700/20 group-hover:shadow-lg group-hover:shadow-teal-700/30"
          >
            <span>Commencer gratuitement</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
