import axios from "axios";

export const BASE_URL =
  import.meta.env.VITE_API_URL || "https://urbanlens-techno.railway.app";

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
            detail: "Service temporarily unavailable. Please try again."
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
