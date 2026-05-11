"use client"

import { motion } from "framer-motion"
import { 
  Bot,
  Inbox,
  Workflow,
  BarChart3,
  Radio,
  Webhook,
  Clock,
  Users,
  Sparkles,
  Cloud,
  Building2,
  Shield
} from "lucide-react"

const features = [
  {
    title: "AI Responses",
    description: "Respostas inteligentes geradas por IA com contexto do cliente",
    icon: Bot,
    gradient: "from-violet-500 to-purple-600"
  },
  {
    title: "Omnichannel Inbox",
    description: "Todos os canais em uma unica caixa de entrada unificada",
    icon: Inbox,
    gradient: "from-blue-500 to-cyan-600"
  },
  {
    title: "Automation Builder",
    description: "Construa fluxos visuais de automacao sem codigo",
    icon: Workflow,
    gradient: "from-orange-500 to-amber-600"
  },
  {
    title: "Realtime Analytics",
    description: "Dashboards em tempo real com metricas acionaveis",
    icon: BarChart3,
    gradient: "from-green-500 to-emerald-600"
  },
  {
    title: "Queue Processing",
    description: "Filas distribuidas com retry automatico e DLQ",
    icon: Radio,
    gradient: "from-red-500 to-rose-600"
  },
  {
    title: "Webhooks",
    description: "Integre com sistemas externos via webhooks HTTP",
    icon: Webhook,
    gradient: "from-indigo-500 to-blue-600"
  },
  {
    title: "SLA Tracking",
    description: "Monitore e garanta acordos de nivel de servico",
    icon: Clock,
    gradient: "from-pink-500 to-rose-600"
  },
  {
    title: "Team Collaboration",
    description: "Colaboracao em tempo real entre agentes",
    icon: Users,
    gradient: "from-teal-500 to-cyan-600"
  },
  {
    title: "AI Agents",
    description: "Agentes autonomos para tarefas repetitivas",
    icon: Sparkles,
    gradient: "from-fuchsia-500 to-purple-600"
  },
  {
    title: "Cloud Storage",
    description: "Armazenamento seguro de arquivos e midias",
    icon: Cloud,
    gradient: "from-sky-500 to-blue-600"
  },
  {
    title: "Multi-Tenant",
    description: "Arquitetura multi-tenant com isolamento total",
    icon: Building2,
    gradient: "from-amber-500 to-orange-600"
  },
  {
    title: "Role Permissions",
    description: "Controle granular de acesso baseado em papeis",
    icon: Shield,
    gradient: "from-emerald-500 to-green-600"
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20 mb-4">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-muted-foreground">Powerful Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Tudo que voce precisa para{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              escalar seu atendimento
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Funcionalidades enterprise-grade para empresas que precisam 
            de performance, confiabilidade e escalabilidade.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative"
            >
              <div className="relative h-full bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300 overflow-hidden">
                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>

                {/* Decorative corner */}
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-300`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
