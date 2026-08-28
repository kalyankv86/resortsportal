import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Manrope } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { AuthProvider } from "@/lib/auth";
import { AffiliationStrip } from "@/components/layout/AffiliationStrip";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ContactDock } from "@/components/layout/ContactDock";
import { site } from "@/content/site";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.shortName}`,
  },
  description:
    "The official wellness and eco-tourism destination of Centurion University, Paralakhemundi — classical Ayurveda, residential Panchakarma, forest healing and farm-to-table dining at the foothills of the Eastern Ghats.",
  keywords: [
    "Ayurveda wellness centre",
    "wellness retreat India",
    "Panchakarma",
    "eco tourism Odisha",
    "Centurion University",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    url: site.url,
    title: `${site.name} — ${site.tagline}`,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#14532d",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <SmoothScroll>
            <AffiliationStrip />
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <ContactDock />
          </SmoothScroll>
        </AuthProvider>
      </body>
    </html>
  );
}
