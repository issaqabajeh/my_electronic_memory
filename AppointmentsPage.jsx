import { useEffect, useState } from 'react';
import { apptApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { format, isPast } from 'date-fns';
import { Calendar, Plus, X, Save, CheckCircle, XCircle, Clock, MapPin, AlertCircle } from 'lucide-react';
import { PageHeader, EmptyState, Badge } from '../../components/UI';
import toast from 'react-hot-toast';

function ApptCard({ appt, canManage, onStatusChange }) {
  const overdue = isPast(new Date(appt.scheduled_at)) && appt.status === 'scheduled';
  return (
    <div className={`bg-white border rounded-2xl p-5 fade-in hover:shadow-sm transition ${
      appt.status === 'cancelled' ? 'border-gray-100 opacity-70' : 'border-gray-100'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            appt.status === 'completed' ? 'bg-teal-50' : appt.status === 'cancelled' ? 'bg-gray-100' : 'bg-blue-50'
          }`}>
            <Calendar size={17} className={appt.status === 'completed' ? 'text-teal-600' : appt.status === 'cancelled' ? 'text-gray-400' : 'text-blue-600'} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge status={appt.status} />
              {overdue && (
                <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle size={10} /> Overdue
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <Clock size={13} className="text-gray-400" />
              {format(new Date(appt.scheduled_at), 'EEEE, d MMMM yyyy · HH:mm')}
            </p>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <MapPin size={13} className="text-gray-400" /> {appt.location}
            </p>
            {appt.notes && <p className="text-xs text-gray-400 mt-1.5 bg-gray-50 rounded-lg px-3 py-1.5">{appt.notes}</p>}
            <p className="text-xs text-gray-400 mt-1.5">Patient #{appt.patient_id} · Doctor #{appt.doctor_id}</p>
          </div>
        </div>
        {canManage && appt.status === 'scheduled' && (
          <div className="flex flex-col gap-1.5 ml-4 flex-shrink-0">
            <button onClick={() => onStatusChange(appt.id, 'completed')}
              className="flex items-center gap-1 text-xs bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition">
              <CheckCircle size={11} /> Done
            </button>
            <button onClick={() => onStatusChange(appt.id, 'cancelled')}
              className="flex items-center gap-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition">
              <XCircle size={11} /> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ApptModal({ onClose, onSave }) {
  const [form, setForm] = useState({ patient_id: '', doctor_id: '', scheduled_at: '', location: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try { await onSave(form); onClose(); }
    catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={17} className="text-blue-600" /> Schedule appointment
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Patient ID</label>
              <input type="number" required value={form.patient_id} onChange={set('patient_id')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Doctor ID</label>
              <input type="number" required value={form.doctor_id} onChange={set('doctor_id')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Date & time</label>
            <input type="datetime-local" required value={form.scheduled_at} onChange={set('scheduled_at')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Location</label>
            <input type="text" required value={form.location} onChange={set('location')}
              placeholder="e.g. Clinic Room 3"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Notes (optional)</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-2.5 text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              <Save size={14} />{saving ? 'Scheduling…' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const canManage = ['doctor', 'admin', 'caregiver'].includes(user?.role);

  const load = async () => {
    setLoading(true);
    try {
      const r = user?.role === 'doctor'
        ? await apptApi.getByDoctor(user.id)
        : await apptApi.getByPatient(user.id);
      setAppts(r.data);
    } catch { setAppts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user]);

  const handleSave = async (form) => {
    await apptApi.create({ ...form, patient_id: parseInt(form.patient_id), doctor_id: parseInt(form.doctor_id) });
    toast.success('Scheduled!'); load();
  };

  const handleStatus = async (id, status) => {
    await apptApi.updateStatus(id, status); toast.success(`Marked as ${status}`); load();
  };

  const filtered = appts.filter(a => filter === 'all' || a.status === filter);
  const counts = {
    all: appts.length,
    scheduled: appts.filter(a => a.status === 'scheduled').length,
    completed: appts.filter(a => a.status === 'completed').length,
    cancelled: appts.filter(a => a.status === 'cancelled').length,
  };

  return (
    <div className="p-8">
      <PageHeader icon={Calendar} title="Appointments"
        subtitle={user?.role === 'doctor' ? 'Patient appointments' : 'Your appointments'}
        action={canManage && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
            <Plus size={15} /> Schedule
          </button>
        )} />

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[['all','Total','bg-gray-50 text-gray-700'],
          ['scheduled','Scheduled','bg-blue-50 text-blue-700'],
          ['completed','Completed','bg-teal-50 text-teal-700'],
          ['cancelled','Cancelled','bg-red-50 text-red-600']].map(([k, label, color]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`rounded-2xl p-4 text-left transition-all ${color} ${filter === k ? 'ring-2 ring-blue-400 ring-offset-1 scale-[1.02]' : 'hover:scale-[1.01]'}`}>
            <p className="text-2xl font-bold">{counts[k]}</p>
            <p className="text-xs mt-0.5 opacity-75">{label}</p>
          </button>
        ))}
      </div>

      <div className="flex bg-gray-100 rounded-xl p-1 w-fit gap-1 mb-5">
        {['all','scheduled','completed','cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === f ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Calendar} message={`No ${filter !== 'all' ? filter : ''} appointments`} />
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <ApptCard key={a.id} appt={a} canManage={canManage} onStatusChange={handleStatus} />
          ))}
        </div>
      )}

      {showModal && <ApptModal onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
}
