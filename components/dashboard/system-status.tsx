"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Server,
  Database,
  MessageSquare,
  Layers,
  HardDrive,
  Cpu,
  Activity,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SystemService {
  name: string
  icon: React.ElementType
  status: "online" | "degraded" | "offline"
  latency: string
  cpu: number
  memory: number
}

const initialServices: SystemService[] = [
  { name: "API Gateway", icon: Server, status: "online", latency: "12ms", cpu: 23, memory: 45 },
  { name: "RabbitMQ", icon: MessageSquare, status: "online", latency: "3ms", cpu: 15, memory: 32 },
  { name: "Redis", icon: Database, status: "online", latency: "1ms", cpu: 8, memory: 28 },
  { name: "PostgreSQL", icon: Database, status: "online", latency: "8ms", cpu: 34, memory: 56 },
  { name: "Workers", icon: Layers, status: "online", latency: "5ms", cpu: 42, memory: 61 },
  { name: "Storage", icon: HardDrive, status: "online", latency: "15ms", cpu: 12, memory: 38 },
]

export function SystemStatus() {
  const [services, setServices] = useState(initialServices)
  const [overallHealth, setOverallHealth] = useState(100)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setServices(prev => prev.map(service => ({
        ...service,
        latency: `${Math.floor(Math.random() * 20) + 1}ms`,
        cpu: Math.floor(Math.random() * 50) + 10,
        memory: Math.floor(Math.random() * 40) + 20,
      })))
      setOverallHealth(Math.floor(Math.random() * 3) + 98)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: SystemService["status"]) => {
    switch (status) {
      case "online":
        return "status-online"
      case "degraded":
        return "status-busy"
      case "offline":
        return "status-offline"
    }
  }

  const getStatusText = (status: SystemService["status"]) => {
    switch (status) {
      case "online":
        return "Online"
      case "degraded":
        return "Degradado"
      case "offline":
        return "Offline"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl border border-border bg-card p-6"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
            <Cpu className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Status do Sistema</h3>
            <p className="text-sm text-muted-foreground">Monitoramento em tempo real</p>
          </div>
        </div>
      </div>

      {/* Overall Health */}
      <div className="mb-6 rounded-xl bg-accent/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-accent" />
            <span className="font-medium text-foreground">Saúde Geral</span>
          </div>
          <span className="text-2xl font-bold text-accent">{overallHealth}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallHealth}%` }}
            transition={{ duration: 1 }}
            className="h-full rounded-full bg-accent"
          />
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {services.map((service, index) => (
          <motion.div
            key={service.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group flex items-center justify-between rounded-xl bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/20 group-hover:text-primary">
                <service.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{service.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{service.latency}</span>
                  <span>•</span>
                  <span>CPU {service.cpu}%</span>
                  <span>•</span>
                  <span>MEM {service.memory}%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", getStatusColor(service.status))} />
              <span className="text-xs text-muted-foreground">{getStatusText(service.status)}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Last Updated */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Activity className="h-3 w-3" />
        <span>Atualizado em tempo real</span>
      </div>
    </motion.div>
  )
}
