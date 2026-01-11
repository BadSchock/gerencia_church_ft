// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Enums
export enum UserRole {
  admin = 'admin',
  finance = 'finance',
  leader = 'leader',
  secretary = 'secretary',
}

export enum MemberStatus {
  active = 'active',
  inactive = 'inactive',
  transferred = 'transferred',
}

export enum PaymentStatus {
  pending = 'pending',
  paid = 'paid',
  overdue = 'overdue',
  cancelled = 'cancelled',
}

export enum CashFlowType {
  entrada = 'entrada',
  saida = 'saida',
}

// User
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Member
export interface Member {
  id: number;
  name: string;
  cpf?: string;
  birth_date?: string;
  phone?: string;
  email?: string;
  photo?: string;
  details?: string;
  status: MemberStatus;
  created_at: string;
  updated_at: string;
}

// Department
export interface Department {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Cash Flow
export interface CashFlow {
  id: number;
  type: CashFlowType;
  description: string;
  amount: number;
  date: string;
  category?: string;
  payment_method?: string;
  paid_at?: string;
  received_by_user_id?: number;
  origem?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

// Accounts Payable
export interface AccountPayable {
  id: number;
  description: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: PaymentStatus;
  invoice_number?: string;
  expense_category?: string;
  created_at: string;
  updated_at: string;
}

// Accounts Receivable
export interface AccountReceivable {
  id: number;
  description: string;
  amount: number;
  due_date: string;
  received_date?: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

// Auth
export interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Reports
export interface FinancialSummary {
  caixa_atual: {
    entradas: number;
    saidas: number;
    saldo: number;
  };
  contas_pendentes: {
    contas_a_pagar: {
      quantidade: number;
      total: number;
      contas: AccountPayable[];
    };
    contas_a_receber: {
      quantidade: number;
      total: number;
      contas: AccountReceivable[];
    };
    saldo_previsto: number;
  };
  projecao_futura: {
    saldo_atual: number;
    a_receber: number;
    a_pagar: number;
    saldo_projetado: number;
  };
}
