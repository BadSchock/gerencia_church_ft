import api from './api';

export type TeamMemberRole = 'COORDINATOR' | 'VOLUNTEER';

export interface Team {
  id: number;
  name: string;
  parent_id?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Para tree view
  children?: Team[];
  team_members?: TeamMember[];
}

export interface TeamMember {
  id: number;
  team_id: number;
  member_id: number;
  role: TeamMemberRole;
  created_at: string;
  // Relacionamento
  member?: {
    id: number;
    name: string;
  };
}

export interface CreateTeamDto {
  name: string;
  parent_id?: number;
  notes?: string;
}

export interface UpdateTeamDto {
  name?: string;
  parent_id?: number;
  notes?: string;
}

export interface AddMemberDto {
  member_id: number;
  role: TeamMemberRole;
}

export const teamsService = {
  async getAll(): Promise<Team[]> {
    const response = await api.get('/teams');
    return response.data;
  },

  async getTree(): Promise<Team[]> {
    const response = await api.get('/teams/tree');
    return response.data;
  },

  async getById(id: number): Promise<Team> {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  async create(data: CreateTeamDto): Promise<Team> {
    const response = await api.post('/teams', data);
    return response.data;
  },

  async update(id: number, data: UpdateTeamDto): Promise<Team> {
    const response = await api.patch(`/teams/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/teams/${id}`);
  },

  // Membros
  async addMember(teamId: number, data: AddMemberDto): Promise<TeamMember> {
    const response = await api.post(`/teams/${teamId}/members`, data);
    return response.data;
  },

  async updateMemberRole(teamId: number, memberId: number, role: TeamMemberRole): Promise<TeamMember> {
    const response = await api.patch(`/teams/${teamId}/members/${memberId}`, { role });
    return response.data;
  },

  async removeMember(teamId: number, memberId: number): Promise<void> {
    await api.delete(`/teams/${teamId}/members/${memberId}`);
  },
};
