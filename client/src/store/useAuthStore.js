import { create } from 'zustand';
import { api } from '../lib/api.js';

export const useAuthStore = create((set) => ({
  user: null,
  authReady: false,
  loading: false,
  error: null,

  bootstrapAuth: async () => {
    if (!api.hasToken()) {
      set({ user: null, authReady: true });
      return;
    }
    try {
      const data = await api.get('/v1/auth/me');
      set({ user: data.user, authReady: true, error: null });
    } catch (err) {
      api.clearToken();
      set({ user: null, authReady: true, error: err.message });
    }
  },

  login: async ({ email, password }) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/v1/auth/login', { email, password });
      api.setToken(data.token);
      set({ user: data.user, loading: false });
      return data.user;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  register: async ({ name, email, password }) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/v1/auth/register', { name, email, password });
      api.setToken(data.token);
      set({ user: data.user, loading: false });
      return data.user;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  refreshMe: async () => {
    if (!api.hasToken()) return null;
    const data = await api.get('/v1/auth/me');
    set({ user: data.user });
    return data.user;
  },

  logout: () => {
    api.clearToken();
    set({ user: null, error: null });
  },
}));
