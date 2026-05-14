export interface Notification {
  id: number;
  user_id: number;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

const getLocalNotifications = (): Notification[] => {
  const saved = localStorage.getItem("urbanlens_mock_notifications");
  return saved ? JSON.parse(saved) : [];
};

export async function fetchNotifications() {
  const userJson = localStorage.getItem("urbanlens_user");
  const user = userJson ? JSON.parse(userJson) : { id: 0 };
  return getLocalNotifications().filter(n => n.user_id === user.id);
}

export async function markNotificationRead(id: number) {
  const all = getLocalNotifications();
  const idx = all.findIndex(n => n.id === id);
  if (idx > -1) {
    all[idx].read = true;
    localStorage.setItem("urbanlens_mock_notifications", JSON.stringify(all));
  }
}

export async function fetchContractorReviews(contractorId: number) {
  const saved = localStorage.getItem("urbanlens_mock_reviews");
  const all = saved ? JSON.parse(saved) : [];
  return all.filter((r: any) => r.contractor_id === contractorId);
}
