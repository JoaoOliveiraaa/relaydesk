"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Play,
  Pause,
  Trash2,
  Copy,
  MoreVertical,
  Search,
  Filter,
  Zap,
  MessageSquare,
  Mail,
  Clock,
  GitBranch,
  Bot,
  Webhook,
  Database,
  ArrowRight,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Automation {
  id: string
  name: string
  description: string
  status: "active" | "paused" | "draft"
  trigger: string
  actions: number
  executions: number
  lastRun: string
  successRate: number
}

interface Node {
  id: string
  type: "trigger" | "action" | "condition" | "delay"
  name: string
  icon: React.ElementType
  position: { x: number; y: number }
  config?: Record<string, unknown>
}

const automations: Automation[] = [
  {
    id: "1",
    name: "Boas-vindas WhatsApp",
    description: "Envia mensagem de boas-vindas quando cliente inicia conversa",
    status: "active",
    trigger: "Nova mensagem",
    actions: 4,
    executions: 1234,
    lastRun: "2 min atrás",
    successRate: 98.5,
  },
  {
    id: "2",
    name: "Follow-up Automático",
    description: "Envia lembrete após 24h sem resposta",
    status: "active",
    trigger: "Sem resposta",
    actions: 3,
    executions: 567,
    lastRun: "15 min atrás",
    successRate: 95.2,
  },
  {
    id: "3",
    name: "Escalonamento SLA",
    description: "Alerta supervisores quando SLA está prestes a estourar",
    status: "active",
    trigger: "SLA crítico",
    actions: 5,
    executions: 89,
    lastRun: "1 hora atrás",
    successRate: 100,
  },
  {
    id: "4",
    name: "Classificação por IA",
    description: "Classifica tickets automaticamente usando IA",
    status: "paused",
    trigger: "Novo ticket",
    actions: 6,
    executions: 2341,
    lastRun: "2 dias atrás",
    successRate: 92.1,
  },
  {
    id: "5",
    name: "Pesquisa de Satisfação",
    description: "Envia NPS após fechar ticket",
    status: "draft",
    trigger: "Ticket fechado",
    actions: 2,
    executions: 0,
    lastRun: "Nunca",
    successRate: 0,
  },
]

const nodeTypes = [
  { type: "trigger", name: "Gatilhos", items: [
    { id: "message", name: "Nova Mensagem", icon: MessageSquare },
    { id: "webhook", name: "Webhook", icon: Webhook },
    { id: "schedule", name: "Agendamento", icon: Clock },
  ]},
  { type: "action", name: "Ações", items: [
    { id: "send_message", name: "Enviar Mensagem", icon: MessageSquare },
    { id: "send_email", name: "Enviar Email", icon: Mail },
    { id: "ai_response", name: "Resposta IA", icon: Bot },
    { id: "update_db", name: "Atualizar Banco", icon: Database },
  ]},
  { type: "flow", name: "Controle", items: [
    { id: "condition", name: "Condição", icon: GitBranch },
    { id: "delay", name: "Delay", icon: Clock },
  ]},
]

const sampleNodes: Node[] = [
  { id: "1", type: "trigger", name: "Nova Mensagem WhatsApp", icon: MessageSquare, position: { x: 100, y: 150 } },
  { id: "2", type: "condition", name: "Verificar Horário", icon: GitBranch, position: { x: 350, y: 150 } },
  { id: "3", type: "action", name: "Resposta IA", icon: Bot, position: { x: 600, y: 80 } },
  { id: "4", type: "action", name: "Fila de Espera", icon: Clock, position: { x: 600, y: 220 } },
  { id: "5", type: "action", name: "Enviar Email", icon: Mail, position: { x: 850, y: 150 } },
]

