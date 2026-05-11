import type { Metadata } from "next"
import { MarketingWidePage } from "@/components/marketing/sub-page"

export const metadata: Metadata = {
  title: "Roadmap",
  description: "Próximas capacidades RelayDesk.",
}

const columns: { title: string; items: { t: string; s: "planned" | "progress" | "research" }[] }[] = [
  {
    title: "Canais & integrações",
    items: [
      { t: "WhatsApp Cloud API", s: "progress" },
      { t: "Email inbound (IMAP/SMTP)", s: "planned" },
      { t: "Instagram Messaging", s: "research" },
    ],
  },
  {
    title: "AI & automação",
    items: [
      { t: "AI workflows com políticas por tenant", s: "planned" },
      { t: "AI routing para filas e skills", s: "research" },
      { t: "Workflow builder visual", s: "planned" },
    ],
  },
  {
    title: "Operações",
    items: [
      { t: "Kubernetes reference charts", s: "progress" },
      { t: "Multi-region active-active", s: "research" },
      { t: "SLA dashboards no Grafana", s: "planned" },
      { t: "Advanced automations (branching)", s: "planned" },
    ],
  },
]

const badge: Record<string, string> = {
  planned: "Planeado",
  progress: "Em curso",
  research: "Pesquisa",
}

export default function RoadmapPage() {
  return (
    <MarketingWidePage
      eyebrow="Roadmap"
      title="O que vem a seguir"
      description="Prioridades públicas — sujeitas a evolução com base em clientes design partners e requisitos de compliance."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {columns.map((col) => (
          <div key={col.title} className="rounded-xl border border-border bg-card/30 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{col.title}</h2>
            <ul className="mt-4 space-y-3">
              {col.items.map((it) => (
                <li key={it.t} className="rounded-lg border border-border/60 bg-background/40 px-3 py-2.5 text-sm">
                  <span className="font-medium text-foreground">{it.t}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{badge[it.s]}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </MarketingWidePage>
  )
}
