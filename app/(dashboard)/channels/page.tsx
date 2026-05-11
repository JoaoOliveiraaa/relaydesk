"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Search,
  MessageCircle,
  Mail,
  Phone,
  Instagram,
  MessageSquare,
  MoreVertical,
  Settings,
  Loader2,
  Radio,
  Activity,
} from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

type ApiConnection = {
  id: string
  channel: string
  displayName: string
  status: string
  webhookStatus: string
  providerHealth: string
  syncState: string
  webhookUrl: string
  inboundLastAt: string | null
  outboundLastAt: string | null
  createdAt: string
}

const channelIcons: Record<string, React.ElementType> = {
  whatsapp: MessageCircle,
  email: Mail,
  phone: Phone,
  instagram: Instagram,
  telegram: MessageSquare,
  internal: MessageSquare,
}

const channelColors: Record<string, string> = {
  whatsapp: "from-green-500 to-green-600",
  email: "from-blue-500 to-blue-600",
  phone: "from-purple-500 to-purple-600",
  instagram: "from-pink-500 to-orange-500",
  telegram: "from-sky-500 to-sky-600",
  internal: "from-muted-foreground to-muted",
}

function healthLabel(h: string): string {
  if (h === "healthy") return "Saudável"
  if (h === "degraded") return "Degradado"
  if (h === "unhealthy") return "Indisponível"
  return "Desconhecido"
}

function webhookLabel(w: string): string {
  if (w === "active") return "Webhook ativo"
  if (w === "pending") return "Webhook pendente"
  if (w === "error") return "Webhook com erro"
  return "Webhook não configurado"
}

export default function ChannelsPage() {
  const { user } = useAuth()
  const [connections, setConnections] = React.useState<ApiConnection[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [connectOpen, setConnectOpen] = React.useState(false)
  const [botToken, setBotToken] = React.useState("")
  const [connecting, setConnecting] = React.useState(false)

  const load = React.useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data } = await api.get<ApiConnection[]>("/channel-connections")
      setConnections(data)
    } catch {
      toast.error("Não foi possível carregar os canais")
    } finally {
      setLoading(false)
    }
  }, [user])

  React.useEffect(() => {
    void load()
  }, [load])

  const filtered = connections.filter((c) =>
    c.displayName.toLowerCase().includes(search.toLowerCase()),
  )

  const connectTelegram = async () => {
    if (!botToken.trim()) return
    setConnecting(true)
    try {
      await api.post("/channel-connections/telegram", { botToken: botToken.trim() })
      toast.success("Telegram ligado — webhook configurado")
      setConnectOpen(false)
      setBotToken("")
      await load()
    } catch {
      toast.error("Falha ao ligar Telegram — verifique o token e PUBLIC_WEBHOOK_BASE_URL")
    } finally {
      setConnecting(false)
    }
  }

  const active = connections.filter((c) => c.status === "active" && c.webhookStatus === "active").length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Canais</h1>
          <p className="mt-1 text-muted-foreground">
            Ligações reais ao omnichannel — Telegram com webhook, filas e métricas
          </p>
        </div>
        <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" type="button">
              <Plus className="h-4 w-4" />
              Ligar Telegram
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bot Telegram</DialogTitle>
              <DialogDescription>
                Cole o token do @BotFather. O RelayDesk valida com getMe, encripta o token e executa setWebhook para{" "}
                <code className="text-xs">PUBLIC_WEBHOOK_BASE_URL</code>.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="123456789:AA…"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              autoComplete="off"
            />
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setConnectOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" disabled={connecting || !botToken.trim()} onClick={() => void connectTelegram()}>
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ligar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="glass-card rounded-2xl p-4">
          <p className="text-sm text-muted-foreground">Ligações activas</p>
          <p className="text-2xl font-bold text-emerald-400">
            {active}/{connections.length}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-sm text-muted-foreground">Última sincronização</p>
          <p className="flex items-center gap-2 text-sm text-foreground">
            <Activity className="h-4 w-4 text-primary" />
            {loading ? "…" : "API /channel-connections"}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-sm text-muted-foreground">Realtime inbox</p>
          <p className="flex items-center gap-2 text-sm text-foreground">
            <Radio className="h-4 w-4 text-green-400" />
            Mensagens Telegram → fila → ingest → Socket.IO
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar ligações…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((c, index) => {
              const Icon = channelIcons[c.channel] ?? MessageSquare
              const grad = channelColors[c.channel] ?? channelColors.internal
              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`glass-card cursor-pointer rounded-2xl p-5 transition-all hover:border-primary/30 ${
                    selectedId === c.id ? "border-primary/50 ring-1 ring-primary/20" : ""
                  }`}
                  onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${grad}`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <button type="button" className="rounded-lg p-1 text-muted-foreground hover:bg-card/50">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="mb-1 font-semibold text-foreground">{c.displayName}</h3>
                  <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">{c.channel}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-secondary px-2 py-1 text-secondary-foreground">
                      {webhookLabel(c.webhookStatus)}
                    </span>
                    <span className="rounded-full bg-secondary px-2 py-1 text-secondary-foreground">
                      {healthLabel(c.providerHealth)}
                    </span>
                    <span className="rounded-full bg-secondary px-2 py-1 text-secondary-foreground">
                      sync: {c.syncState}
                    </span>
                  </div>
                  {c.webhookUrl ? (
                    <p className="mt-3 truncate text-[11px] text-muted-foreground" title={c.webhookUrl}>
                      {c.webhookUrl}
                    </p>
                  ) : null}
                  <AnimatePresence>
                    {selectedId === c.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 flex gap-2 border-t border-border/50 pt-4">
                          <Button variant="outline" size="sm" className="flex-1 gap-1" type="button">
                            <Settings className="h-3 w-3" />
                            Docs
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filtered.length === 0 && !loading && (
            <div className="glass-card col-span-full flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-dashed p-8 text-center text-muted-foreground">
              <p className="mb-2 font-medium text-foreground">Sem ligações ainda</p>
              <p className="max-w-md text-sm">Use &quot;Ligar Telegram&quot; para criar a primeira ChannelConnection.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
