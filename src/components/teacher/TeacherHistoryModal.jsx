import React, { useState } from 'react';
import { History, X, Search, Filter, BookOpen, Calculator, Award, MessageSquare, Megaphone, Users, CheckCircle } from 'lucide-react';

const TeacherHistoryModal = ({ isOpen, onClose, activities = [], formatDateShort }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  if (!isOpen) return null;

  const filtered = activities.filter((act) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q || act.title?.toLowerCase().includes(q) || act.subtitle?.toLowerCase().includes(q);
    const matchType = filterType === 'all' || act.type === filterType;
    return matchSearch && matchType;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'sub':
        return <Users className="w-4 h-4 text-emerald-600" />;
      case 'homework':
        return <Calculator className="w-4 h-4 text-amber-600" />;
      case 'quiz':
        return <Award className="w-4 h-4 text-purple-600" />;
      case 'qa':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'broadcast':
        return <Megaphone className="w-4 h-4 text-teal-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4c3882] flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Historique d'Activité Pédagogique</h3>
              <p className="text-xs text-slate-400">Journal complet des actions et interactions</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher dans l'historique..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-[#4c3882]"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-[11px] font-semibold">
            {[
              { id: 'all', label: 'Tout' },
              { id: 'sub', label: 'Inscriptions' },
              { id: 'homework', label: 'Devoirs' },
              { id: 'qa', label: 'Q&R' },
              { id: 'quiz', label: 'Quiz' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilterType(t.id)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  filterType === t.id
                    ? 'bg-white text-slate-900 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events list */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-slate-400 text-xs">Aucun événement dans l'historique.</p>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 flex items-start gap-3 transition"
              >
                <div className="p-2 rounded-xl bg-white border border-slate-200 shrink-0">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatDateShort(item.date)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.subtitle}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherHistoryModal;
