'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SummaryCardsProps {
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  contasPendentes: number;
  loading?: boolean;
}

export default function SummaryCards({
  totalEntradas,
  totalSaidas,
  saldo,
  contasPendentes,
  loading = false,
}: SummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-8 w-8 mb-4 rounded-full" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total de Entradas */}
      <Card className="p-6 border-l-4 border-l-green-500">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total de Entradas</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEntradas)}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </Card>

      {/* Total de Saídas */}
      <Card className="p-6 border-l-4 border-l-red-500">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total de Saídas</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSaidas)}</p>
          </div>
          <div className="p-3 bg-red-100 rounded-full">
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </Card>

      {/* Saldo */}
      <Card className="p-6 border-l-4 border-l-blue-500">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Saldo</p>
            <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(saldo)}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </Card>

      {/* Contas Pendentes */}
      <Card className="p-6 border-l-4 border-l-yellow-500">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Contas Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(contasPendentes)}</p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-full">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </Card>
    </div>
  );
}
