import MachineGridSkeleton from "@/components/skeletons/machine-grid-skeleton";
import {
  filterOutRadiusMachines,
  getBuyItNowEverywheresMachines,
  processGlobalBuyItNowMachines,
} from "@/lib/global-machines";
import {
  attachments,
  brandModelCombinations,
  comparisonTopics,
  equipmentSpecs,
  equipmentTypeVariations,
  guideTopics,
  industries,
  pricingTopics,
  projectTypes,
  seasonalEvents,
  serviceTypes,
} from "@/lib/lafayette-seo-urls";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

// Dynamically import MachineGrid for lazy loading
const MachineGrid = dynamic(() => import("@/components/machine-grid"), {
  loading: () => <MachineGridSkeleton showFilters={true} />,
  ssr: true,
});

interface CatchAllPageProps {
  params: {
    locale: string;
    slug: string[];
  };
}

// Parse the SEO URL to extract the type and parameters
function parseSEOUrl(segments: string[]): {
  type: string;
  category?: string;
  subcategory?: string;
  isLafayetteSEO?: boolean;
} | null {
  // Check if this is a Lafayette SEO URL pattern
  const lastSegment = segments[segments.length - 1];
  const isLafayetteSEO = lastSegment?.endsWith("-lafayette-la");

  if (isLafayetteSEO) {
    // Remove 'lafayette-la' suffix for processing
    const cleanSegments = [...segments];
    cleanSegments[cleanSegments.length - 1] = lastSegment.replace(
      "-lafayette-la",
      ""
    );

    const [first, second, third] = cleanSegments;

    // Direct equipment rental: excavator-rental
    if (segments.length === 1 && first?.includes("-rental")) {
      const equipment = first
        .replace("-rental", "")
        .replace("-lafayette-la", "");
      return { type: "equipment", category: equipment, isLafayetteSEO: true };
    }

    // Service pages: service/daily-excavator-rental
    if (first === "service" && second) {
      return { type: "service", category: second, isLafayetteSEO: true };
    }

    // Brand pages: brand/caterpillar-320-excavator-rental
    if (first === "brand" && second) {
      return { type: "brand", category: second, isLafayetteSEO: true };
    }

    // Industry pages: industry/construction-excavator-rental
    if (first === "industry" && second) {
      return { type: "industry", category: second, isLafayetteSEO: true };
    }

    // Project pages: project/home-renovation-equipment-rental
    if (first === "project" && second) {
      return { type: "project", category: second, isLafayetteSEO: true };
    }

    // Specification pages: specification/20-ton-excavator-rental
    if (first === "specification" && second) {
      return { type: "specification", category: second, isLafayetteSEO: true };
    }

    // Attachment pages: attachment/bucket-rental
    if (first === "attachment" && second) {
      return { type: "attachment", category: second, isLafayetteSEO: true };
    }

    // Seasonal pages: seasonal/hurricane-preparation-equipment-rental
    if (first === "seasonal" && second) {
      return { type: "seasonal", category: second, isLafayetteSEO: true };
    }

    // Comparison pages: compare/excavator-vs-backhoe-rental
    if (first === "compare" && second) {
      return { type: "compare", category: second, isLafayetteSEO: true };
    }

    // Pricing pages: pricing/excavator-rental-cost
    if (first === "pricing" && second) {
      return { type: "pricing", category: second, isLafayetteSEO: true };
    }

    // Guide pages: guide/how-to-rent-excavator
    if (first === "guide" && second) {
      return { type: "guide", category: second, isLafayetteSEO: true };
    }
  }

  return null;
}

