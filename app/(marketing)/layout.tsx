import type { Metadata } from "next"
import { MarketingBackground } from "@/components/marketing/marketing-background"
import { MarketingNavbar } from "@/components/marketing/marketing-navbar"
import { EnterpriseFooter } from "@/components/marketing/enterprise-footer"

export const metadata: Metadata = {
  ...(process.env.NEXT_PUBLIC_SITE_URL
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) }
    : {}),
  title: {
    default: "RelayDesk — Omnichannel enterprise",
    template: "%s · RelayDesk",
  },
  description:
    "Plataforma SaaS multi-tenant: eventos, RabbitMQ, realtime, motor de webhooks, OpenTelemetry e integrações reais (Telegram).",
  openGraph: {
    title: "RelayDesk",
    description: "Omnichannel enterprise orientado a eventos.",
    type: "website",
  },
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <MarketingBackground />
      <div className="relative z-10">
        <MarketingNavbar />
        <div className="pt-14">{children}</div>
        <EnterpriseFooter />
      </div>
    </div>
  )
}
