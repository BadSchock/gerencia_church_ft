'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';

interface FiltersProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApply: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export default function Filters({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onClear,
  hasActiveFilters,
}: FiltersProps) {
  const setThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    onStartDateChange(firstDay.toISOString().split('T')[0]);
    onEndDateChange(lastDay.toISOString().split('T')[0]);
  };

  const setLastMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    
    onStartDateChange(firstDay.toISOString().split('T')[0]);
    onEndDateChange(lastDay.toISOString().split('T')[0]);
  };

  const setThisYear = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), 0, 1);
    const lastDay = new Date(now.getFullYear(), 11, 31);
    
    onStartDateChange(firstDay.toISOString().split('T')[0]);
    onEndDateChange(lastDay.toISOString().split('T')[0]);
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex flex-col gap-4">
        {/* Filtros de Data */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="startDate" className="mb-2 block">
              <CalendarIcon className="inline w-4 h-4 mr-1" />
              Data Inicial
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>

          <div className="flex-1">
            <Label htmlFor="endDate" className="mb-2 block">
              <CalendarIcon className="inline w-4 h-4 mr-1" />
              Data Final
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
        </div>

        {/* Presets Rápidos */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 self-center mr-2">Períodos:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={setThisMonth}
          >
            Este Mês
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={setLastMonth}
          >
            Mês Passado
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={setThisYear}
          >
            Este Ano
          </Button>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button onClick={onApply} className="bg-[#001529] hover:bg-[#002a4a]">
            Aplicar Filtros
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={onClear}>
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
