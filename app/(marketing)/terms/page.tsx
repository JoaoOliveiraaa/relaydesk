import type { Metadata } from "next"
import { MarketingSubPage } from "@/components/marketing/sub-page"

export const metadata: Metadata = { title: "Termos" }

export default function TermsPage() {
  return (
    <MarketingSubPage title="Termos de utilização" description="Condições gerais do serviço RelayDesk (rascunho).">
      <p>Uso aceitável, limitação de responsabilidade e alterações contratuais — documento jurídico final em preparação.</p>
    </MarketingSubPage>
  )
}
