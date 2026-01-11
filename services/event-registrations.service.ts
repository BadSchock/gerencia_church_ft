import api from './api';
import { Event } from './events.service';
import { Registrant } from './registrants.service';

export type LodgingType = 'SCHOOL_BED' | 'HOTEL' | 'OWN_HOUSE' | 'UNKNOWN';
export type RegistrationPaymentStatus = 'PENDING' | 'PAID' | 'CANCELED';
export type PaymentMethod = 'PIX' | 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'TRANSFERENCIA';

export interface EventRegistration {
  id: number;
  event_id: number;
  registrant_id: number;
  registration_date: string;
  needs_school_bed: boolean;
  lodging_type: LodgingType;
  wants_shirt: boolean;
  shirt_note?: string;
  shirt_delivered: boolean;
  registration_price_applied: number;
  shirt_price_applied: number;
  total: number;
  payment_status: RegistrationPaymentStatus;
  paid_at?: string;
  payment_method?: PaymentMethod;
  paid_by_user_id?: number;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  event?: Event;
  registrant?: Registrant;
  paid_by?: {
    id: number;
    name: string;
  };
}

export interface CreateRegistrationDto {
  event_id: number;
  registrant_id: number;
  lodging_type: LodgingType;
  wants_shirt?: boolean;
  shirt_note?: string;
  shirt_delivered?: boolean;
  payment_status?: RegistrationPaymentStatus;
  paid_at?: string;
  paid_by_user_id?: number;
}

export interface UpdateRegistrationDto {
  event_id?: number;
  registrant_id?: number;
  lodging_type?: LodgingType;
  wants_shirt?: boolean;
  shirt_note?: string;
  shirt_delivered?: boolean;
  payment_status?: RegistrationPaymentStatus;
  paid_at?: string;
  paid_by_user_id?: number;
}

export interface MarkAsPaidDto {
  payment_method: PaymentMethod;
  paid_at?: string;
  paid_by_user_id: number;
}

export interface RegistrationStatistics {
  total_registrations: number;
  paid: number;
  pending: number;
  canceled: number;
  total_revenue: number;
}

export const eventRegistrationsService = {
  async getAll(eventId?: number): Promise<EventRegistration[]> {
    const response = await api.get('/event-registrations', {
      params: eventId ? { eventId } : {},
    });
    return response.data;
  },

  async getById(id: number): Promise<EventRegistration> {
    const response = await api.get(`/event-registrations/${id}`);
    return response.data;
  },

  async getStatistics(eventId?: number): Promise<RegistrationStatistics> {
    const url = eventId 
      ? `/event-registrations/statistics/${eventId}`
      : '/event-registrations/statistics';
    const response = await api.get(url);
    return response.data;
  },

  async create(data: CreateRegistrationDto): Promise<EventRegistration> {
    const response = await api.post('/event-registrations', data);
    return response.data;
  },

  async update(id: number, data: UpdateRegistrationDto): Promise<EventRegistration> {
    const response = await api.patch(`/event-registrations/${id}`, data);
    return response.data;
  },

  async markAsPaid(id: number, data: MarkAsPaidDto): Promise<{
    registration: EventRegistration;
    cash_flow: any;
  }> {
    const response = await api.post(`/event-registrations/${id}/mark-as-paid`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/event-registrations/${id}`);
  },
};
