import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/authStore";
import { me } from "../../api/auth";
import { fetchReports, type Report } from "../../api/reports";
import { fetchProgress } from "../../api/progress";

export default function ContractorDashboard() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [tasks, setTasks] = useState<Report[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState(0);

  useEffect(() => {
    void (async () => {
      try {
        const u = await me();
        setUser(u);
      } catch {
        /* ignore */
      }
      try {
        const r = await fetchReports();
        setTasks(r);
        const today = new Date().toDateString();
        let pending = 0;
        for (const task of r) {
          const prog = await fetchProgress(task.id);
          const postedToday = prog.some(
            (p) => new Date(p.created_at).toDateString() === today
          );
          if (!postedToday && task.status === "in_progress") pending += 1;
        }
        setPendingUpdates(pending);
      } catch {
        setTasks([]);
      }
    })();
  }, [setUser]);

  const active = useMemo(
    () => tasks.filter((t) => t.status === "assigned" || t.status === "in_progress"),
    [tasks]
  );

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-accent/20 via-white/70 to-primary/15 p-8 shadow-2xl backdrop-blur-xl dark:from-accent/25 dark:via-slate-950/60 dark:to-primary/20"
      >
        <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.35em] text-accent">
              {t("contractor")}
            </div>
            <h1 className="mt-2 font-display text-4xl font-black text-slate-900 dark:text-white">
              {t("welcome")}, {user?.full_name}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Keep daily receipts tight — citizens see your progress timeline in real time.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-white/20 bg-white/70 p-6 text-center shadow-xl dark:border-white/10 dark:bg-slate-950/60">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">
              Your rating
            </div>
            <div className="mt-2 font-display text-6xl font-black text-warning">
              ★ {user?.rating.toFixed(1)}
            </div>
            <div className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-300">
              Active tasks: {active.length}
            </div>
            <div className="mt-1 text-sm font-bold text-danger">
              Today pending updates: {pendingUpdates}
            </div>
          </div>
        </div>
      </motion.div>

      <Link
        to="/contractor/progress"
        className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-4 text-sm font-black text-white shadow-xl"
      >
        {t("post_progress")}
      </Link>
    </div>
  );
}
