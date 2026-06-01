import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Patient
import PatientDashboard from './pages/patient/Dashboard';

// Doctor
import DoctorDashboard from './pages/doctor/DoctorDashboard';

// Caregiver
import CaregiverDashboard from './pages/caregiver/CaregiverDashboard';
import ChangeDoctorPage from './pages/caregiver/ChangeDoctorPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';

// Shared pages
import RecordsPage from './pages/shared/RecordsPage';
import MedicationsPage from './pages/shared/MedicationsPage';
import AppointmentsPage from './pages/shared/AppointmentsPage';
import LocationPage from './pages/shared/LocationPage';
import MessagesPage from './pages/shared/MessagesPage';
import NotificationsPage from './pages/shared/NotificationsPage';

const ROLE_HOME = { patient: '/patient', doctor: '/doctor', caregiver: '/caregiver', admin: '/admin' };

function Protected({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  return <Layout>{children}</Layout>;
}

function RoleHome() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return <Navigate to={ROLE_HOME[user.role] || '/login'} />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RoleHome />} />

          {/* Patient */}
          <Route path="/patient" element={<Protected roles={['patient']}><PatientDashboard /></Protected>} />
          <Route path="/patient/records" element={<Protected roles={['patient']}><RecordsPage /></Protected>} />
          <Route path="/patient/medications" element={<Protected roles={['patient']}><MedicationsPage /></Protected>} />
          <Route path="/patient/appointments" element={<Protected roles={['patient']}><AppointmentsPage /></Protected>} />
          <Route path="/patient/location" element={<Protected roles={['patient']}><LocationPage /></Protected>} />
          <Route path="/patient/messages" element={<Protected roles={['patient']}><MessagesPage /></Protected>} />
          <Route path="/patient/notifications" element={<Protected roles={['patient']}><NotificationsPage /></Protected>} />

          {/* Doctor */}
          <Route path="/doctor" element={<Protected roles={['doctor']}><DoctorDashboard /></Protected>} />
          <Route path="/doctor/patients" element={<Protected roles={['doctor']}><RecordsPage /></Protected>} />
          <Route path="/doctor/records" element={<Protected roles={['doctor']}><RecordsPage /></Protected>} />
          <Route path="/doctor/medications" element={<Protected roles={['doctor']}><MedicationsPage /></Protected>} />
          <Route path="/doctor/appointments" element={<Protected roles={['doctor']}><AppointmentsPage /></Protected>} />
          <Route path="/doctor/messages" element={<Protected roles={['doctor']}><MessagesPage /></Protected>} />
          <Route path="/doctor/notifications" element={<Protected roles={['doctor']}><NotificationsPage /></Protected>} />

          {/* Caregiver */}
          <Route path="/caregiver" element={<Protected roles={['caregiver']}><CaregiverDashboard /></Protected>} />
          <Route path="/caregiver/change-doctor" element={<Protected roles={['caregiver']}><ChangeDoctorPage /></Protected>} />
          <Route path="/caregiver/location" element={<Protected roles={['caregiver']}><LocationPage /></Protected>} />
          <Route path="/caregiver/medications" element={<Protected roles={['caregiver']}><MedicationsPage /></Protected>} />
          <Route path="/caregiver/appointments" element={<Protected roles={['caregiver']}><AppointmentsPage /></Protected>} />
          <Route path="/caregiver/messages" element={<Protected roles={['caregiver']}><MessagesPage /></Protected>} />
          <Route path="/caregiver/notifications" element={<Protected roles={['caregiver']}><NotificationsPage /></Protected>} />

          {/* Admin */}
          <Route path="/admin" element={<Protected roles={['admin']}><AdminDashboard /></Protected>} />
          <Route path="/admin/users" element={<Protected roles={['admin']}><AdminDashboard /></Protected>} />
          <Route path="/admin/appointments" element={<Protected roles={['admin']}><AppointmentsPage /></Protected>} />
          <Route path="/admin/notifications" element={<Protected roles={['admin']}><NotificationsPage /></Protected>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
