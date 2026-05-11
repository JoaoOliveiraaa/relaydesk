import type { Metadata } from "next"
import { MarketingWidePage } from "@/components/marketing/sub-page"

export const metadata: Metadata = {
  title: "Changelog",
  description: "Histórico de releases RelayDesk.",
}

const releases = [
  {
    version: "0.5.0",
    date: "Maio 2026",
    title: "Telegram Integration",
    bullets: [
      "Provider oficial Telegram: webhook validado, filas channel.inbound/outbound, métricas Prometheus.",
      "Channel connections com token encriptado e setWebhook automático.",
    ],
  },
  {
    version: "0.4.0",
    date: "2026",
    title: "Webhook Engine",
    bullets: ["HMAC, retries, DLQ, motor de entregas com tracing OpenTelemetry.", "Dashboard de entregas e replay."],
  },
  {
    version: "0.3.0",
    date: "2026",
    title: "Distributed Observability",
    bullets: ["Stack Grafana: Prometheus, Loki, Tempo, dashboards RelayDesk Overview.", "Spans AMQP publish/consume com correlação W3C."],
  },
  {
    version: "0.2.0",
    date: "2026",
    title: "Realtime Messaging",
    bullets: ["WebSocket gateway com adapter Redis e rate limit por evento.", "Bridge RabbitMQ → Socket.IO para inbox ao vivo."],
  },
  {
    version: "0.1.0",
    date: "2026",
    title: "Distributed Core Foundation",
    bullets: ["Microserviços NestJS, Prisma Migrate, multi-tenant JWT.", "RabbitMQ topic exchange, DLQ e graceful shutdown."],
  },
]

export default function ChangelogPage() {
  return (
    <MarketingWidePage
      eyebrow="Changelog"
      title="Releases"
      description="Marcos de produto alinhados à arquitetura distribuída — do core ao omnichannel."
    >
      <div className="relative border-l border-border/80 pl-8">
        {releases.map((r) => (
          <article key={r.version} className="relative pb-14 last:pb-0">
            <span className="absolute -left-[9px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
            <time className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{r.date}</time>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
              {r.title}{" "}
              <span className="ml-2 rounded-md bg-secondary px-2 py-0.5 font-mono text-sm font-normal text-muted-foreground">
                v{r.version}
              </span>
            </h2>
            <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-muted-foreground">
              {r.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </MarketingWidePage>
  )
}
