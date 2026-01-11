'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Hotel,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  MapPin,
  UserPlus,
} from 'lucide-react';
import { schoolsService, School } from '@/services/schools.service';
import { eventRegistrationsService } from '@/services/event-registrations.service';
import { allocationsService, SchoolAllocation } from '@/services/allocations.service';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function DashboardPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [allocations, setAllocations] = useState<SchoolAllocation[]>([]);
  const [statistics, setStatistics] = useState({
    total_registrations: 0,
    paid: 0,
    pending: 0,
    canceled: 0,
    total_revenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schoolsData, statsData, allocationsData] = await Promise.all([
          schoolsService.getAll(true),
          eventRegistrationsService.getStatistics(),
          allocationsService.getAll(),
        ]);
        setSchools(schoolsData);
        setStatistics(statsData);
        setAllocations(allocationsData);
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totalCapacity = schools.reduce((sum, s) => sum + s.capacity, 0);
  const totalOccupied = schools.reduce((sum, s) => sum + (s.occupied || 0), 0);
  const totalAvailable = schools.reduce((sum, s) => sum + (s.available || 0), 0);
  const occupancyRate = totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0;
  const schoolsWithOverbook = schools.filter((s) => s.has_overbook).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Carregando...</div>
          <div className="text-sm text-muted-foreground">
            Aguarde enquanto carregamos seus dados
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard - UMADÊGO Norte 2026</h1>
        <p className="text-muted-foreground">Visão geral do evento</p>
      </div>

      {/* Inscrições */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Inscrições
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Inscrições</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_registrations}</div>
              <p className="text-xs text-muted-foreground mt-1">Inscritos no evento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.paid}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {statistics.total_registrations > 0
                  ? `${((statistics.paid / statistics.total_registrations) * 100).toFixed(1)}% do total`
                  : '0%'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{statistics.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">Aguardando pagamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Confirmada</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(statistics.total_revenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pagamentos recebidos</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hospedagem */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Hotel className="h-5 w-5" />
          Hospedagem
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Escolas Cadastradas</CardTitle>
              <Hotel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schools.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Locais de hospedagem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capacidade Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCapacity}</div>
              <p className="text-xs text-muted-foreground mt-1">Vagas disponíveis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vagas Ocupadas</CardTitle>
              <MapPin className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalOccupied}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {occupancyRate.toFixed(1)}% ocupação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overbook</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {schoolsWithOverbook}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Escolas em overbook</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Situação das Escolas */}
      <Card>
        <CardHeader>
          <CardTitle>Situação das Escolas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Escola</TableHead>
                <TableHead className="text-center">Capacidade</TableHead>
                <TableHead className="text-center">Ocupado</TableHead>
                <TableHead className="text-center">Disponível</TableHead>
                <TableHead className="text-center">%</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.slice(0, 5).map((school) => {
                const percentage =
                  school.capacity > 0 ? ((school.occupied || 0) / school.capacity) * 100 : 0;
                return (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell className="text-center">{school.capacity}</TableCell>
                    <TableCell className="text-center">{school.occupied || 0}</TableCell>
                    <TableCell className="text-center">{school.available || 0}</TableCell>
                    <TableCell className="text-center">{percentage.toFixed(0)}%</TableCell>
                    <TableCell>
                      {school.has_overbook ? (
                        <Badge variant="destructive">Overbook</Badge>
                      ) : school.available === 0 ? (
                        <Badge variant="secondary">Lotado</Badge>
                      ) : percentage >= 50 ? (
                        <Badge variant="outline">Disponível</Badge>
                      ) : (
                        <Badge>Disponível</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {schools.length > 5 && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Mostrando 5 de {schools.length} escolas
            </p>
          )}
        </CardContent>
      </Card>

      {/* Resumo Geral */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>Resumo Executivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              • <strong>Evento:</strong> UMADÊGO Norte 2026 | 20-22 de Fevereiro de 2026
            </p>
            <p>
              • <strong>Inscrições:</strong> {statistics.total_registrations} pessoas inscritas,{' '}
              {statistics.paid} pagas ({statistics.pending} pendentes)
            </p>
            <p>
              • <strong>Hospedagem:</strong> {totalOccupied} vagas ocupadas de {totalCapacity}{' '}
              disponíveis ({occupancyRate.toFixed(1)}% ocupação)
            </p>
            <p>
              • <strong>Receita:</strong> {formatCurrency(statistics.total_revenue)}{' '}
              confirmados
            </p>
            {schoolsWithOverbook > 0 && (
              <p className="text-destructive font-medium">
                • <AlertTriangle className="inline h-4 w-4 mr-1" />
                <strong>Atenção:</strong> {schoolsWithOverbook} escola(s) em situação de
                overbook
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
