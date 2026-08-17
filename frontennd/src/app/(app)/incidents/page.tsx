"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Siren,
  Droplets,
  CalendarHeart,
  Ambulance,
  Wrench,
  X,
  ShieldAlert,
  Navigation,
  Radio,
  TrafficCone,
  CheckCircle2,
} from "lucide-react";
import { Card, TierBadge, Chip, fadeUp, stagger } from "@/components/ui/primitives";
import { JUNCTIONS, getJunction } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import type { Incident, IncidentType, RiskTier } from "@/lib/types";

const TYPE_META: Record<IncidentType, { label: string; icon: typeof Siren; tone: string }> = {
  accident: { label: "Accident", icon: Siren, tone: "text-risk-high bg-high-tint" },
  waterlogging: { label: "Waterlogging", icon: Droplets, tone: "text-water bg-water-tint" },
  festival: { label: "Festival Surge", icon: CalendarHeart, tone: "text-risk-med bg-med-tint" },
  ambulance: { label: "Ambulance Alert", icon: Ambulance, tone: "text-brand bg-brand-tint" },
  breakdown: { label: "Breakdown", icon: Wrench, tone: "text-ink-soft bg-clay" },
  traffic: { label: "Heavy Traffic", icon: TrafficCone, tone: "text-risk-med bg-med-tint" },
};

