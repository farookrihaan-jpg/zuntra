import { create } from 'zustand';
import { boardAPI } from '@/utils/api';
import toast from 'react-hot-toast';

const useBoardStore = create((set, get) => ({
  boards:  [],
  loading: false,

  fetchBoards: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await boardAPI.getAll(params);
      set({ boards: res.data.data, loading: false });
    } catch {
      set({ loading: false });
      toast.error('Failed to load boards');
    }
  },

  createBoard: async (data) => {
    try {
      const res = await boardAPI.create(data);
      set((s) => ({ boards: [res.data.data, ...s.boards] }));
      toast.success('Board created!');
      return { success: true, board: res.data.data };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create board');
      return { success: false };
    }
  },

  updateBoard: async (id, data) => {
    try {
      const res = await boardAPI.update(id, data);
      set((s) => ({ boards: s.boards.map(b => b._id === id ? res.data.data : b) }));
      toast.success('Board updated');
      return { success: true };
    } catch {
      toast.error('Failed to update board');
      return { success: false };
    }
  },

  deleteBoard: async (id) => {
    try {
      await boardAPI.delete(id);
      set((s) => ({ boards: s.boards.filter(b => b._id !== id) }));
      toast.success('Board deleted');
      return { success: true };
    } catch {
      toast.error('Failed to delete board');
      return { success: false };
    }
  },

  addPinToBoard: async (boardId, pinId) => {
    try {
      await boardAPI.addPin(boardId, pinId);
      set((s) => ({
        boards: s.boards.map(b =>
          b._id === boardId && !b.pins.includes(pinId)
            ? { ...b, pins: [pinId, ...b.pins] }
            : b
        ),
      }));
      toast.success('Added to board!');
      return { success: true };
    } catch {
      toast.error('Failed to add pin to board');
      return { success: false };
    }
  },

  removePinFromBoard: async (boardId, pinId) => {
    try {
      await boardAPI.removePin(boardId, pinId);
      set((s) => ({
        boards: s.boards.map(b =>
          b._id === boardId ? { ...b, pins: b.pins.filter(p => p !== pinId && p?._id !== pinId) } : b
        ),
      }));
      toast.success('Removed from board');
      return { success: true };
    } catch {
      toast.error('Failed to remove pin');
      return { success: false };
    }
  },
}));

export default useBoardStore;
