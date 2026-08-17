"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  TrafficCone,
  RefreshCw,
  AlertTriangle,
  Droplets,
  CameraOff,
  Siren,
  MapPin,
  Layers,
} from "lucide-react";
import { TierBadge, Chip, ContributionBar, RiskGauge } from "@/components/ui/primitives";
import type { Horizon } from "@/components/map/RiskMap";
import { JUNCTIONS, getJunction } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { tierFromScore } from "@/lib/utils";

const RiskMap = dynamic(() => import("@/components/map/RiskMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-canvas text-sm text-ink-faint">
      Loading live map…
    </div>
  ),
});

const HORIZONS: { key: Horizon; label: string }[] = [
  { key: "now", label: "Now" },
  { key: "t30", label: "+30" },
  { key: "t60", label: "+60" },
  { key: "t120", label: "+120" },
];

const FILTERS = [
  { k: "all", l: "All", icon: MapPin },
  { k: "unmanned", l: "Unmanned", icon: AlertTriangle },
  { k: "blackspot", l: "Blackspot", icon: Siren },
  { k: "waterlog", l: "Flooded", icon: Droplets },
  { k: "camera", l: "Cam gap", icon: CameraOff },
];

export default function HeatmapPage() {
  const router = useRouter();
  const selectedId = useAppStore((s) => s.selectedJunctionId);
  const selectJunction = useAppStore((s) => s.selectJunction);
  const [horizon, setHorizon] = useState<Horizon>("now");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const j = params.get("j");
    if (j && getJunction(j)) selectJunction(j);
  }, [selectJunction]);

  const selected = selectedId ? getJunction(selectedId) : undefined;

  const filteredList = useMemo(() => {
    let list = [...JUNCTIONS].sort((a, b) => b.risk - a.risk);
    if (filter === "unmanned") list = list.filter((j) => !j.manned && tierFromScore(j.risk) === "high");
    else if (filter === "blackspot") list = list.filter((j) => j.blackspot);
    else if (filter === "waterlog") list = list.filter((j) => j.waterlogged);
    else if (filter === "camera") list = list.filter((j) => !j.hasCamera);
    return list.slice(0, 14);
  }, [filter]);

  return (
    <div className="full-map -mx-4 sm:-mx-6 -my-6 sm:-my-8">
      <div className="relative h-[calc(100dvh-3.6rem)]">
        {/* Map */}
        <div className="absolute inset-0">
          <RiskMap height="100%" horizon={horizon} />
        </div>

        {/* Top control bar */}
        <div className="absolute inset-x-3 top-3 z-[1000] sm:inset-x-4">
          <div className="glass flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-white/50 px-3 py-2 shadow-[0_10px_34px_-12px_rgba(16,24,40,0.35)]">
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-brand" />
              <span className="text-xs font-bold text-ink">Live Risk</span>
            </div>
            <span className="hidden h-5 w-px bg-line sm:block" />
            {/* horizon segmented */}
            <div className="flex items-center gap-0.5 rounded-xl bg-canvas p-0.5">
              {HORIZONS.map((h) => (
                <button
                  key={h.key}
                  onClick={() => setHorizon(h.key)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                    horizon === h.key ? "bg-ink text-white shadow" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
            <span className="hidden h-5 w-px bg-line sm:block" />
            {/* legend */}
            <div className="hidden items-center gap-2.5 md:flex">
              {[
                { c: "#c62828", l: "High" },
                { c: "#ef8a00", l: "Med" },
                { c: "#2e7d32", l: "Low" },
              ].map((i) => (
                <span key={i.l} className="flex items-center gap-1 text-[0.68rem] font-semibold text-ink-soft">
                  <span className="h-2 w-2 rounded-full" style={{ background: i.c }} />
                  {i.l}
                </span>
              ))}
            </div>
            {/* filters */}
            <div className="ml-auto flex flex-wrap items-center gap-1">
              {FILTERS.map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.k}
                    onClick={() => setFilter(f.k)}
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-[0.68rem] font-bold transition-colors ${
                      filter === f.k ? "bg-brand text-white" : "bg-canvas text-ink-soft hover:text-ink"
                    }`}
                  >
                    <Icon size={11} /> {f.l}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Floating right panel */}
        <div className="absolute bottom-3 right-3 top-[64px] z-[1000] w-[330px] max-w-[calc(100vw-1.5rem)] sm:right-4">
          <div className="glass flex h-full flex-col overflow-hidden rounded-2xl border border-white/50 shadow-[0_10px_34px_-12px_rgba(16,24,40,0.35)]">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3 }}
                  className="flex h-full flex-col overflow-y-auto p-4"
                >
                  <DetailInner horizon={horizon} onBack={() => selectJunction(null)} router={router} />
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-full flex-col overflow-hidden p-4"
                >
                  <h2 className="m-0 text-sm font-bold text-ink">
                    {filter === "all" ? "Top risk junctions" : "Filtered"}
                  </h2>
                  <p className="m-0 mt-0.5 text-xs text-ink-faint">Tap a marker to inspect</p>
                  <div className="-mr-1 mt-3 flex-1 space-y-1 overflow-y-auto pr-1">
                    {filteredList.map((j, i) => (
                      <button
                        key={j.id}
                        onClick={() => selectJunction(j.id)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-canvas"
                      >
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-canvas text-[0.65rem] font-bold text-ink-soft">
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold text-ink">{j.name}</span>
                          <span className="block truncate text-[0.68rem] text-ink-faint">{j.factors[0]?.label}</span>
                        </span>
                        {!j.manned && tierFromScore(j.risk) === "high" && (
                          <Chip tone="high">Unmanned</Chip>
                        )}
                        <TierBadge tier={tierFromScore(j.risk)} size="sm" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailInner({
  horizon,
  onBack,
  router,
}: {
  horizon: Horizon;
  onBack: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const selectedId = useAppStore((s) => s.selectedJunctionId);
  const j = selectedId ? getJunction(selectedId) : undefined;
  if (!j) return null;
  const risk = horizon === "now" ? j.risk : j.predicted[horizon];
  const tier = tierFromScore(risk);

  return (
    <>
      <button
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-ink-faint hover:text-ink"
      >
        <ArrowLeft size={13} /> Back to list
      </button>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="m-0 text-base font-bold tracking-tight text-ink">{j.name}</h2>
          <p className="m-0 text-xs text-ink-faint">{j.nameMr} · {j.zone}</p>
        </div>
        <TierBadge tier={tier} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {j.blackspot && <Chip tone="high">Blackspot</Chip>}
        {j.waterlogged && <Chip tone="water">Flooded</Chip>}
        {!j.hasCamera && <Chip tone="med">Cam gap</Chip>}
        {j.manned ? <Chip tone="low">Manned · {j.officersAssigned}</Chip> : <Chip tone="high">Unmanned</Chip>}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <RiskGauge value={risk} size={104} />
        <div>
          <p className="m-0 eyebrow">Confidence</p>
          <p className="m-0 mt-0.5 text-xl font-bold text-ink">{Math.round(j.confidence * 100)}%</p>
          <p className="m-0 mt-0.5 text-[0.68rem] text-ink-faint">
            {j.confidence < 0.82 ? "Low · rule-based" : "Model + context"}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {(["t30", "t60", "t120"] as ("t30" | "t60" | "t120")[]).map((h) => (
          <div key={h} className="rounded-lg bg-canvas px-1 py-1.5 text-center">
            <p className="m-0 text-[0.58rem] font-bold uppercase text-ink-faint">+{h.slice(1)}m</p>
            <p className="m-0 text-sm font-bold text-ink">{Math.round(j.predicted[h] * 100)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <p className="m-0 eyebrow">Why this score (SHAP)</p>
        <div className="mt-2 space-y-2">
          {j.factors.slice(0, 4).map((f) => (
            <ContributionBar key={f.label} label={f.label} weight={f.weight} tone={f.tone} />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="m-0 eyebrow">CV violations / 5 min</p>
        <div className="mt-2 grid grid-cols-5 gap-1">
          {[
            { k: "noHelmet", l: "No-H" },
            { k: "tripleRide", l: "Tri" },
            { k: "wrongWay", l: "Wrong" },
            { k: "redLight", l: "Red" },
            { k: "illegalPark", l: "Park" },
          ].map((v) => (
            <div key={v.k} className="rounded-md bg-canvas py-1 text-center">
              <p className="m-0 text-xs font-bold text-ink">
                {j.violations[v.k as keyof typeof j.violations]}
              </p>
              <p className="m-0 text-[0.52rem] font-medium text-ink-faint">{v.l}</p>
            </div>
          ))}
        </div>
      </div>

      {j.signalized && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-line px-3 py-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
            <TrafficCone size={13} className="text-brand" /> Delay
          </span>
          <span className="text-xs font-bold text-ink">
            <span className="text-ink-faint line-through">{j.signal.currentDelay}s</span>{" "}
            <span className="text-risk-low">{j.signal.recommendedDelay}s</span>
          </span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between rounded-xl bg-canvas px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
          <Users size={13} /> Officers
        </span>
        <span className="text-xs font-bold text-ink">
          {j.officersAssigned} → {j.recommendedOfficers}
        </span>
      </div>

      <button
        onClick={() => router.push("/allocation")}
        className="btn-brut btn-brut-accent mt-3 w-full justify-center"
      >
        <RefreshCw size={14} /> Re-optimise
      </button>
    </>
  );
}
