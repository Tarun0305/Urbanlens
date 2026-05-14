const styles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30",
  ai_verified:
    "bg-blue-100 text-blue-900 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-100 dark:ring-blue-500/30",
  assigned:
    "bg-purple-100 text-purple-900 ring-purple-200 dark:bg-purple-500/15 dark:text-purple-100 dark:ring-purple-500/30",
  in_progress:
    "bg-orange-100 text-orange-900 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-100 dark:ring-orange-500/30",
  done: "bg-emerald-100 text-emerald-900 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-100 dark:ring-emerald-500/30",
  rejected: "bg-red-100 text-red-900 ring-red-200 dark:bg-red-500/15 dark:text-red-100 dark:ring-red-500/30",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = styles[status] || "bg-slate-100 text-slate-800 ring-slate-200 dark:bg-white/10 dark:text-white";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide ring-1 ${cls}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
