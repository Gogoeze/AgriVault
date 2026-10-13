import DashboardIcon from "@/shared/assets/icons/sidebarIcons/dashboard.svg?react";
import UsersIcon from "@/shared/assets/icons/sidebarIcons/users.svg?react";
import InventoryIcon from "@/shared/assets/icons/sidebarIcons/inventory.svg?react";
import MonitoringIcon from "@/shared/assets/icons/sidebarIcons/monitoring.svg?react";
import PaymentsIcon from "@/shared/assets/icons/sidebarIcons/payments.svg?react";
import SettingsIcon from "@/shared/assets/icons/sidebarIcons/settings.svg?react";
import type { NavItem } from "@/shared/components/layout/Sidebar";

export const adminNav: NavItem[] = [
  { label: "Dashboard", icon: DashboardIcon, href: "/admin/dashboard", end: true },
  { label: "Users", icon: UsersIcon, href: "/admin/users" },
  { label: "Inventory", icon: InventoryIcon, href: "/admin/inventory" },
  { label: "Monitoring", icon: MonitoringIcon, href: "/admin/monitoring" },
  { label: "Payments", icon: PaymentsIcon, href: "/admin/payments" },
  { label: "Settings", icon: SettingsIcon, href: "/admin/settings" },
];