import type { ReactNode } from "react"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "@/shared/lib/AuthContext"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  )
}