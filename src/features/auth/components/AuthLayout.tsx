import type { ReactNode } from "react"
import circleTop from "@/shared/assets/circleTop.png"
import circleBottom from "@/shared/assets/circleBottom.png"


type Props = { title: string; subtitle: string; children: ReactNode }

export default function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-purple-50 p-4">
        <img
  src={circleTop}
  alt=""
  aria-hidden="true"
  className="pointer-events-none absolute -right-24 -top-24 w-126 select-none"
/>
<img
  src={circleBottom}
  alt=""
  aria-hidden="true"
  className="pointer-events-none absolute -bottom-0 -left-24 w-100 select-none"
/>

      <div className="relative w-full max-w-lg rounded-xl border-4 border-brand-purple-40 bg-brand-background p-8">
        {/* logo placeholder, swap for the real logo */}
        <div className="mx-auto mb-6 h-8 w-32 rounded bg-secondary-grey" />
        <h1 className="text-center font-bold text-secondary-black text-xl">{title}</h1>
        <p className="mt-1 text-center font-regular text-sm text-secondary-black">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}