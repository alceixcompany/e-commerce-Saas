import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { Inter, Playfair_Display } from "next/font/google";

import "./globals.css";
import Navigation from "@/components/Navigation";
import ConditionalFooter from "@/components/ConditionalFooter";
import { CartProvider } from "@/contexts/CartContext";
import { Providers } from "./providers";
import en from "@/locales/en.json";
import tr from "@/locales/tr.json";

const translations = { en, tr };

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
    // Use a 60-second revalidation period to allow caching and prevent blocking page load
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/section-content/global_settings`, {
      next: { revalidate: 60 }
    });
    const json = await res.json();
    const settings = json?.data?.content;

    const activeLanguage = (settings?.activeLanguage as 'en' | 'tr') || 'tr';
    const t = translations[activeLanguage] as any;

    return {
      title: settings?.metaTitle || settings?.siteName || t.admin?.seo?.metaTitle || "Ocean Gem - Exquisite Jewelry Collection",
      description: settings?.metaDescription || t.admin?.seo?.metaDescription || "Discover timeless treasures and exquisite jewelry at Ocean Gem. Handcrafted pieces for your most special moments.",
      icons: {
        icon: settings?.favicon || '/image/alceix/icon.png',
        shortcut: settings?.favicon || '/image/alceix/icon.png',
        apple: settings?.favicon || '/image/alceix/icon.png',
      },
    };
  } catch (error) {
    console.error("Failed to fetch global settings for metadata:", error);
    return {
      title: "Ocean Gem - Exquisite Jewelry Collection",
      description: "Discover timeless treasures and exquisite jewelry at Ocean Gem. Handcrafted pieces for your most special moments.",
      icons: {
        icon: '/image/alceix/icon.png',
        shortcut: '/image/alceix/icon.png',
        apple: '/image/alceix/icon.png',
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
    const res = await fetch(`${apiUrl}/public/section-content/global_settings`, {
      next: { revalidate: 60 }
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

  const activeLanguage = (settings?.activeLanguage as 'en' | 'tr') || 'tr';

  return (
    <html lang={activeLanguage} className={`${inter.variable} ${playfairDisplay.variable}`}>
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
