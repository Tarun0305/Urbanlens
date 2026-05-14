import { api } from "./client";
import type { User, UserRole } from "./auth";

export async function fetchUsers(params?: { role?: string; q?: string }) {
  const { data } = await api.get<User[]>("/api/users", { params });
  return data;
}

export async function createUser(body: {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  language?: string;
}) {
  const { data } = await api.post<User>("/api/users", body);
  return data;
}

export async function updateUser(
  id: number,
  body: Partial<{
    full_name: string;
    role: UserRole;
    language: string;
    is_active: boolean;
  }>
) {
  const { data } = await api.put<User>(`/api/users/${id}`, body);
  return data;
}

export async function deactivateUser(id: number) {
  const { data } = await api.delete<User>(`/api/users/${id}`);
  return data;
}

export async function approveUser(id: number) {
  const { data } = await api.patch<User>(`/api/users/${id}/approve`);
  return data;
}

export interface LeaderboardRow {
  id: number;
  full_name: string;
  rating_display: number;
  citizen_avg: number;
  municipal_avg: number;
  combined_score: number;
  jobs_completed: number;
  avatar_url: string | null;
  rank: number;
}

export async function fetchLeaderboard(limit = 20) {
  const { data } = await api.get<LeaderboardRow[]>("/api/users/leaderboard", {
    params: { limit },
  });
  return data;
}

export type { User, UserRole };
