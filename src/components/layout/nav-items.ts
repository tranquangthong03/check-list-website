import {
  CalendarRange,
  CheckSquare,
  Home,
  Link2,
  Settings,
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/planner", label: "Daily Planner", icon: CalendarRange },
  { href: "/checklist", label: "Checklist", icon: CheckSquare },
  { href: "/links", label: "Quick Links", icon: Link2 },
  { href: "/settings", label: "Settings", icon: Settings },
];
