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
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  UserPlus,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import {
  teamsService,
  Team,
  TeamMember,
  CreateTeamDto,
  AddMemberDto,
} from "@/services/teams.service";
import { membersService, Member } from "@/services/members.service";
import { Badge } from "@/components/ui/badge";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set());
  const [teamFormData, setTeamFormData] = useState<CreateTeamDto>({
    name: "",
    parent_id: undefined,
  });
  const [memberFormData, setMemberFormData] = useState<AddMemberDto>({
    member_id: 0,
    role: "COORDINATOR",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamsData, membersData] = await Promise.all([
        teamsService.getTree(),
        membersService.getAll(),
      ]);
      setTeams(teamsData);
      setMembers(membersData);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await teamsService.update(editingTeam.id, teamFormData);
        toast.success("Equipe atualizada com sucesso!");
      } else {
        await teamsService.create(teamFormData);
        toast.success("Equipe criada com sucesso!");
      }
      setTeamDialogOpen(false);
      resetTeamForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao salvar equipe");
    }
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    try {
      await teamsService.addMember(selectedTeam.id, memberFormData);
      toast.success("Membro adicionado com sucesso!");
      setMemberDialogOpen(false);
      resetMemberForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao adicionar membro");
    }
  };

  const handleRemoveMember = async (teamId: number, memberId: number) => {
    if (!confirm("Tem certeza que deseja remover este membro da equipe?")) return;
    try {
      await teamsService.removeMember(teamId, memberId);
      toast.success("Membro removido com sucesso!");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao remover membro");
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setTeamFormData({
      name: team.name,
      parent_id: team.parent_id,
    });
    setTeamDialogOpen(true);
  };

  const handleDeleteTeam = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta equipe?")) return;
    try {
      await teamsService.delete(id);
      toast.success("Equipe excluída com sucesso!");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao excluir equipe");
    }
  };

  const resetTeamForm = () => {
    setEditingTeam(null);
    setTeamFormData({ name: "", parent_id: undefined });
  };

  const resetMemberForm = () => {
    setSelectedTeam(null);
    setMemberFormData({ member_id: 0, role: "COORDINATOR" });
  };

  const toggleExpand = (teamId: number) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      SUPERVISOR: "default",
      COORDINATOR: "secondary",
      LEADER: "outline",
      MEMBER: "outline",
    };
    const labels: Record<string, string> = {
      SUPERVISOR: "Supervisor",
      COORDINATOR: "Coordenador",
      LEADER: "Líder",
      MEMBER: "Membro",
    };
    return <Badge variant={variants[role]}>{labels[role] || role}</Badge>;
  };

  const renderTeamTree = (team: Team, level: number = 0) => {
    const isExpanded = expandedTeams.has(team.id);
    const hasChildren = team.children && team.children.length > 0;
    const hasMembers = team.team_members && team.team_members.length > 0;

    return (
      <div key={team.id}>
        <Card className="mb-2" style={{ marginLeft: `${level * 24}px` }}>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpand(team.id)}
                  disabled={!hasChildren && !hasMembers}
                >
                  {hasChildren || hasMembers ? (
                    isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )
                  ) : (
                    <div className="w-4" />
                  )}
                </Button>
                <Users className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">{team.name}</CardTitle>
                <Badge variant="secondary">
                  {team.team_members?.length || 0} membros
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedTeam(team);
                    setMemberDialogOpen(true);
                  }}
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  Adicionar Membro
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEditTeam(team)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteTeam(team.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {isExpanded && hasMembers && (
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.team_members?.map((tm: TeamMember) => (
                    <TableRow key={tm.id}>
                      <TableCell>{tm.member?.name}</TableCell>
                      <TableCell>{getRoleBadge(tm.role)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveMember(team.id, tm.member_id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          )}
        </Card>

        {isExpanded && hasChildren && team.children?.map((child) => renderTeamTree(child, level + 1))}
      </div>
    );
  };

  const flatTeams = (teams: Team[]): Team[] => {
    const result: Team[] = [];
    const flatten = (teamList: Team[]) => {
      teamList.forEach((team) => {
        result.push(team);
        if (team.children) flatten(team.children);
      });
    };
    flatten(teams);
    return result;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipes</h1>
          <p className="text-muted-foreground">Gerenciar estrutura hierárquica de equipes</p>
        </div>
        <Button
          onClick={() => {
            resetTeamForm();
            setTeamDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Equipe
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Equipes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flatTeams(teams).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flatTeams(teams).reduce((sum, t) => sum + (t.team_members?.length || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipes Raiz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Árvore de equipes */}
      {loading ? (
        <Card>
          <CardContent className="py-8 text-center">Carregando...</CardContent>
        </Card>
      ) : teams.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">Nenhuma equipe cadastrada</CardContent>
        </Card>
      ) : (
        <div>{teams.map((team) => renderTeamTree(team))}</div>
      )}

      {/* Dialog - Nova/Editar Equipe */}
      <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeam ? "Editar Equipe" : "Nova Equipe"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTeamSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Equipe *</Label>
              <Input
                id="name"
                value={teamFormData.name}
                onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="parent_team_id">Equipe Pai (opcional)</Label>
              <Select
                value={teamFormData.parent_id?.toString() || "none"}
                onValueChange={(value) =>
                  setTeamFormData({
                    ...teamFormData,
                    parent_id: value === "none" ? undefined : parseInt(value),
                  })
                }
              >
                <SelectTrigger id="parent_team_id">
                  <SelectValue placeholder="Sem equipe pai (raiz)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem equipe pai (raiz)</SelectItem>
                  {flatTeams(teams)
                    .filter((t) => t.id !== editingTeam?.id)
                    .map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setTeamDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editingTeam ? "Atualizar" : "Criar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog - Adicionar Membro */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Adicionar Membro - {selectedTeam?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMemberSubmit} className="space-y-4">
            <div>
              <Label htmlFor="member_id">Membro *</Label>
              <Select
                value={memberFormData.member_id.toString()}
                onValueChange={(value) =>
                  setMemberFormData({ ...memberFormData, member_id: parseInt(value) })
                }
              >
                <SelectTrigger id="member_id">
                  <SelectValue placeholder="Selecione um membro" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="role">Função *</Label>
              <Select
                value={memberFormData.role}
                onValueChange={(value) =>
                  setMemberFormData({
                    ...memberFormData,
                    role: value as AddMemberDto["role"],
                  })
                }
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                  <SelectItem value="COORDINATOR">Coordenador</SelectItem>
                  <SelectItem value="LEADER">Líder</SelectItem>
                  <SelectItem value="MEMBER">Membro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMemberDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Adicionar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
