import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { fetchContractorReviews } from "../../api/reviews";
import { fetchUsers, approveUser, type User } from "../../api/users";

export default function ContractorBoard() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<User[]>([]);
  const [tab, setTab] = useState<"active" | "pending">("active");
  const [open, setOpen] = useState<User | null>(null);
  const [reviews, setReviews] = useState<
    Awaited<ReturnType<typeof fetchContractorReviews>>
  >([]);

  const load = async () => {
    try {
      const data = await fetchUsers({ role: "contractor" });
      setRows(data);
    } catch {
      setRows([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!open) return;
    void (async () => {
      try {
        const r = await fetchContractorReviews(open.id);
        setReviews(r);
      } catch {
        setReviews([]);
      }
    })();
  }, [open]);

  const approve = async (e: React.MouseEvent, u: User) => {
    e.stopPropagation();
    try {
      await approveUser(u.id);
      toast.success("Contractor approved");
      await load();
    } catch {
      toast.error(t("error_generic"));
    }
  };

  const filtered = rows.filter(r => tab === "active" ? r.is_approved : !r.is_approved);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-black text-slate-900 dark:text-white">
          {t("contractor_board")}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Manage and approve contractors for urban projects.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("active")}
          className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest ${
            tab === "active"
              ? "bg-primary text-white"
              : "border border-slate-200 bg-white/70 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setTab("pending")}
          className={`relative rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest ${
            tab === "pending"
              ? "bg-primary text-white"
              : "border border-slate-200 bg-white/70 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          }`}
        >
          Pending
          {rows.filter(r => !r.is_approved).length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white">
              {rows.filter(r => !r.is_approved).length}
            </span>
          )}
        </button>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/20 bg-white/70 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                className="cursor-pointer border-t border-slate-100 hover:bg-primary/5 dark:border-white/5"
                onClick={() => setOpen(r)}
              >
                <td className="px-4 py-3 font-bold">{r.full_name}</td>
                <td className="px-4 py-3">★ {r.rating.toFixed(1)}</td>
                <td className="px-4 py-3">{r.phone}</td>
                <td className="px-4 py-3">
                  {tab === "pending" ? (
                    <button
                      onClick={(e) => void approve(e, r)}
                      className="rounded-full bg-success px-3 py-1 text-xs font-black text-white shadow-lg shadow-success/30"
                    >
                      Approve
                    </button>
                  ) : (
                    <span className="text-xs font-black text-primary uppercase">View Profile</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No {tab} contractors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase text-primary">Profile</div>
                  <div className="mt-1 font-display text-2xl font-black text-slate-900 dark:text-white">
                    {open.full_name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black dark:bg-white/10 dark:text-white"
                >
                  {t("close")}
                </button>
              </div>

              {open.achievements && (
                <div className="mt-6 rounded-2xl bg-primary/5 p-4 border border-primary/10">
                  <div className="text-xs font-black uppercase text-primary">Achievements & Experience</div>
                  <div className="mt-1 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                    {open.achievements}
                  </div>
                </div>
              )}
              <div className="mt-4 space-y-3">
                {reviews.map((rv: { id: string; reviewer_role: string; rating: number; comment: string; created_at: string }) => (
                  <div
                    key={rv.id}
                    className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-white/10 dark:bg-slate-900/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-black uppercase text-slate-500">
                        {rv.reviewer_role}
                      </div>
                      <div className="text-sm font-black text-warning">★ {rv.rating}</div>
                    </div>
                    <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                      {rv.comment || "—"}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      {new Date(rv.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
                {reviews.length === 0 ? (
                  <div className="text-sm text-slate-500">{t("no_data")}</div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
