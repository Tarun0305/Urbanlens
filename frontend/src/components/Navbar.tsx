import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Building2,
  HardHat,
  LayoutDashboard,
  LogOut,
  MapPin,
  Moon,
  Shield,
  Sun,
  UserRound,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";
import { NotificationBell } from "./NotificationBell";

export function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const language = useUiStore((s) => s.language);
  const setLanguage = useUiStore((s) => s.setLanguage);

  const links: { to: string; label: string }[] = [];
  if (user?.role === "citizen") {
    links.push(
      { to: "/citizen/dashboard", label: t("dashboard") },
      { to: "/citizen/report", label: t("report_issue") },
      { to: "/citizen/reports", label: t("my_reports") }
    );
  } else if (user?.role === "municipal") {
    links.push(
      { to: "/municipal/dashboard", label: t("dashboard") },
      { to: "/municipal/issues", label: t("issue_list") },
      { to: "/municipal/contractors", label: t("contractor_board") }
    );
  } else if (user?.role === "contractor") {
    links.push(
      { to: "/contractor/dashboard", label: t("dashboard") },
      { to: "/contractor/tasks", label: t("assigned") },
      { to: "/contractor/progress", label: t("post_progress") }
    );
  } else if (user?.role === "admin") {
    links.push(
      { to: "/admin/dashboard", label: t("dashboard") },
      { to: "/admin/users", label: t("user_manager") }
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30">
            <MapPin className="h-5 w-5" />
          </span>
          <div>
            <div className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t("app_name")}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t("tagline")}
            </div>
          </div>
        </Link>

        <nav className="ml-auto hidden flex-1 items-center justify-center gap-2 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-primary/10 hover:text-primary dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/leaderboard"
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-accent/10 hover:text-accent dark:text-slate-200"
          >
            {t("leaderboard")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "kn" | "hi")}
            className="rounded-full border border-slate-200 bg-white/80 px-2 py-1 text-xs font-semibold text-slate-800 shadow-sm dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100"
            aria-label={t("language")}
          >
            <option value="en">English</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="hi">हिन्दी</option>
          </select>

          <button
            type="button"
            onClick={() => toggleTheme()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-800 shadow-sm transition hover:scale-105 dark:border-white/10 dark:bg-slate-900/80 dark:text-amber-200"
            aria-label={theme === "dark" ? t("theme_light") : t("theme_dark")}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user ? <NotificationBell /> : null}

          {user ? (
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-2 py-1 pr-3 shadow-sm dark:border-white/10 dark:bg-slate-900/80 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white">
                <UserRound className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <div className="max-w-[140px] truncate font-bold text-slate-900 dark:text-white">
                  {user.full_name}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  {user.role === "citizen" ? <UserRound className="h-3 w-3" /> : null}
                  {user.role === "municipal" ? <Building2 className="h-3 w-3" /> : null}
                  {user.role === "contractor" ? <HardHat className="h-3 w-3" /> : null}
                  {user.role === "admin" ? <Shield className="h-3 w-3" /> : null}
                  {t(user.role)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                aria-label={t("logout")}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/30 transition hover:brightness-110"
            >
              <LayoutDashboard className="h-4 w-4" />
              {t("login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
