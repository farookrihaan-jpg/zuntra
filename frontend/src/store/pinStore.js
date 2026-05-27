import { create } from 'zustand';
import { pinAPI } from '@/utils/api';
import toast from 'react-hot-toast';

const usePinStore = create((set, get) => ({
  pins:     [],
  total:    0,
  page:     1,
  loading:  false,
  hasMore:  true,
  filters:  { category: '', search: '', sort: '-createdAt' },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters }, pins: [], page: 1, hasMore: true });
  },

  fetchPins: async (reset = false) => {
    const { page, filters, loading, hasMore } = get();
    if (loading || (!hasMore && !reset)) return;

    const currentPage = reset ? 1 : page;
    set({ loading: true, ...(reset ? { pins: [], page: 1, hasMore: true } : {}) });

    try {
      const params = { page: currentPage, limit: 20, ...filters };
      if (!params.category) delete params.category;
      if (!params.search)   delete params.search;

      const res  = await pinAPI.getAll(params);
      const { data, total, pages } = res.data;

      set((s) => ({
        pins:    reset ? data : [...s.pins, ...data],
        total,
        page:    currentPage + 1,
        hasMore: currentPage < pages,
        loading: false,
      }));
    } catch (err) {
      set({ loading: false });
      toast.error('Failed to load pins');
    }
  },

  createPin: async (formData) => {
    try {
      const res = await pinAPI.create(formData);
      set((s) => ({ pins: [res.data.data, ...s.pins], total: s.total + 1 }));
      toast.success('Pin published! ✨');
      return { success: true, pin: res.data.data };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create pin');
      return { success: false };
    }
  },

  deletePin: async (id) => {
    try {
      await pinAPI.delete(id);
      set((s) => ({ pins: s.pins.filter(p => p._id !== id), total: s.total - 1 }));
      toast.success('Pin deleted');
      return { success: true };
    } catch (err) {
      toast.error('Failed to delete pin');
      return { success: false };
    }
  },

  toggleSave: async (id) => {
    try {
      const res = await pinAPI.toggleSave(id);
      const { isSaved, saveCount } = res.data;
      set((s) => ({
        pins: s.pins.map(p => p._id === id ? { ...p, isSaved, saves: Array(saveCount).fill(null) } : p),
      }));
      toast(isSaved ? '♥ Saved to collection' : 'Removed from saves', { duration: 1800 });
      return { isSaved };
    } catch (err) {
      toast.error('Please sign in to save pins');
      return {};
    }
  },

  updatePinInStore: (id, updates) => {
    set((s) => ({ pins: s.pins.map(p => p._id === id ? { ...p, ...updates } : p) }));
  },
}));

export default usePinStore;
