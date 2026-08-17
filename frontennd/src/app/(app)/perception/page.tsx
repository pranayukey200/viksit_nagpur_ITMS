"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Ambulance,
  Camera,
  Plug,
  AlertTriangle,
  Bike,
  Car,
  Bus,
  Truck,
  ScanEye,
  Droplets,
  Radio,
  RefreshCw,
  Zap,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card, Chip, fadeUp, stagger } from "@/components/ui/primitives";
import { JUNCTIONS } from "@/lib/data";

const FEEDS = [
  { id: "sitabuldi", name: "Sitabuldi Square", isMLFeed: true, camera: "CAM-01 (4-Way ATCS)" },
  { id: "itwari", name: "Itwari Chawk", isMLFeed: false, camera: "CAM-04 (Market Flow)" },
  { id: "variety", name: "Variety Square", isMLFeed: false, camera: "CAM-07 (Flyover North)" },
  { id: "bajajnagar", name: "Bajaj Nagar", isMLFeed: false, camera: "CAM-12 (Institutional)" },
];

/** Physical Signal Coordinates mapped to 1280x720 video percentages */
const PHYSICAL_SIGNALS = {
  "North Lane": { x: 19.5, y: 25.0, label: "North Signal" },
  "East Lane":  { x: 62.5, y: 15.3, label: "East Signal" },
  "South Lane": { x: 67.2, y: 75.0, label: "South Signal" },
  "West Lane":  { x: 35.9, y: 83.3, label: "West Signal" },
};

/** Directional Lane Polygons (Normalized to 100%) */
const LANE_POLYGONS = {
  "North Lane": {
    points: "21.9%,0% 42.2%,0% 42.2%,31.9% 21.9%,31.9%",
    color: "rgba(59, 130, 246, 0.22)",
    border: "#3b82f6",
    labelX: "32%",
    labelY: "15%",
  },
  "East Lane": {
    points: "60.9%,19.4% 100%,19.4% 100%,50% 60.9%,50%",
    color: "rgba(16, 185, 129, 0.22)",
    border: "#10b981",
    labelX: "80%",
    labelY: "34%",
  },
  "South Lane": {
    points: "45.3%,72.2% 65.6%,72.2% 65.6%,100% 45.3%,100%",
    color: "rgba(245, 158, 11, 0.22)",
    border: "#f59e0b",
    labelX: "55%",
    labelY: "86%",
  },
  "West Lane": {
    points: "0%,50% 35.2%,50% 35.2%,80.6% 0%,80.6%",
    color: "rgba(168, 85, 247, 0.22)",
    border: "#a855f7",
    labelX: "17%",
    labelY: "65%",
  },
  "Center Junction Box": {
    points: "35.2%,31.9% 60.9%,31.9% 60.9%,72.2% 35.2%,72.2%",
    color: "rgba(239, 68, 68, 0.25)",
    border: "#ef4444",
    labelX: "48%",
    labelY: "52%",
  },
};

/** Thermal Jet Heat Spots (Cluster points on the video lanes) */
const HEAT_CLUSTERS = [
  // West Lane queue
  { x: 18, y: 62, r: 60, intensity: 0.9 },
  { x: 26, y: 60, r: 50, intensity: 0.85 },
  { x: 12, y: 64, r: 55, intensity: 0.75 },
  // East Lane queue
  { x: 82, y: 32, r: 65, intensity: 0.95 },
  { x: 74, y: 34, r: 55, intensity: 0.8 },
  { x: 92, y: 30, r: 60, intensity: 0.7 },
  // North Lane queue
  { x: 34, y: 14, r: 50, intensity: 0.8 },
  { x: 30, y: 22, r: 45, intensity: 0.65 },
  // South Lane queue
  { x: 56, y: 84, r: 50, intensity: 0.7 },
];

