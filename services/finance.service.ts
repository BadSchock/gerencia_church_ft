import api from './api';
import { CashFlow, AccountPayable, AccountReceivable } from '@/types/api';

export const financeService = {
  // Cash Flows
  async getAllCashFlows(): Promise<CashFlow[]> {
    const { data } = await api.get<CashFlow[]>('/cash-flows');
    return data;
  },

  async getCashBalance() {
    const { data } = await api.get('/cash-flows/balance');
    return data;
  },

  async createCashFlow(cashFlow: Partial<CashFlow>): Promise<CashFlow> {
    const { data } = await api.post<CashFlow>('/cash-flows', cashFlow);
    return data;
  },

  async deleteCashFlow(id: number): Promise<void> {
    await api.delete(`/cash-flows/${id}`);
  },

  // Accounts Payable
  async getAllAccountsPayable(): Promise<AccountPayable[]> {
    const { data } = await api.get<AccountPayable[]>('/accounts-payable');
    return data;
  },

  async createAccountPayable(account: Partial<AccountPayable>): Promise<AccountPayable> {
    const { data } = await api.post<AccountPayable>('/accounts-payable', account);
    return data;
  },

  async markAsPaid(id: number): Promise<AccountPayable> {
    const { data } = await api.patch<AccountPayable>(`/accounts-payable/${id}/mark-as-paid`);
    return data;
  },

  async deleteAccountPayable(id: number): Promise<void> {
    await api.delete(`/accounts-payable/${id}`);
  },

  // Accounts Receivable
  async getAllAccountsReceivable(): Promise<AccountReceivable[]> {
    const { data } = await api.get<AccountReceivable[]>('/accounts-receivable');
    return data;
  },

  async createAccountReceivable(account: Partial<AccountReceivable>): Promise<AccountReceivable> {
    const { data } = await api.post<AccountReceivable>('/accounts-receivable', account);
    return data;
  },

  async markAsReceived(id: number): Promise<AccountReceivable> {
    const { data } = await api.patch<AccountReceivable>(`/accounts-receivable/${id}/mark-as-received`);
    return data;
  },

  async deleteAccountReceivable(id: number): Promise<void> {
    await api.delete(`/accounts-receivable/${id}`);
  },
};
