import { useEffect, useState } from 'react';
import { recordsApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { FileText, Plus, Search, Edit2, Trash2, X, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { PageHeader, EmptyState } from '../../components/UI';
import toast from 'react-hot-toast';

function RecordCard({ record, canEdit, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden fade-in">
      <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <FileText size={17} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{record.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">Patient #{record.patient_id} · {format(new Date(record.created_at), 'dd MMM yyyy')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {canEdit && (
            <>
              <button onClick={e => { e.stopPropagation(); onEdit(record); }}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                <Edit2 size={14} />
              </button>
              <button onClick={e => { e.stopPropagation(); onDelete(record.id); }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                <Trash2 size={14} />
              </button>
            </>
          )}
          {open ? <ChevronUp size={15} className="text-gray-400 ml-1" /> : <ChevronDown size={15} className="text-gray-400 ml-1" />}
        </div>
      </div>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Diagnosis</p>
              <p className="text-sm text-gray-800">{record.diagnosis}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Treatment</p>
              <p className="text-sm text-gray-800">{record.treatment}</p>
            </div>
          </div>
          {record.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-1.5">Notes</p>
              <p className="text-sm text-amber-900">{record.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RecordModal({ record, onClose, onSave }) {
  const [form, setForm] = useState(record || { patient_id: '', title: '', diagnosis: '', treatment: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try { await onSave(form); onClose(); }
    catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{record ? 'Edit record' : 'New medical record'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {!record && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Patient ID</label>
              <input type="number" required value={form.patient_id} onChange={set('patient_id')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
          {[['title','Title','text'],['diagnosis','Diagnosis','textarea'],['treatment','Treatment','textarea'],['notes','Notes (optional)','textarea']].map(([k, label, type]) => (
            <div key={k}>
              <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
              {type === 'textarea' ? (
                <textarea value={form[k]} onChange={set(k)} rows={3} required={k !== 'notes'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              ) : (
                <input type="text" required value={form[k]} onChange={set(k)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              )}
            </div>
          ))}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
              <Save size={14} />{saving ? 'Saving…' : 'Save record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [patientId, setPatientId] = useState(String(user?.id || 1));
  const [modal, setModal] = useState(null);
  const canEdit = ['doctor', 'admin'].includes(user?.role);

  const load = async (pid) => {
    setLoading(true);
    try { const r = await recordsApi.getByPatient(pid); setRecords(r.data); }
    catch { setRecords([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(patientId); }, []);

  const handleSave = async (form) => {
    if (modal?.id) { await recordsApi.update(modal.id, form); toast.success('Updated'); }
    else { await recordsApi.create(form); toast.success('Created'); }
    load(patientId);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    await recordsApi.delete(id); toast.success('Deleted'); load(patientId);
  };

  const filtered = records.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.diagnosis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <PageHeader icon={FileText} title="Medical records" subtitle="Patient health history and diagnoses"
        action={canEdit && (
          <button onClick={() => setModal('new')}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
            <Plus size={15} /> New record
          </button>
        )} />

      <div className="flex gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1 max-w-sm">
          <Search size={15} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records…"
            className="text-sm outline-none w-full bg-transparent" />
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <input type="number" value={patientId} onChange={e => setPatientId(e.target.value)}
              placeholder="Patient ID" className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={() => load(patientId)}
              className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition">Load</button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} message="No records found" />
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <RecordCard key={r.id} record={r} canEdit={canEdit}
              onEdit={setModal} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {modal !== null && (
        <RecordModal record={modal === 'new' ? null : modal}
          onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </div>
  );
}
