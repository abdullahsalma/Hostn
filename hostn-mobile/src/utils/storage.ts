import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { MMKV } from 'react-native-mmkv';

// MMKV for non-sensitive app state (fast, synchronous)
export const mmkv = new MMKV({ id: 'hostn-app-storage' });

// Web fallback: expo-secure-store does not work on web, so use localStorage
const isWeb = Platform.OS === 'web';

const webStorage = {
  async getItemAsync(key: string): Promise<string | null> {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  async setItemAsync(key: string, value: string): Promise<void> {
    try { localStorage.setItem(key, value); } catch {}
  },
  async deleteItemAsync(key: string): Promise<void> {
    try { localStorage.removeItem(key); } catch {}
  },
};

const store = isWeb ? webStorage : SecureStore;

// SecureStore for sensitive data (tokens) — with web fallback
export const secureStorage = {
  async getToken(): Promise<string | null> {
    try {
      return await store.getItemAsync('hostn_token');
    } catch {
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    await store.setItemAsync('hostn_token', token);
  },

  async removeToken(): Promise<void> {
    await store.deleteItemAsync('hostn_token');
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await store.getItemAsync('hostn_refresh_token');
    } catch {
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    await store.setItemAsync('hostn_refresh_token', token);
  },

  async removeRefreshToken(): Promise<void> {
    await store.deleteItemAsync('hostn_refresh_token');
  },
};

// MMKV helpers for app state
export const appStorage = {
  getOnboardingComplete(): boolean {
    return mmkv.getBoolean('onboarding_complete') ?? false;
  },

  setOnboardingComplete(value: boolean): void {
    mmkv.set('onboarding_complete', value);
  },

  getLanguage(): string {
    return mmkv.getString('language') ?? 'en';
  },

  setLanguage(lang: string): void {
    mmkv.set('language', lang);
  },

  getUserJson(): string | undefined {
    return mmkv.getString('user_data');
  },

  setUserJson(json: string): void {
    mmkv.set('user_data', json);
  },

  removeUserJson(): void {
    mmkv.delete('user_data');
  },
};
