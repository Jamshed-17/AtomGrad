import apiClient from './client';

// Типы для деятелей (используются только в этом файле)
export interface PersonRead {
  id: number;
  name: string;
  about: string;
  text: string[];
  photo: string;
  sourses: string[];
  autor: string | null;
}

export interface PersonCreate {
  name: string;
  about: string;
  text: string[];
  photo: string;
  sourses: string[];
  autor?: string | null;
}

// API методы для работы с деятелями
export const personsApi = {
  // Получить всех деятелей
  getAll: async (): Promise<PersonRead[]> => {
    const response = await apiClient.get<PersonRead[]>('/persons/');
    return response.data;
  },

  // Получить деятеля по ID
  getById: async (personId: number): Promise<PersonRead> => {
    const response = await apiClient.get<PersonRead>(`/persons/${personId}`);
    return response.data;
  },

  // Получить деятеля по имени
  getByName: async (name: string): Promise<PersonRead> => {
    const response = await apiClient.get<PersonRead>(`/persons/id/${encodeURIComponent(name)}`);
    return response.data;
  },

  // Создать деятеля (только для админов)
  create: async (person: PersonCreate): Promise<PersonRead> => {
    const response = await apiClient.post<PersonRead>('/admin/persons/', person);
    return response.data;
  },

  // Обновить деятеля (только для админов)
  update: async (personId: number, person: PersonCreate): Promise<PersonRead> => {
    const response = await apiClient.put<PersonRead>(`/admin/persons/${personId}`, person);
    return response.data;
  },

  // Удалить деятеля (только для админов)
  delete: async (personId: number): Promise<void> => {
    await apiClient.delete(`/admin/persons/${personId}`);
  },
};

