"use client";

import { create } from "zustand";
import type { AuditEntry, Incident } from "@/lib/types";
import { INITIAL_AUDIT, INITIAL_INCIDENTS } from "@/lib/data";

interface AppState {
  selectedJunctionId: string | null;
  availableOfficers: number;
  optimized: boolean;
  smartSignals: boolean;
  incidents: Incident[];
  audit: AuditEntry[];
  ambulance: { active: boolean; fromId: string; toId: string };
  activeFestivalId: string | null;
  rainMode: boolean;

  selectJunction: (id: string | null) => void;
  setAvailableOfficers: (n: number) => void;
  setOptimized: (v: boolean) => void;
  toggleSmartSignals: () => void;
  injectIncident: (i: Incident) => void;
  resolveIncident: (id: string) => void;
  logOverride: (entry: AuditEntry) => void;
  activateFestival: (id: string | null) => void;
  triggerAmbulance: (fromId: string, toId: string) => void;
  clearAmbulance: () => void;
  setRainMode: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedJunctionId: null,
  availableOfficers: 8,
  optimized: false,
  smartSignals: false,
  incidents: INITIAL_INCIDENTS,
  audit: INITIAL_AUDIT,
  ambulance: { active: false, fromId: "itwari", toId: "medical" },
  activeFestivalId: null,
  rainMode: true,

  selectJunction: (id) => set({ selectedJunctionId: id }),
  setAvailableOfficers: (n) => set({ availableOfficers: n, optimized: false }),
  setOptimized: (v) => set({ optimized: v }),
  toggleSmartSignals: () => set((s) => ({ smartSignals: !s.smartSignals })),
  injectIncident: (i) => set((s) => ({ incidents: [i, ...s.incidents] })),
  resolveIncident: (id) =>
    set((s) => ({
      incidents: s.incidents.map((i) =>
        i.id === id ? { ...i, status: "resolved" } : i
      ),
    })),
  logOverride: (entry) => set((s) => ({ audit: [entry, ...s.audit] })),
  activateFestival: (id) => set({ activeFestivalId: id }),
  triggerAmbulance: (fromId, toId) => set({ ambulance: { active: true, fromId, toId } }),
  clearAmbulance: () => set({ ambulance: { active: false, fromId: "itwari", toId: "medical" } }),
  setRainMode: (v) => set({ rainMode: v }),
}));
