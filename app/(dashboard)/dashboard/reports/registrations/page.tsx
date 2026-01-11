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
import { Printer, Download, Users, DollarSign, CheckCircle, Clock } from "lucide-react";
import {
  eventRegistrationsService,
  EventRegistration,
} from "@/services/event-registrations.service";
import { Badge } from "@/components/ui/badge";

export default function RegistrationsReportPage() {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    total_registrations: 0,
    paid: 0,
    pending: 0,
    canceled: 0,
    total_revenue: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [registrationsData, statsData] = await Promise.all([
        eventRegistrationsService.getAll(),
        eventRegistrationsService.getStatistics(),
      ]);
      setRegistrations(registrationsData);
      setStatistics(statsData);
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
    // Gerar CSV
    let csv =
      "Nome,CPF,Telefone,Cidade,Tipo Hospedagem,Tamanho Camiseta,Valor,Status Pagamento,Data Pagamento\n";
    registrations.forEach((reg) => {
      const paymentDate = reg.paid_at
        ? new Date(reg.paid_at).toLocaleDateString("pt-BR")
        : "-";
      csv += `"${reg.registrant?.full_name || ""}","${reg.registrant?.cpf || ""}","${
        reg.registrant?.phone || ""
      }","${reg.registrant?.city || ""}","${reg.lodging_type}","${
        reg.wants_shirt ? "Sim" : "Não"
      }",${reg.total.toFixed(2)},"${reg.payment_status}","${paymentDate}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_inscricoes_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getPaymentBadge = (status: string) => {
    if (status === "PAID") {
      return <Badge>Pago</Badge>;
    } else if (status === "PENDING") {
      return <Badge variant="secondary">Pendente</Badge>;
    } else if (status === "CANCELED") {
      return <Badge variant="destructive">Cancelado</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const getLodgingLabel = (type: string) => {
    const labels: Record<string, string> = {
      ESCOLA: "Escola",
      HOTEL: "Hotel",
      NAO_PRECISA: "Não Precisa",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho - Oculto na impressão */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatório de Inscrições</h1>
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
        <h1 className="text-2xl font-bold">Relatório de Inscrições</h1>
        <p className="text-gray-600">UMADÊGO Norte 2026</p>
        <p className="text-sm text-gray-500">
          Gerado em: {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Inscrições</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total_registrations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{statistics.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(statistics.total_revenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Inscrições */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Inscritos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Hospedagem</TableHead>
                  <TableHead>Camiseta</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Pgto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">
                      {registration.registrant?.full_name}
                    </TableCell>
                    <TableCell>{registration.registrant?.cpf}</TableCell>
                    <TableCell>{registration.registrant?.phone}</TableCell>
                    <TableCell>{registration.registrant?.city}</TableCell>
                    <TableCell>{getLodgingLabel(registration.lodging_type)}</TableCell>
                    <TableCell>{registration.wants_shirt ? "Sim" : "Não"}</TableCell>
                    <TableCell>{formatCurrency(registration.total)}</TableCell>
                    <TableCell>{getPaymentBadge(registration.payment_status)}</TableCell>
                    <TableCell>{formatDate(registration.paid_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resumo por Tipo de Hospedagem */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Tipo de Hospedagem</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
                <TableHead className="text-center">Percentual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {["ESCOLA", "HOTEL", "NAO_PRECISA"].map((type) => {
                const count = registrations.filter((r) => r.lodging_type === type).length;
                const percentage =
                  registrations.length > 0 ? (count / registrations.length) * 100 : 0;
                return (
                  <TableRow key={type}>
                    <TableCell className="font-medium">{getLodgingLabel(type)}</TableCell>
                    <TableCell className="text-center">{count}</TableCell>
                    <TableCell className="text-center">{percentage.toFixed(1)}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rodapé para impressão */}
      <div className="hidden print:block text-center text-sm text-gray-500 mt-8">
        <p>UMADÊGO Norte 2026 - Sistema de Gerenciamento</p>
      </div>
    </div>
  );
}
