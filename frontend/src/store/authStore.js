import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/utils/api';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:    null,
      token:   null,
      loading: false,

      setAuth: (user, token) => {
        if (token) localStorage.setItem('pv_token', token);
        set({ user, token });
      },

      register: async (data) => {
        set({ loading: true });
        try {
          const res = await authAPI.register(data);
          get().setAuth(res.data.user, res.data.token);
          toast.success(`Welcome, ${res.data.user.name}! 🎉`);
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed';
          toast.error(msg);
          return { success: false, error: msg };
        } finally {
          set({ loading: false });
        }
      },

      login: async (data) => {
        set({ loading: true });
        try {
          const res = await authAPI.login(data);
          get().setAuth(res.data.user, res.data.token);
          toast.success(`Welcome back, ${res.data.user.name}!`);
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed';
          toast.error(msg);
          return { success: false, error: msg };
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try { await authAPI.logout(); } catch (_) {}
        localStorage.removeItem('pv_token');
        set({ user: null, token: null });
        toast('Signed out', { icon: '👋' });
      },

      fetchMe: async () => {
        if (!localStorage.getItem('pv_token')) return;
        try {
          const res = await authAPI.getMe();
          set({ user: res.data.user });
        } catch (_) {
          localStorage.removeItem('pv_token');
          set({ user: null, token: null });
        }
      },

      updateProfile: async (data) => {
        set({ loading: true });
        try {
          const res = await authAPI.updateProfile(data);
          set({ user: res.data.user });
          toast.success('Profile updated');
          return { success: true };
        } catch (err) {
          toast.error(err.response?.data?.message || 'Update failed');
          return { success: false };
        } finally {
          set({ loading: false });
        }
      },

      updateAvatar: async (formData) => {
        set({ loading: true });
        try {
          const res = await authAPI.updateAvatar(formData);
          set({ user: res.data.user });
          toast.success('Avatar updated');
          return { success: true };
        } catch (err) {
          toast.error(err.response?.data?.message || 'Upload failed');
          return { success: false };
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name:    'pv-auth',
      partialize: (s) => ({ token: s.token }),
    }
  )
);

export default useAuthStore;
