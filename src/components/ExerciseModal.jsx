import React, { useState, useEffect } from 'react';
import { X, FileText, ImagePlus, Video, Calculator } from 'lucide-react';
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
    formData.append('correctionVideoUrl', correctionVideoUrl.trim());
    formData.append('correctionVisibility', correctionVisibility);
    formData.append('deadline', deadline || '');
    formData.append('isRequired', isRequired);
    formData.append('subscribersOnly', subscribersOnly);

    if (statementImageFile) formData.append('statementImage', statementImageFile);
    if (statementPdfFile) formData.append('statementPdf', statementPdfFile);
    if (correctionPdfFile) formData.append('correctionPdf', correctionPdfFile);

    try {
      const saved = editingExercise
        ? await api(`/exercises/${editingExercise._id}`, { method: 'PUT', body: formData })
        : await api('/exercises', { method: 'POST', body: formData });
      onSaved?.(saved, Boolean(editingExercise));
      onClose?.();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement de l'exercice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <span className="w-9 h-9 rounded-xl bg-teal-50 text-[#009688] flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {editingExercise ? "Modifier l'exercice" : 'Ajouter un exercice'}
            </h3>
            <p className="text-xs text-slate-500">
              Formules LaTeX supportées : <code className="bg-slate-100 px-1 rounded">$x^2 + 1$</code> ou{' '}
              <code className="bg-slate-100 px-1 rounded">$$\int_0^1 f(t)\,dt$$</code>
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          {/* Rattachement + Type + Difficulté */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {courses.length > 1 && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Matière</label>
                <select
                  value={courseId}
                  onChange={(e) => {
                    setCourseId(e.target.value);
                    setChapterId('');
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white"
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
              <label className="block text-xs font-bold text-slate-600 mb-1">Chapitre rattaché</label>
              <select
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-600 mb-1">Titre</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Exercice 1 : Nombres complexes"
                className="w-full h-10 px-3 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Type</label>
              <select
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white"
              >
                <option value="application">Exercice d&apos;application</option>
                <option value="probleme">Problème</option>
                <option value="devoir">Devoir à la maison</option>
                <option value="annale">Sujet de bac / Annale</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Difficulté</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white"
              >
                <option value="facile">Facile</option>
                <option value="moyen">Moyen</option>
                <option value="difficile">Difficile</option>
              </select>
            </div>
          </div>

          {/* Énoncé */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Énoncé &amp; Pièces jointes
              </label>
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="text-xs font-bold text-[#009688] hover:underline cursor-pointer"
              >
                {showPreview ? 'Masquer aperçu formules' : 'Aperçu rendu maths'}
              </button>
            </div>

            <textarea
              rows={4}
              value={statementText}
              onChange={(e) => setStatementText(e.target.value)}
              placeholder="Saisissez l'énoncé (ex: Soit $f(x) = \frac{x^2 - 1}{x + 2}$. Calculer $\lim_{x \to +\infty} f(x)$...)"
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm resize-y"
            />

            {showPreview && statementText && (
              <div className="bg-white border border-teal-100 rounded-xl p-3 text-sm text-slate-800">
                <p className="text-[10px] font-bold uppercase text-[#009688] mb-1">Aperçu rendu</p>
                <MathText text={statementText} />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer">
                <ImagePlus className="w-4 h-4 text-[#009688] shrink-0" />
                <span className="truncate text-slate-600">
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
              <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer">
                <FileText className="w-4 h-4 text-[#f59d0e] shrink-0" />
                <span className="truncate text-slate-600">
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
          <div className="bg-teal-50/40 border border-teal-200/70 rounded-2xl p-4 space-y-3">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#009688]">
              Indications &amp; Correction détaillée
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Indications / Indices (visibles avant la correction)
              </label>
              <textarea
                rows={2}
                value={hints}
                onChange={(e) => setHints(e.target.value)}
                placeholder="ex: Pensez à utiliser le théorème des valeurs intermédiaires sur $[0 ; 1]$."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Correction rédigée (formules LaTeX supportées)
              </label>
              <textarea
                rows={4}
                value={correctionText}
                onChange={(e) => setCorrectionText(e.target.value)}
                placeholder="Détaillez les étapes de résolution..."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer">
                <FileText className="w-4 h-4 text-[#009688] shrink-0" />
                <span className="truncate text-slate-600">
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

              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2.5">
                <Video className="w-4 h-4 text-rose-500 shrink-0" />
                <input
                  type="url"
                  value={correctionVideoUrl}
                  onChange={(e) => setCorrectionVideoUrl(e.target.value)}
                  placeholder="Vidéo correction YouTube (optionnel)"
                  className="w-full h-9 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Quand la correction devient visible aux élèves
              </label>
              <select
                value={correctionVisibility}
                onChange={(e) => setCorrectionVisibility(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
              >
                <option value="immediate">Tout de suite</option>
                <option value="after_attempt">Après la tentative / le rendu de l&apos;élève</option>
                <option value="after_deadline">Après la date limite</option>
              </select>
            </div>
          </div>

          {/* Paramètres */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Date limite (optionnelle)</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white"
              />
            </div>

            <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer pt-4 sm:pt-0">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
              />
              Exercice obligatoire
            </label>

            <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer pt-2 sm:pt-0">
              <input
                type="checkbox"
                checked={subscribersOnly}
                onChange={(e) => setSubscribersOnly(e.target.checked)}
              />
              Réservé aux abonnés actifs
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
            >
              {saving ? 'Enregistrement...' : editingExercise ? 'Mettre à jour' : "Créer l'exercice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExerciseModal;
