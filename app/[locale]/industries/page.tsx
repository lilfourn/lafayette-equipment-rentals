import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
// Removed Sanity dependencies
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";

interface Industry {
  _id: string;
  title: string;
  slug: { current: string };
  heroTitle?: string;
  heroSubtitle?: string;
  featured?: boolean;
  order?: number;
}

async function getIndustries(): Promise<Industry[]> {
  // Static placeholder until external CMS is integrated
  return [
    {
      _id: "construction",
      title: "Construction",
      slug: { current: "construction" },
    },
    {
      _id: "agriculture",
      title: "Agriculture",
      slug: { current: "agriculture" },
    },
    { _id: "industrial", title: "Industrial", slug: { current: "industrial" } },
  ];
}

export default async function IndustriesPage() {
  const industries = await getIndustries();

  return (
    <div className="bg-white text-gray-900">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">
            HOMEPAGE
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">INDUSTRIES</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white via-gray-100 to-gray-200 py-16 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-gray-900 mb-6">
            Industries We Serve
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Professional equipment rental solutions tailored to meet the unique
            demands of your industry. From construction and agriculture to
            events and government projects.
          </p>
        </div>
      </section>

      <main>
        {/* Industries Grid */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Choose Your Industry
            </h2>
            <p className="text-lg text-gray-500 text-center mb-12 max-w-2xl mx-auto">
              Select your industry to explore our specialized equipment
              solutions and expert support services.
            </p>
            {industries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {industries.map((industry) => (
                  <IndustryCard key={industry._id} industry={industry} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">🏗️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Industries Coming Soon
                </h3>
                <p className="text-gray-500 mb-6">
                  We're currently adding industry-specific pages. Check back
                  soon or contact us for equipment recommendations for your
                  specific industry needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-orange-600 hover:bg-orange-700"
                    asChild
                  >
                    <Link href="/contact">Contact Us for Your Industry</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/equipment-rental">View All Equipment</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 md:py-24 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Don't See Your Industry?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              We serve a wide range of industries beyond those listed. Contact
              our equipment experts to discuss your specific industry needs and
              get customized equipment recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6"
                asChild
              >
                <Link href="/contact">Contact Industry Expert</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white text-lg px-8 py-6"
                asChild
              >
                <Link href="/equipment-rental">Browse All Equipment</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function IndustryCard({ industry }: { industry: Industry }) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 flex flex-col h-full bg-white">
      <CardHeader className="p-6 pb-4">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
          {industry.title}
        </h3>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex-grow">
        {industry.heroSubtitle && (
          <p className="text-gray-600 line-clamp-3">{industry.heroSubtitle}</p>
        )}
        <p className="text-gray-600 mt-2">
          Affordable {industry.title} with same-day delivery, expert support,
          and top-tier equipment.
        </p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Link href={`/industries/${industry.slug.current}`} className="w-full">
          <Button
            className="w-full bg-orange-600 hover:bg-orange-700 group-hover:bg-orange-700 flex items-center justify-center transition-all whitespace-nowrap"
            size="lg"
          >
            Learn More
            <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export async function generateMetadata() {
  return {
    title: "Industries We Serve | Equipment Rentals Lafayette, Louisiana",
    description:
      "Professional equipment rental solutions for construction, agriculture, events, government, and more. Serving Lafayette, Louisiana with industry-specific equipment and expertise.",
    keywords: [
      "equipment rental industries",
      "construction equipment",
      "agriculture equipment",
      "Lafayette Louisiana",
      "industrial equipment rental",
    ],
  };
}
