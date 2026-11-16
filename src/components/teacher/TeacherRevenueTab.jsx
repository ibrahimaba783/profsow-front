import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Plus,
  CheckCircle2,
  X,
  Smartphone,
} from 'lucide-react';

const USE_MOCK = false; // TODO: supprimer

const MOCK_TRANSACTIONS = [
  {
    id: 'mtx-1',
    user: 'Fatou Diop',
    type: 'Paiement (Wave/OM)',
    motif: 'Maîtriser les Intégrales',
    date: new Date('2026-11-20T20:30:00'),
    amount: 10000,
    isWithdrawal: false,
    status: 'Validé',
  },
  {
    id: 'mtx-2',
    user: 'Moussa Traoré',
    type: 'Paiement (Wave/OM)',
    motif: 'Mécanique & Lois de Newton',
    date: new Date('2026-11-20T20:30:00'),
    amount: 8000,
    isWithdrawal: false,
    status: 'Validé',
  },
  {
    id: 'mtx-3',
    user: 'Aïssatou Sow',
    type: 'Paiement (Wave/OM)',
    motif: 'Équations & Fonctions',
    date: new Date('2026-11-20T20:30:00'),
    amount: 5000,
    isWithdrawal: false,
    status: 'Validé',
  },
  {
    id: 'mtx-4',
    user: 'Professeur',
    type: 'Retrait (Wave)',
    motif: 'Vers Wave',
    date: new Date('2026-11-20T20:02:00'),
    amount: -150000,
    isWithdrawal: true,
    status: 'Validé',
  },
  {
    id: 'mtx-5',
    user: 'Professeur',
    type: 'Retrait (Wave)',
    motif: 'Vers Wave',
    date: new Date('2026-11-20T19:04:00'),
    amount: -150000,
    isWithdrawal: true,
    status: 'Validé',
  },
];

