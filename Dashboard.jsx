import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { medsApi, apptApi, notifApi, recordsApi } from '../../api/client';
import { format } from 'date-fns';
import { Pill, Calendar, Bell, FileText, MapPin, CheckCircle } from 'lucide-react';
import { StatCard, PageHeader } from '../../components/UI';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [meds, setMeds] = useState([]);
  const [appts, setAppts] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    const pid = user.id;
    medsApi.getByPatient(pid).then(r => setMeds(r.data)).catch(() => {});
    apptApi.getByPatient(pid).then(r => setAppts(r.data)).catch(() => {});
    notifApi.list().then(r => setNotifs(r.data)).catch(() => {});
    recordsApi.getByPatient(pid).then(r => setRecords(r.data)).catch(() => {});
  }, [user]);

  const upcoming = appts.filter(a => new Date(a.scheduled_at) > new Date() && a.status === 'scheduled').slice(0, 3);
  const unread = notifs.filter(n => !n.is_read);

  return (
    <div className="p-8">
      <PageHeader title={`Good morning, ${user?.full_name?.split(' ')[0]} 👋`}
        subtitle={format(new Date(), 'EEEE, d MMMM yyyy')} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Pill} label="Active medications" value={meds.length} color="bg-blue-50 text-blue-600" delay="fade-in-1" />
        <StatCard icon={Calendar} label="Upcoming appointments" value={upcoming.length} color="bg-teal-50 text-teal-600" delay="fade-in-2" />
        <StatCard icon={Bell} label="Unread alerts" value={unread.length} color="bg-amber-50 text-amber-600" delay="fade-in-3" />
        <StatCard icon={FileText} label="Medical records" value={records.length} color="bg-purple-50 text-purple-600" delay="fade-in-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's medications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 fade-in fade-in-1">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Pill size={17} className="text-blue-600" /> Today's medications
          </h2>
          {meds.length === 0 ? (
            <p className="text-gray-400 text-sm">No active medications</p>
          ) : (
            <div className="space-y-2.5">
              {meds.map(med => (
                <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{med.name}</p>
                    <p className="text-xs text-gray-500">{med.dosage} · {med.frequency}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg font-medium">
                    {med.reminder_times?.split(',')[0]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming appointments */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 fade-in fade-in-2">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={17} className="text-teal-600" /> Upcoming appointments
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-gray-400 text-sm">No upcoming appointments</p>
          ) : (
            <div className="space-y-2.5">
              {upcoming.map(appt => (
                <div key={appt.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <MapPin size={13} className="text-gray-400" /> {appt.location}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-5">
                    {format(new Date(appt.scheduled_at), 'EEE d MMM · HH:mm')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 fade-in fade-in-3 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell size={17} className="text-amber-600" /> Recent notifications
          </h2>
          {notifs.length === 0 ? (
            <p className="text-gray-400 text-sm">No notifications</p>
          ) : (
            <div className="space-y-2">
              {notifs.slice(0, 6).map(n => (
                <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl transition ${n.is_read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? 'bg-gray-300' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500 truncate">{n.body}</p>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">{format(new Date(n.created_at), 'HH:mm')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
