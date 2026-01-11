import axios from 'axios';
import api from './api';
import { LoginRequest, LoginResponse } from '@/types/api';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Usar axios direto para evitar passar pelo interceptor durante o login
    const { data } = await axios.post<LoginResponse>(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`,
      credentials
    );
    
    // Save tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      // Save user data
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }
    
    return data;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    // Clear tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('access_token');
  },

  getCurrentUser(): any | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
};
