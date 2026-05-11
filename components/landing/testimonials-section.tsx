"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    quote: "RelayDesk transformou nossa operacao de suporte. A IA responde 70% dos tickets automaticamente com qualidade excepcional.",
    author: "Marina Silva",
    role: "CTO",
    company: "TechFlow",
    avatar: "MS",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    quote: "A arquitetura event-driven nos permitiu escalar de 1K para 100K conversas/dia sem problemas. Infraestrutura solida.",
    author: "Ricardo Almeida",
    role: "Head of Engineering",
    company: "ScaleUp Brasil",
    avatar: "RA",
    gradient: "from-violet-500 to-purple-500"
  },
  {
    quote: "Finalmente uma plataforma que entende desenvolvedores. APIs bem documentadas, webhooks confiaveis e suporte tecnico de verdade.",
    author: "Julia Santos",
    role: "Lead Developer",
    company: "DevFirst",
    avatar: "JS",
    gradient: "from-pink-500 to-rose-500"
  },
  {
    quote: "O automation builder visual mudou como criamos fluxos. Time de produto agora cria automacoes sem depender de engenharia.",
    author: "Pedro Costa",
    role: "VP of Product",
    company: "ProductLab",
    avatar: "PC",
    gradient: "from-amber-500 to-orange-500"
  },
  {
    quote: "ROI de 340% no primeiro ano. Reduzimos custos de suporte em 60% mantendo NPS acima de 80.",
    author: "Ana Rodrigues",
    role: "COO",
    company: "GrowthMetrics",
    avatar: "AR",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    quote: "Multi-tenancy e isolamento de dados nos permitiu oferecer o produto para clientes enterprise com confianca.",
    author: "Lucas Ferreira",
    role: "Founder & CEO",
    company: "SaaS Partners",
    avatar: "LF",
    gradient: "from-indigo-500 to-blue-500"
  },
]

export function TestimonialsSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 mb-4">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm text-muted-foreground">Loved by Teams</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Empresas que{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              confiam
            </span>{" "}
            no RelayDesk
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Veja o que CTOs, desenvolvedores e lideres de produto estao dizendo.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              <div className="relative h-full bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
                {/* Quote icon */}
                <div className="absolute top-6 right-6">
                  <Quote className="w-8 h-8 text-white/5" />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-sm`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} @ {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Company Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 pt-12 border-t border-white/5"
        >
          <p className="text-center text-sm text-muted-foreground mb-8">
            Usado por times de engenharia em empresas inovadoras
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            {["TechFlow", "ScaleUp", "DevFirst", "ProductLab", "GrowthMetrics", "SaaS Partners"].map((company) => (
              <div 
                key={company}
                className="text-xl font-bold text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors"
              >
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