// Generate metadata based on URL type
function generateSEOMetadata(
  type: string,
  category: string
): {
  title: string;
  description: string;
  keywords: string[];
} {
  const baseTitle = "Lafayette Equipment Rentals";
  const location = "Lafayette, LA";

  switch (type) {
    case "equipment":
      const equipment = category.replace(/-/g, " ");
      return {
        title: `${
          equipment.charAt(0).toUpperCase() + equipment.slice(1)
        } Rental ${location} | ${baseTitle}`,
        description: `Rent ${equipment} equipment in ${location}. Daily, weekly, and monthly rates available. Fast delivery and pickup. Call for availability and pricing.`,
        keywords: [
          equipment,
          "rental",
          "Lafayette",
          "Louisiana",
          "construction equipment",
        ],
      };

    case "service":
      const service = category.replace(/-/g, " ");
      return {
        title: `${
          service.charAt(0).toUpperCase() + service.slice(1)
        } Equipment Rental ${location} | ${baseTitle}`,
        description: `${service} equipment rental services in ${location}. Emergency rentals, same-day delivery, flexible terms. Professional equipment for any project.`,
        keywords: [service, "equipment rental", "Lafayette", "Louisiana"],
      };

    case "brand":
      const brand = category.split("-")[0];
      return {
        title: `${
          brand.charAt(0).toUpperCase() + brand.slice(1)
        } Equipment Rental ${location} | ${baseTitle}`,
        description: `Rent ${brand} construction equipment in ${location}. Authorized dealer with full fleet of ${brand} machines. Competitive rates and expert service.`,
        keywords: [
          brand,
          "equipment rental",
          "Lafayette",
          "Louisiana",
          "construction",
        ],
      };

    case "industry":
      const industry = category.split("-")[0];
      return {
        title: `${
          industry.charAt(0).toUpperCase() + industry.slice(1)
        } Equipment Rental ${location} | ${baseTitle}`,
        description: `Specialized ${industry} equipment rental in ${location}. Complete solutions for ${industry} projects. Professional grade equipment and support.`,
        keywords: [industry, "equipment", "rental", "Lafayette", "Louisiana"],
      };

    case "project":
      const project = category.replace(/-/g, " ");
      return {
        title: `${
          project.charAt(0).toUpperCase() + project.slice(1)
        } Equipment ${location} | ${baseTitle}`,
        description: `Equipment rental for ${project} projects in ${location}. Complete equipment packages, expert advice, and competitive pricing.`,
        keywords: [project, "equipment rental", "Lafayette", "project"],
      };

    default:
      return {
        title: `Equipment Rental ${location} | ${baseTitle}`,
        description: `Professional equipment rental services in ${location}. Construction, industrial, and specialty equipment. Daily, weekly, and monthly rates.`,
        keywords: [
          "equipment rental",
          "Lafayette",
          "Louisiana",
          "construction",
        ],
      };
  }
}

