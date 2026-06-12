import { SiteNav } from "@/components/site-nav"
import { HeroVideo } from "@/components/hero-video"
import { RosterSection } from "@/components/roster-section"
import { AboutSection } from "@/components/about-section"
import { StatsBand } from "@/components/stats-band"
import { EdgeSection } from "@/components/edge-section"
import { ContactFooter } from "@/components/contact-footer"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <SiteNav />
      <HeroVideo />
      <RosterSection />
      <AboutSection />
      <StatsBand />
      <EdgeSection />
      <ContactFooter />
    </main>
  )
}
