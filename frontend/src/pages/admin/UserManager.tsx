import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  createUser,
  deactivateUser,
  fetchUsers,
  updateUser,
  type User,
} from "../../api/users";
import type { UserRole } from "../../api/auth";

type Tab = "citizen" | "municipal" | "contractor";

export default function UserManager() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("citizen");
  const [rows, setRows] = useState<User[]>([]);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "password123",
    role: "citizen" as UserRole,
    language: "en",
  });

  const load = async () => {
    try {
      const data = await fetchUsers({ role: tab });
      setRows(data);
    } catch {
      toast.error(t("error_generic"));
    }
  };

  useEffect(() => {
    void load();
  }, [tab]);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter(
      (u) =>
        u.full_name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        u.phone.toLowerCase().includes(s)
    );
  }, [rows, q]);

  const saveCreate = async () => {
    try {
      await createUser({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
        language: form.language,
      });
      toast.success("User created");
      setModal(null);
      await load();
    } catch {
      toast.error(t("error_generic"));
    }
  };

  const saveEdit = async () => {
    if (!editUser) return;
    try {
      await updateUser(editUser.id, {
        full_name: editUser.full_name,
        role: editUser.role,
        language: editUser.language,
        is_active: editUser.is_active,
      });
      toast.success("Updated");
      setModal(null);
      setEditUser(null);
      await load();
    } catch {
      toast.error(t("error_generic"));
    }
  };

  const deactivate = async (u: User) => {
    try {
      await deactivateUser(u.id);
      toast.success("User deactivated");
      await load();
    } catch {
      toast.error(t("error_generic"));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-black text-slate-900 dark:text-white">
          {t("user_manager")}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Municipal officers transfer every five years — update roles here to keep access aligned
          with the org chart.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["citizen", "municipal", "contractor"] as Tab[]).map((x) => (
          <button
            key={x}
            type="button"
            onClick={() => setTab(x)}
            className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest ${
              tab === x
                ? "bg-gradient-to-r from-primary to-accent text-white"
                : "border border-slate-200 bg-white/70 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
            }`}
          >
            {x}
          </button>
        ))}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search")}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="button"
            onClick={() => {
              setForm({
                full_name: "",
                email: "",
                phone: "",
                password: "password123",
                role: tab,
                language: "en",
              });
              setModal("create");
            }}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-black text-white dark:bg-white dark:text-slate-900"
          >
            Add user
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/20 bg-white/70 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-slate-100 dark:border-white/5">
                <td className="px-4 py-3 font-bold">{u.full_name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.phone}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">{u.is_active ? t("active") : t("inactive")}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary"
                      onClick={() => {
                        setEditUser(u);
                        setModal("edit");
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-danger/10 px-3 py-1 text-xs font-black text-danger"
                      onClick={() => void deactivate(u)}
                    >
                      Deactivate
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {modal === "create" ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-[2rem] border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95"
            >
              <div className="font-display text-2xl font-black text-slate-900 dark:text-white">
                Add user
              </div>
              <div className="mt-4 grid gap-3">
                <input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Full name"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
                />
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
                />
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
                />
                <input
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Password"
                  type="password"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
                />
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
                >
                  <option value="citizen">citizen</option>
                  <option value="municipal">municipal</option>
                  <option value="contractor">contractor</option>
                  <option value="admin">admin</option>
                </select>
                <select
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
                >
                  <option value="en">en</option>
                  <option value="kn">kn</option>
                  <option value="hi">hi</option>
                </select>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-black dark:border-white/10 dark:bg-slate-950 dark:text-white"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={() => void saveCreate()}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-black text-white"
                >
                  {t("save")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}

        {modal === "edit" && editUser ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setModal(null);
              setEditUser(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-[2rem] border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95"
            >
              <div className="font-display text-2xl font-black text-slate-900 dark:text-white">
                Edit user
              </div>
              <div className="mt-4 grid gap-3">
                <input
                  value={editUser.full_name}
                  onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
                />
                <select
                  value={editUser.role}
                  onChange={(e) =>
                    setEditUser({ ...editUser, role: e.target.value as UserRole })
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
                >
                  <option value="citizen">citizen</option>
                  <option value="municipal">municipal</option>
                  <option value="contractor">contractor</option>
                  <option value="admin">admin</option>
                </select>
                <select
                  value={editUser.language}
                  onChange={(e) => setEditUser({ ...editUser, language: e.target.value })}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
                >
                  <option value="en">en</option>
                  <option value="kn">kn</option>
                  <option value="hi">hi</option>
                </select>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={editUser.is_active}
                    onChange={(e) => setEditUser({ ...editUser, is_active: e.target.checked })}
                  />
                  {t("active")}
                </label>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModal(null);
                    setEditUser(null);
                  }}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-black dark:border-white/10 dark:bg-slate-950 dark:text-white"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={() => void saveEdit()}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-black text-white"
                >
                  {t("save")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
