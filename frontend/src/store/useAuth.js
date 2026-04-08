import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        set({ user: data });
      },
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
