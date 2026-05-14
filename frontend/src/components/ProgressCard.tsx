import { motion } from "framer-motion";
import { CalendarDays, IndianRupee, Users } from "lucide-react";
import type { ProgressEntry } from "../api/progress";
import { mediaUrl } from "../api/reports";

export function ProgressCard({ p }: { p: ProgressEntry }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-white/20 bg-white/70 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60"
    >
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
          <CalendarDays className="h-4 w-4" />
          {new Date(p.created_at).toLocaleString()}
        </div>
        <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">{p.note}</div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-white/10">
            <Users className="h-3 w-3" />
            {p.workers_today} workers
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-white/10">
            <IndianRupee className="h-3 w-3" />
            {p.money_spent.toFixed(0)}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3 pt-0">
        {p.photo_url ? (
          <img
            src={mediaUrl(p.photo_url)}
            alt=""
            className="h-32 w-full rounded-xl object-cover"
          />
        ) : (
          <div />
        )}
        {p.video_url ? (
          <video
            src={mediaUrl(p.video_url)}
            controls
            className="h-32 w-full rounded-xl object-cover"
          />
        ) : null}
      </div>
    </motion.div>
  );
}
