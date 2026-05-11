"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Mail,
  Phone,
  MessageCircle,
  Star,
  StarOff,
  Tag,
  Calendar,
  ChevronDown,
  Download,
  Upload,
  UserPlus,
  Users,
  Activity,
  TrendingUp
} from "lucide-react"

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  tags: string[]
  channel: string
  lastContact: string
  totalMessages: number
  isFavorite: boolean
  status: "active" | "inactive" | "new"
}

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Maria Silva",
    email: "maria.silva@email.com",
    phone: "+55 11 99999-0001",
    tags: ["VIP", "Premium"],
    channel: "whatsapp",
    lastContact: "2024-03-15T10:30:00",
    totalMessages: 145,
    isFavorite: true,
    status: "active"
  },
  {
    id: "2",
    name: "Joao Santos",
    email: "joao.santos@email.com",
    phone: "+55 11 99999-0002",
    tags: ["Lead"],
    channel: "email",
    lastContact: "2024-03-14T15:45:00",
    totalMessages: 23,
    isFavorite: false,
    status: "active"
  },
  {
    id: "3",
    name: "Ana Costa",
    email: "ana.costa@email.com",
    phone: "+55 11 99999-0003",
    tags: ["Suporte"],
    channel: "whatsapp",
    lastContact: "2024-03-13T09:15:00",
    totalMessages: 67,
    isFavorite: true,
    status: "active"
  },
  {
    id: "4",
    name: "Carlos Oliveira",
    email: "carlos.o@email.com",
    phone: "+55 11 99999-0004",
    tags: ["Novo"],
    channel: "instagram",
    lastContact: "2024-03-15T14:20:00",
    totalMessages: 5,
    isFavorite: false,
    status: "new"
  },
  {
    id: "5",
    name: "Patricia Ferreira",
    email: "patricia.f@email.com",
    phone: "+55 11 99999-0005",
    tags: ["Recorrente", "VIP"],
    channel: "phone",
    lastContact: "2024-03-12T11:00:00",
    totalMessages: 234,
    isFavorite: true,
    status: "active"
  },
  {
    id: "6",
    name: "Roberto Lima",
    email: "roberto.lima@email.com",
    phone: "+55 11 99999-0006",
    tags: ["Inativo"],
    channel: "email",
    lastContact: "2024-02-20T08:30:00",
    totalMessages: 12,
    isFavorite: false,
    status: "inactive"
  }
]

const tagColors: Record<string, string> = {
  "VIP": "bg-amber-500/20 text-amber-400",
  "Premium": "bg-purple-500/20 text-purple-400",
  "Lead": "bg-blue-500/20 text-blue-400",
  "Suporte": "bg-emerald-500/20 text-emerald-400",
  "Novo": "bg-primary/20 text-primary",
  "Recorrente": "bg-cyan-500/20 text-cyan-400",
  "Inativo": "bg-muted text-muted-foreground"
}

const channelIcons: Record<string, typeof MessageCircle> = {
  whatsapp: MessageCircle,
  email: Mail,
  phone: Phone,
  instagram: MessageCircle
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts)
  const [search, setSearch] = useState("")
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(search.toLowerCase()) ||
    contact.email.toLowerCase().includes(search.toLowerCase()) ||
    contact.phone.includes(search)
  )

  const toggleFavorite = (id: string) => {
    setContacts(contacts.map(c => 
      c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
    ))
  }

  const toggleSelect = (id: string) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id))
    }
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return "Hoje"
    if (days === 1) return "Ontem"
    if (days < 7) return `${days} dias atras`
    return d.toLocaleDateString("pt-BR")
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contatos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie sua base de contatos e leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Importar
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" />
            Novo Contato
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total de Contatos", value: contacts.length.toLocaleString(), icon: Users, color: "text-primary" },
          { label: "Novos Este Mes", value: "234", icon: UserPlus, color: "text-emerald-400" },
          { label: "Contatos Ativos", value: contacts.filter(c => c.status === "active").length, icon: Activity, color: "text-accent" },
          { label: "Taxa de Engajamento", value: "78%", icon: TrendingUp, color: "text-amber-400" }
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

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtros
          <ChevronDown className="w-3 h-3" />
        </Button>
        <Button variant="outline" className="gap-2">
          <Tag className="w-4 h-4" />
          Tags
          <ChevronDown className="w-3 h-3" />
        </Button>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedContacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card rounded-xl p-3 flex items-center justify-between"
          >
            <span className="text-sm text-muted-foreground">
              {selectedContacts.length} contato(s) selecionado(s)
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Adicionar Tag</Button>
              <Button variant="outline" size="sm">Enviar Mensagem</Button>
              <Button variant="outline" size="sm" className="text-red-400">Remover</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contacts Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                    onChange={selectAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Contato</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Canal</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Tags</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Ultimo Contato</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Mensagens</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredContacts.map((contact, index) => {
                  const ChannelIcon = channelIcons[contact.channel] || MessageCircle
                  
                  return (
                    <motion.tr
                      key={contact.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-border/30 hover:bg-card/30 transition-colors"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => toggleSelect(contact.id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center text-sm font-medium text-foreground">
                            {getInitials(contact.name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{contact.name}</span>
                              <button
                                onClick={() => toggleFavorite(contact.id)}
                                className="text-muted-foreground hover:text-amber-400 transition-colors"
                              >
                                {contact.isFavorite ? (
                                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ) : (
                                  <StarOff className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{contact.email}</span>
                              <span>{contact.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <ChannelIcon className="w-4 h-4" />
                          <span className="text-sm capitalize">{contact.channel}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.map(tag => (
                            <span
                              key={tag}
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagColors[tag] || "bg-muted text-muted-foreground"}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {formatDate(contact.lastContact)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-foreground">{contact.totalMessages}</span>
                      </td>
                      <td className="p-4">
                        <button className="p-2 rounded-lg hover:bg-card/50 text-muted-foreground">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border/50 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Mostrando {filteredContacts.length} de {contacts.length} contatos
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Anterior</Button>
            <Button variant="outline" size="sm" className="bg-primary/20 text-primary">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Proximo</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
