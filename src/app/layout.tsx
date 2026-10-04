import type { Metadata } from "next";
import { Playfair_Display, Golos_Text } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SmoothScroll } from "@/components/site/smooth-scroll";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  style: ["normal", "italic"],
});

const golos = Golos_Text({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Дилижанс Шоу — Бутик карнавальных и вечерних костюмов в Новосибирске",
  description:
    "«Дилижанс Шоу» — эксклюзивная коллекция из 2000+ карнавальных, национальных, свадебных и вечерних костюмов для детей и взрослых в Новосибирске. Аренда премиум-костюмов для любых событий.",
  keywords: [
    "прокат костюмов",
    "аренда костюмов Новосибирск",
    "карнавальные костюмы",
    "вечерние платья",
    "национальные костюмы",
    "Дилижанс Шоу",
    "костюмы на новый год",
    "костюмы для фотосессии",
  ],
  authors: [{ name: "Дилижанс Шоу" }],
  icons: {
    icon: "https://dilizhans-show.ru/wp-content/uploads/2021/04/fav-100x100.png",
  },
  openGraph: {
    title: "Дилижанс Шоу — Бутик костюмов премиум-класса",
    description:
      "Эксклюзивная коллекция из 2000+ карнавальных и вечерних костюмов в Новосибирске. Аренда премиум-образов для событий, съёмок и праздников.",
    url: "https://dilizhans-show.ru",
    siteName: "Дилижанс Шоу",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "https://dilizhans-show.ru/wp-content/uploads/2019/03/oglogo.jpg",
        width: 526,
        height: 279,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Дилижанс Шоу — Бутик костюмов премиум-класса",
    description:
      "Эксклюзивная коллекция из 2000+ карнавальных и вечерних костюмов в Новосибирске.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${golos.variable} antialiased bg-background text-foreground`}
      >
        <SmoothScroll>{children}</SmoothScroll>
        <Toaster />
      </body>
    </html>
  );
}
