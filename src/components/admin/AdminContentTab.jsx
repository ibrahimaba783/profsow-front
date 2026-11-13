import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Trash2,
  MessageSquare,
  Star,
  Plus,
  Save,
  MessageCircle,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle,
  X,
} from 'lucide-react';
import api from '../../utils/api';

const AdminContentTab = ({
  draftSettings,
  setDraftSettings,
  persistSettings,
  reviews = [],
  onDeleteReview,
  setToast,
  setConfirmState,
}) => {
  const [subTab, setSubTab] = useState('moderation'); // moderation, banner, faqs, testimonials
  const [discussions, setDiscussions] = useState([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);
  const [discussionSearch, setDiscussionSearch] = useState('');

  // Form states for FAQ & Testimonials
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [newTestimonial, setNewTestimonial] = useState({ name: '', level: '', quote: '' });

  // Fetch discussions for moderation
  const fetchDiscussions = async () => {
    setLoadingDiscussions(true);
    try {
      const data = await api('/admin/discussions');
      setDiscussions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur chargement discussions :', err);
    } finally {
      setLoadingDiscussions(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const handleDeleteDiscussion = (discussionId) => {
    setConfirmState?.({
      title: 'Supprimer ce message de discussion',
      message: 'Êtes-vous sûr de vouloir supprimer définitivement ce message du salon de discussion du cours ?',
      confirmText: 'Supprimer le message',
      danger: true,
      onConfirm: async () => {
        try {
          await api(`/admin/discussions/${discussionId}`, { method: 'DELETE' });
          setToast?.({ type: 'success', text: 'Message supprimé du salon de cours avec succès.' });
          setDiscussions((prev) => prev.filter((d) => d._id !== discussionId));
        } catch (err) {
          setToast?.({ type: 'error', text: err.message || 'Erreur lors de la suppression.' });
        }
      },
    });
  };

  const handleAddFaq = (e) => {
    e.preventDefault();
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return;
    const updated = [...(draftSettings.faqs || []), newFaq];
    setDraftSettings((prev) => ({ ...prev, faqs: updated }));
    persistSettings({ faqs: updated }, 'Nouvelle FAQ ajoutée !');
    setNewFaq({ question: '', answer: '' });
  };

  const handleRemoveFaq = (index) => {
    const updated = (draftSettings.faqs || []).filter((_, i) => i !== index);
    setDraftSettings((prev) => ({ ...prev, faqs: updated }));
    persistSettings({ faqs: updated }, 'FAQ supprimée.');
  };

  const handleAddTestimonial = (e) => {
    e.preventDefault();
    if (!newTestimonial.name.trim() || !newTestimonial.quote.trim()) return;
    const updated = [...(draftSettings.testimonials || []), newTestimonial];
    setDraftSettings((prev) => ({ ...prev, testimonials: updated }));
    persistSettings({ testimonials: updated }, 'Nouveau témoignage ajouté !');
    setNewTestimonial({ name: '', level: '', quote: '' });
  };

  const handleRemoveTestimonial = (index) => {
    const updated = (draftSettings.testimonials || []).filter((_, i) => i !== index);
    setDraftSettings((prev) => ({ ...prev, testimonials: updated }));
    persistSettings({ testimonials: updated }, 'Témoignage retiré.');
  };

  const filteredDiscussions = discussions.filter((d) => {
    const q = discussionSearch.trim().toLowerCase();
    return (
      !q ||
      d.user?.name?.toLowerCase().includes(q) ||
      d.message?.toLowerCase().includes(q) ||
      d.courseTitle?.toLowerCase().includes(q)
    );
  });

  const inputClass =
    'w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#009688] transition';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-md px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#009688] to-[#00796b] text-white flex items-center justify-center shadow-sm shrink-0">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Gestion des Contenus, Avis & Modération
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Modérez les avis et les discussions des élèves, gérez la bannière d'annonce, les FAQ et les témoignages.
            </p>
          </div>
        </div>

        {/* Sub-tabs pills */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 shrink-0">
          {[
            { id: 'moderation', label: 'Modération Avis & Salons' },
            { id: 'banner', label: "Bannière d'annonce" },
            { id: 'faqs', label: 'FAQ & Témoignages' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                subTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUBTAB 1 : MODÉRATION (Avis + Discussions de cours) */}
      {subTab === 'moderation' && (
        <div className="space-y-6">
          {/* Section 1: Modération des Avis */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <h2 className="text-base font-bold text-slate-900">
                  Avis et Notes des élèves ({reviews.length})
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Contrôle de conformité et réputation</span>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Aucun avis d'élève n'a encore été publié sur les modules.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reviews.map((r) => (
                  <div
                    key={r._id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{r.student?.name || 'Élève'}</span>
                        <span className="text-xs text-[#009688] font-semibold">• {r.course?.title}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: r.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 italic">"{r.comment}"</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteReview(r._id)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer border border-rose-200 shrink-0"
                      title="Supprimer cet avis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 2: Modération des Discussions de Cours */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#009688]" />
                <h2 className="text-base font-bold text-slate-900">
                  Modération des Discussions de cours ({discussions.length})
                </h2>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={discussionSearch}
                  onChange={(e) => setDiscussionSearch(e.target.value)}
                  placeholder="Rechercher par élève ou texte..."
                  className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-[#009688]"
                />
              </div>
            </div>

            {loadingDiscussions ? (
              <p className="text-center py-8 text-slate-400 text-xs">Chargement des messages...</p>
            ) : filteredDiscussions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Aucun message de discussion trouvé.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredDiscussions.map((msg) => (
                  <div
                    key={msg._id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/70 transition flex items-start justify-between gap-3 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{msg.user?.name || 'Auteur inconnu'}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                          {msg.courseTitle || 'Cours'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{msg.message}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteDiscussion(msg._id)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer border border-rose-200 shrink-0"
                      title="Supprimer ce message inapproprié"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* SUBTAB 2 : BANNIÈRE D'ANNONCE */}
      {subTab === 'banner' && (
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#009688]" />
              <h2 className="text-base font-bold text-slate-900">Bannière d'annonce globale</h2>
            </div>
            <button
              type="button"
              onClick={() =>
                setDraftSettings((prev) => ({
                  ...prev,
                  announcement: { ...prev.announcement, active: !prev.announcement?.active },
                }))
              }
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition ${
                draftSettings.announcement?.active
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {draftSettings.announcement?.active ? 'Activée sur le site' : 'Désactivée'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-600">Message affiché aux visiteurs</label>
              <input
                type="text"
                value={draftSettings.announcement?.message || ''}
                onChange={(e) =>
                  setDraftSettings((prev) => ({
                    ...prev,
                    announcement: { ...prev.announcement, message: e.target.value },
                  }))
                }
                placeholder="Ex: Inscriptions ouvertes pour les sessions intensives BFEM & Bac !"
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Texte du bouton d'action</label>
              <input
                type="text"
                value={draftSettings.announcement?.buttonText || ''}
                onChange={(e) =>
                  setDraftSettings((prev) => ({
                    ...prev,
                    announcement: { ...prev.announcement, buttonText: e.target.value },
                  }))
                }
                placeholder="Ex: En savoir plus"
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Lien de redirection</label>
              <input
                type="text"
                value={draftSettings.announcement?.link || ''}
                onChange={(e) =>
                  setDraftSettings((prev) => ({
                    ...prev,
                    announcement: { ...prev.announcement, link: e.target.value },
                  }))
                }
                placeholder="Ex: /courses"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() =>
                persistSettings({ announcement: draftSettings.announcement }, 'Bannière mise à jour avec succès !')
              }
              className="px-5 py-2.5 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Enregistrer la bannière
            </button>
          </div>
        </section>
      )}

      {/* SUBTAB 3 : FAQ & TÉMOIGNAGES */}
      {subTab === 'faqs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FAQ */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Foire aux Questions (FAQ)
            </h2>
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {(draftSettings.faqs || []).map((f, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{f.question}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{f.answer}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(idx)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg self-start cursor-pointer border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddFaq} className="space-y-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                required
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                placeholder="Nouvelle question..."
                className={inputClass}
              />
              <textarea
                required
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                placeholder="Réponse détaillée..."
                className="w-full h-20 p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:bg-white focus:border-[#009688]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold cursor-pointer shadow-sm"
              >
                Ajouter cette FAQ
              </button>
            </form>
          </section>

          {/* Témoignages */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Témoignages de la page d'accueil
            </h2>
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {(draftSettings.testimonials || []).map((t, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {t.name} <span className="text-[#009688]">({t.level})</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">"{t.quote}"</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTestimonial(idx)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg self-start cursor-pointer border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddTestimonial} className="space-y-2 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={newTestimonial.name}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                  placeholder="Nom de l'élève"
                  className={inputClass}
                />
                <input
                  type="text"
                  required
                  value={newTestimonial.level}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, level: e.target.value })}
                  placeholder="Classe (ex: Terminale S)"
                  className={inputClass}
                />
              </div>
              <textarea
                required
                value={newTestimonial.quote}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, quote: e.target.value })}
                placeholder="Citation ou avis de l'élève..."
                className="w-full h-20 p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:bg-white focus:border-[#009688]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold cursor-pointer shadow-sm"
              >
                Ajouter ce témoignage
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminContentTab;
