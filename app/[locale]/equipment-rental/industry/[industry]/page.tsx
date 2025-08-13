import MachineGridSkeleton from "@/components/skeletons/machine-grid-skeleton";
import {
  filterOutRadiusMachines,
  getBuyItNowEverywheresMachines,
  processGlobalBuyItNowMachines,
} from "@/lib/global-machines";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import MachineGrid for lazy loading
const MachineGrid = dynamic(() => import("@/components/machine-grid"), {
  loading: () => <MachineGridSkeleton showFilters={true} />,
  ssr: true,
});

interface IndustryPageProps {
  params: {
    locale: string;
    industry: string;
  };
}

// Industry-specific equipment mappings
const industryEquipmentMap: Record<string, string[]> = {
  construction: ["excavator", "bulldozer", "crane", "loader", "compactor"],
  "oil-gas": ["generator", "pump", "compressor", "welder", "light-tower"],
  agricultural: ["tractor", "loader", "excavator", "forklift", "mower"],
  industrial: ["forklift", "scissor-lift", "boom-lift", "generator", "compressor"],
  landscaping: ["skid-steer", "mini-excavator", "loader", "chipper", "mower"],
  infrastructure: ["paver", "roller", "grader", "excavator", "loader"],
};

export async function generateMetadata({
  params,
}: IndustryPageProps): Promise<Metadata> {
  const { locale, industry } = params;
  const baseUrl = "https://www.lafayetteequipmentrental.com";
  
  // Parse industry name
  const industryName = industry.replace(/-/g, " ");
  const industryTitle = industryName
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  const title = `${industryTitle} Equipment Rental Lafayette, LA | Lafayette Equipment Rentals`;
  const description = `Specialized ${industryTitle.toLowerCase()} equipment rental in Lafayette, Louisiana. Complete solutions for ${industryTitle.toLowerCase()} projects. Professional grade equipment and support.`;
  
  // Generate canonical and alternate URLs
  const canonicalPath = `/en/equipment-rental/industry/${industry}`;
  const languages = {
    "en": `${baseUrl}/en/equipment-rental/industry/${industry}`,
    "es": `${baseUrl}/es/equipment-rental/industry/${industry}`,
    "x-default": `${baseUrl}/en/equipment-rental/industry/${industry}`
  };
  
  return {
    title,
    description,
    keywords: [
      `${industryTitle} equipment rental`,
      "Lafayette Louisiana",
      `${industryTitle} industry`,
      "specialized equipment",
      "professional rental",
    ].join(", "),
    openGraph: {
      title,
      description,
      locale: locale === "es" ? "es_ES" : "en_US",
      siteName: "Lafayette Equipment Rentals",
      type: "website",
      url: `${baseUrl}/${locale}/equipment-rental/industry/${industry}`,
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

export default async function IndustryPage({ params }: IndustryPageProps) {
  const { industry } = params;
  
  // Parse industry name
  const industryKey = industry.replace(/-equipment.*/, "");
  const industryName = industry.replace(/-/g, " ");
  const industryTitle = industryName
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  // Get industry-specific equipment types
  const equipmentTypes = industryEquipmentMap[industryKey] || [];
  
  // Fetch global Buy-It-Now machines and filter by industry-relevant equipment
  const { machines: globalMachines } = await getBuyItNowEverywheresMachines();
  const filteredGlobal = filterOutRadiusMachines(globalMachines);
  const processedMachinesAll = processGlobalBuyItNowMachines(filteredGlobal);
  
  // Filter machines by industry-relevant equipment types
  const industryMachines = processedMachinesAll.filter((m) => {
    const machineType = (m.primaryType || "").toLowerCase();
    const displayName = (m.displayName || "").toLowerCase();
    return equipmentTypes.some(
      type => machineType.includes(type) || displayName.includes(type)
    );
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {industryTitle} Equipment Rental in Lafayette, LA
        </h1>
        <p className="text-lg text-gray-600">
          Specialized equipment rental solutions for the {industryTitle.toLowerCase()} industry 
          in Lafayette, Louisiana. We understand your industry's unique requirements.
        </p>
        
        {/* Industry-specific content */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Industry Expertise:</strong> Serving {industryTitle.toLowerCase()} professionals 
            in Lafayette and Acadiana for over 20 years.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Recommended Equipment:</strong> {equipmentTypes.map(e => 
              e.charAt(0).toUpperCase() + e.slice(1).replace(/-/g, " ")
            ).join(", ")}
          </p>
          <p className="text-sm text-gray-700 mt-2">
            📞 Industry specialists available: (337) 545-2935
          </p>
        </div>
      </div>
      
      {/* Machine Grid with industry-filtered results */}
      <Suspense fallback={<MachineGridSkeleton showFilters={true} />}>
        <MachineGrid
          machines={industryMachines}
          fetchError={null}
          initialSearchQuery=""
          showFilters={true}
        />
      </Suspense>
      
      {/* Industry-specific benefits */}
      <div className="mt-12 prose max-w-none">
        <h2 className="text-2xl font-bold mb-4">
          Why {industryTitle} Professionals Choose Us
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {industryKey === "construction" && (
            <>
              <div>
                <h3 className="text-lg font-semibold">Job Site Delivery</h3>
                <p className="text-gray-600">
                  Direct delivery to construction sites throughout Lafayette Parish 
                  with flexible scheduling to match your project timeline.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Safety Certified</h3>
                <p className="text-gray-600">
                  All equipment meets OSHA standards. Safety equipment and 
                  operator training available upon request.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Project Packages</h3>
                <p className="text-gray-600">
                  Complete equipment packages for construction projects of 
                  any size. Bundle and save on multiple rentals.
                </p>
              </div>
            </>
          )}
          {industryKey === "oil-gas" && (
            <>
              <div>
                <h3 className="text-lg font-semibold">24/7 Availability</h3>
                <p className="text-gray-600">
                  Round-the-clock support for oil & gas operations. Emergency 
                  equipment delivery available anytime.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Certified Equipment</h3>
                <p className="text-gray-600">
                  Equipment meets all industry safety standards and certifications 
                  required for oil & gas operations.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Remote Support</h3>
                <p className="text-gray-600">
                  Delivery and support to remote locations throughout Louisiana. 
                  GPS tracking available on all equipment.
                </p>
              </div>
            </>
          )}
          {industryKey === "agricultural" && (
            <>
              <div>
                <h3 className="text-lg font-semibold">Seasonal Flexibility</h3>
                <p className="text-gray-600">
                  Flexible rental terms to match planting and harvest seasons. 
                  Long-term discounts available.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Farm-Ready Equipment</h3>
                <p className="text-gray-600">
                  Equipment configured for agricultural use with appropriate 
                  attachments and implements.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Rural Delivery</h3>
                <p className="text-gray-600">
                  Delivery to farms and rural locations throughout Acadiana. 
                  Familiar with agricultural site requirements.
                </p>
              </div>
            </>
          )}
          {!["construction", "oil-gas", "agricultural"].includes(industryKey) && (
            <>
              <div>
                <h3 className="text-lg font-semibold">Industry Knowledge</h3>
                <p className="text-gray-600">
                  Our team understands {industryTitle.toLowerCase()} requirements 
                  and can recommend the right equipment for your needs.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Flexible Solutions</h3>
                <p className="text-gray-600">
                  Customized rental packages designed for {industryTitle.toLowerCase()} 
                  projects with competitive industry pricing.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Priority Service</h3>
                <p className="text-gray-600">
                  Priority delivery and support for {industryTitle.toLowerCase()} 
                  professionals. Dedicated account management available.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}