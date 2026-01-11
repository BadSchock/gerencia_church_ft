"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Printer, Download, Hotel, MapPin } from "lucide-react";
import { schoolsService, School } from "@/services/schools.service";
import { allocationsService, SchoolAllocation } from "@/services/allocations.service";
import { Badge } from "@/components/ui/badge";

export default function AccommodationReportPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [allocations, setAllocations] = useState<SchoolAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schoolsData, allocationsData] = await Promise.all([
        schoolsService.getAll(true),
        allocationsService.getAll(),
      ]);
      setSchools(schoolsData);
      setAllocations(allocationsData);
    } catch (error) {
      toast.error("Erro ao carregar dados do relatório");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Gerar CSV simples
    let csv = "Escola,Cidade,Capacidade,Ocupado,Disponível,Status\n";
    schools.forEach((school) => {
      const status = school.has_overbook
        ? "Overbook"
        : school.available === 0
        ? "Lotado"
        : "Disponível";
      csv += `"${school.name}","${school.city}",${school.capacity},${school.occupied},${school.available},"${status}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_hospedagem_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const totalCapacity = schools.reduce((sum, s) => sum + s.capacity, 0);
  const totalOccupied = schools.reduce((sum, s) => sum + (s.occupied || 0), 0);
  const totalAvailable = schools.reduce((sum, s) => sum + (s.available || 0), 0);
  const occupancyRate = totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Cabeçalho - Oculto na impressão */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatório de Hospedagem</h1>
          <p className="text-muted-foreground">UMADÊGO Norte 2026</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Cabeçalho para impressão */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold">Relatório de Hospedagem</h1>
        <p className="text-gray-600">UMADÊGO Norte 2026</p>
        <p className="text-sm text-gray-500">
          Gerado em: {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>

      {/* Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Escolas</CardTitle>
            <Hotel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schools.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacidade Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vagas Ocupadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalOccupied}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {occupancyRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Escolas */}
      <Card>
        <CardHeader>
          <CardTitle>Ocupação por Escola</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Escola</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead className="text-center">Capacidade</TableHead>
                  <TableHead className="text-center">Ocupado</TableHead>
                  <TableHead className="text-center">Disponível</TableHead>
                  <TableHead className="text-center">%</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school) => {
                  const percentage =
                    school.capacity > 0
                      ? ((school.occupied || 0) / school.capacity) * 100
                      : 0;
                  return (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">{school.name}</TableCell>
                      <TableCell>{school.city}</TableCell>
                      <TableCell className="text-center">{school.capacity}</TableCell>
                      <TableCell className="text-center">{school.occupied || 0}</TableCell>
                      <TableCell className="text-center">{school.available || 0}</TableCell>
                      <TableCell className="text-center">
                        {percentage.toFixed(0)}%
                      </TableCell>
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
          )}
        </CardContent>
      </Card>

      {/* Tabela de Alocações por Escola */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Caravanas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <div className="space-y-4">
              {schools.map((school) => {
                const schoolAllocations = allocations.filter(
                  (a) => a.school_id === school.id && a.status === "CONFIRMED"
                );
                if (schoolAllocations.length === 0) return null;

                return (
                  <div key={school.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold">{school.name}</h3>
                      <Badge variant="secondary">
                        {schoolAllocations.length} caravanas
                      </Badge>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Caravana</TableHead>
                          <TableHead className="text-center">Pessoas</TableHead>
                          <TableHead>Observações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schoolAllocations.map((allocation) => (
                          <TableRow key={allocation.id}>
                            <TableCell>{allocation.caravan?.city}</TableCell>
                            <TableCell className="text-center">
                              {allocation.allocated_count}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {allocation.notes || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rodapé para impressão */}
      <div className="hidden print:block text-center text-sm text-gray-500 mt-8">
        <p>UMADÊGO Norte 2026 - Sistema de Gerenciamento</p>
      </div>
    </div>
  );
}
