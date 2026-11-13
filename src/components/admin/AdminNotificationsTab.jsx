import React, { useState } from 'react';
import {
  Bell,
  Send,
  CheckCircle,
  AlertTriangle,
  Info,
  ShieldAlert,
  CreditCard,
  UserPlus,
  Check,
  CheckCheck,
  Search,
  Filter,
  ExternalLink,
} from 'lucide-react';
import api from '../../utils/api';

const AdminNotificationsTab = ({
  notifications = [],
  onRefreshNotifications,
  onNavigateTab,
  setToast,
}) => {
  // Broadcast state
  const [broadcastTarget, setBroadcastTarget] = useState('all'); // all, student, teacher
  const [broadcastType, setBroadcastType] = useState('info'); // info, success, warning
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastLink, setBroadcastLink] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Filter state
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      setToast?.({ type: 'error', text: 'Veuillez remplir le titre et le message de la notification.' });
      return;
    }

    setSendingBroadcast(true);
    try {
      await api('/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          targetRole: broadcastTarget,
          type: broadcastType,
          title: broadcastTitle.trim(),
          message: broadcastMessage.trim(),
          link: broadcastLink.trim() || undefined,
        }),
      });

      setToast?.({ type: 'success', text: 'Notification diffusée aux destinataires avec succès !' });
      setBroadcastTitle('');
      setBroadcastMessage('');
      setBroadcastLink('');
      onRefreshNotifications?.();
    } catch (err) {
      console.error('Erreur diffusion notification :', err);
      setToast?.({ type: 'error', text: err.message || "Erreur lors de l'envoi de la diffusion." });
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api(`/notifications/${id}/read`, { method: 'PUT' });
      onRefreshNotifications?.();
    } catch (err) {
      console.error('Erreur marquage notification :', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api('/notifications/read-all', { method: 'PUT' });
      setToast?.({ type: 'success', text: 'Toutes les notifications ont été marquées comme lues.' });
      onRefreshNotifications?.();
    } catch (err) {
      console.error('Erreur marquage global :', err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      n.title?.toLowerCase().includes(q) ||
      n.message?.toLowerCase().includes(q);

    let matchType = true;
    if (filterType === 'unread') matchType = !n.read;
    else if (filterType === 'security') matchType = n.type === 'security_alert' || n.type === 'report';
    else if (filterType === 'subscription') matchType = n.type === 'subscription_expiring' || n.type === 'payment_failed';
    else if (filterType === 'user') matchType = n.type === 'user_registered';

    return matchSearch && matchType;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'security_alert':
        return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'report':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'subscription_expiring':
      case 'payment_failed':
        return <CreditCard className="w-5 h-5 text-teal-600" />;
      case 'user_registered':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-md px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#009688] to-[#00796b] text-white flex items-center justify-center shadow-sm shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Centre de Notifications & Alertes
              </h1>
              {unreadCount > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Recevez les alertes en temps réel et diffusez des annonces personnalisées aux élèves et professeurs.
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition shrink-0 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Main Grid : Formulaire de diffusion (gauche) & Alertes récentes (droite) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne gauche : Formulaire de diffusion (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Send className="w-5 h-5 text-[#009688]" />
            <h2 className="text-base font-bold text-slate-900">Diffuser une annonce générale</h2>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Destinataires cibles</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'Tous' },
                  { id: 'student', label: 'Élèves' },
                  { id: 'teacher', label: 'Profs' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setBroadcastTarget(t.id)}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      broadcastTarget === t.id
                        ? 'bg-[#009688] text-white border-[#009688] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Type de notification</label>
              <select
                value={broadcastType}
                onChange={(e) => setBroadcastType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#009688]"
              >
                <option value="info">Information générale (Bleu)</option>
                <option value="success">Félicitations / Offre spéciale (Vert)</option>
                <option value="warning">Avertissement important (Orange)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Titre de la notification</label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="Ex: Nouvelle session de direct en Mathématiques !"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:bg-white focus:border-[#009688]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Message détaillé</label>
              <textarea
                required
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Écrivez le message qui apparaîtra dans la boîte de notification des utilisateurs..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:bg-white focus:border-[#009688]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Lien de redirection (Optionnel)</label>
              <input
                type="text"
                value={broadcastLink}
                onChange={(e) => setBroadcastLink(e.target.value)}
                placeholder="Ex: /courses ou https://meet.google.com/..."
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:bg-white focus:border-[#009688]"
              />
            </div>

            <button
              type="submit"
              disabled={sendingBroadcast}
              className="w-full h-11 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {sendingBroadcast ? (
                <span>Envoi en cours...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Diffuser la notification maintenant
                </>
              )}
            </button>
          </form>
        </div>

        {/* Colonne droite : Alertes & Notifications reçues (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filtres & Recherche */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs">
              {[
                { id: 'all', label: 'Toutes' },
                { id: 'unread', label: 'Non lues' },
                { id: 'security', label: 'Sécurité & Signalements' },
                { id: 'subscription', label: 'Abonnements' },
                { id: 'user', label: 'Inscriptions' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterType(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    filterType === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrer..."
                className="h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-[#009688]"
              />
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="space-y-2.5">
            {filteredNotifications.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold text-sm">Aucune notification correspondante</p>
                <p className="text-slate-400 text-xs mt-1">Vous serez immédiatement averti dès qu'une activité nécessite votre attention.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`bg-white rounded-2xl p-4 shadow-sm border transition flex items-start gap-3.5 ${
                    notif.read ? 'border-slate-100 opacity-80' : 'border-teal-200 bg-teal-50/20'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-sm font-bold truncate ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {notif.link && (
                          <button
                            type="button"
                            onClick={() => {
                              if (notif.link.includes('security') && onNavigateTab) {
                                onNavigateTab('security');
                              } else if (notif.link.includes('subscriptions') && onNavigateTab) {
                                onNavigateTab('subscriptions');
                              } else if (notif.link.includes('users') && onNavigateTab) {
                                onNavigateTab('users');
                              } else {
                                window.location.href = notif.link;
                              }
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#009688] hover:underline"
                          >
                            Consulter <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {!notif.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(notif._id)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#009688] text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          Marquer lu
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsTab;
