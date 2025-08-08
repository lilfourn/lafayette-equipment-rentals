"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

export const HowItWorksSection = memo(function HowItWorksSection() {
  const t = useTranslations();

  return (
    <>
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

      {/* How Renting Online Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Image */}
            <div className="relative h-[400px] lg:h-[500px]">
              <Image
                src="/how_online_renting_works.png"
                alt="Construction equipment fleet - excavators and machinery"
                fill
                className="object-cover rounded-lg shadow-xl"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-lg"></div>
            </div>

            {/* Right Column - Content */}
            <div className="max-w-xl">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {t("homepage.howItWorks.title")}
                </h2>
                <div className="w-16 h-1 bg-turquoise-500 mb-6"></div>
              </div>

              <div className="space-y-6">
                {[
                  t("homepage.howItWorks.steps.0"),
                  t("homepage.howItWorks.steps.1"),
                  t("homepage.howItWorks.steps.2"),
                  t("homepage.howItWorks.steps.3"),
                ].map((step, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-turquoise-600 mr-3 mt-1 text-lg">
                      •
                    </span>
                    <div>
                      <p
                        className="text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: step.replace(
                            /\b(Earthmoving|Aerial Work Platforms|Forklifts & Material Handling|Trucks and Trailers|requirements|United Rentals|special training|best practices for our equipment)\b/g,
                            '<span class="text-turquoise-600 font-semibold">$1</span>'
                          ),
                        }}
                      ></p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/equipment-rental">
                  <Button className="bg-turquoise-600 hover:bg-turquoise-700 text-white font-semibold px-8 py-3 transition-all duration-200 cursor-pointer">
                    {t("homepage.howItWorks.cta")}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
});