"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { memo } from "react";

interface ContactSectionProps {
  locale: string;
}

export const ContactSection = memo(function ContactSection({ locale }: ContactSectionProps) {
  const t = useTranslations();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="py-20 bg-gray-50 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
            CONTACT US
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with our team for equipment rentals, quotes, and expert advice
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {/* Phone Card */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center group">
            <div className="bg-turquoise-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-turquoise-200 transition-colors">
              <Phone className="h-10 w-10 text-turquoise-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Call Us
            </h3>
            <p className="text-gray-600 mb-4">
              Speak directly with our equipment specialists
            </p>
            <a
              href="tel:+13372345678"
              className="inline-flex items-center justify-center text-turquoise-600 hover:text-turquoise-700 font-bold text-lg transition-colors"
            >
              <Phone className="h-5 w-5 mr-2" />
              (337) 234-5678
            </a>
          </div>

          {/* Email Card */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center group">
            <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow-200 transition-colors">
              <Mail className="h-10 w-10 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Email Us
            </h3>
            <p className="text-gray-600 mb-4">
              Send us your questions anytime
            </p>
            <a
              href="mailto:info@lafayetteequipmentrentals.com"
              className="inline-flex items-center justify-center text-turquoise-600 hover:text-turquoise-700 font-bold transition-colors"
            >
              <Mail className="h-5 w-5 mr-2" />
              Send Email
            </a>
          </div>

          {/* Location Card */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center group">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-200 transition-colors">
              <MapPin className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Visit Us
            </h3>
            <p className="text-gray-600 mb-4">
              Stop by our Lafayette location
            </p>
            <address className="text-turquoise-600 hover:text-turquoise-700 font-bold not-italic transition-colors">
              <MapPin className="h-5 w-5 inline mr-2" />
              Lafayette, LA 70506
            </address>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link href={`/${locale}/contact`}>
            <Button
              size="lg"
              className="bg-turquoise-600 hover:bg-turquoise-700 text-white font-bold text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Get a Free Quote
            </Button>
          </Link>
        </div>

        {/* Business Hours */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center justify-center bg-white rounded-lg px-6 py-3 shadow-md">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-gray-600 font-medium">Open Now</span>
              </div>
              <div className="text-gray-400">|</div>
              <div className="text-gray-700 font-semibold">
                Mon-Fri: 7AM-5PM • Sat: 8AM-12PM
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-turquoise-600 hover:bg-turquoise-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-50"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-6 w-6" />
      </button>
    </section>
  );
});