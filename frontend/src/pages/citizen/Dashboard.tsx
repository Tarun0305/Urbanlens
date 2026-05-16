import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import * as L from "leaflet";
import { Camera, Sparkles } from "lucide-react";
import { fetchNotifications, type NotificationItem } from "../../api/notifications";
import { fetchReports, type Report } from "../../api/reports";
import { IssueCard } from "../../components/IssueCard";
import { StatusBadge } from "../../components/StatusBadge";

const pin = L.divIcon({
  className: "bg-transparent",
  html: `<div style="font-size:26px;line-height:1;transform:translate(-50%,-100%)">📍</div>`,
  iconAnchor: [0, 0],
});

export default function CitizenDashboard() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [notes, setNotes] = useState<NotificationItem[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetchReports();
        setReports(r);
      } catch {
        setReports([]);
      }
      try {
        const n = await fetchNotifications();
        setNotes(n.slice(0, 6));
      } catch {
        setNotes([]);
      }
    })();
  }, []);

  const recent = useMemo(() => reports.slice(0, 5), [reports]);
  const pending = reports.filter((r) => r.status !== "done" && r.status !== "rejected").length;
  const done = reports.filter((r) => r.status === "done").length;

  const center = useMemo(() => {
    const withGeo = reports.filter((r) => r.latitude && r.longitude);
    if (withGeo.length === 0) return [12.9716, 77.5946] as [number, number];
    const lat = withGeo.reduce((s, r) => s + (r.latitude || 0), 0) / withGeo.length;
    const lng = withGeo.reduce((s, r) => s + (r.longitude || 0), 0) / withGeo.length;
    return [lat, lng] as [number, number];
  }, [reports]);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-primary/15 via-white/70 to-accent/15 p-8 shadow-xl backdrop-blur-xl dark:from-primary/20 dark:via-slate-950/60 dark:to-accent/15"
      >
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/60 px-3 py-1 text-xs font-black uppercase tracking-widest text-primary dark:bg-slate-950/50">
              <Sparkles className="h-4 w-4" />
              {t("citizen")}
            </div>
            <h1 className="mt-3 font-display text-4xl font-black text-slate-900 dark:text-white">
              {t("welcome")} back
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
              Your neighborhood signal is live. Keep reporting with crisp photos so AI can verify
              faster.
            </p>
          </div>
          <Link
            to="/citizen/report"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-4 text-sm font-black text-white shadow-2xl shadow-primary/30 transition hover:brightness-110"
          >
            <Camera className="h-5 w-5" />
            {t("report_issue")}
          </Link>
        </div>

        <div className="relative mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/20 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/50">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">
              Active
            </div>
            <div className="mt-2 font-display text-4xl font-black text-slate-900 dark:text-white">
              {pending}
            </div>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/50">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">
              {t("done")}
            </div>
            <div className="mt-2 font-display text-4xl font-black text-accent">{done}</div>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/50">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">
              {t("notifications")}
            </div>
            <div className="mt-2 font-display text-4xl font-black text-primary">{notes.length}</div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-black text-slate-900 dark:text-white">
              {t("my_reports")}
            </h2>
            <Link to="/citizen/reports" className="text-sm font-black text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-4">
            {recent.map((r) => (
              <IssueCard key={r.id} report={r} />
            ))}
            {recent.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-300">
                {t("no_data")}
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/20 bg-white/70 p-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
            <div className="font-display text-lg font-black text-slate-900 dark:text-white">
              {t("notifications")}
            </div>
            <div className="mt-3 space-y-3">
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="rounded-2xl border border-slate-100 bg-white/80 p-3 text-sm dark:border-white/10 dark:bg-slate-900/50"
                >
                  <div className="font-bold text-slate-900 dark:text-white">{n.title}</div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{n.message}</div>
                </div>
              ))}
              {notes.length === 0 ? (
                <div className="text-sm text-slate-500">{t("no_data")}</div>
              ) : null}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/70 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
            <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-900 dark:border-white/10 dark:text-white">
              Map of your pins
            </div>
            <div className="h-72">
              <MapContainer center={center} zoom={12} className="h-full w-full" scrollWheelZoom>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {reports
                  .filter((r) => r.latitude && r.longitude)
                  .map((r) => (
                    <Marker
                      key={r.id}
                      position={[r.latitude as number, r.longitude as number]}
                      icon={pin}
                    >
                      <Popup>
                        <div className="text-xs font-bold">{r.title}</div>
                        <StatusBadge status={r.status} />
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
