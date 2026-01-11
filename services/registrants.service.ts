import api from './api';

export interface Registrant {
  id: number;
  full_name: string;
  cpf: string;
  phone?: string;
  congregation?: string;
  city?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRegistrantDto {
  full_name: string;
  cpf: string;
  phone?: string;
  congregation?: string;
  city?: string;
}

export interface UpdateRegistrantDto {
  full_name?: string;
  cpf?: string;
  phone?: string;
  congregation?: string;
  city?: string;
}

export const registrantsService = {
  async getAll(): Promise<Registrant[]> {
    const response = await api.get('/registrants');
    return response.data;
  },

  async getById(id: number): Promise<Registrant> {
    const response = await api.get(`/registrants/${id}`);
    return response.data;
  },

  async getByCpf(cpf: string): Promise<Registrant> {
    const response = await api.get('/registrants/by-cpf', {
      params: { cpf },
    });
    return response.data;
  },

  async create(data: CreateRegistrantDto): Promise<Registrant> {
    const response = await api.post('/registrants', data);
    return response.data;
  },

  async update(id: number, data: UpdateRegistrantDto): Promise<Registrant> {
    const response = await api.patch(`/registrants/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/registrants/${id}`);
  },
};
