"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  Map as MapIcon,
  Users,
  Siren,
  ShieldCheck,
  BarChart3,
  Ambulance,
  TrafficCone,
  CalendarHeart,
  CloudRain,
  Video,
  Radar,
  Check,
} from "lucide-react";
import { NetraMark } from "@/components/brand";
import { Display, SectionTag, Marquee, BrutStat } from "@/components/ui/primitives";

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type Variant = "brut" | "clay" | "accent";
const FEATURES: { icon: typeof Brain; title: string; desc: string; span: string; variant: Variant }[] = [
  { icon: Brain, title: "Living Risk Score", desc: "Per-junction 0–1 score, SHAP-style plain-language reasons, and 30 / 60 / 120-minute predictions.", span: "lg:col-span-4", variant: "brut" },
  { icon: Users, title: "Constrained Allocation", desc: "Greedy + local-search optimizer places scarce officers for maximum coverage, in under 5 seconds.", span: "lg:col-span-2", variant: "brut" },
  { icon: MapIcon, title: "Risk Heatmap", desc: "Red / Amber / Green over real Nagpur, time-scrub, drill-down.", span: "lg:col-span-2", variant: "clay" },
  { icon: Ambulance, title: "Ambulance Green Corridor", desc: "CV detects the ambulance — signals flip to a green wave and an officer is alerted to clear the lane.", span: "lg:col-span-4", variant: "accent" },
  { icon: TrafficCone, title: "Smart Signals", desc: "Density-aware green splits cut average delay 20%+.", span: "lg:col-span-2", variant: "clay" },
  { icon: Siren, title: "Unmanned High-Risk", desc: "Auto-flags critical blackspots left uncovered under budget.", span: "lg:col-span-2", variant: "clay" },
  { icon: Video, title: "CV Perception", desc: "YOLOv8 + ByteTrack — counts, violations, density, ambulance, waterlogging.", span: "lg:col-span-2", variant: "clay" },
  { icon: ShieldCheck, title: "Override & Audit", desc: "One-click override with mandatory reason; full, exportable audit trail that feeds model tuning.", span: "lg:col-span-3", variant: "brut" },
  { icon: CalendarHeart, title: "Festival Mode", desc: "Event calendar + crowd CV surges risk and serves pre-loaded deployment playbooks.", span: "lg:col-span-3", variant: "clay" },
  { icon: CloudRain, title: "Waterlogging Alerts", desc: "Rain + CV detection highlight roads, boost risk, add police, suggest alternates.", span: "lg:col-span-2", variant: "clay" },
  { icon: BarChart3, title: "Baseline vs Optimal", desc: "Side-by-side impact: coverage, response, delay, exposure — proven, not promised.", span: "lg:col-span-4", variant: "brut" },
];

