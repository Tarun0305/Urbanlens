import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { assignReport, fetchReports, markReportDone, mediaUrl, type Report } from "../../api/reports";
import { fetchUsers, type User } from "../../api/users";
import { StatusBadge } from "../../components/StatusBadge";
import { RatingStars } from "../../components/RatingStars";
import { postReview } from "../../api/reviews";

export default function IssueList() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Report[]>([]);
  const [contractors, setContractors] = useState<User[]>([]);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<Report | null>(null);

  const [contractorId, setContractorId] = useState<number | "">("");
  const [estimated, setEstimated] = useState("");
  const [workforce, setWorkforce] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [muniRating, setMuniRating] = useState(5);
  const [muniComment, setMuniComment] = useState("");

  const load = async () => {
    try {
      const data = await fetchReports();
      setRows(data);
      const users = await fetchUsers({ role: "contractor" });
      setContractors(users);
    } catch {
      toast.error(t("error_generic"));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (category && r.category !== category) return false;
      if (status && r.status !== status) return false;
      if (severity && r.severity !== severity) return false;
      if (from) {
        const d = new Date(r.created_at).getTime();
        if (d < new Date(from).getTime()) return false;
      }
      if (to) {
        const d = new Date(r.created_at).getTime();
        if (d > new Date(to).getTime() + 86400000) return false;
      }
      return ["ai_verified", "assigned", "in_progress", "done", "pending"].includes(r.status);
    });
  }, [rows, category, status, severity, from, to]);

  const assign = async () => {
    if (!selected || contractorId === "") return;
    try {
      await assignReport(selected.id, {
        contractor_id: Number(contractorId),
        estimated_cost: estimated ? Number(estimated) : null,
        workforce_count: workforce ? Number(workforce) : null,
        work_start_date: start ? new Date(start).toISOString() : null,
        work_end_date: end ? new Date(end).toISOString() : null,
      });
      toast.success("Assigned");
      setSelected(null);
      await load();
    } catch {
      toast.error(t("error_generic"));
    }
  };

  const done = async () => {
    if (!selected) return;
    try {
      await markReportDone(selected.id);
      toast.success("Marked done");
      setSelected(null);
      await load();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        t("error_generic");
      toast.error(String(msg));
    }
  };

  const reviewContractor = async () => {
    if (!selected?.assigned_contractor_id) return;
    try {
      await postReview({
        report_id: selected.id,
        reviewee_id: selected.assigned_contractor_id,
        rating: muniRating,
        comment: muniComment,
      });
      toast.success("Review submitted");
      setMuniComment("");
      await load();
    } catch {
      toast.error(t("error_generic"));
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-[2rem] border border-white/20 bg-white/70 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold dark:border-white/10 dark:bg-slate-950 dark:text-white"
            >
              <option value="">All categories</option>
              <option value="pothole">pothole</option>
              <option value="garbage">garbage</option>
              <option value="streetlight">streetlight</option>
              <option value="other">other</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold dark:border-white/10 dark:bg-slate-950 dark:text-white"
            >
              <option value="">All statuses</option>
              <option value="pending">pending</option>
              <option value="ai_verified">ai_verified</option>
              <option value="assigned">assigned</option>
              <option value="in_progress">in_progress</option>
              <option value="done">done</option>
            </select>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold dark:border-white/10 dark:bg-slate-950 dark:text-white"
            >
              <option value="">All severity</option>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-white/20 bg-white/70 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-white dark:bg-slate-950">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Reporter</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer border-t border-slate-100 hover:bg-primary/5 dark:border-white/5"
                  onClick={() => {
                    setSelected(r);
                    setContractorId(r.assigned_contractor_id || "");
                    setEstimated(r.estimated_cost != null ? String(r.estimated_cost) : "");
                    setWorkforce(r.workforce_count != null ? String(r.workforce_count) : "");
                    setStart(
                      r.work_start_date ? String(r.work_start_date).slice(0, 10) : ""
                    );
                    setEnd(r.work_end_date ? String(r.work_end_date).slice(0, 10) : "");
                  }}
                >
                  <td className="px-4 py-3 font-black text-primary">#{r.id}</td>
                  <td className="px-4 py-3 font-bold">{r.category}</td>
                  <td className="px-4 py-3">{r.area || "—"}</td>
                  <td className="px-4 py-3">{r.citizen_name || r.citizen_id}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selected ? (
          <motion.aside
            key={selected.id}
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 space-y-4 rounded-[2rem] border border-white/20 bg-white/80 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase text-primary">#{selected.id}</div>
                  <div className="mt-1 font-display text-xl font-black text-slate-900 dark:text-white">
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

              <div className="text-sm text-slate-600 dark:text-slate-300">{selected.description}</div>
              <StatusBadge status={selected.status} />

              {selected.image_url ? (
                <img
                  src={mediaUrl(selected.image_url)}
                  alt=""
                  className="max-h-56 w-full rounded-2xl object-cover"
                />
              ) : null}

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-200">
                <div className="font-black text-slate-500">AI</div>
                <div className="mt-1 font-bold">Confidence: {selected.ai_confidence}</div>
                <div className="mt-1">{selected.ai_result}</div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-500">
                  Contractor
                </label>
                <select
                  value={contractorId === "" ? "" : String(contractorId)}
                  onChange={(e) => setContractorId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold dark:border-white/10 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">Select contractor</option>
                  {contractors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} — ★ {c.rating.toFixed(1)}
                    </option>
                  ))}
                </select>
                <input
                  value={estimated}
                  onChange={(e) => setEstimated(e.target.value)}
                  placeholder="Estimated cost (₹)"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
                />
                <input
                  value={workforce}
                  onChange={(e) => setWorkforce(e.target.value)}
                  placeholder={t("workforce")}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-2 py-2 text-xs dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  />
                  <input
                    type="date"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-2 py-2 text-xs dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void assign()}
                  className="w-full rounded-2xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-black text-white"
                >
                  {t("assign_task")}
                </button>
              </div>

              {selected.status === "in_progress" ? (
                <button
                  type="button"
                  onClick={() => void done()}
                  className="w-full rounded-2xl bg-emerald-700 py-3 text-sm font-black text-white"
                >
                  {t("mark_done")}
                </button>
              ) : null}

              {selected.status === "done" && selected.assigned_contractor_id ? (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <div className="text-xs font-black uppercase text-emerald-900 dark:text-emerald-100">
                    Municipal review
                  </div>
                  <div className="mt-2">
                    <RatingStars value={muniRating} onChange={setMuniRating} />
                  </div>
                  <textarea
                    value={muniComment}
                    onChange={(e) => setMuniComment(e.target.value)}
                    rows={3}
                    className="mt-2 w-full rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-sm dark:border-emerald-500/30 dark:bg-slate-950 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => void reviewContractor()}
                    className="mt-2 w-full rounded-2xl bg-emerald-800 py-2 text-xs font-black text-white"
                  >
                    Submit municipal rating
                  </button>
                </div>
              ) : null}
            </div>
          </motion.aside>
        ) : (
          <div className="hidden rounded-[2rem] border border-dashed border-slate-300 p-8 text-sm text-slate-500 lg:block dark:border-white/10 dark:text-slate-300">
            Select an issue to open the assignment panel.
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
