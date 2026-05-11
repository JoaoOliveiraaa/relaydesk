import type { Metadata } from "next"
import { MarketingSubPage } from "@/components/marketing/sub-page"

export const metadata: Metadata = { title: "Carreiras" }

export default function CareersPage() {
  return (
    <MarketingSubPage eyebrow="Carreiras" title="Junta-te à equipa" description="Procuramos engenheiros de plataforma e product engineers obcecados por DX.">
      <p>Lista de posições abertas em atualização — envia CV para careers@relaydesk.example.</p>
    </MarketingSubPage>
  )
}
