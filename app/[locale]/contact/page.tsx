import dynamic from "next/dynamic";
import { Suspense } from "react";
import {
  LocalBusinessSchema,
  OrganizationSchema,
} from "@/components/structured-data";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load the contact form
const ContactForm = dynamic(
  () => import("@/components/contact-form"),
  { 
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-32" />
      </div>
    ),
    ssr: true
  }
);
import {
  Award,
  ChevronRight,
  Clock,
  Headphones,
  Mail,
  MapPin,
  Phone,
  Users,
  Search,
  Shield,
  Truck,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title:
    "Contact Lafayette Equipment Rentals - Equipment Rental Services Lafayette Louisiana",
  description:
    "Contact Lafayette Equipment Rentals for professional equipment rental services in Lafayette, Louisiana. Call (337) 234-5678 or visit our facility at 2865 Ambassador Caffery Pkwy. Same-day delivery available throughout the Acadiana region.",
  keywords: [
    "contact Lafayette Equipment Rentals",
    "equipment rental Lafayette Louisiana phone",
    "Lafayette equipment rental address",
    "equipment rental services contact",
    "construction equipment rental Lafayette contact",
    "heavy equipment rental Lafayette phone number",
    "equipment rental quote Lafayette",
    "Lafayette equipment rental location",
    "Acadiana equipment rental contact",
    "professional equipment rental services",
    "equipment rental customer service",
    "Lafayette construction equipment contact",
    "equipment rental emergency contact",
    "same day equipment delivery Lafayette",
    "equipment rental consultation Lafayette",
  ],
  openGraph: {
    title:
      "Contact Lafayette Equipment Rentals - Professional Equipment Rental Services",
    description:
      "Contact us for professional equipment rental services in Lafayette, Louisiana. Call (337) 234-5678 or visit our facility. Same-day delivery available throughout Acadiana.",
    type: "website",
    url: "https://www.lafayetteequipmentrentals.com/contact",
    images: [
      {
        url: "/hero-image.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Lafayette Equipment Rentals - Professional equipment rental services in Lafayette, Louisiana",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Lafayette Equipment Rentals - Equipment Rental Services",
    description:
      "Professional equipment rental services in Lafayette, LA. Call (337) 234-5678 for same-day delivery.",
    images: ["/hero-image.jpg"],
  },
  alternates: {
    canonical: "https://www.lafayetteequipmentrentals.com/contact",
  },
  other: {
    "geo.region": "US-LA",
    "geo.placename": "Lafayette",
    "geo.position": "30.2241;-92.0198",
    ICBM: "30.2241, -92.0198",
    "contact:phone_number": "+1-337-234-5678",
    "contact:email": "info@lafayetteequipmentrentals.com",
    "contact:address":
      "2865 Ambassador Caffery Pkwy, Ste 135, Lafayette, LA 70506",
  },
};

export default async function ContactUsPage() {
  const t = await getTranslations();
  
  return (
    <>
      <LocalBusinessSchema />
      <OrganizationSchema />
      <div className="min-h-screen bg-white">
        {/* Hero Section - Matching client-page style */}
        <section className="relative min-h-[500px] md:min-h-[600px] flex items-center overflow-hidden">
          {/* Background Image with Strong Overlay */}
          <div className="absolute inset-0">
            <Image
              src="/contact_hero_image.png"
              alt="Lafayette Equipment Rentals Contact"
              fill
              className="object-cover object-center"
              priority
            />
            {/* Strong dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/70" />
          </div>

          {/* Hero Content - Simple and Bold */}
          <div className="relative z-10 container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              {/* Main Headline - Big and Bold */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
                GET IN TOUCH WITH
                <span className="block text-yellow-400">
                  OUR EXPERT TEAM
                </span>
              </h1>

              {/* Simple Tagline */}
              <p className="text-xl md:text-2xl text-white font-semibold mb-12">
                Need Equipment? Have Questions? We're Here to Help!
              </p>

              {/* Two Main CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <a href="tel:+13372345678">
                  <Button className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-black px-10 py-6 text-xl font-black uppercase tracking-wide shadow-2xl transition-all duration-200 transform hover:scale-105 cursor-pointer">
                    <Phone className="mr-3 h-6 w-6" />
                    CALL NOW
                  </Button>
                </a>

                <a href="#contact-form">
                  <Button className="w-full sm:w-auto bg-transparent border-4 border-white text-white hover:bg-white hover:text-black px-10 py-6 text-xl font-black uppercase tracking-wide shadow-2xl transition-all duration-200 transform hover:scale-105 cursor-pointer">
                    <Mail className="mr-3 h-6 w-6" />
                    SEND MESSAGE
                  </Button>
                </a>
              </div>

              {/* Phone Number - Extra Visibility */}
              <div className="mt-8">
                <p className="text-2xl md:text-3xl font-bold text-yellow-400">
                  (337) 234-5678
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section - Matching client-page style */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                WHY CHOOSE US
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Your Trusted Equipment{" "}
                <span className="relative">
                  Partner
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-turquoise-500"></span>
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6 group hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-turquoise-100 p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Truck className="h-8 w-8 text-turquoise-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Fast Delivery
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Same-day delivery available throughout Lafayette and surrounding areas. We get your equipment where you need it, when you need it.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 group hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-yellow-100 p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Safety First
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  All equipment maintained to the highest safety standards. Regular inspections and certified operators available for training.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 group hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-turquoise-100 p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Headphones className="h-8 w-8 text-turquoise-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    24/7 Support
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Round-the-clock customer support to keep your projects running smoothly. Emergency service available.
                </p>
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

        {/* Contact Section - Matching client-page style */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Contact Info */}
              <div>
                <div className="mb-8">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    GET IN TOUCH
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Contact{" "}
                    <span className="relative">
                      Information
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-turquoise-500"></span>
                    </span>
                  </h2>
                  <p className="text-lg text-gray-600 mt-4">
                    Ready to get started? Reach out to our team for expert equipment advice and quotes.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-turquoise-100 p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-turquoise-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Phone
                      </h3>
                      <a
                        href="tel:+13372345678"
                        className="text-xl font-semibold text-turquoise-600 hover:text-turquoise-700 transition-colors cursor-pointer"
                      >
                        (337) 234-5678
                      </a>
                      <p className="text-gray-600 text-sm mt-1">
                        Mon-Fri 7AM-6PM, Sat 8AM-4PM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-turquoise-100 p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-turquoise-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Location
                      </h3>
                      <p className="text-gray-700">
                        2865 Ambassador Caffery Pkwy, Suite 135
                        <br />
                        Lafayette, LA 70506
                      </p>
                      <a
                        href="https://www.google.com/maps/place/2865+Ambassador+Caffery+Pkwy+Ste+135,+Lafayette,+LA+70506"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-turquoise-600 hover:text-turquoise-700 text-sm font-semibold mt-2 inline-flex items-center cursor-pointer"
                      >
                        Get Directions
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-turquoise-100 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-turquoise-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Email
                      </h3>
                      <a
                        href="mailto:info@lafayetteequipmentrentals.com"
                        className="text-turquoise-600 hover:text-turquoise-700 transition-colors font-medium break-words cursor-pointer"
                      >
                        info@lafayetteequipmentrentals.com
                      </a>
                      <p className="text-gray-600 text-sm mt-1">
                        24-hour response time
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-turquoise-50 to-turquoise-100 p-6 rounded-lg border-l-4 border-turquoise-500 mt-8">
                    <h3 className="font-bold text-gray-900 mb-2">
                      Emergency Service Available
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Need equipment urgently? We offer 24/7 emergency rental service for critical projects.
                    </p>
                    <a href="tel:+13372345678" className="inline-flex items-center text-turquoise-600 hover:text-turquoise-700 font-semibold mt-3 cursor-pointer">
                      <Phone className="h-4 w-4 mr-2" />
                      Call for Emergency Service
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form - Enhanced Design */}
              <div id="contact-form">
                <ContactForm />
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

        {/* Location Section - Matching client-page style */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                VISIT US
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Lafayette{" "}
                <span className="relative">
                  Location
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-turquoise-500"></span>
                </span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Conveniently located to serve contractors and businesses throughout Lafayette and surrounding areas.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <MapPin className="h-7 w-7 text-turquoise-600" />
                    Lafayette Equipment Rentals
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        Address
                      </p>
                      <p className="text-gray-700">
                        2865 Ambassador Caffery Pkwy, Suite 135
                        <br />
                        Lafayette, LA 70506
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        Business Hours
                      </p>
                      <p className="text-gray-700">
                        Monday - Friday: 7:00 AM - 6:00 PM<br />
                        Saturday: 8:00 AM - 4:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="https://www.google.com/maps/place/2865+Ambassador+Caffery+Pkwy+Ste+135,+Lafayette,+LA+70506"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button className="w-full bg-turquoise-600 hover:bg-turquoise-700 text-white font-semibold py-3 transition-all duration-200 transform hover:scale-105 cursor-pointer">
                      <MapPin className="h-5 w-5 mr-2" />
                      Get Directions
                    </Button>
                  </a>
                  <Link href="/equipment-rental" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white font-semibold py-3 transition-all duration-200 transform hover:scale-105 cursor-pointer"
                    >
                      Browse Equipment
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3449.123456789!2d-92.01234567!3d30.123456789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8626a123456789ab%3A0x123456789abcdef0!2s2865%20Ambassador%20Caffery%20Pkwy%20Ste%20135%2C%20Lafayette%2C%20LA%2070506!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lafayette Equipment Rentals Location"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Matching client-page style */}
        <section className="bg-gradient-to-r from-turquoise-600 to-turquoise-700">
          <div className="container mx-auto px-4 py-16 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              Browse our equipment inventory or contact us for personalized assistance with your project needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/equipment-rental">
                <Button
                  size="lg"
                  className="bg-white text-turquoise-700 hover:bg-gray-100 font-bold px-10 py-3 text-lg transition-all duration-200 transform hover:scale-105 cursor-pointer shadow-lg"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Browse Equipment
                </Button>
              </Link>
              <a href="tel:+13372345678">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-turquoise-700 font-bold px-10 py-3 text-lg transition-all duration-200 transform hover:scale-105 cursor-pointer"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Call (337) 234-5678
                </Button>
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
