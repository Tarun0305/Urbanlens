import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPinned } from "lucide-react";
import type { Report } from "../api/reports";
import { StatusBadge } from "./StatusBadge";
import { mediaUrl } from "../api/reports";

export function IssueCard({
  report,
  viewLink,
}: {
  report: Report;
  viewLink?: string;
}) {
  const to =
    viewLink || `/citizen/reports?focus=${report.id}`;
  return (
    <motion.div
      layout
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-4 shadow-lg shadow-primary/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-primary">
            {report.category}
          </div>
          <div className="mt-1 font-display text-lg font-extrabold text-slate-900 dark:text-white">
            {report.title}
          </div>
          <div className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
            {report.description}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <MapPinned className="h-4 w-4 text-accent" />
              {report.area || report.address || "Location attached"}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={report.status} />
          {report.ai_verified && (
            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <span className="text-[10px]">✨</span> AI Verified
            </div>
          )}
        </div>
      </div>
      {report.image_url ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-white/20">
          <img
            src={mediaUrl(report.image_url)}
            alt=""
            className="h-40 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      ) : null}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
          #{report.id}
        </div>
        <Link
          to={to}
          className="text-sm font-extrabold text-primary hover:underline"
        >
          View
        </Link>
      </div>
    </motion.div>
  );
}
