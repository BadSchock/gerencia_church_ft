import api from './api';
import { Member } from '@/types/api';

export const membersService = {
  async getAll(): Promise<Member[]> {
    const { data } = await api.get<Member[]>('/members');
    return data;
  },

  async getById(id: number): Promise<Member> {
    const { data } = await api.get<Member>(`/members/${id}`);
    return data;
  },

  async create(member: Partial<Member>): Promise<Member> {
    const { data } = await api.post<Member>('/members', member);
    return data;
  },

  async update(id: number, member: Partial<Member>): Promise<Member> {
    const { data } = await api.patch<Member>(`/members/${id}`, member);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/members/${id}`);
  },
};
