import { getCSSVariables, getTheme } from "@/styles/theme";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.lafayetteequipmentrentals.com"),
  title: {
    default:
      "Lafayette Equipment Rentals - Heavy Construction Equipment Rental Louisiana",
    template: "%s | Lafayette Equipment Rentals",
  },
  description:
    "Professional equipment rentals in Lafayette, Louisiana. Rent excavators, bulldozers, skid steers, generators & more. Family-owned with same-day delivery. Serving Acadiana region since 2009.",
  keywords: [
    // Primary Keywords
    "equipment rental Lafayette Louisiana",
    "construction equipment rental Lafayette",
    "heavy equipment rental Lafayette LA",
    "Lafayette equipment rental service",
    "heavy machinery rental Lafayette",

    // Equipment Types
    "excavator rental Lafayette",
    "bulldozer rental Lafayette LA",
    "skid steer rental Lafayette",
    "generator rental Lafayette Louisiana",
    "crane rental Lafayette",
    "backhoe rental Lafayette LA",
    "dump truck rental Lafayette",
    "scissor lift rental Lafayette",
    "forklift rental Lafayette Louisiana",
    "compactor rental Lafayette",

    // Local/Geographic
    "Lafayette Louisiana equipment rental",
    "Acadiana equipment rental",
    "construction equipment Lafayette Parish",
    "heavy equipment rental Vermilion Parish",
    "equipment rental Iberia Parish",
    "construction rental St. Martin Parish",
    "equipment rental Acadia Parish",
    "Lafayette construction equipment",

    // Service Keywords
    "equipment rental delivery Lafayette",
    "same day equipment rental Lafayette",
    "professional equipment rental Louisiana",
    "construction equipment leasing Lafayette",
    "heavy machinery rental services",
    "equipment rental quotes Lafayette",
    "short term equipment rental",
    "long term equipment rental",

    // Business Type
    "family owned equipment rental",
    "local equipment rental Lafayette",
    "trusted equipment rental Louisiana",
    "reliable construction equipment rental",
    "certified equipment rental service",

    // Industry/Project Keywords
    "commercial construction equipment rental",
    "residential construction equipment",
    "industrial equipment rental Lafayette",
    "agricultural equipment rental Louisiana",
    "landscaping equipment rental Lafayette",
    "road construction equipment rental",
    "building construction equipment",
    "infrastructure equipment rental",
  ],
  authors: [{ name: "Lafayette Equipment Rentals" }],
  creator: "Lafayette Equipment Rentals",
  publisher: "Lafayette Equipment Rentals",
  applicationName: "Lafayette Equipment Rentals",
  classification: "Equipment Rental, Construction Services, Heavy Machinery",
  category: "Equipment Rental Services",
  openGraph: {
    url: "https://www.lafayetteequipmentrentals.com",
    siteName: "Lafayette Equipment Rentals",
    title:
      "Lafayette Equipment Rentals - Professional Heavy Equipment Rental Louisiana",
    description:
      "Family-owned equipment rental company serving Lafayette, Louisiana since 2009. Professional-grade construction equipment with same-day delivery. Excavators, bulldozers, generators & more.",
    images: [
      {
        url: "/opengraph.png",
        alt: "Lafayette Equipment Rentals - Professional Heavy Construction Equipment Rental Services in Lafayette, Louisiana",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@LafayetteEquip",
    creator: "@LafayetteEquip",
    title: "Lafayette Equipment Rentals - Heavy Equipment Rental Louisiana",
    description:
      "Professional equipment rentals in Lafayette, LA. Family-owned with same-day delivery. Serving Acadiana region with quality construction equipment.",
    images: ["/opengraph.png"],
  },
  alternates: {
    canonical: "https://www.lafayetteequipmentrentals.com",
    languages: {
      "en-US": "https://www.lafayetteequipmentrentals.com",
      "es-US": "https://www.lafayetteequipmentrentals.com/es",
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
    other: {
      "msvalidate.01": "your-bing-verification-code",
    },
  },
  other: {
    "geo.region": "US-LA",
    "geo.placename": "Lafayette",
    "geo.position": "30.2241;-92.0198",
    ICBM: "30.2241, -92.0198",
    "DC.title":
      "Lafayette Equipment Rentals - Heavy Construction Equipment Rental Louisiana",
    rating: "general",
    distribution: "global",
    "revisit-after": "7 days",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning className="scroll-smooth">
      <body
        suppressHydrationWarning
        className={`${inter.className} ${inter.variable} antialiased min-h-screen bg-background text-foreground`}
        style={getCSSVariables(getTheme())}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
