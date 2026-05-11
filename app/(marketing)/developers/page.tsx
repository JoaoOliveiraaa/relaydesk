import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Book, Code2, Radio, Webhook } from "lucide-react"
import { MarketingWidePage } from "@/components/marketing/sub-page"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Developers",
  description: "Portal developer RelayDesk — docs, API, SDKs, webhooks e exemplos.",
}

const cards = [
  {
    title: "Documentação",
    desc: "Fluxos de autenticação, ingestão omnichannel, realtime e Telegram.",
    href: "/docs",
    icon: Book,
  },
  {
    title: "API Reference",
    desc: "Contratos HTTP versionados, envelopes RelayDesk e headers de correlação.",
    href: "/api-reference",
    icon: Code2,
  },
  {
    title: "SDKs",
    desc: "Cliente TypeScript, verificação HMAC de webhooks e helpers de retry.",
    href: "/sdks",
    icon: Radio,
  },
  {
    title: "Webhooks",
    desc: "Motor enterprise: assinaturas, retries, DLQ e observabilidade.",
    href: "/webhooks",
    icon: Webhook,
  },
]

export default function DevelopersPage() {
  return (
    <MarketingWidePage
      eyebrow="Developers"
      title="Portal developer"
      description="Tudo o que precisas para integrar o RelayDesk com o mesmo rigor que o core interno: contratos explícitos, exemplos e caminhos para produção."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-xl border border-border bg-card/40 p-6 transition-colors hover:border-primary/25 hover:bg-card/70"
          >
            <c.icon className="h-5 w-5 text-primary" />
            <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">{c.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
              Abrir
              <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/status">Status</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href="/changelog">Changelog</Link>
        </Button>
      </div>
    </MarketingWidePage>
  )
}
