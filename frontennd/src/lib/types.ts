export type RiskTier = "high" | "medium" | "low";

export type FactorTone = "danger" | "warn" | "info" | "neutral" | "good";

export interface RiskFactor {
  label: string;
  /** 0-1 proportional contribution to the risk score */
  weight: number;
  tone: FactorTone;
}

export interface SignalState {
  /** current average vehicle delay at this junction, seconds */
  currentDelay: number;
  recommendedDelay: number;
  /** green-split per arm, e.g. 0.42 */
  currentSplit: number;
  recommendedSplit: number;
}

export interface PredictedRisk {
  t30: number;
  t60: number;
  t120: number;
}

export interface Junction {
  id: string;
  name: string;
  /** Marathi name */
  nameMr: string;
  lat: number;
  lng: number;
  zone: string;
  /** 0-1 living risk score */
  risk: number;
  predicted: PredictedRisk;
  confidence: number;
  factors: RiskFactor[];
  manned: boolean;
  officersAssigned: number;
  recommendedOfficers: number;
  blackspot: boolean;
  signalized: boolean;
  hasCamera: boolean;
  waterlogged: boolean;
  /** vehicles/min density proxy */
  density: number;
  violations: {
    noHelmet: number;
    tripleRide: number;
    wrongWay: number;
    redLight: number;
    illegalPark: number;
  };
  signal: SignalState;
}

export type IncidentType =
  | "accident"
  | "waterlogging"
  | "festival"
  | "ambulance"
  | "breakdown"
  | "traffic";

export interface Incident {
  id: string;
  type: IncidentType;
  junctionId: string;
  junctionName: string;
  severity: RiskTier;
  status: "active" | "resolved";
  time: string;
  note: string;
}

export interface AuditEntry {
  id: string;
  time: string;
  user: string;
  action: string;
  target: string;
  reason: string;
  impact: string;
}

export interface Officer {
  id: string;
  name: string;
  badge: string;
  status: "deployed" | "available" | "break";
  post: string | null;
}

export interface FestivalEvent {
  id: string;
  name: string;
  nameMr: string;
  zone: string;
  date: string;
  officers: number;
  playbook: string[];
  active: boolean;
}
