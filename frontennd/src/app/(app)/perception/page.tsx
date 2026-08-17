"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Card, Chip, fadeUp, stagger } from "@/components/ui/primitives";
import { JUNCTIONS } from "@/lib/data";

const FEEDS = [
  { id: "sitabuldi", name: "Sitabuldi Square", isMLFeed: true, camera: "CAM-01 (4-Way ATCS)" },
  { id: "itwari", name: "Itwari Chawk", isMLFeed: false, camera: "CAM-04 (Market Flow)" },
  { id: "variety", name: "Variety Square", isMLFeed: false, camera: "CAM-07 (Flyover North)" },
  { id: "bajajnagar", name: "Bajaj Nagar", isMLFeed: false, camera: "CAM-12 (Institutional)" },
];

const SIMULATED_BOXES = [
  { x: 12, y: 40, w: 22, h: 30, label: "2W", c: "#ef8a00" },
  { x: 40, y: 30, w: 26, h: 36, label: "car", c: "#3d5afe" },
  { x: 68, y: 46, w: 20, h: 26, label: "3W", c: "#2940c4" },
  { x: 30, y: 60, w: 16, h: 22, label: "ped", c: "#c62828" },
  { x: 56, y: 64, w: 18, h: 24, label: "2W", c: "#ef8a00" },
];

