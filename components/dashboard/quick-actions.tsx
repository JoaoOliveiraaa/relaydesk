"use client"

import { motion } from "framer-motion"
import {
  Plus,
  MessageSquare,
  Bot,
  Workflow,
  Users,
  Settings,
  ArrowRight,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

const actions = [
  {
    icon: MessageSquare,
    label: "Novo Ticket",
    description: "Criar ticket manualmente",
    href: "/inbox",
    color: "bg-primary/20 text-primary hover:bg-primary/30",
  },
  {
    icon: Bot,
    label: "Treinar IA",
    description: "Melhorar respostas automáticas",
    href: "/settings",
    color: "bg-accent/20 text-accent hover:bg-accent/30",
  },
  {
    icon: Workflow,
    label: "Nova Automação",
    description: "Criar workflow personalizado",
    href: "/automations",
    color: "bg-chart-3/20 text-chart-3 hover:bg-chart-3/30",
  },
  {
    icon: Users,
    label: "Adicionar Agente",
    description: "Convidar membro da equipe",
    href: "/settings",
    color: "bg-chart-4/20 text-chart-4 hover:bg-chart-4/30",
  },
]

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl border border-border bg-card p-6"
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-4/20">
          <Zap className="h-5 w-5 text-chart-4" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Ações Rápidas</h3>
          <p className="text-sm text-muted-foreground">Acesso direto às principais funções</p>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="space-y-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
          >
            <Link
              href={action.href}
              className="group flex items-center gap-4 rounded-xl bg-secondary/30 p-4 transition-all hover:bg-secondary/50"
            >
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                action.color
              )}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{action.label}</p>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Settings Link */}
      <Button
        variant="ghost"
        asChild
        className="mt-4 w-full text-muted-foreground hover:text-foreground"
      >
        <Link href="/settings" className="gap-2">
          <Settings className="h-4 w-4" />
          Configurações avançadas
        </Link>
      </Button>
    </motion.div>
  )
}
