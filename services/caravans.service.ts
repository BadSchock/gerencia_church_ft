import api from './api';

export interface Caravan {
  id: number;
  city: string;
  congregation?: string;
  leader_name?: string;
  leader_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCaravanDto {
  city: string;
  congregation?: string;
  leader_name?: string;
  leader_phone?: string;
  notes?: string;
}

export interface UpdateCaravanDto {
  city?: string;
  congregation?: string;
  leader_name?: string;
  leader_phone?: string;
  notes?: string;
}

export const caravansService = {
  async getAll(): Promise<Caravan[]> {
    const response = await api.get('/caravans');
    return response.data;
  },

  async getById(id: number): Promise<Caravan> {
    const response = await api.get(`/caravans/${id}`);
    return response.data;
  },

  async create(data: CreateCaravanDto): Promise<Caravan> {
    const response = await api.post('/caravans', data);
    return response.data;
  },

  async update(id: number, data: UpdateCaravanDto): Promise<Caravan> {
    const response = await api.patch(`/caravans/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/caravans/${id}`);
  },
};
