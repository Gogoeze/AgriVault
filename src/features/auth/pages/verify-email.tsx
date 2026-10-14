import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react"
import { Navigate, useNavigate, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { AuthLayout, FormError } from "@/features/auth/auth-layout"
import { useAuth } from "@/features/auth/auth-context"
import { cn } from "@/lib/cn"
import { toMessage } from "@/lib/supabase"

const LENGTH = 6
const RESEND_SECONDS = 45

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const email = params.get("email") ?? ""
  const navigate = useNavigate()
  const { verifyOtp, resendOtp } = useAuth()

  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""))
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const code = digits.join("")

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [cooldown])

  if (!email) return <Navigate to="/sign-up" replace />

  function handleChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value.replace(/\D/g, "").slice(-1)
    setDigits((current) => current.map((digit, i) => (i === index ? value : digit)))
    setError(null)
    if (value && index < LENGTH - 1) inputs.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH)
    if (!pasted) return
    setDigits(Array.from({ length: LENGTH }, (_, index) => pasted[index] ?? ""))
    inputs.current[Math.min(pasted.length, LENGTH - 1)]?.focus()
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (code.length < LENGTH) return

    setSubmitting(true)
    setError(null)
    try {
      await verifyOtp(email, code)
      await navigate("/", { replace: true })
    } catch (cause) {
      const message = toMessage(cause)
      setError(
        /expired|invalid/i.test(message)
          ? "That code is wrong or has expired. Ask for a new one."
          : message,
      )
      setDigits(Array(LENGTH).fill(""))
      inputs.current[0]?.focus()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    setError(null)
    setNotice(null)
    try {
      await resendOtp(email)
      setCooldown(RESEND_SECONDS)
      setNotice("A new code is on its way.")
    } catch (cause) {
      setError(toMessage(cause))
    }
  }

  return (
    <AuthLayout title="Check your email" subtitle={`We sent a ${LENGTH}-digit code to ${email}.`}>
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="flex flex-col items-center gap-6"
      >
        <div className="flex gap-2" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputs.current[index] = element
              }}
              value={digit}
              onChange={(event) => handleChange(index, event)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              aria-label={`Digit ${index + 1}`}
              className={cn(
                "mono h-14 w-11 rounded-md border border-line-strong bg-surface text-center text-lg font-semibold text-ink",
                "focus:border-brand-400 focus:outline-none",
              )}
            />
          ))}
        </div>

        <div className="w-full">
          <FormError message={error} />
          {notice && !error && <p className="text-center text-xs text-ok">{notice}</p>}
        </div>

        <Button type="submit" size="lg" block loading={submitting} disabled={code.length < LENGTH}>
          Verify email
        </Button>

        <button
          type="button"
          onClick={() => void handleResend()}
          disabled={cooldown > 0}
          className="text-xs text-brand-600 hover:underline disabled:text-ink-subtle disabled:no-underline"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </form>
    </AuthLayout>
  )
}
