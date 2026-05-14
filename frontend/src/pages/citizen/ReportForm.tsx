import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { Mic, UploadCloud } from "lucide-react";
import { AIResultCard } from "../../components/AIResultCard";
import { createReport, uploadReportImage } from "../../api/reports";
import { reverseGeocode, type GeoTagResult } from "../../utils/geotag";

const pin = L.divIcon({
  className: "bg-transparent",
  html: `<div style="font-size:30px;line-height:1;transform:translate(-50%,-100%)">📍</div>`,
  iconAnchor: [0, 0],
});

function DraggableMarker({
  position,
  onDragEnd,
}: {
  position: [number, number];
  onDragEnd: (lat: number, lng: number) => void;
}) {
  return (
    <Marker
      draggable
      position={position}
      icon={pin}
      eventHandlers={{
        dragend: (e) => {
          const p = e.target.getLatLng();
          onDragEnd(p.lat, p.lng);
        },
      }}
    />
  );
}

function LocateClick({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function ReportForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [geo, setGeo] = useState<GeoTagResult | null>(null);
  const [latLng, setLatLng] = useState<[number, number]>([12.9716, 77.5946]);

  const [category, setCategory] = useState<"pothole" | "garbage" | "streetlight" | "other">(
    "pothole"
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [aiOk, setAiOk] = useState<boolean | null>(null);
  const [aiConfidence, setAiConfidence] = useState(0);
  const [aiReason, setAiReason] = useState("");
  const [aiCategory, setAiCategory] = useState<string | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [needsReview, setNeedsReview] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [submitBusy, setSubmitBusy] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);

  const [speechActive, setSpeechActive] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const center = useMemo(() => latLng, [latLng]);

  const applyReverse = useCallback(async (lat: number, lng: number) => {
    try {
      const g = await reverseGeocode(lat, lng);
      setGeo(g);
      setLatLng([lat, lng]);
    } catch {
      toast.error(t("error_generic"));
    }
  }, [t]);

  useEffect(() => {
    void (async () => {
      try {
        const { getBrowserLocation } = await import("../../utils/geotag");
        const { lat, lng } = await getBrowserLocation();
        await applyReverse(lat, lng);
      } catch {
        toast("GPS unavailable — tap the map to drop a pin.");
      }
    })();
  }, [applyReverse]);

  const onDetect = async () => {
    try {
      const { getBrowserLocation } = await import("../../utils/geotag");
      const { lat, lng } = await getBrowserLocation();
      await applyReverse(lat, lng);
      toast.success("Location updated");
    } catch {
      toast.error("Unable to read GPS");
    }
  };

  const startSpeech = () => {
    const W = window as unknown as {
      webkitSpeechRecognition?: new () => any;
      SpeechRecognition?: new () => any;
    };
    const Ctor = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!Ctor) {
      toast.error(t("speech_unsupported"));
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (ev: any) => {
      const text = ev.results[0]?.[0]?.transcript || "";
      setDescription((d) => (d ? `${d}\n${text}` : text));
      setSpeechActive(false);
    };
    rec.onerror = () => {
      setSpeechActive(false);
      toast.error(t("error_generic"));
    };
    rec.onend = () => setSpeechActive(false);
    setSpeechActive(true);
    rec.start();
  };

  const toggleRecorder = async () => {
    if (recRef.current) {
      recRef.current.stop();
      recRef.current = null;
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Recording not supported");
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    chunksRef.current = [];
    mr.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data);
    };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      stream.getTracks().forEach((tr) => tr.stop());
    };
    mr.start();
    recRef.current = mr;
    toast.success("Recording… tap again to stop");
  };

  const onPickImage = async (file: File | null) => {
    if (!file) return;
    setImageFile(file);
    setUploadBusy(true);
    setAiOk(null);
    try {
      const res = await uploadReportImage(file, category);
      setImageUrl(res.image_url);
      setAiOk(true);
      setAiConfidence(res.ai_confidence);
      setAiReason(res.ai_result);
      setAiCategory(res.category_detected);
      setNeedsReview(res.needs_review);
      if (res.geotag?.latitude && res.geotag?.longitude) {
        await applyReverse(res.geotag.latitude, res.geotag.longitude);
      }
      if (!title) {
        setTitle(`${category.toUpperCase()} near ${geo?.area || "reported location"}`);
      }
      toast.success("Image verified");
    } catch (e: unknown) {
      setAiOk(false);
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        t("error_generic");
      setAiReason(String(msg));
      toast.error(String(msg));
    } finally {
      setUploadBusy(false);
    }
  };

  const canSubmit = Boolean(imageUrl) && aiOk === true && title.trim().length > 0;

  const submit = async () => {
    if (!canSubmit || !imageUrl) return;
    setSubmitBusy(true);
    try {
      const rep = await createReport({
        title,
        description,
        category,
        latitude: geo?.lat ?? latLng[0],
        longitude: geo?.lng ?? latLng[1],
        address: geo?.address,
        area: geo?.area,
        road_name: geo?.road_name,
        cross_street: geo?.cross_street,
        image_url: imageUrl,
        video_url: null,
        severity,
        ai_verified: true,
        ai_confidence: aiConfidence,
        ai_result: aiReason,
      });
      setCreatedId(rep.id);
      confetti({ particleCount: 140, spread: 75, origin: { y: 0.35 } });
      toast.success(t("success_report"));
    } catch {
      toast.error(t("error_generic"));
    } finally {
      setSubmitBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest ${
              step === s
                ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                : "border border-slate-200 bg-white/70 text-slate-700 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-200"
            }`}
          >
            {s}.{" "}
            {s === 1
              ? t("location")
              : s === 2
                ? t("category")
                : s === 3
                  ? "Media"
                  : t("details")}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="s1"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="grid gap-6 lg:grid-cols-2"
          >
            <div className="space-y-4 rounded-[2rem] border border-white/20 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
              <div className="flex items-center justify-between gap-3">
                <div className="font-display text-2xl font-black text-slate-900 dark:text-white">
                  {t("location")}
                </div>
                <button
                  type="button"
                  onClick={() => void onDetect()}
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-black text-white dark:bg-white dark:text-slate-900"
                >
                  Re-detect GPS
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-xs font-black uppercase text-slate-500">Latitude</label>
                <input
                  value={latLng[0]}
                  onChange={(e) => setLatLng([Number(e.target.value), latLng[1]])}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
                />
                <label className="text-xs font-black uppercase text-slate-500">Longitude</label>
                <input
                  value={latLng[1]}
                  onChange={(e) => setLatLng([latLng[0], Number(e.target.value)])}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-200">
                <div className="font-bold">Address</div>
                <div className="mt-1">{geo?.address || "—"}</div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-black uppercase text-slate-500">Area</div>
                    <input
                      value={geo?.area || ""}
                      onChange={(e) =>
                        setGeo((g) =>
                          g
                            ? { ...g, area: e.target.value }
                            : {
                                lat: latLng[0],
                                lng: latLng[1],
                                address: "",
                                area: e.target.value,
                                road_name: "",
                                cross_street: "",
                              }
                        )
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-slate-500">Road</div>
                    <input
                      value={geo?.road_name || ""}
                      onChange={(e) =>
                        setGeo((g) =>
                          g
                            ? { ...g, road_name: e.target.value }
                            : {
                                lat: latLng[0],
                                lng: latLng[1],
                                address: "",
                                area: "",
                                road_name: e.target.value,
                                cross_street: "",
                              }
                        )
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs font-black uppercase text-slate-500">Cross street</div>
                    <input
                      value={geo?.cross_street || ""}
                      onChange={(e) =>
                        setGeo((g) =>
                          g
                            ? { ...g, cross_street: e.target.value }
                            : {
                                lat: latLng[0],
                                lng: latLng[1],
                                address: "",
                                area: "",
                                road_name: "",
                                cross_street: e.target.value,
                              }
                        )
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full rounded-2xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-black text-white"
              >
                {t("submit")}
              </button>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/20 bg-white/70 shadow-xl dark:border-white/10 dark:bg-slate-950/60">
              <div className="h-[420px]">
                <MapContainer center={center} zoom={14} className="h-full w-full" scrollWheelZoom>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocateClick
                    onPick={(la, ln) => {
                      void applyReverse(la, ln);
                    }}
                  />
                  <DraggableMarker
                    position={latLng}
                    onDragEnd={(la, ln) => {
                      void applyReverse(la, ln);
                    }}
                  />
                </MapContainer>
              </div>
              <div className="p-3 text-xs text-slate-500 dark:text-slate-300">
                Tap map to move the pin. Drag marker for fine adjustments.
              </div>
            </div>
          </motion.div>
        ) : null}

        {step === 2 ? (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="grid gap-4 md:grid-cols-2"
          >
            {(
              [
                { id: "pothole", emoji: "🕳️", label: "Pothole" },
                { id: "garbage", emoji: "🗑️", label: "Garbage" },
                { id: "streetlight", emoji: "💡", label: "Streetlight" },
                { id: "other", emoji: "❓", label: "Other" },
              ] as const
            ).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`rounded-[2rem] border p-6 text-left shadow-lg transition ${
                  category === c.id
                    ? "border-primary bg-primary/10 ring-4 ring-primary/20"
                    : "border-white/20 bg-white/70 hover:-translate-y-1 dark:border-white/10 dark:bg-slate-950/60"
                }`}
              >
                <div className="text-4xl">{c.emoji}</div>
                <div className="mt-3 font-display text-xl font-black text-slate-900 dark:text-white">
                  {c.label}
                </div>
              </button>
            ))}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-900"
              >
                Continue
              </button>
            </div>
          </motion.div>
        ) : null}

        {step === 3 ? (
          <motion.div
            key="s3"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="space-y-4 rounded-[2rem] border border-white/20 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60"
          >
            <div className="font-display text-2xl font-black text-slate-900 dark:text-white">
              Media & AI
            </div>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-[2rem] border border-dashed border-primary/40 bg-primary/5 px-6 py-14 text-center hover:bg-primary/10">
              <UploadCloud className="h-10 w-10 text-primary" />
              <div className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">
                Drag & drop a photo, or click to browse
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void onPickImage(e.target.files?.[0] || null)}
              />
            </label>
            {uploadBusy ? (
              <div className="text-sm font-bold text-primary">{t("loading")}</div>
            ) : null}
            {imageFile ? (
              <div className="text-xs font-bold text-slate-600">
                Selected: {imageFile.name}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void toggleRecorder()}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              >
                <Mic className="h-4 w-4 text-danger" />
                Voice note
              </button>
              <button
                type="button"
                onClick={() => void startSpeech()}
                disabled={speechActive}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-900 disabled:opacity-60 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              >
                {speechActive ? t("recording") : `🎤 ${t("speak_description")}`}
              </button>
            </div>
            {audioUrl ? <audio controls src={audioUrl} className="w-full" /> : null}

            {aiOk !== null ? (
              <AIResultCard
                ok={aiOk}
                confidence={aiConfidence}
                category={aiCategory}
                reason={aiReason}
              />
            ) : null}
            {needsReview ? (
              <div className="rounded-2xl border border-warning/30 bg-warning/10 p-3 text-sm font-bold text-warning">
                Flagged for review: confidence under threshold. You can still submit if AI
                accepted the image.
              </div>
            ) : null}

            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black dark:border-white/10 dark:bg-slate-950 dark:text-white"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                disabled={!aiOk}
                onClick={() => setStep(4)}
                className="rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-black text-white disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </motion.div>
        ) : null}

        {step === 4 ? (
          <motion.div
            key="s4"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="space-y-4 rounded-[2rem] border border-white/20 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60"
          >
            <div className="font-display text-2xl font-black text-slate-900 dark:text-white">
              {t("details")}
            </div>
            <div>
              <label className="text-xs font-black uppercase text-slate-500">{t("title")}</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold dark:border-white/10 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase text-slate-500">
                {t("description")}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-slate-500">Severity</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["low", "medium", "high"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeverity(s)}
                    className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest ${
                      severity === s
                        ? "bg-accent text-white"
                        : "border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {createdId ? (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
                {t("success_report")} — {t("report_id")}: <span className="font-black">#{createdId}</span>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/citizen/reports")}
                    className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-black text-white"
                  >
                    {t("my_reports")}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/citizen/dashboard")}
                    className="rounded-xl border border-emerald-700 px-4 py-2 text-xs font-black text-emerald-900 dark:text-emerald-100"
                  >
                    {t("dashboard")}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={!canSubmit || submitBusy}
                onClick={() => void submit()}
                className="w-full rounded-2xl bg-gradient-to-r from-primary via-fuchsia-600 to-accent py-4 text-sm font-black text-white shadow-2xl disabled:opacity-40"
              >
                {submitBusy ? t("loading") : t("submit")}
              </button>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
