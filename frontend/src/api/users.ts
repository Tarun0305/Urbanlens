import { api } from "./client";
import { User, UserRole } from "./auth_types";

export async function fetchUsers(filters?: { role?: string; q?: string }) {
  const { data } = await api.get<User[]>("/api/users", { params: filters });
  return data;
}

export async function createUser(payload: any) {
  const { data } = await api.post<User>("/api/users", payload);
  return data;
}

export async function updateUser(id: number, payload: Partial<User>) {
  const { data } = await api.put<User>(`/api/users/${id}`, payload);
  return data;
}

export async function deactivateUser(id: number) {
  const { data } = await api.delete(`/api/users/${id}`);
  return data;
}

export async function approveUser(id: number) {
  const { data } = await api.patch(`/api/users/${id}/approve`);
  return data;
}

export async function fetchLeaderboard(limit = 10) {
  const { data } = await api.get<any[]>("/api/users/leaderboard", { params: { limit } });
  return data.map((u, i) => ({
    ...u,
    rank: i + 1,
    rating_display: u.rating,
    combined_score: u.points,
    jobs_completed: Math.floor(u.points / 10)
  }));
}

export type LeaderboardRow = Awaited<ReturnType<typeof fetchLeaderboard>>[0];

export type { User, UserRole };
