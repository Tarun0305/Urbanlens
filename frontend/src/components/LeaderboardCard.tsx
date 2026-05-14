import { motion } from "framer-motion";
import { Award, Star } from "lucide-react";
import type { LeaderboardRow } from "../api/users";

const medals = ["🥇", "🥈", "🥉"];

export function LeaderboardCard({
  row,
  specialty,
}: {
  row: LeaderboardRow;
  specialty?: string;
}) {
  const medal = medals[row.rank - 1] || `#${row.rank}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/80 to-white/40 p-4 shadow-xl backdrop-blur-xl dark:from-slate-900/80 dark:to-slate-950/40"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      <div className="flex items-center gap-3">
        <div className="text-3xl">{medal}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-lg font-extrabold text-slate-900 dark:text-white">
            {row.full_name}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-amber-900 dark:text-amber-200">
              <Star className="h-3 w-3 fill-current" />
              {row.rating_display.toFixed(1)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary">
              <Award className="h-3 w-3" />
              {row.jobs_completed} jobs
            </span>
            {specialty ? (
              <span className="rounded-full bg-accent/10 px-2 py-1 text-accent">{specialty}</span>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Score
          </div>
          <div className="font-display text-2xl font-black text-primary">
            {row.combined_score.toFixed(1)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
