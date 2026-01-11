import api from './api';

export interface School {
  id: number;
  name: string;
  address: string;
  city: string;
  capacity: number;
  overbook_limit: number;
  contact_name?: string;
  contact_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Campos calculados (quando withOccupancy=true)
  occupied?: number;
  available?: number;
  has_overbook?: boolean;
}

export interface CreateSchoolDto {
  name: string;
  address: string;
  city: string;
  capacity: number;
  overbook_limit: number;
  contact_name?: string;
  contact_phone?: string;
  notes?: string;
}

export interface UpdateSchoolDto {
  name?: string;
  address?: string;
  city?: string;
  capacity?: number;
  overbook_limit?: number;
  contact_name?: string;
  contact_phone?: string;
  notes?: string;
}

export const schoolsService = {
  async getAll(withOccupancy = true): Promise<School[]> {
    const response = await api.get(`/schools`, {
      params: { withOccupancy },
    });
    return response.data;
  },

  async getById(id: number): Promise<School> {
    const response = await api.get(`/schools/${id}`);
    return response.data;
  },

  async getOccupancy(id: number): Promise<{
    occupied: number;
    capacity: number;
    available: number;
    overbook_limit: number;
    has_overbook: boolean;
  }> {
    const response = await api.get(`/schools/${id}/occupancy`);
    return response.data;
  },

  async create(data: CreateSchoolDto): Promise<School> {
    const response = await api.post('/schools', data);
    return response.data;
  },

  async update(id: number, data: UpdateSchoolDto): Promise<School> {
    const response = await api.patch(`/schools/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/schools/${id}`);
  },
};
