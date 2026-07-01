// src/services/authService.js
import apiClient from './apiClient';

const BASE = '/users';

export const authService = {
  async signup(userData) {
    const res = await apiClient.post(`${BASE}/signup`, userData);
    return res.data;
  },

  async login(email, password) {
    const res = await apiClient.post(`${BASE}/login`, { email, password });
    return res.data;
  },

  async verifyEmail(email, code) {
    const res = await apiClient.post(`${BASE}/verify-email`, { email, code });
    return res.data;
  },

  async resendVerificationCode(email) {
    const res = await apiClient.post(`${BASE}/resend-verification`, { email });
    return res.data;
  },

  async forgotPassword(email) {
    const res = await apiClient.post(`${BASE}/forgotPassword`, { email });
    return res.data;
  },

  async resetPassword(token, password, passwordConfirm) {
    const res = await apiClient.patch(`${BASE}/resetPassword/${token}`, {
      password, passwordConfirm,
    });
    return res.data;
  },

  async updateMyPassword(passwordData) {
    const res = await apiClient.patch(`${BASE}/updateMyPassword`, passwordData);
    return res.data;
  },

  // _silent: true — boot-time call, must never hard-redirect on failure
  async getMe() {
    const res = await apiClient.get(`${BASE}/me`, { _silent: true });
    const d = res.data;
    // Handle { data: { doc } }, { data: { user } }, { user }, or bare user object
    return d?.data?.doc ?? d?.data?.user ?? d?.user ?? d?.data ?? d;
  },

  async updateMe(data) {
    const res = await apiClient.patch(`${BASE}/updateMe`, data);
    const d = res.data;
    return d?.data?.doc ?? d?.data?.user ?? d?.user ?? d?.data ?? d;
  },

  async deleteMe() {
    await apiClient.delete(`${BASE}/deleteMe`);
  },
};
