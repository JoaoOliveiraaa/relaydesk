import type { Metadata } from "next"
import { MarketingSubPage } from "@/components/marketing/sub-page"

export const metadata: Metadata = { title: "Imprensa" }

export default function PressPage() {
  return (
    <MarketingSubPage eyebrow="Imprensa" title="Kit de media" description="Logótipos, fact sheet e contacto de PR.">
      <p>Recursos para jornalistas disponíveis sob pedido — press@relaydesk.example</p>
    </MarketingSubPage>
  )
}
