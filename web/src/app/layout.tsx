import type { Metadata } from "next";
export const dynamic = "force-dynamic";
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

export async function generateMetadata(): Promise<Metadata> {
  try {
    // Use no-store and a timestamp to bypass any potential CDN/Vercel cache
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/section-content/global_settings?t=${Date.now()}`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    const json = await res.json();
    const settings = json?.data?.content;

    return {
      title: settings?.metaTitle || settings?.siteName || "Ocean Gem - Exquisite Jewelry Collection",
      description: settings?.metaDescription || "Discover timeless treasures and exquisite jewelry at Ocean Gem. Handcrafted pieces for your most special moments.",
      icons: {
        icon: settings?.favicon || '/image/icon_gem.png',
        shortcut: settings?.favicon || '/image/icon_gem.png',
        apple: settings?.favicon || '/image/icon_gem.png',
      },
    };
  } catch (error) {
    console.error("Failed to fetch global settings for metadata:", error);
    return {
      title: "Ocean Gem - Exquisite Jewelry Collection",
      description: "Discover timeless treasures and exquisite jewelry at Ocean Gem. Handcrafted pieces for your most special moments.",
      icons: {
        icon: '/image/icon_gem.png',
        shortcut: '/image/icon_gem.png',
        apple: '/image/icon_gem.png',
      },
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  let settings = null;

  try {
    const res = await fetch(`${apiUrl}/public/section-content/global_settings?t=${Date.now()}`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    if (res.ok) {
      const json = await res.json();
      settings = json?.data?.content;
    }
  } catch (err) {
    console.error("Failed to fetch global settings for theme:", err);
  }

  const theme = settings?.theme;
  const headingFont = theme?.headingFont || 'Playfair Display';
  const bodyFont = theme?.bodyFont || 'Inter';

  // Fallback defaults to ensure no undefined values
  const primaryColor = theme?.primaryColor || '#C5A059';
  const secondaryColor = theme?.secondaryColor || '#000000';
  const backgroundColor = theme?.backgroundColor || '#ffffff';
  const textColor = theme?.textColor || '#18181b';

  const fontUrl = `https://fonts.googleapis.com/css2?family=${headingFont.replace(/ /g, '+')}:wght@300;400;500;600;700&family=${bodyFont.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;

  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <head>
        <link rel="stylesheet" href={fontUrl} />
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary-color: ${primaryColor};
              --secondary-color: ${secondaryColor};
              --bg-color: ${backgroundColor};
              --text-color: ${textColor};
              --font-heading-custom: '${headingFont}', serif;
              --font-body-custom: '${bodyFont}', sans-serif;
            }
            body {
              --primary-color: ${primaryColor};
              --secondary-color: ${secondaryColor};
              --bg-color: ${backgroundColor};
              --text-color: ${textColor};
            }
          `
        }} />
      </head>
      <body
        className={`antialiased bg-[var(--bg-color)] text-[var(--text-color)] font-body`}
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
