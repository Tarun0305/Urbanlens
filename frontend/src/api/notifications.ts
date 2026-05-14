import { api } from "./client";

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export async function fetchNotifications() {
  const { data } = await api.get<NotificationItem[]>("/api/notifications");
  return data;
}

export async function markNotificationRead(id: number) {
  await api.put(`/api/notifications/${id}/read`);
}
