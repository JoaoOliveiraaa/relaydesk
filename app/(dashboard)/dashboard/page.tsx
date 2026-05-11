"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Ticket,
  MessageSquare,
  Bot,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Server,
  Database,
  Layers,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MetricCard } from "@/components/dashboard/metric-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { SystemStatus } from "@/components/dashboard/system-status"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral em tempo real do seu atendimento</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Atualizar
          </Button>
          <Button size="sm" className="gap-2">
            <Zap className="h-4 w-4" />
            Nova Automação
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Tickets"
          value={1247}
          change={12.5}
          changeType="positive"
          icon={Ticket}
          description="Últimos 30 dias"
        />
        <MetricCard
          title="Tickets Ativos"
          value={43}
          change={-8.2}
          changeType="negative"
          icon={Activity}
          description="Aguardando resposta"
        />
        <MetricCard
          title="Mensagens/Min"
          value={28}
          change={5.1}
          changeType="positive"
          icon={MessageSquare}
          description="Média em tempo real"
        />
        <MetricCard
          title="Uso de IA"
          value="78%"
          change={15.3}
          changeType="positive"
          icon={Bot}
          description="Respostas automáticas"
        />
      </div>

      {/* Second Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Uptime"
          value="99.98%"
          change={0.02}
          changeType="positive"
          icon={Server}
          description="Últimos 30 dias"
          variant="success"
        />
        <MetricCard
          title="Tempo Médio"
          value="2m 34s"
          change={-12.4}
          changeType="positive"
          icon={Clock}
          description="Primeira resposta"
          variant="accent"
        />
        <MetricCard
          title="Agentes Online"
          value={12}
          change={3}
          changeType="neutral"
          icon={Users}
          description="De 15 disponíveis"
        />
        <MetricCard
          title="Automações"
          value={847}
          change={23.7}
          changeType="positive"
          icon={Workflow}
          description="Executadas hoje"
          variant="primary"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance Chart */}
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>

        {/* System Status */}
        <SystemStatus />
      </div>
    </div>
  )
}

function Workflow(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="8" height="8" x="3" y="3" rx="2" />
      <path d="M7 11v4a2 2 0 0 0 2 2h4" />
      <rect width="8" height="8" x="13" y="13" rx="2" />
    </svg>
  )
}
