"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare,
  Bot,
  UserCheck,
  Clock,
  AlertCircle,
  CheckCircle,
  Zap,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Activity {
  id: string
  type: "message" | "ai" | "agent" | "system" | "alert"
  title: string
  description: string
  time: string
  channel?: string
}

const initialActivities: Activity[] = [
  {
    id: "1",
    type: "message",
    title: "Nova mensagem recebida",
    description: "Cliente João Silva enviou mensagem no WhatsApp",
    time: "Agora",
    channel: "WhatsApp",
  },
  {
    id: "2",
    type: "ai",
    title: "IA respondeu automaticamente",
    description: "Ticket #4523 foi respondido pela IA com 95% de confiança",
    time: "1 min",
  },
  {
    id: "3",
    type: "agent",
    title: "Agente assumiu conversa",
    description: "Maria Santos assumiu o ticket #4520",
    time: "3 min",
  },
  {
    id: "4",
    type: "system",
    title: "Automação executada",
    description: "Workflow 'Follow-up' processou 12 mensagens",
    time: "5 min",
  },
  {
    id: "5",
    type: "alert",
    title: "SLA em alerta",
    description: "Ticket #4518 está próximo do prazo limite",
    time: "8 min",
  },
]

const newActivities: Activity[] = [
  {
    id: "new1",
    type: "message",
    title: "Mensagem via Instagram",
    description: "Cliente Ana Costa iniciou conversa",
    time: "Agora",
    channel: "Instagram",
  },
  {
    id: "new2",
    type: "ai",
    title: "Intenção detectada",
    description: "IA identificou pedido de suporte técnico",
    time: "Agora",
  },
]

export function ActivityFeed() {
  const [activities, setActivities] = useState(initialActivities)
  const [newActivityIndex, setNewActivityIndex] = useState(0)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (newActivityIndex < newActivities.length) {
        const newActivity = { ...newActivities[newActivityIndex], id: `${Date.now()}` }
        setActivities(prev => [newActivity, ...prev.slice(0, 4)])
        setNewActivityIndex(prev => prev + 1)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [newActivityIndex])

  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "message":
        return MessageSquare
      case "ai":
        return Bot
      case "agent":
        return UserCheck
      case "system":
        return Zap
      case "alert":
        return AlertCircle
      default:
        return Clock
    }
  }

  const getIconStyle = (type: Activity["type"]) => {
    switch (type) {
      case "message":
        return "bg-primary/20 text-primary"
      case "ai":
        return "bg-accent/20 text-accent"
      case "agent":
        return "bg-chart-3/20 text-chart-3"
      case "system":
        return "bg-chart-4/20 text-chart-4"
      case "alert":
        return "bg-destructive/20 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const channelColors: Record<string, string> = {
    WhatsApp: "bg-green-500/20 text-green-400",
    Instagram: "bg-pink-500/20 text-pink-400",
    Telegram: "bg-blue-500/20 text-blue-400",
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Atividade Recente</h3>
            <p className="text-sm text-muted-foreground">Atualizações em tempo real</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full status-online" />
          <span className="text-xs text-muted-foreground">Ao vivo</span>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {activities.map((activity) => {
            const Icon = getIcon(activity.type)
            return (
              <motion.div
                key={activity.id}
                layout
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group flex items-start gap-4 rounded-xl bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
              >
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
                  getIconStyle(activity.type)
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{activity.title}</p>
                    {activity.channel && (
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        channelColors[activity.channel] || "bg-muted text-muted-foreground"
                      )}>
                        {activity.channel}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{activity.time}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* View All Button */}
      <Button variant="ghost" className="mt-4 w-full text-muted-foreground hover:text-foreground">
        Ver todas as atividades
      </Button>
    </div>
  )
}
