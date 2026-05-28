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
    setLoading(false);
  }, []);

  async function login(email, password) {
    const data = await APIService.login(email, password);
    setUser(data.user);
    return data;
  }

  async function logout() {
    await APIService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
