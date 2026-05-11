import type { Metadata } from "next"
import { MarketingSubPage } from "@/components/marketing/sub-page"

export const metadata: Metadata = { title: "GDPR" }

export default function GdprPage() {
  return (
    <MarketingSubPage title="RGPD / GDPR" description="Compromissos de tratamento de dados pessoais.">
      <p>
        Direito de acesso, retificação e apagamento; registo de operações; sub-processadores listados no DPA. Texto
        detalhado alinhado ao encarregado de proteção de dados em roadmap legal.
      </p>
    </MarketingSubPage>
  )
}
