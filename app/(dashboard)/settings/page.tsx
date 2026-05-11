"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Building2,
  Users,
  Shield,
  Key,
  CreditCard,
  Puzzle,
  Palette,
  Bell,
  Globe,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Check,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "company", label: "Empresa", icon: Building2 },
  { id: "members", label: "Membros", icon: Users },
  { id: "permissions", label: "Permissões", icon: Shield },
  { id: "api", label: "API Keys", icon: Key },
  { id: "billing", label: "Faturamento", icon: CreditCard },
  { id: "integrations", label: "Integrações", icon: Puzzle },
  { id: "theme", label: "Tema", icon: Palette },
]

const teamMembers = [
  { name: "João da Silva", email: "joao@empresa.com", role: "Admin", avatar: "JS", status: "online" },
  { name: "Maria Santos", email: "maria@empresa.com", role: "Agente", avatar: "MS", status: "online" },
  { name: "Pedro Costa", email: "pedro@empresa.com", role: "Agente", avatar: "PC", status: "offline" },
  { name: "Ana Oliveira", email: "ana@empresa.com", role: "Supervisor", avatar: "AO", status: "away" },
]

const integrations = [
  { name: "Slack", description: "Notificações e alertas", connected: true, icon: "🔗" },
  { name: "Zapier", description: "Automações externas", connected: true, icon: "⚡" },
  { name: "Salesforce", description: "CRM integration", connected: false, icon: "☁️" },
  { name: "HubSpot", description: "Marketing automation", connected: false, icon: "🔶" },
  { name: "Stripe", description: "Pagamentos", connected: true, icon: "💳" },
  { name: "OpenAI", description: "Modelos de IA", connected: true, icon: "🤖" },
]

