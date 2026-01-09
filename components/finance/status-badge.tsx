// Tipos de status para contas financeiras
export type AccountStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

interface StatusBadgeProps {
  status: AccountStatus;
  type?: 'payable' | 'receivable';
}

export function StatusBadge({ status, type = 'payable' }: StatusBadgeProps) {
  const statusConfig: Record<AccountStatus, { label: string; color: string }> = {
    pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
    paid: { 
      label: type === 'receivable' ? 'Recebido' : 'Pago', 
      color: 'bg-green-100 text-green-800' 
    },
    overdue: { label: 'Vencido', color: 'bg-red-100 text-red-800' },
    cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
