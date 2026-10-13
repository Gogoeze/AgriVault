import DashboardIcon from "@/shared/assets/icons/sidebarIcons/dashboard.svg?react";
import PaymentsIcon from "@/shared/assets/icons/sidebarIcons/payments.svg?react";
import SettingsIcon from "@/shared/assets/icons/sidebarIcons/settings.svg?react";
import type { NavItem } from "@/shared/components/layout/Sidebar";

export const farmerNav: NavItem[] = [
  { label: "Dashboard", icon: DashboardIcon, href: "/farmer/dashboard", end: true },
  { label: "Payments", icon: PaymentsIcon, href: "/farmer/payments" },
  { label: "Settings", icon: SettingsIcon, href: "/farmer/settings" },
];