import { api } from "./client";
import { User, UserRole } from "./auth_types";

export async function login(email: string, password: string) {
  const response = await api.post("/api/auth/login", { email, password });
  const { token, user } = response.data;
  
  localStorage.setItem("urbanlens_token", token);
  localStorage.setItem("urbanlens_user", JSON.stringify(user));
  
  return { token, user };
}

export async function register(payload: any) {
  const response = await api.post("/api/auth/register", payload);
  return response.data;
}

export async function me() {
  const response = await api.get("/api/auth/me");
  return response.data;
}

export type { User, UserRole };
