import { Routes, Route, Navigate } from "react-router-dom"
import Login from "@/features/auth/pages/Login"
import SignUp from "@/features/auth/pages/SignUp"
import Otp from "@/features/auth/pages/Otp"
import DashboardPage from "@/features/admin/dashboard/DashboardPage"
import UsersPage from "@/features/admin/users/UserPage"
import InventoryPage from "@/features/admin/inventory/InventoryPage"
import MonitoringPage from "@/features/admin/monitoring/MonitoringPage"
import PaymentsPage from "@/features/admin/payments/PaymentsPage"
import SettingsPage from "@/features/admin/settings/SettingsPage"
import { ProtectedRoute } from "@/shared/components/layout/ProtectedRoute"
import FarmerDashboardPage from "@/features/farmer/dashboard/DashboardPage"
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/verify" element={<Otp />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/inventory" element={<InventoryPage />} />
        <Route path="/admin/monitoring" element={<MonitoringPage />} />
        <Route path="/admin/payments" element={<PaymentsPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />

        <Route path="/farmer" element={<Navigate to="/farmer/dashboard" replace />} />
        <Route path="/farmer/dashboard" element={<FarmerDashboardPage />} />
      </Route>
    </Routes>
  )
}