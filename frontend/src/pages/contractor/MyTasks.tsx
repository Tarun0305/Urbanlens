import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import { fetchReports, type Report } from "../../api/reports";
import { StatusBadge } from "../../components/StatusBadge";

function mapsLink(lat?: number | null, lng?: number | null) {
  if (!lat || !lng) return "https://maps.google.com";
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

function dayDiff(a: Date, b: Date) {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
}

export default function MyTasks() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Report[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetchReports();
        setTasks(r);
      } catch {
        setTasks([]);
      }
    })();
  }, []);

  const rows = useMemo(
    () => tasks.filter((x) => x.status === "assigned" || x.status === "in_progress"),
    [tasks]
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-black text-slate-900 dark:text-white">
        {t("assigned")}
      </h1>
      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((r) => {
          const start = r.work_start_date ? new Date(r.work_start_date) : new Date(r.created_at);
          const end = r.work_end_date ? new Date(r.work_end_date) : new Date(start.getTime() + 7 * 86400000);
          const now = new Date();
          const total = Math.max(1, dayDiff(start, end));
          const doneDays = Math.min(total, dayDiff(start, now));
          const remaining = Math.max(0, dayDiff(now, end));

          return (
            <motion.div
              key={r.id}
              layout
              className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
              <div className="relative space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-black uppercase text-primary">#{r.id}</div>
                    <div className="mt-1 font-display text-xl font-black text-slate-900 dark:text-white">
                      {r.title}
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {r.category} · {r.area || r.address || "Location"}
                </div>
                <a
                  href={mapsLink(r.latitude, r.longitude)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-black text-primary hover:underline"
                >
                  Open in Google Maps
                  <ExternalLink className="h-4 w-4" />
                </a>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <div className="rounded-xl border border-slate-100 bg-white/70 p-3 dark:border-white/10 dark:bg-slate-900/40">
                    Workforce
                    <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                      {r.workforce_count ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white/70 p-3 dark:border-white/10 dark:bg-slate-900/40">
                    Budget
                    <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                      {r.estimated_cost != null ? `₹${r.estimated_cost}` : "—"}
                    </div>
                  </div>
                </div>
                <div className="text-xs font-black uppercase text-slate-500">
                  Days remaining: <span className="text-danger">{remaining}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${Math.min(100, Math.round((doneDays / total) * 100))}%` }}
                  />
                </div>
                <Link
                  to="/contractor/progress"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-900"
                >
                  {t("post_progress")}
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
      {rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-300">
          {t("no_data")}
        </div>
      ) : null}
    </div>
  );
}