const apiKeys = [
  { name: "Production API Key", key: "rdk_live_xxxxxxxxxxxxxxxxxxxxx", created: "Jan 15, 2024", lastUsed: "2 min atrás" },
  { name: "Development API Key", key: "rdk_test_xxxxxxxxxxxxxxxxxxxxx", created: "Jan 10, 2024", lastUsed: "1 dia atrás" },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company")
  const [showApiKey, setShowApiKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-64 shrink-0">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-4 px-3 text-sm font-semibold text-foreground">Configurações</h3>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Company Settings */}
        {activeTab === "company" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">Perfil da Empresa</h2>
              <p className="text-sm text-muted-foreground">Informações básicas da sua organização</p>

              <div className="mt-6 space-y-6">
                {/* Logo */}
                <div className="flex items-center gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20">
                    <Building2 className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <Button variant="outline" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Alterar Logo
                    </Button>
                    <p className="mt-1 text-xs text-muted-foreground">PNG, JPG até 2MB</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Nome da Empresa</label>
                    <Input defaultValue="RelayDesk Inc." className="bg-secondary/50 border-border" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Website</label>
                    <Input defaultValue="https://relaydesk.com" className="bg-secondary/50 border-border" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
                    <Input defaultValue="contato@relaydesk.com" className="bg-secondary/50 border-border" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Telefone</label>
                    <Input defaultValue="+55 11 99999-9999" className="bg-secondary/50 border-border" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Endereço</label>
                  <Input defaultValue="Av. Paulista, 1000 - São Paulo, SP" className="bg-secondary/50 border-border" />
                </div>

                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Members */}
        {activeTab === "members" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Membros da Equipe</h2>
                  <p className="text-sm text-muted-foreground">Gerencie os membros e suas permissões</p>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Convidar Membro
                </Button>
              </div>

              <div className="mt-6 space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.email}
                    className="flex items-center justify-between rounded-xl bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                          {member.avatar}
                        </div>
                        <span className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                          member.status === "online" && "status-online",
                          member.status === "offline" && "status-offline",
                          member.status === "away" && "status-busy"
                        )} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium",
                        member.role === "Admin" && "bg-primary/20 text-primary",
                        member.role === "Supervisor" && "bg-accent/20 text-accent",
                        member.role === "Agente" && "bg-secondary text-muted-foreground"
                      )}>
                        {member.role}
                      </span>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* API Keys */}
        {activeTab === "api" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">API Keys</h2>
                  <p className="text-sm text-muted-foreground">Gerencie suas chaves de API</p>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Nova Key
                </Button>
              </div>

              <div className="mt-6 space-y-4">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.name}
                    className="rounded-xl border border-border bg-secondary/30 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{apiKey.name}</p>
                        <p className="text-xs text-muted-foreground">Criada em {apiKey.created} • Usada {apiKey.lastUsed}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setShowApiKey(showApiKey === apiKey.key ? null : apiKey.key)}>
                          {showApiKey === apiKey.key ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleCopy(apiKey.key)}>
                          {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg bg-card p-3 font-mono text-sm">
                      {showApiKey === apiKey.key ? apiKey.key : "••••••••••••••••••••••••••••••"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Integrations */}
        {activeTab === "integrations" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">Integrações</h2>
              <p className="text-sm text-muted-foreground">Conecte ferramentas externas ao RelayDesk</p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {integrations.map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card text-2xl">
                        {integration.icon}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{integration.name}</p>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <Button
                      variant={integration.connected ? "outline" : "default"}
                      size="sm"
                    >
                      {integration.connected ? "Configurar" : "Conectar"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Billing */}
        {activeTab === "billing" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">Plano Enterprise</h2>
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">Ativo</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Acesso ilimitado a todas as funcionalidades</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-foreground">R$ 2.499<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                  <p className="text-sm text-muted-foreground">Próxima cobrança: 15 Fev 2024</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">Uso do Mês</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Agentes</span>
                    <span className="text-foreground">12 / Ilimitado</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full w-[40%] rounded-full bg-primary" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tickets</span>
                    <span className="text-foreground">8,542 / Ilimitado</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full w-[60%] rounded-full bg-accent" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Automações</span>
                    <span className="text-foreground">45 / Ilimitado</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full w-[30%] rounded-full bg-chart-3" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Theme */}
        {activeTab === "theme" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">Aparência</h2>
              <p className="text-sm text-muted-foreground">Personalize a aparência do RelayDesk</p>

              <div className="mt-6 space-y-6">
                <div>
                  <label className="mb-3 block text-sm font-medium text-foreground">Tema</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="rounded-xl border-2 border-primary p-4 text-center">
                      <div className="mx-auto mb-2 h-8 w-8 rounded-lg bg-[#0f0f17]" />
                      <span className="text-sm font-medium text-foreground">Dark</span>
                    </button>
                    <button className="rounded-xl border-2 border-border p-4 text-center opacity-50">
                      <div className="mx-auto mb-2 h-8 w-8 rounded-lg bg-white" />
                      <span className="text-sm font-medium text-foreground">Light</span>
                    </button>
                    <button className="rounded-xl border-2 border-border p-4 text-center opacity-50">
                      <div className="mx-auto mb-2 flex h-8 w-8 overflow-hidden rounded-lg">
                        <div className="w-1/2 bg-[#0f0f17]" />
                        <div className="w-1/2 bg-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">System</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-foreground">Cor de Destaque</label>
                  <div className="flex gap-3">
                    {["#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b", "#ec4899"].map((color) => (
                      <button
                        key={color}
                        className={cn(
                          "h-10 w-10 rounded-xl transition-transform hover:scale-110",
                          color === "#8b5cf6" && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Permissions */}
        {activeTab === "permissions" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">Permissões</h2>
              <p className="text-sm text-muted-foreground">Configure permissões por cargo</p>

              <div className="mt-6 space-y-4">
                {["Admin", "Supervisor", "Agente"].map((role) => (
                  <div key={role} className="rounded-xl border border-border bg-secondary/30 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{role}</p>
                        <p className="text-sm text-muted-foreground">
                          {role === "Admin" && "Acesso total ao sistema"}
                          {role === "Supervisor" && "Gerenciamento de equipe e relatórios"}
                          {role === "Agente" && "Atendimento ao cliente"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configurar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
