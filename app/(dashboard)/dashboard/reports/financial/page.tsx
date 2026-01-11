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
import { Printer, Download, DollarSign, TrendingUp, TrendingDown, Wallet, Clock } from "lucide-react";
import { eventRegistrationsService } from "@/services/event-registrations.service";
import { Badge } from "@/components/ui/badge";

interface PaymentMethodSummary {
  method: string;
  count: number;
  total: number;
}

export default function FinancialReportPage() {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    total_registrations: 0,
    paid: 0,
    pending: 0,
    canceled: 0,
    total_revenue: 0,
  });
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSummary[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, registrationsData] = await Promise.all([
        eventRegistrationsService.getStatistics(),
        eventRegistrationsService.getAll(),
      ]);
      setStatistics(statsData);
      setRegistrations(registrationsData);

      // Calcular resumo por forma de pagamento
      const paidRegistrations = registrationsData.filter((r) => r.payment_status === "PAID");
      const methodsMap = new Map<string, { count: number; total: number }>();

      paidRegistrations.forEach((reg) => {
        const method = reg.payment_method || "NÃO INFORMADO";
        const current = methodsMap.get(method) || { count: 0, total: 0 };
        methodsMap.set(method, {
          count: current.count + 1,
          total: current.total + reg.total,
        });
      });

      const methodsSummary: PaymentMethodSummary[] = Array.from(methodsMap.entries()).map(
        ([method, data]) => ({
          method,
          count: data.count,
          total: data.total,
        })
      );

      setPaymentMethods(methodsSummary);
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
    // Gerar CSV financeiro
    let csv = "Descrição,Valor\n";
    csv += `"Total de Inscrições",${statistics.total_registrations}\n`;
    csv += `"Inscrições Pagas",${statistics.paid}\n`;
    csv += `"Inscrições Pendentes",${statistics.pending}\n`;
    csv += `"Receita Total",${formatCurrency(statistics.total_revenue)}\n`;
    csv += "\n";
    csv += "Forma de Pagamento,Quantidade,Valor Total\n";
    paymentMethods.forEach((pm) => {
      csv += `"${getPaymentMethodLabel(pm.method)}",${pm.count},${formatCurrency(pm.total)}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_financeiro_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      PIX: "PIX",
      DINHEIRO: "Dinheiro",
      CARTAO_CREDITO: "Cartão de Crédito",
      CARTAO_DEBITO: "Cartão de Débito",
      TRANSFERENCIA: "Transferência",
      "NÃO INFORMADO": "Não Informado",
    };
    return labels[method] || method;
  };

  const pendingAmount = statistics.pending * 170; // Estimativa média

  return (
    <div className="space-y-6">
      {/* Cabeçalho - Oculto na impressão */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatório Financeiro</h1>
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
        <h1 className="text-2xl font-bold">Relatório Financeiro</h1>
        <p className="text-gray-600">UMADÊGO Norte 2026</p>
        <p className="text-sm text-gray-500">
          Gerado em: {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Confirmada</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(statistics.total_revenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics.paid} pagamentos recebidos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Pendente</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics.pending} pagamentos pendentes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total (Estimada)</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(statistics.total_revenue + pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Confirmada + Pendente
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.total_registrations > 0
                ? ((statistics.paid / statistics.total_registrations) * 100).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Inscrições pagas vs total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo por Forma de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle>Receita por Forma de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Forma de Pagamento</TableHead>
                  <TableHead className="text-center">Quantidade</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-center">Percentual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethods
                  .sort((a, b) => b.total - a.total)
                  .map((pm) => {
                    const percentage =
                      statistics.total_revenue > 0
                        ? (pm.total / statistics.total_revenue) * 100
                        : 0;
                    return (
                      <TableRow key={pm.method}>
                        <TableCell className="font-medium">
                          {getPaymentMethodLabel(pm.method)}
                        </TableCell>
                        <TableCell className="text-center">{pm.count}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(pm.total)}
                        </TableCell>
                        <TableCell className="text-center">
                          {percentage.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-center">{statistics.paid}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(statistics.total_revenue)}
                  </TableCell>
                  <TableCell className="text-center">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Projeção de Receita */}
      <Card>
        <CardHeader>
          <CardTitle>Projeção e Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Ticket Médio (Pagos)</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    statistics.paid > 0 ? statistics.total_revenue / statistics.paid : 0
                  )}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Meta de Receita (Todos Pagarem)</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(statistics.total_revenue + pendingAmount)}
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold mb-2">Resumo Executivo</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  • <strong>{statistics.total_registrations}</strong> inscrições realizadas no total
                </li>
                <li>
                  • <strong>{statistics.paid}</strong> já efetuaram o pagamento (
                  {statistics.total_registrations > 0
                    ? ((statistics.paid / statistics.total_registrations) * 100).toFixed(1)
                    : 0}
                  %)
                </li>
                <li>
                  • Receita confirmada: <strong>{formatCurrency(statistics.total_revenue)}</strong>
                </li>
                <li>
                  • Receita potencial adicional:{" "}
                  <strong>{formatCurrency(pendingAmount)}</strong>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rodapé para impressão */}
      <div className="hidden print:block text-center text-sm text-gray-500 mt-8">
        <p>UMADÊGO Norte 2026 - Sistema de Gerenciamento</p>
      </div>
    </div>
  );
}
