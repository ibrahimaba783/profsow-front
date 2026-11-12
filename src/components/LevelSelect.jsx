import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, GraduationCap } from 'lucide-react';

const DEFAULT_OPTIONS = [
  { value: 'Tous', label: 'Tous les niveaux' },
  { value: '4ème', label: '4ème' },
  { value: '3ème', label: '3ème' },
  { value: '2nde S', label: '2nde S' },
  { value: '1ère S', label: '1ère S' },
  { value: 'TS', label: 'Terminale S' },
];

const LevelSelect = ({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  size = 'md',
  ariaLabel = 'Filtrer par niveau',
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];
  const isFiltered = value && value !== 'Tous';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const sizeClasses =
    size === 'sm'
      ? 'h-9 pl-3.5 pr-3 text-xs'
      : size === 'lg'
      ? 'h-11 pl-4 pr-3.5 text-sm'
      : 'h-10 pl-4 pr-3.5 text-sm';

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`${sizeClasses} inline-flex items-center gap-2 rounded-full border font-medium transition-all duration-200 cursor-pointer outline-none ${
          isFiltered
            ? 'bg-[#009688] border-[#009688] text-white shadow-sm'
            : open
            ? 'bg-white border-[#009688] text-[#009688] ring-4 ring-[#009688]/10'
            : 'bg-white border-slate-300 text-slate-800 hover:border-[#009688] hover:text-[#009688]'
        }`}
      >
        <GraduationCap
          className={`w-4 h-4 shrink-0 ${
            isFiltered ? 'text-white' : open ? 'text-[#009688]' : 'text-[#f59d0e]'
          }`}
        />
        <span className="whitespace-nowrap">{selectedOption?.label}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          } ${isFiltered ? 'text-white/90' : 'text-slate-400'}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 mt-2 w-56 rounded-2xl bg-white border border-slate-100 shadow-[0_14px_34px_rgba(15,23,42,0.12)] p-1.5 z-50"
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Niveau d&apos;étude
          </div>
          <div className="space-y-0.5">
            {options.map((opt) => {
              const selected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition cursor-pointer ${
                    selected
                      ? 'bg-[#e0f2f1] text-[#00796b] font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#009688]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {selected && (
                    <span className="w-5 h-5 rounded-full bg-[#009688] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" strokeWidth={2.5} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelSelect;
