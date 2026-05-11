"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Webhook,
  Plus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Code,
  Eye,
  Trash2,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface WebhookEvent {
  id: string
  endpoint: string
  method: "POST" | "GET" | "PUT" | "DELETE"
  event: string
  status: "success" | "failed" | "pending"
  statusCode: number
  timestamp: string
  duration: string
  retries: number
  payload: Record<string, unknown>
  response: Record<string, unknown>
}

const webhookEvents: WebhookEvent[] = [
  {
    id: "1",
    endpoint: "https://api.myapp.com/webhooks/tickets",
    method: "POST",
    event: "ticket.created",
    status: "success",
    statusCode: 200,
    timestamp: "2024-01-15 14:32:45",
    duration: "124ms",
    retries: 0,
    payload: { ticket_id: "4521", customer_id: "cust_123", subject: "Problema com pedido" },
    response: { received: true, processed: true },
  },
  {
    id: "2",
    endpoint: "https://api.myapp.com/webhooks/messages",
    method: "POST",
    event: "message.received",
    status: "success",
    statusCode: 200,
    timestamp: "2024-01-15 14:31:22",
    duration: "89ms",
    retries: 0,
    payload: { message_id: "msg_456", channel: "whatsapp", content: "Olá, preciso de ajuda" },
    response: { acknowledged: true },
  },
  {
    id: "3",
    endpoint: "https://api.external.com/notify",
    method: "POST",
    event: "agent.assigned",
    status: "failed",
    statusCode: 503,
    timestamp: "2024-01-15 14:28:11",
    duration: "5002ms",
    retries: 3,
    payload: { ticket_id: "4520", agent_id: "agent_789" },
    response: { error: "Service Unavailable" },
  },
  {
    id: "4",
    endpoint: "https://api.myapp.com/webhooks/analytics",
    method: "POST",
    event: "ticket.resolved",
    status: "success",
    statusCode: 201,
    timestamp: "2024-01-15 14:25:00",
    duration: "156ms",
    retries: 0,
    payload: { ticket_id: "4519", resolution_time: "2h 15m", satisfaction: 5 },
    response: { logged: true },
  },
  {
    id: "5",
    endpoint: "https://api.myapp.com/webhooks/ai",
    method: "POST",
    event: "ai.response",
    status: "pending",
    statusCode: 0,
    timestamp: "2024-01-15 14:24:30",
    duration: "-",
    retries: 1,
    payload: { conversation_id: "conv_001", ai_confidence: 0.95 },
    response: {},
  },
]

const statusColors = {
  success: "bg-accent/20 text-accent border-accent/30",
  failed: "bg-destructive/20 text-destructive border-destructive/30",
  pending: "bg-warning/20 text-warning border-warning/30",
}

const methodColors = {
  POST: "bg-primary/20 text-primary",
  GET: "bg-accent/20 text-accent",
  PUT: "bg-warning/20 text-warning",
  DELETE: "bg-destructive/20 text-destructive",
}

