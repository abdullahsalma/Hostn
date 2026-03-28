import { create } from 'zustand';
import { secureStorage } from '../utils/storage';

export interface Host {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationalId?: string;
  avatar?: string;
  onboardingCompleted: boolean;
}

interface AuthState {
  host: Host | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (token: string, host: Host) => Promise<void>;
  logout: () => Promise<void>;
  setOnboardingCompleted: () => void;
  loadStoredAuth: () => Promise<{ token: string | null; host: Host | null }>;
  setHost: (host: Host) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  host: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (token: string, host: Host) => {
    await secureStorage.setToken(token);
    set({ host, token, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await secureStorage.clearAll();
    set({ host: null, token: null, isAuthenticated: false });
  },

  setOnboardingCompleted: () => {
    const { host } = get();
    if (host) {
      set({ host: { ...host, onboardingCompleted: true } });
    }
  },

  loadStoredAuth: async () => {
    try {
      const token = await secureStorage.getToken();
      if (token) {
        set({ token });
        return { token, host: null };
      }
      return { token: null, host: null };
    } catch {
      return { token: null, host: null };
    } finally {
      set({ isLoading: false });
    }
  },

  setHost: (host) => set({ host }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
}));
