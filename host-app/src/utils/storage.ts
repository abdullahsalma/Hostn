import * as SecureStore from 'expo-secure-store';

const KEYS = {
  TOKEN: 'hostn_host_token',
  REFRESH_TOKEN: 'hostn_host_refresh_token',
  HOST_DATA: 'hostn_host_data',
  LOCALE: 'hostn_host_locale',
} as const;

export const secureStorage = {
  getToken: () => SecureStore.getItemAsync(KEYS.TOKEN),
  setToken: (token: string) => SecureStore.setItemAsync(KEYS.TOKEN, token),
  removeToken: () => SecureStore.deleteItemAsync(KEYS.TOKEN),

  getRefreshToken: () => SecureStore.getItemAsync(KEYS.REFRESH_TOKEN),
  setRefreshToken: (token: string) => SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token),
  removeRefreshToken: () => SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),

  getLocale: () => SecureStore.getItemAsync(KEYS.LOCALE),
  setLocale: (locale: string) => SecureStore.setItemAsync(KEYS.LOCALE, locale),

  clearAll: async () => {
    await SecureStore.deleteItemAsync(KEYS.TOKEN);
    await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.HOST_DATA);
  },
};
