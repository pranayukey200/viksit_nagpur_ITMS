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
  Eye,
} from "lucide-react";
import { Card, Chip, fadeUp, stagger } from "@/components/ui/primitives";
import { JUNCTIONS } from "@/lib/data";

const FEEDS = [
  { id: "sitabuldi", name: "Sitabuldi Square", isMLFeed: true, camera: "CAM-01 (4-Way ATCS)" },
  { id: "itwari", name: "Itwari Chawk", isMLFeed: false, camera: "CAM-04 (Market Flow)" },
  { id: "variety", name: "Variety Square", isMLFeed: false, camera: "CAM-07 (Flyover North)" },
  { id: "bajajnagar", name: "Bajaj Nagar", isMLFeed: false, camera: "CAM-12 (Institutional)" },
];

/** Physical Stopline Signal Coordinates (Normalized % on 1280x720) */
const PHYSICAL_SIGNALS = {
  "North Lane": { x: 19.5, y: 25.0, label: "North Stopline" },
  "East Lane":  { x: 62.5, y: 15.3, label: "East Stopline" },
  "South Lane": { x: 67.2, y: 75.0, label: "South Stopline" },
  "West Lane":  { x: 35.9, y: 83.3, label: "West Stopline" },
};

/** Directional Lane Polygons (Normalized %) */
const LANE_POLYGONS = {
  "North Lane": {
    points: "21.9%,0% 42.2%,0% 42.2%,31.9% 21.9%,31.9%",
    color: "rgba(59, 130, 246, 0.18)",
    border: "#3b82f6",
    labelX: "32%",
    labelY: "15%",
  },
  "East Lane": {
    points: "60.9%,19.4% 100%,19.4% 100%,50% 60.9%,50%",
    color: "rgba(16, 185, 129, 0.18)",
    border: "#10b981",
    labelX: "80%",
    labelY: "34%",
  },
  "South Lane": {
    points: "45.3%,72.2% 65.6%,72.2% 65.6%,100% 45.3%,100%",
    color: "rgba(245, 158, 11, 0.18)",
    border: "#f59e0b",
    labelX: "55%",
    labelY: "86%",
  },
  "West Lane": {
    points: "0%,50% 35.2%,50% 35.2%,80.6% 0%,80.6%",
    color: "rgba(168, 85, 247, 0.18)",
    border: "#a855f7",
    labelX: "17%",
    labelY: "65%",
  },
  "Center Junction Box": {
    points: "35.2%,31.9% 60.9%,31.9% 60.9%,72.2% 35.2%,72.2%",
    color: "rgba(239, 68, 68, 0.22)",
    border: "#ef4444",
    labelX: "48%",
    labelY: "52%",
  },
};

