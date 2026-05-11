"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Trash2,
  Power,
  CheckCircle2,
  XCircle,
  Zap,
  Users,
  TrendingUp
} from "lucide-react"

interface Channel {
  id: string
  name: string
  type: "whatsapp" | "email" | "phone" | "instagram" | "telegram" | "sms"
  status: "active" | "inactive" | "error"
  connectedAt: string
  messagesTotal: number
  messagesDay: number
  contacts: number
}

const mockChannels: Channel[] = [
  {
    id: "1",
    name: "WhatsApp Business",
    type: "whatsapp",
    status: "active",
    connectedAt: "2024-01-15",
    messagesTotal: 45892,
    messagesDay: 234,
    contacts: 12450
  },
  {
    id: "2",
    name: "Suporte Email",
    type: "email",
    status: "active",
    connectedAt: "2024-01-10",
    messagesTotal: 28456,
    messagesDay: 156,
    contacts: 8920
  },
  {
    id: "3",
    name: "Central Telefonica",
    type: "phone",
    status: "active",
    connectedAt: "2024-02-01",
    messagesTotal: 15678,
    messagesDay: 89,
    contacts: 4560
  },
  {
    id: "4",
    name: "Instagram DM",
    type: "instagram",
    status: "inactive",
    connectedAt: "2024-01-20",
    messagesTotal: 8934,
    messagesDay: 0,
    contacts: 2340
  },
  {
    id: "5",
    name: "Telegram Bot",
    type: "telegram",
    status: "error",
    connectedAt: "2024-02-05",
    messagesTotal: 3456,
    messagesDay: 0,
    contacts: 890
  }
]

const channelIcons = {
  whatsapp: MessageCircle,
  email: Mail,
  phone: Phone,
  instagram: Instagram,
  telegram: MessageSquare,
  sms: MessageSquare
}

const channelColors = {
  whatsapp: "from-green-500 to-green-600",
  email: "from-blue-500 to-blue-600",
  phone: "from-purple-500 to-purple-600",
  instagram: "from-pink-500 to-orange-500",
  telegram: "from-sky-500 to-sky-600",
  sms: "from-amber-500 to-amber-600"
}

const statusConfig = {
  active: { label: "Ativo", color: "text-emerald-400", bg: "bg-emerald-500/20", icon: CheckCircle2 },
  inactive: { label: "Inativo", color: "text-muted-foreground", bg: "bg-muted/50", icon: XCircle },
  error: { label: "Erro", color: "text-red-400", bg: "bg-red-500/20", icon: XCircle }
}

export default function ChannelsPage() {
  const [channels] = useState<Channel[]>(mockChannels)
  const [search, setSearch] = useState("")
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalMessages = channels.reduce((acc, ch) => acc + ch.messagesDay, 0)
  const totalContacts = channels.reduce((acc, ch) => acc + ch.contacts, 0)
  const activeChannels = channels.filter(ch => ch.status === "active").length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Canais</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas integrações e canais de comunicação
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Canal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Canais Ativos", value: activeChannels, total: channels.length, icon: Zap, color: "text-emerald-400" },
          { label: "Mensagens Hoje", value: totalMessages.toLocaleString(), icon: MessageCircle, color: "text-primary" },
          { label: "Total de Contatos", value: totalContacts.toLocaleString(), icon: Users, color: "text-accent" },
          { label: "Taxa de Resposta", value: "94.5%", icon: TrendingUp, color: "text-amber-400" }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                  {stat.total && (
                    <span className="text-muted-foreground text-sm font-normal">/{stat.total}</span>
                  )}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-card/50 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar canais..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredChannels.map((channel, index) => {
            const Icon = channelIcons[channel.type]
            const status = statusConfig[channel.status]
            const StatusIcon = status.icon
            
            return (
              <motion.div
                key={channel.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedChannel(selectedChannel === channel.id ? null : channel.id)}
                className={`glass-card rounded-2xl p-5 cursor-pointer transition-all hover:border-primary/30 ${
                  selectedChannel === channel.id ? "border-primary/50 ring-1 ring-primary/20" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${channelColors[channel.type]} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color} flex items-center gap-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                    <button className="p-1 rounded-lg hover:bg-card/50 text-muted-foreground">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-foreground mb-1">{channel.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Conectado em {new Date(channel.connectedAt).toLocaleDateString("pt-BR")}
                </p>

                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">{channel.messagesDay}</p>
                    <p className="text-xs text-muted-foreground">Hoje</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">{(channel.messagesTotal / 1000).toFixed(1)}k</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">{(channel.contacts / 1000).toFixed(1)}k</p>
                    <p className="text-xs text-muted-foreground">Contatos</p>
                  </div>
                </div>

                {/* Expanded Actions */}
                <AnimatePresence>
                  {selectedChannel === channel.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-2 pt-4 mt-4 border-t border-border/50">
                        <Button variant="outline" size="sm" className="flex-1 gap-1">
                          <Settings className="w-3 h-3" />
                          Configurar
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 gap-1">
                          <Power className="w-3 h-3" />
                          {channel.status === "active" ? "Desativar" : "Ativar"}
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Add Channel Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: filteredChannels.length * 0.05 }}
          className="glass-card rounded-2xl p-5 border-dashed border-2 border-border/50 flex flex-col items-center justify-center min-h-[240px] cursor-pointer hover:border-primary/30 hover:bg-card/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-card/50 flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">Adicionar Canal</p>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Conecte um novo canal de comunicação
          </p>
        </motion.div>
      </div>
    </div>
  )
}
