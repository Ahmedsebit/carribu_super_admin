import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, getMe } from '../services/superAdminService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe().then(res => {
        if (res.data.user.role !== 'super_admin') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        } else {
          setUser(res.data.user);
        }
      }).catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await loginApi(email, password);
    if (res.data.user.role !== 'super_admin') {
      throw new Error('Access denied. Super admin only.');
    }
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
