import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuthStore } from "../store/authStore";
import type { UserRole } from "../api/auth";

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactElement;
  roles?: UserRole[];
}) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
