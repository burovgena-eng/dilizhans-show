import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { ScrollProgress } from "@/components/site/motion-utils";
import { CustomCursor } from "@/components/site/custom-cursor";
import { SectionReveal } from "@/components/site/section-reveal";
import { CinematicHero } from "@/components/sections/cinematic-hero";
import { SubHero } from "@/components/sections/sub-hero";
import { TrustStrip } from "@/components/sections/trust-strip";
import { Collections } from "@/components/sections/collections";
import { Offers } from "@/components/sections/offers";
import { Catalog } from "@/components/sections/catalog";
import { Advantages } from "@/components/sections/advantages";
import { Process } from "@/components/sections/process";
import { Booking } from "@/components/sections/booking";
import { Testimonials } from "@/components/sections/testimonials";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-onyx">
      <ScrollProgress />
      <Header />
      <main className="flex-1">
        {/* CinematicHero: scroll-jacked 3D cosmic journey, ends in a
            white flash portal that hands off to SubHero. */}
        <CinematicHero />
        {/* SubHero: emerges from the star portal — bridges cosmic intro
            to the rest of the site (TrustStrip, Collections, etc.). */}
        <SubHero />
        <TrustStrip />

        {/* The remaining sections fade + lift in via SectionReveal. Each inner
            section retains its own id="..." anchor (e.g. #collections). */}
        <SectionReveal>
          <Collections />
        </SectionReveal>
        <SectionReveal>
          <Offers />
        </SectionReveal>
        <SectionReveal>
          <Catalog />
        </SectionReveal>
        <SectionReveal>
          <Advantages />
        </SectionReveal>
        <SectionReveal>
          <Process />
        </SectionReveal>
        <SectionReveal>
          <Booking />
        </SectionReveal>
        <SectionReveal>
          <Testimonials />
        </SectionReveal>
        <SectionReveal>
          <Contact />
        </SectionReveal>
      </main>
      <Footer />
      <CustomCursor />
    </div>
  );
}
