import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { fetchReports, type Report } from "../../api/reports";
import { postProgress } from "../../api/progress";

export default function ProgressUpload() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Report[]>([]);
  const [reportId, setReportId] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [workers, setWorkers] = useState("3");
  const [money, setMoney] = useState("0");
  const [photo, setPhoto] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetchReports();
        setTasks(r.filter((x: Report) => x.status === "assigned" || x.status === "in_progress"));
      } catch {
        setTasks([]);
      }
    })();
  }, []);

  const photoPreview = useMemo(() => (photo ? URL.createObjectURL(photo) : ""), [photo]);
  const videoPreview = useMemo(() => (video ? URL.createObjectURL(video) : ""), [video]);

  const submit = async () => {
    if (reportId === "") return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("report_id", String(reportId));
      form.append("note", note);
      form.append("workers_today", workers || "0");
      form.append("money_spent", money || "0");
      if (photo) form.append("photo", photo);
      if (video) form.append("video", video);
      await postProgress(form);
      toast.success("Progress posted");
      setNote("");
      setPhoto(null);
      setVideo(null);
    } catch {
      toast.error(t("error_generic"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-4xl font-black text-slate-900 dark:text-white">
        {t("post_progress")}
      </h1>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 rounded-[2rem] border border-white/20 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60"
      >
        <div>
          <label className="text-xs font-black uppercase text-slate-500">Task</label>
          <select
            value={reportId === "" ? "" : String(reportId)}
            onChange={(e) => setReportId(e.target.value ? Number(e.target.value) : "")}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold dark:border-white/10 dark:bg-slate-950 dark:text-white"
          >
            <option value="">Select report</option>
            {tasks.map((r) => (
              <option key={r.id} value={r.id}>
                #{r.id} — {r.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-black uppercase text-slate-500">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs font-black uppercase text-slate-500">Workers today</label>
            <input
              value={workers}
              onChange={(e) => setWorkers(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase text-slate-500">Money spent</label>
            <input
              value={money}
              onChange={(e) => setMoney(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-xs font-black uppercase text-slate-500">Photo</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="mt-2 w-full text-sm"
            />
            {photoPreview ? (
              <img src={photoPreview} alt="" className="mt-3 max-h-48 w-full rounded-2xl object-cover" />
            ) : null}
          </div>
          <div>
            <div className="text-xs font-black uppercase text-slate-500">Video</div>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideo(e.target.files?.[0] || null)}
              className="mt-2 w-full text-sm"
            />
            {videoPreview ? (
              <video src={videoPreview} controls className="mt-3 max-h-48 w-full rounded-2xl" />
            ) : null}
          </div>
        </div>
        <button
          type="button"
          disabled={busy || reportId === ""}
          onClick={() => void submit()}
          className="w-full rounded-2xl bg-gradient-to-r from-primary to-accent py-4 text-sm font-black text-white disabled:opacity-40"
        >
          {busy ? t("loading") : t("submit")}
        </button>
      </motion.div>
    </div>
  );
}
