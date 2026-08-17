"use client";

import { motion } from "framer-motion";
import { TrendingUp, ShieldCheck, Timer, Users, Gauge, Target, Download } from "lucide-react";
import { Card, StatTile, Chip, fadeUp, stagger } from "@/components/ui/primitives";
import { BASELINE_METRICS, RECOMMENDED_METRICS } from "@/lib/data";

const METRICS = [
  { key: "coverage", label: "High-risk coverage", base: BASELINE_METRICS.highRiskCoverage * 100, rec: RECOMMENDED_METRICS.highRiskCoverage * 100, suffix: "%", max: 100, good: "up" },
  { key: "response", label: "Avg response time", base: BASELINE_METRICS.responseTimeMin, rec: RECOMMENDED_METRICS.responseTimeMin, suffix: "m", max: 14, good: "down" },
  { key: "delay", label: "Avg intersection delay", base: BASELINE_METRICS.avgDelay, rec: RECOMMENDED_METRICS.avgDelay, suffix: "s", max: 48, good: "down" },
  { key: "util", label: "Officer utilization", base: BASELINE_METRICS.utilization * 100, rec: RECOMMENDED_METRICS.utilization * 100, suffix: "%", max: 100, good: "up" },
  { key: "unmanned", label: "Unmanned blackspots", base: BASELINE_METRICS.unmannedBlackspots, rec: RECOMMENDED_METRICS.unmannedBlackspots, suffix: "", max: 12, good: "down" },
  { key: "incidents", label: "Predicted incidents", base: BASELINE_METRICS.predictedIncidents, rec: RECOMMENDED_METRICS.predictedIncidents, suffix: "", max: 26, good: "down" },
] as const;

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">Proof of impact</span>
          <h1 className="m-0 mt-1 text-2xl font-bold tracking-tight text-ink">Impact Analytics</h1>
          <p className="m-0 mt-1 text-sm text-ink-soft">
            Static (experience-based) vs recommended (data-driven) deployment.
          </p>
        </div>
        <button className="btn btn-soft">
          <Download size={15} /> Export report
        </button>
      </div>

      {/* Headline stats */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="High-risk coverage" value={RECOMMENDED_METRICS.highRiskCoverage * 100} unit="%" delta="+38% vs static" icon={<ShieldCheck size={18} />} />
        <StatTile label="Response time" value={RECOMMENDED_METRICS.responseTimeMin} unit="min" decimals={1} delta="−40% faster" deltaTone="good" icon={<Timer size={18} />} />
        <StatTile label="Avg delay" value={RECOMMENDED_METRICS.avgDelay} unit="s" delta="−34% smart signals" deltaTone="good" icon={<Gauge size={18} />} />
        <StatTile label="Unmanned blackspots" value={RECOMMENDED_METRICS.unmannedBlackspots} delta="−5 vs baseline" deltaTone="good" icon={<Target size={18} />} />
      </motion.div>

      {/* Comparison */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="m-0 text-sm font-semibold text-ink">Baseline vs Recommended</h2>
              <p className="m-0 text-xs text-ink-faint">Per-metric comparison across the city</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-ink-soft"><span className="h-2.5 w-2.5 rounded-full bg-ink-faint" /> Baseline</span>
              <span className="flex items-center gap-1.5 text-ink-soft"><span className="h-2.5 w-2.5 rounded-full bg-brand" /> Recommended</span>
            </div>
          </div>

          <div className="space-y-5">
            {METRICS.map((m) => {
              const better = m.good === "up" ? m.rec >= m.base : m.rec <= m.base;
              const deltaPct = Math.round(Math.abs((m.rec - m.base) / m.base) * 100);
              return (
                <div key={m.key}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">{m.label}</span>
                    <Chip tone={better ? "low" : "high"}>
                      <TrendingUp size={12} className={m.good === "down" ? "rotate-90" : ""} />
                      {deltaPct}% {better ? "better" : "worse"}
                    </Chip>
                  </div>
                  <div className="space-y-1.5">
                    <Bar value={m.base} max={m.max} suffix={m.suffix} color="bg-ink-faint/60" />
                    <Bar value={m.rec} max={m.max} suffix={m.suffix} color="bg-brand" delay />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Summary */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <Card className="bg-gradient-to-r from-brand-tint/60 to-transparent">
          <div className="flex flex-wrap items-center gap-6">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white">
              <Users size={26} />
            </span>
            <div className="flex-1">
              <h2 className="m-0 text-lg font-bold text-ink">3–5× force multiplier</h2>
              <p className="m-0 mt-1 max-w-xl text-sm text-ink-soft">
                With the same 400-person force, Suraksha Netra lifts high-risk coverage from 34% to 72%,
                cuts emergency response by 40%, and removes 5 unmanned blackspots — every decision
                explainable and auditable.
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="m-0 text-3xl font-bold text-risk-low">+38%</p>
                <p className="m-0 text-[0.65rem] font-medium text-ink-faint">coverage</p>
              </div>
              <div className="text-center">
                <p className="m-0 text-3xl font-bold text-risk-low">−40%</p>
                <p className="m-0 text-[0.65rem] font-medium text-ink-faint">response</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function Bar({
  value,
  max,
  suffix,
  color,
  delay,
}: {
  value: number;
  max: number;
  suffix: string;
  color: string;
  delay?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-clay">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${(value / max) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: delay ? 0.15 : 0 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="w-14 shrink-0 text-right text-xs font-bold text-ink">
        {Math.round(value * 10) / 10}
        {suffix}
      </span>
    </div>
  );
}
