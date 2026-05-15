import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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
