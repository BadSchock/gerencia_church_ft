import api from './api';
import { School } from './schools.service';
import { Caravan } from './caravans.service';

export type AllocationStatus = 'CONFIRMED' | 'PENDING' | 'CANCELED';

export interface SchoolAllocation {
  id: number;
  school_id: number;
  caravan_id: number;
  allocated_count: number;
  status: AllocationStatus;
  overbook_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  school?: School;
  caravan?: Caravan;
}

export interface CreateAllocationDto {
  school_id: number;
  caravan_id: number;
  allocated_count: number;
  status?: AllocationStatus;
  overbook_reason?: string;
  notes?: string;
}

export interface UpdateAllocationDto {
  school_id?: number;
  caravan_id?: number;
  allocated_count?: number;
  status?: AllocationStatus;
  overbook_reason?: string;
  notes?: string;
}

export const allocationsService = {
  async getAll(filters?: { schoolId?: number; caravanId?: number }): Promise<SchoolAllocation[]> {
    const response = await api.get('/school-allocations', {
      params: filters,
    });
    return response.data;
  },

  async getById(id: number): Promise<SchoolAllocation> {
    const response = await api.get(`/school-allocations/${id}`);
    return response.data;
  },

  async create(data: CreateAllocationDto): Promise<SchoolAllocation> {
    const response = await api.post('/school-allocations', data);
    return response.data;
  },

  async update(id: number, data: UpdateAllocationDto): Promise<SchoolAllocation> {
    const response = await api.patch(`/school-allocations/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/school-allocations/${id}`);
  },
};
