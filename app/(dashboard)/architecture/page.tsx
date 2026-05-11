"use client"

import { motion } from "framer-motion"
import {
  Server,
  Database,
  MessageSquare,
  Cloud,
  Layers,
  Webhook,
  HardDrive,
  Cpu,
  Network,
  Shield,
  Zap,
  ArrowRight,
  ArrowDown,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const architectureComponents = [
  {
    id: "gateway",
    name: "API Gateway",
    description: "Load balancing, rate limiting, authentication",
    icon: Network,
    status: "online",
    metrics: { requests: "12.5k/min", latency: "12ms", uptime: "99.99%" },
    color: "bg-primary/20 text-primary border-primary/30",
  },
  {
    id: "nestjs",
    name: "NestJS Services",
    description: "Core business logic, REST/GraphQL APIs",
    icon: Server,
    status: "online",
    metrics: { instances: "8", cpu: "23%", memory: "2.4GB" },
    color: "bg-destructive/20 text-destructive border-destructive/30",
  },
  {
    id: "rabbitmq",
    name: "RabbitMQ",
    description: "Message broker, async processing",
    icon: MessageSquare,
    status: "online",
    metrics: { queues: "24", messages: "1.2M", consumers: "16" },
    color: "bg-warning/20 text-warning border-warning/30",
  },
  {
    id: "redis",
    name: "Redis Cluster",
    description: "Caching, sessions, real-time data",
    icon: Database,
    status: "online",
    metrics: { nodes: "6", memory: "8GB", hitRate: "94%" },
    color: "bg-destructive/20 text-destructive border-destructive/30",
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    description: "Primary database, ACID compliance",
    icon: Database,
    status: "online",
    metrics: { connections: "120", size: "45GB", queries: "2.3k/s" },
    color: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  },
  {
    id: "workers",
    name: "Background Workers",
    description: "Async jobs, scheduled tasks, AI processing",
    icon: Cpu,
    status: "online",
    metrics: { workers: "12", jobs: "3.4k/h", queue: "234" },
    color: "bg-accent/20 text-accent border-accent/30",
  },
  {
    id: "webhooks",
    name: "Webhook Service",
    description: "Event delivery, retries, logging",
    icon: Webhook,
    status: "online",
    metrics: { endpoints: "847", delivery: "99.8%", avgLatency: "98ms" },
    color: "bg-primary/20 text-primary border-primary/30",
  },
  {
    id: "storage",
    name: "Cloud Storage",
    description: "Files, attachments, media assets",
    icon: Cloud,
    status: "online",
    metrics: { objects: "2.4M", size: "1.2TB", bandwidth: "450GB/d" },
    color: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  },
]

const connections = [
  { from: "gateway", to: "nestjs" },
  { from: "nestjs", to: "rabbitmq" },
  { from: "nestjs", to: "redis" },
  { from: "nestjs", to: "postgres" },
  { from: "rabbitmq", to: "workers" },
  { from: "workers", to: "webhooks" },
  { from: "workers", to: "storage" },
]

export default function ArchitecturePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Arquitetura do Sistema</h1>
        <p className="text-muted-foreground">Visão técnica da infraestrutura do RelayDesk</p>
      </div>

      {/* System Health Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-accent/30 bg-accent/5 p-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
              <CheckCircle className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status Geral</p>
              <p className="text-xl font-bold text-accent">Operacional</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Serviços Ativos</p>
              <p className="text-xl font-bold text-foreground">24/24</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-3/20">
              <Zap className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Latência Média</p>
              <p className="text-xl font-bold text-foreground">12ms</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-4/20">
              <Shield className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="text-xl font-bold text-foreground">99.99%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Architecture Diagram */}
      <div className="rounded-2xl border border-border bg-card p-8">
        <h2 className="mb-6 text-lg font-semibold text-foreground">Diagrama de Arquitetura</h2>
        
        <div className="relative">
          {/* Visual Architecture Flow */}
          <div className="grid gap-8">
            {/* Row 1 - Entry Point */}
            <div className="flex justify-center">
              <ArchitectureNode component={architectureComponents[0]} />
            </div>

            <div className="flex justify-center">
              <ArrowDown className="h-8 w-8 text-muted-foreground" />
            </div>

            {/* Row 2 - Core Services */}
            <div className="flex justify-center">
              <ArchitectureNode component={architectureComponents[1]} />
            </div>

            <div className="flex justify-center gap-8">
              <ArrowDown className="h-8 w-8 text-muted-foreground -rotate-45" />
              <ArrowDown className="h-8 w-8 text-muted-foreground" />
              <ArrowDown className="h-8 w-8 text-muted-foreground rotate-45" />
            </div>

            {/* Row 3 - Data Layer */}
            <div className="flex justify-center gap-6">
              <ArchitectureNode component={architectureComponents[2]} />
              <ArchitectureNode component={architectureComponents[3]} />
              <ArchitectureNode component={architectureComponents[4]} />
            </div>

            <div className="flex justify-center">
              <ArrowDown className="h-8 w-8 text-muted-foreground" />
            </div>

            {/* Row 4 - Workers */}
            <div className="flex justify-center">
              <ArchitectureNode component={architectureComponents[5]} />
            </div>

            <div className="flex justify-center gap-8">
              <ArrowDown className="h-8 w-8 text-muted-foreground -rotate-45" />
              <ArrowDown className="h-8 w-8 text-muted-foreground rotate-45" />
            </div>

            {/* Row 5 - External Services */}
            <div className="flex justify-center gap-6">
              <ArchitectureNode component={architectureComponents[6]} />
              <ArchitectureNode component={architectureComponents[7]} />
            </div>
          </div>
        </div>
      </div>

      {/* Component Details */}
      <div className="grid gap-4 md:grid-cols-2">
        {architectureComponents.map((component, index) => (
          <motion.div
            key={component.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "rounded-2xl border p-5 transition-all hover:shadow-lg",
              component.color
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  component.color
                )}>
                  <component.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{component.name}</h3>
                    <span className="flex h-2 w-2 rounded-full status-online" />
                  </div>
                  <p className="text-sm text-muted-foreground">{component.description}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {Object.entries(component.metrics).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-background/50 p-2 text-center">
                  <p className="font-mono text-sm font-medium text-foreground">{value}</p>
                  <p className="text-xs capitalize text-muted-foreground">{key}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tech Stack */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-6 text-lg font-semibold text-foreground">Stack Tecnológica</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <TechCategory
            title="Backend"
            items={["NestJS", "TypeScript", "GraphQL", "REST APIs", "Prisma ORM"]}
          />
          <TechCategory
            title="Mensageria"
            items={["RabbitMQ", "Redis Pub/Sub", "WebSockets", "Server-Sent Events"]}
          />
          <TechCategory
            title="Banco de Dados"
            items={["PostgreSQL", "Redis", "Elasticsearch", "TimescaleDB"]}
          />
          <TechCategory
            title="Infraestrutura"
            items={["Kubernetes", "Docker", "AWS", "Terraform", "GitHub Actions"]}
          />
        </div>
      </div>

      {/* Security Features */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-6 text-lg font-semibold text-foreground">Segurança</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <SecurityFeature
            title="Criptografia"
            description="TLS 1.3 em todas as conexões, AES-256 para dados em repouso"
            icon={Shield}
          />
          <SecurityFeature
            title="Autenticação"
            description="JWT com rotação automática, MFA obrigatório, SSO/SAML"
            icon={Shield}
          />
          <SecurityFeature
            title="Compliance"
            description="SOC 2 Type II, GDPR, LGPD, ISO 27001"
            icon={Shield}
          />
        </div>
      </div>
    </div>
  )
}

function ArchitectureNode({ component }: { component: typeof architectureComponents[0] }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "flex items-center gap-3 rounded-2xl border-2 bg-card p-4 shadow-lg transition-all",
        component.color
      )}
    >
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl",
        component.color
      )}>
        <component.icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-medium text-foreground">{component.name}</p>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full status-online" />
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>
    </motion.div>
  )
}

function TechCategory({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl bg-secondary/30 p-4">
      <h3 className="mb-3 font-medium text-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-lg bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function SecurityFeature({ title, description, icon: Icon }: { title: string; description: string; icon: typeof Shield }) {
  return (
    <div className="flex items-start gap-4 rounded-xl bg-secondary/30 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
