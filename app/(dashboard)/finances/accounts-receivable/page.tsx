'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { usePermissions } from '@/hooks/use-permissions';
import { financeService } from '@/services/finance.service';
import { AccountReceivable } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge, AccountStatus } from '@/components/finance/status-badge';

// Schema de validação Zod
const accountReceivableSchema = z.object({
  description: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
  amount: z
    .string()
    .min(1, 'Valor é obrigatório')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Valor deve ser maior que zero',
    }),
  due_date: z.string().min(1, 'Data de vencimento é obrigatória'),
});

type AccountReceivableFormData = z.infer<typeof accountReceivableSchema>;

export default function AccountsReceivablePage() {
  const router = useRouter();
  const { canAccessFinance } = usePermissions();

  const [accounts, setAccounts] = useState<AccountReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modais
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [confirmReceiveModalOpen, setConfirmReceiveModalOpen] = useState(false);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountReceivable | null>(null);

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AccountReceivableFormData>({
    resolver: zodResolver(accountReceivableSchema),
  });

  // Verificar permissões
  useEffect(() => {
    if (!canAccessFinance()) {
      router.push('/dashboard');
    }
  }, [canAccessFinance, router]);

  // Carregar contas
  useEffect(() => {
    loadAccounts();
  }, []);

  // Helper para resetar seleção e fechar modais
  function resetSelection() {
    setSelectedAccount(null);
    setConfirmReceiveModalOpen(false);
    setConfirmDeleteModalOpen(false);
  }

  async function loadAccounts() {
    try {
      setLoading(true);
      const data = await financeService.getAllAccountsReceivable();
      // Ordenar por data de vencimento
      const sorted = data.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
      setAccounts(sorted);
    } catch (error) {
      console.error('Erro ao carregar contas a receber:', error);
      toast.error('Erro ao carregar contas a receber');
    } finally {
      setLoading(false);
    }
  }

  // Criar conta
  async function onCreateSubmit(data: AccountReceivableFormData) {
    try {
      setActionLoading('create');
      await financeService.createAccountReceivable({
        description: data.description,
        amount: Number(data.amount),
        due_date: data.due_date,
      });
      toast.success('Conta criada com sucesso');
      setCreateModalOpen(false);
      reset();
      await loadAccounts();
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast.error('Erro ao criar conta a receber');
    } finally {
      setActionLoading(null);
    }
  }

  // Marcar como recebido
  async function handleMarkAsReceived() {
    if (!selectedAccount) return;

    try {
      setActionLoading(`receive-${selectedAccount.id}`);
      await financeService.markAsReceived(selectedAccount.id);
      toast.success('Conta marcada como recebida e registrada no caixa');
      resetSelection();
      await loadAccounts();
    } catch (error) {
      console.error('Erro ao marcar como recebido:', error);
      toast.error('Erro ao marcar conta como recebida');
    } finally {
      setActionLoading(null);
    }
  }

  // Excluir conta
  async function handleDelete() {
    if (!selectedAccount) return;

    try {
      setActionLoading(`delete-${selectedAccount.id}`);
      await financeService.deleteAccountReceivable(selectedAccount.id);
      toast.success('Conta removida com sucesso');
      resetSelection();
      await loadAccounts();
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast.error('Erro ao remover conta');
    } finally {
      setActionLoading(null);
    }
  }

  // Formatar moeda
  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  // Formatar data
  function formatDate(date: Date | string) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }

  // Verificar se está vencido
  function isOverdue(dueDate: Date | string, status: string) {
    if (status !== 'pending') return false;
    return new Date(dueDate) < new Date();
  }

  // Renderizar ações
  function renderActions(account: AccountReceivable) {
    if (account.status === 'paid') {
      return (
        <span className="text-sm text-gray-600">
          Recebido em {account.received_date ? formatDate(account.received_date) : '-'}
        </span>
      );
    }

    if (account.status === 'pending' || isOverdue(account.due_date, account.status)) {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => {
              setSelectedAccount(account);
              setConfirmReceiveModalOpen(true);
            }}
            disabled={actionLoading !== null}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Marcar como Recebido
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setSelectedAccount(account);
              setConfirmDeleteModalOpen(true);
            }}
            disabled={actionLoading !== null}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    return null;
  }

  // Verificar permissão
  if (!canAccessFinance()) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Você não tem permissão para acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contas a Receber</h1>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contas a Receber</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-600">Carregando...</div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              Nenhuma conta a receber cadastrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data de Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => {
                  const displayStatus: AccountStatus = isOverdue(account.due_date, account.status)
                    ? 'overdue'
                    : (account.status as AccountStatus);

                  return (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.description}</TableCell>
                      <TableCell>{formatCurrency(account.amount)}</TableCell>
                      <TableCell>{formatDate(account.due_date)}</TableCell>
                      <TableCell>
                        <StatusBadge status={displayStatus} type="receivable" />
                      </TableCell>
                      <TableCell>{renderActions(account)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal: Criar Conta */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Conta a Receber</DialogTitle>
            <DialogDescription>
              Preencha os dados da nova conta a receber.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  placeholder="Ex: Dízimo - Janeiro 2026"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('amount')}
                />
                {errors.amount && (
                  <p className="text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Data de Vencimento *</Label>
                <Input id="due_date" type="date" {...register('due_date')} />
                {errors.due_date && (
                  <p className="text-sm text-red-600">{errors.due_date.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateModalOpen(false);
                  reset();
                }}
                disabled={actionLoading === 'create'}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={actionLoading === 'create'}>
                {actionLoading === 'create' ? 'Criando...' : 'Criar Conta'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmar Recebimento */}
      <Dialog open={confirmReceiveModalOpen} onOpenChange={setConfirmReceiveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Recebimento</DialogTitle>
            <DialogDescription>
              Ao marcar como recebida, esta ação criará automaticamente uma{' '}
              <strong>ENTRADA no caixa</strong>. Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="py-4 space-y-2">
              <p>
                <strong>Descrição:</strong> {selectedAccount.description}
              </p>
              <p>
                <strong>Valor:</strong> {formatCurrency(selectedAccount.amount)}
              </p>
              <p>
                <strong>Vencimento:</strong> {formatDate(selectedAccount.due_date)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetSelection}
              disabled={actionLoading !== null}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleMarkAsReceived}
              disabled={actionLoading !== null}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? 'Processando...' : 'Confirmar Recebimento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmar Exclusão */}
      <Dialog open={confirmDeleteModalOpen} onOpenChange={setConfirmDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover esta conta a receber? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="py-4 space-y-2">
              <p>
                <strong>Descrição:</strong> {selectedAccount.description}
              </p>
              <p>
                <strong>Valor:</strong> {formatCurrency(selectedAccount.amount)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetSelection}
              disabled={actionLoading !== null}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading !== null}
            >
              {actionLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
