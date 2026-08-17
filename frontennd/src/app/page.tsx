"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CloudRain,
  Droplets,
  Thermometer,
  Eye,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  Info,
  Phone,
  Send,
  Navigation,
  Crosshair,
  Compass,
  CheckCircle2,
  Menu,
  X,
  Radio,
  Play,
  Pause,
  Layers,
  Zap,
  Globe,
  RefreshCw,
  Wind,
} from "lucide-react";
import { Wordmark, TrafficDiamondSignLogo } from "@/components/brand";
import { Display } from "@/components/ui/primitives";
import {
  JUNCTIONS,
  ROAD_SEGMENTS,
  getDistanceKm,
} from "@/lib/data";
import { REGIONAL_CITIES } from "@/lib/weatherRadarData";
import {
  fetchLiveNagpurWeather,
  type LiveWeatherData,
} from "@/lib/weatherService";
import { useTranslation, useLanguageStore } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { tierFromScore } from "@/lib/utils";
import { SurakshaNetraIntro } from "@/components/ui/SurakshaNetraIntro";
import { CitizenReportModal } from "@/components/ui/CitizenReportModal";
import { ContactModal } from "@/components/ui/ContactModal";
import { LanguageSelectorModal } from "@/components/ui/LanguageSelectorModal";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

const CitizenMap = dynamic(() => import("@/components/map/CitizenMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-canvas text-sm font-bold text-ink-faint">
      Loading Traffic & Weather Radar…
    </div>
  ),
});

const DEFAULT_NAGPUR_LOC: [number, number] = [21.1496, 79.086]; // Sitabuldi Central

/* ── Live Clock ── */
function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return <span className="text-xs text-ink-faint">--:--</span>;
  return (
    <span className="font-mono text-xs font-bold tabular-nums text-ink">
      {now.toLocaleTimeString("en-IN", { hour12: true })}
    </span>
  );
}