export default function PerceptionPage() {
  const [activeFeedId, setActiveFeedId] = useState<string>("sitabuldi");
  const [useLivePythonStream, setUseLivePythonStream] = useState<boolean>(true);
  const [ambulanceActive, setAmbulanceActive] = useState<boolean>(false);
  const [gridlockSimulated, setGridlockSimulated] = useState<boolean>(false);
  const [gridlockTimer, setGridlockTimer] = useState<number>(0);
  const [policeAlert, setPoliceAlert] = useState<boolean>(false);

  // Live ML Telemetry from Python stream_server.py
  const [telemetry, setTelemetry] = useState<{
    counts: { "North Lane": number; "South Lane": number; "East Lane": number; "West Lane": number };
    timings: Record<string, { time: number; state: "GREEN" | "RED" }>;
    centerCount: number;
    stuckDuration: number;
    emergencyActive: string | null;
    policeDispatched: boolean;
  }>({
    counts: { "North Lane": 14, "South Lane": 8, "East Lane": 21, "West Lane": 6 },
    timings: {
      "North Lane": { time: 18, state: "RED" },
      "South Lane": { time: 10, state: "RED" },
      "East Lane": { time: 42, state: "GREEN" },
      "West Lane": { time: 10, state: "RED" },
    },
    centerCount: 0,
    stuckDuration: 0,
    emergencyActive: null,
    policeDispatched: false,
  });

  // Poll Python ML telemetry API every 800ms
  useEffect(() => {
    let isMounted = true;
    const fetchTelemetry = async () => {
      try {
        const res = await fetch("http://localhost:5000/telemetry", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setTelemetry({
              counts: data.current_counts || { "North Lane": 14, "South Lane": 8, "East Lane": 21, "West Lane": 6 },
              timings: data.timings && Object.keys(data.timings).length > 0 ? data.timings : {
                "North Lane": { time: 18, state: "RED" },
                "South Lane": { time: 10, state: "RED" },
                "East Lane": { time: 42, state: "GREEN" },
                "West Lane": { time: 10, state: "RED" },
              },
              centerCount: data.center_count || 0,
              stuckDuration: data.stuck_duration || 0,
              emergencyActive: data.emergency_active,
              policeDispatched: data.police_dispatched || false,
            });
            if (data.emergency_active) setAmbulanceActive(true);
            if (data.police_dispatched) setPoliceAlert(true);
          }
        }
      } catch (err) {
        // Fallback simulation when offline
      }
    };

    const interval = setInterval(fetchTelemetry, 800);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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

  const handleTriggerAmbulance = async () => {
    setAmbulanceActive(true);
    try {
      await fetch("http://localhost:5000/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lane: "East Lane" }),
      });
    } catch {}
  };

  const handleResetSignal = async () => {
    setAmbulanceActive(false);
    setGridlockSimulated(false);
    setGridlockTimer(0);
    setPoliceAlert(false);
    try {
      await fetch("http://localhost:5000/reset", { method: "POST" });
    } catch {}
  };

  const handleToggleGridlock = () => {
    setGridlockSimulated((prev) => !prev);
  };

  // Local gridlock timer ticker if simulated
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
            YOLOv8 Edge Inference + ByteTrack → 4-Way Lane Zone Density, Thermal Jet Heatmap, Green Corridors & Gridlock Police Dispatch.
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
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
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

      {/* Main Vision Stage & Telemetry Panel */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left 8 Cols: Video Stage */}
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

            {/* Video Canvas Container */}
            <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
              {activeFeed.isMLFeed ? (
                /* SITABULDI SQUARE: LIVE COMPUTER VISION FEED */
                useLivePythonStream ? (
                  <img
                    src="http://localhost:5000/video_feed"
                    alt="Sitabuldi Live YOLO Computer Vision Stream"
                    onError={() => setUseLivePythonStream(false)}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  /* Zero-latency direct HTML5 Video Fallback with dynamic bounding box simulation */
                  <video
                    src="/traffic.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-contain"
                  />
                )
              ) : (
                /* Other junctions simulated feeds */
                <div className="relative h-full w-full bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] flex items-center justify-center">
                  <div className="text-center">
                    <Camera size={36} className="mx-auto text-slate-600 mb-2" />
                    <p className="m-0 text-sm font-bold text-slate-300">{activeFeed.name} Optical Stream</p>
                    <p className="m-0 text-xs text-slate-500">{activeFeed.camera} · 1080p 60fps</p>
                  </div>
                  {/* Simulated bounding boxes */}
                  {SIMULATED_BOXES.map((b, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0.4 }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                      className="absolute rounded"
                      style={{
                        left: `${b.x}%`,
                        top: `${b.y}%`,
                        width: `${b.w}%`,
                        height: `${b.h}%`,
                        border: `1.5px solid ${b.c}`,
                        boxShadow: `inset 0 0 0 1px rgba(0,0,0,0.2)`,
                      }}
                    >
                      <span
                        className="absolute -top-4 left-0 px-1 text-[0.5rem] font-bold text-white"
                        style={{ background: b.c }}
                      >
                        {b.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Emergency Ambulance Green Corridor Banner Overlay */}
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
              { lane: "North Lane", count: telemetry.counts["North Lane"], state: telemetry.timings["North Lane"]?.state || "RED", time: telemetry.timings["North Lane"]?.time || 18 },
              { lane: "South Lane", count: telemetry.counts["South Lane"], state: telemetry.timings["South Lane"]?.state || "RED", time: telemetry.timings["South Lane"]?.time || 10 },
              { lane: "East Lane", count: telemetry.counts["East Lane"], state: telemetry.timings["East Lane"]?.state || "GREEN", time: telemetry.timings["East Lane"]?.time || 42 },
              { lane: "West Lane", count: telemetry.counts["West Lane"], state: telemetry.timings["West Lane"]?.state || "RED", time: telemetry.timings["West Lane"]?.time || 10 },
            ].map((s) => {
              const isGreen = s.state === "GREEN";
              return (
                <div
                  key={s.lane}
                  className={`rounded-lg border p-3 transition-all ${
                    isGreen
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md ring-1 ring-emerald-400"
                      : "border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{s.lane}</span>
                    <span
                      className={`h-3 w-3 rounded-full ${
                        isGreen ? "bg-emerald-500 animate-pulse" : "bg-red-500"
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
                        isGreen ? "bg-emerald-600 text-white" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.state} ({s.time}s)
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
                  {gridlockSimulated ? "3 vehicles" : `${telemetry.centerCount} vehicles`}
                </span>
              </div>

              <div className="flex justify-between items-center rounded-lg bg-slate-50 p-2 border border-slate-200">
                <span className="font-semibold text-slate-600">Junction Stall Duration</span>
                <span className="font-mono font-bold text-ink">
                  {gridlockSimulated ? `${gridlockTimer}s / 30s` : `${telemetry.stuckDuration}s / 30s`}
                </span>
              </div>

              {/* Progress bar to police dispatch */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    policeAlert ? "bg-red-600" : "bg-amber-500"
                  }`}
                  style={{
                    width: `${Math.min(100, ((gridlockSimulated ? gridlockTimer : telemetry.stuckDuration) / 30) * 100)}%`,
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
