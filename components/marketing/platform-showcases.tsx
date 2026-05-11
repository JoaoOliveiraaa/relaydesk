"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import {
  Activity,
  ArrowRight,
  Binary,
  GitBranch,
  Globe,
  Layers,
  LineChart,
  Radio,
  Shield,
  Sparkles,
  Webhook,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"

function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id?: string
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <section id={id} ref={ref} className="relative scroll-mt-24 border-t border-border/60 py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>
        </motion.div>
        <div className="mt-14">{children}</div>
      </div>
    </section>
  )
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[oklch(0.06_0.01_270)]">
      <div className="flex items-center justify-between border-b border-border/80 px-4 py-2.5">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">example</span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-foreground/90 sm:text-[13px]">
        <code>{code}</code></pre>
    </div>
  )
}

const fade = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
} as const

export function PlatformShowcases() {
  return (
    <>
      <SectionShell
        id="infrastructure"
        eyebrow="Infraestrutura em tempo real"
        title="Filas, fan-out e inbox sem compromissos"
        description="Mensagens atravessam o API Gateway, persistem no domínio de messaging e propagam eventos para workers, motor de webhooks e Socket.IO — com correlação, retries e DLQ onde importa."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div {...fade} className="rounded-2xl border border-border bg-card/40 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/50">
                <Radio className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Pipeline AMQP</p>
                <p className="text-xs text-muted-foreground">topic exchange · confirma publish · tracing nos headers</p>
              </div>
            </div>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">—</span> message.received → AI / automações
              </li>
              <li className="flex gap-2">
                <span className="text-primary">—</span> realtime.outbound → bridge WebSocket
              </li>
              <li className="flex gap-2">
                <span className="text-primary">—</span> channel.inbound / outbound (Telegram)
              </li>
            </ul>
          </motion.div>
          <motion.div {...fade} transition={{ ...fade.transition, delay: 0.06 }} className="rounded-2xl border border-border bg-card/40 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/50">
                <Globe className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Multi-tenant nativo</p>
                <p className="text-xs text-muted-foreground">JWT · isolamento por tenant em dados e eventos</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Cada conversa, webhook e entrega herda o contexto do tenant. O gateway aplica rate limits por IP, utilizador
              e tenant — padrão enterprise, não MVP.
            </p>
          </motion.div>
        </div>
        <motion.div {...fade} transition={{ ...fade.transition, delay: 0.1 }} className="mt-8">
          <CodeBlock
            title="Envelope realtime (v1)"
            code={`{
  "v": 1,
  "type": "message.created",
  "tenantId": "tenant_…",
  "conversationId": "conv_…",
  "correlationId": "01HQ…",
  "payload": { "message": { "id": "…", "content": "Olá", "deliveryStatus": "pending" } }
}`}
          />
        </motion.div>
      </SectionShell>

      <SectionShell
        eyebrow="Webhook engine"
        title="Entregas assinadas, métricas e DLQ"
        description="O motor enterprise de webhooks combina HMAC, retries exponenciais, DLQ observável e tráfego correlacionado com OpenTelemetry — o mesmo rigor que esperarias numa billing API."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Shield, t: "Assinatura HMAC", d: "Verificação criptográfica por subscrição." },
            { icon: GitBranch, t: "Retries + DLQ", d: "Backoff, dead-letter e replay controlado." },
            { icon: LineChart, t: "Métricas & tracing", d: "Histogramas, contadores e spans por entrega." },
          ].map((c, i) => (
            <motion.div
              key={c.t}
              {...fade}
              transition={{ ...fade.transition, delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card/30 p-5"
            >
              <c.icon className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-medium text-foreground">{c.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
            </motion.div>
          ))}
        </div>
        <motion.div {...fade} className="mt-8">
          <CodeBlock
            title="Verificação (Node)"
            code={`import { verifyWebhookSignature } from '@relaydesk/sdk';

const event = verifyWebhookSignature(rawBody, signatureHeader, secret);`}
          />
        </motion.div>
      </SectionShell>

      <SectionShell
        eyebrow="Observabilidade"
        title="Traces, métricas e logs — de ponta a ponta"
        description="Prometheus, Grafana, Loki e Tempo alinham com spans AMQP, HTTP e WebSocket. O painel RelayDesk Overview dá contexto operacional sem ruído visual."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Activity, label: "OTLP → Tempo", sub: "W3C traceparent" },
            { icon: Layers, label: "Loki + Promtail", sub: "logs correlacionados" },
            { icon: Sparkles, label: "Dashboards", sub: "AMQP + webhooks" },
            { icon: Binary, label: "Prisma + Redis", sub: "instrumentação activa" },
          ].map((x, i) => (
            <motion.div
              key={x.label}
              {...fade}
              transition={{ ...fade.transition, delay: i * 0.04 }}
              className="rounded-lg border border-border bg-secondary/20 px-4 py-4"
            >
              <x.icon className="h-4 w-4 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">{x.label}</p>
              <p className="text-xs text-muted-foreground">{x.sub}</p>
            </motion.div>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="telegram"
        eyebrow="Omnichannel real"
        title="Telegram como primeiro canal de produção"
        description="Webhook público validado por secret token, fila dedicada de inbound, adapter normalizado para o contrato IncomingMessage e outbound assíncrono com rate limit e métricas Prometheus."
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <motion.ol {...fade} className="space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-xs font-medium text-foreground">
                1
              </span>
              <span>
                <strong className="text-foreground">Ligar o bot</strong> — token encriptado (AES-256-GCM),{" "}
                <code className="rounded bg-secondary px-1 py-0.5 font-mono text-xs">setWebhook</code> automático.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-xs font-medium text-foreground">
                2
              </span>
              <span>
                <strong className="text-foreground">Update → RabbitMQ</strong> — processamento assíncrono com retries e
                DLQ.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-xs font-medium text-foreground">
                3
              </span>
              <span>
                <strong className="text-foreground">Inbox em tempo real</strong> — agente responde;{" "}
                <code className="rounded bg-secondary px-1 py-0.5 font-mono text-xs">sendMessage</code> com span dedicado.
              </span>
            </li>
          </motion.ol>
          <motion.div {...fade} transition={{ ...fade.transition, delay: 0.08 }}>
            <CodeBlock
              title="Fluxo inbound (simplificado)"
              code={`POST /v1/providers/telegram/webhook/:connectionId
X-Telegram-Bot-Api-Secret-Token: <secret>
→ channel.inbound → normalize → /v1/messages/ingest (interno)`}
            />
          </motion.div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/docs">
              Ver documentação <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link href="/roadmap">Roadmap omnichannel</Link>
          </Button>
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Onboarding"
        title="Do zero ao primeiro evento correlacionado"
        description="Um fluxo linear — autenticação, canal, inbox e webhooks — desenhado para equipas de produto e plataforma."
      >
        <div className="grid gap-4 md:grid-cols-5">
          {["Auth + tenant", "Channel connection", "Webhook / fila", "Inbox realtime", "Observability"].map((step, i) => (
            <motion.div
              key={step}
              {...fade}
              transition={{ ...fade.transition, delay: i * 0.05 }}
              className="relative rounded-xl border border-border bg-card/30 p-4 text-center"
            >
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 text-xs font-semibold text-primary">
                {i + 1}
              </div>
              <p className="text-xs font-medium text-foreground">{step}</p>
            </motion.div>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Roadmap de plataforma"
        title="Arquitectura preparada para o ecossistema completo"
        description="Event-driven core, filas, realtime e motor de webhooks já estão em produção-like. O roadmap público detalha WhatsApp Cloud, workflows de IA e operações multi-região."
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild size="sm">
            <Link href="/roadmap">
              Ver roadmap <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/changelog">Changelog</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link href="/status">Status</Link>
          </Button>
        </div>
      </SectionShell>
    </>
  )
}
