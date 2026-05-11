import type { Metadata } from "next"
import Link from "next/link"
import { MarketingSubPage } from "@/components/marketing/sub-page"
import { MarketingCodeBlock } from "@/components/marketing/code-block"

export const metadata: Metadata = {
  title: "Documentação",
  description: "Guia de integração RelayDesk — auth, mensagens, realtime e Telegram.",
}

export default function DocsPage() {
  return (
    <MarketingSubPage
      eyebrow="Docs"
      title="Documentação"
      description="Visão geral dos fluxos suportados pelo API Gateway e pelos microsserviços. Para payloads exactos, consulta também a OpenAPI em cada serviço."
    >
      <div className="space-y-10">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Autenticação</h2>
          <p>
            O registo devolve tokens de acesso e refresh. O refresh é opaco e armazenado em Redis; o access token é
            JWT com <code className="rounded bg-secondary px-1 font-mono text-xs">tenantId</code>,{" "}
            <code className="rounded bg-secondary px-1 font-mono text-xs">sub</code> e role.
          </p>
          <MarketingCodeBlock
            title="Login (via gateway)"
            code={`POST /v1/auth/login
Content-Type: application/json

{ "tenantSlug": "acme", "email": "you@acme.com", "password": "••••••••" }`}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Ingestão omnichannel</h2>
          <p>
            Mensagens normalizadas entram por <Link className="text-primary underline-offset-4 hover:underline" href="/api-reference">POST /v1/messages/ingest</Link> com
            idempotência em Redis.
          </p>
          <MarketingCodeBlock
            title="Ingest (exemplo)"
            code={`POST /v1/messages/ingest
Authorization: Bearer <access_token>
x-correlation-id: <uuid>

{
  "id": "ext-001",
  "tenantId": "<tenant_cuid>",
  "channel": "telegram",
  "sender": "123456789",
  "content": "Olá",
  "timestamp": "2026-05-11T12:00:00.000Z"
}`}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Realtime</h2>
          <p>
            O browser conecta ao WebSocket Gateway com JWT; eventos <code className="rounded bg-secondary px-1 font-mono text-xs">relay:event</code> espelham o envelope
            publicado em <code className="rounded bg-secondary px-1 font-mono text-xs">realtime.outbound</code>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Telegram</h2>
          <p>
            Liga o bot na área <Link href="/channels" className="text-primary underline-offset-4 hover:underline">Canais</Link> (dashboard autenticado). O webhook público
            valida o secret token e encadeia o pipeline <code className="rounded bg-secondary px-1 font-mono text-xs">channel.inbound</code>.
          </p>
        </section>
      </div>
    </MarketingSubPage>
  )
}
