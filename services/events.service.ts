import api from './api';

export interface Event {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  city?: string;
  created_at: string;
  updated_at: string;
  // Contadores
  _count?: {
    registrations: number;
    pricing_rules: number;
  };
}

export interface CreateEventDto {
  name: string;
  start_date: string;
  end_date: string;
  city?: string;
}

export interface UpdateEventDto {
  name?: string;
  start_date?: string;
  end_date?: string;
  city?: string;
}

export const eventsService = {
  async getAll(): Promise<Event[]> {
    const response = await api.get('/events');
    return response.data;
  },

  async getById(id: number): Promise<Event> {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  async create(data: CreateEventDto): Promise<Event> {
    const response = await api.post('/events', data);
    return response.data;
  },

  async update(id: number, data: UpdateEventDto): Promise<Event> {
    const response = await api.patch(`/events/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/events/${id}`);
  },
};
