import apiClient from './client';

// Типы для персон (используются только в этом файле)
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

// API методы для работы с персонами
export const personsApi = {
  // Получить все персоны
  getAll: async (): Promise<PersonRead[]> => {
    const response = await apiClient.get<PersonRead[]>('/persons/');
    return response.data;
  },

  // Получить персону по ID
  getById: async (personId: number): Promise<PersonRead> => {
    const response = await apiClient.get<PersonRead>(`/persons/${personId}`);
    return response.data;
  },

  // Получить персону по имени
  getByName: async (name: string): Promise<PersonRead> => {
    const response = await apiClient.get<PersonRead>(`/persons/id/${encodeURIComponent(name)}`);
    return response.data;
  },

  // Создать персону (только для админов)
  create: async (person: PersonCreate): Promise<PersonRead> => {
    const response = await apiClient.post<PersonRead>('/admin/persons/', person);
    return response.data;
  },

  // Обновить персону (только для админов)
  update: async (personId: number, person: PersonCreate): Promise<PersonRead> => {
    const response = await apiClient.put<PersonRead>(`/admin/persons/${personId}`, person);
    return response.data;
  },

  // Удалить персону (только для админов)
  delete: async (personId: number): Promise<void> => {
    await apiClient.delete(`/admin/persons/${personId}`);
  },
};

