import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { fetchContractorReviews } from "../../api/reviews";
import { fetchLeaderboard, type LeaderboardRow } from "../../api/users";

export default function ContractorBoard() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [open, setOpen] = useState<LeaderboardRow | null>(null);
  const [reviews, setReviews] = useState<
    Awaited<ReturnType<typeof fetchContractorReviews>>
  >([]);

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchLeaderboard(50);
        setRows(data);
      } catch {
        setRows([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!open) return;
    void (async () => {
      try {
        const r = await fetchContractorReviews(open.id);
        setReviews(r);
      } catch {
        setReviews([]);
      }
    })();
  }, [open]);

  const avgSpeedDays = (row: LeaderboardRow) => {
    const base = 10 - Math.min(9, row.jobs_completed / 5);
    return `${base.toFixed(1)}d`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-black text-slate-900 dark:text-white">
          {t("contractor_board")}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Ranked by blended ratings and throughput. Click a row for full review history.
        </p>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/20 bg-white/70 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Jobs</th>
              <th className="px-4 py-3">Avg speed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="cursor-pointer border-t border-slate-100 hover:bg-primary/5 dark:border-white/5"
                onClick={() => setOpen(r)}
              >
                <td className="px-4 py-3 font-black text-primary">#{r.rank}</td>
                <td className="px-4 py-3 font-bold">{r.full_name}</td>
                <td className="px-4 py-3">★ {r.rating_display.toFixed(1)}</td>
                <td className="px-4 py-3">{r.jobs_completed}</td>
                <td className="px-4 py-3">{avgSpeedDays(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase text-primary">Profile</div>
                  <div className="mt-1 font-display text-2xl font-black text-slate-900 dark:text-white">
                    {open.full_name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black dark:bg-white/10 dark:text-white"
                >
                  {t("close")}
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {reviews.map((rv) => (
                  <div
                    key={rv.id}
                    className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-white/10 dark:bg-slate-900/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-black uppercase text-slate-500">
                        {rv.reviewer_role}
                      </div>
                      <div className="text-sm font-black text-warning">★ {rv.rating}</div>
                    </div>
                    <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                      {rv.comment || "—"}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      {new Date(rv.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
                {reviews.length === 0 ? (
                  <div className="text-sm text-slate-500">{t("no_data")}</div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
