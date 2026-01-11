"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Bus } from "lucide-react";
import { caravansService, Caravan, CreateCaravanDto } from "@/services/caravans.service";

export default function CaravansPage() {
  const [caravans, setCaravans] = useState<Caravan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCaravan, setEditingCaravan] = useState<Caravan | null>(null);
  const [formData, setFormData] = useState<CreateCaravanDto>({
    city: "",
    congregation: "",
    leader_name: "",
    leader_phone: "",
    notes: "",
  });

  useEffect(() => {
    loadCaravans();
  }, []);

  const loadCaravans = async () => {
    try {
      setLoading(true);
      const data = await caravansService.getAll();
      setCaravans(data);
    } catch (error) {
      toast.error("Erro ao carregar caravanas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCaravan) {
        await caravansService.update(editingCaravan.id, formData);
        toast.success("Caravana atualizada com sucesso!");
      } else {
        await caravansService.create(formData);
        toast.success("Caravana criada com sucesso!");
      }
      setDialogOpen(false);
      resetForm();
      loadCaravans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao salvar caravana");
    }
  };

  const handleEdit = (caravan: Caravan) => {
    setEditingCaravan(caravan);
    setFormData({
      city: caravan.city,
      congregation: caravan.congregation,
      leader_name: caravan.leader_name,
      leader_phone: caravan.leader_phone,
      notes: caravan.notes,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta caravana?")) return;
    try {
      await caravansService.delete(id);
      toast.success("Caravana excluída com sucesso!");
      loadCaravans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao excluir caravana");
    }
  };

  const resetForm = () => {
    setEditingCaravan(null);
    setFormData({
      city: "",
      congregation: "",
      leader_name: "",
      leader_phone: "",
      notes: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Caravanas</h1>
          <p className="text-muted-foreground">Gerenciar cidades e congregações</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Caravana
        </Button>
      </div>

      {/* Resumo */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Bus className="h-5 w-5 text-muted-foreground" />
            <div className="text-2xl font-bold">{caravans.length}</div>
            <div className="text-muted-foreground">caravanas cadastradas</div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cidade</TableHead>
                <TableHead>Congregação</TableHead>
                <TableHead>Líder</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : caravans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhuma caravana cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                caravans.map((caravan) => (
                  <TableRow key={caravan.id}>
                    <TableCell className="font-medium">{caravan.city}</TableCell>
                    <TableCell>{caravan.congregation || "-"}</TableCell>
                    <TableCell>{caravan.leader_name || "-"}</TableCell>
                    <TableCell>{caravan.leader_phone || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(caravan)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(caravan.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
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
            <DialogTitle>
              {editingCaravan ? "Editar Caravana" : "Nova Caravana"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="congregation">Congregação</Label>
              <Input
                id="congregation"
                value={formData.congregation}
                onChange={(e) => setFormData({ ...formData, congregation: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="leader_name">Nome do Líder</Label>
              <Input
                id="leader_name"
                value={formData.leader_name}
                onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="leader_phone">Telefone do Líder</Label>
              <Input
                id="leader_phone"
                value={formData.leader_phone}
                onChange={(e) => setFormData({ ...formData, leader_phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingCaravan ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