// Render Lafayette SEO page content
async function renderLafayetteSEOPage(
  type: string,
  category: string,
  locale: string
) {
  // Determine search term based on URL type
  let searchTerm = "";
  let pageTitle = "";
  let pageDescription = "";

  switch (type) {
    case "equipment":
      searchTerm = category || "";
      pageTitle = `${category
        ?.replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())} Rental in Lafayette, LA`;
      pageDescription = `Browse our selection of ${category?.replace(
        /-/g,
        " "
      )} equipment available for rent in Lafayette, Louisiana.`;
      break;

    case "service":
      const [serviceType, ...equipmentParts] = (category || "").split("-");
      searchTerm = equipmentParts.join(" ").replace(/rental/g, "");
      pageTitle = `${serviceType?.replace(/\b\w/g, (l) =>
        l.toUpperCase()
      )} ${equipmentParts
        .join(" ")
        .replace(/\b\w/g, (l) => l.toUpperCase())} Rental in Lafayette, LA`;
      pageDescription = `${serviceType} rental options for ${equipmentParts.join(
        " "
      )} equipment in Lafayette, Louisiana.`;
      break;

    case "brand":
      const brandParts = (category || "").split("-");
      searchTerm = brandParts[0]; // Just search for the brand
      pageTitle = `${brandParts[0]?.replace(/\b\w/g, (l) =>
        l.toUpperCase()
      )} Equipment Rental in Lafayette, LA`;
      pageDescription = `Rent ${brandParts[0]} construction equipment in Lafayette, Louisiana.`;
      break;

    case "industry":
      const [industryType, ...equipmentType] = (category || "").split("-");
      searchTerm = equipmentType.join(" ").replace(/rental/g, "");
      pageTitle = `${industryType?.replace(/\b\w/g, (l) =>
        l.toUpperCase()
      )} Equipment Rental in Lafayette, LA`;
      pageDescription = `Equipment rental solutions for the ${industryType} industry in Lafayette, Louisiana.`;
      break;

    default:
      searchTerm = "";
      pageTitle = "Equipment Rental in Lafayette, LA";
      pageDescription =
        "Browse our complete selection of rental equipment in Lafayette, Louisiana.";
  }

  // Fetch global Buy-It-Now machines, exclude those already in Lafayette radius,
  // then re-map location to Lafayette and apply optional term filter
  const { machines: globalMachines } = await getBuyItNowEverywheresMachines();
  const filteredGlobal = filterOutRadiusMachines(globalMachines);
  const processedMachinesAll = processGlobalBuyItNowMachines(filteredGlobal);
  const processedMachines = searchTerm
    ? processedMachinesAll.filter(
        (m) =>
          (m.make || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (m.model || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (m.primaryType || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (m.displayName || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : processedMachinesAll;

  return {
    pageTitle,
    pageDescription,
    processedMachines,
    searchTerm,
  };
}

export async function generateMetadata({
  params,
}: CatchAllPageProps): Promise<Metadata> {
  const { locale, slug } = params;
  const baseUrl = "https://www.lafayetteequipmentrental.com";

  // Check if this is a Lafayette SEO URL
  const parsed = parseSEOUrl(slug);
  if (parsed?.isLafayetteSEO) {
    const metadata = generateSEOMetadata(parsed.type, parsed.category || "");
    
    // Generate the canonical URL (always use English version as canonical)
    const canonicalPath = `/en/equipment-rental/${slug.join("/")}`;
    
    // Generate alternate language URLs
    const languages = {
      "en": `${baseUrl}/en/equipment-rental/${slug.join("/")}`,
      "es": `${baseUrl}/es/equipment-rental/${slug.join("/")}`,
      "x-default": `${baseUrl}/en/equipment-rental/${slug.join("/")}` // Default to English
    };
    
    return {
      title: metadata.title,
      description: metadata.description,
      keywords: metadata.keywords.join(", "),
      openGraph: {
        title: metadata.title,
        description: metadata.description,
        locale: locale === "es" ? "es_ES" : "en_US",
        siteName: "Lafayette Equipment Rentals",
        type: "website",
        url: `${baseUrl}/${locale}/equipment-rental/${slug.join("/")}`,
      },
      alternates: {
        canonical: `${baseUrl}${canonicalPath}`,
        languages: languages,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
    };
  }

  // Generate metadata for other patterns (existing logic)
  let title = "Equipment Rental";
  let description = "Browse our equipment rental inventory";

  if (slug.length === 1 && slug[0].includes("-rental-")) {
    const parts = slug[0].split("-rental-");
    const equipmentType = parts[0].replace(/-/g, " ");
    const location = parts[1]?.replace(/-/g, " ") || "Lafayette";

    title = `${equipmentType} Rental in ${location} | Lafayette Equipment Rentals`;
    description = `Find the best ${equipmentType} rentals in ${location}. Wide selection available with competitive rates.`;
  }

  return {
    title,
    description,
    robots: {
      index: false, // Don't index redirect pages
      follow: true,
    },
  };
}

// This catch-all route handles various URL patterns for flexibility and SEO
export default async function EquipmentCatchAllPage({
  params,
}: CatchAllPageProps) {
  const { locale, slug } = params;

  // First, check if this is a Lafayette SEO URL that should be rendered
  const parsed = parseSEOUrl(slug);
  if (parsed?.isLafayetteSEO) {
    // Render the Lafayette SEO page
    const { pageTitle, pageDescription, processedMachines, searchTerm } =
      await renderLafayetteSEOPage(parsed.type, parsed.category || "", locale);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{pageTitle}</h1>
          <p className="text-lg text-gray-600">{pageDescription}</p>

          {/* Add location-specific content */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Serving Lafayette and surrounding areas:</strong>{" "}
              Broussard, Youngsville, New Iberia, Abbeville, Crowley, Opelousas,
              and all of Acadiana. Fast delivery within our 50-mile service
              radius.
            </p>
            <p className="text-sm text-gray-700 mt-2">
              📍 2865 Ambassador Caffery Pkwy, Ste 135, Lafayette, LA 70506 | 📞
              Call for availability: (337) 545-2935
            </p>
          </div>
        </div>

        {/* Machine Grid with Lafayette-filtered results */}
        <Suspense fallback={<MachineGridSkeleton showFilters={true} />}>
          <MachineGrid
            machines={processedMachines}
            fetchError={null}
            initialSearchQuery={searchTerm}
            showFilters={true}
          />
        </Suspense>

        {/* SEO Content Block */}
        <div className="mt-12 prose max-w-none">
          <h2 className="text-2xl font-bold mb-4">
            Why Choose Lafayette Equipment Rentals?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold">Local Expertise</h3>
              <p className="text-gray-600">
                Serving Lafayette and Acadiana for over 20 years with the
                equipment and knowledge you need for successful projects.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Competitive Rates</h3>
              <p className="text-gray-600">
                Daily, weekly, and monthly rental options with the best prices
                in Lafayette. Volume discounts available.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Fast Delivery</h3>
              <p className="text-gray-600">
                Same-day delivery available throughout Lafayette Parish.
                Emergency rental service 24/7 for urgent needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EXISTING REDIRECT PATTERNS - Handle other URL patterns
  // Pattern: [equipment-type]-rental-[city]-[state]
  // Example: excavator-rental-lafayette-la
  if (slug.length === 1 && slug[0].includes("-rental-")) {
    const parts = slug[0].split("-rental-");
    const equipmentType = parts[0];
    const location = parts[1];

    // Redirect to the proper type route
    redirect(`/${locale}/equipment-rental/type/${equipmentType}`);
  }

  // Pattern: [make]-[model]-rental
  // Example: caterpillar-320-rental
  if (slug.length === 1 && slug[0].endsWith("-rental")) {
    const withoutRental = slug[0].replace("-rental", "");
    const parts = withoutRental.split("-");

    if (parts.length >= 2) {
      // Assume first part is make, rest is model
      const make = parts[0];
      const model = parts.slice(1).join("-");
      redirect(`/${locale}/equipment-rental/make/${make}/${model}`);
    }
  }

  // Pattern: [make]/[model]/rental-[city]
  // Example: caterpillar/320/rental-lafayette
  if (slug.length === 3 && slug[2].startsWith("rental-")) {
    const make = slug[0];
    const model = slug[1];
    const city = slug[2].replace("rental-", "");
    redirect(`/${locale}/equipment-rental/make/${make}/${model}/${city}-la`);
  }

  // Pattern: [type]/[city]/[state]
  // Example: excavator/lafayette/la
  if (slug.length === 3) {
    const type = slug[0];
    const city = slug[1];
    const state = slug[2];
    redirect(`/${locale}/equipment-rental/type/${type}/${city}-${state}`);
  }

  // Pattern: [type]-equipment-[city]
  // Example: excavator-equipment-lafayette
  if (slug.length === 1 && slug[0].includes("-equipment-")) {
    const parts = slug[0].split("-equipment-");
    const type = parts[0];
    const city = parts[1];
    redirect(`/${locale}/equipment-rental/type/${type}/${city}-la`);
  }

  // If no pattern matches, show 404
  notFound();
}
