"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, DollarSign, Search, CheckCircle, Clock, XCircle } from "lucide-react";
import {
  eventRegistrationsService,
  EventRegistration,
  MarkAsPaidDto,
  PaymentMethod,
} from "@/services/event-registrations.service";
import { useAuth } from "@/hooks/use-auth";

export default function EventRegistrationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Modal de pagamento
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<EventRegistration | null>(null);
  const [paymentData, setPaymentData] = useState<MarkAsPaidDto>({
    payment_method: "PIX",
    paid_by_user_id: user?.id || 1,
  });

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const data = await eventRegistrationsService.getAll();
      setRegistrations(data);
    } catch (error) {
      toast.error("Erro ao carregar inscrições");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedRegistration) return;

    try {
      await eventRegistrationsService.markAsPaid(selectedRegistration.id, paymentData);
      toast.success("Pagamento registrado com sucesso!");
      setPaymentModal(false);
      setSelectedRegistration(null);
      loadRegistrations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao registrar pagamento");
    }
  };

  const openPaymentModal = (registration: EventRegistration) => {
    setSelectedRegistration(registration);
    setPaymentData({
      payment_method: "PIX",
      paid_by_user_id: user?.id || 1,
      paid_at: new Date().toISOString(),
    });
    setPaymentModal(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      PAID: { variant: "default", icon: CheckCircle, label: "Pago" },
      PENDING: { variant: "secondary", icon: Clock, label: "Pendente" },
      CANCELED: { variant: "destructive", icon: XCircle, label: "Cancelado" },
    };
    const config = variants[status] || variants.PENDING;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.registrant?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.registrant?.cpf.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || reg.payment_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: registrations.length,
    paid: registrations.filter((r) => r.payment_status === "PAID").length,
    pending: registrations.filter((r) => r.payment_status === "PENDING").length,
    totalRevenue: registrations
      .filter((r) => r.payment_status === "PAID")
      .reduce((sum, r) => sum + Number(r.total), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inscrições</h1>
          <p className="text-muted-foreground">Gerenciar inscrições do evento</p>
        </div>
        <Button onClick={() => router.push("/dashboard/event-registrations/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Inscrição
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {stats.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PAID">Pagos</SelectItem>
                <SelectItem value="PENDING">Pendentes</SelectItem>
                <SelectItem value="CANCELED">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Hospedagem</TableHead>
                <TableHead>Camisa</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredRegistrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Nenhuma inscrição encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredRegistrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">
                      {registration.registrant?.full_name}
                    </TableCell>
                    <TableCell>{registration.registrant?.cpf}</TableCell>
                    <TableCell>{registration.registrant?.city}</TableCell>
                    <TableCell>
                      {registration.lodging_type === "SCHOOL_BED" ? "Escola" : "Próprio"}
                    </TableCell>
                    <TableCell>
                      {registration.wants_shirt ? (
                        <Badge variant="outline">Sim</Badge>
                      ) : (
                        <Badge variant="secondary">Não</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      R$ {Number(registration.total).toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(registration.payment_status)}</TableCell>
                    <TableCell>
                      {registration.payment_status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPaymentModal(registration)}
                        >
                          <DollarSign className="mr-2 h-3 w-3" />
                          Marcar Pago
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Pagamento */}
      <Dialog open={paymentModal} onOpenChange={setPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Registrar pagamento de{" "}
              <strong>{selectedRegistration?.registrant?.full_name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Valor Total</Label>
              <div className="text-2xl font-bold text-green-600">
                R$ {Number(selectedRegistration?.total || 0).toFixed(2)}
              </div>
            </div>
            <div>
              <Label htmlFor="payment_method">Método de Pagamento</Label>
              <Select
                value={paymentData.payment_method}
                onValueChange={(value: PaymentMethod) =>
                  setPaymentData({ ...paymentData, payment_method: value })
                }
              >
                <SelectTrigger id="payment_method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                  <SelectItem value="CARTAO_CREDITO">Cartão de Crédito</SelectItem>
                  <SelectItem value="CARTAO_DEBITO">Cartão de Débito</SelectItem>
                  <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paid_at">Data do Pagamento</Label>
              <Input
                id="paid_at"
                type="datetime-local"
                value={paymentData.paid_at?.slice(0, 16) || ""}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    paid_at: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setPaymentModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleMarkAsPaid}>
                <DollarSign className="mr-2 h-4 w-4" />
                Confirmar Pagamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
