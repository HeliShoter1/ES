import axios from "axios";
import { useAuth } from "../auth/AuthContext";

export const API_BASE_URL = "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export function useAuthApi() {
  const { token } = useAuth();

  const instance = axios.create({
    baseURL: API_BASE_URL,
  });

  instance.interceptors.request.use((config) => {
    if (token?.access_token) {
      config.headers.Authorization = `Bearer ${token.access_token}`;
    }
    return config;
  });

  return instance;
}


