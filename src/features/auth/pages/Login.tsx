import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import AuthLayout from "@/features/auth/components/AuthLayout"
import { useAuth } from "@/shared/lib/AuthContext"


export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const { login, user, isAdmin, loading } = useAuth()

  useEffect(() => {
    if (!loading && user && isAdmin) navigate("/admin/dashboard", { replace: true })
  }, [loading, user, isAdmin, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError("Enter your email and password")
      return
    }
    setError("")
    try {
      await login(email, password)
    } catch (err) {
      setError(
        err instanceof Error && err.message === "not-admin"
          ? "This account doesn't have admin access"
          : "Invalid email or password"
      )
    }
  }


  return (
    <AuthLayout
      title="Welcome back!"
      subtitle="Log in to continue operations and real time visibility."
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 bg-secondary-white border border-brand-purple-50"
        />
        <Input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 bg-secondary-white border border-brand-purple-50"
        />

        <Link
          to="/forgot-password"
          className="block text-right text-xs text-brand-purple-50 hover:underline"
        >
          Forgot Password?
        </Link>

        {error && <p className="text-sm text-accent-critical">{error}</p>}

        {/* <Link to= "/admin/dashboard">
        <Button type="submit" className="mt-6  text-md h-12 w-full">
          Log In
        </Button>
        </Link> */}


        <Button type="submit" className="mt-6 text-md h-12 w-full">
          Log In
        </Button>


        <p className="pt-2 text-center text-xs">
          Don't have an account?{" "}
          <Link to="/signup" className="text-brand-purple-50 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}