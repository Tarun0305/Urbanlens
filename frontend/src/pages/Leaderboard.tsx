import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { fetchLeaderboard, type LeaderboardRow } from "../api/users";
import { LeaderboardCard } from "../components/LeaderboardCard";

export default function Leaderboard() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);

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

  const specialty = useMemo(
    () => ["Urban mobility", "Solid waste", "Electrical infra", "Multi-issue"],
    []
  );

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] border border-white/20 bg-gradient-to-br from-white/80 to-white/40 p-8 shadow-xl backdrop-blur-xl dark:from-slate-950/70 dark:to-slate-900/40"
      >
        <div className="text-xs font-black uppercase tracking-[0.35em] text-primary">
          {t("leaderboard")}
        </div>
        <h1 className="mt-2 font-display text-4xl font-black text-slate-900 dark:text-white">
          Contractor hall of fame
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Rankings blend municipal and citizen ratings equally, then reward consistent delivery
          with job volume. {t("combined_score")} is the headline number.
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((row, idx) => (
          <LeaderboardCard
            key={row.id}
            row={row}
            specialty={specialty[(idx + row.rank) % specialty.length]}
          />
        ))}
      </div>
    </div>
  );
}
