import type { Metadata } from "next"
import { MarketingSubPage } from "@/components/marketing/sub-page"

export const metadata: Metadata = { title: "Blog" }

export default function BlogPage() {
  return (
    <MarketingSubPage eyebrow="Blog" title="Engineering & produto" description="Artigos técnicos e notas de release em breve.">
      <p>Primeiros posts: desenho do motor de webhooks, estratégia de DLQ e SLOs de realtime.</p>
    </MarketingSubPage>
  )
}
