"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronDown } from "lucide-react"

const product = [
  { label: "Funcionalidades", href: "/#features" },
  { label: "Preços", href: "/pricing" },
  { label: "Integrações", href: "/integrations" },
  { label: "Changelog", href: "/changelog" },
  { label: "Roadmap", href: "/roadmap" },
]

const developers = [
  { label: "Portal", href: "/developers" },
  { label: "Documentação", href: "/docs" },
  { label: "API Reference", href: "/api-reference" },
  { label: "SDKs", href: "/sdks" },
  { label: "Webhooks", href: "/webhooks" },
  { label: "Status", href: "/status" },
]

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 right-0 left-0 z-50 border-b transition-colors duration-300 ${
          scrolled ? "border-border/80 bg-background/75 backdrop-blur-xl" : "border-transparent bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-xs font-bold text-primary">
              R
            </span>
            RelayDesk
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setOpenMenu("product")}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button
                type="button"
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              >
                Produto
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>
              <AnimatePresence>
                {openMenu === "product" && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 z-50 pt-1"
                  >
                    <div className="min-w-[200px] rounded-lg border border-border bg-popover p-1 shadow-lg">
                      {product.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className="relative"
              onMouseEnter={() => setOpenMenu("dev")}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button
                type="button"
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              >
                Developers
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>
              <AnimatePresence>
                {openMenu === "dev" && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 z-50 pt-1"
                  >
                    <div className="min-w-[220px] rounded-lg border border-border bg-popover p-1 shadow-lg">
                      {developers.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/security"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              Segurança
            </Link>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="font-medium">
                Começar
              </Button>
            </Link>
          </div>

          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground lg:hidden"
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/95 pt-14 backdrop-blur-xl lg:hidden"
          >
            <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Produto</p>
                <div className="flex flex-col gap-1">
                  {product.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2 text-foreground hover:bg-secondary"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Developers</p>
                <div className="flex flex-col gap-1">
                  {developers.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2 text-foreground hover:bg-secondary"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <Link href="/security" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-secondary">
                Segurança
              </Link>
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Começar</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
