import api from './api';

export interface Team {
  id: string;
  name: string;
  description?: string;
  users: any[];
}

export const createTeam = async (name: string, description?: string) => {
  const response = await api.post('/api/teams', { name, description });
  return response.data.data;
};

export const getTeam = async (id: string) => {
  const response = await api.get(`/api/teams/${id}`);
  return response.data.data;
};

export const inviteUser = async (id: string, email: string) => {
  const response = await api.post(`/api/teams/${id}/invite`, { email });
  return response.data.data;
};
