import apiClient from "./client";

export interface LoginCredentials {
  name?: string;
  login: string;
  password: string;
}

export interface LoginResponse {
  message: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },
};
