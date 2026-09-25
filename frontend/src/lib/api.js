import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ja_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
      localStorage.removeItem("ja_token");
      if (!err.config?.url?.includes("/auth/me")) window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export function apiError(err) {
  return err?.response?.data?.error || err?.message || "Something went wrong. Please try again.";
}

export default api;
