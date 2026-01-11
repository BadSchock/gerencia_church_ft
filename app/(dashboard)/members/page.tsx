'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Filter, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';
import { membersService } from '@/services/members.service';
import { Member, MemberStatus } from '@/types/api';
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
import { DatePicker } from '@/components/ui/date-picker';

// Schema de validação Zod
const memberSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  birth_date: z.string().optional().or(z.literal('')),
  cpf: z.string().optional().or(z.literal('')),
  details: z.string().optional().or(z.literal('')),
});

type MemberFormData = z.infer<typeof memberSchema>;

export default function MembersPage() {
  const router = useRouter();
  const { canAccessMembers, canEditMembers } = usePermissions();

  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filtros
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPhone, setFilterPhone] = useState('');

  // Modais
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [editBirthDate, setEditBirthDate] = useState<Date | undefined>();

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
  });

  // Verificar permissões
  useEffect(() => {
    if (!canAccessMembers()) {
      router.push('/dashboard');
    }
  }, [canAccessMembers, router]);

  // Carregar membros
  useEffect(() => {
    loadMembers();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    applyFilters();
  }, [members, filterName, filterStatus, filterPhone]);

  // Helper para resetar seleção e fechar modais
  function resetSelection() {
    setSelectedMember(null);
    setConfirmDeleteModalOpen(false);
    setEditModalOpen(false);
  }

  async function loadMembers() {
    try {
      setLoading(true);
      const data = await membersService.getAll();
      // Ordenar por nome
      const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
      setMembers(sorted);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      toast.error('Erro ao carregar membros');
    } finally {
      setLoading(false);
    }
  }

  // Aplicar filtros
  function applyFilters() {
    let filtered = [...members];

    // Filtro por nome
    if (filterName) {
      filtered = filtered.filter((member) =>
        member.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    // Filtro por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((member) => member.status === filterStatus);
    }

    // Filtro por telefone
    if (filterPhone) {
      filtered = filtered.filter(
        (member) => member.phone && member.phone.includes(filterPhone)
      );
    }

    setFilteredMembers(filtered);
  }

  // Limpar filtros
  function clearFilters() {
    setFilterName('');
    setFilterStatus('all');
    setFilterPhone('');
  }

  // Abrir modal de criação
  function openCreateModal() {
    reset({
      name: '',
      phone: '',
      email: '',
      birth_date: '',
      cpf: '',
      details: '',
    });
    setBirthDate(undefined);
    setCreateModalOpen(true);
  }

  // Abrir modal de edição
  function openEditModal(member: Member) {
    setSelectedMember(member);
    reset({
      name: member.name,
      phone: member.phone || '',
      email: member.email || '',
      birth_date: member.birth_date || '',
      details: (member as any).details || '',
      cpf: member.cpf || '',
    });
    // Setar a data no DatePicker
    if (member.birth_date) {
      setEditBirthDate(new Date(member.birth_date));
    } else {
      setEditBirthDate(undefined);
    }
    setEditModalOpen(true);
  }

  // Criar membro
  async function onCreateSubmit(data: MemberFormData) {
    try {
      setActionLoading('create');
      await membersService.create({
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        birth_date: data.birth_date || undefined,
        details: data.details || undefined,
        cpf: data.cpf || undefined,
        status: MemberStatus.active,
      });
      toast.success('Membro cadastrado com sucesso');
      setCreateModalOpen(false);
      reset();
      await loadMembers();
    } catch (error) {
      console.error('Erro ao criar membro:', error);
      toast.error('Erro ao cadastrar membro');
    } finally {
      setActionLoading(null);
    }
  }

  // Editar membro
  async function onEditSubmit(data: MemberFormData) {
    if (!selectedMember) return;

    try {
      setActionLoading(`edit-${selectedMember.id}`);
      await membersService.update(selectedMember.id, {
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        birth_date: data.birth_date || undefined,
        details: data.details || undefined,
        cpf: data.cpf || undefined,
      });
      toast.success('Membro atualizado com sucesso');
      setEditModalOpen(false);
      resetSelection();
      await loadMembers();
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      toast.error('Erro ao atualizar membro');
    } finally {
      setActionLoading(null);
    }
  }

  // Excluir membro
  async function handleDelete() {
    if (!selectedMember) return;

    try {
      setActionLoading(`delete-${selectedMember.id}`);
      await membersService.delete(selectedMember.id);
      toast.success('Membro removido com sucesso');
      resetSelection();
      await loadMembers();
    } catch (error) {
      console.error('Erro ao excluir membro:', error);
      toast.error('Erro ao remover membro');
    } finally {
      setActionLoading(null);
    }
  }

  // Formatar data
  function formatDate(date: Date | string) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }

  // Renderizar badge de status
  function renderStatusBadge(status: MemberStatus) {
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
  function renderActions(member: Member) {
    if (!canEditMembers()) {
      return <span className="text-sm text-gray-500">-</span>;
    }

    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => openEditModal(member)}
          disabled={actionLoading !== null}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            setSelectedMember(member);
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
  if (!canAccessMembers()) {
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
          <h1 className="text-3xl font-bold">Membros</h1>
          <p className="text-sm text-gray-600">Gerenciamento de membros da igreja</p>
        </div>
        {canEditMembers() && (
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Membro
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Telefone */}
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                placeholder="Buscar por telefone"
                value={filterPhone}
                onChange={(e) => setFilterPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Botão Limpar Filtros */}
          {(filterName || filterStatus !== 'all' || filterPhone) && (
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
          <CardTitle>Lista de Membros</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-600">Carregando...</div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              {members.length === 0 ? (
                <>
                  <p className="text-gray-600 mb-4">Nenhum membro cadastrado ainda.</p>
                  {canEditMembers() && (
                    <Button onClick={openCreateModal}>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar primeiro membro
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-gray-600">
                  Nenhum membro encontrado para os filtros aplicados.
                </p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.phone || '-'}</TableCell>
                    <TableCell>{member.email || '-'}</TableCell>
                    <TableCell>{renderStatusBadge(member.status)}</TableCell>
                    <TableCell>{formatDate(member.created_at)}</TableCell>
                    <TableCell>{renderActions(member)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal: Criar Membro */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Membro</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo membro da igreja.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Nome completo"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <DatePicker
                  date={birthDate}
                  onDateChange={(date) => {
                    setBirthDate(date);
                    setValue('birth_date', date ? date.toISOString().split('T')[0] : '');
                  }}
                  placeholder="Selecione a data de nascimento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  {...register('cpf')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Detalhes / Observações</Label>
                <textarea
                  id="details"
                  placeholder="Ex: Membro de outra igreja, Visitante frequente, Em processo de transferência..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  {...register('details')}
                />
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

      {/* Modal: Editar Membro */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Membro</DialogTitle>
            <DialogDescription>
              Atualize os dados do membro.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onEditSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  placeholder="Nome completo"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone *</Label>
                <Input
                  id="edit-phone"
                  placeholder="(00) 00000-0000"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="email@exemplo.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-birth_date">Data de Nascimento</Label>
                <DatePicker
                  date={editBirthDate}
                  onDateChange={(date) => {
                    setEditBirthDate(date);
                    setValue('birth_date', date ? date.toISOString().split('T')[0] : '');
                  }}
                  placeholder="Selecione a data de nascimento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-cpf">CPF</Label>
                <Input
                  id="edit-cpf"
                  placeholder="000.000.000-00"
                  {...register('cpf')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-details">Detalhes / Observações</Label>
                <textarea
                  id="edit-details"
                  placeholder="Ex: Membro de outra igreja, Visitante frequente, Em processo de transferência..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  {...register('details')}
                />
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
              Tem certeza que deseja excluir este membro? Essa ação pode ser revertida
              futuramente.
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="py-4 space-y-2">
              <p>
                <strong>Nome:</strong> {selectedMember.name}
              </p>
              <p>
                <strong>Telefone:</strong> {selectedMember.phone || '-'}
              </p>
              <p>
                <strong>Email:</strong> {selectedMember.email || '-'}
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
