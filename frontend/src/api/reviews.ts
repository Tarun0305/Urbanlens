import { api } from "./client";

export async function postReview(body: {
  report_id: number;
  reviewee_id: number;
  rating: number;
  comment?: string;
}) {
  const { data } = await api.post("/api/reviews", body);
  return data;
}

export async function fetchContractorReviews(contractorId: number) {
  const { data } = await api.get<
    {
      id: number;
      report_id: number;
      rating: number;
      comment: string | null;
      reviewer_role: string;
      created_at: string;
      reviewer_name: string | null;
    }[]
  >(`/api/reviews/contractor/${contractorId}`);
  return data;
}
