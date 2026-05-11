import type { Metadata } from "next"
import Link from "next/link"
import { MarketingSubPage } from "@/components/marketing/sub-page"
import { MarketingCodeBlock } from "@/components/marketing/code-block"

export const metadata: Metadata = {
  title: "Webhooks",
  description: "Motor de webhooks RelayDesk — HMAC, retries, DLQ.",
}

export default function PublicWebhooksPage() {
  return (
    <MarketingSubPage
      eyebrow="Platform"
      title="Webhook delivery engine"
      description="Subscrições por tenant, entregas assinadas, retries com backoff, DLQ e métricas Prometheus. Integra com o mesmo rigor de um pipeline financeiro."
    >
      <ul className="list-inside list-disc space-y-2 text-sm">
        <li>Assinatura HMAC por subscrição; segredo mostrado apenas na criação/rotação.</li>
        <li>Filas dedicadas com confirmação AMQP e dead-letter observável.</li>
        <li>Spans OpenTelemetry por tentativa HTTP (<code className="font-mono text-xs">webhook.delivery.http</code>).</li>
      </ul>
      <MarketingCodeBlock
        title="Criar subscrição (via gateway, JWT)"
        code={`POST /v1/webhooks
Authorization: Bearer <token>

{ "url": "https://api.partner.com/relaydesk", "eventTypes": ["message.received"] }`}
      />
      <p className="text-sm">
        Gestão de entregas e replay no dashboard em{" "}
        <Link href="/workspace/webhooks" className="text-primary underline-offset-4 hover:underline">
          /workspace/webhooks
        </Link>{" "}
        (área autenticada) —
        esta página descreve o produto público.
      </p>
    </MarketingSubPage>
  )
}
