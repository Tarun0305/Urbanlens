import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { AlertTriangle, BarChart3, ClipboardList, HardHat } from "lucide-react";
import { fetchAnalyticsSummary } from "../../api/analytics";

export default function MunicipalDashboard() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const s = await fetchAnalyticsSummary();
        setSummary(s);
      } catch {
        setSummary(null);
      }
    })();
  }, []);

  const pending = Number(summary?.pending ?? 0);
  const blink = pending > 5;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-slate-900 via-primary to-slate-900 p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 bg-hero-mesh opacity-60" />
        <div className="relative">
          <div className="text-xs font-black uppercase tracking-[0.35em] text-white/70">
            {t("municipal")}
          </div>
          <h1 className="mt-2 font-display text-4xl font-black">{t("dashboard")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            Triage AI-verified issues, assign the best crews, and close the loop with citizens.
          </p>
        </div>
      </motion.div>

      <div
        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-black ${
          blink
            ? "animate-pulseSoft border-warning/40 bg-warning/15 text-warning"
            : "border-white/20 bg-white/70 text-slate-900 dark:bg-slate-950/60 dark:text-white"
        }`}
      >
        <AlertTriangle className="h-5 w-5" />
        {blink ? "⚠️ " : ""}
        {pending} issues pending action
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total", value: Number(summary?.total_reports ?? 0) },
          { label: t("pending"), value: pending },
          { label: t("status") + " IP", value: Number(summary?.in_progress ?? 0) },
          { label: "Done (all)", value: Number(summary?.done ?? 0) },
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

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/municipal/issues"
          className="group rounded-[1.75rem] border border-white/20 bg-gradient-to-br from-primary/15 to-white/70 p-6 shadow-xl backdrop-blur-xl dark:from-primary/25 dark:to-slate-950/60"
        >
          <ClipboardList className="h-8 w-8 text-primary" />
          <div className="mt-3 font-display text-xl font-black text-slate-900 group-hover:text-primary dark:text-white">
            {t("issue_list")}
          </div>
        </Link>
        <Link
          to="/municipal/contractors"
          className="group rounded-[1.75rem] border border-white/20 bg-gradient-to-br from-accent/15 to-white/70 p-6 shadow-xl backdrop-blur-xl dark:from-accent/25 dark:to-slate-950/60"
        >
          <HardHat className="h-8 w-8 text-accent" />
          <div className="mt-3 font-display text-xl font-black text-slate-900 group-hover:text-accent dark:text-white">
            {t("contractor_board")}
          </div>
        </Link>
        <div className="rounded-[1.75rem] border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
          <BarChart3 className="h-8 w-8 text-fuchsia-600" />
          <div className="mt-3 font-display text-xl font-black text-slate-900 dark:text-white">
            {t("analytics")}
          </div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Summary cards above refresh as reports move through the pipeline.
          </div>
        </div>
      </div>
    </div>
  );
}
