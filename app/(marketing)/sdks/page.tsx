import type { Metadata } from "next"
import Link from "next/link"
import { MarketingSubPage } from "@/components/marketing/sub-page"
import { MarketingCodeBlock } from "@/components/marketing/code-block"

export const metadata: Metadata = {
  title: "SDKs",
  description: "Pacote @relaydesk/sdk — cliente e verificação de webhooks.",
}

export default function SdksPage() {
  return (
    <MarketingSubPage
      eyebrow="SDK"
      title="SDKs TypeScript"
      description="O monorepo inclui o pacote @relaydesk/sdk com tipagens alinhadas ao motor de webhooks e exemplos de verificação HMAC."
    >
      <MarketingCodeBlock
        title="Instalação (workspace)"
        code={`pnpm add @relaydesk/sdk`}
      />
      <MarketingCodeBlock
        title="Verificar assinatura"
        code={`import { verifyWebhookSignature } from '@relaydesk/sdk';

const event = verifyWebhookSignature(rawBody, signatureHeader, signingSecret);`}
      />
      <p className="text-sm">
        Código-fonte e paths em <code className="font-mono text-xs">packages/sdk</code>. Para REST genérico, qualquer cliente HTTP com suporte a{" "}
        <code className="font-mono text-xs">x-correlation-id</code> funciona — ver{" "}
        <Link href="/docs" className="text-primary underline-offset-4 hover:underline">
          documentação
        </Link>
        .
      </p>
    </MarketingSubPage>
  )
}
