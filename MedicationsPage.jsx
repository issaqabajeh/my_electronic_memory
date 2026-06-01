import { useEffect, useState } from 'react';
import { medsApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Pill, Plus, X, Save, CheckCircle, XCircle, Clock } from 'lucide-react';
import { PageHeader, EmptyState, Badge } from '../../components/UI';
import toast from 'react-hot-toast';

function MedCard({ med, canEdit, onLog, onDeactivate }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 fade-in hover:shadow-sm transition">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Pill size={17} className="text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900">{med.name}</p>
              <Badge status={med.is_active ? 'active' : 'inactive'} />
            </div>
            <p className="text-sm text-gray-500">{med.dosage} · {med.frequency}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <Clock size={12} className="text-gray-400" />
              <p className="text-xs text-gray-400">{med.reminder_times?.split(',').join(' · ')}</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">From {med.start_date}{med.end_date ? ` to ${med.end_date}` : ''}</p>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 ml-4">
          {onLog && (
            <>
              <button onClick={() => onLog(med.id, true)}
                className="flex items-center gap-1 text-xs bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition">
                <CheckCircle size={11} /> Taken
              </button>
              <button onClick={() => onLog(med.id, false)}
                className="flex items-center gap-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition">
                <XCircle size={11} /> Missed
              </button>
            </>
          )}
          {canEdit && med.is_active && (
            <button onClick={() => onDeactivate(med.id)}
              className="text-xs text-gray-400 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
              Stop
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PrescribeModal({ onClose, onSave }) {
  const [form, setForm] = useState({ patient_id: '', name: '', dosage: '', frequency: '', reminder_times: '', start_date: '', end_date: '' });
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
          <h2 className="font-bold text-gray-900">Prescribe medication</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[['patient_id','Patient ID','number'],['name','Medication name','text'],
              ['dosage','Dosage','text'],['frequency','Frequency','text'],
              ['reminder_times','Reminder times','text'],['start_date','Start date','date']].map(([k, label, type]) => (
              <div key={k}>
                <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
                <input type={type} required value={form[k]} onChange={set(k)}
                  placeholder={k === 'reminder_times' ? '08:00,20:00' : ''}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-2.5 text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              <Save size={14} />{saving ? 'Saving…' : 'Prescribe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MedicationsPage() {
  const { user } = useAuth();
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [patientId, setPatientId] = useState(String(user?.id || 1));
  const canEdit = ['doctor', 'admin'].includes(user?.role);
  const isPatient = user?.role === 'patient';

  const load = async (pid) => {
    setLoading(true);
    try { const r = await medsApi.getByPatient(pid); setMeds(r.data); }
    catch { setMeds([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(patientId); }, []);

  const handleLog = async (medId, wasTaken) => {
    await medsApi.log({ medication_id: medId, was_taken: wasTaken });
    toast.success(wasTaken ? 'Marked as taken ✓' : 'Missed dose logged');
  };

  const handleDeactivate = async (id) => {
    await medsApi.deactivate(id); toast.success('Medication stopped'); load(patientId);
  };

  const handleSave = async (form) => {
    await medsApi.prescribe(form); toast.success('Prescribed'); load(patientId);
  };

  return (
    <div className="p-8">
      <PageHeader icon={Pill} title="Medications" subtitle="Active prescriptions and reminders"
        action={canEdit && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
            <Plus size={15} /> Prescribe
          </button>
        )} />

      {canEdit && (
        <div className="flex gap-2 mb-6">
          <input type="number" value={patientId} onChange={e => setPatientId(e.target.value)}
            placeholder="Patient ID" className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={() => load(patientId)}
            className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm hover:bg-gray-700 transition">Load</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">Loading…</div>
      ) : meds.length === 0 ? (
        <EmptyState icon={Pill} message="No active medications" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {meds.map(med => (
            <MedCard key={med.id} med={med} canEdit={canEdit}
              onLog={isPatient ? handleLog : null}
              onDeactivate={canEdit ? handleDeactivate : null} />
          ))}
        </div>
      )}

      {showModal && <PrescribeModal onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
}
