import type { Metadata } from "next"
import { MarketingSubPage } from "@/components/marketing/sub-page"

export const metadata: Metadata = { title: "Sobre" }

export default function AboutPage() {
  return (
    <MarketingSubPage
      eyebrow="Empresa"
      title="Sobre a RelayDesk"
      description="Construímos infraestrutura de atendimento omnichannel para equipas que não aceitam caixas negras: eventos, filas, observabilidade e segurança são requisitos, não extras."
    >
      <p>
        A RelayDesk nasce da convicção de que produtos de suporte devem partilhar o mesmo bar de qualidade que
        plataformas de dados e billing — tracing ponta-a-ponta, contratos versionados e operações previsíveis.
      </p>
    </MarketingSubPage>
  )
}
