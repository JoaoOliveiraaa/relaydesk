import type { Metadata } from "next"
import { MarketingSubPage } from "@/components/marketing/sub-page"

export const metadata: Metadata = { title: "SLA" }

export default function SlaPage() {
  return (
    <MarketingSubPage title="Acordo de nível de serviço" description="Disponibilidade e tempos de resposta para Enterprise.">
      <p>
        Targets típicos: 99.9% API Gateway, janelas de manutenção comunicadas, P1 com resposta em &lt; 1h para clientes
        com plano Enterprise. Valores contractuais finais sob proposta comercial.
      </p>
    </MarketingSubPage>
  )
}
