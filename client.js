import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) { localStorage.clear(); window.location.href = '/login'; }
    return Promise.reject(err);
  }
);

export default api;

export const authApi = {
  register: (d) => api.post('/api/auth/register', d),
  login: (d) => api.post('/api/auth/login', d),
  me: () => api.get('/api/auth/me'),
};

export const usersApi = {
  list: () => api.get('/api/users/'),
  patients: () => api.get('/api/users/patients'),
  doctors: () => api.get('/api/users/doctors'),
  pendingDoctors: () => api.get('/api/users/pending-doctors'),
  get: (id) => api.get(`/api/users/${id}`),
  approve: (id) => api.put(`/api/users/${id}/approve`),
  reject: (id) => api.put(`/api/users/${id}/reject`),
  updatePatientProfile: (id, d) => api.put(`/api/users/patient-profile/${id}`, d),
  changeDoctor: (patientId, newDoctorId) => api.put(`/api/users/patient/${patientId}/change-doctor`, { new_doctor_id: newDoctorId }),
  deactivate: (id) => api.put(`/api/users/${id}/deactivate`),
};

export const recordsApi = {
  create: (d) => api.post('/api/records/', d),
  getByPatient: (id) => api.get(`/api/records/patient/${id}`),
  update: (id, d) => api.put(`/api/records/${id}`, d),
  delete: (id) => api.delete(`/api/records/${id}`),
};

export const medsApi = {
  prescribe: (d) => api.post('/api/medications/', d),
  getByPatient: (id) => api.get(`/api/medications/patient/${id}`),
  log: (d) => api.post('/api/medications/log', d),
  deactivate: (id) => api.put(`/api/medications/${id}/deactivate`),
};

export const apptApi = {
  create: (d) => api.post('/api/appointments/', d),
  getByPatient: (id) => api.get(`/api/appointments/patient/${id}`),
  getByDoctor: (id) => api.get(`/api/appointments/doctor/${id}`),
  updateStatus: (id, s) => api.put(`/api/appointments/${id}/status?new_status=${s}`),
};

export const locationApi = {
  update: (d) => api.post('/api/location/update', d),
  latest: (id) => api.get(`/api/location/patient/${id}/latest`),
  history: (id) => api.get(`/api/location/patient/${id}/history`),
  addZone: (d) => api.post('/api/location/safe-zone', d),
  getZones: (id) => api.get(`/api/location/safe-zone/patient/${id}`),
  deleteZone: (id) => api.delete(`/api/location/safe-zone/${id}`),
};

export const msgApi = {
  send: (d) => api.post('/api/messages', d),
  inbox: () => api.get('/api/messages/inbox'),
  thread: (id) => api.get(`/api/messages/thread/${id}`),
};

export const notifApi = {
  list: () => api.get('/api/notifications'),
  markRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllRead: () => api.put('/api/notifications/read-all'),
};
