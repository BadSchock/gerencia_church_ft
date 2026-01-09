'use client';

import { Card } from '@/components/ui/card';
import { Users, UserCheck, UserX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PeopleSummaryProps {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  loading?: boolean;
}

export default function PeopleSummary({ 
  totalMembers, 
  activeMembers, 
  inactiveMembers,
  loading = false 
}: PeopleSummaryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-8 w-8 mb-4 rounded-full" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-20" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-gray-600">
          Relatórios detalhados de membros em desenvolvimento. Por enquanto, veja o resumo abaixo:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total de Membros */}
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total de Membros</p>
              <p className="text-3xl font-bold text-blue-600">{totalMembers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Membros Ativos */}
        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Membros Ativos</p>
              <p className="text-3xl font-bold text-green-600">{activeMembers}</p>
              {totalMembers > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {((activeMembers / totalMembers) * 100).toFixed(1)}% do total
                </p>
              )}
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Membros Inativos */}
        <Card className="p-6 border-l-4 border-l-gray-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Membros Inativos</p>
              <p className="text-3xl font-bold text-gray-600">{inactiveMembers}</p>
              {totalMembers > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {((inactiveMembers / totalMembers) * 100).toFixed(1)}% do total
                </p>
              )}
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <UserX className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
