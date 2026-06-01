import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { locationApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Shield, AlertTriangle, RefreshCw, Plus, Trash2, X } from 'lucide-react';
import { PageHeader } from '../../components/UI';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ZoneModal({ patientId, onClose, onSave }) {
  const [form, setForm] = useState({ label: '', latitude: '', longitude: '', radius_meters: 200 });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = async e => {
    e.preventDefault();
    await onSave({ ...form, patient_id: patientId, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude), radius_meters: parseFloat(form.radius_meters) });
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Add safe zone</h2>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3">
          {[['label','Label','text'],['latitude','Latitude','number'],['longitude','Longitude','number'],['radius_meters','Radius (meters)','number']].map(([k,label,type]) => (
            <div key={k}>
              <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
              <input type={type} required value={form[k]} onChange={set(k)}
                step={type === 'number' ? 'any' : undefined}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-2.5 text-sm">Cancel</button>
            <button type="submit" className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700">Add zone</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LocationPage({ patientIdProp }) {
  const { user } = useAuth();
  const pid = patientIdProp || user?.id;
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const canManage = ['doctor', 'admin', 'caregiver'].includes(user?.role);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [l, h, z] = await Promise.all([
        locationApi.latest(pid).catch(() => null),
        locationApi.history(pid).catch(() => ({ data: [] })),
        locationApi.getZones(pid).catch(() => ({ data: [] })),
      ]);
      if (l) setLatest(l.data);
      setHistory(h.data);
      setZones(z.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [pid]);

  const updateLocation = () => {
    navigator.geolocation.getCurrentPosition(async pos => {
      await locationApi.update({ patient_id: pid, latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy });
      toast.success('Location updated'); fetchAll();
    }, () => toast.error('Location access denied'));
  };

  const addZone = async (data) => {
    await locationApi.addZone(data); toast.success('Safe zone added'); fetchAll();
  };

  const deleteZone = async (id) => {
    await locationApi.deleteZone(id); toast.success('Zone removed'); fetchAll();
  };

  const center = latest ? [latest.latitude, latest.longitude] : [31.9522, 35.9330];

  return (
    <div className="p-8">
      <PageHeader icon={MapPin} title="Location tracking"
        action={
          <div className="flex gap-2">
            <button onClick={updateLocation} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
              <MapPin size={15} /> Update location
            </button>
            {canManage && (
              <button onClick={() => setShowZoneModal(true)} className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
                <Plus size={15} /> Add zone
              </button>
            )}
            <button onClick={fetchAll} className="border border-gray-200 text-gray-500 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        }
      />

      {latest && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl mb-6 fade-in ${latest.is_safe_zone ? 'bg-teal-50 border border-teal-100' : 'bg-red-50 border border-red-100'}`}>
          {latest.is_safe_zone ? <Shield size={20} className="text-teal-600 flex-shrink-0" /> : <AlertTriangle size={20} className="text-red-600 flex-shrink-0" />}
          <div>
            <p className={`font-semibold text-sm ${latest.is_safe_zone ? 'text-teal-800' : 'text-red-800'}`}>
              {latest.is_safe_zone ? '✓ Patient is within safe zone' : '⚠️ Patient has left the safe zone!'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Last update: {format(new Date(latest.recorded_at), 'dd MMM HH:mm')} · {latest.latitude.toFixed(5)}, {latest.longitude.toFixed(5)}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-gray-200 h-80">
          <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {latest && (
              <Marker position={[latest.latitude, latest.longitude]}>
                <Popup>Last seen<br />{format(new Date(latest.recorded_at), 'dd MMM HH:mm')}</Popup>
              </Marker>
            )}
            {zones.map(z => (
              <Circle key={z.id} center={[z.latitude, z.longitude]} radius={z.radius_meters}
                pathOptions={{ color: '#0d9488', fillColor: '#0d9488', fillOpacity: 0.12 }}>
                <Popup>{z.label} — {z.radius_meters}m</Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
            <Shield size={15} className="text-teal-600" /> Safe zones ({zones.length})
          </h3>
          {zones.length === 0 ? (
            <p className="text-gray-400 text-sm">No zones defined</p>
          ) : (
            <div className="space-y-2">
              {zones.map(z => (
                <div key={z.id} className="flex items-center justify-between p-3 bg-teal-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-teal-800">{z.label}</p>
                    <p className="text-xs text-teal-600">{z.radius_meters}m radius</p>
                  </div>
                  {canManage && (
                    <button onClick={() => deleteZone(z.id)} className="p-1.5 text-teal-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">Location history</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="pb-3 pr-4">Time</th>
                <th className="pb-3 pr-4">Latitude</th>
                <th className="pb-3 pr-4">Longitude</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.slice(0, 10).map(h => (
                <tr key={h.id} className="text-gray-600">
                  <td className="py-3 pr-4 text-xs">{format(new Date(h.recorded_at), 'dd MMM HH:mm')}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{h.latitude.toFixed(5)}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{h.longitude.toFixed(5)}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${h.is_safe_zone ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-600'}`}>
                      {h.is_safe_zone ? 'Safe' : 'Outside'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && <p className="text-gray-400 text-sm text-center py-6">No history yet</p>}
        </div>
      </div>

      {showZoneModal && <ZoneModal patientId={pid} onClose={() => setShowZoneModal(false)} onSave={addZone} />}
    </div>
  );
}
