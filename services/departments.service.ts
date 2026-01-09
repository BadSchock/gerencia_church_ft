import api from './api';
import { Department } from '@/types/api';

export const departmentsService = {
  async getAll(): Promise<Department[]> {
    const { data } = await api.get<Department[]>('/departments');
    return data;
  },

  async getById(id: number): Promise<Department> {
    const { data } = await api.get<Department>(`/departments/${id}`);
    return data;
  },

  async create(department: Partial<Department>): Promise<Department> {
    const { data } = await api.post<Department>('/departments', department);
    return data;
  },

  async update(id: number, department: Partial<Department>): Promise<Department> {
    const { data } = await api.patch<Department>(`/departments/${id}`, department);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/departments/${id}`);
  },
};
