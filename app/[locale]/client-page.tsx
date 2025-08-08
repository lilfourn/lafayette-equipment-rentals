"use client";

import type { Machine } from "@/components/machine-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import { Phone, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Simple lazy loading - no complex state management
const PopularEquipmentSection = dynamic(
  () => import("@/components/homepage/popular-equipment-section").then(mod => ({ default: mod.PopularEquipmentSection })),
  { ssr: true }
);

const HowItWorksSection = dynamic(
  () => import("@/components/homepage/how-it-works-section").then(mod => ({ default: mod.HowItWorksSection })),
  { ssr: true }
);

const FeaturesSection = dynamic(
  () => import("@/components/homepage/features-section").then(mod => ({ default: mod.FeaturesSection })),
  { ssr: true }
);

const FAQSection = dynamic(
  () => import("@/components/homepage/faq-section").then(mod => ({ default: mod.FAQSection })),
  { ssr: true }
);

const ContactSection = dynamic(
  () => import("@/components/homepage/contact-section").then(mod => ({ default: mod.ContactSection })),
  { ssr: true }
);

interface LafayetteEquipmentHomepageProps {
  machines: Machine[];
  fetchError: string | null;
  popularMachines?: Machine[];
  equipmentCategories: Array<{
    _id: string;
    name: string;
    displayName: string;
    description?: string;
    image?: {
      asset?: {
        url?: string;
      };
      alt?: string;
    };
  }>;
  equipment: Array<{
    _id: string;
    title: string;
    slug: string;
    category: {
      name: string;
      displayName: string;
    };
    shortDescription?: string;
    keyFeatures?: string[];
    featured?: boolean;
  }>;
}

export default function LafayetteEquipmentHomepage({
  machines,
  fetchError,
  popularMachines,
  equipmentCategories,
  equipment,
}: LafayetteEquipmentHomepageProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const t = useTranslations();
  const locale = useLocale();

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Show loading state until hydrated
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {t("common.loading")}
          </h2>
          <p className="text-gray-600">
            Please wait while we load the latest inventory...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Mobile Optimized */}
      <section className="relative min-h-[100vh] sm:min-h-[500px] md:min-h-[600px] flex items-center overflow-hidden safe-top">
        {/* Background Image with Strong Overlay for Readability */}
        <div className="absolute inset-0">
          <Image
            src="/hero.jpg"
            alt="Lafayette Equipment Rentals"
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          />
          {/* Strong dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* Hero Content - Mobile First Design */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Headline - Responsive Sizing */}
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-6 tracking-tight leading-tight">
              {t("homepage.hero.title")}
              <span className="block text-yellow-400 mt-2">
                {t("homepage.hero.location")}
              </span>
            </h1>

            {/* Simple Tagline - Mobile Optimized */}
            <p className="text-lg sm:text-xl md:text-2xl text-white font-semibold mb-8 sm:mb-12 px-4 sm:px-0">
              {t("homepage.hero.tagline")}
            </p>

            {/* Two Main CTA Buttons - Stack on Mobile */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-stretch sm:items-center px-4 sm:px-0">
              <Link href="/equipment-rental" className="w-full sm:w-auto">
                <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black px-6 sm:px-10 py-4 sm:py-6 text-lg sm:text-xl font-black uppercase tracking-wide shadow-2xl transition-all duration-200 transform hover:scale-105 cursor-pointer tap-target">
                  <Search className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                  {t("homepage.hero.rentOnline")}
                </Button>
              </Link>

              <a href="tel:+13372345678" className="w-full sm:w-auto">
                <Button className="w-full bg-transparent border-2 sm:border-4 border-white text-white hover:bg-white hover:text-black px-6 sm:px-10 py-4 sm:py-6 text-lg sm:text-xl font-black uppercase tracking-wide shadow-2xl transition-all duration-200 transform hover:scale-105 cursor-pointer tap-target">
                  <Phone className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                  {t("homepage.hero.callNow")}
                </Button>
              </a>
            </div>

            {/* Phone Number - Extra Visibility */}
            <div className="mt-8">
              <p className="text-2xl md:text-3xl font-bold text-yellow-400">
                {t("homepage.hero.phone")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Equipment Section */}
      <PopularEquipmentSection machines={popularMachines} />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* FAQ Section */}
      <FAQSection locale={locale} />

      {/* Contact Section */}
      <ContactSection locale={locale} />
    </div>
  );
}