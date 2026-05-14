import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { fetchAnalyticsSummary } from "../../api/analytics";
import { fetchUsers } from "../../api/users";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [users, setUsers] = useState(0);
  const [contractors, setContractors] = useState(0);
  const [recent, setRecent] = useState<{ email: string; created_at: string }[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const s = await fetchAnalyticsSummary();
        setSummary(s);
      } catch {
        setSummary(null);
      }
      try {
        const all = await fetchUsers();
        setUsers(all.length);
        setContractors(all.filter((u) => u.role === "contractor").length);
        setRecent(
          all
            .slice()
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            .slice(0, 6)
            .map((u) => ({ email: u.email, created_at: u.created_at }))
        );
      } catch {
        setUsers(0);
        setContractors(0);
        setRecent([]);
      }
    })();
  }, []);

  const pending = Number(summary?.pending ?? 0);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] border border-white/20 bg-gradient-to-br from-slate-900 via-fuchsia-700 to-primary p-8 text-white shadow-2xl"
      >
        <div className="text-xs font-black uppercase tracking-[0.35em] text-white/70">
          {t("admin")}
        </div>
        <h1 className="mt-2 font-display text-4xl font-black">{t("dashboard")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/80">
          Monitor platform health, onboard new municipal officers, and keep contractor pools
          fresh.
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Users", value: users },
          { label: "Reports", value: Number(summary?.total_reports ?? 0) },
          { label: "Contractors", value: contractors },
          { label: "Pending issues", value: pending },
        ].map((k) => (
          <motion.div
            key={k.label}
            whileHover={{ y: -3 }}
            className="rounded-[1.75rem] border border-white/20 bg-white/70 p-5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60"
          >
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">
              {k.label}
            </div>
            <div className="mt-2 font-display text-3xl font-black text-slate-900 dark:text-white">
              {k.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[2rem] border border-white/20 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
          <div className="font-display text-xl font-black text-slate-900 dark:text-white">
            Recent signups
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {recent.map((r) => (
              <div
                key={r.email}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2 dark:border-white/10 dark:bg-slate-900/40"
              >
                <div className="font-bold">{r.email}</div>
                <div className="text-xs text-slate-500">
                  {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
            ))}
            {recent.length === 0 ? <div className="text-sm text-slate-500">{t("no_data")}</div> : null}
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/20 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
          <div className="font-display text-xl font-black text-slate-900 dark:text-white">
            Quick links
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              to="/admin/users"
              className="rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-center text-sm font-black text-white"
            >
              {t("user_manager")}
            </Link>
            <Link
              to="/leaderboard"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            >
              {t("leaderboard")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
