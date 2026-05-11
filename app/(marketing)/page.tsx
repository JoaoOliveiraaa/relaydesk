import { HeroSection } from "@/components/landing/hero-section"
import { ArchitectureSection } from "@/components/landing/architecture-section"
import { DeveloperSection } from "@/components/landing/developer-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { MetricsSection } from "@/components/landing/metrics-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { CTASection } from "@/components/landing/cta-section"
import { PlatformShowcases } from "@/components/marketing/platform-showcases"

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ArchitectureSection />
      <PlatformShowcases />
      <DeveloperSection />
      <FeaturesSection />
      <MetricsSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  )
}