/** Simulated YOLO Detection Bounding Boxes mapped to vehicles in the video */
const VEHICLE_DETECTIONS = [
  // West Lane Vehicles (Heavy queue)
  { id: "w1", x: 7, y: 55, w: 4.8, h: 5.5, label: "car", conf: 0.94, lane: "West Lane", color: "#3b82f6" },
  { id: "w2", x: 13, y: 56, w: 4.5, h: 5.2, label: "car", conf: 0.91, lane: "West Lane", color: "#3b82f6" },
  { id: "w3", x: 19, y: 54, w: 5.0, h: 5.8, label: "car", conf: 0.89, lane: "West Lane", color: "#3b82f6" },
  { id: "w4", x: 25, y: 55, w: 4.6, h: 5.4, label: "car", conf: 0.93, lane: "West Lane", color: "#3b82f6" },
  { id: "w5", x: 9, y: 64, w: 3.8, h: 4.8, label: "2W", conf: 0.88, lane: "West Lane", color: "#f59e0b" },
  { id: "w6", x: 15, y: 65, w: 4.2, h: 5.0, label: "3W", conf: 0.86, lane: "West Lane", color: "#a855f7" },
  { id: "w7", x: 21, y: 66, w: 5.2, h: 6.0, label: "bus", conf: 0.95, lane: "West Lane", color: "#10b981" },
  { id: "w8", x: 28, y: 67, w: 4.0, h: 4.9, label: "car", conf: 0.90, lane: "West Lane", color: "#3b82f6" },

  // East Lane Vehicles (Queue & moving flow)
  { id: "e1", x: 67, y: 32, w: 4.5, h: 5.5, label: "car", conf: 0.93, lane: "East Lane", color: "#3b82f6" },
  { id: "e2", x: 73, y: 33, w: 4.8, h: 5.6, label: "car", conf: 0.95, lane: "East Lane", color: "#3b82f6" },
  { id: "e3", x: 79, y: 31, w: 4.4, h: 5.2, label: "car", conf: 0.88, lane: "East Lane", color: "#3b82f6" },
  { id: "e4", x: 85, y: 30, w: 5.5, h: 6.2, label: "truck", conf: 0.92, lane: "East Lane", color: "#ec4899" },
  { id: "e5", x: 68, y: 41, w: 3.5, h: 4.2, label: "2W", conf: 0.89, lane: "East Lane", color: "#f59e0b" },
  { id: "e6", x: 75, y: 42, w: 4.6, h: 5.4, label: "car", conf: 0.91, lane: "East Lane", color: "#3b82f6" },
  { id: "e7", x: 82, y: 40, w: 4.2, h: 5.0, label: "3W", conf: 0.87, lane: "East Lane", color: "#a855f7" },
  { id: "e8", x: 89, y: 43, w: 4.8, h: 5.5, label: "car", conf: 0.94, lane: "East Lane", color: "#3b82f6" },

  // North Lane Vehicles
  { id: "n1", x: 32, y: 12, w: 4.2, h: 5.0, label: "car", conf: 0.92, lane: "North Lane", color: "#3b82f6" },
  { id: "n2", x: 38, y: 14, w: 4.0, h: 4.8, label: "car", conf: 0.89, lane: "North Lane", color: "#3b82f6" },
  { id: "n3", x: 34, y: 22, w: 4.4, h: 5.2, label: "car", conf: 0.94, lane: "North Lane", color: "#3b82f6" },

  // South Lane Vehicles
  { id: "s1", x: 50, y: 82, w: 4.5, h: 5.3, label: "car", conf: 0.90, lane: "South Lane", color: "#3b82f6" },
  { id: "s2", x: 58, y: 84, w: 4.8, h: 5.6, label: "car", conf: 0.93, lane: "South Lane", color: "#3b82f6" },

  // Center Junction Vehicles
  { id: "c1", x: 48, y: 48, w: 4.6, h: 5.5, label: "car", conf: 0.92, lane: "Center", color: "#ef4444" },
];

/** Dense Thermal Jet Heatmap Centers */
const THERMAL_BLOBS = [
  // West Lane Hot Cluster
  { cx: 16, cy: 59, r: 18, intensity: 1.0 },
  { cx: 24, cy: 62, r: 15, intensity: 0.9 },
  { cx: 9, cy: 60, r: 14, intensity: 0.8 },
  // East Lane Hot Cluster
  { cx: 76, cy: 36, r: 20, intensity: 1.0 },
  { cx: 86, cy: 35, r: 16, intensity: 0.85 },
  { cx: 68, cy: 38, r: 14, intensity: 0.75 },
  // North Lane Cluster
  { cx: 35, cy: 18, r: 14, intensity: 0.85 },
  // South Lane Cluster
  { cx: 54, cy: 85, r: 15, intensity: 0.8 },
];

