import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export function AppLayout() {
  return (
    <div className="min-h-full bg-slate-50 dark:bg-ink">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
