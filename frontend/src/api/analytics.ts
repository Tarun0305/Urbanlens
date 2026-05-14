import { api } from "./client";

export async function fetchPublicSummary() {
  const { data } = await api.get<{
    total_reports: number;
    resolved: number;
    cities: number;
  }>("/api/analytics/public");
  return data;
}

export async function fetchAnalyticsSummary() {
  const { data } = await api.get<Record<string, unknown>>("/api/analytics/summary");
  return data;
}
