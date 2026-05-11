"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  MoreVertical,
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Crown,
  Clock,
  MessageCircle,
  CheckCircle2,
  XCircle,
  UserPlus,
  Users,
  Activity,
  TrendingUp,
  Settings
} from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "agent" | "viewer"
  status: "online" | "offline" | "busy"
  avatar?: string
  department: string
  messagesHandled: number
  avgResponseTime: string
  satisfaction: number
  joinedAt: string
}

const mockTeam: TeamMember[] = [
  {
    id: "1",
    name: "Carlos Mendes",
    email: "carlos@relaydesk.com",
    role: "owner",
    status: "online",
    department: "Administracao",
    messagesHandled: 0,
    avgResponseTime: "-",
    satisfaction: 0,
    joinedAt: "2023-06-01"
  },
  {
    id: "2",
    name: "Ana Paula Silva",
    email: "ana.silva@relaydesk.com",
    role: "admin",
    status: "online",
    department: "Suporte",
    messagesHandled: 1245,
    avgResponseTime: "2m 15s",
    satisfaction: 98,
    joinedAt: "2023-08-15"
  },
  {
    id: "3",
    name: "Roberto Costa",
    email: "roberto.costa@relaydesk.com",
    role: "agent",
    status: "busy",
    department: "Vendas",
    messagesHandled: 892,
    avgResponseTime: "3m 42s",
    satisfaction: 95,
    joinedAt: "2023-10-20"
  },
  {
    id: "4",
    name: "Mariana Ferreira",
    email: "mariana.f@relaydesk.com",
    role: "agent",
    status: "online",
    department: "Suporte",
    messagesHandled: 756,
    avgResponseTime: "1m 58s",
    satisfaction: 97,
    joinedAt: "2023-11-05"
  },
  {
    id: "5",
    name: "Lucas Oliveira",
    email: "lucas.o@relaydesk.com",
    role: "agent",
    status: "offline",
    department: "Vendas",
    messagesHandled: 534,
    avgResponseTime: "4m 12s",
    satisfaction: 92,
    joinedAt: "2024-01-10"
  },
  {
    id: "6",
    name: "Patricia Santos",
    email: "patricia.s@relaydesk.com",
    role: "viewer",
    status: "offline",
    department: "Marketing",
    messagesHandled: 0,
    avgResponseTime: "-",
    satisfaction: 0,
    joinedAt: "2024-02-01"
  }
]

const roleConfig = {
  owner: { label: "Proprietario", icon: Crown, color: "text-amber-400", bg: "bg-amber-500/20" },
  admin: { label: "Administrador", icon: ShieldCheck, color: "text-purple-400", bg: "bg-purple-500/20" },
  agent: { label: "Agente", icon: Shield, color: "text-primary", bg: "bg-primary/20" },
  viewer: { label: "Visualizador", icon: ShieldAlert, color: "text-muted-foreground", bg: "bg-muted" }
}

const statusConfig = {
  online: { label: "Online", color: "bg-emerald-500" },
  offline: { label: "Offline", color: "bg-muted-foreground" },
  busy: { label: "Ocupado", color: "bg-amber-500" }
}

export default function TeamPage() {
  const [team] = useState<TeamMember[]>(mockTeam)
  const [search, setSearch] = useState("")
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  const filteredTeam = team.filter(member =>
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.email.toLowerCase().includes(search.toLowerCase()) ||
    member.department.toLowerCase().includes(search.toLowerCase())
  )

  const onlineCount = team.filter(m => m.status === "online").length
  const totalMessages = team.reduce((acc, m) => acc + m.messagesHandled, 0)

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Equipe</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os membros da sua equipe e permissoes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Permissoes
          </Button>
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" />
            Convidar Membro
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total de Membros", value: team.length, icon: Users, color: "text-primary" },
          { label: "Online Agora", value: onlineCount, icon: Activity, color: "text-emerald-400" },
          { label: "Mensagens Hoje", value: totalMessages.toLocaleString(), icon: MessageCircle, color: "text-accent" },
          { label: "Satisfacao Media", value: "96%", icon: TrendingUp, color: "text-amber-400" }
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
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
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
          placeholder="Buscar membros..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTeam.map((member, index) => {
            const role = roleConfig[member.role]
            const status = statusConfig[member.status]
            const RoleIcon = role.icon
            
            return (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                className={`glass-card rounded-2xl p-5 cursor-pointer transition-all hover:border-primary/30 ${
                  selectedMember === member.id ? "border-primary/50 ring-1 ring-primary/20" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center text-lg font-semibold text-foreground">
                      {getInitials(member.name)}
                    </div>
                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${status.color} border-2 border-background`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{member.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${role.bg} ${role.color} flex items-center gap-1`}>
                        <RoleIcon className="w-3 h-3" />
                        {role.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{member.department}</p>
                  </div>
                  <button className="p-1 rounded-lg hover:bg-card/50 text-muted-foreground">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {member.role !== "owner" && member.role !== "viewer" && (
                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">{member.messagesHandled}</p>
                      <p className="text-xs text-muted-foreground">Mensagens</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">{member.avgResponseTime}</p>
                      <p className="text-xs text-muted-foreground">Tempo Medio</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-emerald-400">{member.satisfaction}%</p>
                      <p className="text-xs text-muted-foreground">Satisfacao</p>
                    </div>
                  </div>
                )}

                {/* Expanded Actions */}
                <AnimatePresence>
                  {selectedMember === member.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-2 pt-4 mt-4 border-t border-border/50">
                        <Button variant="outline" size="sm" className="flex-1 gap-1">
                          <MessageCircle className="w-3 h-3" />
                          Mensagem
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 gap-1">
                          <Settings className="w-3 h-3" />
                          Editar
                        </Button>
                        {member.role !== "owner" && (
                          <Button variant="outline" size="sm" className="text-red-400 hover:text-red-300">
                            <XCircle className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Invite Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: filteredTeam.length * 0.05 }}
          className="glass-card rounded-2xl p-5 border-dashed border-2 border-border/50 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:border-primary/30 hover:bg-card/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-card/50 flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">Convidar Membro</p>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Adicione um novo membro a equipe
          </p>
        </motion.div>
      </div>

      {/* Activity Feed */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="font-semibold text-foreground mb-4">Atividade Recente</h2>
        <div className="space-y-3">
          {[
            { action: "Ana Paula resolveu 15 tickets", time: "ha 5 minutos", icon: CheckCircle2, color: "text-emerald-400" },
            { action: "Roberto Costa esta atendendo 3 clientes", time: "ha 12 minutos", icon: MessageCircle, color: "text-primary" },
            { action: "Mariana Ferreira entrou online", time: "ha 30 minutos", icon: Activity, color: "text-accent" },
            { action: "Lucas Oliveira saiu para intervalo", time: "ha 1 hora", icon: Clock, color: "text-amber-400" }
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-card/30"
            >
              <div className={`w-8 h-8 rounded-lg bg-card/50 flex items-center justify-center ${activity.color}`}>
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
