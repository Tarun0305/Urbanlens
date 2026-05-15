import { api } from "./client";

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  read: boolean;
  is_read?: boolean; // Alias for component compatibility
  created_at: string;
}

export type NotificationItem = Notification;

export async function fetchNotifications() {
  const { data } = await api.get<Notification[]>("/api/notifications");
  return data.map(n => ({ ...n, is_read: n.read }));
}

export const getNotifications = fetchNotifications;

export async function markNotificationRead(id: number) {
  const { data } = await api.post(`/api/notifications/${id}/read`);
  return data;
}

export const markAsRead = markNotificationRead;

export async function fetchContractorReviews(contractorId: number) {
  const { data } = await api.get(`/api/reviews/contractor/${contractorId}`);
  return data;
}
