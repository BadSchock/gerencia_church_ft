'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { financeService } from '@/services/finance.service';
import { CashFlow } from '@/types/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function CashFlowsPage() {
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCashFlows();
  }, []);

  const loadCashFlows = async () => {
    try {
      const data = await financeService.getAllCashFlows();
      setCashFlows(data);
    } catch (error) {
      console.error('Error loading cash flows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">Visualize todas as movimentações</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Movimentação
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashFlows.map((flow) => (
                <TableRow key={flow.id}>
                  <TableCell>{formatDate(flow.date)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        flow.type === 'entrada'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {flow.type}
                    </span>
                  </TableCell>
                  <TableCell>{flow.description}</TableCell>
                  <TableCell>{flow.category || '-'}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      flow.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {flow.type === 'entrada' ? '+' : '-'} {formatCurrency(Number(flow.amount))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
