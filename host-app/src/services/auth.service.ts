import api from './api';

export const authService = {
  sendOtp: (phone: string) => api.post('/auth/send-otp', { phone }).then(r => r.data),
  verifyOtp: (phone: string, otp: string) => api.post('/auth/verify-otp', { phone, otp }).then(r => r.data),
  register: (data: { name: string; phone: string; email: string; nationalId: string }) =>
    api.post('/auth/register', data).then(r => r.data),
  getOnboardingStatus: () => api.get('/host/onboarding/status').then(r => r.data),
  completeOnboarding: () => api.post('/host/onboarding/finish').then(r => r.data),
};
