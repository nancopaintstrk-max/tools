import { create } from 'zustand';

interface UserState {
  userName: string;
  userPhone: string;
  userPhoto: string | null;
  setUserData: (name: string, phone: string, photo: string | null) => void;
  clearUserData: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userName: '',
  userPhone: '',
  userPhoto: null,
  setUserData: (userName, userPhone, userPhoto) => set({ userName, userPhone, userPhoto }),
  clearUserData: () => set({ userName: '', userPhone: '', userPhoto: null }),
}));
