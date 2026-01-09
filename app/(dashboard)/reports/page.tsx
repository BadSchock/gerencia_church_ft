'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/use-permissions';
import { reportsService } from '@/services/reports.service';
import { financeService } from '@/services/finance.service';
import { membersService } from '@/services/members.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Filters from './components/filters';
import SummaryCards from './components/summary-cards';
import CashFlowChart from './components/financial/cash-flow-chart';
import IncomeExpenseBar from './components/financial/income-expense-bar';
import ExpensesPieChart from './components/financial/expenses-pie-chart';
import PeopleSummary from './components/people/people-summary';
import { Member, MemberStatus, CashFlow, CashFlowType, AccountPayable } from '@/types/api';

export default function ReportsPage() {
  const router = useRouter();
  const { canAccessReports } = usePermissions();

  // Estados de dados financeiros
  const [totalEntradas, setTotalEntradas] = useState(0);
  const [totalSaidas, setTotalSaidas] = useState(0);
  const [saldo, setSaldo] = useState(0);
  const [contasPendentes, setContasPendentes] = useState(0);

  // Estados de gráficos
  const [cashFlowData, setCashFlowData] = useState<Array<{
    date: string;
    entradas: number;
    saidas: number;
    saldo: number;
  }>>([]);

  const [expensesData, setExpensesData] = useState<Array<{
    name: string;
    value: number;
  }>>([]);

  // Estados de pessoas
  const [totalMembers, setTotalMembers] = useState(0);
  const [activeMembers, setActiveMembers] = useState(0);
  const [inactiveMembers, setInactiveMembers] = useState(0);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Verificar permissões
  useEffect(() => {
    if (!canAccessReports()) {
      toast.error('Você não tem permissão para acessar relatórios');
      router.push('/dashboard');
    }
  }, [canAccessReports, router]);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Definir período padrão (este mês)
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const startDateStr = firstDay.toISOString().split('T')[0];
      const endDateStr = lastDay.toISOString().split('T')[0];
      
      setStartDate(startDateStr);
      setEndDate(endDateStr);
      setHasActiveFilters(true);

      await Promise.all([
        loadFinancialData(startDateStr, endDateStr),
        loadPeopleData(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error('Erro ao carregar dados dos relatórios');
    } finally {
      setLoading(false);
    }
  };

  const loadFinancialData = async (start: string, end: string) => {
    try {
      // Carregar resumo financeiro
      const summary = await reportsService.getFinancialSummary();
      setTotalEntradas(summary.caixa_atual.entradas);
      setTotalSaidas(summary.caixa_atual.saidas);
      setSaldo(summary.caixa_atual.saldo);
      
      // Calcular contas pendentes
      const pendingTotal = 
        summary.contas_pendentes.contas_a_pagar.total + 
        summary.contas_pendentes.contas_a_receber.total;
      setContasPendentes(pendingTotal);

      // Carregar fluxo de caixa para o gráfico
      const cashFlows = await financeService.getAllCashFlows();
      
      // Filtrar por data
      const filteredFlows = cashFlows.filter((flow: CashFlow) => {
        const flowDate = new Date(flow.date);
        const startDateObj = new Date(start);
        const endDateObj = new Date(end);
        return flowDate >= startDateObj && flowDate <= endDateObj;
      });

      // Agrupar por data e calcular totais
      const flowsByDate = filteredFlows.reduce((acc: any, flow: CashFlow) => {
        const date = flow.date.split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, entradas: 0, saidas: 0 };
        }
        if (flow.type === CashFlowType.entrada) {
          acc[date].entradas += flow.amount;
        } else {
          acc[date].saidas += flow.amount;
        }
        return acc;
      }, {});

      // Converter para array e calcular saldo acumulado
      let saldoAcumulado = 0;
      const chartData = Object.values(flowsByDate)
        .sort((a: any, b: any) => a.date.localeCompare(b.date))
        .map((item: any) => {
          saldoAcumulado += item.entradas - item.saidas;
          return {
            ...item,
            saldo: saldoAcumulado,
          };
        });

      setCashFlowData(chartData);

      // Carregar contas a pagar para o gráfico de pizza
      const accountsPayable = await financeService.getAllAccountsPayable();
      
      // Filtrar por período e status pago
      const filteredAccounts = accountsPayable.filter((account: AccountPayable) => {
        if (!account.paid_date) return false;
        const paidDate = new Date(account.paid_date);
        const startDateObj = new Date(start);
        const endDateObj = new Date(end);
        return paidDate >= startDateObj && paidDate <= endDateObj;
      });

      // Agrupar por descrição (categoria)
      const expensesByCategory = filteredAccounts.reduce((acc: any, account: AccountPayable) => {
        const category = account.description || 'Outros';
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += account.amount;
        return acc;
      }, {});

      const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({
        name,
        value: value as number,
      }));

      setExpensesData(pieData);

    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      throw error;
    }
  };

  const loadPeopleData = async () => {
    try {
      const members = await membersService.getAll();
      
      setTotalMembers(members.length);
      
      const active = members.filter((m: Member) => m.status === MemberStatus.active).length;
      const inactive = members.filter((m: Member) => m.status === MemberStatus.inactive).length;
      
      setActiveMembers(active);
      setInactiveMembers(inactive);
    } catch (error) {
      console.error('Erro ao carregar dados de pessoas:', error);
      throw error;
    }
  };

  const handleApplyFilters = async () => {
    if (!startDate || !endDate) {
      toast.error('Selecione o período para filtrar');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('A data inicial deve ser anterior à data final');
      return;
    }

    try {
      setLoading(true);
      setHasActiveFilters(true);
      await loadFinancialData(startDate, endDate);
      toast.success('Filtros aplicados com sucesso');
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
      toast.error('Erro ao aplicar filtros');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setHasActiveFilters(false);
    setCashFlowData([]);
    setExpensesData([]);
    toast.info('Filtros limpos. Selecione um período e clique em "Aplicar Filtros"');
  };

  if (!canAccessReports()) {
    return null;
  }

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600 mt-1">Visualização e análise de dados da igreja</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="financial">📊 Financeiro</TabsTrigger>
          <TabsTrigger value="people">👥 Pessoas</TabsTrigger>
        </TabsList>

        {/* Aba Financeiro */}
        <TabsContent value="financial">
          {/* Filtros */}
          <Filters
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Cards de Resumo */}
          <SummaryCards
            totalEntradas={totalEntradas}
            totalSaidas={totalSaidas}
            saldo={saldo}
            contasPendentes={contasPendentes}
            loading={loading}
          />

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <IncomeExpenseBar
              totalEntradas={totalEntradas}
              totalSaidas={totalSaidas}
              loading={loading}
            />
            <ExpensesPieChart
              data={expensesData}
              loading={loading}
            />
          </div>

          {/* Gráfico de Linha (largura total) */}
          <div className="mb-6">
            <CashFlowChart
              data={cashFlowData}
              loading={loading}
            />
          </div>
        </TabsContent>

        {/* Aba Pessoas */}
        <TabsContent value="people">
          <PeopleSummary
            totalMembers={totalMembers}
            activeMembers={activeMembers}
            inactiveMembers={inactiveMembers}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
