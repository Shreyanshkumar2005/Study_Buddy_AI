import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('studybuddy_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUserSession = async () => {
      const { accessToken } = api.getStoredTokens();
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('studybuddy_user', JSON.stringify(res.user));
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        api.clearStoredTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUserSession();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.accessToken) {
      api.setStoredTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
      localStorage.setItem('studybuddy_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (name, email, password, role = 'student') => {
    const res = await api.register({ name, email, password, role });
    if (res.success && res.accessToken) {
      api.setStoredTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
      localStorage.setItem('studybuddy_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout network error (clearing local state anyway):', err.message);
    } finally {
      api.clearStoredTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