export default function AutomationsPage() {
  const [view, setView] = useState<"list" | "builder">("list")
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null)
  const [nodes, setNodes] = useState<Node[]>(sampleNodes)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const statusColors = {
    active: "bg-accent/20 text-accent",
    paused: "bg-warning/20 text-warning",
    draft: "bg-muted text-muted-foreground",
  }

  const statusIcons = {
    active: CheckCircle,
    paused: Pause,
    draft: AlertCircle,
  }

  const nodeColors = {
    trigger: "bg-primary/20 border-primary/50 text-primary",
    action: "bg-accent/20 border-accent/50 text-accent",
    condition: "bg-warning/20 border-warning/50 text-warning",
    delay: "bg-chart-3/20 border-chart-3/50 text-chart-3",
  }

  if (view === "builder") {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col rounded-2xl border border-border bg-card overflow-hidden">
        {/* Builder Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setView("list")}>
              <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
              Voltar
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h2 className="font-semibold text-foreground">
                {selectedAutomation?.name || "Nova Automação"}
              </h2>
              <p className="text-xs text-muted-foreground">Editor Visual de Workflows</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-1" />
              Testar
            </Button>
            <Button size="sm">
              Publicar
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Node Palette */}
          <div className="w-64 border-r border-border overflow-y-auto p-4">
            <div className="mb-4">
              <Input
                placeholder="Buscar nodes..."
                className="h-9 rounded-lg bg-secondary/50 border-border"
              />
            </div>

            {nodeTypes.map((category) => (
              <div key={category.type} className="mb-6">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {category.name}
                </h3>
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <motion.button
                      key={item.id}
                      whileHover={{ x: 4 }}
                      className="flex w-full items-center gap-3 rounded-xl bg-secondary/30 p-3 text-left transition-colors hover:bg-secondary/50"
                    >
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        category.type === "trigger" && "bg-primary/20 text-primary",
                        category.type === "action" && "bg-accent/20 text-accent",
                        category.type === "flow" && "bg-warning/20 text-warning"
                      )}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Canvas */}
          <div className="relative flex-1 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:24px_24px] overflow-auto">
            {/* Connection Lines */}
            <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
              {/* Line from node 1 to 2 */}
              <path
                d="M 200 175 C 275 175, 275 175, 350 175"
                stroke="rgba(139, 92, 246, 0.5)"
                strokeWidth="2"
                fill="none"
              />
              {/* Line from node 2 to 3 */}
              <path
                d="M 450 150 C 525 150, 525 105, 600 105"
                stroke="rgba(52, 211, 153, 0.5)"
                strokeWidth="2"
                fill="none"
              />
              {/* Line from node 2 to 4 */}
              <path
                d="M 450 175 C 525 175, 525 245, 600 245"
                stroke="rgba(52, 211, 153, 0.5)"
                strokeWidth="2"
                fill="none"
              />
              {/* Line from node 3 to 5 */}
              <path
                d="M 700 105 C 775 105, 775 175, 850 175"
                stroke="rgba(52, 211, 153, 0.5)"
                strokeWidth="2"
                fill="none"
              />
              {/* Line from node 4 to 5 */}
              <path
                d="M 700 245 C 775 245, 775 175, 850 175"
                stroke="rgba(52, 211, 153, 0.5)"
                strokeWidth="2"
                fill="none"
              />
            </svg>

            {/* Nodes */}
            {nodes.map((node) => (
              <motion.div
                key={node.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedNode(node)}
                className={cn(
                  "absolute cursor-pointer rounded-2xl border-2 bg-card p-4 shadow-lg transition-all",
                  nodeColors[node.type],
                  selectedNode?.id === node.id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
                style={{ left: node.position.x, top: node.position.y }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    nodeColors[node.type]
                  )}>
                    <node.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{node.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{node.type}</p>
                  </div>
                </div>
                
                {/* Connection dots */}
                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="h-3 w-3 rounded-full bg-primary border-2 border-background" />
                </div>
                <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
                  <div className="h-3 w-3 rounded-full bg-accent border-2 border-background" />
                </div>
              </motion.div>
            ))}

            {/* Add Node Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
            >
              <Plus className="h-6 w-6" />
            </motion.button>
          </div>

          {/* Node Properties Panel */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="w-80 border-l border-border overflow-y-auto"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Propriedades</h3>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedNode(null)}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Nome</label>
                      <Input
                        value={selectedNode.name}
                        className="mt-1 bg-secondary/50 border-border"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">Tipo</label>
                      <div className={cn(
                        "mt-1 flex items-center gap-2 rounded-lg p-2",
                        nodeColors[selectedNode.type]
                      )}>
                        <selectedNode.icon className="h-4 w-4" />
                        <span className="text-sm capitalize">{selectedNode.type}</span>
                      </div>
                    </div>

                    {selectedNode.type === "trigger" && (
                      <div>
                        <label className="text-sm font-medium text-foreground">Canal</label>
                        <select className="mt-1 w-full rounded-lg bg-secondary/50 border border-border p-2 text-sm text-foreground">
                          <option>WhatsApp</option>
                          <option>Instagram</option>
                          <option>Telegram</option>
                          <option>Chat</option>
                        </select>
                      </div>
                    )}

                    {selectedNode.type === "condition" && (
                      <div>
                        <label className="text-sm font-medium text-foreground">Condição</label>
                        <select className="mt-1 w-full rounded-lg bg-secondary/50 border border-border p-2 text-sm text-foreground">
                          <option>Horário comercial</option>
                          <option>Cliente VIP</option>
                          <option>Primeiro contato</option>
                          <option>Tag específica</option>
                        </select>
                      </div>
                    )}

                    {selectedNode.type === "action" && selectedNode.name.includes("IA") && (
                      <div>
                        <label className="text-sm font-medium text-foreground">Modelo IA</label>
                        <select className="mt-1 w-full rounded-lg bg-secondary/50 border border-border p-2 text-sm text-foreground">
                          <option>GPT-4</option>
                          <option>GPT-3.5</option>
                          <option>Claude</option>
                        </select>
                      </div>
                    )}

                    <div className="pt-4 border-t border-border">
                      <Button variant="destructive" size="sm" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover Node
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Automações</h1>
          <p className="text-muted-foreground">Crie e gerencie workflows automatizados</p>
        </div>
        <Button onClick={() => { setSelectedAutomation(null); setView("builder"); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Automação
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-sm text-muted-foreground">Automações Ativas</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
              <Play className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">4,231</p>
              <p className="text-sm text-muted-foreground">Execuções Hoje</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-3/20">
              <CheckCircle className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">97.8%</p>
              <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-4/20">
              <Clock className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">2.3s</p>
              <p className="text-sm text-muted-foreground">Tempo Médio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar automações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-xl bg-secondary/50 pl-9 border-border"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {automations.map((automation, index) => {
          const StatusIcon = statusIcons[automation.status]
          return (
            <motion.div
              key={automation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    automation.status === "active" && "bg-accent/20",
                    automation.status === "paused" && "bg-warning/20",
                    automation.status === "draft" && "bg-muted"
                  )}>
                    <Zap className={cn(
                      "h-6 w-6",
                      automation.status === "active" && "text-accent",
                      automation.status === "paused" && "text-warning",
                      automation.status === "draft" && "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{automation.name}</h3>
                      <span className={cn(
                        "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                        statusColors[automation.status]
                      )}>
                        <StatusIcon className="h-3 w-3" />
                        {automation.status === "active" ? "Ativo" : automation.status === "paused" ? "Pausado" : "Rascunho"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{automation.description}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {automation.trigger}
                      </span>
                      <span>{automation.actions} ações</span>
                      <span>{automation.executions.toLocaleString()} execuções</span>
                      <span>Última: {automation.lastRun}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {automation.status !== "draft" && (
                    <div className="text-right mr-4">
                      <p className="text-lg font-bold text-foreground">{automation.successRate}%</p>
                      <p className="text-xs text-muted-foreground">Sucesso</p>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setSelectedAutomation(automation); setView("builder"); }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    {automation.status === "active" ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Progress bar */}
              {automation.status === "active" && (
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${automation.successRate}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full bg-accent"
                  />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
