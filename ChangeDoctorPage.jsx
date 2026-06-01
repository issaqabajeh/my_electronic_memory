import { useEffect, useState } from 'react';
import { usersApi } from '../../api/client';
import { UserCheck, RefreshCw, Search, CheckCircle } from 'lucide-react';
import { PageHeader } from '../../components/UI';
import toast from 'react-hot-toast';

export default function ChangeDoctorPage() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchP, setSearchP] = useState('');
  const [searchD, setSearchD] = useState('');

  useEffect(() => {
    usersApi.patients().then(r => setPatients(r.data)).catch(() => {});
    usersApi.doctors().then(r => setDoctors(r.data)).catch(() => {});
  }, []);

  const handleChange = async () => {
    if (!selectedPatient || !selectedDoctor) {
      toast.error('Please select both patient and doctor');
      return;
    }
    setSaving(true);
    try {
      const res = await usersApi.changeDoctor(selectedPatient.id, selectedDoctor.id);
      toast.success(`Doctor changed to ${res.data.new_doctor} ✓`);
      setSelectedPatient(null);
      setSelectedDoctor(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change doctor');
    } finally { setSaving(false); }
  };

  const filteredPatients = patients.filter(p =>
    p.full_name.toLowerCase().includes(searchP.toLowerCase()) ||
    p.email.toLowerCase().includes(searchP.toLowerCase())
  );

  const filteredDoctors = doctors.filter(d =>
    d.full_name.toLowerCase().includes(searchD.toLowerCase()) ||
    d.email.toLowerCase().includes(searchD.toLowerCase())
  );

  return (
    <div className="p-8">
      <PageHeader icon={UserCheck} title="Change Patient's Doctor"
        subtitle="Reassign a patient to a different approved doctor" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Select Patient */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">1. Select Patient</h3>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-3">
            <Search size={13} className="text-gray-400" />
            <input value={searchP} onChange={e => setSearchP(e.target.value)}
              placeholder="Search patients…" className="text-sm outline-none bg-transparent w-full" />
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {filteredPatients.map(p => (
              <button key={p.id} onClick={() => setSelectedPatient(p)}
                className={"w-full flex items-center gap-3 p-3 rounded-xl text-left transition " +
                  (selectedPatient?.id === p.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent')}>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                  {p.full_name?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.full_name}</p>
                  <p className="text-xs text-gray-400 truncate">{p.email}</p>
                </div>
                {selectedPatient?.id === p.id && <CheckCircle size={16} className="text-blue-600 flex-shrink-0 ml-auto" />}
              </button>
            ))}
            {filteredPatients.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No patients found</p>}
          </div>
        </div>

        {/* Select New Doctor */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">2. Select New Doctor</h3>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-3">
            <Search size={13} className="text-gray-400" />
            <input value={searchD} onChange={e => setSearchD(e.target.value)}
              placeholder="Search doctors…" className="text-sm outline-none bg-transparent w-full" />
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {filteredDoctors.map(d => (
              <button key={d.id} onClick={() => setSelectedDoctor(d)}
                className={"w-full flex items-center gap-3 p-3 rounded-xl text-left transition " +
                  (selectedDoctor?.id === d.id ? 'bg-teal-50 border border-teal-200' : 'hover:bg-gray-50 border border-transparent')}>
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-xs font-bold flex-shrink-0">
                  {d.full_name?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Dr. {d.full_name}</p>
                  <p className="text-xs text-gray-400 truncate">{d.email}</p>
                </div>
                {selectedDoctor?.id === d.id && <CheckCircle size={16} className="text-teal-600 flex-shrink-0 ml-auto" />}
              </button>
            ))}
            {filteredDoctors.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No approved doctors found</p>}
          </div>
        </div>
      </div>

      {/* Summary + Confirm */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">3. Confirm change</h3>
        <div className="flex items-center gap-4 flex-wrap mb-5">
          <div className={`flex-1 min-w-48 p-4 rounded-xl border ${selectedPatient ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
            <p className="text-xs text-gray-400 mb-1">Patient</p>
            <p className="font-semibold text-gray-900 text-sm">{selectedPatient?.full_name || '— not selected —'}</p>
          </div>
          <div className="text-gray-300 text-xl">→</div>
          <div className={`flex-1 min-w-48 p-4 rounded-xl border ${selectedDoctor ? 'bg-teal-50 border-teal-100' : 'bg-gray-50 border-gray-100'}`}>
            <p className="text-xs text-gray-400 mb-1">New doctor</p>
            <p className="font-semibold text-gray-900 text-sm">
              {selectedDoctor ? `Dr. ${selectedDoctor.full_name}` : '— not selected —'}
            </p>
          </div>
        </div>

        <button onClick={handleChange} disabled={!selectedPatient || !selectedDoctor || saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? <RefreshCw size={15} className="animate-spin" /> : <UserCheck size={15} />}
          {saving ? 'Changing…' : 'Confirm change'}
        </button>
      </div>
    </div>
  );
}
