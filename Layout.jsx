import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, Pill, Calendar, MapPin,
  Bell, MessageCircle, LogOut, Users, Settings, Brain, UserCheck
} from 'lucide-react';

const NAV = {
  patient: [
    { to: '/patient', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/patient/records', icon: FileText, label: 'Medical records' },
    { to: '/patient/medications', icon: Pill, label: 'Medications' },
    { to: '/patient/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/patient/location', icon: MapPin, label: 'My location' },
    { to: '/patient/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/patient/notifications', icon: Bell, label: 'Notifications' },
  ],
  doctor: [
    { to: '/doctor', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/doctor/patients', icon: Users, label: 'My patients' },
    { to: '/doctor/records', icon: FileText, label: 'Medical records' },
    { to: '/doctor/medications', icon: Pill, label: 'Prescriptions' },
    { to: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/doctor/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/doctor/notifications', icon: Bell, label: 'Notifications' },
  ],
  caregiver: [
    { to: '/caregiver', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/caregiver/change-doctor', icon: UserCheck, label: 'Change doctor' },
    { to: '/caregiver/location', icon: MapPin, label: 'Track patient' },
    { to: '/caregiver/medications', icon: Pill, label: 'Medications' },
    { to: '/caregiver/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/caregiver/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/caregiver/notifications', icon: Bell, label: 'Alerts' },
  ],
  admin: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'All users' },
    { to: '/admin/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  ],
};

const ROLE_COLORS = {
  patient: 'bg-blue-500',
  doctor: 'bg-teal-500',
  caregiver: 'bg-amber-500',
  admin: 'bg-purple-500',
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = NAV[user?.role] || [];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Brain size={17} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-gray-900 text-sm leading-tight">Electronic</p>
              <p className="font-display font-bold text-blue-600 text-sm leading-tight">Memory</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to.split('/').length === 2}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? 'text-blue-600' : ''} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className={`w-8 h-8 ${ROLE_COLORS[user?.role]} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-red-50"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
