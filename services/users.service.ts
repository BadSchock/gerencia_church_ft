import api from './api';
import { User } from '@/types/api';

export const usersService = {
  async getAll(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  async getById(id: number): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  async create(user: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<User> {
    const { data } = await api.post<User>('/users', user);
    return data;
  },

  async update(
    id: number,
    user: {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      active?: boolean;
    }
  ): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}`, user);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async toggleStatus(id: number, active: boolean): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}`, { active });
    return data;
  },
};
