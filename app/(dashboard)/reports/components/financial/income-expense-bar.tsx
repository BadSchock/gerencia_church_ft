'use client';

import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface IncomeExpenseBarProps {
  totalEntradas: number;
  totalSaidas: number;
  loading?: boolean;
}

export default function IncomeExpenseBar({ totalEntradas, totalSaidas, loading = false }: IncomeExpenseBarProps) {
  const data = [
    {
      name: 'Comparativo',
      Entradas: totalEntradas,
      Saídas: totalSaidas,
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-80 w-full" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">📊 Entradas x Saídas</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
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
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '8px 12px',
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar 
            dataKey="Entradas" 
            fill="#10b981" 
            radius={[8, 8, 0, 0]}
            maxBarSize={150}
          />
          <Bar 
            dataKey="Saídas" 
            fill="#ef4444" 
            radius={[8, 8, 0, 0]}
            maxBarSize={150}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
