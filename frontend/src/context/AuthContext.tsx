import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string; location?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data);
  }

  async function register(data: { name: string; email: string; password: string; phone?: string; location?: string }) {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('token', res.data.token);
    setUser(res.data);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  function refreshUser(updated: Partial<User>) {
    setUser((prev) => (prev ? { ...prev, ...updated } : prev));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
