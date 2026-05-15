import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { fetchProgress } from "../../api/progress";
import { fetchReports, mediaUrl, type Report } from "../../api/reports";
import { postReview } from "../../api/reviews";
import { StatusBadge } from "../../components/StatusBadge";
import { ProgressCard } from "../../components/ProgressCard";
import { RatingStars } from "../../components/RatingStars";

export default function MyReports() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const focus = Number(params.get("focus") || "0");

  const [reports, setReports] = useState<Report[]>([]);
  const [status, setStatus] = useState<string>("");
  const [selected, setSelected] = useState<Report | null>(null);
  const [progress, setProgress] = useState<Awaited<ReturnType<typeof fetchProgress>>>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);

  const load = async () => {
    try {
      const data = await fetchReports(
        status ? { status } : undefined
      );
      setReports(data);
      if (focus && !selected) {
        const hit = data.find((r: Report) => r.id === focus);
        if (hit) {
          setSelected(hit);
        }
      }
    } catch {
      setReports([]);
    }
  };

  useEffect(() => {
    void load();
  }, [status, focus]);

  useEffect(() => {
    if (!selected) return;
    void (async () => {
      try {
        const p = await fetchProgress(selected.id);
        setProgress(p);
      } catch {
        setProgress([]);
      }
    })();
  }, [selected]);

  const filtered = useMemo(() => reports, [reports]);

  const timeline = (r: Report) => {
    const steps = ["pending", "ai_verified", "assigned", "in_progress", "done"] as const;
    const idx = (s: string) => steps.indexOf(s as (typeof steps)[number]);
    const cur = idx(r.status) >= 0 ? idx(r.status) : 0;
    return { steps, cur };
  };

  const submitReview = async () => {
    if (!selected?.assigned_contractor_id) return;
    setReviewBusy(true);
    try {
      await postReview({
        report_id: selected.id,
        reviewee_id: selected.assigned_contractor_id,
        rating,
        comment,
      });
      toast.success("Thanks for rating");
      setSelected(null);
      await load();
    } catch {
      toast.error(t("error_generic"));
    } finally {
      setReviewBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl font-black text-slate-900 dark:text-white">
            {t("my_reports")}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Track verification, assignment, contractor updates, and closure.
          </p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold dark:border-white/10 dark:bg-slate-950 dark:text-white"
        >
          <option value="">All statuses</option>
          <option value="pending">pending</option>
          <option value="ai_verified">ai_verified</option>
          <option value="assigned">assigned</option>
          <option value="in_progress">in_progress</option>
          <option value="done">done</option>
          <option value="rejected">rejected</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filtered.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setSelected(r)}
            className="rounded-[2rem] border border-white/20 bg-white/70 p-5 text-left shadow-lg backdrop-blur-xl transition hover:-translate-y-1 dark:border-white/10 dark:bg-slate-950/60"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-primary">
                  #{r.id} · {r.category}
                </div>
                <div className="mt-1 font-display text-xl font-black text-slate-900 dark:text-white">
                  {r.title}
                </div>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">{r.area || r.address}</div>
          </button>
        ))}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-300">
            {t("no_data")}
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {selected ? (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 md:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-primary">
                    #{selected.id}
                  </div>
                  <div className="mt-2 font-display text-2xl font-black text-slate-900 dark:text-white">
                    {selected.title}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black dark:bg-white/10 dark:text-white"
                >
                  {t("close")}
                </button>
              </div>

              <div className="mt-4">
                <StatusBadge status={selected.status} />
              </div>

              <div className="mt-6">
                <div className="text-sm font-black uppercase tracking-widest text-slate-500">
                  Timeline
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {timeline(selected).steps.map((s, i) => (
                    <div
                      key={s}
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                        i <= timeline(selected).cur
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"
                      }`}
                    >
                      {s.replaceAll("_", " ")}
                    </div>
                  ))}
                </div>
              </div>

              {selected.contractor_name ? (
                <div className="mt-6 rounded-2xl border border-white/20 bg-gradient-to-br from-primary/10 to-accent/10 p-4 dark:border-white/10">
                  <div className="text-xs font-black uppercase text-slate-500">{t("contractor")}</div>
                  <div className="mt-1 font-display text-xl font-black text-slate-900 dark:text-white">
                    {selected.contractor_name}
                  </div>
                  <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Rating: {selected.contractor_rating?.toFixed(1) ?? "—"}
                  </div>
                </div>
              ) : null}

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm dark:border-white/10 dark:bg-slate-900/40">
                  <div className="font-black text-slate-500">{t("start_date")}</div>
                  <div className="mt-1 font-bold text-slate-900 dark:text-white">
                    {selected.work_start_date
                      ? new Date(selected.work_start_date).toLocaleString()
                      : "—"}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm dark:border-white/10 dark:bg-slate-900/40">
                  <div className="font-black text-slate-500">{t("end_date")}</div>
                  <div className="mt-1 font-bold text-slate-900 dark:text-white">
                    {selected.work_end_date
                      ? new Date(selected.work_end_date).toLocaleString()
                      : "—"}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm md:col-span-2 dark:border-white/10 dark:bg-slate-900/40">
                  <div className="font-black text-slate-500">{t("estimated_cost")}</div>
                  <div className="mt-1 font-bold text-slate-900 dark:text-white">
                    {selected.estimated_cost != null ? `₹ ${selected.estimated_cost}` : "—"}
                  </div>
                </div>
              </div>

              {selected.image_url ? (
                <img
                  src={mediaUrl(selected.image_url)}
                  alt=""
                  className="mt-6 max-h-80 w-full rounded-2xl object-cover"
                />
              ) : null}

              <div className="mt-6">
                <div className="font-display text-lg font-black text-slate-900 dark:text-white">
                  {t("progress")}
                </div>
                <div className="mt-3 space-y-3">
                  {progress.map((p) => (
                    <ProgressCard key={p.id} p={p} />
                  ))}
                  {progress.length === 0 ? (
                    <div className="text-sm text-slate-500">{t("no_data")}</div>
                  ) : null}
                </div>
              </div>

              {selected.status === "done" && selected.assigned_contractor_id ? (
                <div className="mt-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <div className="font-black text-emerald-900 dark:text-emerald-100">
                    Rate the contractor
                  </div>
                  <div className="mt-3">
                    <RatingStars value={rating} onChange={setRating} />
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="mt-3 w-full rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-sm dark:border-emerald-500/30 dark:bg-slate-950 dark:text-white"
                    placeholder={t("comment")}
                  />
                  <button
                    type="button"
                    disabled={reviewBusy}
                    onClick={() => void submitReview()}
                    className="mt-3 w-full rounded-2xl bg-emerald-700 py-3 text-sm font-black text-white disabled:opacity-50"
                  >
                    {reviewBusy ? t("loading") : t("submit")}
                  </button>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
