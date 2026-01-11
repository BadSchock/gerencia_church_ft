'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePermissions } from '@/hooks/use-permissions';
import { usersService } from '@/services/users.service';
import { User, UserRole } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Lock, Unlock } from 'lucide-react';

// Schema de validação para criar usuário
const createUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
  role: z.string().min(1, 'Role é obrigatório'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

// Schema de validação para editar usuário
const editUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  role: z.string().min(1, 'Role é obrigatório'),
}).refine((data) => {
  if (data.password && data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.password && data.password.length < 6) {
    return false;
  }
  return true;
}, {
  message: 'Senha deve ter no mínimo 6 caracteres',
  path: ['password'],
});

type CreateUserForm = z.infer<typeof createUserSchema>;
type EditUserForm = z.infer<typeof editUserSchema>;

export default function UsersPage() {
  const router = useRouter();
  const { canAccessUsers, getUserRole } = usePermissions();

  // Estados
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Filtros
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Usuário logado
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Forms
  const createForm = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    },
  });

  const editForm = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    },
  });

  // Verificar permissões
  useEffect(() => {
    setIsMounted(true);
    if (!canAccessUsers()) {
      toast.error('Você não tem permissão para acessar esta página');
      router.push('/dashboard');
    } else {
      // Pegar ID do usuário logado
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUserId(payload.sub);
        } catch (error) {
          console.error('Erro ao decodificar token:', error);
        }
      }
    }
  }, [canAccessUsers, router]);

  // Carregar usuários
  useEffect(() => {
    loadUsers();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    applyFilters();
  }, [users, filterName, filterEmail, filterRole, filterStatus]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getAll();
      // Ordenar por nome
      const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
      setUsers(sorted);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Filtro por nome
    if (filterName) {
      filtered = filtered.filter((user) =>
        user.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    // Filtro por email
    if (filterEmail) {
      filtered = filtered.filter((user) =>
        user.email.toLowerCase().includes(filterEmail.toLowerCase())
      );
    }

    // Filtro por role
    if (filterRole && filterRole !== 'all') {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    // Filtro por status
    if (filterStatus && filterStatus !== 'all') {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter((user) => user.active === isActive);
    }

    setFilteredUsers(filtered);
  };

  const clearFilters = () => {
    setFilterName('');
    setFilterEmail('');
    setFilterRole('all');
    setFilterStatus('all');
  };

  const hasActiveFilters = () => {
    return filterName || filterEmail || (filterRole && filterRole !== 'all') || (filterStatus && filterStatus !== 'all');
  };

  // Criar usuário
  const openCreateModal = () => {
    createForm.reset({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    });
    setIsCreateModalOpen(true);
  };

  const handleCreate = async (data: CreateUserForm) => {
    try {
      await usersService.create({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      toast.success('Usuário criado com sucesso');
      setIsCreateModalOpen(false);
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      const message = error.response?.data?.message || 'Erro ao criar usuário';
      toast.error(message);
    }
  };

  // Editar usuário
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
    });
    setIsEditModalOpen(true);
  };

  const handleEdit = async (data: EditUserForm) => {
    if (!selectedUser) return;

    try {
      const updateData: any = {
        name: data.name,
        email: data.email,
        role: data.role,
      };

      // Só atualizar senha se foi preenchida
      if (data.password && data.password.length > 0) {
        updateData.password = data.password;
      }

      await usersService.update(selectedUser.id, updateData);
      toast.success('Usuário atualizado com sucesso');
      setIsEditModalOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      const message = error.response?.data?.message || 'Erro ao atualizar usuário';
      toast.error(message);
    }
  };

  // Excluir usuário
  const openDeleteModal = (user: User) => {
    if (user.id === currentUserId) {
      toast.error('Você não pode excluir seu próprio usuário');
      return;
    }
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await usersService.delete(selectedUser.id);
      toast.success('Usuário excluído com sucesso');
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      const message = error.response?.data?.message || 'Erro ao excluir usuário';
      toast.error(message);
    }
  };

  // Ativar/Desativar usuário
  const openToggleStatusModal = (user: User) => {
    if (user.id === currentUserId) {
      toast.error('Você não pode desativar seu próprio usuário');
      return;
    }
    setSelectedUser(user);
    setIsToggleStatusModalOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;

    try {
      await usersService.toggleStatus(selectedUser.id, !selectedUser.active);
      toast.success(`Usuário ${!selectedUser.active ? 'ativado' : 'desativado'} com sucesso`);
      setIsToggleStatusModalOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao alterar status do usuário:', error);
      const message = error.response?.data?.message || 'Erro ao alterar status do usuário';
      toast.error(message);
    }
  };

  // Renderizar badge de status
  const renderStatusBadge = (active: boolean) => {
    if (active) {
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
  };

  // Renderizar role
  const renderRole = (role: UserRole) => {
    const roleLabels: { [key in UserRole]: string } = {
      [UserRole.admin]: 'Administrador',
      [UserRole.finance]: 'Financeiro',
      [UserRole.leader]: 'Líder',
      [UserRole.secretary]: 'Secretário',
    };
    return roleLabels[role] || role;
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (!isMounted || !canAccessUsers()) {
    return null;
  }

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600 mt-1">Gerenciamento de acesso ao sistema</p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-[#001529] hover:bg-[#002a4a]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="filterName">Nome</Label>
            <Input
              id="filterName"
              placeholder="Filtrar por nome"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="filterEmail">Email</Label>
            <Input
              id="filterEmail"
              placeholder="Filtrar por email"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="filterRole">Role</Label>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger id="filterRole">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="finance">Financeiro</SelectItem>
                <SelectItem value="leader">Líder</SelectItem>
                <SelectItem value="secretary">Secretário</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="filterStatus">Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="filterStatus">
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

        {hasActiveFilters() && (
          <div className="mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        )}
      </Card>

      {/* Tabela */}
      <Card>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            {users.length === 0 ? (
              <div>
                <p className="text-gray-500 mb-4">Nenhum usuário cadastrado</p>
                <Button onClick={openCreateModal} className="bg-[#001529] hover:bg-[#002a4a]">
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeiro Usuário
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 mb-4">Nenhum usuário encontrado com os filtros aplicados</p>
                <Button variant="outline" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{renderRole(user.role)}</TableCell>
                    <TableCell>{renderStatusBadge(user.active)}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(user)}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openToggleStatusModal(user)}
                          title={user.active ? 'Desativar' : 'Ativar'}
                          disabled={user.id === currentUserId}
                        >
                          {user.active ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteModal(user)}
                          title="Excluir"
                          disabled={user.id === currentUserId}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Modal Criar Usuário */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
            <div>
              <Label htmlFor="create-name">Nome *</Label>
              <Input
                id="create-name"
                {...createForm.register('name')}
                placeholder="Nome completo"
              />
              {createForm.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {createForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="create-email">Email *</Label>
              <Input
                id="create-email"
                type="email"
                {...createForm.register('email')}
                placeholder="email@exemplo.com"
              />
              {createForm.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {createForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="create-password">Senha *</Label>
              <Input
                id="create-password"
                type="password"
                {...createForm.register('password')}
                placeholder="Mínimo 6 caracteres"
              />
              {createForm.formState.errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {createForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="create-confirmPassword">Confirmar Senha *</Label>
              <Input
                id="create-confirmPassword"
                type="password"
                {...createForm.register('confirmPassword')}
                placeholder="Confirme a senha"
              />
              {createForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {createForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="create-role">Role *</Label>
              <Select
                value={createForm.watch('role')}
                onValueChange={(value) => createForm.setValue('role', value)}
              >
                <SelectTrigger id="create-role">
                  <SelectValue placeholder="Selecione uma role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="finance">Financeiro</SelectItem>
                  <SelectItem value="leader">Líder</SelectItem>
                  <SelectItem value="secretary">Secretário</SelectItem>
                </SelectContent>
              </Select>
              {createForm.formState.errors.role && (
                <p className="text-sm text-red-500 mt-1">
                  {createForm.formState.errors.role.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#001529] hover:bg-[#002a4a]">
                Criar Usuário
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Usuário */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                {...editForm.register('name')}
                placeholder="Nome completo"
              />
              {editForm.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {editForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                {...editForm.register('email')}
                placeholder="email@exemplo.com"
              />
              {editForm.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {editForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="edit-password">Nova Senha (opcional)</Label>
              <Input
                id="edit-password"
                type="password"
                {...editForm.register('password')}
                placeholder="Deixe em branco para não alterar"
              />
              {editForm.formState.errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {editForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="edit-confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="edit-confirmPassword"
                type="password"
                {...editForm.register('confirmPassword')}
                placeholder="Confirme a nova senha"
              />
              {editForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {editForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="edit-role">Role *</Label>
              <Select
                value={editForm.watch('role')}
                onValueChange={(value) => editForm.setValue('role', value)}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Selecione uma role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="finance">Financeiro</SelectItem>
                  <SelectItem value="leader">Líder</SelectItem>
                  <SelectItem value="secretary">Secretário</SelectItem>
                </SelectContent>
              </Select>
              {editForm.formState.errors.role && (
                <p className="text-sm text-red-500 mt-1">
                  {editForm.formState.errors.role.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#001529] hover:bg-[#002a4a]">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Excluir Usuário */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Tem certeza que deseja excluir o usuário <strong>{selectedUser?.name}</strong>?
            Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Ativar/Desativar Usuário */}
      <Dialog open={isToggleStatusModalOpen} onOpenChange={setIsToggleStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.active ? 'Desativar' : 'Ativar'} Usuário
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Tem certeza que deseja {selectedUser?.active ? 'desativar' : 'ativar'} o usuário{' '}
            <strong>{selectedUser?.name}</strong>?
            {selectedUser?.active && (
              <span className="block mt-2 text-sm text-amber-600">
                ⚠️ Usuários inativos não conseguem fazer login no sistema.
              </span>
            )}
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsToggleStatusModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-[#001529] hover:bg-[#002a4a]"
              onClick={handleToggleStatus}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
