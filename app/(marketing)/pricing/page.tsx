import type { Metadata } from "next"
import Link from "next/link"
import { Check } from "lucide-react"
import { MarketingWidePage } from "@/components/marketing/sub-page"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Preços",
  description: "Planos RelayDesk — Starter, Growth e Enterprise.",
}

const plans = [
  {
    name: "Starter",
    price: "99€",
    period: "/mês",
    desc: "Equipas a validar omnichannel com observabilidade incluída.",
    features: [
      "Canais realtime limitados",
      "Webhooks & API",
      "Métricas & tracing base",
      "Suporte email",
    ],
    cta: "Começar",
    href: "/register",
    highlight: false,
  },
  {
    name: "Growth",
    price: "299€",
    period: "/mês",
    desc: "Operação em escala com automações e integrações completas.",
    features: [
      "Canais omnichannel completos",
      "Motor de webhooks enterprise",
      "Stack observabilidade (Grafana)",
      "Filas & DLQ prioritárias",
      "Suporte prioritário",
    ],
    cta: "Começar",
    href: "/register",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "SLA, SSO, multi-região e acompanhamento dedicado.",
    features: [
      "SLA contractuais",
      "Suporte 24/7 & CSM",
      "Deployment Kubernetes dedicado",
      "Isolamento avançado & compliance",
      "Roadmap conjunto",
    ],
    cta: "Contactar vendas",
    href: "/contact",
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <MarketingWidePage
      eyebrow="Pricing"
      title="Planos transparentes"
      description="Preços indicativos alinhados a valor de plataforma: realtime, webhooks, observabilidade e operações multi-tenant."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`flex flex-col rounded-2xl border p-6 ${
              p.highlight ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/10" : "border-border bg-card/40"
            }`}
          >
            <h2 className="text-lg font-semibold text-foreground">{p.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            <p className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
              {p.price}
              <span className="text-base font-normal text-muted-foreground">{p.period}</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-sm text-muted-foreground">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 w-full" variant={p.highlight ? "default" : "outline"}>
              <Link href={p.href}>{p.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </MarketingWidePage>
  )
}
