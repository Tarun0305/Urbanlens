import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  fetchNotifications,
  markNotificationRead,
  type NotificationItem,
} from "../api/notifications";
import { useAuthStore } from "../store/authStore";

export function NotificationBell() {
  const token = useAuthStore((s) => s.token);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!token) return;
    try {
      const data = await fetchNotifications();
      setItems(data);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(id);
  }, [token]);

  const unread = items.filter((n) => !n.is_read).length;

  const openDropdown = async () => {
    setOpen(true);
    const unreadItems = items.filter((n) => !n.is_read);
    for (const n of unreadItems) {
      try {
        await markNotificationRead(n.id);
      } catch {
        /* ignore */
      }
    }
    await load();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : void openDropdown())}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-800 shadow-sm transition hover:scale-105 dark:border-white/10 dark:bg-slate-900/80 dark:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-black text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90"
        >
          <div className="max-h-80 overflow-y-auto p-2">
            {items.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">No notifications</div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className="mb-2 rounded-xl border border-slate-100 bg-white/70 p-3 text-sm dark:border-white/10 dark:bg-slate-900/60"
                >
                  <div className="font-bold text-slate-900 dark:text-white">{n.title}</div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {n.message}
                  </div>
                </div>
              ))
            )}
          </div>
          <button
            type="button"
            className="w-full border-t border-slate-100 bg-slate-50 py-2 text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </motion.div>
      ) : null}
    </div>
  );
}