export default function PerceptionPage() {
  const [activeFeedId, setActiveFeedId] = useState<string>("sitabuldi");

  // Visual toggles
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showBBoxes, setShowBBoxes] = useState<boolean>(true);
  const [showPolygons, setShowPolygons] = useState<boolean>(true);
  const [showSignals, setShowSignals] = useState<boolean>(true);

  // Dynamic Signal Timing & Traffic Flow Cycle
  const [activeGreenLane, setActiveGreenLane] = useState<string>("East Lane");
  const [cycleCountdown, setCycleCountdown] = useState<number>(38);
  const [ambulanceActive, setAmbulanceActive] = useState<boolean>(false);
  const [gridlockSimulated, setGridlockSimulated] = useState<boolean>(false);
  const [gridlockTimer, setGridlockTimer] = useState<number>(0);
  const [policeAlert, setPoliceAlert] = useState<boolean>(false);

  // Dynamic vehicle counts
  const [laneCounts, setLaneCounts] = useState<{ "North Lane": number; "South Lane": number; "East Lane": number; "West Lane": number }>({
    "North Lane": 14,
    "South Lane": 8,
    "East Lane": 24,
    "West Lane": 19,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Adaptive Traffic Signal Control Cycle
  useEffect(() => {
    const timer = setInterval(() => {
      if (ambulanceActive) return; // Freeze cycle during ambulance priority

      setCycleCountdown((prev) => {
        if (prev <= 1) {
          // Switch to next busiest lane
          const lanes = ["East Lane", "West Lane", "North Lane", "South Lane"];
          setActiveGreenLane((curr) => {
            const nextIdx = (lanes.indexOf(curr) + 1) % lanes.length;
            const nextLane = lanes[nextIdx];
            // Simulate traffic count fluctuation
            setLaneCounts((c) => ({
              ...c,
              [curr]: Math.max(6, c[curr as keyof typeof c] - 8),
              [nextLane]: Math.min(30, c[nextLane as keyof typeof c] + 7),
            }));
            return nextLane;
          });
          return Math.floor(Math.random() * 15) + 25; // 25s - 40s
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

  // High-Contrast Canvas COLORMAP_JET Heatmap Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !showHeatmap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let frameCount = 0;

    const renderHeatmap = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameCount += 0.05;
      const pulse = Math.sin(frameCount) * 0.08 + 0.92;

      // Draw each thermal blob using OpenCV JET color gradient
      THERMAL_BLOBS.forEach((blob) => {
        const x = (blob.cx / 100) * canvas.width;
        const y = (blob.cy / 100) * canvas.height;
        const radius = (blob.r / 100) * canvas.width * pulse;

        // Vivid COLORMAP_JET: Red (core) -> Orange -> Yellow -> Green -> Cyan -> Blue (edge)
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0.0, `rgba(255, 0, 0, ${0.85 * blob.intensity})`);
        grad.addColorStop(0.2, `rgba(255, 120, 0, ${0.75 * blob.intensity})`);
        grad.addColorStop(0.4, `rgba(255, 235, 0, ${0.65 * blob.intensity})`);
        grad.addColorStop(0.6, `rgba(0, 255, 100, ${0.50 * blob.intensity})`);
        grad.addColorStop(0.8, `rgba(0, 180, 255, ${0.35 * blob.intensity})`);
        grad.addColorStop(1.0, "rgba(0, 30, 255, 0.0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(renderHeatmap);
    };

    renderHeatmap();
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
            YOLOv8 Object Detection + COLORMAP_JET Thermal Heatmap + Real-Time Adaptive Signal Lights + Gridlock Police Dispatch.
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

      {/* Feed Selector & Layer Controls */}
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
              <span>Thermal Heatmap ({showHeatmap ? "ON" : "OFF"})</span>
            </button>

            <button
              onClick={() => setShowBBoxes(!showBBoxes)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-bold border transition-all cursor-pointer ${
                showBBoxes
                  ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                  : "bg-white text-slate-600 border-slate-300 hover:text-ink"
              }`}
            >
              <ScanEye size={13} />
              <span>YOLO Boxes ({showBBoxes ? "ON" : "OFF"})</span>
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
        {/* Left 8 Cols: Video Stage with Full Overlays */}
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
                  30.0 FPS · YOLOv8s · COLORMAP_JET
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

              {/* 3. Intense Live Thermal JET Heatmap Overlay */}
              {showHeatmap && (
                <canvas
                  ref={canvasRef}
                  width={1280}
                  height={720}
                  className="absolute inset-0 h-full w-full pointer-events-none z-15 mix-blend-color-dodge opacity-85"
                />
              )}

              {/* 4. YOLO Object Detection Bounding Boxes Overlay */}
              {showBBoxes && (
                <div className="absolute inset-0 pointer-events-none z-20">
                  {VEHICLE_DETECTIONS.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        left: `${v.x}%`,
                        top: `${v.y}%`,
                        width: `${v.w}%`,
                        height: `${v.h}%`,
                        borderColor: v.color,
                      }}
                      className="absolute rounded border-2 shadow-[0_0_8px_rgba(0,0,0,0.5)] transition-all duration-300"
                    >
                      {/* Tracking center dot */}
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-yellow-300 shadow-[0_0_4px_#fef08a]" />

                      {/* Class Label Badge */}
                      <span
                        style={{ backgroundColor: v.color }}
                        className="absolute -top-3.5 left-0 rounded px-1 text-[0.5rem] font-mono font-black text-white whitespace-nowrap shadow"
                      >
                        {v.label} {Math.round(v.conf * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. Physical Stopline Traffic Signals with Active LED Glow */}
              {showSignals && (
                <div className="absolute inset-0 pointer-events-none z-25">
                  {Object.entries(PHYSICAL_SIGNALS).map(([lane, pos]) => {
                    const isGreen = activeGreenLane === lane;
                    return (
                      <div
                        key={lane}
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                      >
                        {/* Traffic Signal Housing */}
                        <div className="rounded border-2 border-slate-800 bg-[#0b0f19] p-1 shadow-2xl backdrop-blur-sm flex flex-col items-center gap-1 w-7">
                          {/* Red Lamp */}
                          <span
                            className={`h-3.5 w-3.5 rounded-full transition-all duration-300 ${
                              !isGreen
                                ? "bg-red-500 shadow-[0_0_14px_#ef4444] ring-2 ring-red-300 animate-pulse"
                                : "bg-red-950 opacity-30"
                            }`}
                          />
                          {/* Green Lamp */}
                          <span
                            className={`h-3.5 w-3.5 rounded-full transition-all duration-300 ${
                              isGreen
                                ? "bg-emerald-400 shadow-[0_0_16px_#10b981] ring-2 ring-emerald-200 animate-pulse"
                                : "bg-emerald-950 opacity-30"
                            }`}
                          />
                        </div>
                        {/* Signal Status Pill */}
                        <span
                          className={`mt-1 rounded px-1.5 py-0.2 text-[0.58rem] font-black uppercase whitespace-nowrap shadow-lg border ${
                            isGreen
                              ? "bg-emerald-600 text-white border-emerald-400"
                              : "bg-red-900 text-red-200 border-red-700"
                          }`}
                        >
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
                <span>Active Green: <b className="text-emerald-400">{activeGreenLane} ({cycleCountdown}s)</b></span>
                <span>•</span>
                <span>Thermal: <b className="text-amber-400">JET 85%</b></span>
              </div>
            </div>
          </div>

          {/* 4-Lane Physical Traffic Signal Telemetry Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { lane: "North Lane", count: laneCounts["North Lane"], isGreen: activeGreenLane === "North Lane" },
              { lane: "South Lane", count: laneCounts["South Lane"], isGreen: activeGreenLane === "South Lane" },
              { lane: "East Lane", count: laneCounts["East Lane"], isGreen: activeGreenLane === "East Lane" },
              { lane: "West Lane", count: laneCounts["West Lane"], isGreen: activeGreenLane === "West Lane" },
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
                        s.isGreen ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" : "bg-red-500"
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
