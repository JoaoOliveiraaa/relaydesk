import type { Metadata } from "next"
import { MarketingSubPage } from "@/components/marketing/sub-page"

export const metadata: Metadata = { title: "Cookies" }

export default function CookiesPage() {
  return (
    <MarketingSubPage title="Política de cookies" description="Utilização de cookies no site marketing e dashboard.">
      <p>Cookies estritamente necessários para sessão autenticada; analytics opcionais em produção (Vercel Analytics).</p>
    </MarketingSubPage>
  )
}
