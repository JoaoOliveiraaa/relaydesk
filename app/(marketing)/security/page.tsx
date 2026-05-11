import type { Metadata } from "next"
import { MarketingSubPage } from "@/components/marketing/sub-page"

export const metadata: Metadata = {
  title: "Segurança",
  description: "Práticas de segurança RelayDesk — auth, webhooks, isolamento e observabilidade.",
}

export default function SecurityPage() {
  return (
    <MarketingSubPage
      eyebrow="Trust"
      title="Segurança & confiança"
      description="O RelayDesk foi desenhado com superfícies de ataque explícitas: cada camada (HTTP, AMQP, WebSocket, webhooks externos) tem políticas de autenticação, rate limiting e tráfego correlacionado."
    >
      <div className="space-y-10">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Autenticação</h2>
          <p className="mt-2">
            JWT de curta duração com refresh opaco em Redis; rotação e invalidação compatíveis com operações enterprise.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Webhooks & HMAC</h2>
          <p className="mt-2">
            Motor de entregas com assinatura por subscrição, verificação no SDK TypeScript e retries exponenciais até DLQ.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Isolamento multi-tenant</h2>
          <p className="mt-2">
            Dados particionados por <code className="font-mono text-xs">tenantId</code>; eventos AMQP incluem atributos semânticos para tracing e políticas de fila.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Credenciais de providers</h2>
          <p className="mt-2">
            Tokens de bots encriptados (AES-256-GCM); segredo de webhook Telegram armazenado apenas como hash SHA-256 para validação do header.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Rate limiting & resiliência</h2>
          <p className="mt-2">
            Throttling distribuído no gateway (IP, utilizador, tenant); circuit breakers em publicações AMQP e chamadas HTTP críticas; shutdown gracioso dos consumidores.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Observabilidade & auditoria</h2>
          <p className="mt-2">
            OpenTelemetry OTLP, logs estruturados, métricas Prometheus e modelo de audit logs para acções sensíveis no domínio.
          </p>
        </section>
      </div>
    </MarketingSubPage>
  )
}