export default function PerceptionPage() {
  const [activeFeedId, setActiveFeedId] = useState<string>("sitabuldi");

  // Toggles for visual layers
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showPolygons, setShowPolygons] = useState<boolean>(true);
  const [showSignals, setShowSignals] = useState<boolean>(true);
  const [showTrackingDots, setShowTrackingDots] = useState<boolean>(true);

  // Signal & Telemetry simulation state
  const [activeGreenLane, setActiveGreenLane] = useState<string>("East Lane");
  const [cycleCountdown, setCycleCountdown] = useState<number>(38);
  const [ambulanceActive, setAmbulanceActive] = useState<boolean>(false);
  const [gridlockSimulated, setGridlockSimulated] = useState<boolean>(false);
  const [gridlockTimer, setGridlockTimer] = useState<number>(0);
  const [policeAlert, setPoliceAlert] = useState<boolean>(false);

  // Dynamic vehicle counts
  const [counts, setCounts] = useState<{ "North Lane": number; "South Lane": number; "East Lane": number; "West Lane": number }>({
    "North Lane": 14,
    "South Lane": 8,
    "East Lane": 24,
    "West Lane": 19,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic Adaptive Traffic Signal Control (ATCS) loop
  useEffect(() => {
    const timer = setInterval(() => {
      if (ambulanceActive) return; // Emergency hold

      setCycleCountdown((prev) => {
        if (prev <= 1) {
          // Switch to next heaviest lane
          setActiveGreenLane((current) => {
            const laneOrder = ["East Lane", "West Lane", "North Lane", "South Lane"];
            const nextIdx = (laneOrder.indexOf(current) + 1) % laneOrder.length;
            return laneOrder[nextIdx];
          });
          return Math.floor(Math.random() * 20) + 25; // 25s - 45s cycle
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [ambulanceActive]);

  // Center Junction Gridlock timer
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (gridlockSimulated) {
      t = setInterval(() => {
        setGridlockTimer((prev) => {
          const next = prev + 1;
          if (next >= 30) setPoliceAlert(true);
          return next;
        });
      }, 1000);
    } else {
      setGridlockTimer(0);
    }
    return () => clearInterval(t);
  }, [gridlockSimulated]);

  // Thermal Heatmap Canvas Rendering Engine (COLORMAP_JET)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !showHeatmap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let pulseAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pulseAngle += 0.04;
      const pulse = Math.sin(pulseAngle) * 0.15 + 0.85;

      HEAT_CLUSTERS.forEach((cluster) => {
        const cx = (cluster.x / 100) * canvas.width;
        const cy = (cluster.y / 100) * canvas.height;
        const radius = cluster.r * pulse;

        // Create COLORMAP_JET multi-stop radial gradient (Red -> Yellow -> Green -> Cyan -> Blue -> Transparent)
        const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        radGrad.addColorStop(0, `rgba(255, 0, 0, ${0.75 * cluster.intensity})`);
        radGrad.addColorStop(0.25, `rgba(255, 140, 0, ${0.60 * cluster.intensity})`);
        radGrad.addColorStop(0.5, `rgba(255, 255, 0, ${0.45 * cluster.intensity})`);
        radGrad.addColorStop(0.75, `rgba(0, 220, 255, ${0.25 * cluster.intensity})`);
        radGrad.addColorStop(1, "rgba(0, 50, 255, 0)");

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [showHeatmap]);

  // Keyboard Hotkeys: [E] Ambulance, [R] Reset, [G] Gridlock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "e" || e.key === "E") {
        handleTriggerAmbulance();
      } else if (e.key === "r" || e.key === "R") {
        handleResetSignal();
      } else if (e.key === "g" || e.key === "G") {
        handleToggleGridlock();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTriggerAmbulance = () => {
    setAmbulanceActive(true);
    setActiveGreenLane("East Lane");
    setCycleCountdown(90);
  };

  const handleResetSignal = () => {
    setAmbulanceActive(false);
    setGridlockSimulated(false);
    setGridlockTimer(0);
    setPoliceAlert(false);
    setCycleCountdown(35);
  };

  const handleToggleGridlock = () => {
    setGridlockSimulated((prev) => !prev);
  };

  const activeFeed = FEEDS.find((f) => f.id === activeFeedId) || FEEDS[0];

  const agg = JUNCTIONS.slice(0, 8).reduce(
    (s, j) => ({
      noHelmet: s.noHelmet + j.violations.noHelmet,
      triple: s.triple + j.violations.tripleRide,
      wrong: s.wrong + j.violations.wrongWay,
      red: s.red + j.violations.redLight,
      density: s.density + j.density,
    }),
    { noHelmet: 0, triple: 0, wrong: 0, red: 0, density: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">Perception layer · AI Edge Vision</span>
          <h1 className="m-0 mt-1 text-2xl font-bold tracking-tight text-ink">
            Computer Vision Feeds & ATCS Perception
          </h1>
          <p className="m-0 mt-1 text-sm text-ink-soft">
            YOLOv8 Edge Perception + Dynamic Signal Switching + COLORMAP_JET Thermal Heatmap + Gridlock Police Dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Chip tone="low">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-risk-low" /> Live Inference Node Active
          </Chip>
          <span className="rounded bg-slate-900 px-2.5 py-1 text-xs font-mono font-bold text-amber-400 border border-slate-800">
            YOLOv8 · 1080p ATCS
          </span>
        </div>
      </div>

      {/* Feed Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {FEEDS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFeedId(f.id)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeFeedId === f.id
                  ? "bg-[#10b981] text-white shadow-md ring-2 ring-[#10b981]/30"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-ink"
              }`}
            >
              <Camera size={14} className={activeFeedId === f.id ? "text-white" : "text-slate-400"} />
              <span>{f.name}</span>
              {f.isMLFeed && (
                <span className="rounded bg-white/25 px-1.5 py-0.2 text-[0.6rem] font-black uppercase text-white">
                  ML Vision Live
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Visual Layer Toggles */}
        {activeFeed.isMLFeed && (
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-bold border transition-all cursor-pointer ${
                showHeatmap
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                  : "bg-white text-slate-600 border-slate-300 hover:text-ink"
              }`}
            >
              <Flame size={13} />
              <span>Thermal Heatmap</span>
            </button>

            <button
              onClick={() => setShowPolygons(!showPolygons)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-bold border transition-all cursor-pointer ${
                showPolygons
                  ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                  : "bg-white text-slate-600 border-slate-300 hover:text-ink"
              }`}
            >
              <Layers size={13} />
              <span>Lane Zones</span>
            </button>

            <button
              onClick={() => setShowSignals(!showSignals)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-bold border transition-all cursor-pointer ${
                showSignals
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                  : "bg-white text-slate-600 border-slate-300 hover:text-ink"
              }`}
            >
              <Radio size={13} />
              <span>Traffic Signals</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Vision Stage & Telemetry Panel */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left 8 Cols: Video Stage with Thermal Heatmap and Real Signals */}
        <div className="space-y-4 lg:col-span-8">
          <div className="card overflow-hidden p-0 border border-slate-300 shadow-xl bg-slate-950">
            {/* Feed Header Bar */}
            <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black text-white">{activeFeed.name}</span>
                <span className="text-[0.68rem] text-slate-400 font-mono">({activeFeed.camera})</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[0.65rem] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded">
                  30.0 FPS · YOLOv8
                </span>
              </div>
            </div>

            {/* Video Canvas Container with Overlays */}
            <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center select-none">
              {/* 1. Underlying HD Surveillance Video */}
              <video
                src="/traffic.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* 2. Directional Polygon Lane Zones Overlay (SVG) */}
              {showPolygons && (
                <svg className="absolute inset-0 h-full w-full pointer-events-none z-10">
                  {Object.entries(LANE_POLYGONS).map(([name, data]) => (
                    <g key={name}>
                      <polygon
                        points={data.points}
                        fill={data.color}
                        stroke={data.border}
                        strokeWidth="2"
                        strokeDasharray={name.includes("Center") ? "4 4" : undefined}
                      />
                      <text
                        x={data.labelX}
                        y={data.labelY}
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="bold"
                        filter="drop-shadow(0 1px 3px rgba(0,0,0,0.8))"
                        textAnchor="middle"
                      >
                        {name}
                      </text>
                    </g>
                  ))}
                </svg>
              )}

              {/* 3. Live Thermal Density Heatmap Canvas Overlay (COLORMAP_JET) */}
              {showHeatmap && (
                <canvas
                  ref={canvasRef}
                  width={1280}
                  height={720}
                  className="absolute inset-0 h-full w-full pointer-events-none z-15 mix-blend-screen opacity-75"
                />
              )}

              {/* 4. Physical On-Road Traffic Signal Housings with Active Glow */}
              {showSignals && (
                <div className="absolute inset-0 pointer-events-none z-20">
                  {Object.entries(PHYSICAL_SIGNALS).map(([lane, pos]) => {
                    const isGreen = activeGreenLane === lane;
                    return (
                      <div
                        key={lane}
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                      >
                        {/* Traffic Signal Housing */}
                        <div className="rounded-md border border-slate-700 bg-slate-900/90 p-1 shadow-2xl backdrop-blur-sm flex flex-col items-center gap-1 w-6">
                          {/* Red Lamp */}
                          <span
                            className={`h-3 w-3 rounded-full transition-all duration-300 ${
                              !isGreen
                                ? "bg-red-500 shadow-[0_0_10px_#ef4444] ring-1 ring-red-300"
                                : "bg-red-950 opacity-40"
                            }`}
                          />
                          {/* Green Lamp */}
                          <span
                            className={`h-3 w-3 rounded-full transition-all duration-300 ${
                              isGreen
                                ? "bg-emerald-400 shadow-[0_0_12px_#10b981] ring-1 ring-emerald-200 animate-pulse"
                                : "bg-emerald-950 opacity-40"
                            }`}
                          />
                        </div>
                        {/* Lane Label pill */}
                        <span className="mt-1 rounded bg-black/80 border border-slate-700 px-1 py-0.2 text-[0.55rem] font-bold text-white whitespace-nowrap">
                          {lane.replace(" Lane", "")}: {isGreen ? `PASS (${cycleCountdown}s)` : "STOP"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Emergency Ambulance Green Corridor Banner */}
              {ambulanceActive && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-3 left-3 right-3 z-30 rounded-lg bg-emerald-600/95 border-2 border-emerald-400 p-3 text-white shadow-2xl backdrop-blur-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Ambulance size={24} className="animate-bounce text-amber-300" />
                    <div>
                      <p className="m-0 text-sm font-black uppercase tracking-wider">
                        EMERGENCY AMBULANCE CORRIDOR ACTIVE 🚑
                      </p>
                      <p className="m-0 text-xs text-emerald-100">
                        Acoustic Siren Detected · East Lane Granted 90s Priority Lock · All Other Lanes RED
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleResetSignal}
                    className="rounded bg-white px-3 py-1 text-xs font-black text-emerald-800 shadow hover:bg-emerald-50 cursor-pointer"
                  >
                    Clear Corridor [R]
                  </button>
                </motion.div>
              )}

              {/* Gridlock Police Intervention Alert Banner */}
              {policeAlert && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-3 left-3 right-3 z-30 rounded-lg bg-red-600/95 border-2 border-red-400 p-3 text-white shadow-2xl backdrop-blur-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert size={24} className="animate-pulse text-yellow-300" />
                    <div>
                      <p className="m-0 text-sm font-black uppercase tracking-wider">
                        POLICE DISPATCHED: JUNCTION GRIDLOCK DETECTED!
                      </p>
                      <p className="m-0 text-xs text-red-100">
                        {'>'}=2 Vehicles stalled in Center Square for {'>'}30s · Nagpur Traffic Control Alerted
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleResetSignal}
                    className="rounded bg-white px-3 py-1 text-xs font-black text-red-800 shadow hover:bg-red-50 cursor-pointer"
                  >
                    Dismiss [R]
                  </button>
                </motion.div>
              )}
            </div>

            {/* Live Interactive Control Hotbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 border-t border-slate-800 text-white">
              <div className="flex items-center gap-2">
                {/* [E] Trigger Ambulance Corridor */}
                <button
                  onClick={handleTriggerAmbulance}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-black transition-all cursor-pointer ${
                    ambulanceActive
                      ? "bg-emerald-500 text-white ring-2 ring-emerald-300"
                      : "bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100"
                  }`}
                >
                  <Ambulance size={14} />
                  <span>Ambulance Override [E]</span>
                </button>

                {/* [G] Force Gridlock Test */}
                <button
                  onClick={handleToggleGridlock}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-black transition-all cursor-pointer ${
                    gridlockSimulated
                      ? "bg-amber-500 text-black ring-2 ring-amber-300"
                      : "bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  <Zap size={14} />
                  <span>Gridlock Test [G]</span>
                </button>

                {/* [R] Reset Cycle */}
                <button
                  onClick={handleResetSignal}
                  className="flex items-center gap-1.5 rounded-md bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200 border border-slate-700 transition-all cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Reset [R]</span>
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span>Thermal Heatmap: <b className="text-sky-400">COLORMAP_JET</b></span>
                <span>•</span>
                <span>Inference: <b className="text-emerald-400">ONNX Edge</b></span>
              </div>
            </div>
          </div>

          {/* 4-Lane Physical Traffic Signal Telemetry Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { lane: "North Lane", count: counts["North Lane"], isGreen: activeGreenLane === "North Lane" },
              { lane: "South Lane", count: counts["South Lane"], isGreen: activeGreenLane === "South Lane" },
              { lane: "East Lane", count: counts["East Lane"], isGreen: activeGreenLane === "East Lane" },
              { lane: "West Lane", count: counts["West Lane"], isGreen: activeGreenLane === "West Lane" },
            ].map((s) => {
              return (
                <div
                  key={s.lane}
                  className={`rounded-lg border p-3 transition-all ${
                    s.isGreen
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md ring-1 ring-emerald-400"
                      : "border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{s.lane}</span>
                    <span
                      className={`h-3 w-3 rounded-full ${
                        s.isGreen ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                      }`}
                    />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div>
                      <p className="m-0 text-xl font-black">{s.count}</p>
                      <p className="m-0 text-[0.62rem] text-slate-500 font-bold uppercase">Vehicles Detected</p>
                    </div>
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-mono font-black ${
                        s.isGreen ? "bg-emerald-600 text-white" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.isGreen ? `GREEN (${cycleCountdown}s)` : "RED"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 4 Cols: Live Detection Telemetry & Analytics */}
        <div className="space-y-5 lg:col-span-4">
          {/* Junction Gridlock Monitor */}
          <Card>
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-amber-500" />
                <h3 className="m-0 text-sm font-bold text-ink">Center Gridlock Monitor</h3>
              </div>
              <Chip tone={policeAlert ? "high" : "low"}>
                {policeAlert ? "DISPATCHED" : "CLEAR"}
              </Chip>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex justify-between items-center rounded-lg bg-slate-50 p-2 border border-slate-200">
                <span className="font-semibold text-slate-600">Vehicles in Center Box</span>
                <span className="font-black text-ink text-sm">
                  {gridlockSimulated ? "3 vehicles" : "0 vehicles"}
                </span>
              </div>

              <div className="flex justify-between items-center rounded-lg bg-slate-50 p-2 border border-slate-200">
                <span className="font-semibold text-slate-600">Junction Stall Duration</span>
                <span className="font-mono font-bold text-ink">
                  {gridlockTimer}s / 30s
                </span>
              </div>

              {/* Progress bar to police dispatch */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    policeAlert ? "bg-red-600" : "bg-amber-500"
                  }`}
                  style={{
                    width: `${Math.min(100, (gridlockTimer / 30) * 100)}%`,
                  }}
                />
              </div>

              {policeAlert && (
                <div className="rounded bg-red-50 p-2 border border-red-200 text-red-700 font-bold text-[0.7rem]">
                  🚨 30-Second Threshold Exceeded: Police Interceptor Unit alerted for immediate manual clearing.
                </div>
              )}
            </div>
          </Card>

          {/* Aggregated Violations & Detections */}
          <Card>
            <h3 className="m-0 text-sm font-semibold text-ink">Nagpur Citywide Detections</h3>
            <p className="m-0 mt-0.5 text-xs text-ink-faint">Aggregated live across all surveillance nodes</p>
            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between rounded-lg bg-high-tint p-2.5 text-xs">
                <span className="flex items-center gap-2 font-semibold text-risk-high">
                  <Bike size={15} /> No-Helmet Riding
                </span>
                <span className="font-mono font-black text-risk-high">{agg.noHelmet}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-med-tint p-2.5 text-xs">
                <span className="flex items-center gap-2 font-semibold text-risk-med">
                  <Bike size={15} /> Triple-Riding
                </span>
                <span className="font-mono font-black text-risk-med">{agg.triple}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-high-tint p-2.5 text-xs">
                <span className="flex items-center gap-2 font-semibold text-risk-high">
                  <Car size={15} /> Wrong-Way Driving
                </span>
                <span className="font-mono font-black text-risk-high">{agg.wrong}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-med-tint p-2.5 text-xs">
                <span className="flex items-center gap-2 font-semibold text-risk-med">
                  <Car size={15} /> Red-Light Violation
                </span>
                <span className="font-mono font-black text-risk-med">{agg.red}</span>
              </div>
            </div>
          </Card>

          {/* Edge Integration RTSP Input */}
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <Plug size={16} className="text-brand" />
              <h3 className="m-0 text-sm font-bold text-ink">Bring Your Own Feed (RTSP)</h3>
            </div>
            <p className="m-0 text-xs text-ink-soft mb-3">
              Connect external CCTV streams or live IP cameras for instant YOLO inference.
            </p>
            <div className="space-y-2">
              <input
                className="input text-xs"
                placeholder="rtsp://admin:pass@192.168.1.100:554/live"
                defaultValue="http://localhost:5000/video_feed"
              />
              <button className="btn btn-primary w-full justify-center text-xs font-bold cursor-pointer">
                <Video size={14} /> Connect Camera Stream
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
