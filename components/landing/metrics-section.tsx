"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { 
  Activity, 
  CheckCircle, 
  Zap, 
  Globe,
  MessageSquare,
  TrendingUp
} from "lucide-react"

const metrics = [
  { 
    label: "Events Processed", 
    value: 2300000, 
    suffix: "", 
    prefix: "",
    format: "compact",
    icon: Activity,
    description: "eventos processados por dia"
  },
  { 
    label: "Uptime", 
    value: 99.99, 
    suffix: "%", 
    prefix: "",
    format: "decimal",
    icon: CheckCircle,
    description: "disponibilidade garantida"
  },
  { 
    label: "Avg Latency", 
    value: 43, 
    suffix: "ms", 
    prefix: "",
    format: "number",
    icon: Zap,
    description: "latencia media global"
  },
  { 
    label: "Webhook Deliveries", 
    value: 12000000, 
    suffix: "", 
    prefix: "",
    format: "compact",
    icon: Globe,
    description: "webhooks entregues com sucesso"
  },
  { 
    label: "Active Conversations", 
    value: 84000, 
    suffix: "", 
    prefix: "",
    format: "compact",
    icon: MessageSquare,
    description: "conversas ativas agora"
  },
]

const realtimeActivity = [
  { event: "ticket.created", channel: "WhatsApp", time: "now" },
  { event: "ai.response.sent", channel: "Email", time: "1s ago" },
  { event: "automation.triggered", channel: "Instagram", time: "2s ago" },
  { event: "webhook.delivered", channel: "API", time: "3s ago" },
  { event: "message.processed", channel: "Telegram", time: "4s ago" },
  { event: "queue.job.completed", channel: "Worker", time: "5s ago" },
]

function AnimatedNumber({ value, format }: { value: number; format: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    const duration = 2000
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      
      setDisplayValue(Math.floor(value * eased))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [isInView, value])

  const formatValue = (val: number) => {
    if (format === "compact") {
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
      if (val >= 1000) return `${(val / 1000).toFixed(0)}K`
      return val.toString()
    }
    if (format === "decimal") return val.toFixed(2)
    return val.toLocaleString()
  }

  return <span ref={ref}>{formatValue(displayValue)}</span>
}

export function MetricsSection() {
  const [activeEvents, setActiveEvents] = useState<number[]>([0, 1, 2])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveEvents(prev => {
        const next = prev.map(i => (i + 1) % realtimeActivity.length)
        return next
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="metrics" className="relative py-24 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 mb-4">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-muted-foreground">Live Metrics</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Performance em{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              tempo real
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Infraestrutura global de alta disponibilidade processando milhoes de eventos todos os dias.
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-green-500/30 transition-all text-center"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-3 mx-auto">
                  <metric.icon className="w-5 h-5 text-green-400" />
                </div>
                
                <div className="text-3xl lg:text-4xl font-bold text-foreground mb-1">
                  {metric.prefix}
                  <AnimatedNumber value={metric.value} format={metric.format} />
                  {metric.suffix}
                </div>
                
                <div className="text-xs text-muted-foreground">{metric.description}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Realtime Activity Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Activity Feed</h3>
                <p className="text-sm text-muted-foreground">Eventos sendo processados agora</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-green-400 font-medium">Live</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-3">
            {realtimeActivity.map((activity, i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: activeEvents.includes(i) ? 1 : 0.4,
                  scale: activeEvents.includes(i) ? 1 : 0.98,
                }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  activeEvents.includes(i)
                    ? "bg-blue-500/10 border-blue-500/30"
                    : "bg-white/5 border-white/5"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  activeEvents.includes(i) ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-foreground truncate">{activity.event}</div>
                  <div className="text-xs text-muted-foreground">{activity.channel}</div>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </motion.div>
            ))}
          </div>

          {/* Processing indicator */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Jobs in queue</span>
              <span className="font-mono text-foreground">1,247</span>
            </div>
            <div className="mt-2 h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: ["30%", "60%", "45%", "75%", "50%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