const TeacherRevenueTab = ({
  user,
  settings,
  students = [],
  onNavigateSettings,
  showToast,
}) => {
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState('wave');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawHistory, setWithdrawHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('profsow_teacher_withdrawals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const now = useMemo(() => new Date(), []);

  const waveNumber =
    user?.preferences?.waveNumber ||
    settings?.siteInfo?.waveNumber ||
    user?.phone ||
    '+221 77 102 33 99';

  const orangeNumber =
    user?.preferences?.orangeMoneyNumber ||
    settings?.siteInfo?.orangeMoneyNumber ||
    user?.phone ||
    '+221 77 102 33 99';

  const stats = useMemo(() => {
    if (USE_MOCK) {
      return {
        totalRevenue: 1420000,
        availableBalance: 285000,
        monthSalesCount: 42,
        waveTotal: 950000,
        orangeTotal: 470000,
      };
    }

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let totalRevenue = 0;
    let monthSalesCount = 0;
    let waveTotal = 0;
    let orangeTotal = 0;

    students.forEach((sub) => {
      if (sub.status === 'suspended') return;
      const amt = Number(sub.amount || 0);
      const d = new Date(sub.createdAt || sub.startDate || now);
      totalRevenue += amt;
      if (d >= startOfMonth && amt > 0) monthSalesCount++;

      const m = String(sub.paymentMethod || 'wave').toLowerCase();
      if (m.includes('orange') || m.includes('om')) orangeTotal += amt;
      else waveTotal += amt;
    });

    const withdrawnTotal = withdrawHistory.reduce(
      (sum, w) => sum + Number(w.amount || 0),
      0
    );
    const availableBalance = Math.max(0, totalRevenue - withdrawnTotal);

    return {
      totalRevenue,
      availableBalance,
      monthSalesCount,
      waveTotal,
      orangeTotal,
    };
  }, [students, withdrawHistory, now]);

  const transactions = useMemo(() => {
    if (USE_MOCK) return MOCK_TRANSACTIONS;

    const subRows = students.map((sub) => {
      const m = String(sub.paymentMethod || 'Wave').toLowerCase();
      const isOrange = m.includes('orange') || m.includes('om');
      return {
        id: sub._id,
        user: sub.student?.name || 'Élève',
        type: isOrange ? 'Paiement (OM)' : 'Paiement (Wave)',
        motif: sub.course?.title || 'Formation',
        date: new Date(sub.createdAt || sub.startDate || now),
        amount: Number(sub.amount || 0),
        isWithdrawal: false,
        status: sub.status === 'suspended' ? 'Suspendu' : 'Validé',
      };
    });

    const withdrawRows = withdrawHistory.map((w) => ({
      id: w.id,
      user: user?.name || 'Professeur',
      type: `Retrait (${w.method === 'orange' ? 'Orange Money' : 'Wave'})`,
      motif: `Vers ${w.phone}`,
      date: new Date(w.date),
      amount: -Number(w.amount || 0),
      isWithdrawal: true,
      status: 'Validé',
    }));

    return [...withdrawRows, ...subRows].sort((a, b) => b.date - a.date);
  }, [students, withdrawHistory, user?.name, now]);

  const handleRequestWithdrawal = (e) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    if (!amt || amt < 1000) {
      showToast?.('error', 'Veuillez saisir un montant valide (minimum 1 000 F CFA).');
      return;
    }
    if (amt > stats.availableBalance) {
      showToast?.('error', 'Le montant demandé dépasse votre solde disponible.');
      return;
    }

    const phone = withdrawMethod === 'orange' ? orangeNumber : waveNumber;
    const newEntry = {
      id: `wd-${Date.now()}`,
      method: withdrawMethod,
      phone,
      amount: amt,
      date: new Date().toISOString(),
    };
    const next = [newEntry, ...withdrawHistory];
    setWithdrawHistory(next);
    try {
      localStorage.setItem('profsow_teacher_withdrawals', JSON.stringify(next));
    } catch {
      // ignore storage quota errors
    }
    setWithdrawAmount('');
    setWithdrawModalOpen(false);
    showToast?.(
      'success',
      `Demande de retrait de ${amt.toLocaleString('fr-FR')} F CFA vers ${
        withdrawMethod === 'orange' ? 'Orange Money' : 'Wave'
      } (${phone}) enregistrée.`
    );
  };

  return (
    <div className="space-y-6 animate-fade-slide-up">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
          Revenus &amp; Paiements
        </h1>

        <button
          type="button"
          onClick={() => setWithdrawModalOpen(true)}
          className="gradient-button gradient-button--sm shrink-0"
        >
          <span className="gradient-text">
            <Plus className="w-4 h-4 text-[#4ecdc4]" />
            <span>Retirer mes gains</span>
          </span>
        </button>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Solde disponible */}
        <div className="uiverse-glow-card p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">Solde disponible</span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-600 text-[10px] font-extrabold border border-sky-200">
                wave
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-orange-400 text-[10px] font-extrabold">
                Orange Money
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between gap-2">
            <div className="whitespace-nowrap">
              <span className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tabular-nums tracking-tight">
                {stats.availableBalance.toLocaleString('fr-FR')}
              </span>
              <span className="text-sm font-bold text-slate-900 ml-1">F CFA</span>
            </div>
            <svg width="72" height="28" viewBox="0 0 72 28">
              <path
                d="M2 24 C 12 20, 18 14, 28 17 C 38 20, 48 6, 58 10 C 64 12, 68 6, 70 4"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Revenus totaux */}
        <div className="uiverse-glow-card p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">Revenus totaux</span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-2">
            <div className="whitespace-nowrap">
              <span className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tabular-nums tracking-tight">
                {stats.totalRevenue.toLocaleString('fr-FR')}
              </span>
              <span className="text-sm font-bold text-slate-900 ml-1">F CFA</span>
            </div>
            <svg width="72" height="28" viewBox="0 0 72 28">
              <path
                d="M2 23 C 14 18, 22 15, 34 11 C 46 8, 56 6, 70 3"
                fill="none"
                stroke="#059669"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Ventes ce mois */}
        <div className="uiverse-glow-card p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">Ventes ce mois</span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-2">
            <div className="whitespace-nowrap">
              <span className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tabular-nums tracking-tight">
                {stats.monthSalesCount}
              </span>
              <span className="text-lg font-extrabold text-slate-900 ml-1.5">
                achat{stats.monthSalesCount > 1 ? 's' : ''}
              </span>
            </div>
            <svg width="72" height="28" viewBox="0 0 72 28">
              <path
                d="M2 22 C 12 23, 20 15, 32 17 C 44 19, 52 8, 70 5"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Grille principale : Historique + Moyens de retrait */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Historique des transactions & retraits */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Historique des transactions &amp; retraits
            </h2>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center">
              <Wallet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">
                Aucune transaction pour le moment
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500">
                    <th className="py-3 px-4">Utilisateur</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Cours / Motif</th>
                    <th className="py-3 px-3">Date &amp; Heure</th>
                    <th className="py-3 px-3">Montant (F CFA)</th>
                    <th className="py-3 px-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {transactions.slice(0, 20).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {tx.user}
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {tx.type}
                      </td>
                      <td className="py-3 px-3 text-slate-700 max-w-[180px] truncate">
                        {tx.motif}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {tx.date.toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {tx.isWithdrawal
                          ? `${tx.amount.toLocaleString('fr-FR')} F CFA`
                          : `${tx.amount.toLocaleString('fr-FR')} F CFA`}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            tx.status === 'Validé'
                              ? 'bg-emerald-50 text-[#059669]'
                              : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Moyens de retrait */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Moyens de retrait</h2>

          <div className="grid grid-cols-2 gap-3">
            {/* Wave */}
            <div className="p-3 rounded-xl border border-slate-200/80 bg-white space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1.5 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-6 h-6 rounded-md bg-sky-100 text-sky-600 font-extrabold text-[11px] flex items-center justify-center shrink-0">
                    W
                  </span>
                  <span className="font-extrabold text-sm text-slate-900">wave</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[#059669] text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  Connecté
                </span>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-slate-600 text-center">
                  Numéro de mobile money
                </p>
                <p className="text-[11px] font-bold text-slate-900 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200 tabular-nums truncate text-center">
                  {waveNumber}
                </p>
                <button
                  type="button"
                  onClick={onNavigateSettings}
                  className="w-full py-1 px-2 rounded-lg border border-slate-200 hover:border-[#2563eb] text-[10px] font-semibold text-slate-700 hover:text-[#2563eb] transition cursor-pointer"
                >
                  Modifier le numéro de retrait
                </button>
              </div>
            </div>

            {/* Orange Money */}
            <div className="p-3 rounded-xl border border-slate-200/80 bg-white space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1.5 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-6 h-6 rounded-md bg-slate-900 text-orange-400 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                    OM
                  </span>
                  <span className="font-bold text-xs text-slate-900 leading-tight">
                    Orange Money
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[#059669] text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  Connecté
                </span>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-slate-600 text-center">
                  Numéro de mobile money
                </p>
                <p className="text-[11px] font-bold text-slate-900 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200 tabular-nums truncate text-center">
                  {orangeNumber}
                </p>
                <button
                  type="button"
                  onClick={onNavigateSettings}
                  className="w-full py-1 px-2 rounded-lg border border-slate-200 hover:border-[#2563eb] text-[10px] font-semibold text-slate-700 hover:text-[#2563eb] transition cursor-pointer"
                >
                  Modifier le numéro de retrait
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateSettings}
            className="w-full h-10 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold transition cursor-pointer shadow-sm"
          >
            Modifier le numéro de retrait
          </button>
        </div>
      </div>

      {/* Modal Retrait */}
      <AnimatePresence>
        {withdrawModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-100 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setWithdrawModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Retirer mes gains
                  </h3>
                  <p className="text-xs text-slate-500">
                    Solde disponible :{' '}
                    <strong className="text-[#059669]">
                      {stats.availableBalance.toLocaleString('fr-FR')} F CFA
                    </strong>
                  </p>
                </div>
              </div>

              <form onSubmit={handleRequestWithdrawal} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Opérateur de retrait
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('wave')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        withdrawMethod === 'wave'
                          ? 'border-[#2563eb] bg-blue-50/50 ring-2 ring-[#2563eb]/15'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-xs font-extrabold text-slate-900">Wave</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {waveNumber}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('orange')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        withdrawMethod === 'orange'
                          ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/15'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-xs font-extrabold text-slate-900">Orange Money</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {orangeNumber}
                      </p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Montant à retirer (F CFA)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max={stats.availableBalance || undefined}
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="ex: 50000"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#2563eb]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawModalOpen(false)}
                    className="h-10 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold cursor-pointer shadow-sm"
                  >
                    Confirmer le retrait
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherRevenueTab;
