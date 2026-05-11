"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Zap, ArrowRight, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [tenantName, setTenantName] = useState("")
  const [tenantSlug, setTenantSlug] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await register({
        tenantName: tenantName.trim(),
        tenantSlug: tenantSlug.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      })
      router.push("/dashboard")
    } catch {
      setError("Não foi possível criar a conta. O slug pode já existir ou os dados são inválidos.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold">RelayDesk</span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Criar organização</h1>
          <p className="mt-1 text-sm text-muted-foreground">Regista o primeiro tenant e utilizador owner.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-foreground">Nome da organização</label>
            <Input value={tenantName} onChange={(e) => setTenantName(e.target.value)} required className="h-11" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-foreground">Slug (URL)</label>
            <Input
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase())}
              placeholder="minha-empresa"
              required
              className="h-11"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                className="h-11 pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-foreground">Senha (mín. 8)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                className="h-11 pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? "A criar…" : (
              <>
                Criar conta
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Já tens conta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
