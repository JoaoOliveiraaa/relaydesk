"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: number | string
  change: number
  changeType: "positive" | "negative" | "neutral"
  icon: LucideIcon
  description: string
  variant?: "default" | "primary" | "success" | "accent"
}

export function MetricCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description,
  variant = "default",
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = typeof value === "number" ? value : parseFloat(value) || 0

  useEffect(() => {
    if (typeof value === "number") {
      const duration = 1500
      const steps = 60
      const increment = numericValue / steps
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= numericValue) {
          setDisplayValue(numericValue)
          clearInterval(timer)
        } else {
          setDisplayValue(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [numericValue, value])

  const variantStyles = {
    default: "bg-card border-border",
    primary: "bg-primary/5 border-primary/20",
    success: "bg-accent/5 border-accent/20",
    accent: "bg-chart-3/5 border-chart-3/20",
  }

  const iconVariantStyles = {
    default: "bg-secondary text-muted-foreground",
    primary: "bg-primary/20 text-primary",
    success: "bg-accent/20 text-accent",
    accent: "bg-chart-3/20 text-chart-3",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        variantStyles[variant]
      )}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            iconVariantStyles[variant]
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <div className={cn(
            "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
            changeType === "positive" && "bg-accent/10 text-accent",
            changeType === "negative" && "bg-destructive/10 text-destructive",
            changeType === "neutral" && "bg-muted text-muted-foreground"
          )}>
            {changeType === "positive" && <TrendingUp className="h-3 w-3" />}
            {changeType === "negative" && <TrendingDown className="h-3 w-3" />}
            {changeType === "neutral" && <Minus className="h-3 w-3" />}
            <span>{changeType === "negative" ? "" : "+"}{change}%</span>
          </div>
        </div>

        {/* Value */}
        <div className="mt-4">
          <h3 className="text-3xl font-bold tracking-tight text-foreground">
            {typeof value === "number" ? displayValue.toLocaleString() : value}
          </h3>
          <p className="mt-1 text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        {/* Animated bar */}
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.abs(change) * 3, 100)}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className={cn(
              "h-full rounded-full",
              changeType === "positive" && "bg-accent",
              changeType === "negative" && "bg-destructive",
              changeType === "neutral" && "bg-muted-foreground"
            )}
          />
        </div>
      </div>
    </motion.div>
  )
}
