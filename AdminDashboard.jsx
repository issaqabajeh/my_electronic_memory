import { useEffect, useState } from 'react';
import { usersApi } from '../../api/client';
import {
  Users, CheckCircle, XCircle, Clock, Shield,
  UserCheck, RefreshCw, Search, Filter,
  AlertTriangle, Activity, UserX, Eye,
  Stethoscope, Heart, UserCog, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_STYLE = {
  patient:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
  doctor:    { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200',   dot: 'bg-teal-500'   },
  caregiver: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500'  },
  admin:     { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
};
const ROLE_ICON = { patient: Heart, doctor: Stethoscope, caregiver: UserCog, admin: Shield };

function KPI({ icon: Icon, label, value, sub, accent }) {
  const bg   = accent.replace('border-', 'bg-').replace('-200', '-50');
  const text = accent.replace('border-', 'text-').replace('-200', '-600');
  const sbg  = accent.replace('border-', 'bg-').replace('-200', '-50');
  const stxt = accent.replace('border-', 'text-').replace('-200', '-700');
  return (
    <div className={"rounded-2xl p-5 border bg-white " + accent}>
      <div className="flex items-start justify-between mb-3">
        <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + bg}>
          <Icon size={18} className={text} />
        </div>
        {sub && (
          <span className={"text-xs font-semibold px-2 py-0.5 rounded-full " + sbg + " " + stxt}>{sub}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{value ?? 0}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function PendingCard({ doctor, onApprove, onReject }) {
  const [acting, setActing] = useState(null);
  const act = async (fn, type) => {
    setActing(type);
    try { await fn(); } finally { setActing(null); }
  };
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-amber-100 bg-amber-50 hover:bg-amber-100/60 transition-colors">
      <div className="w-11 h-11 bg-amber-200 rounded-full flex items-center justify-center text-amber-900 font-bold text-base flex-shrink-0">
        {doctor.full_name?.[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{doctor.full_name}</p>
        <p className="text-xs text-gray-500 truncate">{doctor.email}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Clock size={10} className="text-amber-600" />
          <span className="text-xs text-amber-700 font-medium">Awaiting approval</span>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={() => act(onApprove, 'approve')} disabled={!!acting}
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60">
          {acting === 'approve' ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />}
          Approve
        </button>
        <button onClick={() => act(onReject, 'reject')} disabled={!!acting}
          className="flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-3.5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60">
          {acting === 'reject' ? <RefreshCw size={13} className="animate-spin" /> : <XCircle size={13} />}
          Reject
        </button>
      </div>
    </div>
  );
}

function UserRow({ user, onDeactivate }) {
  const s = ROLE_STYLE[user.role] || ROLE_STYLE.admin;
  const RoleIcon = ROLE_ICON[user.role] || Users;
  const isAdmin = user.role === 'admin';
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 rounded-xl px-2 -mx-2 transition-colors group">
      <div className={"w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 " + s.bg + " " + s.text}>
        {user.full_name?.[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</p>
        <p className="text-xs text-gray-400 truncate">{user.email}</p>
      </div>
      <div className={"hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold " + s.bg + " " + s.text + " " + s.border}>
        <RoleIcon size={11} /><span className="capitalize">{user.role}</span>
      </div>
      {user.role === 'doctor' && (
        <span className={"hidden sm:inline text-xs px-2 py-0.5 rounded-full font-medium " + (user.is_approved ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700')}>
          {user.is_approved ? 'Approved' : 'Pending'}
        </span>
      )}
      <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + (user.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
        {user.is_active ? 'Active' : 'Disabled'}
      </span>
      {!isAdmin && user.is_active && (
        <button onClick={() => onDeactivate(user.id, user.full_name)}
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-all">
          <UserX size={12} /> Disable
        </button>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [pending, setPending]   = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [tab, setTab]           = useState('overview');
  const [search, setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const [p, u] = await Promise.all([usersApi.pendingDoctors(), usersApi.list()]);
      setPending(p.data); setAllUsers(u.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    await usersApi.approve(id); toast.success('Doctor approved'); load();
  };
  const handleReject = async (id) => {
    if (!confirm('Reject and disable this doctor?')) return;
    await usersApi.reject(id); toast.error('Doctor rejected'); load();
  };
  const handleDeactivate = async (id, name) => {
    if (!confirm('Disable ' + name + "'s account?")) return;
    await usersApi.deactivate(id); toast.success('Account disabled'); load();
  };

  const stats = {
    total:      allUsers.length,
    patients:   allUsers.filter(u => u.role === 'patient').length,
    doctors:    allUsers.filter(u => u.role === 'doctor' && u.is_approved).length,
    caregivers: allUsers.filter(u => u.role === 'caregiver').length,
    pending:    pending.length,
    disabled:   allUsers.filter(u => !u.is_active).length,
  };

  const filtered = allUsers.filter(u => {
    const matchRole   = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = !search || u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const TABS = [
    { id: 'overview', label: 'Overview',     icon: Activity },
    { id: 'pending',  label: 'Pending',      icon: Clock,  badge: stats.pending },
    { id: 'users',    label: 'All users',    icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-purple-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin panel</h1>
              <p className="text-xs text-gray-400">My Electronic Memory</p>
            </div>
          </div>
          <button onClick={load}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
        <div className="flex gap-1 mt-5">
          {TABS.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => setTab(id)}
              className={"flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all " + (tab === id ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100')}>
              <Icon size={15} />{label}
              {badge > 0 && (
                <span className={"text-xs px-1.5 py-0.5 rounded-full font-bold " + (tab === id ? 'bg-white/25 text-white' : 'bg-amber-500 text-white')}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto">

        {/* TAB: OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <KPI icon={Users}       label="Total users"        value={stats.total}      accent="border-blue-200" />
              <KPI icon={Heart}       label="Patients"           value={stats.patients}   accent="border-blue-200" />
              <KPI icon={Stethoscope} label="Active doctors"     value={stats.doctors}    accent="border-teal-200" />
              <KPI icon={UserCog}     label="Caregivers"         value={stats.caregivers} accent="border-amber-200" />
              <KPI icon={Clock}       label="Pending approval"   value={stats.pending}
                sub={stats.pending > 0 ? 'Action needed' : undefined}
                accent={stats.pending > 0 ? 'border-amber-400' : 'border-gray-200'} />
              <KPI icon={UserX}       label="Disabled accounts"  value={stats.disabled}   accent="border-red-200" />
            </div>

            {stats.pending > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-900 text-sm">
                      {stats.pending} doctor{stats.pending > 1 ? 's' : ''} waiting for approval
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">They cannot log in until you approve their accounts.</p>
                  </div>
                </div>
                <button onClick={() => setTab('pending')}
                  className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex-shrink-0">
                  Review now <ChevronRight size={14} />
                </button>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 text-sm">User breakdown by role</h2>
              <div className="space-y-3">
                {[
                  { role: 'patient',   count: stats.patients,   label: 'Patients' },
                  { role: 'doctor',    count: stats.doctors,    label: 'Approved doctors' },
                  { role: 'caregiver', count: stats.caregivers, label: 'Caregivers' },
                ].map(({ role, count, label }) => {
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  const s = ROLE_STYLE[role];
                  return (
                    <div key={role}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={"w-2 h-2 rounded-full " + s.dot} />
                          <span className="text-sm text-gray-700">{label}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {count} <span className="text-xs text-gray-400 font-normal">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={"h-full rounded-full transition-all duration-700 " + s.dot} style={{ width: pct + '%' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 text-sm">Recently registered</h2>
                <button onClick={() => setTab('users')} className="text-xs text-purple-600 hover:text-purple-800 font-medium">View all →</button>
              </div>
              {allUsers.slice(0, 5).map(u => <UserRow key={u.id} user={u} onDeactivate={handleDeactivate} />)}
              {allUsers.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No users yet</p>}
            </div>
          </div>
        )}

        {/* TAB: PENDING */}
        {tab === 'pending' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Clock size={18} className="text-amber-500" />
                <h2 className="font-semibold text-gray-900">Pending doctor approvals</h2>
                {pending.length > 0 && (
                  <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">{pending.length}</span>
                )}
              </div>
              {pending.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={28} className="text-teal-500" />
                  </div>
                  <p className="font-semibold text-gray-700">All caught up</p>
                  <p className="text-gray-400 text-sm mt-1">No pending doctor approvals</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pending.map(doc => (
                    <PendingCard key={doc.id} doctor={doc}
                      onApprove={() => handleApprove(doc.id)}
                      onReject={() => handleReject(doc.id)} />
                  ))}
                </div>
              )}
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Eye size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Why approval is required</p>
                  <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                    Doctor accounts have write access to patient medical records and prescriptions.
                    Admin approval ensures only verified healthcare professionals get this access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: USERS */}
        {tab === 'users' && (
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 flex-1 min-w-48">
                <Search size={14} className="text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or email…"
                  className="text-sm outline-none w-full bg-transparent placeholder-gray-400" />
              </div>
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                <Filter size={13} className="text-gray-400 ml-2" />
                {['all','patient','doctor','caregiver','admin'].map(r => (
                  <button key={r} onClick={() => setRoleFilter(r)}
                    className={"px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all " + (roleFilter === r ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100')}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400">Showing {filtered.length} of {allUsers.length} users</p>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={36} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm">No users match your search</p>
                </div>
              ) : (
                filtered.map(u => <UserRow key={u.id} user={u} onDeactivate={handleDeactivate} />)
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
