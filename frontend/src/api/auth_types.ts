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
  is_approved: boolean;
  achievements?: string;
  created_at: string;
}
