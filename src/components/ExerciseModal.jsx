import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, ImagePlus, Video, Calculator, Sparkles, Clock, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import MathText from './MathText';

const formatDatetimeLocal = (val) => {
  if (!val) return '';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
};

const ExerciseModal = ({
  open,
  onClose,
  courses = [],
  defaultCourseId = '',
  defaultChapterId = '',
  editingExercise = null,
  onSaved,
}) => {
  const [courseId, setCourseId] = useState(defaultCourseId || courses[0]?._id || '');
  const [chapterId, setChapterId] = useState(defaultChapterId || '');
  const [title, setTitle] = useState('');
  const [exerciseType, setExerciseType] = useState('application');
  const [difficulty, setDifficulty] = useState('moyen');
  const [statementText, setStatementText] = useState('');
  const [statementImageFile, setStatementImageFile] = useState(null);
  const [statementPdfFile, setStatementPdfFile] = useState(null);
  const [hints, setHints] = useState('');
  const [correctionText, setCorrectionText] = useState('');
  const [correctionPdfFile, setCorrectionPdfFile] = useState(null);
  const [correctionVideoUrl, setCorrectionVideoUrl] = useState('');
  const [correctionVisibility, setCorrectionVisibility] = useState('after_attempt');
  const [deadline, setDeadline] = useState('');
  const [isRequired, setIsRequired] = useState(true);
  const [subscribersOnly, setSubscribersOnly] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingExercise) {
      setCourseId(editingExercise.course?._id || editingExercise.course || defaultCourseId || '');
      setChapterId(editingExercise.chapterId || '');
      setTitle(editingExercise.title || '');
      setExerciseType(editingExercise.exerciseType || 'application');
      setDifficulty(editingExercise.difficulty || 'moyen');
      setStatementText(editingExercise.statementText || '');
      setHints(editingExercise.hints || '');
      setCorrectionText(editingExercise.correctionText || '');
      setCorrectionVideoUrl(editingExercise.correctionVideoUrl || '');
      setCorrectionVisibility(editingExercise.correctionVisibility || 'after_attempt');
      setDeadline(formatDatetimeLocal(editingExercise.deadline));
      setIsRequired(editingExercise.isRequired !== false);
      setSubscribersOnly(editingExercise.subscribersOnly !== false);
    } else {
      setCourseId(defaultCourseId || courses[0]?._id || '');
      setChapterId(defaultChapterId || '');
      setTitle('');
      setExerciseType('application');
      setDifficulty('moyen');
      setStatementText('');
      setHints('');
      setCorrectionText('');
      setCorrectionVideoUrl('');
      setCorrectionVisibility('after_attempt');
      setDeadline('');
      setIsRequired(true);
      setSubscribersOnly(true);
    }
    setStatementImageFile(null);
    setStatementPdfFile(null);
    setCorrectionPdfFile(null);
    setError('');
    setShowPreview(false);
  }, [open, editingExercise, defaultCourseId, defaultChapterId, courses]);

  if (!open) return null;

  const selectedCourse = courses.find((c) => c._id === courseId) || courses[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId || !title.trim()) return;
    setSaving(true);
    setError('');

    const formData = new FormData();
    formData.append('courseId', courseId);
    formData.append('chapterId', chapterId);
    formData.append('title', title.trim());
    formData.append('exerciseType', exerciseType);
    formData.append('difficulty', difficulty);
    formData.append('statementText', statementText);
    formData.append('hints', hints);
    formData.append('correctionText', correctionText);
    formData.append('correctionVideoUrl', correctionVideoUrl);
    formData.append('correctionVisibility', correctionVisibility);
    formData.append('deadline', deadline);
    formData.append('isRequired', String(isRequired));
    formData.append('subscribersOnly', String(subscribersOnly));

    if (statementImageFile) formData.append('statementImage', statementImageFile);
    if (statementPdfFile) formData.append('statementPdf', statementPdfFile);
    if (correctionPdfFile) formData.append('correctionPdf', correctionPdfFile);

    try {
      const url = editingExercise
        ? `/exercises/teacher/${editingExercise._id}`
        : '/exercises/teacher';
      const method = editingExercise ? 'PUT' : 'POST';
      const res = await api(url, {
        method,
        body: formData,
      });

      if (onSaved) onSaved(res, Boolean(editingExercise));
      onClose();
    } catch (err) {
      console.error("Erreur enregistrement exercice", err);
      setError(err.message || "Impossible d'enregistrer l'exercice.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#009688] focus:ring-4 focus:ring-[#009688]/10 transition shadow-2xs';

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_25px_70px_rgba(15,23,42,0.25)] relative max-h-[92vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* En-tête de la modal */}
        <div className="flex items-center gap-3.5 mb-6 pr-10">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-[#009688] flex items-center justify-center shrink-0 shadow-xs">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {editingExercise ? "Modifier l'exercice" : 'Ajouter un exercice'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Formules mathématiques supportées : <code className="bg-slate-100 text-[#009688] px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold">$x^2 + 1$</code> ou <code className="bg-slate-100 text-[#009688] px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold">$$\lim_{'{x\\to+\\infty}'} f(x)$$</code>
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          {/* Rattachement + Type + Difficulté */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {courses.length > 1 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Matière
                </label>
                <select
                  value={courseId}
                  onChange={(e) => {
                    setCourseId(e.target.value);
                    setChapterId('');
                  }}
                  className={inputClass}
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className={courses.length > 1 ? '' : 'sm:col-span-2'}>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Chapitre rattaché
              </label>
              <select
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                className={inputClass}
              >
                <option value="">Matière entière (hors chapitre spécifique)</option>
                {(selectedCourse?.chapters || []).map((ch) => (
                  <option key={ch._id} value={ch._id}>
                    {ch.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Titre
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Exercice 1 : Nombres complexes"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Type
              </label>
              <select
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value)}
                className={inputClass}
              >
                <option value="application">Exercice d'application</option>
                <option value="probleme">Problème</option>
                <option value="devoir">Devoir à la maison</option>
                <option value="annale">Sujet de bac / Annale</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Difficulté
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className={inputClass}
              >
                <option value="facile">Facile</option>
                <option value="moyen">Moyen</option>
                <option value="difficile">Difficile</option>
              </select>
            </div>
          </div>

          {/* Énoncé & Pièces Jointes */}
          <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#009688]" />
                <span>Énoncé &amp; Pièces jointes</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="text-xs font-bold text-[#009688] hover:text-[#00796b] transition cursor-pointer"
              >
                {showPreview ? 'Masquer aperçu formules' : 'Aperçu rendu maths'}
              </button>
            </div>

            <textarea
              rows={4}
              value={statementText}
              onChange={(e) => setStatementText(e.target.value)}
              placeholder="Saisissez l'énoncé (ex: Soit $f(x) = \frac{x^2 - 1}{x + 2}$. Calculer $\lim_{x \to +\infty} f(x)$...)"
              className="w-full p-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#009688] focus:ring-4 focus:ring-[#009688]/10 transition shadow-2xs resize-y"
            />

            {showPreview && statementText && (
              <div className="bg-white border border-teal-200 rounded-xl p-4 text-sm text-slate-800 shadow-2xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#009688] mb-1.5">
                  Aperçu du rendu mathématique
                </p>
                <MathText text={statementText} />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2.5 p-3 bg-white border border-slate-200 hover:border-[#009688]/50 rounded-xl cursor-pointer transition shadow-2xs">
                <ImagePlus className="w-4 h-4 text-[#009688] shrink-0" />
                <span className="truncate font-semibold text-slate-700">
                  {statementImageFile
                    ? statementImageFile.name
                    : editingExercise?.statementImage
                    ? 'Remplacer la figure (image)...'
                    : 'Figure / Schéma (image)'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setStatementImageFile(e.target.files[0])}
                />
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-white border border-slate-200 hover:border-amber-400/50 rounded-xl cursor-pointer transition shadow-2xs">
                <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate font-semibold text-slate-700">
                  {statementPdfFile
                    ? statementPdfFile.name
                    : editingExercise?.statementPdf
                    ? "Remplacer l'énoncé PDF..."
                    : 'Énoncé en PDF (optionnel)'}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setStatementPdfFile(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          {/* Indications & Correction */}
          <div className="bg-teal-50/30 border border-teal-200/60 rounded-2xl p-5 space-y-4">
            <label className="block text-xs font-black uppercase tracking-wider text-[#009688]">
              Indications &amp; Correction détaillée
            </label>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Indications / Indices (visibles avant la correction)
              </label>
              <textarea
                rows={2}
                value={hints}
                onChange={(e) => setHints(e.target.value)}
                placeholder="ex: Pensez à utiliser le théorème des valeurs intermédiaires sur $[0 ; 1]$."
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#009688] focus:ring-4 focus:ring-[#009688]/10 transition shadow-2xs resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Correction rédigée (formules LaTeX supportées)
              </label>
              <textarea
                rows={4}
                value={correctionText}
                onChange={(e) => setCorrectionText(e.target.value)}
                placeholder="Détaillez les étapes de résolution..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#009688] focus:ring-4 focus:ring-[#009688]/10 transition shadow-2xs resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2.5 p-3 bg-white border border-slate-200 hover:border-[#009688]/50 rounded-xl cursor-pointer transition shadow-2xs">
                <FileText className="w-4 h-4 text-[#009688] shrink-0" />
                <span className="truncate font-semibold text-slate-700">
                  {correctionPdfFile
                    ? correctionPdfFile.name
                    : editingExercise?.correctionPdf
                    ? 'Remplacer correction PDF...'
                    : 'Correction PDF (optionnel)'}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setCorrectionPdfFile(e.target.files[0])}
                />
              </label>

              <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-3 h-11 focus-within:border-[#009688] transition shadow-2xs">
                <Video className="w-4 h-4 text-rose-500 shrink-0" />
                <input
                  type="url"
                  value={correctionVideoUrl}
                  onChange={(e) => setCorrectionVideoUrl(e.target.value)}
                  placeholder="Vidéo correction YouTube (optionnel)"
                  className="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Quand la correction devient visible aux élèves
              </label>
              <select
                value={correctionVisibility}
                onChange={(e) => setCorrectionVisibility(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#009688] shadow-2xs"
              >
                <option value="immediate">Tout de suite</option>
                <option value="after_attempt">Après la tentative / le rendu de l'élève</option>
                <option value="after_deadline">Après la date limite</option>
              </select>
            </div>
          </div>

          {/* Paramètres & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Date limite (optionnelle)</span>
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#009688]"
              />
            </div>

            <label className="flex items-center gap-2.5 font-bold text-slate-700 cursor-pointer pt-4 sm:pt-0">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="w-4 h-4 rounded text-[#009688] accent-[#009688]"
              />
              <span>Exercice obligatoire</span>
            </label>

            <label className="flex items-center gap-2.5 font-bold text-slate-700 cursor-pointer pt-2 sm:pt-0">
              <input
                type="checkbox"
                checked={subscribersOnly}
                onChange={(e) => setSubscribersOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#009688] accent-[#009688]"
              />
              <span>Réservé aux abonnés actifs</span>
            </label>
          </div>

          {/* Actions du bas */}
          <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold transition shadow-md shadow-teal-700/20 hover:shadow-lg disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Enregistrement...' : editingExercise ? 'Mettre à jour' : "Créer l'exercice"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ExerciseModal;
