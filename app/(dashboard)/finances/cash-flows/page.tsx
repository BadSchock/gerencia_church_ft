'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Filter, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';
import { financeService } from '@/services/finance.service';
import { CashFlow, CashFlowType } from '@/types/api';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Schema de validação Zod
const cashFlowSchema = z.object({
  description: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
  amount: z
    .string()
    .min(1, 'Valor é obrigatório')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Valor deve ser maior que zero',
    }),
  type: z.enum(['entrada', 'saida']),
  date: z.string().min(1, 'Data é obrigatória'),
});

type CashFlowFormData = z.infer<typeof cashFlowSchema>;

interface BalanceData {
  saldo: number;
  total_entradas: number;
  total_saidas: number;
}

export default function CashFlowsPage() {
  const router = useRouter();
  const { canAccessFinance } = usePermissions();

  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [filteredCashFlows, setFilteredCashFlows] = useState<CashFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [balance, setBalance] = useState<BalanceData>({
    saldo: 0,
    total_entradas: 0,
    total_saidas: 0,
  });

  // Filtros
  const [filterType, setFilterType] = useState<string>('all');
  const [filterText, setFilterText] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [filterOrigin, setFilterOrigin] = useState<string>('all');

  // Modais
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [selectedCashFlow, setSelectedCashFlow] = useState<CashFlow | null>(null);

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CashFlowFormData>({
    resolver: zodResolver(cashFlowSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  });

  // Verificar permissões
  useEffect(() => {
    if (!canAccessFinance()) {
      router.push('/dashboard');
    }
  }, [canAccessFinance, router]);

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    applyFilters();
  }, [cashFlows, filterType, filterText, filterStartDate, filterEndDate, filterPaymentMethod, filterOrigin]);

  // Helper para resetar seleção e fechar modais
  function resetSelection() {
    setSelectedCashFlow(null);
    setConfirmDeleteModalOpen(false);
  }

  async function loadData() {
    try {
      setLoading(true);
      const [cashFlowsData, balanceData] = await Promise.all([
        financeService.getAllCashFlows(),
        financeService.getCashBalance(),
      ]);
      
      // Ordenar por data (mais recente primeiro)
      const sorted = cashFlowsData.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setCashFlows(sorted);
      setBalance(balanceData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do caixa');
    } finally {
      setLoading(false);
    }
  }

  // Aplicar filtros
  function applyFilters() {
    let filtered = [...cashFlows];

    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter((cf) => cf.type === filterType);
    }

    // Filtro por texto
    if (filterText) {
      filtered = filtered.filter((cf) =>
        cf.description.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    // Filtro por data inicial
    if (filterStartDate) {
      filtered = filtered.filter(
        (cf) => new Date(cf.date) >= new Date(filterStartDate)
      );
    }

    // Filtro por data final
    if (filterEndDate) {
      filtered = filtered.filter(
        (cf) => new Date(cf.date) <= new Date(filterEndDate)
      );
    }

    // Filtro por forma de pagamento
    if (filterPaymentMethod !== 'all') {
      filtered = filtered.filter((cf) => cf.payment_method === filterPaymentMethod);
    }

    // Filtro por origem
    if (filterOrigin !== 'all') {
      if (filterOrigin === 'manual') {
        filtered = filtered.filter((cf) => !cf.origem);
      } else if (filterOrigin === 'automatic') {
        filtered = filtered.filter((cf) => cf.origem);
      }
    }

    setFilteredCashFlows(filtered);
  }

  // Limpar filtros
  function clearFilters() {
    setFilterType('all');
    setFilterText('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterPaymentMethod('all');
    setFilterOrigin('all');
  }

  // Criar movimentação
  async function onCreateSubmit(data: CashFlowFormData) {
    try {
      setActionLoading('create');
      await financeService.createCashFlow({
        description: data.description,
        amount: Number(data.amount),
        type: data.type as CashFlowType,
        date: data.date,
      });
      toast.success('Movimentação criada com sucesso');
      setCreateModalOpen(false);
      reset();
      await loadData();
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
      toast.error('Erro ao criar movimentação');
    } finally {
      setActionLoading(null);
    }
  }

  // Excluir movimentação
  async function handleDelete() {
    if (!selectedCashFlow) return;

    // Verificar se é manual (category será usado no futuro para distinguir)
    // Por enquanto, permitir exclusão de todas exceto as que vierem de contas
    
    try {
      setActionLoading(`delete-${selectedCashFlow.id}`);
      await financeService.deleteCashFlow(selectedCashFlow.id);
      toast.success('Movimentação removida com sucesso');
      resetSelection();
      await loadData();
    } catch (error: any) {
      console.error('Erro ao excluir movimentação:', error);
      const errorMsg = error?.response?.data?.message || 'Erro ao remover movimentação';
      toast.error(errorMsg);
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

  // Renderizar badge de tipo
  function renderTypeBadge(type: CashFlowType) {
    if (type === 'entrada') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ↑ Entrada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        ↓ Saída
      </span>
    );
  }

  // Renderizar origem (manual ou automática)
  function renderOriginBadge(cashFlow: CashFlow) {
    if (cashFlow.origem) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {cashFlow.origem}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Manual
      </span>
    );
  }

  // Renderizar forma de pagamento
  function renderPaymentMethod(method: string | null) {
    if (!method) return '-';
    const labels: Record<string, string> = {
      PIX: 'PIX',
      DINHEIRO: 'Dinheiro',
      CARTAO_CREDITO: 'Cartão de Crédito',
      CARTAO_DEBITO: 'Cartão de Débito',
      TRANSFERENCIA: 'Transferência',
    };
    return labels[method] || method;
  }

  // Renderizar ações
  function renderActions(cashFlow: CashFlow) {
    // Permitir exclusão apenas de movimentações manuais
    const isAutomatic = cashFlow.origem !== null && cashFlow.origem !== undefined;
    
    if (isAutomatic) {
      return (
        <span className="text-sm text-gray-500">
          -
        </span>
      );
    }

    return (
      <Button
        size="sm"
        variant="destructive"
        onClick={() => {
          setSelectedCashFlow(cashFlow);
          setConfirmDeleteModalOpen(true);
        }}
        disabled={actionLoading !== null}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    );
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
        <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Movimentação
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Saldo Atual */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balance.saldo)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Saldo disponível em caixa
            </p>
          </CardContent>
        </Card>

        {/* Total de Entradas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(balance.total_entradas)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Todas as entradas registradas
            </p>
          </CardContent>
        </Card>

        {/* Total de Saídas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(balance.total_saidas)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Todas as saídas registradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="entrada">Entradas</SelectItem>
                  <SelectItem value="saida">Saídas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Texto */}
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Buscar por descrição..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>

            {/* Forma de Pagamento */}
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                  <SelectItem value="CARTAO_CREDITO">Cartão de Crédito</SelectItem>
                  <SelectItem value="CARTAO_DEBITO">Cartão de Débito</SelectItem>
                  <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data Inicial */}
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>

            {/* Data Final */}
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>

            {/* Origem */}
            <div className="space-y-2">
              <Label>Origem</Label>
              <Select value={filterOrigin} onValueChange={setFilterOrigin}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automatic">Automática</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botão Limpar Filtros */}
          {(filterType !== 'all' || filterText || filterStartDate || filterEndDate || filterPaymentMethod !== 'all' || filterOrigin !== 'all') && (
            <div className="mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-600">Carregando...</div>
          ) : filteredCashFlows.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              {cashFlows.length === 0
                ? 'Nenhuma movimentação encontrada'
                : 'Nenhuma movimentação encontrada com os filtros aplicados'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Forma Pagamento</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCashFlows.map((cashFlow) => (
                  <TableRow key={cashFlow.id}>
                    <TableCell>{formatDate(cashFlow.date)}</TableCell>
                    <TableCell className="font-medium">{cashFlow.description}</TableCell>
                    <TableCell>{renderTypeBadge(cashFlow.type)}</TableCell>
                    <TableCell className={cashFlow.type === 'entrada' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {cashFlow.type === 'entrada' ? '+' : '-'} {formatCurrency(cashFlow.amount)}
                    </TableCell>
                    <TableCell>{renderPaymentMethod(cashFlow.payment_method)}</TableCell>
                    <TableCell>{renderOriginBadge(cashFlow)}</TableCell>
                    <TableCell>{renderActions(cashFlow)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal: Criar Movimentação */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Movimentação</DialogTitle>
            <DialogDescription>
              Preencha os dados da nova movimentação no caixa.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  placeholder="Ex: Doação - João Silva"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  onValueChange={(value) => setValue('type', value as 'entrada' | 'saida')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-600">{errors.type.message}</p>
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
                <Label htmlFor="date">Data *</Label>
                <Input id="date" type="date" {...register('date')} />
                {errors.date && (
                  <p className="text-sm text-red-600">{errors.date.message}</p>
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
                {actionLoading === 'create' ? 'Criando...' : 'Criar Movimentação'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmar Exclusão */}
      <Dialog open={confirmDeleteModalOpen} onOpenChange={setConfirmDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover esta movimentação? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          {selectedCashFlow && (
            <div className="py-4 space-y-2">
              <p>
                <strong>Descrição:</strong> {selectedCashFlow.description}
              </p>
              <p>
                <strong>Tipo:</strong> {selectedCashFlow.type === 'entrada' ? 'Entrada' : 'Saída'}
              </p>
              <p>
                <strong>Valor:</strong> {formatCurrency(selectedCashFlow.amount)}
              </p>
              <p>
                <strong>Data:</strong> {formatDate(selectedCashFlow.date)}
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
