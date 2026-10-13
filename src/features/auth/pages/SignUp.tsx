import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import AuthLayout from "@/features/auth/components/AuthLayout"

export default function SignUp() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [error, setError] = useState("")

    function update(key: keyof typeof form) {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            setForm({ ...form, [key]: e.target.value })
            setError("")
        }
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match")
            return
        }
        // TODO: Supabase sign-up goes here
        navigate("/verify")
    }

    const field = "h-11 border-brand-purple-40 bg-secondary-white"

    return (
        <AuthLayout
            title="Create Admin Account"
            subtitle="Start your operations and gain real time visibility."
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        placeholder="First Name"
                        aria-label="First Name"
                        autoComplete="given-name"
                        value={form.firstName}
                        onChange={update("firstName")}
                        className={field}
                        required
                    />
                    <Input
                        placeholder="Last Name"
                        aria-label="Last Name"
                        autoComplete="family-name"
                        value={form.lastName}
                        onChange={update("lastName")}
                        className={field}
                        required
                    />
                </div>
                <Input
                    type="email"
                    placeholder="Email"
                    aria-label="Email"
                    autoComplete="email"
                    value={form.email}
                    onChange={update("email")}
                    className={field}
                    required
                />
                <Input
                    type="password"
                    placeholder="Password"
                    aria-label="Password"
                    autoComplete="new-password"
                    minLength={8}
                    value={form.password}
                    onChange={update("password")}
                    className={field}
                    required
                />
                <Input
                    type="password"
                    placeholder="Confirm Password"
                    aria-label="Confirm Password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={update("confirmPassword")}
                    className={field}
                    required
                />
                {error && (
                    <p role="alert" className="text-xs text-accent-critical">
                        {error}
                    </p>
                )}
                <Button type="submit" className="mt-2 h-12 w-full">
                    Sign Up
                </Button>
                <p className="text-center text-xs">
                    Already have an account?{" "}
                    <Link to="/login" className="text-brand-purple-50 hover:underline">
                        Log in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    )
}