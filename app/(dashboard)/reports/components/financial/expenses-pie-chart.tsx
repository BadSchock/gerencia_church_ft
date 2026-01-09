'use client';

import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface ExpensesPieChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  loading?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function ExpensesPieChart({ data, loading = false }: ExpensesPieChartProps) {
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
        <Skeleton className="h-80 w-full rounded-full" />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">🥧 Distribuição de Despesas</h3>
        <div className="h-80 flex items-center justify-center text-gray-500">
          Sem despesas no período selecionado
        </div>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-xs text-gray-500">
            {((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}% do total
          </p>
        </div>
      );
    }
    return null;
  };

  // Calcular total para percentuais
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">🥧 Distribuição de Despesas</h3>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={dataWithTotal}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {dataWithTotal.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
