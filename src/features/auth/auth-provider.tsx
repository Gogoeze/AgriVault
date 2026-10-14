import type { Session } from "@supabase/supabase-js"
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"

import { AuthContext, type AuthState } from "@/features/auth/auth-context"
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/types/database"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null)
      return
    }
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()
    setProfile(data ?? null)
  }, [])

  useEffect(() => {
    let active = true

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      await loadProfile(data.session?.user.id)
      if (active) setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return
      setSession(next)
      void loadProfile(next?.user.id).then(() => {
        if (active) setLoading(false)
      })
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [loadProfile])

  const value = useMemo<AuthState>(() => {
    const role = profile?.role ?? null

    return {
      session,
      profile,
      loading,
      role,
      isAdmin: role === "admin",

      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      },

      async signUp({ email, password, fullName, phone }) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Role never comes from the client for admin. New sign-ups are
            // farmers, and the database trigger defaults to that regardless of
            // what is sent here.
            data: { full_name: fullName, phone: phone ?? null, role: "farmer" },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        return { needsVerification: !data.session }
      },

      async verifyOtp(email, token) {
        const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" })
        if (error) throw error
      },

      async resendOtp(email) {
        const { error } = await supabase.auth.resend({
          type: "signup",
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        })
        if (error) throw error
      },

      async requestPasswordReset(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
      },

      async updatePassword(password) {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
      },

      async refreshProfile() {
        await loadProfile(session?.user.id)
      },

      async signOut() {
        await supabase.auth.signOut()
        setProfile(null)
      },
    }
  }, [session, profile, loading, loadProfile])

  return <AuthContext value={value}>{children}</AuthContext>
}
