"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  MessageSquare,
  Bot,
  CheckCircle,
  Star,
  ArrowUpRight,
  Download,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ticketsData = [
  { name: "Seg", tickets: 145, resolved: 132, ai: 89 },
  { name: "Ter", tickets: 162, resolved: 148, ai: 102 },
  { name: "Qua", tickets: 178, resolved: 165, ai: 118 },
  { name: "Qui", tickets: 189, resolved: 176, ai: 125 },
  { name: "Sex", tickets: 156, resolved: 149, ai: 108 },
  { name: "Sáb", tickets: 87, resolved: 82, ai: 65 },
  { name: "Dom", tickets: 64, resolved: 61, ai: 48 },
]

const responseTimeData = [
  { hour: "00:00", avg: 45 },
  { hour: "04:00", avg: 38 },
  { hour: "08:00", avg: 125 },
  { hour: "12:00", avg: 156 },
  { hour: "16:00", avg: 189 },
  { hour: "20:00", avg: 78 },
]

const channelData = [
  { name: "WhatsApp", value: 45, color: "#22c55e" },
  { name: "Instagram", value: 25, color: "#ec4899" },
  { name: "Telegram", value: 18, color: "#3b82f6" },
  { name: "Chat", value: 12, color: "#8b5cf6" },
]

const satisfactionData = [
  { month: "Jan", nps: 72 },
  { month: "Fev", nps: 75 },
  { month: "Mar", nps: 78 },
  { month: "Abr", nps: 74 },
  { month: "Mai", nps: 82 },
  { month: "Jun", nps: 85 },
]

const agentPerformance = [
  { name: "Maria Santos", tickets: 234, avgTime: "2m 15s", satisfaction: 4.9, aiAssist: 78 },
  { name: "João Silva", tickets: 198, avgTime: "2m 45s", satisfaction: 4.7, aiAssist: 65 },
  { name: "Ana Costa", tickets: 187, avgTime: "3m 02s", satisfaction: 4.8, aiAssist: 72 },
  { name: "Pedro Lima", tickets: 156, avgTime: "2m 30s", satisfaction: 4.6, aiAssist: 82 },
  { name: "Carla Souza", tickets: 145, avgTime: "2m 58s", satisfaction: 4.5, aiAssist: 68 },
]

const periods = ["Hoje", "7 dias", "30 dias", "90 dias"]

export default function AnalyticsPage() {
  const [activePeriod, setActivePeriod] = useState("7 dias")

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-xl">
          <p className="mb-2 font-medium text-foreground">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}:</span>
                <span className="font-medium text-foreground">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Métricas e insights do seu atendimento</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-lg bg-secondary/50 p-1">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                  activePeriod === period
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {period}
              </button>
            ))}
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-accent">
              <TrendingUp className="h-3 w-3" />
              +12.5%
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-foreground">8,542</p>
          <p className="text-sm text-muted-foreground">Total de Tickets</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-accent">
              <TrendingDown className="h-3 w-3" />
              -18.3%
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-foreground">2m 34s</p>
          <p className="text-sm text-muted-foreground">Tempo Médio Resposta</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-3/20">
              <Bot className="h-5 w-5 text-chart-3" />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-accent">
              <TrendingUp className="h-3 w-3" />
              +8.7%
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-foreground">76.3%</p>
          <p className="text-sm text-muted-foreground">Resolvidos por IA</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-4/20">
              <Star className="h-5 w-5 text-chart-4" />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-accent">
              <TrendingUp className="h-3 w-3" />
              +5.2%
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-foreground">4.8</p>
          <p className="text-sm text-muted-foreground">Satisfação Média</p>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tickets Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-6 lg:col-span-2"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Tickets por Dia</h3>
              <p className="text-sm text-muted-foreground">Comparativo de tickets e resolução</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Tickets
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent" />
                Resolvidos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-chart-3" />
                IA
              </span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tickets" name="Tickets" fill="oklch(0.7 0.18 270)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolvidos" fill="oklch(0.65 0.22 160)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ai" name="IA" fill="oklch(0.6 0.18 200)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Channel Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="mb-6">
            <h3 className="font-semibold text-foreground">Distribuição por Canal</h3>
            <p className="text-sm text-muted-foreground">Tickets por canal de origem</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {channelData.map((channel) => (
              <div key={channel.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: channel.color }} />
                  <span className="text-sm text-muted-foreground">{channel.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{channel.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Response Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="mb-6">
            <h3 className="font-semibold text-foreground">Tempo de Resposta</h3>
            <p className="text-sm text-muted-foreground">Média por hora do dia (em segundos)</p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={responseTimeData}>
                <defs>
                  <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.7 0.18 270)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.7 0.18 270)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="avg"
                  name="Tempo (s)"
                  stroke="oklch(0.7 0.18 270)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTime)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* NPS Evolution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="mb-6">
            <h3 className="font-semibold text-foreground">Evolução do NPS</h3>
            <p className="text-sm text-muted-foreground">Net Promoter Score ao longo do tempo</p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={satisfactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="nps"
                  name="NPS"
                  stroke="oklch(0.65 0.22 160)"
                  strokeWidth={3}
                  dot={{ fill: "oklch(0.65 0.22 160)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Agent Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-border bg-card overflow-hidden"
      >
        <div className="border-b border-border p-6">
          <h3 className="font-semibold text-foreground">Performance dos Agentes</h3>
          <p className="text-sm text-muted-foreground">Ranking de performance da equipe</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Agente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tickets</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tempo Médio</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Satisfação</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assistência IA</th>
              </tr>
            </thead>
            <tbody>
              {agentPerformance.map((agent, index) => (
                <tr key={agent.name} className="border-b border-border transition-colors hover:bg-secondary/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                        {agent.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">#{index + 1} no ranking</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground">{agent.tickets}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-muted-foreground">{agent.avgTime}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-chart-4 text-chart-4" />
                      <span className="font-medium text-foreground">{agent.satisfaction}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${agent.aiAssist}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{agent.aiAssist}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
