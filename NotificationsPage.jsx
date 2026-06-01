import { useEffect, useState } from 'react';
import { notifApi } from '../../api/client';
import { Bell, Check, CheckCheck, AlertTriangle, Pill, Calendar, MessageCircle, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader, EmptyState } from '../../components/UI';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  medication: { icon: Pill, color: 'bg-blue-50 text-blue-600' },
  appointment: { icon: Calendar, color: 'bg-teal-50 text-teal-600' },
  message: { icon: MessageCircle, color: 'bg-purple-50 text-purple-600' },
  location_alert: { icon: MapPin, color: 'bg-red-50 text-red-600' },
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await notifApi.list(); setNotifs(r.data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markOne = async (id) => {
    await notifApi.markRead(id);
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAll = async () => {
    await notifApi.markAllRead();
    setNotifs(ns => ns.map(n => ({ ...n, is_read: true })));
    toast.success('All marked as read');
  };

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <div className="p-8">
      <PageHeader icon={Bell} title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}
        action={unread > 0 && (
          <button onClick={markAll}
            className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
            <CheckCheck size={15} /> Mark all read
          </button>
        )} />

      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">Loading…</div>
      ) : notifs.length === 0 ? (
        <EmptyState icon={Bell} message="No notifications yet" />
      ) : (
        <div className="space-y-2">
          {notifs.map(n => {
            const meta = TYPE_ICONS[n.type] || { icon: Bell, color: 'bg-gray-50 text-gray-500' };
            const Icon = meta.icon;
            return (
              <div key={n.id}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition fade-in ${n.is_read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                  <Icon size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${n.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">{format(new Date(n.created_at), 'dd MMM yyyy · HH:mm')}</p>
                </div>
                {!n.is_read && (
                  <button onClick={() => markOne(n.id)}
                    className="flex-shrink-0 p-2 text-blue-500 hover:bg-blue-100 rounded-xl transition">
                    <Check size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
