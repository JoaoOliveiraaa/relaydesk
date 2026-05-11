"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Code2, 
  Copy, 
  Check,
  Webhook,
  Radio,
  Globe,
  Bot,
  Terminal
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const codeExamples = [
  {
    id: "webhook",
    title: "Webhook Example",
    icon: Webhook,
    language: "typescript",
    code: `// Dispatch webhooks to external systems
await relaydesk.webhooks.send({
  event: "ticket.created",
  payload: {
    id: ticket.id,
    customer: ticket.customer,
    channel: "whatsapp",
    priority: "high",
    metadata: {
      sentiment: "urgent",
      aiSuggestion: response
    }
  }
})`,
  },
  {
    id: "queue",
    title: "Queue Processing",
    icon: Radio,
    language: "typescript",
    code: `// Process messages with RabbitMQ
@Processor('messages')
export class MessageConsumer {
  @Process('incoming')
  async handleMessage(job: Job<Message>) {
    const { channel, content, customerId } = job.data
    
    // AI-powered response generation
    const response = await this.ai.generate(content)
    
    // Send through the appropriate channel
    await this.channels[channel].send(customerId, response)
  }
}`,
  },
  {
    id: "websocket",
    title: "Realtime Events",
    icon: Globe,
    language: "typescript",
    code: `// Broadcast realtime updates via WebSocket
@SubscribeMessage('conversation.subscribe')
handleSubscribe(client: Socket, conversationId: string) {
  client.join(\`conversation:\${conversationId}\`)
}

// Emit updates to all connected clients
this.server.to(\`conversation:\${id}\`).emit(
  'conversation.updated',
  {
    messages: newMessages,
    typing: agentTyping,
    status: 'active'
  }
)`,
  },
  {
    id: "automation",
    title: "AI Automation",
    icon: Bot,
    language: "typescript",
    code: `// Intelligent automation with AI
@Automation('sentiment-escalation')
async handleSentimentChange(context: AutomationContext) {
  const { customer, conversation, sentiment } = context
  
  if (sentiment.score < -0.7) {
    // Escalate to human agent
    await this.escalateToHuman({
      priority: 'urgent',
      reason: 'Negative sentiment detected',
      aiSummary: await this.ai.summarize(conversation)
    })
    
    // Notify team via Slack
    await this.notify.slack('#support-escalations', {
      customer: customer.name,
      issue: sentiment.keywords.join(', ')
    })
  }
}`,
  },
]

export function DeveloperSection() {
  const [activeTab, setActiveTab] = useState("webhook")
  const [copied, setCopied] = useState(false)

  const activeExample = codeExamples.find(e => e.id === activeTab)

  const handleCopy = () => {
    if (activeExample) {
      navigator.clipboard.writeText(activeExample.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <section id="developer" className="relative py-24 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 mb-4">
              <Terminal className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-muted-foreground">Developer First</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Construido para{" "}
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                desenvolvedores
              </span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              APIs modernas, SDKs robustos e documentacao completa. 
              Integre o RelayDesk em minutos com nossa arquitetura developer-friendly.
            </p>

            <div className="space-y-4 mb-8">
              {[
                "Arquitetura distribuida com microservicos",
                "Filas com processamento assincrono",
                "Cache distribuido com Redis",
                "Escalabilidade horizontal automatica",
              ].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button asChild className="font-medium">
                <Link href="/docs">
                  <Code2 className="mr-2 h-4 w-4" />
                  Documentação
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-border hover:bg-secondary/80">
                <Link href="/api-reference">API Reference</Link>
              </Button>
            </div>
          </motion.div>

          {/* Right - Code Block */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-blue-500/20 blur-3xl" />
            
            <div className="relative bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Tabs */}
              <div className="flex items-center gap-1 p-2 bg-[#161b22] border-b border-white/5 overflow-x-auto">
                {codeExamples.map((example) => (
                  <button
                    key={example.id}
                    onClick={() => setActiveTab(example.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === example.id
                        ? "bg-white/10 text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <example.icon className="w-4 h-4" />
                    {example.title}
                  </button>
                ))}
              </div>

              {/* Code Content */}
              <div className="relative p-6">
                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <pre className="text-sm leading-relaxed overflow-x-auto">
                      <code className="text-[#e6edf3]">
                        {activeExample?.code.split('\n').map((line, i) => (
                          <div key={i} className="flex">
                            <span className="w-8 text-right pr-4 text-[#484f58] select-none">{i + 1}</span>
                            <span>
                              {highlightCode(line)}
                            </span>
                          </div>
                        ))}
                      </code>
                    </pre>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-xs text-muted-foreground">TypeScript</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {activeExample?.code.split('\n').length} lines
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Simple syntax highlighting helper
function highlightCode(line: string) {
  return line
    .replace(/(\/\/.*$)/g, '<span class="text-[#8b949e]">$1</span>')
    .replace(/('.*?'|".*?"|\`.*?\`)/g, '<span class="text-[#a5d6ff]">$1</span>')
    .replace(/\b(const|let|var|async|await|function|return|if|export|class|this)\b/g, '<span class="text-[#ff7b72]">$1</span>')
    .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-[#79c0ff]">$1</span>')
    .replace(/@(\w+)/g, '<span class="text-[#d2a8ff]">@$1</span>')
    .split(/(<span.*?<\/span>)/)
    .map((part, i) => {
      if (part.startsWith('<span')) {
        const match = part.match(/class="([^"]+)".*?>(.+?)<\/span>/)
        if (match) {
          return <span key={i} className={match[1]}>{match[2]}</span>
        }
      }
      return <span key={i}>{part}</span>
    })
}
