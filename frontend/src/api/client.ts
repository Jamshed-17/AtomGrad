import type { AxiosError } from "axios";
import axios from "axios";

const API_BASE_URL = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL || "https://atomgrad.site"
  : "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      code: (error as { code?: string }).code,
      responseData: error.response?.data, // Добавляем полные данные ответа для отладки
    });

    if (error.response?.status === 401 || error.response?.status === 403) {
      sessionStorage.removeItem("isAuthenticated");
      const currentPath = window.location.pathname;
      if (!currentPath.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
