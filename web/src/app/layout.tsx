import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import "./globals.css";
import Navigation from "@/components/Navigation";
import ConditionalFooter from "@/components/ConditionalFooter";
import { CartProvider } from "@/contexts/CartContext";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ocean Gem - Exquisite Jewelry Collection",
  description: "Discover timeless treasures and exquisite jewelry at Ocean Gem. Handcrafted pieces for your most special moments.",
  icons: {
    icon: '/image/icon_gem.png',
    shortcut: '/image/icon_gem.png',
    apple: '/image/icon_gem.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body
        className={`${inter.className} antialiased bg-white text-zinc-900`}
        suppressHydrationWarning
      >
        <Providers>
          <CartProvider>
            <Navigation />
            <main>
              {children}
            </main>
            <ConditionalFooter />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
