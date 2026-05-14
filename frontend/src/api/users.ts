import { User, UserRole } from "./auth_types";

const getLocalUsers = (): User[] => {
  const saved = localStorage.getItem("urbanlens_mock_users");
  return saved ? JSON.parse(saved) : [];
};

const saveLocalUsers = (users: User[]) => {
  localStorage.setItem("urbanlens_mock_users", JSON.stringify(users));
};

export async function fetchUsers(filters?: { role?: string; q?: string }) {
  let users = getLocalUsers();
  if (filters?.role) {
    users = users.filter((u) => u.role === filters.role);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    users = users.filter((u) => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  return users;
}

export async function createUser(payload: any) {
  const users = getLocalUsers();
  const newUser = { ...payload, id: Date.now(), points: 0, rating: 0, is_active: true, is_approved: true, created_at: new Date().toISOString() };
  users.push(newUser);
  saveLocalUsers(users);
  return newUser;
}

export async function updateUser(id: number, payload: Partial<User>) {
  const users = getLocalUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx > -1) {
    users[idx] = { ...users[idx], ...payload };
    saveLocalUsers(users);
    return users[idx];
  }
  throw new Error("User not found");
}

export async function deactivateUser(id: number) {
  return updateUser(id, { is_active: false });
}

export async function approveUser(id: number) {
  return updateUser(id, { is_approved: true });
}

export async function fetchLeaderboard(limit = 10) {
  const users = getLocalUsers().filter(u => u.role === "contractor" && u.is_approved);
  return users.sort((a, b) => b.points - a.points).slice(0, limit).map((u, i) => ({
    ...u,
    rank: i + 1,
    rating_display: u.rating,
    jobs_completed: Math.floor(u.points / 10)
  }));
}

export type LeaderboardRow = Awaited<ReturnType<typeof fetchLeaderboard>>[0];

export type { User, UserRole };
