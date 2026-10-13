import {
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import AuthLayout from "@/features/auth/components/AuthLayout"

const LENGTH = 6

export default function Otp() {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""))
  const refs = useRef<(HTMLInputElement | null)[]>([])

  function handleChange(i: number, e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[i] = value
    setDigits(next)
    if (value && i < LENGTH - 1) refs.current[i + 1]?.focus()
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH)
    if (!pasted) return
    const next = Array(LENGTH).fill("")
    pasted.split("").forEach((c, i) => (next[i] = c))
    setDigits(next)
    refs.current[Math.min(pasted.length, LENGTH - 1)]?.focus()
  }

  const code = digits.join("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (code.length < LENGTH) return
    // TODO: Supabase verifyOtp goes here
    console.log("code:", code)
  }

  function handleResend() {
    // TODO: resend code (add a cooldown timer later)
  }

  return (
    <AuthLayout
      title="Enter OTP Code"
      subtitle="Please enter the 6-digit code we sent to your email."
    >
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <div className="flex gap-2 mt-6 mb-10">
          {digits.map((d, i) => (
            <Input
              key={i}
              ref={(el) => {
                refs.current[i] = el
              }}
              value={d}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              aria-label={`Digit ${i + 1}`}
              className="h-16 w-12 border-brand-purple-50 bg-secondary-white text-brand-purple-50 md:text-xl text-center font-xl"
            />
          ))}
        </div>
        <button
          type="button"
          onClick={handleResend}
          className="text-xs text-brand-purple-50 underline m-2"
        >
          Resend code
        </button>
        <Button type="submit" className="h-12 w-full" disabled={code.length < LENGTH}>
          Verify Code
        </Button>
      </form>
    </AuthLayout>
  )
}