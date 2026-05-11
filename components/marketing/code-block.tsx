export function MarketingCodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[oklch(0.06_0.01_270)]">
      <div className="flex items-center justify-between border-b border-border/80 px-4 py-2.5">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-foreground/90 sm:text-[13px]">
        <code>{code}</code>
      </pre>
    </div>
  )
}
