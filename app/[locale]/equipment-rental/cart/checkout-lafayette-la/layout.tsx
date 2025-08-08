import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Equipment Checkout | Lafayette Equipment Rentals",
  description: "Complete your equipment rental reservation for Lafayette, LA and surrounding areas. Fast checkout, competitive pricing, and reliable service.",
  openGraph: {
    title: "Checkout Your Equipment Rental - Lafayette, LA",
    description: "Reserve construction equipment, heavy machinery, and tools for delivery in Lafayette, Louisiana. Simple checkout process with flexible rental terms.",
    url: "https://lafayetteequipmentrentals.com/equipment-rental/cart/checkout-lafayette-la",
    siteName: "Lafayette Equipment Rentals",
    images: [
      {
        url: "/open-graph.png",
        width: 1200,
        height: 630,
        alt: "Lafayette Equipment Rentals - Checkout"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Equipment Checkout | Lafayette Equipment Rentals",
    description: "Complete your equipment rental reservation for Lafayette, LA. Fast checkout with competitive pricing.",
    images: ["/open-graph.png"]
  },
  keywords: [
    "equipment rental checkout",
    "Lafayette equipment rental",
    "construction equipment reservation",
    "heavy machinery rental Louisiana",
    "tool rental Lafayette LA",
    "equipment delivery Lafayette",
    "rental checkout process",
    "construction rental reservation"
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  alternates: {
    canonical: "https://lafayetteequipmentrentals.com/equipment-rental/cart/checkout-lafayette-la"
  }
}

export default function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}