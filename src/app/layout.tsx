import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800"],
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
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${cormorant.variable} ${manrope.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
