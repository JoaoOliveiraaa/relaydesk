import type { ReactNode } from "react"

export function MarketingSubPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="relative mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
      ) : null}
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
      {description ? <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{description}</p> : null}
      <div className="mt-12 space-y-8 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
    </div>
  )
}

export function MarketingWidePage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
      ) : null}
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
      {description ? <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{description}</p> : null}
      <div className="mt-14">{children}</div>
    </div>
  )
}
