import type { Incident, Junction, RiskTier } from "@/lib/types";
import { tierFromScore } from "@/lib/utils";

export type AssignStatus = "fill" | "boost" | "hold" | "unmanned";

export interface Assignment {
  junctionId: string;
  junctionName: string;
  risk: number;
  tier: RiskTier;
  baseline: number;
  recommended: number;
  assigned: number;
  status: AssignStatus;
  reason: string;
  blackspot: boolean;
  predictedAverted: number;
}

export interface AllocationResult {
  assignments: Assignment[];
  coverage: number;
  utilization: number;
  unmannedHighRisk: Assignment[];
  optimized: boolean;
}

interface AllocOpts {
  junctions: Junction[];
  officers: number;
  incidents: Incident[];
  activeFestivalId: string | null;
  rainMode: boolean;
}

/** Living risk boosted by active context (incidents, festival, rain). */
export function effectiveRisk(j: Junction, o: Omit<AllocOpts, "junctions" | "officers">): number {
  let r = j.risk;
  const nearbyIncident = o.incidents.some((i) => i.junctionId === j.id && i.status === "active");
  if (nearbyIncident) r = Math.min(0.99, r + 0.18);
  if (j.waterlogged || o.rainMode) r = Math.min(0.99, r + 0.08);
  if (o.activeFestivalId) r = Math.min(0.99, r + 0.06);
  return r;
}

function priorityOf(j: Junction, risk: number): number {
  let p = risk;
  if (j.blackspot) p *= 1.25;
  if (!j.manned) p *= 1.2;
  return p;
}

/** Greedy fill + local-search redeploy. Returns explainable assignment. */
export function computeAllocation(o: AllocOpts): AllocationResult {
  const enriched = o.junctions.map((j) => {
    const risk = effectiveRisk(j, {
      incidents: o.incidents,
      activeFestivalId: o.activeFestivalId,
      rainMode: o.rainMode,
    });
    return { j, risk, priority: priorityOf(j, risk) };
  });

  // Sort by priority for ranking display.
  const ranked = [...enriched].sort((a, b) => b.priority - a.priority);

  // Greedy: assign one officer at a time to the highest-priority under-filled post.
  const assigned = new Map<string, number>();
  ranked.forEach((e) => assigned.set(e.j.id, e.j.officersAssigned));

  let pool = o.officers;
  const order = [...ranked];
  while (pool > 0) {
    // candidate with highest priority that still needs more officers
    let bestIdx = -1;
    let bestVal = -1;
    for (let i = 0; i < order.length; i++) {
      const e = order[i];
      const need = e.j.recommendedOfficers - (assigned.get(e.j.id) ?? 0);
      if (need > 0 && e.priority > bestVal) {
        bestVal = e.priority;
        bestIdx = i;
      }
    }
    if (bestIdx === -1) break;
    const id = order[bestIdx].j.id;
    assigned.set(id, (assigned.get(id) ?? 0) + 1);
    pool -= 1;
  }

  // Local search: redeploy an officer from a low-risk over-1 post to a still-unmanned high-risk post.
  for (const e of ranked) {
    const cur = assigned.get(e.j.id) ?? 0;
    if (cur <= 1) continue;
    const donor = ranked.find(
      (r) => (assigned.get(r.j.id) ?? 0) > 1 && r.risk < 0.5 && r.j.id !== e.j.id
    );
    const targetNeeds = cur < e.j.recommendedOfficers;
    if (donor && targetNeeds) {
      assigned.set(donor.j.id, (assigned.get(donor.j.id) ?? 0) - 1);
      assigned.set(e.j.id, cur + 1);
    }
  }

  const assignments: Assignment[] = ranked.map(({ j, risk }) => {
    const baseline = j.officersAssigned;
    const recommended = j.recommendedOfficers;
    const got = assigned.get(j.id) ?? 0;
    const top = j.factors[0]?.label ?? "elevated risk";
    let status: AssignStatus;
    if (got === 0 && risk >= 0.6) status = "unmanned";
    else if (got > baseline) status = "fill";
    else if (got === recommended && recommended > 0) status = "hold";
    else status = "hold";

    const reason =
      status === "unmanned"
        ? `Unmanned despite ${tierFromScore(risk)} risk — ${top}.`
        : status === "fill"
          ? `+${got - baseline} officer${got - baseline > 1 ? "s" : ""} to cover ${top}.`
          : got > 0
            ? `Held at ${got} — ${top}.`
            : "Low priority under current budget.";

    return {
      junctionId: j.id,
      junctionName: j.name,
      risk,
      tier: tierFromScore(risk),
      baseline,
      recommended,
      assigned: got,
      status,
      reason,
      blackspot: j.blackspot,
      predictedAverted: Number((risk * Math.min(got, recommended) * 0.9).toFixed(2)),
    };
  });

  const totalNeed = enriched.reduce((s, e) => s + e.j.recommendedOfficers, 0);
  const placed = Math.min(o.officers, totalNeed);
  const utilization = totalNeed > 0 ? placed / o.officers : 0;

  const highRisk = assignments.filter((a) => a.risk >= 0.6);
  const coveredHigh = highRisk.filter((a) => a.assigned > 0).length;
  const coverage = highRisk.length > 0 ? coveredHigh / highRisk.length : 0;

  return {
    assignments,
    coverage,
    utilization,
    unmannedHighRisk: assignments.filter((a) => a.status === "unmanned"),
    optimized: true,
  };
}
