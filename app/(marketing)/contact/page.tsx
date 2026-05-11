import type { Metadata } from "next"
import { MarketingSubPage } from "@/components/marketing/sub-page"

export const metadata: Metadata = { title: "Contacto" }

export default function ContactPage() {
  return (
    <MarketingSubPage eyebrow="Contacto" title="Fala connosco" description="Vendas, parcerias e questões de segurança.">
      <p>
        Email: <span className="font-mono text-sm text-foreground">hello@relaydesk.example</span>
      </p>
    </MarketingSubPage>
  )
}
