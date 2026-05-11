"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  FileText,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  MessageCircle,
  Mail,
  Zap,
  Star,
  Clock,
  Users,
  TrendingUp,
  FolderOpen,
  ChevronRight
} from "lucide-react"

interface Template {
  id: string
  name: string
  category: string
  content: string
  channel: "whatsapp" | "email" | "all"
  usageCount: number
  lastUsed: string
  isFavorite: boolean
  variables: string[]
}

const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Boas-vindas Novo Cliente",
    category: "Onboarding",
    content: "Ola {{nome}}! Seja bem-vindo(a) a {{empresa}}. Estamos muito felizes em te-lo(a) conosco. Como posso ajudar?",
    channel: "whatsapp",
    usageCount: 1245,
    lastUsed: "2024-03-15T10:30:00",
    isFavorite: true,
    variables: ["nome", "empresa"]
  },
  {
    id: "2",
    name: "Confirmacao de Pedido",
    category: "Vendas",
    content: "Seu pedido #{{numero_pedido}} foi confirmado! Valor total: R$ {{valor}}. Previsao de entrega: {{data_entrega}}.",
    channel: "all",
    usageCount: 892,
    lastUsed: "2024-03-15T14:20:00",
    isFavorite: true,
    variables: ["numero_pedido", "valor", "data_entrega"]
  },
  {
    id: "3",
    name: "Suporte - Ticket Aberto",
    category: "Suporte",
    content: "Recebemos sua solicitacao, {{nome}}. Seu ticket #{{ticket_id}} foi criado e nossa equipe ja esta trabalhando nisso.",
    channel: "email",
    usageCount: 567,
    lastUsed: "2024-03-14T16:45:00",
    isFavorite: false,
    variables: ["nome", "ticket_id"]
  },
  {
    id: "4",
    name: "Lembrete de Pagamento",
    category: "Financeiro",
    content: "Ola {{nome}}, lembramos que sua fatura no valor de R$ {{valor}} vence em {{data_vencimento}}. Evite juros!",
    channel: "whatsapp",
    usageCount: 432,
    lastUsed: "2024-03-13T09:15:00",
    isFavorite: false,
    variables: ["nome", "valor", "data_vencimento"]
  },
  {
    id: "5",
    name: "Pesquisa de Satisfacao",
    category: "Feedback",
    content: "Ola {{nome}}! Queremos saber como foi sua experiencia conosco. Pode avaliar nosso atendimento de 1 a 5?",
    channel: "whatsapp",
    usageCount: 789,
    lastUsed: "2024-03-15T11:00:00",
    isFavorite: true,
    variables: ["nome"]
  },
  {
    id: "6",
    name: "Promocao Especial",
    category: "Marketing",
    content: "{{nome}}, temos uma oferta exclusiva para voce! {{descricao_promocao}}. Valido ate {{data_fim}}. Aproveite!",
    channel: "all",
    usageCount: 234,
    lastUsed: "2024-03-12T15:30:00",
    isFavorite: false,
    variables: ["nome", "descricao_promocao", "data_fim"]
  }
]

const categories = ["Todos", "Onboarding", "Vendas", "Suporte", "Financeiro", "Feedback", "Marketing"]

const channelConfig = {
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "text-emerald-400" },
  email: { label: "Email", icon: Mail, color: "text-blue-400" },
  all: { label: "Todos", icon: Zap, color: "text-primary" }
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
                         template.content.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === "Todos" || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleFavorite = (id: string) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    ))
  }

  const totalUsage = templates.reduce((acc, t) => acc + t.usageCount, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Templates</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus modelos de mensagem e respostas rapidas
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total de Templates", value: templates.length, icon: FileText, color: "text-primary" },
          { label: "Usos Este Mes", value: totalUsage.toLocaleString(), icon: TrendingUp, color: "text-emerald-400" },
          { label: "Favoritos", value: templates.filter(t => t.isFavorite).length, icon: Star, color: "text-amber-400" },
          { label: "Categorias", value: categories.length - 1, icon: FolderOpen, color: "text-accent" }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-card/50 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Categories */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTemplates.map((template, index) => {
            const channel = channelConfig[template.channel]
            const ChannelIcon = channel.icon
            
            return (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
                className={`glass-card rounded-2xl p-5 cursor-pointer transition-all hover:border-primary/30 ${
                  selectedTemplate === template.id ? "border-primary/50 ring-1 ring-primary/20" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-lg bg-card/50 text-xs font-medium text-muted-foreground">
                      {template.category}
                    </span>
                    <span className={`flex items-center gap-1 ${channel.color}`}>
                      <ChannelIcon className="w-3 h-3" />
                      <span className="text-xs">{channel.label}</span>
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(template.id)
                    }}
                    className="text-muted-foreground hover:text-amber-400 transition-colors"
                  >
                    <Star className={`w-4 h-4 ${template.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                  </button>
                </div>

                <h3 className="font-semibold text-foreground mb-2">{template.name}</h3>
                
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {template.content}
                </p>

                {/* Variables */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.variables.map(variable => (
                    <span
                      key={variable}
                      className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono"
                    >
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {template.usageCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(template.lastUsed).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <button className="p-1 rounded-lg hover:bg-card/50 text-muted-foreground">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Expanded Actions */}
                <AnimatePresence>
                  {selectedTemplate === template.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-2 pt-4 mt-4 border-t border-border/50">
                        <Button variant="outline" size="sm" className="flex-1 gap-1">
                          <Copy className="w-3 h-3" />
                          Copiar
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 gap-1">
                          <Edit className="w-3 h-3" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Add Template Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: filteredTemplates.length * 0.05 }}
          className="glass-card rounded-2xl p-5 border-dashed border-2 border-border/50 flex flex-col items-center justify-center min-h-[280px] cursor-pointer hover:border-primary/30 hover:bg-card/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-card/50 flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">Criar Template</p>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Adicione um novo modelo de mensagem
          </p>
        </motion.div>
      </div>

      {/* Quick Access */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Acesso Rapido</h2>
          <button className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver todos <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {templates.filter(t => t.isFavorite).map(template => (
            <button
              key={template.id}
              className="px-4 py-2 rounded-xl bg-card/50 text-sm text-foreground hover:bg-card transition-colors flex items-center gap-2"
            >
              <Star className="w-3 h-3 text-amber-400" />
              {template.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
