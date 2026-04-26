import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

/**
 * Store global d'authentification (Zustand + localStorage persistence)
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      user:    null,
      token:   null,
      loading: false,
      error:   null,

      // ── Connexion ──────────────────────────────────────────
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          localStorage.setItem('ft_token', data.token);
          set({ user: data.user, token: data.token, loading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Erreur de connexion';
          set({ error: msg, loading: false });
          return { success: false, error: msg };
        }
      },

      // ── Inscription ────────────────────────────────────────
      register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          localStorage.setItem('ft_token', data.token);
          set({ user: data.user, token: data.token, loading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Erreur d\'inscription';
          set({ error: msg, loading: false });
          return { success: false, error: msg };
        }
      },

      // ── Déconnexion ────────────────────────────────────────
      logout: () => {
        localStorage.removeItem('ft_token');
        set({ user: null, token: null });
      },

      // ── Refresh user data ──────────────────────────────────
      refreshUser: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user });
        } catch {}
      },

      // ── Update profile ─────────────────────────────────────
      updateProfile: async (profileData) => {
        const { data } = await api.put('/profile', profileData);
        set(state => ({
          user: { ...state.user, profile: data.profile, darkMode: data.darkMode, dailyCalories: data.dailyCalories },
        }));
        return data;
      },
    }),
    {
      name: 'ft_auth',
      partialize: state => ({ user: state.user, token: state.token }),
      // Synchronise aussi le token dans localStorage pour l'intercepteur Axios
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          localStorage.setItem('ft_token', state.token);
        }
      },
    }
  )
);

export default useAuthStore;
