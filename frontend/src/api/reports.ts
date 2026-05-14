import { api } from "./client";

export interface Report {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  citizen_id: number;
  assigned_contractor_id: number | null;
  assigned_by_id: number | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  area: string | null;
  road_name: string | null;
  severity: "low" | "medium" | "high";
  status: "pending" | "ai_verified" | "assigned" | "in_progress" | "done" | "rejected";
  lat: number;
  lng: number;
  address: string;
  image_url: string | null;
  needs_review: boolean;
  created_at: string;
export async function assignReport(
  id: number,
  body: {
    contractor_id: number;
    estimated_cost?: number | null;
    work_start_date?: string | null;
    work_end_date?: string | null;
    workforce_count?: number | null;
  }
) {
  const { data } = await api.post<Report>(`/api/reports/${id}/assign`, body);
  return data;
}

export async function markReportDone(id: number) {
  const { data } = await api.post<Report>(`/api/reports/${id}/mark-done`);
  return data;
}

export async function uploadReportImage(file: File, category: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("category", category);
  const { data } = await api.post<{
    image_url: string;
    ai_verified: boolean;
    ai_confidence: number;
    ai_result: string;
    needs_review: boolean;
    category_detected?: string;
    geotag: { latitude: number | null; longitude: number | null; source?: string };
  }>("/api/reports/upload-image", form);
  return data;
}

export function mediaUrl(path: string | null | undefined) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = import.meta.env.VITE_API_URL?.trim() || "";
  if (base) return `${base.replace(/\/$/, "")}${path}`;
  return path;
}
