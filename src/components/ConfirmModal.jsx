import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, Info, X } from 'lucide-react';

const VARIANTS = {
  danger: {
    icon: Trash2,
    iconWrap: 'bg-red-50 text-red-600 border border-red-100',
    badge: 'bg-red-50 text-red-700',
    confirmBtn: 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/20',
  },
  warning: {
    icon: AlertTriangle,
    iconWrap: 'bg-amber-50 text-[#f59d0e] border border-amber-100',
    badge: 'bg-amber-50 text-[#e08b00]',
    confirmBtn: 'bg-[#f59d0e] hover:bg-[#e08b00] text-white shadow-sm shadow-amber-500/20',
  },
  info: {
    icon: Info,
    iconWrap: 'bg-teal-50 text-[#009688] border border-teal-100',
    badge: 'bg-teal-50 text-[#009688]',
    confirmBtn: 'bg-[#009688] hover:bg-[#00796b] text-white shadow-sm shadow-teal-600/20',
  },
};

const ConfirmModal = ({
  open,
  title = 'Confirmer l’action',
  message = '',
  details = '',
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onCancel?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const style = VARIANTS[variant] || VARIANTS.danger;
  const Icon = style.icon;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-xs modal-backdrop-anim"
      onClick={() => !loading && onCancel?.()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.iconWrap}`}>
              <Icon className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#009688]">
                Aliou Sow Academy
              </span>
              <h3 id="confirm-modal-title" className="text-base font-extrabold text-slate-900 truncate">
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            aria-label="Fermer"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-2.5">
          <p className="text-sm text-slate-700 leading-relaxed font-medium">{message}</p>
          {details && (
            <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 leading-relaxed">
              {details}
            </p>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="h-10 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold disabled:opacity-50 cursor-pointer transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`h-10 px-5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer transition ${style.confirmBtn}`}
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
