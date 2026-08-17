/**
 * Highly granular, localized precipitation radar dataset for Nagpur and Central India.
 * Micro-rain cells for specific Nagpur neighborhoods + realistic regional storm systems.
 */

export interface RainCell {
  id: string;
  name: string;
  intensity: "light" | "moderate" | "heavy" | "severe";
  rainRateMm: number;
  areaType: "local_nagpur" | "regional";
  /** Polygon coordinates [lat, lng][] */
  polygon: [number, number][];
  /** Optional thunderstorm center with lightning ⚡ */
  lightning?: [number, number];
  lightningLabel?: string;
  /** Movement vector for timeline forecasting [dLat, dLng] */
  driftVector: [number, number];
}

export const REGIONAL_RAIN_CELLS: RainCell[] = [
  // ── LOCAL NAGPUR MICRO-ZONES (Small localized neighborhood patches) ──

  // 1. East Nagpur (Itwari / Gandhibagh / Nandanvan localized rain)
  {
    id: "local-itwari-east",
    name: "East Nagpur (Itwari – Nandanvan Rain Patch)",
    intensity: "moderate",
    rainRateMm: 8.2,
    areaType: "local_nagpur",
    polygon: [
      [21.164, 79.092],
      [21.168, 79.108],
      [21.162, 79.122],
      [21.150, 79.125],
      [21.144, 79.112],
      [21.148, 79.095],
      [21.158, 79.088],
    ],
    driftVector: [0.005, 0.012],
  },

  // 2. South-East Nagpur (Sakkardara / Dighori Waterlogged Pocket)
  {
    id: "local-sakkardara-south",
    name: "Sakkardara – Dighori Local Rain Cell",
    intensity: "heavy",
    rainRateMm: 12.5,
    areaType: "local_nagpur",
    polygon: [
      [21.138, 79.098],
      [21.142, 79.115],
      [21.134, 79.128],
      [21.122, 79.124],
      [21.118, 79.106],
      [21.126, 79.094],
    ],
    driftVector: [0.004, 0.010],
  },

  // 3. North Nagpur (Koradi Lake localized shower)
  {
    id: "local-koradi-north",
    name: "Koradi – Mahadula Lake Shower",
    intensity: "light",
    rainRateMm: 4.2,
    areaType: "local_nagpur",
    polygon: [
      [21.228, 79.088],
      [21.232, 79.106],
      [21.220, 79.118],
      [21.205, 79.112],
      [21.202, 79.090],
      [21.214, 79.082],
    ],
    driftVector: [0.006, 0.014],
  },

  // ── REGIONAL SEPARATE CELLS (Surrounding districts 50km - 500km away) ──

  // 4. Bhandara District Front (55km East of Nagpur)
  {
    id: "reg-bhandara",
    name: "Bhandara Wainganga Basin Cell",
    intensity: "moderate",
    rainRateMm: 9.6,
    areaType: "regional",
    polygon: [
      [21.22, 79.58],
      [21.28, 79.72],
      [21.24, 79.86],
      [21.12, 79.88],
      [21.08, 79.68],
      [21.14, 79.54],
    ],
    driftVector: [0.015, 0.025],
  },

  // 5. Gondia District Storm Front (130km East)
  {
    id: "reg-gondia-storm",
    name: "Gondia – Balaghat Storm Front",
    intensity: "heavy",
    rainRateMm: 16.0,
    areaType: "regional",
    polygon: [
      [21.55, 80.08],
      [21.62, 80.28],
      [21.54, 80.45],
      [21.36, 80.42],
      [21.32, 80.18],
      [21.42, 80.05],
    ],
    lightning: [21.46, 80.20],
    lightningLabel: "Gondia Storm Cell ⚡",
    driftVector: [0.02, 0.04],
  },

  // 6. Chhindwara MP Front (110km North)
  {
    id: "reg-chhindwara",
    name: "Chhindwara Plateau Drizzle",
    intensity: "light",
    rainRateMm: 3.8,
    areaType: "regional",
    polygon: [
      [22.14, 78.85],
      [22.18, 79.05],
      [22.10, 79.16],
      [21.98, 79.12],
      [21.96, 78.90],
    ],
    driftVector: [0.015, 0.03],
  },

  // 7. Chandrapur South Storm (140km South)
  {
    id: "reg-chandrapur",
    name: "Chandrapur – Tadoba Storm Front",
    intensity: "heavy",
    rainRateMm: 17.5,
    areaType: "regional",
    polygon: [
      [20.12, 79.18],
      [20.18, 79.42],
      [20.06, 79.58],
      [19.82, 79.52],
      [19.80, 79.22],
      [19.95, 79.12],
    ],
    lightning: [19.96, 79.32],
    lightningLabel: "Chandrapur Border Storm ⚡",
    driftVector: [0.02, 0.035],
  },

  // 8. Chhattisgarh – Raipur / Janjgir-Champa Front (260km East)
  {
    id: "reg-raipur-janjgir",
    name: "Raipur – Janjgir-Champa Severe System",
    intensity: "severe",
    rainRateMm: 24.0,
    areaType: "regional",
    polygon: [
      [22.25, 81.60],
      [22.45, 82.40],
      [22.35, 83.20],
      [21.80, 83.40],
      [21.35, 82.80],
      [21.15, 81.80],
      [21.50, 81.40],
    ],
    lightning: [22.05, 82.55],
    lightningLabel: "Janjgir-Champa Severe Cell ⚡",
    driftVector: [0.025, 0.05],
  },

  // 9. Northern MP – Jabalpur Cell (245km North)
  {
    id: "reg-jabalpur",
    name: "Jabalpur Narmada Basin Rain Front",
    intensity: "moderate",
    rainRateMm: 11.2,
    areaType: "regional",
    polygon: [
      [23.28, 79.82],
      [23.35, 80.12],
      [23.22, 80.28],
      [23.05, 80.20],
      [23.02, 79.88],
      [23.15, 79.76],
    ],
    lightning: [23.18, 79.98],
    lightningLabel: "Jabalpur Storm ⚡",
    driftVector: [0.015, 0.03],
  },
];

