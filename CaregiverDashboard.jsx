import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apptApi, notifApi, locationApi, medsApi } from '../../api/client';
import { format } from 'date-fns';
import { MapPin, Calendar, Bell, Pill, Shield, AlertTriangle } from 'lucide-react';
import { StatCard, PageHeader } from '../../components/UI';

export default function CaregiverDashboard() {
  const { user } = useAuth();
  const [appts, setAppts] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [meds, setMeds] = useState([]);
  const [location, setLocation] = useState(null);

  const patientId = 1; // In production this comes from assigned patient

  useEffect(() => {
    apptApi.getByPatient(patientId).then(r => setAppts(r.data)).catch(() => {});
    notifApi.list().then(r => setNotifs(r.data)).catch(() => {});
    medsApi.getByPatient(patientId).then(r => setMeds(r.data)).catch(() => {});
    locationApi.latest(patientId).then(r => setLocation(r.data)).catch(() => {});
  }, []);

  const upcoming = appts.filter(a => new Date(a.scheduled_at) > new Date()).slice(0, 3);
  const alerts = notifs.filter(n => n.type === 'location_alert' || n.type === 'medication');

  return (
    <div className="p-8">
      <PageHeader title={`Hello, ${user?.full_name?.split(' ')[0]} 🤝`}
        subtitle="Patient care overview" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={MapPin} label="Location status"
          value={location ? (location.is_safe_zone ? '✓ Safe' : '⚠️ Alert') : '—'}
          color={location?.is_safe_zone === false ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-600'} delay="fade-in-1" />
        <StatCard icon={Pill} label="Active medications" value={meds.length} color="bg-blue-50 text-blue-600" delay="fade-in-2" />
        <StatCard icon={Calendar} label="Upcoming appointments" value={upcoming.length} color="bg-purple-50 text-purple-600" delay="fade-in-3" />
        <StatCard icon={Bell} label="Active alerts" value={alerts.filter(a => !a.is_read).length} color="bg-amber-50 text-amber-600" delay="fade-in-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 fade-in fade-in-1">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={17} className="text-blue-600" /> Patient location
          </h2>
          {location ? (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${location.is_safe_zone ? 'bg-teal-50' : 'bg-red-50'}`}>
              {location.is_safe_zone ? <Shield size={20} className="text-teal-600" /> : <AlertTriangle size={20} className="text-red-600" />}
              <div>
                <p className={`font-semibold text-sm ${location.is_safe_zone ? 'text-teal-800' : 'text-red-800'}`}>
                  {location.is_safe_zone ? 'Patient is safe' : 'Outside safe zone!'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {format(new Date(location.recorded_at), 'dd MMM HH:mm')}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No location data available</p>
          )}
        </div>

        {/* Medications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 fade-in fade-in-2">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Pill size={17} className="text-blue-600" /> Today's medications
          </h2>
          {meds.length === 0 ? (
            <p className="text-gray-400 text-sm">No medications</p>
          ) : (
            <div className="space-y-2">
              {meds.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.dosage} · {m.frequency}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
                    {m.reminder_times?.split(',')[0]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming appointments */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 fade-in fade-in-3 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={17} className="text-teal-600" /> Upcoming appointments
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-gray-400 text-sm">No upcoming appointments</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {upcoming.map(a => (
                <div key={a.id} className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-900">{a.location}</p>
                  <p className="text-xs text-gray-500 mt-1">{format(new Date(a.scheduled_at), 'EEE d MMM · HH:mm')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
