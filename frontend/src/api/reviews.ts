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
  const saved = localStorage.getItem("urbanlens_mock_reviews");
  const all = saved ? JSON.parse(saved) : [];
  return all.filter((r: Review) => r.contractor_id === contractorId);
}

export async function createReview(payload: any) {
  const saved = localStorage.getItem("urbanlens_mock_reviews");
  const all = saved ? JSON.parse(saved) : [];
  const newReview = { ...payload, id: Date.now(), created_at: new Date().toISOString() };
  all.push(newReview);
  localStorage.setItem("urbanlens_mock_reviews", JSON.stringify(all));
  return newReview;
}
