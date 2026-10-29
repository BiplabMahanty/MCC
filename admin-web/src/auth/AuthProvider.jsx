import { useState, useEffect, useCallback } from 'react';
import AuthContext from './AuthContext.jsx';
import * as authApi from '../api/auth';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // 'loading' | 'ready'
  const [status, setStatus] = useState('loading');

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem('refreshToken');
    if (!stored) {
      setStatus('ready');
      return;
    }
    authApi
      .refresh(stored)
      .then((data) => {
        window.__accessToken = data.accessToken;
        localStorage.setItem('refreshToken', data.refreshToken);
        return authApi.getMe();
      })
      .then((me) => {
        const u = me.user ?? me;
        if (u.role !== 'admin') throw new Error('FORBIDDEN');
        setUser(u);
      })
      .catch(() => {
        window.__accessToken = null;
        localStorage.removeItem('refreshToken');
      })
      .finally(() => setStatus('ready'));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    if (data.user.role !== 'admin') {
      throw new Error('Only admin accounts can access this portal.');
    }
    window.__accessToken = data.accessToken;
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    const rt = localStorage.getItem('refreshToken');
    try {
      if (rt) await authApi.logout(rt);
    } catch {
      // ignore
    } finally {
      window.__accessToken = null;
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
