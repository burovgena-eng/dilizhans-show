import { Header } from "@/components/site/header";
import { ScrollProgress } from "@/components/site/motion-utils";
import { CustomCursor } from "@/components/site/custom-cursor";
import { CinematicHero } from "@/components/sections/cinematic-hero";

/* ============================================================================
 * Home — clean slate.
 *
 * Currently active on this page:
 *   - ScrollProgress (top progress bar)
 *   - Header (sticky nav)
 *   - CinematicHero (curtain + title + 3D fly-through)
 *   - CustomCursor (custom pointer)
 *
 * The rest of the site (SubHero, TrustStrip, Collections, Offers, Catalog,
 * Advantages, Process, Booking, Testimonials, Contact, Footer) is archived
 * in the `archive/with-subhero-and-sections` git branch — restore from
 * there when ready to wire it back in.
 *
 * Working on a clean slate per user request so we can iterate on the
 * curtain / hero experience without distraction.
 * ============================================================================ */

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-onyx">
      <ScrollProgress />
      <Header />
      <main className="flex-1">
        <CinematicHero />
      </main>
      <CustomCursor />
    </div>
  );
}
