import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { ScrollProgress } from "@/components/site/motion-utils";
import { CustomCursor } from "@/components/site/custom-cursor";
import { Hero } from "@/components/sections/hero";
import { TrustStrip } from "@/components/sections/trust-strip";
import { Collections } from "@/components/sections/collections";
import { Offers } from "@/components/sections/offers";
import { Catalog } from "@/components/sections/catalog";
import { Advantages } from "@/components/sections/advantages";
import { Process } from "@/components/sections/process";
import { StyleAssistant } from "@/components/sections/style-assistant";
import { Booking } from "@/components/sections/booking";
import { Testimonials } from "@/components/sections/testimonials";
import { Gallery } from "@/components/sections/gallery";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-onyx">
      <ScrollProgress />
      <Header />
      <main className="flex-1">
        <Hero />
        <TrustStrip />
        <Collections />
        <Offers />
        <Catalog />
        <Advantages />
        <Process />
        <StyleAssistant />
        <Booking />
        <Testimonials />
        <Gallery />
        <Contact />
      </main>
      <Footer />
      <CustomCursor />
    </div>
  );
}
