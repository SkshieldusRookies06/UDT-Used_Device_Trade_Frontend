import axios from "axios";
import { useAuthStore } from "../store/authStore.js";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res.data?.data,
  (error) => {
    const url = error.config?.url ?? "";
    const body = error.response?.data;
    if (error.response?.status === 401 && !url.startsWith("/api/auth/")) {
      useAuthStore.getState().clear();
      if (window.location.pathname !== "/login") window.location.assign("/login");
    }
    return Promise.reject({
      code: body?.code ?? "NETWORK_ERROR",
      message: body?.message ?? "서버와 통신할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      fields: body?.fields ?? [],
      status: error.response?.status ?? 0,
    });
  }
);

export default client;
