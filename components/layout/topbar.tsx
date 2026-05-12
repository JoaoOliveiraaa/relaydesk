"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Bell,
  Command,
  MessageSquare,
  Wifi,
  WifiOff,
  Database,
  Server,
  Activity,
  X,
  Check,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const notifications = [
  {
    id: 1,
    type: "success",
    title: "Novo ticket atribuído",
    message: "Ticket #4521 foi atribuído a você",
    time: "2 min atrás",
    read: false,
  },
  {
    id: 2,
    type: "warning",
    title: "SLA em alerta",
    message: "3 tickets estão próximos do prazo",
    time: "15 min atrás",
    read: false,
  },
  {
    id: 3,
    type: "info",
    title: "Automação executada",
    message: "Workflow 'Boas-vindas' processou 45 mensagens",
    time: "1 hora atrás",
    read: true,
  },
]

const systemStatus = [
  { name: "API Gateway", status: "online", latency: "12ms" },
  { name: "RabbitMQ", status: "online", latency: "3ms" },
  { name: "Redis", status: "online", latency: "1ms" },
  { name: "PostgreSQL", status: "online", latency: "8ms" },
]

export function Topbar() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showStatus, setShowStatus] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Simulate connection changes (deterministic so SSR/CSR match)
  useEffect(() => {
    let tick = 0
    const interval = setInterval(() => {
      tick += 1
      setIsConnected(tick % 45 !== 0)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
      {/* Left Section - Search */}
      <div className="flex items-center gap-4">
        <button className="group flex h-10 w-80 items-center gap-3 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-muted-foreground transition-all hover:border-primary/50 hover:bg-secondary">
          <Search className="h-4 w-4" />
          <span>Buscar tickets, contatos, automações...</span>
          <kbd className="ml-auto flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Live Time */}
        <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono text-xs text-muted-foreground">
            {mounted && currentTime ? currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
          </span>
        </div>

        {/* System Status Indicator */}
        <div className="relative">
          <button
            onClick={() => setShowStatus(!showStatus)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all",
              isConnected ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
            )}
          >
            {isConnected ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
            <span className="text-xs font-medium">
              {isConnected ? "Conectado" : "Desconectado"}
            </span>
            <span className={cn(
              "h-2 w-2 rounded-full",
              isConnected ? "status-online" : "status-offline"
            )} />
          </button>

          {/* Status Dropdown */}
          <AnimatePresence>
            {showStatus && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-border bg-card p-4 shadow-xl"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Status do Sistema</h3>
                  <span className="flex items-center gap-1.5 text-xs text-accent">
                    <span className="h-1.5 w-1.5 rounded-full status-online" />
                    Operacional
                  </span>
                </div>
                <div className="space-y-2">
                  {systemStatus.map((system) => (
                    <div
                      key={system.name}
                      className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        {system.name === "RabbitMQ" && <MessageSquare className="h-4 w-4 text-muted-foreground" />}
                        {system.name === "Redis" && <Database className="h-4 w-4 text-muted-foreground" />}
                        {system.name === "PostgreSQL" && <Database className="h-4 w-4 text-muted-foreground" />}
                        {system.name === "API Gateway" && <Server className="h-4 w-4 text-muted-foreground" />}
                        <span className="text-sm text-foreground">{system.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{system.latency}</span>
                        <span className="h-2 w-2 rounded-full status-online" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </Button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground">Notificações</h3>
                  <button className="text-xs text-primary hover:underline">
                    Marcar todas como lidas
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex gap-3 border-b border-border p-4 transition-colors hover:bg-secondary/50",
                        !notification.read && "bg-primary/5"
                      )}
                    >
                      <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        notification.type === "success" && "bg-accent/20 text-accent",
                        notification.type === "warning" && "bg-warning/20 text-warning",
                        notification.type === "info" && "bg-primary/20 text-primary"
                      )}>
                        {notification.type === "success" && <Check className="h-4 w-4" />}
                        {notification.type === "warning" && <AlertTriangle className="h-4 w-4" />}
                        {notification.type === "info" && <Activity className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-3">
                  <Button variant="ghost" className="w-full text-sm">
                    Ver todas as notificações
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
