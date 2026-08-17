"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrafficCone, Zap, Timer, Ambulance, ArrowRight } from "lucide-react";
import { Card, Toggle, Counter, Chip, fadeUp, stagger } from "@/components/ui/primitives";
import { JUNCTIONS } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import Link from "next/link";

export default function SignalsPage() {
  const smartSignals = useAppStore((s) => s.smartSignals);
  const toggleSmartSignals = useAppStore((s) => s.toggleSmartSignals);

  const signalized = useMemo(() => JUNCTIONS.filter((j) => j.signalized).slice(0, 6), []);
  const avgCurrent = Math.round(
    signalized.reduce((s, j) => s + j.signal.currentDelay, 0) / signalized.length
  );
  const avgRec = Math.round(
    signalized.reduce((s, j) => s + j.signal.recommendedDelay, 0) / signalized.length
  );
  const reduction = Math.round((1 - avgRec / avgCurrent) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">Adaptive control</span>
          <h1 className="m-0 mt-1 text-2xl font-bold tracking-tight text-ink">Smart Signals</h1>
          <p className="m-0 mt-1 text-sm text-ink-soft">
            Density-aware green splits recomputed every cycle from CV queue lengths.
          </p>
        </div>
      </div>

      {/* Master toggle */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-tint text-brand">
              <TrafficCone size={22} />
            </span>
            <div>
              <p className="m-0 text-sm font-bold text-ink">Smart Signals mode</p>
              <p className="m-0 text-xs text-ink-soft">
                {smartSignals ? "Live · adapting green splits from CV density" : "Off · signals on fixed timing"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Chip tone={smartSignals ? "low" : "neutral"}>
              {smartSignals ? "Active" : "Standby"}
            </Chip>
            <Toggle checked={smartSignals} onChange={() => toggleSmartSignals()} label="Smart signals" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat icon={<Timer size={16} />} label="Avg delay · fixed" value={`${avgCurrent}s`} />
          <Stat
            icon={<Zap size={16} />}
            label="Avg delay · smart"
            value={`${avgRec}s`}
            highlight={smartSignals}
          />
          <Stat
            icon={<Zap size={16} />}
            label="Reduction"
            value={`-${reduction}%`}
            highlight={smartSignals}
          />
        </div>
      </Card>

      {/* Junction cards */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {signalized.map((j) => {
          const cur = Math.round(j.signal.currentSplit * 100);
          const rec = Math.round(j.signal.recommendedSplit * 100);
          return (
            <motion.div key={j.id} variants={fadeUp}>
              <Card hover>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="m-0 text-sm font-bold text-ink">{j.name}</p>
                    <p className="m-0 text-xs text-ink-faint">{j.zone} · {j.density} veh/min</p>
                  </div>
                  {smartSignals && <Chip tone="low">Optimized</Chip>}
                </div>

                {/* split diagram */}
                <div className="mt-4 space-y-2.5">
                  <SplitRow label="Green split · current" value={cur} color="bg-ink-faint" dim={!smartSignals} />
                  <SplitRow
                    label="Green split · smart"
                    value={rec}
                    color="bg-brand"
                    dim={!smartSignals}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-clay-tint px-3 py-2.5">
                  <span className="text-xs font-medium text-ink-soft">Avg delay</span>
                  <span className="text-sm font-bold text-ink">
                    {smartSignals ? (
                      <>
                        <span className="text-ink-faint line-through">{j.signal.currentDelay}s</span>{" "}
                        <span className="text-risk-low">{j.signal.recommendedDelay}s</span>
                      </>
                    ) : (
                      `${j.signal.currentDelay}s`
                    )}
                  </span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Green corridor CTA */}
      <Card className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-high-tint/60 to-transparent">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-high-tint text-risk-high">
            <Ambulance size={20} />
          </span>
          <div>
            <p className="m-0 text-sm font-bold text-ink">Ambulance green-wave</p>
            <p className="m-0 text-xs text-ink-soft">
              When CV detects an ambulance, signals override to green along the route.
            </p>
          </div>
        </div>
        <Link href="/incidents" className="btn btn-soft">
          Manage corridors <ArrowRight size={14} />
        </Link>
      </Card>

      <p className="text-center text-xs text-ink-faint">
        Total delay across {signalized.length} demo junctions ·{" "}
        <Counter value={avgCurrent * signalized.length} /> →{" "}
        <span className="font-semibold text-risk-low">
          <Counter value={avgRec * signalized.length} />
        </span>{" "}
        seconds/cycle
      </p>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl px-4 py-3 ${highlight ? "bg-low-tint" : "bg-clay-tint"}`}>
      <div className={`flex items-center gap-1.5 ${highlight ? "text-risk-low" : "text-ink-faint"}`}>
        {icon}
        <span className="eyebrow m-0">{label}</span>
      </div>
      <p className={`m-0 mt-1 text-2xl font-bold ${highlight ? "text-risk-low" : "text-ink"}`}>{value}</p>
    </div>
  );
}

function SplitRow({
  label,
  value,
  color,
  dim,
}: {
  label: string;
  value: number;
  color: string;
  dim?: boolean;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[0.68rem] font-medium text-ink-soft">
        <span>{label}</span>
        <span className={dim ? "text-ink-faint" : "text-ink"}>{value}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-clay">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: dim ? `${value * 0.4}%` : `${value}%` }}
          transition={{ duration: 0.7 }}
          className={`h-full rounded-full ${dim ? "bg-ink-faint/50" : color}`}
        />
      </div>
    </div>
  );
}
