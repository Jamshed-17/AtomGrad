import apiClient from './client';

// ===== Типы =====

export interface PersonRead {
  id: number;
  name: string;
  about: string;
  text: string[];
  sourses: string[];
  autor: string | null;
}

export interface PersonCreate {
  name: string;
  about: string;
  text: string[];
  photo?: string; // используется только при создании, путь не хранится
  sourses: string[];
  autor?: string | null;
}

// ===== Хелпер для получения изображения =====

/**
 * Возвращает URL изображения деятеля.
 * Используется напрямую в <img src="..."/>
 */
export const getPersonImageUrl = (personId: number): string => {
  if (!apiClient.defaults.baseURL) {
    throw new Error('apiClient.baseURL is not defined');
  }

  return `${apiClient.defaults.baseURL}/persons/image/${personId}`;
};

// ===== API методы =====

export const personsApi = {
  /**
   * Получить всех деятелей
   */
  getAll: async (): Promise<PersonRead[]> => {
    const response = await apiClient.get<PersonRead[]>('/persons/');
    return response.data;
  },

  /**
   * Получить деятеля по ID
   */
  getById: async (personId: number): Promise<PersonRead> => {
    const response = await apiClient.get<PersonRead>(`/persons/${personId}`);
    return response.data;
  },

  /**
   * Получить деятеля по имени
   */
  getByName: async (name: string): Promise<PersonRead> => {
    const response = await apiClient.get<PersonRead>(
      `/persons/id/${encodeURIComponent(name)}`
    );
    return response.data;
  },

  /**
   * Создать деятеля (только админ)
   * Изображение отправляется как файл, но не возвращается как путь
   */
  create: async (
    person: PersonCreate,
    imageFile?: File
  ): Promise<PersonRead> => {
    const formData = new FormData();

    formData.append('name', person.name);
    formData.append('about', person.about);
    formData.append('text', JSON.stringify(person.text));
    formData.append('sourses', JSON.stringify(person.sourses));

    if (person.autor) {
      formData.append('autor', person.autor);
    }

    if (imageFile) {
      formData.append('photo', imageFile);
    }

    const response = await apiClient.post<PersonRead>(
      '/admin/persons/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  /**
   * Обновить деятеля (только админ)
   */
  update: async (
    personId: number,
    person: PersonCreate,
    imageFile?: File
  ): Promise<PersonRead> => {
    const formData = new FormData();

    formData.append('name', person.name);
    formData.append('about', person.about);
    formData.append('text', JSON.stringify(person.text));
    formData.append('sourses', JSON.stringify(person.sourses));

    if (person.autor) {
      formData.append('autor', person.autor);
    }

    if (imageFile) {
      formData.append('photo', imageFile);
    }

    const response = await apiClient.put<PersonRead>(
      `/admin/persons/${personId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  /**
   * Удалить деятеля (только админ)
   */
  delete: async (personId: number): Promise<void> => {
    await apiClient.delete(`/admin/persons/${personId}`);
  },
};
