import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { login } from "../api/auth";
import { useAuthStore } from "../store/authStore";

const presets: Record<string, { email: string }> = {
  citizen: { email: "tarun.citizen@test.com" },
  municipal: { email: "tarun.municipal@test.com" },
  contractor: { email: "tarun.contractor@test.com" },
  admin: { email: "tarun.admin@test.com" },
};

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
  const [params] = useSearchParams();
  const preset = params.get("preset") || "";
  const initialEmail = useMemo(() => presets[preset]?.email || "", [preset]);

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("password123");
  const [busy, setBusy] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await login(email, password);
      setAuth(data.token, data.user);
      toast.success(`Welcome back, ${data.user.full_name}`);
      navigate(homeForRole(data.user.role), { replace: true });
    } catch {
      toast.error(t("error_generic"));
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
            Role is detected automatically from your account.
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
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-black text-white shadow-lg shadow-primary/30 transition enabled:hover:brightness-110 disabled:opacity-60"
            >
              {busy ? t("loading") : t("login")}
            </button>
          </form>

          <div className="mt-6 grid grid-cols-2 gap-2">
            {Object.keys(presets).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setEmail(presets[k].email)}
                className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs font-extrabold text-slate-800 hover:border-primary/40 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100"
              >
                Use {k} demo
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
