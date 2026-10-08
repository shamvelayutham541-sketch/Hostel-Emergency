import { create } from 'zustand';
import { api } from '../services/api';
import { initSocket } from '../services/socket';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('hostelsos_access_token') || null,
  isAuthenticated: !!localStorage.getItem('hostelsos_access_token'),
  isLoading: true,
  darkMode: localStorage.getItem('hostelsos_dark_mode') !== 'false', // Default dark mode for control room aesthetics
  language: localStorage.getItem('hostelsos_lang') || 'en',

  toggleDarkMode: () => {
    const next = !get().darkMode;
    set({ darkMode: next });
    localStorage.setItem('hostelsos_dark_mode', String(next));
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  setLanguage: (lang) => {
    set({ language: lang });
    localStorage.setItem('hostelsos_lang', lang);
  },

  initAuth: async () => {
    const token = localStorage.getItem('hostelsos_access_token');
    if (get().darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const res = await api.auth.getMe();
      if (res.success && res.user) {
        initSocket(token);
        set({ user: res.user, isAuthenticated: true, isLoading: false });
      } else {
        get().logout();
      }
    } catch (err) {
      console.warn('Session expired, logging out:', err.message);
      get().logout();
    }
  },

  login: async (credentials) => {
    const res = await api.auth.login(credentials);
    if (res.success) {
      localStorage.setItem('hostelsos_access_token', res.tokens.accessToken);
      localStorage.setItem('hostelsos_refresh_token', res.tokens.refreshToken);
      initSocket(res.tokens.accessToken);
      set({
        user: res.user,
        token: res.tokens.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    }
    return res;
  },

  demoLogin: async (role) => {
    const demoAccounts = {
      student: { email: 'student@hostelsos.edu', password: 'Hostel123!' },
      warden: { email: 'warden@hostelsos.edu', password: 'Hostel123!' },
      security: { email: 'security@hostelsos.edu', password: 'Hostel123!' },
      medical: { email: 'medical@hostelsos.edu', password: 'Hostel123!' },
      maintenance: { email: 'maintenance@hostelsos.edu', password: 'Hostel123!' },
      admin: { email: 'admin@hostelsos.edu', password: 'Hostel123!' },
    };

    const creds = demoAccounts[role] || demoAccounts.student;
    return get().login(creds);
  },

  register: async (userData) => {
    const res = await api.auth.register(userData);
    if (res.success) {
      localStorage.setItem('hostelsos_access_token', res.tokens.accessToken);
      localStorage.setItem('hostelsos_refresh_token', res.tokens.refreshToken);
      initSocket(res.tokens.accessToken);
      set({
        user: res.user,
        token: res.tokens.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    }
    return res;
  },

  logout: () => {
    localStorage.removeItem('hostelsos_access_token');
    localStorage.removeItem('hostelsos_refresh_token');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setUser: (user) => set({ user }),
}));
