"use client";

import { motion } from "framer-motion";
import {
  CalendarHeart,
  CloudRain,
  Droplets,
  Eye,
  Thermometer,
  Wind,
  Users,
  MapPin,
  Route,
  CheckCircle2,
} from "lucide-react";
import { Card, Chip, Toggle, fadeUp, stagger } from "@/components/ui/primitives";
import { FESTIVAL_EVENTS, WEATHER, JUNCTIONS } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { tierFromScore } from "@/lib/utils";

export default function ContextsPage() {
  const rainMode = useAppStore((s) => s.rainMode);
  const setRainMode = useAppStore((s) => s.setRainMode);
  const activeFestivalId = useAppStore((s) => s.activeFestivalId);
  const activateFestival = useAppStore((s) => s.activateFestival);

  const waterlogged = JUNCTIONS.filter((j) => j.waterlogged);

  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">Contextual awareness</span>
        <h1 className="m-0 mt-1 text-2xl font-bold tracking-tight text-ink">Contexts & Weather</h1>
        <p className="m-0 mt-1 text-sm text-ink-soft">
          Festivals, crowd surges, rain & waterlogging — the context that reshapes risk.
        </p>
      </div>

      {/* Weather */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-water-tint text-water">
                <CloudRain size={26} />
              </span>
              <div>
                <p className="m-0 text-2xl font-bold text-ink">
                  {WEATHER.tempC}° <span className="text-sm font-semibold text-ink-soft">{WEATHER.condition}</span>
                </p>
                <p className="m-0 text-xs text-ink-faint">Nagpur · visibility {WEATHER.visibility} · {WEATHER.rainMm}mm/hr</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="m-0 text-sm font-semibold text-ink">Monsoon boost</p>
                <p className="m-0 text-xs text-ink-faint">{rainMode ? "Risk elevated citywide" : "Normal"}</p>
              </div>
              <Toggle checked={rainMode} onChange={(v) => setRainMode(v)} label="Monsoon mode" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <Mini icon={<Thermometer size={15} />} label="Humidity" value={`${WEATHER.humidity}%`} />
            <Mini icon={<Wind size={15} />} label="Rain" value={`${WEATHER.rainMm}mm`} />
            <Mini icon={<Eye size={15} />} label="Visibility" value="1.4km" />
          </div>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Waterlogged roads */}
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <Card className="h-full">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-water-tint text-water">
                <Droplets size={18} />
              </span>
              <div>
                <h2 className="m-0 text-sm font-semibold text-ink">Waterlogged roads</h2>
                <p className="m-0 text-xs text-ink-faint">CV-detected · risk boosted + deploy suggestion</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {waterlogged.map((j) => (
                <div key={j.id} className="rounded-xl border border-water/20 bg-water-tint/40 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                      <MapPin size={13} className="text-water" /> {j.name}
                    </span>
                    <Chip tone="water">risk +8%</Chip>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-water">
                    <Route size={13} />
                    <span>Alternate: divert via Wardhaman Nagar ring road</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-surface px-2.5 py-1.5 text-xs font-semibold text-brand">
                    <Users size={13} /> Suggested: +1 officer at {j.name.split(" ")[0]}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Festival mode */}
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <Card className="h-full">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-med-tint text-risk-med">
                <CalendarHeart size={18} />
              </span>
              <div>
                <h2 className="m-0 text-sm font-semibold text-ink">Festival / mass-gathering mode</h2>
                <p className="m-0 text-xs text-ink-faint">Activate playbooks · CV crowd boost</p>
              </div>
            </div>
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
              {FESTIVAL_EVENTS.map((ev) => {
                const active = activeFestivalId === ev.id;
                return (
                  <motion.div
                    variants={fadeUp}
                    key={ev.id}
                    className={`rounded-xl border p-3 transition-colors ${
                      active ? "border-brand bg-brand-tint/40" : "border-line bg-clay-tint/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="m-0 text-sm font-bold text-ink">{ev.name}</p>
                        <p className="m-0 text-xs text-ink-faint">{ev.nameMr} · {ev.date}</p>
                      </div>
                      <button
                        onClick={() => activateFestival(active ? null : ev.id)}
                        className={`chip ${active ? "bg-brand text-white" : "bg-surface text-brand"}`}
                      >
                        {active ? <CheckCircle2 size={12} /> : null}
                        {active ? "Active" : "Activate"}
                      </button>
                    </div>
                    {active && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 space-y-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <Chip tone="high">risk surge +6%</Chip>
                          <Chip tone="brand"><Users size={11} /> {ev.officers} officers</Chip>
                        </div>
                        <ul className="m-0 list-none space-y-1 p-0">
                          {ev.playbook.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-ink-soft">
                              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brand/15 text-[0.6rem] font-bold text-brand">
                                {i + 1}
                              </span>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-clay-tint px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-water">{icon}<span className="eyebrow m-0">{label}</span></div>
      <p className="m-0 mt-1 text-lg font-bold text-ink">{value}</p>
    </div>
  );
}
