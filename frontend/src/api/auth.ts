import { User, UserRole } from "./auth_types";

// Helper to get all users from localStorage
const getLocalUsers = (): User[] => {
  const saved = localStorage.getItem("urbanlens_mock_users");
  if (!saved) {
    // Initial Seed Data
    const initial = [
      {
        id: 1,
        full_name: "Main Admin",
        email: "admin@urbanlens.com",
        phone: "9999999999",
        role: "admin" as UserRole,
        language: "en",
        points: 1000,
        rating: 5.0,
        avatar_url: null,
        is_active: true,
        is_approved: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        full_name: "Tarun Citizen",
        email: "tarun.citizen@test.com",
        phone: "8888888888",
        role: "citizen" as UserRole,
        language: "en",
        points: 0,
        rating: 0,
        avatar_url: null,
        is_active: true,
        is_approved: true,
        created_at: new Date().toISOString(),
      }
    ];
    localStorage.setItem("urbanlens_mock_users", JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(saved);
};

const saveLocalUsers = (users: User[]) => {
  localStorage.setItem("urbanlens_mock_users", JSON.stringify(users));
};

export async function login(email: string, password: string) {
  // Simple simulation: password is 'Admin@123' or 'password123'
  const users = getLocalUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) throw { response: { data: { detail: "User not found" } } };
  
  if (!user.is_approved) {
    const authority = user.role === "municipal" ? "Admin" : "Municipal Authority";
    throw { response: { data: { detail: `Approval Pending. Please contact ${authority}.` } } };
  }

  // Generate a dummy token
  const token = "mock_token_" + btoa(email);
  return { token, user };
}

export async function register(payload: any) {
  const users = getLocalUsers();
  if (users.find(u => u.email === payload.email)) {
    throw { response: { data: { detail: "Email already registered" } } };
  }

  const newUser: User = {
    id: Date.now(),
    full_name: payload.full_name,
    email: payload.email,
    phone: payload.phone,
    role: payload.role,
    language: payload.language,
    achievements: payload.achievements,
    points: 0,
    rating: 0,
    avatar_url: null,
    is_active: true,
    is_approved: payload.role === "citizen" || payload.role === "admin",
    created_at: new Date().toISOString(),
  };

  users.push(newUser);
  saveLocalUsers(users);
  return newUser;
}

export async function me() {
  const userJson = localStorage.getItem("urbanlens_user");
  if (!userJson) throw new Error("Not logged in");
  return JSON.parse(userJson);
}

export type { User, UserRole };
