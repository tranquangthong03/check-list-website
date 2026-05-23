import {
  CalendarRange,
  CheckSquare,
  Home,
  Link2,
  Settings,
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Tổng quan", icon: Home },
  { href: "/planner", label: "Kế hoạch ngày", icon: CalendarRange },
  { href: "/checklist", label: "Việc cần làm", icon: CheckSquare },
  { href: "/links", label: "Liên kết nhanh", icon: Link2 },
  { href: "/settings", label: "Cài đặt", icon: Settings },
];
