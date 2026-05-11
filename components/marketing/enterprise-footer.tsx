import Link from "next/link"
import { Github } from "lucide-react"

const columns = {
  Produto: [
    { label: "Funcionalidades", href: "/#features" },
    { label: "Preços", href: "/pricing" },
    { label: "Integrações", href: "/integrations" },
    { label: "Changelog", href: "/changelog" },
    { label: "Roadmap", href: "/roadmap" },
  ],
  Developers: [
    { label: "Portal", href: "/developers" },
    { label: "Documentação", href: "/docs" },
    { label: "API Reference", href: "/api-reference" },
    { label: "SDKs", href: "/sdks" },
    { label: "Webhooks", href: "/webhooks" },
    { label: "Status", href: "/status" },
  ],
  Empresa: [
    { label: "Sobre", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Carreiras", href: "/careers" },
    { label: "Contacto", href: "/contact" },
    { label: "Imprensa", href: "/press" },
  ],
  Legal: [
    { label: "Privacidade", href: "/privacy" },
    { label: "Termos", href: "/terms" },
    { label: "Segurança", href: "/security" },
    { label: "GDPR", href: "/gdpr" },
    { label: "SLA", href: "/sla" },
  ],
} as const

export function EnterpriseFooter() {
  return (
    <footer className="border-t border-border/80 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-xs font-bold text-primary">
                R
              </span>
              RelayDesk
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Plataforma omnichannel orientada a eventos: filas, realtime, motor de webhooks e observabilidade de
              nível produção — com a mesma disciplina visual e de produto das melhores SaaS enterprise.
            </p>
            <a
              href="https://github.com"
              className="mt-6 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
          {(Object.entries(columns) as [string, { label: string; href: string }[]][]).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} RelayDesk. Todos os direitos reservados.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-foreground">
              Privacidade
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Termos
            </Link>
            <Link href="/cookies" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
