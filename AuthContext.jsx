import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi.me()
        .then(res => setUser(res.data))
        .catch(() => localStorage.clear())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { access_token, role, user_id, full_name } = res.data;
    localStorage.setItem('token', access_token);
    setUser({ id: user_id, full_name, role, email });
    return role;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    const { access_token, role, user_id, full_name } = res.data;
    localStorage.setItem('token', access_token);
    setUser({ id: user_id, full_name, role, email: data.email });
    return role;
  };

  const logout = () => { localStorage.clear(); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
