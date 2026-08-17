"use client";

import { Fragment, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { JUNCTIONS, getJunction, TIER_META } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { tierFromScore } from "@/lib/utils";

const NAGPUR: [number, number] = [21.15, 79.085];

export type Horizon = "now" | "t30" | "t60" | "t120";

function riskAt(j: { risk: number; predicted: { t30: number; t60: number; t120: number } }, horizon: Horizon) {
  if (horizon === "now") return j.risk;
  return j.predicted[horizon];
}

function Recenter({ id }: { id: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (!id) return;
    const j = getJunction(id);
    if (j) map.flyTo([j.lat, j.lng], Math.max(map.getZoom(), 14), { duration: 0.8 });
  }, [id, map]);
  return null;
}

export default function RiskMap({
  height = 560,
  onPick,
  horizon = "now",
}: {
  height?: number | string;
  onPick?: (id: string) => void;
  horizon?: Horizon;
}) {
  const selectedId = useAppStore((s) => s.selectedJunctionId);
  const selectJunction = useAppStore((s) => s.selectJunction);
  const ambulance = useAppStore((s) => s.ambulance);

  const pick = onPick ?? selectJunction;

  return (
    <MapContainer
      center={NAGPUR}
      zoom={12.5}
      minZoom={11}
      maxZoom={17}
      scrollWheelZoom
      style={{ height, width: "100%" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap &copy; CARTO'
      />
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png" />

      <Recenter id={selectedId} />

      {JUNCTIONS.map((j) => {
        const risk = riskAt(j, horizon);
        const tier = tierFromScore(risk);
        const color = TIER_META[tier].color;
        return (
          <Fragment key={j.id}>
            {/* heat blob */}
            <CircleMarker
              center={[j.lat, j.lng]}
              radius={10 + Math.min(22, j.density / 7)}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.16, weight: 0 }}
              interactive={false}
            />
            {/* waterlogging ring */}
            {j.waterlogged && (
              <CircleMarker
                center={[j.lat, j.lng]}
                radius={26}
                pathOptions={{
                  color: "#0277bd",
                  weight: 2,
                  dashArray: "4 5",
                  fillOpacity: 0,
                }}
                interactive={false}
              />
            )}
          </Fragment>
        );
      })}

      {/* markers (separate map to keep onClick clean) */}
      {JUNCTIONS.map((j) => {
        const risk = riskAt(j, horizon);
        const tier = tierFromScore(risk);
        const color = TIER_META[tier].color;
        const unmannedHigh = !j.manned && tier === "high";
        return (
          <CircleMarker
            key={`m-${j.id}`}
            center={[j.lat, j.lng]}
            radius={9}
            pathOptions={{
              color: "#fff",
              weight: 3,
              fillColor: color,
              fillOpacity: 1,
            }}
            eventHandlers={{ click: () => pick(j.id) }}
          />
        );
      })}

      {/* ambulance corridor */}
      {ambulance.active && (
        <Polyline
          positions={[
            [
              getJunction(ambulance.fromId)?.lat ?? 21.156,
              getJunction(ambulance.fromId)?.lng ?? 79.098,
            ],
            [
              getJunction(ambulance.toId)?.lat ?? 21.1505,
              getJunction(ambulance.toId)?.lng ?? 79.073,
            ],
          ]}
          pathOptions={{ color: "#c62828", weight: 5, dashArray: "2 10", lineCap: "round" }}
        />
      )}
    </MapContainer>
  );
}