export default function AboutPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b-2 border-ink bg-canvas/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="brut-sm grid h-10 w-10 place-items-center">
              <NetraMark size={26} />
            </span>
            <span className="hidden text-lg font-bold tracking-tight text-ink sm:block">
              Suraksha <Display className="italic text-brand">Netra</Display>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            <Link href="/" className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink">
              Home
            </Link>
            {[
              ["Capabilities", "#features"],
              ["How it works", "#how"],
              ["Impact", "#impact"],
            ].map(([l, h]) => (
              <a key={l} href={h} className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink">
                {l}
              </a>
            ))}
          </nav>
          <Link href="/login" className="btn-brut btn-brut-fill">
            Enter Console <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-5 pb-8 pt-14 sm:pt-20">
        <div className="absolute right-0 top-10 -z-10 hidden h-72 w-72 rounded-full bg-brand/10 blur-3xl lg:block" />
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <SectionTag num="01">Viksit Nagpur · Problem Statement B</SectionTag>
            <h1 className="mt-5 m-0 text-[clamp(2.3rem,5.4vw,3.7rem)] font-bold leading-[1.02] tracking-tight text-ink">
              Turn 400 officers into a{" "}
              <Display className="text-5xl italic sm:text-6xl">
                <span className="text-gradient">3–5×</span>
              </Display>{" "}
              force multiplier.
            </h1>
            <p className="mt-5 m-0 max-w-xl text-base leading-relaxed text-ink-soft">
              Suraksha Netra scores living traffic risk, optimally places scarce personnel,
              clears paths for ambulances, retimes signals live, and adapts to festivals and
              monsoon — explainable, privacy-safe, and retrofit-cheap onto your existing CCTV.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/login" className="btn-brut btn-brut-accent">
                Enter Command Center <ArrowRight size={15} />
              </Link>
              <a href="#features" className="btn-brut">
                Explore capabilities
              </a>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5">
              {["Human in the loop", "DPDP-safe", "Runs on existing cameras"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
                  <Check size={13} className="text-risk-low" /> {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Brut product preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:col-span-5"
          >
            <div className="absolute -inset-3 -z-10 dot-grid rounded-3xl opacity-60" />
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
              <div className="brut grain overflow-hidden">
                <div className="flex items-center justify-between border-b-2 border-ink px-4 py-3">
                  <span className="text-sm font-bold text-ink">City Risk</span>
                  <span className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-low-tint px-2 py-0.5 text-[0.62rem] font-bold text-risk-low">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-risk-low" /> LIVE
                  </span>
                </div>
                <div className="relative h-40 overflow-hidden bg-[#e9eef6]">
                  <svg viewBox="0 0 320 160" className="h-full w-full">
                    {[...Array(8)].map((_, i) => (
                      <line key={`h${i}`} x1="0" y1={i * 22} x2="320" y2={i * 22} stroke="#cdd9ea" />
                    ))}
                    {[...Array(14)].map((_, i) => (
                      <line key={`v${i}`} x1={i * 24} y1="0" x2={i * 24} y2="160" stroke="#cdd9ea" />
                    ))}
                    {[
                      { x: 70, y: 55, c: "#c62828", r: 16 },
                      { x: 165, y: 80, c: "#c62828", r: 20 },
                      { x: 245, y: 50, c: "#ef8a00", r: 13 },
                      { x: 120, y: 110, c: "#ef8a00", r: 12 },
                      { x: 270, y: 110, c: "#2e7d32", r: 10 },
                    ].map((d, i) => (
                      <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.c} opacity="0.22">
                        <animate attributeName="r" values={`${d.r};${d.r + 5};${d.r}`} dur="3s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                      </circle>
                    ))}
                    {[
                      { x: 70, y: 55, c: "#c62828" },
                      { x: 165, y: 80, c: "#c62828" },
                      { x: 245, y: 50, c: "#ef8a00" },
                      { x: 120, y: 110, c: "#ef8a00" },
                      { x: 270, y: 110, c: "#2e7d32" },
                    ].map((d, i) => (
                      <circle key={`d${i}`} cx={d.x} cy={d.y} r="5" fill={d.c} stroke="#fff" strokeWidth="2" />
                    ))}
                  </svg>
                </div>
                <div className="space-y-2 p-4">
                  {[
                    { n: "Itwari Market", t: "High", c: "text-risk-high", bg: "bg-high-tint" },
                    { n: "Sitabuldi Main", t: "High", c: "text-risk-high", bg: "bg-high-tint" },
                    { n: "Bajaj Nagar", t: "Med", c: "text-risk-med", bg: "bg-med-tint" },
                  ].map((r, i) => (
                    <motion.div
                      key={r.n}
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.13 }}
                      className="flex items-center justify-between rounded-lg border-2 border-ink/10 bg-canvas px-3 py-2"
                    >
                      <span className="text-xs font-bold text-ink">{r.n}</span>
                      <span className={`rounded-full ${r.bg} px-2 py-0.5 text-[0.62rem] font-bold ${r.c}`}>{r.t}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
            <motion.div
              animate={{ rotate: [0, -3, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="brut-sm absolute -right-4 -top-5 float-slow bg-brand px-3 py-2"
            >
              <span className="text-xs font-bold text-white">⚡ Optimized</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Marquee */}
      <div className="mt-6">
        <Marquee
          items={[
            "Living Risk Score",
            "Constrained Allocation",
            "Ambulance Green Corridors",
            "Smart Signals",
            "Festival Playbooks",
            "Waterlogging Alerts",
            "Explainable · Auditable",
            "DPDP-safe",
          ]}
        />
      </div>

      {/* Stat band */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <Reveal>
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            <BrutStat value="400" label="Officers managed" />
            <BrutStat value="171" suffix="+" label="City junctions" accent />
            <BrutStat value="3–5" suffix="×" label="Force multiplier" />
            <BrutStat value="<5" suffix="s" label="Optimization latency" accent />
          </div>
        </Reveal>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-6xl px-5 pb-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-5">
            <SectionTag num="02">The bottleneck</SectionTag>
            <h2 className="mt-4 m-0 text-3xl font-bold tracking-tight text-ink">
              Mostly static. <Display className="italic text-water">Reactive.</Display> Blind to what's next.
            </h2>
            <p className="mt-3 m-0 text-ink-soft">
              Deployment today leans on experience, not data — so high-risk junctions go unmanned
              and incidents escalate before anyone moves. Suraksha Netra makes the decision{" "}
              <span className="font-semibold text-ink">data-driven and explainable</span>.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { n: "9", l: "unmanned blackspots on a typical shift" },
                { n: "11.4", l: "minutes mean incident response time" },
                { n: "38s", l: "average intersection delay, fixed timing" },
                { n: "34%", l: "of high-risk junctions actually covered" },
              ].map((s) => (
                <div key={s.l} className="card flex items-center gap-4 p-5">
                  <Display className="text-4xl text-brand">{s.n}</Display>
                  <p className="m-0 text-sm font-medium text-ink-soft">{s.l}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Features bento */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-14">
        <Reveal>
          <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionTag num="03">Capabilities</SectionTag>
              <h2 className="mt-3 m-0 text-[clamp(1.7rem,3.4vw,2.4rem)] font-bold tracking-tight text-ink">
                One system, <Display className="italic">the whole decision loop</Display>.
              </h2>
            </div>
            <p className="m-0 max-w-xs text-sm text-ink-soft">
              From raw CCTV frames to a ranked, explainable deployment plan — plus the emergency,
              signal, festival and weather intelligence around it.
            </p>
          </div>
        </Reveal>

        <div className="grid auto-rows-[1fr] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const base =
              f.variant === "clay"
                ? "clay"
                : `brut ${f.variant === "accent" ? "brut-accent" : ""}`;
            return (
              <Reveal key={f.title} delay={(i % 3) * 0.06} className={f.span}>
                <div className={`${base} group h-full p-5`}>
                  <div className="flex items-start justify-between">
                    <span
                      className={`grid h-11 w-11 place-items-center rounded-xl ${
                        f.variant === "accent"
                          ? "bg-brand text-white"
                          : "border-2 border-ink bg-canvas text-brand"
                      }`}
                    >
                      <Icon size={20} />
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="text-ink-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                    />
                  </div>
                  <h3 className="mt-4 m-0 text-base font-bold text-ink">{f.title}</h3>
                  <p className="mt-1.5 m-0 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y-2 border-ink bg-surface/70 py-14">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <SectionTag num="04">Architecture</SectionTag>
            <h2 className="mt-3 m-0 text-[clamp(1.7rem,3.4vw,2.4rem)] font-bold tracking-tight text-ink">
              Frames to <Display className="italic">decisions</Display>, one pipeline.
            </h2>
          </Reveal>
          <div className="mt-9 grid gap-4 md:grid-cols-5">
            {[
              { icon: Radar, t: "Data Ingest", d: "CCTV, history, weather, events, OSM, citizen reports" },
              { icon: Video, t: "Perception", d: "YOLOv8 + ByteTrack counts, violations, density" },
              { icon: Brain, t: "Risk Engine", d: "Gradient-boost model + temporal / spatial → SHAP" },
              { icon: Users, t: "Optimization", d: "Allocation, signals, green corridors" },
              { icon: ShieldCheck, t: "Decision", d: "Explainable, auditable, human-in-loop" },
            ].map((p, i) => (
              <Reveal key={p.t} delay={i * 0.07}>
                <div className="brut-sm h-full p-4">
                  <span className="text-xs font-bold text-brand">{`0${i + 1}`}</span>
                  <p.icon size={20} className="mt-3 text-brand" />
                  <h3 className="mt-2 m-0 text-sm font-bold text-ink">{p.t}</h3>
                  <p className="m-0 mt-1 text-xs leading-relaxed text-ink-soft">{p.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="mx-auto max-w-6xl px-5 py-16">
        <Reveal>
          <div className="text-center">
            <SectionTag num="05">Measurable impact</SectionTag>
            <h2 className="mt-3 m-0 text-[clamp(1.7rem,3.4vw,2.4rem)] font-bold tracking-tight text-ink">
              Proven before / after, <Display className="italic">not promises</Display>.
            </h2>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {[
            { v: "+38%", l: "High-risk coverage", a: false },
            { v: "−40%", l: "Emergency response", a: true },
            { v: "−34%", l: "Avg. intersection delay", a: false },
            { v: "−5", l: "Unmanned blackspots", a: true },
          ].map((m, i) => (
            <Reveal key={m.l} delay={i * 0.07}>
              <div className={`brut ${m.a ? "brut-accent" : ""} grain p-6 text-center`}>
                <Display className="text-5xl text-ink">{m.v}</Display>
                <p className="mt-2 m-0 text-xs font-semibold uppercase tracking-wide text-ink-soft">{m.l}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <Reveal>
          <div className="brut grain relative overflow-hidden bg-ink p-10 text-center sm:p-16" style={{ boxShadow: "10px 10px 0 #3d5afe" }}>
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand/30 blur-2xl" />
            <h2 className="relative m-0 text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-tight text-white">
              Pilot-ready in <Display className="italic text-brand">4–6 weeks</Display>.
            </h2>
            <p className="relative mx-auto mt-3 m-0 max-w-lg text-brand-tint">
              Step into the control room and see exactly where Nagpur's risk is rising — right now.
            </p>
            <Link
              href="/login"
              className="btn-brut btn-brut-accent relative mt-7 inline-flex text-base"
            >
              Launch Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-ink bg-surface/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="brut-sm grid h-9 w-9 place-items-center">
              <NetraMark size={22} />
            </span>
            <span className="text-sm font-bold text-ink">
              Suraksha <Display className="italic">Netra</Display>
            </span>
          </div>
          <p className="m-0 text-center text-xs text-ink-faint">
            Government-grade · DPDP-safe · human-in-the-loop · built for Viksit Nagpur
          </p>
        </div>
      </footer>
    </div>
  );
}
