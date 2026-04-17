import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import "./globals.css";
import Navigation from "@/components/Navigation";
import ConditionalFooter from "@/components/ConditionalFooter";
import { CartProvider } from "@/contexts/CartContext";
import AuthProvider from "@/components/auth/AuthProvider";
import { Providers } from "./providers";
import ScrollToTop from "@/components/ScrollToTop";
import { serverContentService } from "@/lib/server/services/contentService";


const getErrorCode = (error: unknown): string | undefined => {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
};

const getErrorDigest = (error: unknown): string | undefined => {
  if (typeof error === "object" && error !== null && "digest" in error) {
    const digest = (error as { digest?: unknown }).digest;
    return typeof digest === "string" ? digest : undefined;
  }
  return undefined;
};

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
  const bootstrapData = await serverContentService.getBootstrapData('home');
  const settings = bootstrapData?.global_settings;

  if (!settings) {
    return {
      title: "Alceix Group - Exquisite Jewelry Collection",
      description: "Discover timeless treasures and exquisite jewelry at Alceix Group.",
      icons: { icon: '/image/alceix/icon.png' },
    };
  }

  return {
    title: settings.metaTitle || settings.siteName || "Alceix Group",
    description: settings.metaDescription || "Exquisite Jewelry Collection",
    icons: {
      icon: settings.favicon || '/image/alceix/icon.png',
      shortcut: settings.favicon || '/image/alceix/icon.png',
      apple: settings.favicon || '/image/alceix/icon.png',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bootstrapData = await serverContentService.getBootstrapData('home');


  const settings = bootstrapData?.global_settings;
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
        <Providers initialData={bootstrapData}>
          <ScrollToTop />
          <CartProvider>
            <AuthProvider>
              <Navigation />
              <main>
                {children}
              </main>
              <ConditionalFooter />
            </AuthProvider>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
