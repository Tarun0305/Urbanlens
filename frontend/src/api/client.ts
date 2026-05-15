import axios from "axios";

const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' || 
   window.location.port === '5173');

export const BASE_URL = import.meta.env.VITE_API_URL || (isLocal ? "http://127.0.0.1:8000" : "");

export const getMediaUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = import.meta.env.VITE_MEDIA_URL?.trim() || BASE_URL;
  if (base) return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  return path.startsWith("/") ? path : `/${path}`;
};

export const api = axios.create({
  baseURL: BASE_URL,
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
    if (!err.response) {
      // Meaningful message if backend is unreachable
      return Promise.reject({
        response: {
          data: {
            detail: "Cannot reach the server. Please ensure the backend is running on " + BASE_URL
          }
        }
      });
    }
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
