import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/sections/hero";
import { TrustStrip } from "@/components/sections/trust-strip";
import { Collections } from "@/components/sections/collections";
import { Offers } from "@/components/sections/offers";
import { Categories } from "@/components/sections/categories";
import { Advantages } from "@/components/sections/advantages";
import { Process } from "@/components/sections/process";
import { StyleAssistant } from "@/components/sections/style-assistant";
import { Booking } from "@/components/sections/booking";
import { Testimonials } from "@/components/sections/testimonials";
import { Gallery } from "@/components/sections/gallery";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <Header />
      <main className="flex-1">
        <Hero />
        <TrustStrip />
        <Collections />
        <Offers />
        <Categories />
        <Advantages />
        <Process />
        <StyleAssistant />
        <Booking />
        <Testimonials />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
