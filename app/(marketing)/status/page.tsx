import type { Metadata } from "next"
import { MarketingWidePage } from "@/components/marketing/sub-page"

export const metadata: Metadata = {
  title: "Status",
  description: "Estado dos componentes RelayDesk (dados ilustrativos).",
}

const rows = [
  { name: "API Gateway", state: "operational", uptime: "99.99%", latency: "42ms" },
  { name: "Realtime (Socket.IO)", state: "operational", uptime: "99.98%", latency: "28ms" },
  { name: "RabbitMQ", state: "operational", uptime: "99.99%", latency: "12ms" },
  { name: "Webhook engine", state: "operational", uptime: "99.97%", latency: "35ms" },
  { name: "Dashboard", state: "operational", uptime: "99.99%", latency: "18ms" },
  { name: "PostgreSQL", state: "operational", uptime: "99.99%", latency: "4ms" },
  { name: "Redis", state: "operational", uptime: "99.99%", latency: "1ms" },
  { name: "Telegram provider", state: "operational", uptime: "99.95%", latency: "API" },
]

export default function StatusPage() {
  return (
    <MarketingWidePage
      eyebrow="Status"
      title="Estado da plataforma"
      description="Vista consolidada dos serviços críticos. Os valores abaixo são ilustrativos até integração com probes e SLO reais no Grafana."
    >
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Componente</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Uptime (30d)</th>
              <th className="px-4 py-3 font-medium">Latência p95</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {r.state}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.uptime}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.latency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="mt-12 rounded-xl border border-border bg-card/30 p-6">
        <h2 className="text-sm font-semibold text-foreground">Incidentes recentes</h2>
        <p className="mt-2 text-sm text-muted-foreground">Sem incidentes públicos registados nos últimos 90 dias.</p>
      </section>
    </MarketingWidePage>
  )
}
