import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apptApi, notifApi, usersApi } from '../../api/client';
import { format } from 'date-fns';
import { Users, Calendar, Bell, FileText, Clock, MapPin } from 'lucide-react';
import { StatCard, PageHeader } from '../../components/UI';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appts, setAppts] = useState([]);
  const [patients, setPatients] = useState([]);
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    apptApi.getByDoctor(user.id).then(r => setAppts(r.data)).catch(() => {});
    usersApi.patients().then(r => setPatients(r.data)).catch(() => {});
    notifApi.list().then(r => setNotifs(r.data)).catch(() => {});
  }, [user]);

  const upcoming = appts.filter(a => new Date(a.scheduled_at) > new Date() && a.status === 'scheduled').slice(0, 5);
  const unread = notifs.filter(n => !n.is_read);

  return (
    <div className="p-8">
      <PageHeader title={`Welcome, Dr. ${user?.full_name?.split(' ').slice(-1)[0]} 👨‍⚕️`}
        subtitle={format(new Date(), 'EEEE, d MMMM yyyy')} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total patients" value={patients.length} color="bg-blue-50 text-blue-600" delay="fade-in-1" />
        <StatCard icon={Calendar} label="Upcoming appointments" value={upcoming.length} color="bg-teal-50 text-teal-600" delay="fade-in-2" />
        <StatCard icon={Bell} label="Unread alerts" value={unread.length} color="bg-amber-50 text-amber-600" delay="fade-in-3" />
        <StatCard icon={FileText} label="Total appointments" value={appts.length} color="bg-purple-50 text-purple-600" delay="fade-in-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming appointments */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 fade-in fade-in-1">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={17} className="text-teal-600" /> Upcoming appointments
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-gray-400 text-sm">No upcoming appointments</p>
          ) : (
            <div className="space-y-2.5">
              {upcoming.map(a => (
                <div key={a.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Clock size={13} className="text-gray-400" />
                    {format(new Date(a.scheduled_at), 'EEE d MMM · HH:mm')}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <MapPin size={11} className="text-gray-400" /> {a.location} · Patient #{a.patient_id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Patients */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 fade-in fade-in-2">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={17} className="text-blue-600" /> Patients ({patients.length})
          </h2>
          {patients.length === 0 ? (
            <p className="text-gray-400 text-sm">No patients assigned</p>
          ) : (
            <div className="space-y-2">
              {patients.slice(0, 6).map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">
                    {p.full_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.full_name}</p>
                    <p className="text-xs text-gray-400">{p.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 fade-in fade-in-3 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell size={17} className="text-amber-600" /> Recent alerts
          </h2>
          <div className="space-y-2">
            {notifs.slice(0, 5).map(n => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl ${n.is_read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? 'bg-gray-300' : 'bg-blue-500'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500">{n.body}</p>
                </div>
                <p className="text-xs text-gray-400">{format(new Date(n.created_at), 'HH:mm')}</p>
              </div>
            ))}
            {notifs.length === 0 && <p className="text-gray-400 text-sm">No alerts</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
