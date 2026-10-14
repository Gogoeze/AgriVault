import { useMemo, useState } from "react"

import { adminNav, farmerNav } from "@/app/routes/nav"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { Field, Input } from "@/components/ui/field"
import { Icon } from "@/components/ui/icon"
import { useAuth } from "@/features/auth/auth-context"
import { supabase, toMessage } from "@/lib/supabase"

interface Details {
  fullName: string
  phone: string
  address: string
}

/** Profile and password, for whoever is signed in. Shared by both roles. */
export default function AccountPage() {
  const { profile, isAdmin, updatePassword, refreshProfile } = useAuth()

  /** Edits the user has made. Null means "showing what the server has". */
  const [draft, setDraft] = useState<Details | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  // Derived rather than copied into state by an effect, so the fields fill in
  // the moment the profile loads without a second render pass.
  const saved_ = useMemo<Details>(
    () => ({
      fullName: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      address: profile?.address ?? "",
    }),
    [profile],
  )

  const { fullName, phone, address } = draft ?? saved_

  const set = <K extends keyof Details>(key: K, value: string) => {
    setDraft((current) => ({ ...(current ?? saved_), [key]: value }))
    setSaved(false)
  }

  async function handleSave() {
    if (!profile) return

    if (!fullName.trim()) {
      setError("Your name cannot be empty.")
      return
    }
    if (password || confirmPassword) {
      if (password.length < 8) {
        setError("A new password must be at least 8 characters.")
        return
      }
      if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
        setError("Use upper and lower case letters and at least one number.")
        return
      }
      if (password !== confirmPassword) {
        setError("Those passwords do not match.")
        return
      }
    }

    setError(null)
    setSaving(true)
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          address: address.trim() || null,
        })
        .eq("id", profile.id)

      if (updateError) throw updateError

      if (password) await updatePassword(password)

      await refreshProfile()
      setDraft(null)
      setPassword("")
      setConfirmPassword("")
      setSaved(true)
    } catch (cause) {
      setError(toMessage(cause))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell
      nav={isAdmin ? adminNav : farmerNav}
      title="Account"
      subtitle="Your details and sign-in"
    >
      <Card>
        <CardHeader icon="person" title="Profile" description="How the facility reaches you." />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required>
            {(props) => (
              <Input
                {...props}
                value={fullName}
                onChange={(event) => set("fullName", event.target.value)}
              />
            )}
          </Field>

          <Field label="Email" hint="Contact the facility to change your sign-in address.">
            {(props) => <Input {...props} value={profile?.email ?? ""} disabled />}
          </Field>

          <Field label="Phone number">
            {(props) => (
              <Input
                {...props}
                type="tel"
                numeric
                value={phone}
                onChange={(event) => set("phone", event.target.value)}
              />
            )}
          </Field>

          <Field label="Address">
            {(props) => (
              <Input
                {...props}
                value={address}
                onChange={(event) => set("address", event.target.value)}
              />
            )}
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          icon="lock"
          title="Password"
          description="Leave both fields blank to keep your current password."
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="New password" hint="At least 8 characters, with a number and mixed case.">
            {(props) => (
              <Input
                {...props}
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setSaved(false)
                }}
              />
            )}
          </Field>

          <Field label="Confirm new password">
            {(props) => (
              <Input
                {...props}
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  setSaved(false)
                }}
              />
            )}
          </Field>
        </CardBody>
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-4">
        {error && (
          <span role="alert" className="flex items-center gap-2 text-xs text-critical">
            <Icon name="error" className="text-base" />
            {error}
          </span>
        )}
        {saved && !error && (
          <span className="flex items-center gap-2 text-xs text-ok">
            <Icon name="check_circle" className="text-base" />
            Saved
          </span>
        )}
        <Button loading={saving} onClick={() => void handleSave()}>
          Save changes
        </Button>
      </div>
    </AppShell>
  )
}
