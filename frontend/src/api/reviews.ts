import { api } from "./client";

export interface Review {
  id: number;
  report_id: number;
  contractor_id: number;
  reviewer_id: number;
  rating: number;
  comment: string;
  reviewer_role: string;
  created_at: string;
}

export async function fetchContractorReviews(contractorId: number) {
  const { data } = await api.get(`/api/reviews/contractor/${contractorId}`);
  return data;
}

export async function createReview(payload: any) {
  const { data } = await api.post("/api/reviews", payload);
  return data;
}

export const postReview = createReview;
