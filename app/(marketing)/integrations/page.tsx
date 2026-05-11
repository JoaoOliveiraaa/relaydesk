import type { Metadata } from "next"
import Link from "next/link"
import { MarketingWidePage } from "@/components/marketing/sub-page"

export const metadata: Metadata = { title: "Integrações" }

const items = [
  { name: "Telegram Bot API", status: "Disponível", href: "/#telegram" },
  { name: "Webhook HTTP outbound", status: "Disponível", href: "/webhooks" },
  { name: "OpenAPI / SDK TS", status: "Disponível", href: "/sdks" },
  { name: "WhatsApp Cloud API", status: "Roadmap", href: "/roadmap" },
  { name: "Email", status: "Roadmap", href: "/roadmap" },
]

export default function IntegrationsPage() {
  return (
    <MarketingWidePage
      eyebrow="Integrações"
      title="Ecossistema"
      description="Canais oficiais e pontos de extensão. Cada integração herda o mesmo pipeline de eventos e observabilidade."
    >
      <ul className="divide-y divide-border rounded-xl border border-border">
        {items.map((it) => (
          <li key={it.name} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
            <span className="font-medium text-foreground">{it.name}</span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{it.status}</span>
              <Link href={it.href} className="text-sm font-medium text-primary hover:underline">
                Detalhes
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </MarketingWidePage>
  )
}
