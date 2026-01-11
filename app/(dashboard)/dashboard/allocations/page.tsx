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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, AlertTriangle, MapPin } from "lucide-react";
import {
  allocationsService,
  SchoolAllocation,
  CreateAllocationDto,
} from "@/services/allocations.service";
import { schoolsService, School } from "@/services/schools.service";
import { caravansService, Caravan } from "@/services/caravans.service";
import { Badge } from "@/components/ui/badge";

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState<SchoolAllocation[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [caravans, setCaravans] = useState<Caravan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateAllocationDto>({
    school_id: 0,
    caravan_id: 0,
    allocated_count: 0,
    status: "CONFIRMED",
    overbook_reason: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allocsData, schoolsData, caravansData] = await Promise.all([
        allocationsService.getAll(),
        schoolsService.getAll(true),
        caravansService.getAll(),
      ]);
      setAllocations(allocsData);
      setSchools(schoolsData);
      setCaravans(caravansData);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await allocationsService.create(formData);
      toast.success("Alocação criada com sucesso!");
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao criar alocação");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta alocação?")) return;
    try {
      await allocationsService.delete(id);
      toast.success("Alocação excluída com sucesso!");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao excluir alocação");
    }
  };

  const resetForm = () => {
    setFormData({
      school_id: 0,
      caravan_id: 0,
      allocated_count: 0,
      status: "CONFIRMED",
      overbook_reason: "",
      notes: "",
    });
  };

  const selectedSchool = schools.find((s) => s.id === formData.school_id);
  const needsOverbookReason =
    selectedSchool &&
    (selectedSchool.occupied || 0) + formData.allocated_count > selectedSchool.capacity;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      CONFIRMED: "default",
      PENDING: "secondary",
      CANCELED: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alocações de Hospedagem</h1>
          <p className="text-muted-foreground">Distribuir caravanas nas escolas</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Alocação
        </Button>
      </div>

      {/* Resumo por escola */}
      <div className="grid gap-4 md:grid-cols-3">
        {schools.slice(0, 3).map((school) => (
          <Card key={school.id}>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {school.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ocupado:</span>
                  <span className="font-bold">{school.occupied || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Capacidade:</span>
                  <span>{school.capacity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Disponível:</span>
                  <span className="text-green-600 font-medium">{school.available || 0}</span>
                </div>
                {school.has_overbook && (
                  <div className="flex items-center gap-1 text-destructive text-sm">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Overbook ativo</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela de alocações */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Escola</TableHead>
                <TableHead>Caravana</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Motivo Overbook</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : allocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhuma alocação cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                allocations.map((allocation) => (
                  <TableRow key={allocation.id}>
                    <TableCell className="font-medium">
                      {allocation.school?.name}
                    </TableCell>
                    <TableCell>{allocation.caravan?.city}</TableCell>
                    <TableCell className="text-center">
                      {allocation.allocated_count}
                    </TableCell>
                    <TableCell>{getStatusBadge(allocation.status)}</TableCell>
                    <TableCell>
                      {allocation.overbook_reason ? (
                        <div className="flex items-center gap-1 text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          {allocation.overbook_reason}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(allocation.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Alocação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="school_id">Escola *</Label>
              <Select
                value={formData.school_id.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, school_id: parseInt(value) })
                }
              >
                <SelectTrigger id="school_id">
                  <SelectValue placeholder="Selecione uma escola" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id.toString()}>
                      {school.name} (Disponível: {school.available})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="caravan_id">Caravana *</Label>
              <Select
                value={formData.caravan_id.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, caravan_id: parseInt(value) })
                }
              >
                <SelectTrigger id="caravan_id">
                  <SelectValue placeholder="Selecione uma caravana" />
                </SelectTrigger>
                <SelectContent>
                  {caravans.map((caravan) => (
                    <SelectItem key={caravan.id} value={caravan.id.toString()}>
                      {caravan.city} {caravan.congregation && `- ${caravan.congregation}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="allocated_count">Quantidade de Pessoas *</Label>
              <Input
                id="allocated_count"
                type="number"
                value={formData.allocated_count}
                onChange={(e) =>
                  setFormData({ ...formData, allocated_count: parseInt(e.target.value) })
                }
                required
              />
            </div>

            {needsOverbookReason && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Atenção: Overbook</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Esta alocação excede a capacidade da escola. Informe o motivo:
                </p>
                <Textarea
                  value={formData.overbook_reason}
                  onChange={(e) =>
                    setFormData({ ...formData, overbook_reason: e.target.value })
                  }
                  placeholder="Ex: Autorizado pela coordenação..."
                  required
                  rows={2}
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Criar Alocação</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
