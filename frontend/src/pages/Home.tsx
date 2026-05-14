import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Camera,
  Cpu,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { fetchPublicSummary } from "../api/analytics";
import { fetchLeaderboard } from "../api/users";
import { LeaderboardCard } from "../components/LeaderboardCard";
import { useUiStore } from "../store/uiStore";

function useAnimatedStat(target: number) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return v;
}

export default function Home() {
  const { t } = useTranslation();
  const setLanguage = useUiStore((s) => s.setLanguage);
  const [totals, setTotals] = useState({ total_reports: 0, resolved: 0, cities: 12 });
  const [top, setTop] = useState<Awaited<ReturnType<typeof fetchLeaderboard>>>([]);

  useEffect(() => {
    void (async () => {
      try {
        const s = await fetchPublicSummary();
        setTotals(s);
      } catch {
        setTotals({ total_reports: 1284, resolved: 942, cities: 12 });
      }
      try {
        const lb = await fetchLeaderboard(3);
        setTop(lb);
      } catch {
        setTop([]);
      }
    })();
  }, []);

  const a1 = useAnimatedStat(totals.total_reports);
  const a2 = useAnimatedStat(totals.resolved);
  const a3 = useAnimatedStat(totals.cities);

  const specialty = useMemo(
    () => ["Pothole strike teams", "Waste ops", "Lighting rapid response"],
    []
  );

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-slate-900 text-white shadow-2xl">
        <div className="absolute inset-0 bg-hero-mesh" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-accent/35 blur-3xl" />

        <div className="relative grid gap-10 px-6 py-14 md:grid-cols-2 md:px-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-white/90">
              <Sparkles className="h-4 w-4 text-amber-200" />
              Civic intelligence
            </div>
            <h1 className="font-display text-4xl font-black leading-tight md:text-6xl">
              {t("tagline")}
            </h1>
            <p className="max-w-xl text-base text-white/80 md:text-lg">
              UrbanLens blends on-ground reporting, GPT-4o Vision verification, and transparent
              contractor workflows so cities can move from complaint to closure with confidence.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login?preset=citizen"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-900 shadow-xl transition hover:-translate-y-0.5"
              >
                {t("cta_citizen")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login?preset=municipal"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur-xl transition hover:-translate-y-0.5"
              >
                {t("cta_municipal")}
                <ShieldCheck className="h-4 w-4" />
              </Link>
              <Link
                to="/login?preset=contractor"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur-xl transition hover:-translate-y-0.5"
              >
                {t("cta_contractor")}
                <MapPin className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/40 via-fuchsia-500/25 to-accent/35 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur-2xl">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/70">
                    {t("stats_total")}
                  </div>
                  <div className="mt-2 font-display text-3xl font-black">{a1}</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/70">
                    {t("stats_resolved")}
                  </div>
                  <div className="mt-2 font-display text-3xl font-black text-emerald-200">{a2}</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/70">
                    {t("stats_cities")}
                  </div>
                  <div className="mt-2 font-display text-3xl font-black text-amber-200">{a3}</div>
                </div>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <div className="text-xs font-bold text-white/70">Live triage</div>
                  <div className="mt-2 text-sm text-white/85">
                    AI flags uncertain captures under 45% confidence for municipal review.
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <div className="text-xs font-bold text-white/70">Contractor trust</div>
                  <div className="mt-2 text-sm text-white/85">
                    Dual citizen + municipal ratings keep the leaderboard honest.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: t("step_report"),
            icon: Camera,
            tone: "from-primary to-blue-400",
          },
          {
            title: t("step_verify"),
            icon: Cpu,
            tone: "from-fuchsia-600 to-primary",
          },
          {
            title: t("step_fix"),
            icon: ShieldCheck,
            tone: "from-accent to-emerald-300",
          },
        ].map((s, idx) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08 }}
            className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60"
          >
            <div
              className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${s.tone} opacity-40 blur-2xl`}
            />
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <s.icon className="h-6 w-6" />
            </div>
            <div className="mt-4 font-display text-lg font-extrabold text-slate-900 dark:text-white">
              {idx + 1}. {t("how_it_works")}
            </div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{s.title}</div>
          </motion.div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.3em] text-primary">
              {t("leaderboard")}
            </div>
            <h2 className="font-display text-3xl font-black text-slate-900 dark:text-white">
              Top crews on the street
            </h2>
          </div>
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-black text-white shadow-lg"
          >
            {t("leaderboard")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {top.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-300">
              {t("no_data")}
            </div>
          ) : (
            top.map((row, i) => (
              <LeaderboardCard
                key={row.id}
                row={row}
                specialty={specialty[i % specialty.length]}
              />
            ))
          )}
        </div>
      </section>

      <footer className="rounded-3xl border border-white/20 bg-slate-900 px-6 py-10 text-white">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-display text-2xl font-black">{t("app_name")}</div>
            <div className="mt-2 max-w-xl text-sm text-white/75">{t("footer_note")}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { code: "en", label: "English" },
              { code: "kn", label: "ಕನ್ನಡ" },
              { code: "hi", label: "हिन्दी" },
            ].map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code as "en" | "kn" | "hi")}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/90 hover:bg-white/15"
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