export default function LandingPage() {
  const { t, lang } = useTranslation();
  const incidents = useAppStore((s) => s.incidents);
  const activeIncidents = incidents.filter((i) => i.status === "active");

  const [reportOpen, setReportOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<"none" | "nearby" | "radar" | "status" | "weather" | "alerts">("nearby");

  // Geolocation state
  const [userLoc, setUserLoc] = useState<[number, number]>(DEFAULT_NAGPUR_LOC);
  const [locName, setLocName] = useState<string>("Sitabuldi / Central Nagpur");
  const [isLiveGps, setIsLiveGps] = useState<boolean>(false);
  const [flyTrigger, setFlyTrigger] = useState<number>(0);

  // Dynamic Live Weather State (Open-Meteo Live API)
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData>({
    tempC: 25.4,
    humidity: 93,
    rainMm: 0.1,
    precipitation: 0.1,
    weatherCode: 51,
    condition: "Light Drizzle",
    windSpeedKmH: 12,
    lastUpdated: "Just now",
    isLiveSynced: true,
  });
  const [isRefreshingWeather, setIsRefreshingWeather] = useState<boolean>(false);

  // 500km Doppler Weather Radar state
  const [viewMode, setViewMode] = useState<"city" | "radar500">("city");
  const [showRadar, setShowRadar] = useState<boolean>(true);
  const [showLightning, setShowLightning] = useState<boolean>(true);
  const [forecastOffsetMin, setForecastOffsetMin] = useState<number>(0);
  const [isPlayingRadar, setIsPlayingRadar] = useState<boolean>(false);

  const isRaining = liveWeather.rainMm > 0.05;
  const highRisk = JUNCTIONS.filter((j) => tierFromScore(j.risk) === "high");
  const waterlogged = JUNCTIONS.filter((j) => j.waterlogged);
  const totalOfficers = JUNCTIONS.reduce((s, j) => s + j.officersAssigned, 0);

  // Load live weather from Open-Meteo API
  const refreshWeather = useCallback(async () => {
    setIsRefreshingWeather(true);
    const data = await fetchLiveNagpurWeather();
    setLiveWeather(data);
    setIsRefreshingWeather(false);
  }, []);

  useEffect(() => {
    refreshWeather();
    const interval = setInterval(refreshWeather, 180000); // refresh every 3 min
    return () => clearInterval(interval);
  }, [refreshWeather]);

  // Auto-play timeline loop for Doppler forecast scrubber
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingRadar) {
      interval = setInterval(() => {
        setForecastOffsetMin((prev) => (prev >= 120 ? 0 : prev + 30));
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isPlayingRadar]);

  // Request browser geolocation
  const handleLocateMe = () => {
    setViewMode("city");
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const isNagpur = lat >= 20.8 && lat <= 21.4 && lng >= 78.8 && lng <= 79.4;
          if (isNagpur) {
            setUserLoc([lat, lng]);
            setLocName("Your Live GPS Location");
            setIsLiveGps(true);
          } else {
            setUserLoc(DEFAULT_NAGPUR_LOC);
            setLocName("Sitabuldi Hub (Nagpur Ref)");
            setIsLiveGps(false);
          }
          setFlyTrigger((prev) => prev + 1);
        },
        () => {
          setUserLoc(DEFAULT_NAGPUR_LOC);
          setLocName("Sitabuldi Hub (Default)");
          setIsLiveGps(false);
          setFlyTrigger((prev) => prev + 1);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  useEffect(() => {
    handleLocateMe();
  }, []);

  // Compute nearby road and traffic status relative to user location
  const nearbyData = useMemo(() => {
    const [uLat, uLng] = userLoc;
    const sorted = [...ROAD_SEGMENTS]
      .map((road) => {
        let minD = Infinity;
        for (const pt of road.path) {
          const d = getDistanceKm(uLat, uLng, pt[0], pt[1]);
          if (d < minD) minD = d;
        }
        return { ...road, distanceKm: minD };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const closest = sorted[0];
    const within2km = sorted.filter((r) => r.distanceKm <= 2.5);
    const heavyNearby = within2km.filter((r) => r.traffic === "heavy");
    const clearNearby = within2km.filter((r) => r.traffic === "light");
    const floodNearby = within2km.filter((r) => r.floodProne && isRaining);

    return {
      closest,
      nearestList: sorted.slice(0, 4),
      heavyCount: heavyNearby.length,
      clearCount: clearNearby.length,
      floodCount: floodNearby.length,
    };
  }, [userLoc, isRaining]);

  return (
    <div className="citizen-portal relative flex h-screen w-screen flex-col overflow-hidden bg-[#eef2f8]">
      {/* 2-Second Cinematic Traffic Signal Intro */}
      <SurakshaNetraIntro />

      {/* First-time Language Selection Modal (English / Hindi / Marathi) */}
      <LanguageSelectorModal />

      {/* Citizen Report Modal */}
      <CitizenReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />

      {/* Contact & Helpline Modal */}
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />

      {/* ═══ Top Navigation Bar (Minimalist Glassmorphism) ═══ */}
      <header className="relative z-[1200] flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-3 backdrop-blur-xl sm:px-5 shadow-sm">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <Wordmark compact />
          </Link>
        </div>

        {/* Center: View Switcher (City Traffic vs 500km Doppler Radar) */}
        <div className="hidden lg:flex items-center rounded-md border border-slate-200 bg-slate-100/90 p-1 shadow-inner">
          <button
            onClick={() => setViewMode("city")}
            className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
              viewMode === "city"
                ? "bg-white text-ink shadow-sm ring-1 ring-slate-300"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            <Compass size={13} className="text-[#10b981]" />
            <span>{t.viewCityTraffic}</span>
          </button>

          <button
            onClick={() => setViewMode("radar500")}
            className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
              viewMode === "radar500"
                ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-300"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            <CloudRain size={13} className="text-water animate-pulse" />
            <span>{t.viewRadar500}</span>
            <span className="rounded bg-blue-100 px-1 py-0.2 text-[0.55rem] font-extrabold text-blue-700 uppercase">
              MSN Style
            </span>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-2 md:flex">
          {/* Language Toggle (EN | HI | MR) */}
          <LanguageToggle />

          <div className="h-4 w-px bg-slate-200 mx-1" />

          {/* Live Web Weather status pill */}
          <button
            onClick={() => setViewMode(viewMode === "city" ? "radar500" : "city")}
            title="Click to toggle 500km Doppler radar"
            className="flex items-center gap-1.5 rounded-md border border-water/30 bg-water-tint px-2.5 py-1 text-left hover:bg-water-tint/80 transition-all cursor-pointer"
          >
            <CloudRain size={13} className="text-water" />
            <span className="text-[0.7rem] font-bold text-water">
              {liveWeather.condition} · {liveWeather.tempC}°C
            </span>
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          <LiveClock />

          <div className="h-4 w-px bg-slate-200 mx-1" />

          {/* About Us */}
          <Link
            href="/about"
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold text-ink-soft hover:bg-slate-100 hover:text-ink transition-colors"
          >
            <Info size={14} className="text-[#10b981]" />
            <span>{t.navAbout}</span>
          </Link>

          {/* Contact Us */}
          <button
            onClick={() => setContactOpen(true)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold text-ink-soft hover:bg-slate-100 hover:text-ink transition-colors cursor-pointer"
          >
            <Phone size={14} className="text-risk-low" />
            <span>{t.navHelplines}</span>
          </button>

          {/* Report Traffic Tab */}
          <button
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 shadow-sm hover:bg-red-100 transition-all cursor-pointer"
          >
            <Send size={12} />
            <span>{t.navReport}</span>
          </button>

          {/* Enter Console */}
          <Link
            href="/login"
            className="btn-brut btn-brut-fill ml-2 text-xs py-1.5 px-3.5 flex items-center gap-1.5"
          >
            <span>{t.navConsole}</span>
            <ArrowRight size={13} />
          </Link>
        </nav>

        {/* Mobile Action Row */}
        <div className="flex items-center gap-1.5 md:hidden">
          <LanguageToggle />

          <button
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[0.7rem] font-bold text-red-600"
          >
            <Send size={11} />
            <span>{t.navReport}</span>
          </button>

          <Link
            href="/login"
            className="btn-brut btn-brut-fill text-[0.7rem] py-1 px-2.5"
          >
            Console
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="grid h-8 w-8 place-items-center rounded-md text-ink-soft hover:bg-slate-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 left-0 right-0 z-[1250] border-b border-line bg-white/95 p-4 shadow-xl backdrop-blur-xl md:hidden"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="text-xs font-bold text-ink-soft">Live Open-Meteo Telemetry</span>
                <span className="text-xs font-bold text-water">{liveWeather.condition} · {liveWeather.tempC}°C</span>
              </div>

              <button
                onClick={() => {
                  setViewMode(viewMode === "city" ? "radar500" : "city");
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md p-2 text-left text-xs font-bold text-blue-700 bg-blue-50"
              >
                <CloudRain size={15} />
                <span>{t.viewRadar500}</span>
              </button>

              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-md p-2 text-xs font-bold text-ink hover:bg-slate-50"
              >
                <Info size={15} className="text-[#10b981]" />
                <span>{t.navAbout}</span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setContactOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-md p-2 text-left text-xs font-bold text-ink hover:bg-slate-50"
              >
                <Phone size={15} className="text-risk-low" />
                <span>{t.navHelplines}</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setReportOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-md bg-red-50 p-2 text-left text-xs font-bold text-red-600"
              >
                <AlertTriangle size={15} />
                <span>{t.reportTitle}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Map Viewport Canvas ═══ */}
      <div className="relative flex-1">
        <div className="absolute inset-0 z-0">
          <CitizenMap
            rainMm={liveWeather.rainMm}
            userLocation={userLoc}
            flyTrigger={flyTrigger}
            viewMode={viewMode}
            showRadar={showRadar}
            showLightning={showLightning}
            forecastOffsetMin={forecastOffsetMin}
          />
        </div>

        {/* Floating "Locate Me" GPS Button & View Switcher */}
        <div className="absolute right-3 bottom-14 md:bottom-5 z-[1150] flex flex-col gap-2">
          <button
            onClick={() => setViewMode(viewMode === "city" ? "radar500" : "city")}
            className="flex items-center gap-2 rounded-md border border-slate-700 bg-[#0f172a] text-white px-3 py-2 text-xs font-bold shadow-2xl hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            <Globe size={14} className="text-sky-400" />
            <span className="hidden sm:inline">
              {viewMode === "city" ? t.viewRadar500 : t.viewCityTraffic}
            </span>
          </button>

          <button
            onClick={handleLocateMe}
            title={t.locateMe}
            className="flex items-center gap-2 rounded-md border border-slate-700 bg-[#0f172a] text-white px-3 py-2 text-xs font-bold shadow-2xl hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            <Crosshair size={14} className="text-blue-400 animate-spin-slow" />
            <span className="hidden sm:inline">{t.locateMe}</span>
          </button>
        </div>

        {/* ── 500KM DOPPLER RADAR BOTTOM CONTROL BAR (MSN Weather Style) ── */}
        {viewMode === "radar500" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1120] w-[92%] max-w-xl rounded-md border border-slate-700 bg-[#0d1322]/95 p-3 text-white shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                <span className="text-xs font-black tracking-wider text-slate-100 uppercase">
                  {t.regionalRadarTitle}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-[0.68rem] text-slate-300 font-bold">
                  <input
                    type="checkbox"
                    checked={showLightning}
                    onChange={(e) => setShowLightning(e.target.checked)}
                    className="accent-amber-400 rounded cursor-pointer"
                  />
                  <span>⚡ {t.thunderstormPaths}</span>
                </label>
              </div>
            </div>

            {/* Timeline scrubber control */}
            <div className="mt-2.5 flex items-center gap-3">
              <button
                onClick={() => setIsPlayingRadar(!isPlayingRadar)}
                className="grid h-8 w-8 place-items-center rounded bg-blue-600 hover:bg-blue-500 text-white shrink-0 shadow cursor-pointer"
              >
                {isPlayingRadar ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>

              <div className="flex-1">
                <div className="flex justify-between text-[0.62rem] font-bold text-slate-400 mb-1">
                  {["Now", "+30m", "+60m", "+90m", "+120m"].map((label, idx) => (
                    <button
                      key={label}
                      onClick={() => {
                        setForecastOffsetMin(idx * 30);
                        setIsPlayingRadar(false);
                      }}
                      className={`cursor-pointer transition-all ${
                        forecastOffsetMin === idx * 30
                          ? "text-sky-300 font-black underline underline-offset-2"
                          : "hover:text-slate-200"
                      }`}
                    >
                      {idx === 0 ? t.now : label}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="30"
                  value={forecastOffsetMin}
                  onChange={(e) => {
                    setForecastOffsetMin(Number(e.target.value));
                    setIsPlayingRadar(false);
                  }}
                  className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
                />
              </div>

              <div className="text-right shrink-0">
                <span className="text-[0.68rem] font-mono font-bold text-sky-300">
                  {forecastOffsetMin === 0 ? "LIVE RADAR" : `${t.forecast} +${forecastOffsetMin}m`}
                </span>
              </div>
            </div>

            {/* MSN Weather Radar Gradient Scale */}
            <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[0.6rem] font-bold text-slate-400">
              <span>{t.lightRain}</span>
              <div className="h-2 w-36 rounded-full msn-radar-gradient shadow-inner" />
              <span>{t.heavyRain} ⚡</span>
            </div>
          </motion.div>
        )}

        {/* ── DESKTOP HUD CARDS (City Mode) ── */}

        {/* Top-Left: 📍 NEARBY TRAFFIC AROUND YOUR LOCATION ── */}
        {viewMode === "city" && (
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="hidden md:block absolute left-4 top-4 z-[1100] w-[295px]"
          >
            <div className="glass rounded-md border border-slate-300/80 p-3.5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                  </span>
                  <span className="text-xs font-black text-ink">{t.aroundLocation}</span>
                </div>
                <span className="text-[0.62rem] font-bold text-slate-500 uppercase tracking-wider">
                  {isLiveGps ? t.liveGps : t.centralHub}
                </span>
              </div>

              {/* Closest Road Callout */}
              {nearbyData.closest && (
                <div className="mt-2.5 rounded-md border border-slate-200 bg-slate-50 p-2.5">
                  <p className="m-0 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                    {t.nearestCorridor} ({Math.round(nearbyData.closest.distanceKm * 1000)}m {t.away})
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="m-0 text-xs font-black text-ink truncate max-w-[170px]">
                      {nearbyData.closest.name}
                    </p>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[0.6rem] font-black uppercase ${
                        nearbyData.closest.traffic === "heavy"
                          ? "bg-red-100 text-red-700"
                          : nearbyData.closest.traffic === "moderate"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {nearbyData.closest.floodProne && isRaining
                        ? "Waterlogged"
                        : `${nearbyData.closest.traffic} Flow`}
                    </span>
                  </div>
                </div>
              )}

              {/* Vicinity Quick Numbers */}
              <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
                <div className="rounded bg-emerald-50 border border-emerald-200/60 p-1.5">
                  <p className="m-0 text-sm font-black text-emerald-700">{nearbyData.clearCount}</p>
                  <p className="m-0 text-[0.55rem] font-bold text-emerald-600 uppercase">{t.clearLanes}</p>
                </div>
                <div className="rounded bg-amber-50 border border-amber-200/60 p-1.5">
                  <p className="m-0 text-sm font-black text-amber-700">{nearbyData.heavyCount}</p>
                  <p className="m-0 text-[0.55rem] font-bold text-amber-600 uppercase">{t.congested}</p>
                </div>
                <div className="rounded bg-sky-50 border border-sky-200/60 p-1.5">
                  <p className="m-0 text-sm font-black text-sky-700">{nearbyData.floodCount}</p>
                  <p className="m-0 text-[0.55rem] font-bold text-sky-600 uppercase">{t.floodAlert}</p>
                </div>
              </div>

              {/* Nearest road list */}
              <div className="mt-2.5 space-y-1">
                <p className="m-0 text-[0.6rem] font-bold uppercase tracking-wider text-slate-400">
                  {t.adjacentRoads}
                </p>
                {nearbyData.nearestList.slice(1, 4).map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-none">
                    <span className="text-[0.68rem] font-semibold text-slate-700 truncate max-w-[160px]">
                      {r.name}
                    </span>
                    <span className="text-[0.62rem] font-bold text-slate-500">
                      {Math.round(r.distanceKm * 1000)}m ·{" "}
                      <span
                        style={{
                          color:
                            r.traffic === "heavy"
                              ? "#ef4444"
                              : r.traffic === "moderate"
                              ? "#f59e0b"
                              : "#10b981",
                        }}
                      >
                        {r.traffic}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom-Left: Live Nagpur Weather Card (Open-Meteo Synced) */}
        {viewMode === "city" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="hidden md:block absolute bottom-4 left-4 z-[1100]"
          >
            <div className="glass rounded-md border border-slate-300/80 p-3 shadow-xl w-[260px]">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <CloudRain size={14} className="text-water" />
                  <span className="text-xs font-bold text-ink">{t.liveWeather}</span>
                </div>
                <button
                  onClick={refreshWeather}
                  title="Refresh live weather data"
                  className="flex items-center gap-1 text-[0.62rem] font-bold text-brand hover:underline cursor-pointer"
                >
                  <RefreshCw size={11} className={isRefreshingWeather ? "animate-spin" : ""} />
                  <span>{t.syncBtn}</span>
                </button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
                <div className="flex items-center gap-1 rounded bg-slate-50 p-1.5 border border-slate-200/50">
                  <Thermometer size={12} className="text-slate-400" />
                  <span className="font-bold text-ink">{liveWeather.tempC}°C</span>
                </div>
                <div className="flex items-center gap-1 rounded bg-slate-50 p-1.5 border border-slate-200/50">
                  <Droplets size={12} className="text-water" />
                  <span className="font-bold text-ink">{liveWeather.rainMm} mm/hr</span>
                </div>
                <div className="flex items-center gap-1 rounded bg-slate-50 p-1.5 border border-slate-200/50">
                  <span className="text-[0.6rem] font-bold text-slate-400">{t.humidity}</span>
                  <span className="font-bold text-ink">{liveWeather.humidity}%</span>
                </div>
                <div className="flex items-center gap-1 rounded bg-slate-50 p-1.5 border border-slate-200/50">
                  <Wind size={12} className="text-slate-400" />
                  <span className="font-bold text-ink">{liveWeather.windSpeedKmH} km/h</span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[0.62rem] text-slate-500 font-semibold">
                <span>{t.status}: <b className="text-water">{liveWeather.condition}</b></span>
                <span className="text-[0.58rem] text-slate-400">{t.synced}: {liveWeather.lastUpdated}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Top-Right: Citywide Traffic & Signal Legend */}
        {viewMode === "city" && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="hidden md:block absolute right-4 top-4 z-[1100]"
          >
            <div className="glass rounded-md border border-slate-300/80 p-3 shadow-xl w-[220px]">
              <span className="text-[0.62rem] font-extrabold uppercase tracking-wider text-slate-500">
                {t.trafficLegend}
              </span>
              <div className="mt-1.5 space-y-1.5 text-[0.68rem] font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-5 rounded-sm bg-[#2e7d32]" />
                  <span>{t.greenFreeFlow}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-5 rounded-sm bg-[#f59e0b]" />
                  <span>{t.amberModerate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-5 rounded-sm bg-[#ef4444]" />
                  <span>{t.redHeavy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-5 rounded-sm bg-[#0277bd]" />
                  <span>{t.blueWaterlogged}</span>
                </div>
              </div>

              <div className="mt-2.5 border-t border-slate-200 pt-2">
                <span className="text-[0.62rem] font-extrabold uppercase tracking-wider text-slate-500">
                  {t.junctionRisk}
                </span>
                <div className="mt-1.5 flex items-center justify-between text-[0.65rem] font-black">
                  <span className="text-[#2e7d32]">🟢 {t.low}</span>
                  <span className="text-[#f59e0b]">🟡 {t.med}</span>
                  <span className="text-[#ef4444]">🔴 {t.high}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── MOBILE HUD DRAWER / PILL BAR ── */}
        <div className="absolute bottom-2 inset-x-2 z-[1100] md:hidden">
          <AnimatePresence>
            {mobileActiveTab !== "none" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="mb-2 rounded-md border border-slate-300 bg-white/95 p-3 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-xs font-black text-ink uppercase tracking-wider">
                    {mobileActiveTab === "nearby" && `📍 ${t.aroundLocation}`}
                    {mobileActiveTab === "radar" && `🌧️ ${t.viewRadar500}`}
                    {mobileActiveTab === "status" && t.cityStatus}
                    {mobileActiveTab === "weather" && t.liveWeather}
                    {mobileActiveTab === "alerts" && t.activeHotspots}
                  </span>
                  <button
                    onClick={() => setMobileActiveTab("none")}
                    className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:text-slate-700"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="mt-2 text-xs">
                  {mobileActiveTab === "radar" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-800">{t.regionalRadarTitle}</span>
                        <button
                          onClick={() => setViewMode(viewMode === "city" ? "radar500" : "city")}
                          className="rounded bg-blue-600 px-2 py-0.5 text-white text-[0.65rem] font-bold"
                        >
                          {viewMode === "radar500" ? t.viewCityTraffic : t.viewRadar500}
                        </button>
                      </div>
                      <div className="h-2 rounded-full msn-radar-gradient" />
                      <div className="flex justify-between text-[0.6rem] text-slate-500 font-bold">
                        <span>{t.lightRain}</span>
                        <span>{t.heavyRain} ⚡</span>
                      </div>
                    </div>
                  )}

                  {mobileActiveTab === "nearby" && (
                    <div>
                      {nearbyData.closest && (
                        <div className="rounded bg-slate-50 p-2 border border-slate-200">
                          <span className="text-[0.6rem] font-bold uppercase text-slate-400">{t.nearestCorridor}</span>
                          <p className="m-0 font-bold text-ink">{nearbyData.closest.name} ({Math.round(nearbyData.closest.distanceKm * 1000)}m)</p>
                          <p className="m-0 text-[0.65rem] font-bold" style={{ color: nearbyData.closest.traffic === "heavy" ? "#ef4444" : "#10b981" }}>
                            Status: {nearbyData.closest.traffic.toUpperCase()} TRAFFIC
                          </p>
                        </div>
                      )}
                      <div className="mt-2 grid grid-cols-3 gap-1 text-center">
                        <div className="rounded bg-emerald-50 p-1"><b className="text-emerald-700">{nearbyData.clearCount}</b> <span className="block text-[0.55rem]">{t.clearLanes}</span></div>
                        <div className="rounded bg-amber-50 p-1"><b className="text-amber-700">{nearbyData.heavyCount}</b> <span className="block text-[0.55rem]">{t.congested}</span></div>
                        <div className="rounded bg-sky-50 p-1"><b className="text-sky-700">{nearbyData.floodCount}</b> <span className="block text-[0.55rem]">{t.floodAlert}</span></div>
                      </div>
                    </div>
                  )}

                  {mobileActiveTab === "status" && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded bg-slate-50 p-2">
                        <p className="m-0 text-base font-black text-ink">{JUNCTIONS.length}</p>
                        <p className="m-0 text-[0.6rem] text-slate-400">{t.junctions}</p>
                      </div>
                      <div className="rounded bg-red-50 p-2">
                        <p className="m-0 text-base font-black text-red-600">{highRisk.length}</p>
                        <p className="m-0 text-[0.6rem] text-red-600">{t.highRisk}</p>
                      </div>
                      <div className="rounded bg-slate-50 p-2">
                        <p className="m-0 text-base font-black text-ink">{totalOfficers}</p>
                        <p className="m-0 text-[0.6rem] text-slate-400">{t.officers}</p>
                      </div>
                    </div>
                  )}

                  {mobileActiveTab === "weather" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded bg-slate-50 p-2">Temp: <b>{liveWeather.tempC}°C</b></div>
                      <div className="rounded bg-slate-50 p-2">Rain: <b>{liveWeather.rainMm} mm/hr</b></div>
                      <div className="rounded bg-slate-50 p-2">{t.humidity}: <b>{liveWeather.humidity}%</b></div>
                      <div className="rounded bg-slate-50 p-2">{t.wind}: <b>{liveWeather.windSpeedKmH} km/h</b></div>
                    </div>
                  )}

                  {mobileActiveTab === "alerts" && (
                    <div className="max-h-28 space-y-1 overflow-y-auto">
                      {highRisk.slice(0, 4).map((j) => (
                        <div key={j.id} className="flex justify-between rounded bg-slate-50 p-1 text-[0.65rem]">
                          <span>{lang === "mr" ? j.nameMr : j.name}</span>
                          <span className="font-bold text-red-600">{Math.round(j.risk * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Pill Selector */}
          <div className="flex items-center justify-between rounded-md border border-slate-300 bg-white/95 p-1 shadow-lg backdrop-blur-xl">
            {[
              { id: "nearby", label: "📍 Near Me" },
              { id: "radar", label: "🌧️ Radar" },
              { id: "status", label: "Status" },
              { id: "weather", label: "Weather" },
              { id: "alerts", label: "Alerts" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setMobileActiveTab(mobileActiveTab === tab.id ? "none" : (tab.id as any))
                }
                className={`flex-1 rounded py-1 text-center text-[0.68rem] font-black transition-all ${
                  mobileActiveTab === tab.id
                    ? "bg-[#0f172a] text-white shadow-sm"
                    : "text-slate-600 hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom-Center Legal watermark */}
        <div className="hidden lg:block absolute bottom-1 left-1/2 z-[1100] -translate-x-1/2">
          <span className="rounded bg-white/80 px-2.5 py-0.5 text-[0.55rem] font-bold text-slate-500 backdrop-blur-sm border border-slate-200/60">
            © OpenStreetMap · Open-Meteo Live API · Nagpur Suraksha Netra DSS
          </span>
        </div>
      </div>
    </div>
  );
}
