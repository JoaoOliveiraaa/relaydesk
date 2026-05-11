import type { Metadata } from "next"
import { MarketingSubPage } from "@/components/marketing/sub-page"

export const metadata: Metadata = { title: "Privacidade" }

export default function PrivacyPage() {
  return (
    <MarketingSubPage title="Política de privacidade" description="Versão resumida para demonstração do site público.">
      <p>
        Explicamos que dados de conta, conversas e telemetria operacional são tratados com base em minimização e
        segregação por tenant. A política legal completa será publicada antes de produção com DPO indicado.
      </p>
    </MarketingSubPage>
  )
}
