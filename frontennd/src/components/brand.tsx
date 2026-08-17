"use client";

import { motion } from "framer-motion";

/**
 * TrafficDiamondSignLogo — High-precision vector recreation of the user's yellow diamond
 * traffic hazard sign with reflective glossy bevel, top & bottom metallic screw rivets,
 * and matte-black traffic signal silhouette with glowing yellow lenses.
 */
export function TrafficDiamondSignLogo({
  size = 40,
  animated = false,
}: {
  size?: number;
  animated?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-[0_4px_12px_rgba(245,158,11,0.35)]"
      aria-hidden
    >
      <defs>
        {/* Outer Yellow Diamond Gradient with Glossy Bevel */}
        <linearGradient id="sign-yellow" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="25%" stopColor="#fde047" />
          <stop offset="60%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>

        {/* Inner Sign Yellow Surface */}
        <radialGradient id="sign-inner-glow" cx="50" cy="50" r="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </radialGradient>

        {/* Glowing Yellow Lenses */}
        <radialGradient id="yellow-lens" cx="50" cy="50" r="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#fef08a" />
          <stop offset="85%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#eab308" />
        </radialGradient>

        {/* Metallic Screw Rivet Gradient */}
        <radialGradient id="screw-silver" cx="50" cy="50" r="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </radialGradient>

        {/* Lens Glow Filter */}
        <filter id="lens-glow" x="38" y="22" width="24" height="56" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#fde047" floodOpacity="0.9" />
        </filter>
      </defs>

      {/* ── 1. Outer Diamond Base with Rounded Corners ── */}
      <rect
        x="50"
        y="6"
        width="62"
        height="62"
        rx="10"
        transform="rotate(45 50 6)"
        fill="url(#sign-yellow)"
        stroke="#1e293b"
        strokeWidth="2.5"
      />

      {/* ── 2. Top-Left Glossy Highlight Crescent ── */}
      <path
        d="M50 8.5 L91.5 50 L87 50 L50 13 L13 50 L8.5 50 Z"
        fill="white"
        fillOpacity="0.55"
      />

      {/* ── 3. Inner Black Diamond Border Line ── */}
      <rect
        x="50"
        y="12"
        width="53.5"
        height="53.5"
        rx="6"
        transform="rotate(45 50 12)"
        fill="none"
        stroke="#0f172a"
        strokeWidth="3.5"
      />

      {/* ── 4. Top Metallic Screw Rivet (+) ── */}
      <g transform="translate(50, 16)">
        <circle cx="0" cy="0" r="4.5" fill="url(#screw-silver)" stroke="#334155" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="3.2" fill="#64748b" />
        {/* Phillips Cross */}
        <line x1="-2" y1="0" x2="2" y2="0" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" />
        <line x1="0" y1="-2" x2="0" y2="2" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* ── 5. Bottom Metallic Screw Rivet (+) ── */}
      <g transform="translate(50, 84)">
        <circle cx="0" cy="0" r="4.5" fill="url(#screw-silver)" stroke="#334155" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="3.2" fill="#64748b" />
        {/* Phillips Cross */}
        <line x1="-2" y1="0" x2="2" y2="0" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" />
        <line x1="0" y1="-2" x2="0" y2="2" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* ── 6. Matte Black Traffic Signal Silhouette with Hood Visors ── */}
      {/* Central Signal Body */}
      <path
        d="
          M 40 28
          H 60
          Q 63 28 63 31
          L 63 69
          Q 63 72 60 72
          H 40
          Q 37 72 37 69
          L 37 31
          Q 37 28 40 28
          Z
        "
        fill="#0b0f19"
      />

      {/* Top tier side visors */}
      <path d="M 37 31 C 28 31 27 38 37 40 Z" fill="#0b0f19" />
      <path d="M 63 31 C 72 31 73 38 63 40 Z" fill="#0b0f19" />

      {/* Middle tier side visors */}
      <path d="M 37 44 C 28 44 27 51 37 53 Z" fill="#0b0f19" />
      <path d="M 63 44 C 72 44 73 51 63 53 Z" fill="#0b0f19" />

      {/* Bottom tier side visors */}
      <path d="M 37 57 C 28 57 27 64 37 66 Z" fill="#0b0f19" />
      <path d="M 63 57 C 72 57 73 64 63 66 Z" fill="#0b0f19" />

      {/* ── 7. Three Glowing Circular Yellow Signal Lenses ── */}
      <g filter={animated ? "url(#lens-glow)" : undefined}>
        {/* Top Lens */}
        <circle cx="50" cy="35" r="5.2" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
        <circle cx="48.5" cy="33.5" r="1.8" fill="#ffffff" fillOpacity="0.75" />

        {/* Middle Lens */}
        <circle cx="50" cy="49" r="5.2" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
        <circle cx="48.5" cy="47.5" r="1.8" fill="#ffffff" fillOpacity="0.75" />

        {/* Bottom Lens */}
        <circle cx="50" cy="63" r="5.2" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
        <circle cx="48.5" cy="61.5" r="1.8" fill="#ffffff" fillOpacity="0.75" />
      </g>
    </svg>
  );
}

/**
 * NetraMark using the official Yellow Diamond Traffic Sign
 */
export function NetraMark({ size = 36 }: { size?: number }) {
  return <TrafficDiamondSignLogo size={size} animated />;
}

/**
 * Wordmark with requested typography:
 * "SURAKSHA" in Signal Green + "नेत्र" in Hindi Red
 */
export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="grid place-items-center">
        <TrafficDiamondSignLogo size={compact ? 32 : 38} animated />
      </div>
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          {/* Sukraksha in English Color Palette Green */}
          <span className="font-sans text-base sm:text-lg font-black tracking-tight text-[#10b981] drop-shadow-[0_0_8px_rgba(16,185,129,0.35)]">
            SURAKSHA
          </span>
          {/* Netra in Hindi Red Color */}
          <span className="font-sans text-lg sm:text-xl font-black tracking-tight text-[#ef4444] drop-shadow-[0_0_10px_rgba(239,68,68,0.45)]">
            नेत्र
          </span>
        </div>
        {!compact && (
          <p className="m-0 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-slate-500">
            नागपूर वाहतूक नियंत्रण प्रणाली · Traffic DSS
          </p>
        )}
      </div>
    </div>
  );
}

// Alias for backwards compatibility
export const TrafficSignalLogo = TrafficDiamondSignLogo;
