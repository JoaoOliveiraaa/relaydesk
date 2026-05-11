import type { Metadata } from "next"
import Link from "next/link"
import { MarketingSubPage } from "@/components/marketing/sub-page"
import { MarketingCodeBlock } from "@/components/marketing/code-block"

export const metadata: Metadata = {
  title: "API Reference",
  description: "Referência rápida dos endpoints públicos RelayDesk.",
}

export default function ApiReferencePage() {
  return (
    <MarketingSubPage
      eyebrow="HTTP"
      title="API Reference"
      description="Prefixo estável /v1. O API Gateway faz proxy para auth e messaging; respostas JSON seguem o envelope RelayDesk (exceto rotas marcadas como raw)."
    >
      <div className="space-y-10">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Auth</h2>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>
              <code className="font-mono text-xs">POST /v1/auth/register</code>
            </li>
            <li>
              <code className="font-mono text-xs">POST /v1/auth/login</code>
            </li>
            <li>
              <code className="font-mono text-xs">POST /v1/auth/refresh</code>
            </li>
            <li>
              <code className="font-mono text-xs">GET /v1/auth/me</code> (Bearer)
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Messaging & Inbox</h2>
          <MarketingCodeBlock
            title="Ingest"
            code={`POST /v1/messages/ingest
→ messaging-service /v1/messages/ingest`}
          />
          <MarketingCodeBlock
            title="Inbox (JWT)"
            code={`GET  /v1/inbox/conversations
GET  /v1/inbox/conversations/:id/messages
POST /v1/inbox/conversations/:id/messages`}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Telegram (público)</h2>
          <MarketingCodeBlock
            title="Webhook"
            code={`POST /v1/providers/telegram/webhook/:connectionId
X-Telegram-Bot-Api-Secret-Token: <secret>`}
          />
        </section>

        <p className="text-sm">
          OpenAPI interactivo: <code className="font-mono text-xs">/docs</code> no gateway (4010) e no messaging (4012).
          Ver também <Link href="/developers" className="text-primary underline-offset-4 hover:underline">portal developer</Link>.
        </p>
      </div>
    </MarketingSubPage>
  )
}
