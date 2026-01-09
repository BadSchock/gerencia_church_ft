import api from './api';
import { FinancialSummary } from '@/types/api';

export const reportsService = {
  async getFinancialSummary(): Promise<FinancialSummary> {
    const { data } = await api.get<FinancialSummary>('/reports/financial-summary');
    return data;
  },

  async getCashBalance() {
    const { data } = await api.get('/reports/cash-balance');
    return data;
  },

  async getCashFlow(startDate: string, endDate: string) {
    const { data } = await api.get('/reports/cash-flow', {
      params: { startDate, endDate },
    });
    return data;
  },

  async getPendingAccounts() {
    const { data } = await api.get('/reports/pending-accounts');
    return data;
  },

  async getOverdueAccounts() {
    const { data} = await api.get('/reports/overdue-accounts');
    return data;
  },
};