export interface RegionalCity {
  name: string;
  state: string;
  coords: [number, number];
  distanceKm: number;
  condition: string;
  rainRateMm: number;
}

export const REGIONAL_CITIES: RegionalCity[] = [
  { name: "Nagpur", state: "MH", coords: [21.148, 79.082], distanceKm: 0, condition: "Light Rain", rainRateMm: 6.2 },
  { name: "Amravati", state: "MH", coords: [20.937, 77.779], distanceKm: 145, condition: "Overcast", rainRateMm: 1.2 },
  { name: "Chandrapur", state: "MH", coords: [19.961, 79.296], distanceKm: 140, condition: "Heavy Storm ⚡", rainRateMm: 17.5 },
  { name: "Gondia", state: "MH", coords: [21.458, 80.196], distanceKm: 130, condition: "Thunderstorm ⚡", rainRateMm: 16.0 },
  { name: "Chhindwara", state: "MP", coords: [22.057, 78.938], distanceKm: 110, condition: "Light Rain", rainRateMm: 3.8 },
  { name: "Jabalpur", state: "MP", coords: [23.181, 79.986], distanceKm: 245, condition: "Rain Shower ⚡", rainRateMm: 11.2 },
  { name: "Raipur", state: "CG", coords: [21.251, 81.629], distanceKm: 270, condition: "Severe Rain ⚡", rainRateMm: 24.0 },
  { name: "Bilaspur", state: "CG", coords: [22.079, 82.140], distanceKm: 340, condition: "Heavy Rain", rainRateMm: 19.5 },
  { name: "Bhopal", state: "MP", coords: [23.259, 77.412], distanceKm: 290, condition: "Partly Cloudy", rainRateMm: 0.8 },
  { name: "Sambalpur", state: "OD", coords: [21.466, 83.981], distanceKm: 490, condition: "Heavy Storm ⚡", rainRateMm: 18.2 },
];
