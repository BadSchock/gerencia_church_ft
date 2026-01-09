'use client';

import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface CashFlowChartProps {
  data: Array<{
    date: string;
    entradas: number;
    saidas: number;
    saldo: number;
  }>;
  loading?: boolean;
}

export default function CashFlowChart({ data, loading = false }: CashFlowChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-80 w-full" />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">📈 Fluxo de Caixa</h3>
        <div className="h-80 flex items-center justify-center text-gray-500">
          Sem dados para exibir no período selecionado
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">📈 Fluxo de Caixa</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
            labelFormatter={(label) => `Data: ${formatDate(label)}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '8px 12px',
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              const labels: { [key: string]: string } = {
                entradas: 'Entradas',
                saidas: 'Saídas',
                saldo: 'Saldo Acumulado',
              };
              return labels[value] || value;
            }}
          />
          <Line 
            type="monotone" 
            dataKey="entradas" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="saidas" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="saldo" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