export default function IncidentsPage() {
  const incidents = useAppStore((s) => s.incidents);
  const injectIncident = useAppStore((s) => s.injectIncident);
  const resolveIncident = useAppStore((s) => s.resolveIncident);
  const ambulance = useAppStore((s) => s.ambulance);
  const triggerAmbulance = useAppStore((s) => s.triggerAmbulance);
  const clearAmbulance = useAppStore((s) => s.clearAmbulance);

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<IncidentType>("accident");
  const [junctionId, setJunctionId] = useState("sitabuldi");
  const [severity, setSeverity] = useState<RiskTier>("high");

  const active = incidents.filter((i) => i.status === "active");

  const redeploy = useMemo(() => {
    if (active.length === 0) return null;
    const inc = active[0];
    const donor = [...JUNCTIONS]
      .filter((j) => j.manned)
      .sort((a, b) => a.risk - b.risk)[0];
    const cascade = JUNCTIONS.filter(
      (j) => j.id !== inc.junctionId && j.zone === getJunction(inc.junctionId)?.zone
    ).slice(0, 2);
    return { donor, cascade, inc };
  }, [active]);

  function submit() {
    const j = getJunction(junctionId)!;
    const inc: Incident = {
      id: `inc-${Date.now()}`,
      type,
      junctionId,
      junctionName: j.name,
      severity,
      status: "active",
      time: "just now",
      note:
        type === "accident"
          ? "Collision reported — spillover expected on adjacent arms. Re-optimizing coverage."
          : type === "waterlogging"
            ? "CV waterlogging confirmed — slick surface, reduced visibility on approach."
            : type === "festival"
              ? "Crowd density surge detected via CV — perimeter reinforcement advised."
              : type === "ambulance"
                ? "Ambulance passage detected — clearing green corridor."
                : "Vehicle breakdown blocking one arm — queue forming.",
    };
    injectIncident(inc);
    setOpen(false);
  }

  const corridorStations = [
    getJunction(ambulance.fromId),
    getJunction("variety"),
    getJunction(ambulance.toId),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">Dynamic response</span>
          <h1 className="m-0 mt-1 text-2xl font-bold tracking-tight text-ink">Incident Console</h1>
          <p className="m-0 mt-1 text-sm text-ink-soft">
            Inject incidents, watch cascade + auto-redeployment, and clear ambulance corridors.
          </p>
        </div>
        <button onClick={() => setOpen(true)} className="btn btn-primary">
          <Plus size={15} /> Simulate incident
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Incident list */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-7">
          <Card className="h-full">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="m-0 text-sm font-semibold text-ink">Active incidents</h2>
              <Chip tone="high">{active.length} active</Chip>
            </div>
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
              {active.length === 0 && (
                <div className="grid place-items-center rounded-xl bg-low-tint py-10 text-center">
                  <CheckCircle2 className="text-risk-low" size={30} />
                  <p className="mt-2 m-0 text-sm font-semibold text-ink">No active incidents</p>
                  <p className="m-0 text-xs text-ink-soft">Inject one to see live redeployment.</p>
                </div>
              )}
              {active.map((inc) => {
                const meta = TYPE_META[inc.type];
                const Icon = meta.icon;
                return (
                  <motion.div
                    layout
                    variants={fadeUp}
                    key={inc.id}
                    className="rounded-xl border border-line p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${meta.tone}`}>
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-ink">{meta.label}</span>
                          <span className="text-sm text-ink-soft">· {inc.junctionName}</span>
                          <TierBadge tier={inc.severity} size="sm" />
                        </div>
                        <p className="m-0 mt-1.5 text-xs leading-relaxed text-ink-soft">{inc.note}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[0.7rem] font-medium text-risk-low">
                            <Navigation size={11} /> Re-optimized · redeploy suggested
                          </span>
                          <button
                            onClick={() => resolveIncident(inc.id)}
                            className="text-xs font-semibold text-brand hover:underline"
                          >
                            Resolve
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </Card>
        </motion.div>

        {/* Ambulance corridor */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-5">
          <Card className="h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-high-tint text-risk-high">
                  <Ambulance size={18} />
                </span>
                <div>
                  <h2 className="m-0 text-sm font-semibold text-ink">Ambulance Corridor</h2>
                  <p className="m-0 text-xs text-ink-faint">CV detects → green-wave signals</p>
                </div>
              </div>
            </div>

            {!ambulance.active ? (
              <div className="mt-4">
                <p className="rounded-xl bg-clay-tint px-3 py-3 text-xs text-ink-soft">
                  No active ambulance passage. Trigger a corridor to override signals to green
                  along the route and alert officers.
                </p>
                <button
                  onClick={() => triggerAmbulance("itwari", "medical")}
                  className="btn-brut btn-brut-accent mt-3 w-full justify-center"
                >
                  <Ambulance size={15} /> Trigger green corridor
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4"
              >
                <div className="rounded-xl border border-risk-high/30 bg-high-tint/50 p-4">
                  <p className="m-0 text-xs font-bold text-risk-high">
                    🚑 Ambulance detected · Itwari → Medical Square
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    {corridorStations.map((st, i) => (
                      <div key={st?.id} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center">
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-risk-low text-white">
                            <TrafficCone size={15} />
                          </span>
                          <span className="mt-1.5 max-w-[64px] text-center text-[0.6rem] font-semibold leading-tight text-ink">
                            {st?.name.split(" ")[0]}
                          </span>
                        </div>
                        {i < corridorStations.length - 1 && (
                          <div className="mx-1 h-1 flex-1 rounded-full bg-risk-low" />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="m-0 mt-3 text-center text-[0.7rem] font-medium text-risk-low">
                    Signals green along path · ETA saved ~4.5 min
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-brand-tint px-3 py-2.5">
                  <Radio size={15} className="text-brand" />
                  <span className="text-xs font-semibold text-brand">
                    Officer alert sent: clear right lane at Medical Square
                  </span>
                </div>
                <button onClick={clearAmbulance} className="btn btn-soft mt-3 w-full justify-center">
                  Clear corridor
                </button>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Redeploy delta */}
      {redeploy && (
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-tint text-brand">
                <ShieldAlert size={18} />
              </span>
              <div>
                <h2 className="m-0 text-sm font-semibold text-ink">Redeployment delta</h2>
                <p className="m-0 text-xs text-ink-faint">
                  Auto-suggested moves after “{redeploy.inc.junctionName}” incident
                </p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-brand/20 bg-brand-tint/40 p-4">
                <p className="m-0 eyebrow text-brand">Move officer</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="chip bg-surface text-ink-soft">{redeploy.donor?.name}</span>
                  <Navigation size={15} className="text-brand" />
                  <span className="chip bg-brand text-white">{getJunction(redeploy.inc.junctionId)?.name}</span>
                </div>
                <p className="m-0 mt-2 text-xs text-ink-soft">
                  Donor is lowest-risk manned post · ETA 3–4 min · coverage impact minimal
                </p>
              </div>
              <div className="rounded-xl border border-line bg-clay-tint/40 p-4">
                <p className="m-0 eyebrow">Cascade watch (zone spillover)</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {redeploy.cascade.map((j) => (
                    <span key={j.id} className="chip bg-surface text-ink-soft">
                      {j.name.split(" ")[0]} ↑
                    </span>
                  ))}
                  <span className="chip bg-high-tint text-risk-high">risk boosted +18%</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Inject modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2"
            >
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="m-0 eyebrow">Inject</p>
                    <h3 className="m-0 mt-1 text-lg font-bold text-ink">Simulate incident</h3>
                  </div>
                  <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint hover:bg-clay">
                    <X size={17} />
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="eyebrow mb-1.5 block">Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(TYPE_META) as IncidentType[]).map((t) => {
                        const Icon = TYPE_META[t].icon;
                        return (
                          <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[0.65rem] font-semibold transition-colors ${
                              type === t ? "border-brand bg-brand-tint text-brand" : "border-line text-ink-soft hover:bg-clay-tint"
                            }`}
                          >
                            <Icon size={16} /> {TYPE_META[t].label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="eyebrow mb-1.5 block">Location</label>
                    <select value={junctionId} onChange={(e) => setJunctionId(e.target.value)} className="input">
                      {JUNCTIONS.map((j) => (
                        <option key={j.id} value={j.id}>{j.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="eyebrow mb-1.5 block">Severity</label>
                    <div className="flex gap-2">
                      {(["low", "medium", "high"] as RiskTier[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setSeverity(s)}
                          className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition-colors ${
                            severity === s ? "border-brand bg-brand-tint text-brand" : "border-line text-ink-soft hover:bg-clay-tint"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button onClick={() => setOpen(false)} className="btn btn-soft flex-1 justify-center">Cancel</button>
                  <button onClick={submit} className="btn btn-primary flex-1 justify-center">
                    <Siren size={15} /> Inject
                  </button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
