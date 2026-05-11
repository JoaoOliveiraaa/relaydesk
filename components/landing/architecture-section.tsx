"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { 
  Globe, 
  Server, 
  Database, 
  Cloud,
  Zap,
  RefreshCw,
  Webhook,
  Users,
  Radio,
  HardDrive
} from "lucide-react"

const architectureNodes = [
  { id: "client", label: "Client Apps", icon: Globe, x: 50, y: 10, color: "from-blue-500 to-cyan-500" },
  { id: "gateway", label: "API Gateway", icon: Server, x: 50, y: 25, color: "from-violet-500 to-purple-500" },
  { id: "services", label: "NestJS Services", icon: Zap, x: 50, y: 42, color: "from-red-500 to-orange-500" },
  { id: "rabbitmq", label: "RabbitMQ", icon: Radio, x: 50, y: 58, color: "from-orange-500 to-amber-500" },
  { id: "workers", label: "Workers", icon: RefreshCw, x: 50, y: 74, color: "from-green-500 to-emerald-500" },
  { id: "redis", label: "Redis Cache", icon: HardDrive, x: 25, y: 90, color: "from-red-500 to-rose-500" },
  { id: "postgres", label: "PostgreSQL", icon: Database, x: 50, y: 90, color: "from-blue-500 to-indigo-500" },
  { id: "storage", label: "Cloud Storage", icon: Cloud, x: 75, y: 90, color: "from-cyan-500 to-teal-500" },
]

const techCards = [
  { 
    title: "Event Driven", 
    description: "Arquitetura reativa com eventos assincronos",
    icon: Zap 
  },
  { 
    title: "Horizontal Scaling", 
    description: "Escale automaticamente com a demanda",
    icon: RefreshCw 
  },
  { 
    title: "Retry Queues", 
    description: "Filas com retry automatico e DLQ",
    icon: Radio 
  },
  { 
    title: "Webhooks", 
    description: "Integre com qualquer sistema externo",
    icon: Webhook 
  },
  { 
    title: "Multi-Tenant", 
    description: "Isolamento completo entre organizacoes",
    icon: Users 
  },
  { 
    title: "Realtime Sync", 
    description: "WebSockets para atualizacoes instantaneas",
    icon: Globe 
  },
]

export function ArchitectureSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeFlow, setActiveFlow] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const interval = setInterval(() => {
      setActiveFlow((prev) => (prev + 1) % 5)
    }, 1500)
    return () => clearInterval(interval)
  }, [isInView])

  return (
    <section id="architecture" className="relative py-24 lg:py-32">
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20 mb-4">
            <Server className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-muted-foreground">Enterprise Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Arquitetura distribuida de{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              alta performance
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Sistema event-driven com filas, cache distribuido e microservicos 
            projetado para processar milhoes de eventos por dia.
          </p>
        </motion.div>

        {/* Architecture Diagram */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-12 mb-16"
        >
          {/* Animated Grid Background */}
          <div 
            className="absolute inset-0 rounded-3xl opacity-30"
            style={{
              backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />

          <div className="relative h-[500px] lg:h-[600px]">
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
              <defs>
                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              
              {/* Vertical connections */}
              {[
                { from: "10%", to: "22%" },
                { from: "28%", to: "39%" },
                { from: "45%", to: "55%" },
                { from: "61%", to: "71%" },
              ].map((line, i) => (
                <g key={i}>
                  <line
                    x1="50%"
                    y1={line.from}
                    x2="50%"
                    y2={line.to}
                    stroke="url(#flowGradient)"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    className="opacity-30"
                  />
                  {activeFlow >= i && (
                    <motion.circle
                      r="4"
                      fill="#3b82f6"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: activeFlow === i ? [0, 1, 1, 0] : 0,
                        cy: [line.from, line.to].map(v => v),
                      }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                      cx="50%"
                    >
                      <animate
                        attributeName="cy"
                        values={`${parseFloat(line.from)}%;${parseFloat(line.to)}%`}
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </motion.circle>
                  )}
                </g>
              ))}

              {/* Bottom fan-out connections */}
              <line x1="50%" y1="77%" x2="25%" y2="87%" stroke="url(#flowGradient)" strokeWidth="2" strokeDasharray="6 4" className="opacity-30" />
              <line x1="50%" y1="77%" x2="50%" y2="87%" stroke="url(#flowGradient)" strokeWidth="2" strokeDasharray="6 4" className="opacity-30" />
              <line x1="50%" y1="77%" x2="75%" y2="87%" stroke="url(#flowGradient)" strokeWidth="2" strokeDasharray="6 4" className="opacity-30" />
            </svg>

            {/* Nodes */}
            {architectureNodes.map((node, i) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <div className="group relative">
                  {/* Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${node.color} rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity`} />
                  
                  {/* Card */}
                  <div className="relative bg-card/90 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all hover:scale-105">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${node.color} flex items-center justify-center mb-2 mx-auto`}>
                      <node.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-foreground whitespace-nowrap">{node.label}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Animated Pulses */}
            {isInView && (
              <>
                <motion.div
                  className="absolute w-3 h-3 bg-blue-500 rounded-full"
                  style={{ left: "50%", top: "10%" }}
                  animate={{
                    top: ["10%", "25%", "42%", "58%", "74%"],
                    opacity: [1, 1, 1, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute w-3 h-3 bg-violet-500 rounded-full"
                  style={{ left: "50%", top: "10%" }}
                  animate={{
                    top: ["10%", "25%", "42%", "58%", "74%"],
                    opacity: [1, 1, 1, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </>
            )}
          </div>
        </motion.div>

        {/* Tech Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {techCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-blue-500/30 transition-all"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-violet-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center mb-4 group-hover:from-blue-500/30 group-hover:to-violet-500/30 transition-colors">
                  <card.icon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
