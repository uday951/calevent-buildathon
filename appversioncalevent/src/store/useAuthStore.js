import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      const userData = await AsyncStorage.getItem('@user_data');
      if (token && userData) {
        set({ token, user: JSON.parse(userData), isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      console.error('Failed to restore auth', e);
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      // Check if admin credentials
      if (email === 'admin@calevent.com') {
        const response = await api.post('/admin/login', { email, password });
        const { admin, token } = response.data.data;
        const user = { ...admin, role: 'admin' };

        await AsyncStorage.setItem('@auth_token', token);
        await AsyncStorage.setItem('@user_data', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
        return { success: true, role: 'admin' };
      }
      
      // Regular customer login
      const response = await api.post('/auth/customer/login', { email, password });
      const { token, customer } = response.data.data;
      const user = { ...customer, role: 'customer' };

      await AsyncStorage.setItem('@auth_token', token);
      await AsyncStorage.setItem('@user_data', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
      return { success: true, role: 'customer' };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  },

  register: async (name, email, phone, password) => {
    try {
      const response = await api.post('/auth/customer/register', { name, email, phone, password });
      const data = response.data;

      // If token returned (auto-login after register)
      if (data.data?.token) {
        const { token, customer } = data.data;
        const user = { ...customer, role: 'customer' };
        await AsyncStorage.setItem('@auth_token', token);
        await AsyncStorage.setItem('@user_data', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      }
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
