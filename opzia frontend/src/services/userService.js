// src/services/userService.js
import apiClient from './apiClient';

const BASE = '/users';

export const userService = {
  async getAllUsers(params = {}) {
    const res = await apiClient.get(BASE, { params });
    const d = res.data;
    return Array.isArray(d?.data?.users)
      ? d.data.users
      : Array.isArray(d?.users)
        ? d.users
        : Array.isArray(d?.data?.docs)
          ? d.data.docs
          : Array.isArray(d?.docs)
            ? d.docs
            : Array.isArray(d?.data)
              ? d.data
              : Array.isArray(d)
                ? d
                : [];
  },

  async getUser(id) {
    const res = await apiClient.get(`${BASE}/${id}`);
    const d = res.data;
    return d?.data?.user ?? d?.user ?? d?.data ?? d;
  },

  async updateUser(id, data) {
    const res = await apiClient.patch(`${BASE}/${id}`, data);
    const d = res.data;
    return d?.data?.user ?? d?.user ?? d?.data ?? d;
  },

  async createUser(data) {
    const res = await apiClient.post(BASE, data);
    const d = res.data;
    return d?.data?.user ?? d?.user ?? d?.data ?? d;
  },

  async deleteUser(id) {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
