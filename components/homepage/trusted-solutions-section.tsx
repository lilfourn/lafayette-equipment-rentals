"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { CheckCircle, Users, Shield, Clock, MapPin, Wrench } from "lucide-react";

export const TrustedSolutionsSection = memo(function TrustedSolutionsSection() {
  const t = useTranslations();

  return (
    <>
      {/* Lafayette's Trusted Equipment Solutions Section - Redesigned */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Local Images */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-72 rounded-lg overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
                  <Image
                    src="/why_us_photo_one.jpg"
                    alt="Lafayette Louisiana downtown with iconic tower"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-72 rounded-lg overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300 mt-12">
                  <Image
                    src="/why_us_photo_two.jpg"
                    alt="Louisiana bayou with local wildlife"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-turquoise-100 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -top-6 -right-6 w-48 h-48 bg-yellow-100 rounded-full opacity-20 blur-2xl"></div>
              
              {/* Overlay Badge */}
              <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-turquoise-500 text-white p-2 rounded-full">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Family Owned</p>
                    <p className="text-sm text-gray-600">Since 1994</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="max-w-xl">
              <p className="text-sm font-semibold text-turquoise-600 uppercase tracking-wide mb-4">
                {t("homepage.trustedSolutions.category")}
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                More Than Equipment — 
                <span className="text-turquoise-600 block mt-2">We're Your Neighbors</span>
              </h2>

              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Born and raised right here in Lafayette, we understand Louisiana construction like no one else. 
                From navigating hurricane season to beating the summer heat, we've been through it all with you.
              </p>

              <p className="text-gray-600 mb-8">
                {t("homepage.trustedSolutions.commitment")}
              </p>

              {/* Personal Quote */}
              <div className="bg-gradient-to-r from-gray-50 to-turquoise-50 border-l-4 border-turquoise-500 p-6 rounded-r-lg mb-8">
                <p className="text-gray-700 italic mb-3">
                  {t("homepage.trustedSolutions.ownerQuote.text")}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  — {t("homepage.trustedSolutions.ownerQuote.author")}
                </p>
              </div>

              {/* Services with Icons */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("homepage.trustedSolutions.servicesTitle")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-turquoise-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Same-day delivery throughout Lafayette Parish</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-turquoise-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">24/7 emergency equipment service</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-turquoise-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">On-site maintenance and repair</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-turquoise-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Fully licensed, bonded, and insured</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <Button className="bg-turquoise-600 hover:bg-turquoise-700 text-white px-8 py-3 font-semibold cursor-pointer shadow-lg hover:shadow-xl transition-all">
                    {t("homepage.trustedSolutions.contactUs")}
                  </Button>
                </Link>
                <Link href="/equipment-rental">
                  <Button
                    variant="outline"
                    className="border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-8 py-3 font-semibold cursor-pointer transition-all"
                  >
                    {t("homepage.trustedSolutions.exploreEquipment")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Trust Indicators - Bottom Section */}
          <div className="mt-20 bg-gradient-to-r from-gray-50 via-white to-turquoise-50 rounded-2xl p-12 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="group hover:scale-105 transition-transform">
                <div className="text-4xl font-bold text-turquoise-600 mb-2 group-hover:text-turquoise-700">30+</div>
                <div className="text-gray-600">Years Serving Lafayette</div>
              </div>
              <div className="group hover:scale-105 transition-transform">
                <div className="text-4xl font-bold text-turquoise-600 mb-2 group-hover:text-turquoise-700">5,000+</div>
                <div className="text-gray-600">Local Projects Completed</div>
              </div>
              <div className="group hover:scale-105 transition-transform">
                <div className="text-4xl font-bold text-turquoise-600 mb-2 group-hover:text-turquoise-700">24/7</div>
                <div className="text-gray-600">Emergency Support</div>
              </div>
              <div className="group hover:scale-105 transition-transform">
                <div className="text-4xl font-bold text-turquoise-600 mb-2 group-hover:text-turquoise-700">100%</div>
                <div className="text-gray-600">Louisiana Owned</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Divider */}
      <div className="py-8 bg-gradient-to-r from-gray-100 via-turquoise-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-turquoise-300 to-turquoise-500"></div>
            <div className="mx-6">
              <div className="w-3 h-3 bg-turquoise-500 rounded-full"></div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-turquoise-500 via-turquoise-300 to-transparent"></div>
          </div>
        </div>
      </div>
    </>
  );
});