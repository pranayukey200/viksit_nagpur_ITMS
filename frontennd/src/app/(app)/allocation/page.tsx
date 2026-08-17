"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Sparkles,
  RefreshCw,
  ArrowUp,
  ShieldAlert,
  Check,
  Pencil,
  Gauge,
  Target,
  X,
} from "lucide-react";
import {
  Card,
  TierBadge,
  Chip,
  Counter,
  SectionHeader,
  fadeUp,
  stagger,
} from "@/components/ui/primitives";
import { JUNCTIONS } from "@/lib/data";
import { computeAllocation, type Assignment } from "@/lib/optimization";
import { useAppStore } from "@/lib/store";
import { tierFromScore } from "@/lib/utils";

const REASON_PRESETS = [
  "Local knowledge — lower than modelled",
  "Festival / VIP movement anticipated",
  "Officer unavailable / fatigue",
  "Nearby post already covers it",
  "Other (specify)",
];

export default function AllocationPage() {
  const availableOfficers = useAppStore((s) => s.availableOfficers);
  const setAvailableOfficers = useAppStore((s) => s.setAvailableOfficers);
  const optimized = useAppStore((s) => s.optimized);
  const setOptimized = useAppStore((s) => s.setOptimized);
  const incidents = useAppStore((s) => s.incidents);
  const activeFestivalId = useAppStore((s) => s.activeFestivalId);
  const rainMode = useAppStore((s) => s.rainMode);
  const logOverride = useAppStore((s) => s.logOverride);

  const [overrideTarget, setOverrideTarget] = useState<Assignment | null>(null);
  const [reason, setReason] = useState(REASON_PRESETS[0]);
  const [note, setNote] = useState("");
  const [overridden, setOverridden] = useState<Set<string>>(new Set());
  const [solving, setSolving] = useState(false);

  const result = useMemo(
    () =>
      optimized
        ? computeAllocation({
            junctions: JUNCTIONS,
            officers: availableOfficers,
            incidents,
            activeFestivalId,
            rainMode,
          })
        : null,
    [optimized, availableOfficers, incidents, activeFestivalId, rainMode]
  );

  const baselineList = useMemo(
    () => [...JUNCTIONS].sort((a, b) => b.risk - a.risk),
    []
  );

  function runOptimize() {
    setSolving(true);
    setOverridden(new Set());
    setTimeout(() => {
      setOptimized(true);
      setSolving(false);
    }, 700);
  }

  function submitOverride() {
    if (!overrideTarget) return;
    logOverride({
      id: `a-${Date.now()}`,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      user: "Insp. R. Pawar",
      action: "Manual override",
      target: `${overrideTarget.junctionName} (${overrideTarget.assigned} → review)`,
      reason: reason === REASON_PRESETS[4] ? note || "Other" : reason,
      impact: "Logged · feeds model tuning",
    });
    setOverridden((s) => new Set(s).add(overrideTarget.junctionId));
    setOverrideTarget(null);
    setNote("");
    setReason(REASON_PRESETS[0]);
  }

  const list = result?.assignments ?? [];
  const unmanned = result?.unmannedHighRisk ?? [];

  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">The money feature</span>
        <h1 className="m-0 mt-1 text-2xl font-bold tracking-tight text-ink">Constrained Allocation Engine</h1>
        <p className="m-0 mt-1 text-sm text-ink-soft">
          Place limited officers to maximise expected incidents averted — explainable, &lt;5s.
        </p>
      </div>

      {/* Budget control */}
      <Card>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Available officers</span>
              <span className="text-2xl font-bold text-ink">
                <Counter value={availableOfficers} />
              </span>
            </div>
            <input
              type="range"
              min={4}
              max={20}
              step={1}
              value={availableOfficers}
              onChange={(e) => setAvailableOfficers(Number(e.target.value))}
              className="mt-3"
              aria-label="Available officers"
            />
            <div className="mt-1.5 flex justify-between text-[0.65rem] font-semibold text-ink-faint">
              <span>4</span><span>12</span><span>20</span>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="grid grid-cols-2 gap-3">
              <MiniStat
                icon={<Target size={15} />}
                label="High-risk coverage"
                value={result ? `${Math.round(result.coverage * 100)}%` : "—"}
              />
              <MiniStat
                icon={<Gauge size={15} />}
                label="Utilization"
                value={result ? `${Math.round(result.utilization * 100)}%` : "—"}
              />
            </div>
          </div>
          <div className="lg:col-span-3">
            {optimized ? (
              <button onClick={() => setOptimized(false)} className="btn btn-soft w-full justify-center">
                <RefreshCw size={15} /> Reset to baseline
              </button>
            ) : (
              <button onClick={runOptimize} disabled={solving} className="btn-brut btn-brut-accent w-full justify-center disabled:opacity-60">
                <Sparkles size={15} /> {solving ? "Solving…" : "Optimize deployment"}
              </button>
            )}
            {optimized && (
              <p className="mt-2 m-0 text-center text-[0.68rem] text-ink-faint">
                Solved in 0.82s · greedy + local-search
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Assignments */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-7">
          <Card>
            <SectionHeader
              title={optimized ? "Recommended deployment" : "Current (baseline) deployment"}
              subtitle={optimized ? "Ranked by expected incidents averted" : "Press Optimize to compute the plan"}
            />
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-1.5">
              {optimized
                ? list.map((a, i) => (
                    <AssignmentRow
                      key={a.junctionId}
                      index={i + 1}
                      a={a}
                      overridden={overridden.has(a.junctionId)}
                      onOverride={() => setOverrideTarget(a)}
                    />
                  ))
                : baselineList.slice(0, 12).map((j, i) => (
                    <div
                      key={j.id}
                      className="flex items-center gap-3 rounded-xl px-2 py-2.5"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-clay text-xs font-bold text-ink-soft">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{j.name}</span>
                      <Chip>{j.officersAssigned} officer{j.officersAssigned === 1 ? "" : "s"}</Chip>
                      <TierBadge tier={tierFromScore(j.risk)} size="sm" />
                    </div>
                  ))}
            </motion.div>
          </Card>
        </motion.div>

        {/* Right column */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6 lg:col-span-5">
          {/* Unmanned high-risk */}
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-high-tint text-risk-high">
                <ShieldAlert size={18} />
              </span>
              <div>
                <h2 className="m-0 text-sm font-semibold text-ink">Unmanned high-risk</h2>
                <p className="m-0 text-xs text-ink-faint">Critical gaps under current budget</p>
              </div>
            </div>
            {!optimized && (
              <p className="rounded-xl bg-clay-tint px-3 py-3 text-xs text-ink-soft">
                Run the optimizer to compute which high-risk spots remain uncovered with {availableOfficers} officers.
              </p>
            )}
            {optimized && unmanned.length === 0 && (
              <div className="rounded-xl bg-low-tint px-3 py-3 text-center text-xs font-semibold text-risk-low">
                ✓ All high-risk junctions covered
              </div>
            )}
            <div className="space-y-2">
              {unmanned.map((a) => (
                <div key={a.junctionId} className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5">
                  <div>
                    <p className="m-0 text-sm font-semibold text-ink">{a.junctionName}</p>
                    <p className="m-0 text-xs text-ink-faint">{a.reason}</p>
                  </div>
                  <TierBadge tier={a.tier} size="sm" />
                </div>
              ))}
            </div>
          </Card>

          {/* Summary */}
          <Card>
            <h2 className="m-0 text-sm font-semibold text-ink">Impact summary</h2>
            <div className="mt-3 space-y-3">
              {[
                { l: "High-risk coverage", base: 34, rec: result ? Math.round(result.coverage * 100) : 0, good: true },
                { l: "Unmanned blackspots", base: 9, rec: unmanned.length, good: true, invert: true },
                { l: "Predicted incidents", base: 23, rec: result ? Math.round(list.reduce((s, a) => s + (1 - a.predictedAverted) * 10, 0)) : 0, good: true, invert: true },
              ].map((m) => (
                <CompareBar key={m.l} {...m} optimized={optimized} />
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Override modal */}
      <AnimatePresence>
        {overrideTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOverrideTarget(null)}
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
                    <p className="m-0 eyebrow">Override recommendation</p>
                    <h3 className="m-0 mt-1 text-lg font-bold text-ink">{overrideTarget.junctionName}</h3>
                  </div>
                  <button onClick={() => setOverrideTarget(null)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint hover:bg-clay">
                    <X size={17} />
                  </button>
                </div>
                <div className="mt-4">
                  <label className="eyebrow mb-1.5 block">Reason (mandatory)</label>
                  <select value={reason} onChange={(e) => setReason(e.target.value)} className="input">
                    {REASON_PRESETS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                {reason === REASON_PRESETS[4] && (
                  <div className="mt-3">
                    <label className="eyebrow mb-1.5 block">Notes</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      className="input resize-none"
                      placeholder="Explain your decision…"
                    />
                  </div>
                )}
                <p className="mt-3 rounded-lg bg-clay-tint px-3 py-2 text-xs text-ink-soft">
                  This override is logged to the audit trail and feeds future model tuning.
                </p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setOverrideTarget(null)} className="btn btn-soft flex-1 justify-center">
                    Cancel
                  </button>
                  <button onClick={submitOverride} className="btn btn-primary flex-1 justify-center">
                    <Check size={15} /> Log override
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

function AssignmentRow({
  index,
  a,
  overridden,
  onOverride,
}: {
  index: number;
  a: Assignment;
  overridden: boolean;
  onOverride: () => void;
}) {
  const boost = a.assigned - a.baseline;
  return (
    <motion.div
      variants={fadeUp}
      className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 transition-colors hover:bg-clay-tint/50"
    >
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-clay text-xs font-bold text-ink-soft">
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-ink">{a.junctionName}</span>
          {a.blackspot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-risk-high" />}
        </div>
        <p className="m-0 truncate text-xs text-ink-faint">{a.reason}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {overridden ? (
          <Chip tone="brand">Overridden</Chip>
        ) : boost > 0 ? (
          <span className="flex items-center gap-1 chip bg-low-tint text-risk-low">
            <ArrowUp size={12} /> {a.assigned}
          </span>
        ) : (
          <span className="chip bg-clay text-ink-soft">{a.assigned}</span>
        )}
        <TierBadge tier={a.tier} size="sm" />
        <button
          onClick={onOverride}
          aria-label="Override"
          className="grid h-7 w-7 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-clay hover:text-brand"
        >
          <Pencil size={13} />
        </button>
      </div>
    </motion.div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-clay-tint px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-brand">{icon}<span className="eyebrow m-0">{label}</span></div>
      <p className="m-0 mt-1 text-xl font-bold text-ink">{value}</p>
    </div>
  );
}

function CompareBar({
  l,
  base,
  rec,
  good,
  optimized,
  invert,
}: {
  l: string;
  base: number;
  rec: number;
  good?: boolean;
  optimized: boolean;
  invert?: boolean;
}) {
  const max = Math.max(base, rec, 1);
  const better = invert ? rec <= base : rec >= base;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-ink-soft">{l}</span>
        <span className={`font-bold ${optimized && better ? "text-risk-low" : optimized ? "text-risk-high" : "text-ink-faint"}`}>
          {optimized ? `${base} → ${rec}` : "—"}
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-12 text-[0.6rem] text-ink-faint">Base</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-clay">
            <div className="h-full rounded-full bg-ink-faint" style={{ width: `${(base / max) * 100}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-12 text-[0.6rem] text-ink-faint">Opt.</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-clay">
            {optimized && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(rec / max) * 100}%` }}
                transition={{ duration: 0.7 }}
                className={`h-full rounded-full ${good ? "bg-brand" : "bg-risk-low"}`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
