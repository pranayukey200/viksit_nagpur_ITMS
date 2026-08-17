import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiskTier } from "@/lib/types";

/** Merge Tailwind classes intelligently. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as a percentage string. */
export function pct(value: number, digits = 0) {
  return `${(value * 100).toFixed(digits)}%`;
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Convert a 0-1 risk score into a tier. */
export function tierFromScore(score: number): RiskTier {
  if (score >= 0.66) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}
