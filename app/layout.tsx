import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Cormorant, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Lightbox from "@/components/lightbox/Lightbox";
import EditProvider from "@/components/edit/EditProvider";
import { getIsEditor } from "@/lib/editor-state";
import { getGlobalTheme } from "@/lib/theme";

const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KK Benjamin — Digital Marketer, Designer & Storyteller",
    template: "%s — KK Benjamin",
  },
  description:
    "I combine marketing strategy with creative design to build brands, tell stories, and deliver results that drive growth and engagement.",
  metadataBase: new URL("https://kkbenjamin.example"),
  openGraph: {
    title: "KK Benjamin — Digital Marketer, Designer & Storyteller",
    description:
      "Marketing strategy with a human pulse — brand systems, social campaigns, and content that performs.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isEditor, theme] = await Promise.all([getIsEditor(), getGlobalTheme()]);

  // Overrides the SAME CSS custom properties the site's Tailwind v4 @theme
  // block already generates (globals.css) — every existing bg-cream/text-forest/
  // etc. utility across the whole site already renders via var(), so this one
  // override on <html> recolors the entire site with zero per-component changes.
  const siteVars: CSSProperties = {
    "--color-cream": theme.tint,
    "--color-ivory": theme.card,
    "--color-forest": theme.text,
    "--color-forest-deep": theme.dark,
    "--color-sage": theme.accent,
  } as CSSProperties;

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable}`}
      style={siteVars}
    >
      <body className="flex min-h-screen flex-col bg-cream">
        <EditProvider isEditor={isEditor}>
          <Header />
          <main className="flex-1">{children}</main>
          <ContactCTA />
          <Footer />
          <ScrollToTop />
          <Lightbox />
        </EditProvider>
      </body>
    </html>
  );
}
