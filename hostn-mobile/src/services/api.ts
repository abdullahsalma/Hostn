import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import { secureStorage } from '../utils/storage';
import { showToast } from '../components/ui/Toast';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
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

// Response interceptor: handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await secureStorage.removeToken();
      // Auth store will handle redirect via state change
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
