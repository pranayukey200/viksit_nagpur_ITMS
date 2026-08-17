"use client";

import { motion, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TIER_META } from "@/lib/data";
import type { RiskTier } from "@/lib/types";

/* ---------- Motion presets ---------- */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

/* ---------- Card ---------- */
export function Card({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "card p-5",
        hover && "transition-transform duration-300 hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ---------- Eyebrow / Section header ---------- */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow m-0">{children}</p>;
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="m-0 text-lg font-semibold tracking-tight text-ink">{title}</h2>
        {subtitle && <p className="mt-1 m-0 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Tier badge ---------- */
const TIER_STYLE: Record<RiskTier, { bg: string; fg: string; dot: string; label: string }> = {
  high: { bg: "bg-high-tint", fg: "text-risk-high", dot: "bg-risk-high", label: "High" },
  medium: { bg: "bg-med-tint", fg: "text-risk-med", dot: "bg-risk-med", label: "Medium" },
  low: { bg: "bg-low-tint", fg: "text-risk-low", dot: "bg-risk-low", label: "Low" },
};

export function TierBadge({ tier, size = "md" }: { tier: RiskTier; size?: "sm" | "md" }) {
  const s = TIER_STYLE[tier];
  return (
    <span
      className={cn(
        "chip font-semibold",
        s.bg,
        s.fg,
        size === "sm" ? "px-2 py-0.5 text-[0.65rem]" : "px-2.5 py-1"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label} Risk
    </span>
  );
}

/* ---------- Chip ---------- */
export function Chip({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "water" | "low" | "med" | "high";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-clay text-ink-soft",
    brand: "bg-brand-tint text-brand",
    water: "bg-water-tint text-water",
    low: "bg-low-tint text-risk-low",
    med: "bg-med-tint text-risk-med",
    high: "bg-high-tint text-risk-high",
  };
  return <span className={cn("chip", tones[tone], className)}>{children}</span>;
}

/* ---------- Toggle switch ---------- */
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300",
        checked ? "bg-brand" : "bg-clay"
      )}
      style={{
        boxShadow: checked
          ? "inset 0 1px 2px rgba(41,64,196,0.5)"
          : "inset 2px 2px 5px rgba(174,184,200,0.6)",
      }}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={cn(
          "absolute top-1 h-5 w-5 rounded-full bg-white shadow",
          checked ? "left-6" : "left-1"
        )}
      />
    </button>
  );
}

/* ---------- Animated number ---------- */
export function Counter({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(value);
  useEffect(() => {
    const from = ref.current;
    const to = value;
    let raf = 0;
    const start = performance.now();
    const dur = 700;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else ref.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ---------- Stat tile ---------- */
export function StatTile({
  label,
  value,
  unit,
  delta,
  deltaTone = "good",
  icon,
  decimals = 0,
}: {
  label: string;
  value: number;
  unit?: string;
  delta?: string;
  deltaTone?: "good" | "bad";
  icon?: ReactNode;
  decimals?: number;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="relative overflow-hidden" hover>
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="eyebrow m-0 truncate">{label}</p>
            <p className="mt-2 m-0 text-3xl font-bold tracking-tight text-ink">
              <Counter value={value} decimals={decimals} />
              {unit && <span className="ml-1 text-base font-semibold text-ink-soft">{unit}</span>}
            </p>
          </div>
          {icon && (
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-tint text-brand">
              {icon}
            </span>
          )}
        </div>
        {delta && (
          <p
            className={cn(
              "mt-3 m-0 text-xs font-semibold",
              deltaTone === "good" ? "text-risk-low" : "text-risk-high"
            )}
          >
            {delta}
          </p>
        )}
      </Card>
    </motion.div>
  );
}

/* ---------- Progress / contribution bar (SHAP-like) ---------- */
export function ContributionBar({
  label,
  weight,
  tone,
}: {
  label: string;
  weight: number;
  tone: "danger" | "warn" | "info" | "neutral" | "good";
}) {
  const colors: Record<string, string> = {
    danger: "bg-risk-high",
    warn: "bg-risk-med",
    info: "bg-water",
    neutral: "bg-ink-faint",
    good: "bg-risk-low",
  };
  return (
    <div className="flex items-center gap-3">
      <span className="w-44 shrink-0 truncate text-xs font-medium text-ink-soft">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-clay">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${weight * 100}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={cn("h-full rounded-full", colors[tone])}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-xs font-semibold text-ink">
        {Math.round(weight * 100)}%
      </span>
    </div>
  );
}

/* ---------- Display serif text ---------- */
export function Display({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("font-display tracking-tight", className)}>{children}</span>
  );
}

/* ---------- Numbered section tag ---------- */
export function SectionTag({ num, children }: { num: string; children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <span className="sec-num text-brand">{num}</span>
      <span className="h-px w-8 bg-ink/30" />
      <span className="eyebrow m-0 text-ink">{children}</span>
    </div>
  );
}

/* ---------- Marquee ticker ---------- */
export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="group relative overflow-hidden border-y-2 border-ink bg-ink py-2.5">
      <div className="marquee-track">
        {doubled.map((it, i) => (
          <span
            key={i}
            className="flex items-center gap-3 whitespace-nowrap px-6 text-sm font-semibold uppercase tracking-wide text-white"
          >
            <span className="text-brand">✦</span> {it}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Brut stat tile ---------- */
export function BrutStat({
  value,
  suffix,
  label,
  accent,
}: {
  value: string;
  suffix?: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`brut ${accent ? "brut-accent" : ""} grain p-5`}
    >
      <p className="m-0 font-display text-5xl leading-none text-ink">
        {value}
        {suffix && <span className="text-brand">{suffix}</span>}
      </p>
      <p className="mt-2 m-0 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </p>
    </motion.div>
  );
}

/* ---------- Risk gauge (circular) ---------- */
export function RiskGauge({
  value,
  size = 132,
}: {
  value: number;
  size?: number;
}) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const tier: RiskTier = value >= 0.66 ? "high" : value >= 0.4 ? "medium" : "low";
  const meta = TIER_META[tier];
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e9edf2" strokeWidth={10} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={meta.color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - c * value }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-3xl font-bold text-ink">
          <Counter value={value * 100} />
        </span>
        <span className="mt-0.5 block text-[0.65rem] font-semibold uppercase tracking-wide text-ink-faint">
          risk
        </span>
      </div>
    </div>
  );
}
