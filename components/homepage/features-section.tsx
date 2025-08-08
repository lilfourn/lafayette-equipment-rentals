"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { CheckCircle, DollarSign, Headphones, MapPin, Monitor, ShoppingCart, Users, Shield, Clock } from "lucide-react";
import { memo } from "react";
import Image from "next/image";

export const FeaturesSection = memo(function FeaturesSection() {
  const t = useTranslations();

  const features = [
    {
      icon: MapPin,
      title: t("homepage.features.localService.title"),
      description: t("homepage.features.localService.description"),
      color: "text-turquoise-600",
      bgColor: "bg-turquoise-50",
    },
    {
      icon: DollarSign,
      title: t("homepage.features.competitivePricing.title"),
      description: t("homepage.features.competitivePricing.description"),
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Users,
      title: "Family-Owned & Operated",
      description: "Three generations of Louisiana families have trusted us. We treat every customer like family.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Shield,
      title: "Licensed & Insured",
      description: "Fully licensed, bonded, and insured for your peace of mind on every project.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: CheckCircle,
      title: t("homepage.features.quality.title"),
      description: t("homepage.features.quality.description"),
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      icon: Clock,
      title: "Same-Day Delivery",
      description: "Need equipment fast? We offer same-day delivery throughout Lafayette Parish.",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header with Local Images */}
        <div className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="order-2 lg:order-1">
              <Badge className="mb-4 text-sm px-4 py-1 bg-turquoise-100 text-turquoise-800 border-turquoise-200">
                {t("homepage.features.badge")}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Lafayette's Premier 
                <span className="text-turquoise-600"> Equipment Rental Service</span>
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {t("homepage.features.subtitle")}
              </p>
              <p className="text-lg text-gray-700 mb-8">
                Locally owned and operated in Lafayette, Louisiana. We provide reliable equipment 
                rentals with competitive rates and professional service for all your construction needs.
              </p>
            </div>

            {/* Right Column - Local Images */}
            <div className="order-1 lg:order-2 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-64 rounded-lg overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
                  <Image
                    src="/why_us_photo_one.jpg"
                    alt="Lafayette Louisiana downtown with iconic tower"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-64 rounded-lg overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300 mt-8">
                  <Image
                    src="/why_us_photo_two.jpg"
                    alt="Louisiana bayou with local wildlife"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              {/* Decorative Element */}
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-turquoise-100 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -top-4 -right-4 w-40 h-40 bg-yellow-100 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
});