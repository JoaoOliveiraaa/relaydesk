"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  ArrowRight, 
  Play,
  MessageSquare,
  Bot,
  Workflow,
  TrendingUp,
  CheckCircle2,
  Activity
} from "lucide-react"

const techBadges = [
  { label: "NestJS", color: "from-red-500/20 to-red-600/20 border-red-500/30" },
  { label: "RabbitMQ", color: "from-orange-500/20 to-orange-600/20 border-orange-500/30" },
  { label: "Redis", color: "from-red-500/20 to-red-600/20 border-red-500/30" },
  { label: "PostgreSQL", color: "from-blue-500/20 to-blue-600/20 border-blue-500/30" },
  { label: "WebSockets", color: "from-green-500/20 to-green-600/20 border-green-500/30" },
  { label: "AI Powered", color: "from-violet-500/20 to-violet-600/20 border-violet-500/30" },
]

const floatingMetrics = [
  { label: "Events/sec", value: "12.4K", trend: "+23%", icon: Activity },
  { label: "Responses", value: "847", trend: "+12%", icon: MessageSquare },
  { label: "Automations", value: "156", trend: "Active", icon: Workflow },
]

const realtimeEvents = [
  { type: "message", channel: "WhatsApp", text: "Nova mensagem recebida", time: "agora" },
  { type: "automation", channel: "Email", text: "Automacao executada", time: "2s" },
  { type: "ai", channel: "Chat", text: "IA respondeu cliente", time: "5s" },
  { type: "webhook", channel: "API", text: "Webhook disparado", time: "8s" },
]

export function HeroSection() {
  const [activeEvent, setActiveEvent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveEvent((prev) => (prev + 1) % realtimeEvents.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20 mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm text-muted-foreground">
                Infraestrutura <span className="font-medium text-foreground">event-driven</span> · multi-tenant
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]"
            >
              <span className="text-balance">Omnichannel enterprise com </span>
              <span className="text-balance text-foreground">filas, realtime</span>
              <span className="text-balance"> e observabilidade de primeira classe</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-lg text-muted-foreground max-w-xl text-pretty"
            >
              Construído como microserviços NestJS com RabbitMQ, Redis, PostgreSQL e OpenTelemetry — do motor de
              webhooks ao primeiro canal real (Telegram), com a mesma seriedade de uptime que esperarias num core
              interno.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link href="/register">
                <Button size="lg" className="h-12 px-6 font-medium shadow-sm">
                  Começar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/developers">
                <Button size="lg" variant="outline" className="h-12 border-border px-6 hover:bg-secondary/80">
                  <Play className="mr-2 h-4 w-4" />
                  Developer portal
                </Button>
              </Link>
            </motion.div>

            {/* Tech Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex flex-wrap gap-2"
            >
              {techBadges.map((badge) => (
                <Badge
                  key={badge.label}
                  variant="outline"
                  className={`bg-gradient-to-r ${badge.color} text-xs font-medium px-3 py-1`}
                >
                  {badge.label}
                </Badge>
              ))}
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-10 flex items-center gap-6"
            >
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 border-2 border-background flex items-center justify-center text-[10px] font-bold text-white"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  500+ empresas
                </div>
                <div className="text-muted-foreground">confiam no RelayDesk</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-blue-500/20 blur-3xl" />
            
            {/* Main Dashboard Card */}
            <div className="relative rounded-2xl border border-border bg-card/90 p-4 shadow-xl backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-400">Live</span>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {floatingMetrics.map((metric, i) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="bg-white/5 rounded-xl p-3 border border-white/5"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <metric.icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{metric.label}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-foreground">{metric.value}</span>
                      <span className="text-xs text-green-400">{metric.trend}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Chart Simulation */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Event Processing</span>
                  <span className="text-xs text-muted-foreground">Last 24h</span>
                </div>
                <div className="flex items-end gap-1 h-20">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 0.8 + i * 0.05, duration: 0.5 }}
                      className="flex-1 bg-gradient-to-t from-blue-500/50 to-violet-500/50 rounded-t"
                    />
                  ))}
                </div>
              </div>

              {/* Realtime Events */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Realtime Activity</span>
                  <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                </div>
                {realtimeEvents.map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.3 }}
                    animate={{ 
                      opacity: activeEvent === i ? 1 : 0.5,
                      scale: activeEvent === i ? 1 : 0.98
                    }}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                      activeEvent === i 
                        ? "bg-blue-500/10 border-blue-500/30" 
                        : "bg-white/5 border-white/5"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      event.type === "message" ? "bg-green-500/20" :
                      event.type === "automation" ? "bg-blue-500/20" :
                      event.type === "ai" ? "bg-violet-500/20" :
                      "bg-orange-500/20"
                    }`}>
                      {event.type === "message" ? <MessageSquare className="w-4 h-4 text-green-400" /> :
                       event.type === "automation" ? <Workflow className="w-4 h-4 text-blue-400" /> :
                       event.type === "ai" ? <Bot className="w-4 h-4 text-violet-400" /> :
                       <Zap className="w-4 h-4 text-orange-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">{event.text}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-white/10">
                          {event.channel}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{event.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-3 -right-3 rounded-lg border border-border bg-card px-3 py-2 shadow-md">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                Throughput estável
              </div>
            </div>

            <div className="absolute -bottom-3 -left-3 rounded-lg border border-border bg-card px-3 py-2 shadow-md">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <Bot className="h-3.5 w-3.5 text-primary" />
                AI pipeline
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