export default function WebhooksPage() {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const toggleExpand = (id: string) => {
    setExpandedEvent(expandedEvent === id ? null : id)
  }

  const filteredEvents = webhookEvents.filter(event => {
    if (filter !== "all" && event.status !== filter) return false
    if (searchQuery && !event.event.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !event.endpoint.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Webhooks</h1>
          <p className="text-muted-foreground">Monitore eventos e integrações em tempo real</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Webhook
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
              <Webhook className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">8</p>
              <p className="text-sm text-muted-foreground">Endpoints Ativos</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
              <CheckCircle className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">12,847</p>
              <p className="text-sm text-muted-foreground">Eventos Hoje</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-3/20">
              <Clock className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">98ms</p>
              <p className="text-sm text-muted-foreground">Latência Média</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/20">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">0.3%</p>
              <p className="text-sm text-muted-foreground">Taxa de Falha</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos ou endpoints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-xl bg-secondary/50 pl-9 border-border"
          />
        </div>
        <div className="flex gap-2">
          {["all", "success", "failed", "pending"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              )}
            >
              {f === "all" ? "Todos" : f === "success" ? "Sucesso" : f === "failed" ? "Falha" : "Pendente"}
            </button>
          ))}
        </div>
        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Events Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 border-b border-border bg-secondary/30 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Evento</div>
          <div className="col-span-4">Endpoint</div>
          <div className="col-span-1">Método</div>
          <div className="col-span-1">Código</div>
          <div className="col-span-1">Duração</div>
          <div className="col-span-1">Retries</div>
          <div className="col-span-1">Ações</div>
        </div>

        {/* Table Body */}
        <div>
          {filteredEvents.map((event, index) => (
            <div key={event.id}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "grid grid-cols-12 gap-4 px-6 py-4 text-sm transition-colors hover:bg-secondary/30",
                  expandedEvent === event.id && "bg-secondary/30"
                )}
              >
                {/* Status */}
                <div className="col-span-1 flex items-center">
                  <span className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium",
                    statusColors[event.status]
                  )}>
                    {event.status === "success" && <CheckCircle className="h-3 w-3" />}
                    {event.status === "failed" && <XCircle className="h-3 w-3" />}
                    {event.status === "pending" && <Clock className="h-3 w-3" />}
                  </span>
                </div>

                {/* Event */}
                <div className="col-span-2 flex items-center">
                  <code className="rounded bg-secondary px-2 py-1 font-mono text-xs text-foreground">
                    {event.event}
                  </code>
                </div>

                {/* Endpoint */}
                <div className="col-span-4 flex items-center">
                  <span className="truncate text-muted-foreground">{event.endpoint}</span>
                </div>

                {/* Method */}
                <div className="col-span-1 flex items-center">
                  <span className={cn(
                    "rounded px-2 py-0.5 text-xs font-bold",
                    methodColors[event.method]
                  )}>
                    {event.method}
                  </span>
                </div>

                {/* Status Code */}
                <div className="col-span-1 flex items-center">
                  <span className={cn(
                    "font-mono text-sm",
                    event.statusCode >= 200 && event.statusCode < 300 && "text-accent",
                    event.statusCode >= 400 && "text-destructive",
                    event.statusCode === 0 && "text-muted-foreground"
                  )}>
                    {event.statusCode || "-"}
                  </span>
                </div>

                {/* Duration */}
                <div className="col-span-1 flex items-center">
                  <span className="font-mono text-muted-foreground">{event.duration}</span>
                </div>

                {/* Retries */}
                <div className="col-span-1 flex items-center">
                  <span className={cn(
                    "text-sm",
                    event.retries > 0 ? "text-warning" : "text-muted-foreground"
                  )}>
                    {event.retries}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleExpand(event.id)}
                  >
                    {expandedEvent === event.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedEvent === event.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-border bg-secondary/20"
                  >
                    <div className="grid grid-cols-2 gap-6 p-6">
                      {/* Request Payload */}
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-foreground">Request Payload</h4>
                          <Button variant="ghost" size="sm" className="h-7 gap-1.5">
                            <Copy className="h-3 w-3" />
                            Copiar
                          </Button>
                        </div>
                        <div className="rounded-xl bg-card border border-border p-4">
                          <pre className="overflow-x-auto font-mono text-xs text-muted-foreground">
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        </div>
                      </div>

                      {/* Response */}
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-foreground">Response</h4>
                          <Button variant="ghost" size="sm" className="h-7 gap-1.5">
                            <Copy className="h-3 w-3" />
                            Copiar
                          </Button>
                        </div>
                        <div className="rounded-xl bg-card border border-border p-4">
                          <pre className="overflow-x-auto font-mono text-xs text-muted-foreground">
                            {JSON.stringify(event.response, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="border-t border-border px-6 py-4">
                      <div className="flex items-center gap-6 text-xs text-muted-foreground">
                        <span>Timestamp: <span className="text-foreground">{event.timestamp}</span></span>
                        <span>Event ID: <span className="text-foreground font-mono">{event.id}</span></span>
                        <span>Retries: <span className="text-foreground">{event.retries}</span></span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
