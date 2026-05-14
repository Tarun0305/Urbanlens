import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { login } from "../api/auth";
import { useAuthStore } from "../store/authStore";

const roles = [
  { id: "citizen", label: "Reporter" },
  { id: "municipal", label: "Municipal Authority" },
  { id: "contractor", label: "Contractor" },
  { id: "admin", label: "Admin" },
];

function homeForRole(role: string) {
  if (role === "citizen") return "/citizen/dashboard";
  if (role === "municipal") return "/municipal/dashboard";
  if (role === "contractor") return "/contractor/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/";
}

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [busy, setBusy] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await login(email, password);
      setAuth(data.token, data.user);
      toast.success(`Welcome back, ${data.user.full_name}`);
      navigate(homeForRole(data.user.role), { replace: true });
    } catch (err: any) {
      if (!err.response) {
        toast.error("Cannot reach the server. Please ensure the backend is running on http://127.0.0.1:8000");
      } else {
        const msg = err.response?.data?.detail || t("error_generic");
        toast.error(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70"
      >
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-primary/40 to-accent/30 blur-3xl" />
        <div className="relative">
          <div className="font-display text-3xl font-black text-slate-900 dark:text-white">
            {t("login")}
          </div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Select your role to login or create a new account.
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${
                  role === r.id
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "border border-slate-200 bg-white/50 text-slate-500 hover:border-primary/40 dark:border-white/10 dark:bg-slate-900/50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                {t("email")}
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none ring-primary/30 focus:ring-4 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                autoComplete="email"
                placeholder={`Email for ${roles.find((r) => r.id === role)?.label}`}
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                {t("password")}
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none ring-primary/30 focus:ring-4 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to={`/register?role=${role}`}
                className="flex items-center justify-center rounded-2xl border border-primary/40 bg-white/50 py-3 text-sm font-black text-primary transition hover:bg-primary hover:text-white dark:border-white/10 dark:bg-slate-900/50"
              >
                {t("register")}
              </Link>
              <button
                type="submit"
                disabled={busy}
                className="rounded-2xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-black text-white shadow-lg shadow-primary/30 transition enabled:hover:brightness-110 disabled:opacity-60"
              >
                {busy ? t("loading") : t("login")}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
