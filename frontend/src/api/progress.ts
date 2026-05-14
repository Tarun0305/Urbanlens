import { api } from "./client";

export interface ProgressEntry {
  id: number;
  report_id: number;
  contractor_id: number;
  note: string;
  photo_url: string | null;
  video_url: string | null;
  money_spent: number;
  workers_today: number;
  created_at: string;
}

export async function fetchProgress(reportId: number) {
  const { data } = await api.get<ProgressEntry[]>(`/api/progress/${reportId}`);
  return data;
}

export async function postProgress(form: FormData) {
  const { data } = await api.post<ProgressEntry>("/api/progress", form);
  return data;
}
