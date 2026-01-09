'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Filter, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';
import { departmentsService } from '@/services/departments.service';
import { Department } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Schema de validação Zod
const departmentSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

// Interface estendida com status para UI
interface DepartmentUI extends Department {
  status: 'active' | 'inactive';
}

export default function DepartmentsPage() {
  const router = useRouter();
  const { canAccessDepartments, canEditDepartments } = usePermissions();

  const [departments, setDepartments] = useState<DepartmentUI[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<DepartmentUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filtros
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modais
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentUI | null>(null);

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
  });

  // Verificar permissões
  useEffect(() => {
    if (!canAccessDepartments()) {
      router.push('/dashboard');
    }
  }, [canAccessDepartments, router]);

  // Carregar departamentos
  useEffect(() => {
    loadDepartments();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    applyFilters();
  }, [departments, filterName, filterStatus]);

  // Helper para resetar seleção e fechar modais
  function resetSelection() {
    setSelectedDepartment(null);
    setConfirmDeleteModalOpen(false);
    setEditModalOpen(false);
  }

  async function loadDepartments() {
    try {
      setLoading(true);
      const data = await departmentsService.getAll();
      // Garantir que todos têm status (padrão: active)
      const withStatus = data.map((d) => ({
        ...d,
        status: ((d as any).status || 'active') as 'active' | 'inactive',
      }));
      // Ordenar por nome
      const sorted = withStatus.sort((a, b) => a.name.localeCompare(b.name));
      setDepartments(sorted);
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
      toast.error('Erro ao carregar departamentos');
    } finally {
      setLoading(false);
    }
  }

  // Aplicar filtros
  function applyFilters() {
    let filtered = [...departments];

    // Filtro por nome
    if (filterName) {
      filtered = filtered.filter((dept) =>
        dept.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    // Filtro por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((dept) => dept.status === filterStatus);
    }

    setFilteredDepartments(filtered);
  }

  // Limpar filtros
  function clearFilters() {
    setFilterName('');
    setFilterStatus('all');
  }

  // Abrir modal de criação
  function openCreateModal() {
    reset({
      name: '',
      description: '',
      status: 'active',
    });
    setCreateModalOpen(true);
  }

  // Abrir modal de edição
  function openEditModal(department: DepartmentUI) {
    setSelectedDepartment(department);
    reset({
      name: department.name,
      description: department.description || '',
      status: department.status,
    });
    setEditModalOpen(true);
  }

  // Criar departamento
  async function onCreateSubmit(data: DepartmentFormData) {
    try {
      setActionLoading('create');
      await departmentsService.create({
        name: data.name,
        description: data.description || undefined,
      });
      toast.success('Departamento criado com sucesso');
      setCreateModalOpen(false);
      reset();
      await loadDepartments();
    } catch (error) {
      console.error('Erro ao criar departamento:', error);
      toast.error('Erro ao criar departamento');
    } finally {
      setActionLoading(null);
    }
  }

  // Editar departamento
  async function onEditSubmit(data: DepartmentFormData) {
    if (!selectedDepartment) return;

    try {
      setActionLoading(`edit-${selectedDepartment.id}`);
      await departmentsService.update(selectedDepartment.id, {
        name: data.name,
        description: data.description || undefined,
      });
      toast.success('Departamento atualizado com sucesso');
      setEditModalOpen(false);
      resetSelection();
      await loadDepartments();
    } catch (error) {
      console.error('Erro ao atualizar departamento:', error);
      toast.error('Erro ao atualizar departamento');
    } finally {
      setActionLoading(null);
    }
  }

  // Excluir departamento
  async function handleDelete() {
    if (!selectedDepartment) return;

    try {
      setActionLoading(`delete-${selectedDepartment.id}`);
      await departmentsService.delete(selectedDepartment.id);
      toast.success('Departamento removido com sucesso');
      resetSelection();
      await loadDepartments();
    } catch (error) {
      console.error('Erro ao excluir departamento:', error);
      toast.error('Erro ao remover departamento');
    } finally {
      setActionLoading(null);
    }
  }

  // Formatar data
  function formatDate(date: Date | string) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }

  // Renderizar badge de status
  function renderStatusBadge(status: 'active' | 'inactive') {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Ativo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Inativo
      </span>
    );
  }

  // Renderizar ações
  function renderActions(department: DepartmentUI) {
    if (!canEditDepartments()) {
      return <span className="text-sm text-gray-500">-</span>;
    }

    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => openEditModal(department)}
          disabled={actionLoading !== null}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            setSelectedDepartment(department);
            setConfirmDeleteModalOpen(true);
          }}
          disabled={actionLoading !== null}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Verificar permissão
  if (!canAccessDepartments()) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Você não tem permissão para acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Departamentos</h1>
          <p className="text-sm text-gray-600">Organização dos departamentos da igreja</p>
        </div>
        {canEditDepartments() && (
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Departamento
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="Buscar por nome"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botão Limpar Filtros */}
          {(filterName || filterStatus !== 'all') && (
            <div className="mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Departamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-600">Carregando...</div>
          ) : filteredDepartments.length === 0 ? (
            <div className="text-center py-8">
              {departments.length === 0 ? (
                <>
                  <p className="text-gray-600 mb-4">Nenhum departamento cadastrado ainda.</p>
                  {canEditDepartments() && (
                    <Button onClick={openCreateModal}>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar primeiro departamento
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-gray-600">
                  Nenhum departamento encontrado para os filtros aplicados.
                </p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {department.description || '-'}
                    </TableCell>
                    <TableCell>{renderStatusBadge(department.status)}</TableCell>
                    <TableCell>{formatDate(department.created_at)}</TableCell>
                    <TableCell>{renderActions(department)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal: Criar Departamento */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Departamento</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo departamento.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Louvor e Adoração"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  placeholder="Descrição do departamento (opcional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateModalOpen(false);
                  reset();
                }}
                disabled={actionLoading === 'create'}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={actionLoading === 'create'}>
                {actionLoading === 'create' ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar Departamento */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Departamento</DialogTitle>
            <DialogDescription>
              Atualize os dados do departamento.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onEditSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  placeholder="Ex: Louvor e Adoração"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <textarea
                  id="edit-description"
                  placeholder="Descrição do departamento (opcional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditModalOpen(false);
                  resetSelection();
                }}
                disabled={actionLoading !== null}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={actionLoading !== null}>
                {actionLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmar Exclusão */}
      <Dialog open={confirmDeleteModalOpen} onOpenChange={setConfirmDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este departamento? Os dados poderão ser
              restaurados futuramente.
            </DialogDescription>
          </DialogHeader>
          {selectedDepartment && (
            <div className="py-4 space-y-2">
              <p>
                <strong>Nome:</strong> {selectedDepartment.name}
              </p>
              <p>
                <strong>Descrição:</strong> {selectedDepartment.description || '-'}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetSelection}
              disabled={actionLoading !== null}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading !== null}
            >
              {actionLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
