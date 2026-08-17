"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Timer,
  Gauge,
  Users,
  ArrowRight,
  Siren,
  Droplets,
  TrafficCone,
  CloudRain,
  CalendarHeart,
  CheckCircle2,
  Map as MapIcon,
  Activity,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  StatTile,
  TierBadge,
  Chip,
  Toggle,
  Display,
  fadeUp,
  stagger,
} from "@/components/ui/primitives";
import { JUNCTIONS, BASELINE_METRICS, RECOMMENDED_METRICS } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { tierFromScore } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const incidents = useAppStore((s) => s.incidents);
  const resolveIncident = useAppStore((s) => s.resolveIncident);
  const smartSignals = useAppStore((s) => s.smartSignals);
  const toggleSmartSignals = useAppStore((s) => s.toggleSmartSignals);
  const rainMode = useAppStore((s) => s.rainMode);
  const setRainMode = useAppStore((s) => s.setRainMode);
  const activeIncidents = incidents.filter((i) => i.status === "active");

  const priority = useMemo(() => [...JUNCTIONS].sort((a, b) => b.risk - a.risk).slice(0, 6), []);

  const tiers = useMemo(
    () => ({
      high: JUNCTIONS.filter((j) => tierFromScore(j.risk) === "high").length,
      medium: JUNCTIONS.filter((j) => tierFromScore(j.risk) === "medium").length,
      low: JUNCTIONS.filter((j) => tierFromScore(j.risk) === "low").length,
    }),
    []
  );

  const zoneRisk = useMemo(() => {
    const zones = Array.from(new Set(JUNCTIONS.map((j) => j.zone)));
    return zones
      .map((z) => {
        const zs = JUNCTIONS.filter((j) => j.zone === z);
        return { z, avg: zs.reduce((s, j) => s + j.risk, 0) / zs.length, count: zs.length };
      })
      .sort((a, b) => b.avg - a.avg);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">Command Center</span>
          <h1 className="m-0 mt-1 text-2xl font-bold tracking-tight text-ink">
            City <Display className="italic">overview</Display>
          </h1>
          <p className="m-0 mt-1 text-sm text-ink-soft">
            Day shift · {JUNCTIONS.length} junctions live · {activeIncidents.length} active incident
            {activeIncidents.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/heatmap" className="btn-brut btn-brut-accent">
          <MapIcon size={15} /> Open Live Map
        </Link>
      </div>

      {/* KPIs */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="High-risk coverage" value={RECOMMENDED_METRICS.highRiskCoverage * 100} unit="%" decimals={0} delta={`+${Math.round((RECOMMENDED_METRICS.highRiskCoverage - BASELINE_METRICS.highRiskCoverage) * 100)}% vs baseline`} icon={<ShieldCheck size={18} />} />
        <StatTile label="Avg. response" value={RECOMMENDED_METRICS.responseTimeMin} unit="min" decimals={1} delta={`−${Math.round((1 - RECOMMENDED_METRICS.responseTimeMin / BASELINE_METRICS.responseTimeMin) * 100)}% faster`} icon={<Timer size={18} />} />
        <StatTile label="Officer utilization" value={RECOMMENDED_METRICS.utilization * 100} unit="%" decimals={0} delta={`+${Math.round((RECOMMENDED_METRICS.utilization - BASELINE_METRICS.utilization) * 100)}% vs static`} icon={<Users size={18} />} />
        <StatTile label="Avg. delay" value={RECOMMENDED_METRICS.avgDelay} unit="s" decimals={0} delta={`−${Math.round((1 - RECOMMENDED_METRICS.avgDelay / BASELINE_METRICS.avgDelay) * 100)}% smart signals`} icon={<Gauge size={18} />} />
      </motion.div>

      {/* City Pulse + incidents */}
      <div className="grid gap-6 lg:grid-cols-12">
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-8">
          <Card>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="m-0 text-sm font-bold text-ink">City Pulse</h2>
                <p className="m-0 text-xs text-ink-faint">Risk distribution across zones & tiers</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-risk-low">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-risk-low" /> Updating
              </span>
            </div>

            {/* tier distribution */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: "High", v: tiers.high, c: "#c62828", bg: "bg-high-tint" },
                { l: "Medium", v: tiers.medium, c: "#ef8a00", bg: "bg-med-tint" },
                { l: "Low", v: tiers.low, c: "#2e7d32", bg: "bg-low-tint" },
              ].map((t) => (
                <div key={t.l} className={`rounded-2xl ${t.bg} p-3.5 text-center`}>
                  <Display className="text-4xl" >
                    <span style={{ color: t.c }}>{t.v}</span>
                  </Display>
                  <p className="m-0 mt-1 text-[0.65rem] font-bold uppercase tracking-wide text-ink-soft">{t.l}</p>
                </div>
              ))}
            </div>

            {/* zone bars */}
            <div className="mt-5">
              <p className="m-0 eyebrow">Average risk by zone</p>
              <div className="mt-3 space-y-2.5">
                {zoneRisk.map((z) => (
                  <div key={z.z} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 truncate text-xs font-semibold text-ink">{z.z}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-clay">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${z.avg * 100}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full"
                        style={{
                          background:
                            z.avg >= 0.66 ? "#c62828" : z.avg >= 0.4 ? "#ef8a00" : "#2e7d32",
                        }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-xs font-bold text-ink">
                      {Math.round(z.avg * 100)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-4">
          <Card className="flex h-full flex-col">
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-sm font-bold text-ink">Active Incidents</h2>
              <Chip tone="high">{activeIncidents.length} active</Chip>
            </div>
            <div className="mt-4 flex-1 space-y-3">
              {activeIncidents.length === 0 && (
                <div className="grid h-full place-items-center rounded-xl bg-low-tint py-8 text-center">
                  <CheckCircle2 className="text-risk-low" size={28} />
                  <p className="mt-2 m-0 text-sm font-semibold text-ink">All clear</p>
                  <p className="m-0 text-xs text-ink-faint">No active incidents</p>
                </div>
              )}
              {activeIncidents.map((inc) => (
                <motion.div layout key={inc.id} className="rounded-xl border border-line bg-clay-tint/60 p-3">
                  <div className="flex items-center gap-2">
                    {inc.type === "waterlogging" ? <Droplets size={15} className="text-water" /> : <Siren size={15} className="text-risk-high" />}
                    <span className="text-sm font-bold text-ink">{inc.junctionName}</span>
                    <TierBadge tier={inc.severity} size="sm" />
                  </div>
                  <p className="mt-1.5 m-0 text-xs leading-relaxed text-ink-soft">{inc.note}</p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[0.7rem] text-ink-faint">{inc.time}</span>
                    <button onClick={() => resolveIncident(inc.id)} className="text-xs font-bold text-brand hover:underline">
                      Resolve
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            <Link href="/incidents" className="btn btn-soft mt-4 w-full justify-center text-xs">
              Incident Console <ArrowRight size={14} />
            </Link>
          </Card>
        </motion.div>
      </div>

      {/* Priority queue + system status */}
      <div className="grid gap-6 lg:grid-cols-12">
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-7">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="m-0 text-sm font-bold text-ink">Priority Queue</h2>
                <p className="m-0 text-xs text-ink-faint">Highest-risk junctions needing attention</p>
              </div>
              <Link href="/allocation" className="flex items-center gap-1 text-xs font-bold text-brand hover:underline">
                <Activity size={13} /> Optimize
              </Link>
            </div>
            <div className="space-y-1.5">
              {priority.map((j, i) => (
                <Link key={j.id} href={`/heatmap?j=${j.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-clay-tint">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-clay text-xs font-bold text-ink-soft">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ink">{j.name}</span>
                    <span className="block truncate text-xs text-ink-faint">{j.factors[0]?.label}</span>
                  </span>
                  {!j.manned && tierFromScore(j.risk) === "high" && <Chip tone="high">Unmanned</Chip>}
                  <TierBadge tier={tierFromScore(j.risk)} size="sm" />
                </Link>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-5">
          <Card className="h-full">
            <h2 className="m-0 text-sm font-bold text-ink">System Controls</h2>
            <p className="m-0 mt-1 text-xs text-ink-faint">Quick toggles across modules</p>
            <div className="mt-4 space-y-2">
              <ControlRow icon={<TrafficCone size={16} className="text-brand" />} title="Smart Signals" desc="Density-adaptive green splits" checked={smartSignals} onChange={() => toggleSmartSignals()} />
              <ControlRow icon={<CloudRain size={16} className="text-water" />} title="Monsoon / Rain Mode" desc="Boost risk on slick surfaces" checked={rainMode} onChange={(v) => setRainMode(v)} />
              <ControlRow icon={<CalendarHeart size={16} className="text-risk-med" />} title="Festival Mode" desc="Activate event playbooks" href="/contexts" />
              <ControlRow icon={<Siren size={16} className="text-risk-high" />} title="Ambulance Corridor" desc="Trigger green-wave clearance" href="/incidents" />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function ControlRow({
  icon,
  title,
  desc,
  checked,
  onChange,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  href?: string;
}) {
  const body = (
    <div className="flex items-center gap-3 rounded-xl border border-line px-3 py-3 transition-colors hover:bg-clay-tint">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-clay">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm font-bold text-ink">{title}</p>
        <p className="m-0 text-xs text-ink-faint">{desc}</p>
      </div>
      {onChange ? (
        <Toggle checked={!!checked} onChange={onChange} label={title} />
      ) : (
        <ChevronRight size={16} className="text-ink-faint" />
      )}
    </div>
  );
  return href && !onChange ? <Link href={href}>{body}</Link> : body;
}
