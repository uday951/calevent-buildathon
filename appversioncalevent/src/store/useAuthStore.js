import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // For initial token check

  // Hydrate user state from AsyncStorage on app launch
  initAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      const userData = await AsyncStorage.getItem('@user_data');
      if (token && userData) {
        set({ token, user: JSON.parse(userData), isAuthenticated: true });
      }
    } catch (e) {
      console.error('Failed to restore auth', e);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      // Reusing the same backend endpoint path as your MERN app
      const response = await api.post('/users/login', { email, password });
      const { token, user } = response.data;
      
      await AsyncStorage.setItem('@auth_token', token);
      await AsyncStorage.setItem('@user_data', JSON.stringify(user));
      
      set({ user, token, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('@auth_token');
    await AsyncStorage.removeItem('@user_data');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
