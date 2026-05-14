import axios from "axios";

const envUrl = import.meta.env.VITE_API_URL?.trim();
export const BASE_URL = "https://urbanlens-techno.railway.app";

export const api = axios.create({
  baseURL: BASE_URL || undefined,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("urbanlens_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("urbanlens_token");
      localStorage.removeItem("urbanlens_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);
