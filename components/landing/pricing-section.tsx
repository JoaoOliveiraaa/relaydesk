"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  Check, 
  Sparkles,
  Zap,
  Building2,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    description: "Para times pequenos comecando com automacao",
    monthlyPrice: 99,
    yearlyPrice: 79,
    icon: Zap,
    gradient: "from-blue-500 to-cyan-500",
    features: [
      "Ate 3 agentes",
      "5.000 mensagens/mes",
      "2 canais integrados",
      "IA basica (GPT-3.5)",
      "5 automacoes",
      "Analytics basico",
      "Suporte por email",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Growth",
    description: "Para empresas em crescimento acelerado",
    monthlyPrice: 299,
    yearlyPrice: 249,
    icon: Sparkles,
    gradient: "from-violet-500 to-purple-500",
    features: [
      "Ate 15 agentes",
      "50.000 mensagens/mes",
      "Todos os canais",
      "IA avancada (GPT-4)",
      "Automacoes ilimitadas",
      "Analytics avancado",
      "Webhooks & API",
      "Integracao Slack/Teams",
      "Suporte prioritario",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Para grandes operacoes com necessidades customizadas",
    monthlyPrice: null,
    yearlyPrice: null,
    icon: Building2,
    gradient: "from-amber-500 to-orange-500",
    features: [
      "Agentes ilimitados",
      "Mensagens ilimitadas",
      "Todos os canais + custom",
      "IA enterprise (custom models)",
      "Automacoes ilimitadas",
      "Analytics enterprise",
      "API dedicada",
      "SLA garantido 99.99%",
      "Multi-tenant isolation",
      "SSO & SAML",
      "Suporte 24/7 dedicado",
      "Customer Success Manager",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(true)

  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 mb-4">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-muted-foreground">Simple Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Precos{" "}
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              transparentes
            </span>{" "}
            para cada escala
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
            Comece gratuitamente. Escale conforme cresce. Sem surpresas.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-full bg-white/5 border border-white/10">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !isYearly 
                  ? "bg-white/10 text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                isYearly 
                  ? "bg-white/10 text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Anual
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative group ${plan.popular ? "lg:-mt-4 lg:mb-4" : ""}`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-medium shadow-lg shadow-violet-500/25">
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`relative h-full bg-card/50 backdrop-blur-sm rounded-2xl p-8 transition-all duration-300 overflow-hidden ${
                plan.popular 
                  ? "border-2 border-violet-500/50 shadow-xl shadow-violet-500/10" 
                  : "border border-white/5 hover:border-white/10"
              }`}>
                {/* Glow effect for popular */}
                {plan.popular && (
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10" />
                )}

                <div className="relative">
                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg`}>
                      <plan.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.monthlyPrice !== null ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-foreground">
                          ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                        </span>
                        <span className="text-muted-foreground">/mes</span>
                      </div>
                    ) : (
                      <div className="text-4xl font-bold text-foreground">Custom</div>
                    )}
                    {plan.monthlyPrice !== null && isYearly && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Cobrado anualmente (${(plan.yearlyPrice || 0) * 12}/ano)
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Link href={plan.name === "Enterprise" ? "#" : "/login"} className="block mb-8">
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-violet-500/25" 
                          : "bg-white/5 hover:bg-white/10 text-foreground border border-white/10"
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Precisa de algo customizado?{" "}
            <a href="#" className="text-foreground hover:text-violet-400 transition-colors underline underline-offset-4">
              Fale com nosso time de vendas
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
