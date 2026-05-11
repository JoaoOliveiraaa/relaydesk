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
  Legend,
} from "recharts"
import { BarChart3, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const generateData = () => {
  const hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"]
  return hours.map((hour) => ({
    time: hour,
    tickets: Math.floor(Math.random() * 50) + 20,
    ai: Math.floor(Math.random() * 40) + 15,
    humans: Math.floor(Math.random() * 30) + 10,
  }))
}

const periods = ["Hoje", "7 dias", "30 dias", "90 dias"]

export function PerformanceChart() {
  const [data, setData] = useState(generateData())
  const [activePeriod, setActivePeriod] = useState("Hoje")

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateData())
    }, 10000)

    return () => clearInterval(interval)
  }, [])

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border bg-card p-6"
    >
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Performance</h3>
            <p className="text-sm text-muted-foreground">Tickets e respostas ao longo do tempo</p>
          </div>
        </div>

        {/* Period Selector */}
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
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-secondary/30 p-4">
          <div className="flex items-center gap-2 text-accent">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">+23%</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">1,847</p>
          <p className="text-xs text-muted-foreground">Total tickets</p>
        </div>
        <div className="rounded-xl bg-secondary/30 p-4">
          <div className="flex items-center gap-2 text-chart-3">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">+15%</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">1,234</p>
          <p className="text-xs text-muted-foreground">IA responses</p>
        </div>
        <div className="rounded-xl bg-secondary/30 p-4">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">+8%</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">613</p>
          <p className="text-xs text-muted-foreground">Human responses</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.7 0.18 270)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.7 0.18 270)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.65 0.22 160)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.65 0.22 160)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorHumans" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.6 0.18 200)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.6 0.18 200)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.3)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="tickets"
              name="Tickets"
              stroke="oklch(0.7 0.18 270)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTickets)"
            />
            <Area
              type="monotone"
              dataKey="ai"
              name="IA"
              stroke="oklch(0.65 0.22 160)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAi)"
            />
            <Area
              type="monotone"
              dataKey="humans"
              name="Humanos"
              stroke="oklch(0.6 0.18 200)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorHumans)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
