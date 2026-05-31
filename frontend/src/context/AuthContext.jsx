// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import APIService from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = APIService.getCurrentUser();
    if (u) setUser(u);
    
    // Fetch fresh user data in background
    if (APIService.getToken()) {
      APIService.get('/auth/me').then(res => {
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('lumi_user', JSON.stringify(res.user));
        }
      }).catch(console.error);
    }
    setLoading(false);
  }, []);

  async function refreshUser() {
    if (APIService.getToken()) {
      try {
        const res = await APIService.get('/auth/me');
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('lumi_user', JSON.stringify(res.user));
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function login(email, password) {
    const data = await APIService.login(email, password);
    setUser(data.user);
    return data;
  }

  async function register(name, email, password, company, phone) {
    const data = await APIService.register(name, email, password, company, phone);
    setUser(data.user);
    return data;
  }

  async function logout() {
    await APIService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
