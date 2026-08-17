import {
  LayoutDashboard,
  Map,
  Users,
  Siren,
  TrafficCone,
  Video,
  CloudSun,
  BarChart3,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    group: "Overview",
    items: [{ label: "Command Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    group: "Operations",
    items: [
      { label: "Risk Heatmap", href: "/heatmap", icon: Map },
      { label: "Allocation Engine", href: "/allocation", icon: Users },
      { label: "Incident Console", href: "/incidents", icon: Siren },
      { label: "Smart Signals", href: "/signals", icon: TrafficCone },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { label: "Perception / CV", href: "/perception", icon: Video },
      { label: "Contexts & Weather", href: "/contexts", icon: CloudSun },
    ],
  },
  {
    group: "Governance",
    items: [
      { label: "Impact Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Audit Log", href: "/audit", icon: ScrollText },
    ],
  },
];
