import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import { secureStorage } from '../utils/storage';
import { showToast } from '../components/ui/Toast';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-Platform': 'mobile',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  async (config) => {
    const token = await secureStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-refresh logic
let isRefreshing = false;
let failedQueue: { resolve: (v: unknown) => void; reject: (e: unknown) => void }[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(undefined)));
  failedQueue = [];
};

// Response interceptor: handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expired — try refresh
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await secureStorage.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { token: newToken, refreshToken: newRefreshToken } = res.data;

        await secureStorage.setToken(newToken);
        await secureStorage.setRefreshToken(newRefreshToken);

        // Update zustand store (lazy import to avoid circular deps)
        const { useAuthStore } = require('../store/authStore');
        useAuthStore.getState().setTokens(newToken, newRefreshToken);

        processQueue(null);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh failed — force logout
        await secureStorage.removeToken();
        await secureStorage.removeRefreshToken();
        const { useAuthStore } = require('../store/authStore');
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Non-refreshable errors
    if (error.response?.status === 401) {
      await secureStorage.removeToken();
      await secureStorage.removeRefreshToken();
    } else if (error.response?.status === 403) {
      showToast('error', 'Access Denied', error.response?.data?.message);
    } else if (error.response?.status === 429) {
      showToast('warning', 'Too Many Requests', 'Please slow down and try again.');
    } else if (error.response?.status >= 500) {
      showToast('error', 'Server Error', 'Something went wrong. Please try again later.');
    } else if (!error.response && error.code === 'ECONNABORTED') {
      showToast('warning', 'Timeout', 'Request took too long. Check your connection.');
    }
    return Promise.reject(error);
  }
);

export default api;
