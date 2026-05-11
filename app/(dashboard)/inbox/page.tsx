"use client"

import * as React from "react"
import { Send, MessageSquare, Instagram, Loader2, Radio } from "lucide-react"
import { io, type Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { WS_BASE } from "@/lib/env"
import { getAccessToken } from "@/lib/auth-storage"
import { useAuth } from "@/contexts/auth-context"

type ApiConversation = {
  id: string
  channel: string
  customerName: string | null
  customerExternalId: string | null
  status: string
  priority: string
  lastMessageAt: string | null
  lastMessagePreview: string | null
  unreadCount: number
}

type ApiMessage = {
  id: string
  content: string
  senderType: string
  source: string
  deliveryStatus: string
  sentByUserId: string | null
  createdAt: string
}

const channelIcons: Record<string, React.ElementType> = {
  whatsapp: MessageSquare,
  instagram: Instagram,
  telegram: MessageSquare,
  email: MessageSquare,
  internal: MessageSquare,
}

const channelColors: Record<string, string> = {
  whatsapp: "bg-green-500/20 text-green-400",
  instagram: "bg-pink-500/20 text-pink-400",
  telegram: "bg-blue-500/20 text-blue-400",
  email: "bg-amber-500/20 text-amber-200",
  internal: "bg-primary/20 text-primary",
}

function mapUiChannel(ch: string): keyof typeof channelColors {
  if (ch === "internal") return "internal"
  if (ch in channelColors) return ch as keyof typeof channelColors
  return "internal"
}

export default function InboxPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = React.useState<ApiConversation[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [messages, setMessages] = React.useState<ApiMessage[]>([])
  const [input, setInput] = React.useState("")
  const [loadingList, setLoadingList] = React.useState(true)
  const [loadingMsgs, setLoadingMsgs] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const [wsState, setWsState] = React.useState<"off" | "connecting" | "live">("off")
  const socketRef = React.useRef<Socket | null>(null)

  const selected = conversations.find((c) => c.id === selectedId) ?? null

  const loadConversations = React.useCallback(async () => {
    setLoadingList(true)
    try {
      const { data } = await api.get<ApiConversation[]>("/inbox/conversations")
      setConversations(data)
      setSelectedId((prev) => prev ?? (data[0]?.id ?? null))
    } finally {
      setLoadingList(false)
    }
  }, [])

  React.useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  const loadMessages = React.useCallback(async (id: string) => {
    setLoadingMsgs(true)
    try {
      const { data } = await api.get<ApiMessage[]>(`/inbox/conversations/${id}/messages`)
      setMessages(data)
    } finally {
      setLoadingMsgs(false)
    }
  }, [])

  React.useEffect(() => {
    if (selectedId) void loadMessages(selectedId)
  }, [selectedId, loadMessages])

  React.useEffect(() => {
    const token = getAccessToken()
    if (!token || !user) return
    setWsState("connecting")
    const s = io(`${WS_BASE}/realtime`, {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 12,
      reconnectionDelay: 800,
    })
    socketRef.current = s
    s.on("connect", () => {
      setWsState("live")
    })
    s.on("disconnect", () => setWsState("off"))
    s.on("relay:event", (envelope: { type?: string; conversationId?: string; payload?: { message?: ApiMessage } }) => {
      if (envelope.type !== "message.created" || !envelope.conversationId || !envelope.payload?.message) return
      const m = envelope.payload.message
      setMessages((prev) => {
        if (prev.some((x) => x.id === m.id)) return prev
        return [...prev, m]
      })
      setConversations((prev) =>
        prev.map((c) =>
          c.id === envelope.conversationId
            ? {
                ...c,
                lastMessagePreview: m.content.slice(0, 512),
                lastMessageAt: m.createdAt,
                unreadCount:
                  m.senderType === "customer" ? c.unreadCount + 1 : c.unreadCount,
              }
            : c,
        ),
      )
    })
    return () => {
      s.disconnect()
      socketRef.current = null
    }
  }, [user])

  React.useEffect(() => {
    const s = socketRef.current
    if (!s || !selectedId) return
    s.emit("conversation:join", { conversationId: selectedId }, () => {})
    return () => {
      s.emit("conversation:leave", { conversationId: selectedId })
    }
  }, [selectedId])

  const send = async () => {
    if (!selectedId || !input.trim()) return
    setSending(true)
    try {
      const { data } = await api.post<ApiMessage>(`/inbox/conversations/${selectedId}/messages`, {
        content: input.trim(),
      })
      setInput("")
      setMessages((prev) => (prev.some((x) => x.id === data.id) ? prev : [...prev, data]))
      await loadConversations()
    } finally {
      setSending(false)
    }
  }

  const simulateInbound = async () => {
    if (!user?.tenant.id) return
    const ext = `ext-${crypto.randomUUID().slice(0, 8)}`
    await api.post("/messages/ingest", {
      id: `sim-${Date.now()}`,
      tenantId: user.tenant.id,
      channel: "internal",
      sender: ext,
      content: `Mensagem de teste (${new Date().toLocaleTimeString("pt-PT")})`,
      timestamp: new Date().toISOString(),
    })
    await loadConversations()
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Radio className={cn("h-4 w-4", wsState === "live" && "text-green-400")} />
          <span>
            Realtime:{" "}
            <span className="text-foreground">
              {wsState === "live" ? "ligado" : wsState === "connecting" ? "a ligar…" : "desligado"}
            </span>
          </span>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={() => void simulateInbound()}>
          Simular mensagem de cliente
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 gap-0 overflow-hidden rounded-2xl border border-border bg-card">
        <aside className="flex w-80 flex-col border-r border-border">
          <div className="border-b border-border p-3 text-sm font-medium text-muted-foreground">Conversas</div>
          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              conversations.map((c) => {
                const uiCh = mapUiChannel(c.channel)
                const Icon = channelIcons[c.channel] ?? MessageSquare
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      "flex w-full items-start gap-3 border-b border-border p-3 text-left text-sm transition-colors",
                      selectedId === c.id ? "bg-primary/10" : "hover:bg-secondary/50",
                    )}
                  >
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", channelColors[uiCh])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium text-foreground">
                          {c.customerName || c.customerExternalId || "Cliente"}
                        </span>
                        {c.unreadCount > 0 && (
                          <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{c.lastMessagePreview || "—"}</p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-border px-4 py-3">
            <h2 className="font-semibold text-foreground">
              {selected ? selected.customerName || selected.customerExternalId || "Conversa" : "Selecione uma conversa"}
            </h2>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {loadingMsgs ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              messages.map((m) => {
                const mine = m.senderType === "agent" || m.senderType === "bot"
                return (
                  <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                        mine ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
                      )}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      <p className={cn("mt-1 text-[10px] opacity-70", mine && "text-primary-foreground/80")}>
                        {new Date(m.createdAt).toLocaleString("pt-PT")} · {m.senderType} · {m.deliveryStatus}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <footer className="border-t border-border p-3">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Mensagem como agente…"
                disabled={!selectedId || sending}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void send()}
              />
              <Button type="button" disabled={!selectedId || sending || !input.trim()} onClick={() => void send()}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  )
}
