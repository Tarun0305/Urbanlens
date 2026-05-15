import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle } from "lucide-react";

export function AIResultCard({
  ok,
  confidence,
  category,
  reason,
}: {
  ok: boolean;
  confidence: number;
  category?: string;
  reason: string;
}) {
  const { t } = useTranslation();
  const pct = Math.max(0, Math.min(100, confidence));
  const barColor = ok && pct >= 45 ? "from-accent to-emerald-300" : "from-danger to-orange-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/80 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
    >
      <div className="flex items-start gap-3">
        {ok ? (
          <CheckCircle2 className="h-8 w-8 shrink-0 text-accent" />
        ) : (
          <XCircle className="h-8 w-8 shrink-0 text-danger" />
        )}
        <div className="min-w-0 flex-1">
          <div className="font-display text-lg font-extrabold text-slate-900 dark:text-white">
            {ok ? "Legitimacy Verified" : t("ai_rejected")}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${ok ? 'bg-accent animate-pulse' : 'bg-danger'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {ok ? "Real-world issue detected" : "Failed legitimacy check"}
            </span>
          </div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{reason}</div>
          {category ? (
            <div className="mt-2 text-xs font-bold text-primary">
              {t("detected_category")}: {category}
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
          <span>{t("confidence")}</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
