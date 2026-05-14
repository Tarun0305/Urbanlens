import { api } from "./client";

export type UserRole = "citizen" | "municipal" | "contractor" | "admin";

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  language: string;
  points: number;
  rating: number;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export async function login(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: User }>(
    "/api/auth/login",
    { email, password }
  );
  return data;
}

export async function register(payload: {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  language: string;
}) {
  const { data } = await api.post<User>("/api/auth/register", payload);
  return data;
}

export async function me() {
  const { data } = await api.get<User>("/api/auth/me");
  return data;
}
