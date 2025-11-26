import apiClient from './client';

export interface AdminRead {
  id: number;
  name: string;
  login: string;
  is_superadmin: boolean;
}

export interface AdminCreate {
  name: string;
  login: string;
  password: string;
  is_superadmin?: boolean;
}

export const adminsApi = {
  // Получить список всех админов (только для супер-админов)
  getAll: async (): Promise<AdminRead[]> => {
    const response = await apiClient.get<AdminRead[]>('/superadmin/admins/');
    return response.data;
  },

  // Создать нового админа (только для супер-админов)
  create: async (admin: AdminCreate): Promise<AdminRead> => {
    const response = await apiClient.post<AdminRead>('/superadmin/admins/', admin);
    return response.data;
  },

  // Удалить админа (только для супер-админов)
  delete: async (adminId: number): Promise<void> => {
    await apiClient.delete(`/superadmin/admins/${adminId}`);
  },
};

