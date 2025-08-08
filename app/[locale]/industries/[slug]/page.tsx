import SimpleMachineCard from "@/components/simple-machine-card";
import { Button } from "@/components/ui/button";
import { loadCommonIndustries } from "@/lib/industry-config";
import { searchIndustryMachines } from "@/lib/industry-search";
import { LAFAYETTE_LOCATION } from "@/lib/location-config";
import { searchMachines } from "@/lib/rubbl-machine-search";
import { CheckCircle, ChevronRight, Star, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type React from "react";

// No Sanity integration: opt out of prebuilding params
export async function generateStaticParams() {
  return [];
}

interface IndustryPageProps {
  params: {
    slug: string;
  };
}

export default async function IndustryPage({ params }: IndustryPageProps) {
  const { slug } = await params;
  const industries = loadCommonIndustries();
  const industry = industries.find((i) => i.slug === slug);
  if (!industry) {
    return notFound();
  }

  const apiKey = process.env.RUBBL_API_KEY || "";
  const { machines } = await searchIndustryMachines(industry, {
    apiKey,
    cacheEnabled: true,
    cacheDuration: 900,
    maxRequestsPerSecond: 2,
  });

  // Fetch additional available equipment in stock (exclude already shown)
  const extraRes = await searchMachines(
    {
      location: {
        lat: LAFAYETTE_LOCATION.latitude,
        lon: LAFAYETTE_LOCATION.longitude,
        radiusMiles: LAFAYETTE_LOCATION.serviceRadiusMiles,
      },
      maxResults: 18,
    },
    { apiKey, cacheEnabled: true, cacheDuration: 900, maxRequestsPerSecond: 2 }
  );
  const shownIds = new Set(machines.map((m) => m.id));
  const extraMachines = (extraRes.machines || [])
    .filter((m) => !shownIds.has(m.id))
    .slice(0, 6);

  const heroImageUrl = undefined;
  const imageAlt = `${industry.name} equipment rentals`;

  // Extract any content in parentheses to present as a stylish pill below the main title
  function parseIndustryName(name: string): { base: string; within?: string } {
    const match = name.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
    if (match) {
      return { base: match[1].trim(), within: match[2].trim() };
    }
    return { base: name };
  }
  const titleParts = parseIndustryName(industry.name);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-turquoise-600">
            HOMEPAGE
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/industries" className="hover:text-turquoise-600">
            INDUSTRIES
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{industry.name}</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[360px] w-full flex items-center justify-center text-center py-14 sm:py-20 md:py-24">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt={imageAlt}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-white to-turquoise-50" />
        )}
        <div className="absolute inset-0 bg-white/70" />
        <div className="relative z-10 p-4 max-w-5xl mx-auto text-center space-y-5 sm:space-y-6 md:space-y-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-gray-900">
            {`${titleParts.base} Equipment Rentals`}
          </h1>
          {titleParts.within && (
            <div className="mt-4 sm:mt-5">
              <span className="inline-flex items-center rounded-full bg-turquoise-100 text-turquoise-800 ring-1 ring-turquoise-300 px-3 sm:px-4 py-1.5 sm:py-2 text-base sm:text-lg font-bold">
                {titleParts.within}
              </span>
            </div>
          )}
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Professional equipment rentals for {industry.name.toLowerCase()}{" "}
            projects in Lafayette, Louisiana.
          </p>
          <div className="pt-2 sm:pt-3 md:pt-4">
            <Button
              size="lg"
              className="bg-turquoise-600 hover:bg-turquoise-700 text-white text-lg px-8 py-6 cursor-pointer"
              asChild
            >
              <Link href="/contact">Contact a Rental Expert</Link>
            </Button>
          </div>
        </div>
      </section>

      <main>
        {/* Machines grid */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            {machines.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {machines.map((m) => (
                  <SimpleMachineCard key={m.id} machine={m} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No {industry.name} machines available today
                </h3>
                <p className="text-gray-600">
                  We’ll keep this page updated as inventory changes. In the
                  meantime, see more equipment in stock below.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* More equipment in stock */}
        {extraMachines.length > 0 && (
          <section className="py-10 md:py-14 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  More Equipment In Stock
                </h2>
                <p className="text-gray-600 mt-2">
                  Available now in Lafayette — browse additional options that
                  may fit your job.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {extraMachines.map((m) => (
                  <SimpleMachineCard key={m.id} machine={m} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Why Work With Us Section (kept concise) */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center tracking-tight text-gray-900 sm:text-4xl mb-12">
              {"Why work with us?"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-12 w-12 text-turquoise-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  Top-Tier Equipment, Zero Hassle
                </h3>
                <p className="text-gray-600 mb-4 text-center">
                  Every rental is serviced, inspected, and job-ready so you can
                  start work with confidence.
                </p>
                <div className="text-center">
                  <Link
                    href="/company/about#reliable-performance"
                    className="text-turquoise-600 hover:text-turquoise-700 font-medium"
                  >
                    Learn more
                  </Link>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex justify-center mb-4">
                  <Truck className="h-12 w-12 text-turquoise-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  We Bring the Equipment to You
                </h3>
                <p className="text-gray-600 mb-4 text-center">
                  Fast, flexible delivery and pickup options keep you on
                  schedule.
                </p>
                <div className="text-center">
                  <Link
                    href="/company/about#delivery-pickup"
                    className="text-turquoise-600 hover:text-turquoise-700 font-medium"
                  >
                    Learn more
                  </Link>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex justify-center mb-4">
                  <Star className="h-12 w-12 text-turquoise-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  Cut Costs, Not Corners
                </h3>
                <p className="text-gray-600 mb-4 text-center">
                  Renting keeps your projects efficient—no maintenance, storage,
                  or big upfront costs.
                </p>
                <div className="text-center">
                  <Link
                    href="/company/about#rental-advantage"
                    className="text-turquoise-600 hover:text-turquoise-700 font-medium"
                  >
                    Learn more
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-turquoise-600 to-turquoise-700">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-turquoise-700 hover:bg-gray-100 text-lg px-8 py-6 cursor-pointer"
                asChild
              >
                <Link href="/contact">Get a Quote</Link>
              </Button>
              <Button
                size="lg"
                className="bg-white text-turquoise-700 hover:bg-gray-100 text-lg px-8 py-6 cursor-pointer"
                asChild
              >
                <Link href="tel:+17707625498">Call Now: (770) 762-5498</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: IndustryPageProps) {
  const { slug } = await params;
  const industries = loadCommonIndustries();
  const industry = industries.find((i) => i.slug === slug);
  const title = industry ? industry.name : slug.replace(/-/g, " ");
  return {
    title: `${title} Equipment Rentals Lafayette, Louisiana`,
    description: `Professional ${title.toLowerCase()} equipment rentals in Lafayette, Louisiana. Flexible rental options for all your project needs.`,
    keywords: [
      `${title.toLowerCase()} equipment rental`,
      "Lafayette Louisiana",
      "construction equipment",
      "equipment rental",
    ],
  };
}
