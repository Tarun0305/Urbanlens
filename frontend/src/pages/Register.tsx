import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { register, UserRole } from "../api/auth";

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialRole = (params.get("role") as UserRole) || "citizen";

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: initialRole,
    language: "en",
    achievements: "",
  });
  const [busy, setBusy] = useState(false);

  const validatePassword = (pass: string) => {
    const hasCapital = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const isLongEnough = pass.length >= 8;
    return hasCapital && hasNumber && hasSymbol && isLongEnough;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(form.password)) {
      toast.error("Password must be at least 8 characters and contain a Capital letter, a Number, and a Special symbol.");
      return;
    }

    setBusy(true);
    try {
      await register(form);
      if (form.role === "municipal") {
        toast.success("Registration successful! Admin approval pending.", { duration: 6000 });
      } else if (form.role === "contractor") {
        toast.success("Registration successful! Municipal Authority approval pending.", { duration: 6000 });
      } else {
        toast.success("Account created successfully! Please login.");
      }
      navigate("/login");
    } catch (err: any) {
      const msg = err.response?.data?.detail || t("error_generic");
      // Specific check for existing user
      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already exists")) {
        toast.error("An account with this email already exists. Please login instead.");
      } else {
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
            {t("register")}
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Joining as <span className="font-bold text-primary uppercase">{form.role}</span>
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Full Name
              </label>
              <input
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none ring-primary/30 focus:ring-4 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Email
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none ring-primary/30 focus:ring-4 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Phone
              </label>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none ring-primary/30 focus:ring-4 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                placeholder="+91..."
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Password
              </label>
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none ring-primary/30 focus:ring-4 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            {form.role === "contractor" && (
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Past Achievements / Experience
                </label>
                <textarea
                  required
                  value={form.achievements}
                  onChange={(e) => setForm({ ...form, achievements: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none ring-primary/30 focus:ring-4 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  placeholder="E.g. Completed 50+ road projects, ISO certified..."
                  rows={3}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/login"
                className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white/50 py-3 text-sm font-black text-slate-500 transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900/50"
              >
                {t("cancel")}
              </Link>
              <button
                type="submit"
                disabled={busy}
                className="rounded-2xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-black text-white shadow-lg shadow-primary/30 transition enabled:hover:brightness-110 disabled:opacity-60"
              >
                {busy ? t("loading") : t("register")}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
