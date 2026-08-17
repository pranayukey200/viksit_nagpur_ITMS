"use client";

import { Fragment, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Polygon,
  Tooltip,
  Popup,
  Marker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { JUNCTIONS, ROAD_SEGMENTS, TIER_META } from "@/lib/data";
import {
  REGIONAL_RAIN_CELLS,
  REGIONAL_CITIES,
  type RainCell,
} from "@/lib/weatherRadarData";
import { tierFromScore } from "@/lib/utils";

const NAGPUR_CENTER: [number, number] = [21.148, 79.082];

const TRAFFIC_COLORS: Record<string, string> = {
  light: "#2e7d32",
  moderate: "#f59e0b",
  heavy: "#ef4444",
};

const WATERLOG_COLOR = "#0277bd";

// Subtle, realistic Doppler rain colors (organic, non-blotchy)
const RADAR_COLORS: Record<string, { fill: string; stroke: string; opacity: number }> = {
  light: { fill: "#60a5fa", stroke: "#3b82f6", opacity: 0.28 },
  moderate: { fill: "#3b82f6", stroke: "#2563eb", opacity: 0.38 },
  heavy: { fill: "#2563eb", stroke: "#1d4ed8", opacity: 0.50 },
  severe: { fill: "#1e40af", stroke: "#1e3a8a", opacity: 0.65 },
};

/** Custom Lightning Bolt marker icon */
function createLightningIcon(label?: string) {
  return L.divIcon({
    className: "netra-lightning-marker",
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%); cursor:pointer;">
        <span class="lightning-icon" style="font-size: 20px; line-height: 1; filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.9));">⚡</span>
        ${
          label
            ? `<span style="background: rgba(15, 23, 42, 0.85); color: #fef08a; font-size: 9px; font-weight: 800; padding: 1px 4px; border-radius: 4px; white-space: nowrap; margin-top: 2px; border: 1px solid rgba(251, 191, 36, 0.4); backdrop-filter: blur(4px);">${label}</span>`
            : ""
        }
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

/** Controller to fly camera smoothly based on external triggers */
function MapController({
  userLocation,
  flyTrigger,
  viewMode,
}: {
  userLocation: [number, number] | null;
  flyTrigger: number;
  viewMode: "city" | "radar500";
}) {
  const map = useMap();

  useEffect(() => {
    if (viewMode === "radar500") {
      map.flyTo([21.8, 81.2], 7, { duration: 1.2 });
    } else {
      map.flyTo(userLocation || NAGPUR_CENTER, 13, { duration: 1.2 });
    }
  }, [viewMode, map]);

  useEffect(() => {
    if (userLocation && flyTrigger > 0 && viewMode === "city") {
      map.flyTo(userLocation, 14.5, { duration: 1.2 });
    }
  }, [userLocation, flyTrigger, viewMode, map]);

  return null;
}

export default function CitizenMap({
  rainMm = 6.2,
  userLocation = null,
  flyTrigger = 0,
  viewMode = "city",
  showRadar = true,
  showLightning = true,
  forecastOffsetMin = 0,
  onSelectRoad,
}: {
  rainMm?: number;
  userLocation?: [number, number] | null;
  flyTrigger?: number;
  viewMode?: "city" | "radar500";
  showRadar?: boolean;
  showLightning?: boolean;
  forecastOffsetMin?: number;
  onSelectRoad?: (roadName: string) => void;
}) {
  const showWaterlog = rainMm > 5;

  // Filter cells based on view mode: in city mode, only show localized micro-patches; in 500km mode show all
  const filteredCells = useMemo(() => {
    const timeFactor = forecastOffsetMin / 60; // 0 to 2.0 hours
    const cellsToRender =
      viewMode === "city"
        ? REGIONAL_RAIN_CELLS.filter((c) => c.areaType === "local_nagpur")
        : REGIONAL_RAIN_CELLS;

    return cellsToRender.map((cell) => {
      const shiftedPolygon = cell.polygon.map(([lat, lng]) => [
        lat + cell.driftVector[0] * timeFactor,
        lng + cell.driftVector[1] * timeFactor,
      ]) as [number, number][];

      const shiftedLightning = cell.lightning
        ? ([
            cell.lightning[0] + cell.driftVector[0] * timeFactor,
            cell.lightning[1] + cell.driftVector[1] * timeFactor,
          ] as [number, number])
        : undefined;

      return {
        ...cell,
        polygon: shiftedPolygon,
        lightning: shiftedLightning,
      };
    });
  }, [viewMode, forecastOffsetMin]);

  return (
    <MapContainer
      center={viewMode === "radar500" ? [21.8, 81.2] : userLocation || NAGPUR_CENTER}
      zoom={viewMode === "radar500" ? 7 : 13}
      minZoom={6}
      maxZoom={17}
      scrollWheelZoom
      zoomControl
      style={{ height: "100%", width: "100%" }}
      attributionControl={false}
    >
      {/* Google Maps-style clean Carto tile */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap &copy; CARTO'
      />

      <MapController
        userLocation={userLocation}
        flyTrigger={flyTrigger}
        viewMode={viewMode}
      />

      {/* ══════════════════════════════════════════════════════════════════
          LOCALIZED MICRO-RAIN CLUSTERS & 500KM DOPPLER PRECIPITATION RADAR
          ══════════════════════════════════════════════════════════════════ */}
      {showRadar &&
        filteredCells.map((cell) => {
          const style = RADAR_COLORS[cell.intensity] || RADAR_COLORS.moderate;
          return (
            <Fragment key={cell.id}>
              {/* Rain cloud polygon */}
              <Polygon
                positions={cell.polygon}
                pathOptions={{
                  fillColor: style.fill,
                  fillOpacity: cell.areaType === "local_nagpur" ? 0.32 : style.opacity,
                  color: style.stroke,
                  weight: 1.2,
                  dashArray: cell.areaType === "local_nagpur" ? "4 4" : undefined,
                  className: "radar-cell-pulse",
                }}
              >
                <Tooltip
                  sticky
                  direction="center"
                  className="!bg-[#0f172a]/95 !text-white !border !border-sky-400/40 !shadow-2xl !rounded !px-2.5 !py-1.5 !text-xs !font-sans"
                >
                  <div className="leading-tight">
                    <p className="m-0 font-bold text-sky-300">{cell.name}</p>
                    <p className="m-0 text-[0.65rem] text-slate-200">
                      Live Rain Rate: <b className="text-white">{cell.rainRateMm} mm/hr</b>
                    </p>
                    {forecastOffsetMin > 0 && (
                      <p className="m-0 text-[0.6rem] text-sky-400 font-semibold">
                        Forecast Horizon: +{forecastOffsetMin} min
                      </p>
                    )}
                  </div>
                </Tooltip>
              </Polygon>

              {/* Thunderstorm Lightning Strike Pin ⚡ */}
              {showLightning && cell.lightning && (
                <Marker
                  position={cell.lightning}
                  icon={createLightningIcon(cell.lightningLabel)}
                >
                  <Tooltip
                    direction="top"
                    offset={[0, -10]}
                    className="!bg-[#0f172a] !text-amber-300 !border !border-amber-400 !rounded !px-2 !py-0.5 !text-[0.65rem] font-bold"
                  >
                    ⚡ Active Thunderstorm Cell ({cell.rainRateMm} mm/hr)
                  </Tooltip>
                </Marker>
              )}
            </Fragment>
          );
        })}

      {/* ── Regional Reference Cities (when in 500km radar view) ── */}
      {viewMode === "radar500" &&
        REGIONAL_CITIES.map((city) => (
          <CircleMarker
            key={city.name}
            center={city.coords}
            radius={city.name === "Nagpur" ? 7 : 4.5}
            pathOptions={{
              color: "#0f172a",
              weight: 1.5,
              fillColor: city.name === "Nagpur" ? "#ef4444" : "#ffffff",
              fillOpacity: 1,
            }}
          >
            <Tooltip
              permanent
              direction="right"
              offset={[6, 0]}
              className="!bg-white/90 !text-[#0f172a] !border !border-slate-300 !rounded !px-1.5 !py-0.5 !text-[0.65rem] font-bold shadow-md"
            >
              <span>{city.name}</span>{" "}
              <span className="text-[0.55rem] font-semibold text-slate-500">
                ({city.rainRateMm}mm)
              </span>
            </Tooltip>
          </CircleMarker>
        ))}

      {/* ══════════════════════════════════════════════════════════════════
          CITY TRAFFIC CORRIDORS & ROAD LANES
          ══════════════════════════════════════════════════════════════════ */}
      {ROAD_SEGMENTS.map((road) => {
        const isFlooded = road.floodProne && showWaterlog;
        const color = isFlooded ? WATERLOG_COLOR : TRAFFIC_COLORS[road.traffic];
        const weight = isFlooded ? 7 : road.traffic === "heavy" ? 6 : 4.5;

        return (
          <Fragment key={road.id}>
            {/* Outer glow aura for congested/flooded corridors */}
            {(road.traffic === "heavy" || isFlooded) && (
              <Polyline
                positions={road.path}
                pathOptions={{
                  color: isFlooded ? WATERLOG_COLOR : TRAFFIC_COLORS.heavy,
                  weight: weight + 4,
                  opacity: 0.25,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            )}

            {/* Main Road Corridor */}
            <Polyline
              positions={road.path}
              pathOptions={{
                color,
                weight,
                opacity: 0.9,
                lineCap: "round",
                lineJoin: "round",
              }}
              eventHandlers={{
                click: () => onSelectRoad?.(road.name),
              }}
            >
              <Tooltip
                sticky
                direction="top"
                offset={[0, -10]}
                className="!bg-[#0f172a] !text-white !border-none !shadow-xl !rounded-md !px-3 !py-2 !text-xs !font-sans"
              >
                <div className="leading-tight">
                  <p className="m-0 font-bold text-slate-100">{road.name}</p>
                  <p className="m-0 mt-0.5 text-[0.68rem] font-bold" style={{ color: isFlooded ? "#38bdf8" : color }}>
                    {isFlooded ? "⚠ Waterlogged Corridor" : `${road.traffic.toUpperCase()} TRAFFIC`}
                  </p>
                  <p className="m-0 text-[0.6rem] text-slate-400">Avg Risk: {Math.round(road.avgRisk * 100)}%</p>
                </div>
              </Tooltip>

              <Popup className="citizen-popup">
                <div className="p-1 text-xs">
                  <p className="m-0 font-bold text-ink text-sm">{road.name}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: isFlooded ? WATERLOG_COLOR : color }}
                    />
                    <span className="font-bold capitalize" style={{ color: isFlooded ? WATERLOG_COLOR : color }}>
                      {isFlooded ? "Waterlogged (Monsoon Warning)" : `${road.traffic} Traffic Flow`}
                    </span>
                  </div>
                  <p className="mt-1 m-0 text-slate-500 text-[0.7rem]">
                    Monitored live by Nagpur Traffic Police Surveillance Network.
                  </p>
                </div>
              </Popup>
            </Polyline>

            {/* Waterlogging dashed warning overlay */}
            {isFlooded && (
              <Polyline
                positions={road.path}
                pathOptions={{
                  color: "#ffffff",
                  weight: 2,
                  opacity: 0.6,
                  dashArray: "6 8",
                  lineCap: "round",
                }}
              />
            )}
          </Fragment>
        );
      })}

      {/* ── Junction Risk Heat Blobs ── */}
      {JUNCTIONS.map((j) => {
        const tier = tierFromScore(j.risk);
        const color = TIER_META[tier].color;
        return (
          <CircleMarker
            key={`h-${j.id}`}
            center={[j.lat, j.lng]}
            radius={8 + Math.min(18, j.density / 10)}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.14, weight: 0 }}
            interactive={false}
          />
        );
      })}

      {/* ── Junction Status Dot Pins ── */}
      {JUNCTIONS.map((j) => {
        const tier = tierFromScore(j.risk);
        const color = TIER_META[tier].color;
        return (
          <CircleMarker
            key={`m-${j.id}`}
            center={[j.lat, j.lng]}
            radius={viewMode === "radar500" ? 4 : 6}
            pathOptions={{
              color: "#fff",
              weight: 2,
              fillColor: color,
              fillOpacity: 1,
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -8]}
              className="!bg-[#0f172a] !text-white !border-none !shadow-xl !rounded-md !px-2.5 !py-1.5 !text-xs !font-sans"
            >
              <div className="leading-tight">
                <p className="m-0 font-bold text-white">{j.name}</p>
                <p className="m-0 text-[0.65rem] font-bold" style={{ color }}>
                  Risk Score: {Math.round(j.risk * 100)}% ({tier.toUpperCase()})
                </p>
                {j.waterlogged && (
                  <p className="m-0 text-[0.62rem] font-bold text-sky-400">⚠ Waterlogged Junction</p>
                )}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}

      {/* ── Waterlogging Warning Rings on Junctions ── */}
      {showWaterlog &&
        JUNCTIONS.filter((j) => j.waterlogged).map((j) => (
          <CircleMarker
            key={`wl-${j.id}`}
            center={[j.lat, j.lng]}
            radius={22}
            pathOptions={{
              color: WATERLOG_COLOR,
              weight: 2,
              dashArray: "4 5",
              fillColor: WATERLOG_COLOR,
              fillOpacity: 0.08,
            }}
            interactive={false}
          />
        ))}

      {/* ── 📍 USER CURRENT LOCATION PIN & PULSING RADAR ── */}
      {userLocation && (
        <>
          <CircleMarker
            center={userLocation}
            radius={28}
            pathOptions={{
              color: "#3b82f6",
              weight: 1.5,
              fillColor: "#3b82f6",
              fillOpacity: 0.12,
              dashArray: "3 4",
            }}
            interactive={false}
          />

          <CircleMarker
            center={userLocation}
            radius={14}
            pathOptions={{
              color: "#2563eb",
              weight: 2,
              fillColor: "#60a5fa",
              fillOpacity: 0.35,
            }}
            interactive={false}
          />

          <CircleMarker
            center={userLocation}
            radius={7}
            pathOptions={{
              color: "#ffffff",
              weight: 3,
              fillColor: "#1d4ed8",
              fillOpacity: 1,
            }}
          >
            <Tooltip
              permanent
              direction="top"
              offset={[0, -10]}
              className="!bg-[#1d4ed8] !text-white !font-black !border-none !shadow-xl !rounded !px-2 !py-0.5 !text-[0.65rem] uppercase tracking-wider"
            >
              📍 You Are Here
            </Tooltip>
          </CircleMarker>
        </>
      )}
    </MapContainer>
  );
}
