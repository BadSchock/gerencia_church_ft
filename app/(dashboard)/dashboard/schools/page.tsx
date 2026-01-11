"use client";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Hotel, AlertTriangle } from "lucide-react";
import { schoolsService, School, CreateSchoolDto } from "@/services/schools.service";
import { Badge } from "@/components/ui/badge";

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState<CreateSchoolDto>({
    name: "",
    address: "",
    city: "",
    capacity: 0,
    overbook_limit: 0,
    contact_name: "",
    contact_phone: "",
    notes: "",
  });

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const data = await schoolsService.getAll(true);
      setSchools(data);
    } catch (error) {
      toast.error("Erro ao carregar escolas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSchool) {
        await schoolsService.update(editingSchool.id, formData);
        toast.success("Escola atualizada com sucesso!");
      } else {
        await schoolsService.create(formData);
        toast.success("Escola criada com sucesso!");
      }
      setDialogOpen(false);
      resetForm();
      loadSchools();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao salvar escola");
    }
  };

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      address: school.address,
      city: school.city,
      capacity: school.capacity,
      overbook_limit: school.overbook_limit,
      contact_name: school.contact_name,
      contact_phone: school.contact_phone,
      notes: school.notes,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta escola?")) return;
    try {
      await schoolsService.delete(id);
      toast.success("Escola excluída com sucesso!");
      loadSchools();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao excluir escola");
    }
  };

  const resetForm = () => {
    setEditingSchool(null);
    setFormData({
      name: "",
      address: "",
      city: "",
      capacity: 0,
      overbook_limit: 0,
      contact_name: "",
      contact_phone: "",
      notes: "",
    });
  };

  const getOccupancyBadge = (school: School) => {
    if (!school.occupied) return null;
    const percentage = (school.occupied / school.capacity) * 100;
    
    if (school.has_overbook) {
      return <Badge variant="destructive">Overbook!</Badge>;
    } else if (percentage >= 90) {
      return <Badge variant="secondary">Quase Cheio</Badge>;
    } else if (percentage >= 50) {
      return <Badge variant="outline">Disponível</Badge>;
    }
    return <Badge>Disponível</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escolas</h1>
          <p className="text-muted-foreground">Gerenciar locais de hospedagem</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Escola
        </Button>
      </div>

      {/* Cards de resumo */}
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
            <div className="text-2xl font-bold">
              {schools.reduce((sum, s) => sum + s.capacity, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {schools.reduce((sum, s) => sum + (s.occupied || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponível</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {schools.reduce((sum, s) => sum + (s.available || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead className="text-center">Capacidade</TableHead>
                <TableHead className="text-center">Ocupado</TableHead>
                <TableHead className="text-center">Disponível</TableHead>
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
              ) : schools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Nenhuma escola cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>{school.address}</TableCell>
                    <TableCell>{school.city}</TableCell>
                    <TableCell className="text-center">{school.capacity}</TableCell>
                    <TableCell className="text-center">
                      {school.occupied || 0}
                      {school.has_overbook && (
                        <AlertTriangle className="inline ml-1 h-3 w-3 text-destructive" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">{school.available || 0}</TableCell>
                    <TableCell>{getOccupancyBadge(school)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(school)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(school.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSchool ? "Editar Escola" : "Nova Escola"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Nome da Escola *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Endereço *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
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
                <Label htmlFor="capacity">Capacidade *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="overbook_limit">Limite Overbook *</Label>
                <Input
                  id="overbook_limit"
                  type="number"
                  value={formData.overbook_limit}
                  onChange={(e) =>
                    setFormData({ ...formData, overbook_limit: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Telefone Contato</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_phone: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="contact_name">Nome do Contato</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_name: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingSchool ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
