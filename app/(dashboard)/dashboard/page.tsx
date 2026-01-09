'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { reportsService } from '@/services/reports.service';
import { FinancialSummary } from '@/types/api';

export default function DashboardPage() {
  const [data, setData] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      // Verificar se está autenticado
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Não autenticado');
          setIsLoading(false);
          return;
        }
      }

      try {
        const summary = await reportsService.getFinancialSummary();
        setData(summary);
        setError('');
      } catch (error: any) {
        console.error('Erro ao buscar dados do dashboard:', error);
        setError(error.message || 'Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    // Delay de 500ms para garantir que tokens foram salvos após login
    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Carregando...</div>
          <div className="text-sm text-muted-foreground">Aguarde enquanto carregamos seus dados</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <div className="text-lg font-semibold mb-2">Erro ao carregar dados</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo em Caixa</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data ? formatCurrency(data.caixa_atual.saldo) : 'R$ 0,00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Saldo atual disponível
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data ? formatCurrency(data.caixa_atual.entradas) : 'R$ 0,00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de entradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data ? formatCurrency(data.caixa_atual.saidas) : 'R$ 0,00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de saídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data
                ? data.contas_pendentes.contas_a_pagar.quantidade +
                  data.contas_pendentes.contas_a_receber.quantidade
                : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Aguardando pagamento/recebimento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projeção Futura */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Projeção Financeira</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Atual</p>
                <p className="text-lg font-bold">
                  {formatCurrency(data.projecao_futura.saldo_atual)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">A Receber</p>
                <p className="text-lg font-bold text-green-600">
                  + {formatCurrency(data.projecao_futura.a_receber)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">A Pagar</p>
                <p className="text-lg font-bold text-red-600">
                  - {formatCurrency(data.projecao_futura.a_pagar)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo Projetado</p>
                <p className="text-lg font-bold">
                  {formatCurrency(data.projecao_futura.saldo_projetado)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
