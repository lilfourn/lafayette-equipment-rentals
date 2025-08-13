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

interface BrandPageProps {
  params: {
    locale: string;
    brand: string;
  };
}

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const { locale, brand } = params;
  const baseUrl = "https://www.lafayetteequipmentrental.com";
  
  // Clean up brand name for display
  const brandName = brand.replace(/-/g, " ");
  const brandTitle = brandName.charAt(0).toUpperCase() + brandName.slice(1);
  
  const title = `${brandTitle} Equipment Rental Lafayette, LA | Lafayette Equipment Rentals`;
  const description = `Rent ${brandTitle} construction equipment in Lafayette, Louisiana. Authorized dealer with full fleet of ${brandTitle} machines. Competitive rates and expert service.`;
  
  // Generate canonical and alternate URLs
  const canonicalPath = `/en/equipment-rental/brand/${brand}`;
  const languages = {
    "en": `${baseUrl}/en/equipment-rental/brand/${brand}`,
    "es": `${baseUrl}/es/equipment-rental/brand/${brand}`,
    "x-default": `${baseUrl}/en/equipment-rental/brand/${brand}`
  };
  
  return {
    title,
    description,
    keywords: [
      `${brandTitle} equipment rental`,
      "Lafayette Louisiana",
      "construction equipment",
      `${brandTitle} rental`,
      "heavy equipment",
    ].join(", "),
    openGraph: {
      title,
      description,
      locale: locale === "es" ? "es_ES" : "en_US",
      siteName: "Lafayette Equipment Rentals",
      type: "website",
      url: `${baseUrl}/${locale}/equipment-rental/brand/${brand}`,
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

export default async function BrandPage({ params }: BrandPageProps) {
  const { brand } = params;
  
  // Clean up brand name for display and search
  const brandName = brand.replace(/-/g, " ");
  const brandTitle = brandName.charAt(0).toUpperCase() + brandName.slice(1);
  
  // Fetch global Buy-It-Now machines and filter by brand
  const { machines: globalMachines } = await getBuyItNowEverywheresMachines();
  const filteredGlobal = filterOutRadiusMachines(globalMachines);
  const processedMachinesAll = processGlobalBuyItNowMachines(filteredGlobal);
  
  // Filter machines by brand
  const brandMachines = processedMachinesAll.filter(
    (m) => (m.make || "").toLowerCase().includes(brandName.toLowerCase())
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {brandTitle} Equipment Rental in Lafayette, LA
        </h1>
        <p className="text-lg text-gray-600">
          Browse our selection of {brandTitle} equipment available for rent in Lafayette, Louisiana.
        </p>
        
        {/* Location-specific content */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Authorized {brandTitle} Rental Dealer:</strong> We maintain a 
            comprehensive fleet of {brandTitle} equipment, serviced by certified technicians.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            📍 2865 Ambassador Caffery Pkwy, Ste 135, Lafayette, LA 70506 | 
            📞 Call for {brandTitle} availability: (337) 545-2935
          </p>
        </div>
      </div>
      
      {/* Machine Grid with brand-filtered results */}
      <Suspense fallback={<MachineGridSkeleton showFilters={true} />}>
        <MachineGrid
          machines={brandMachines}
          fetchError={null}
          initialSearchQuery={brandName}
          showFilters={true}
        />
      </Suspense>
      
      {/* SEO Content Block */}
      <div className="mt-12 prose max-w-none">
        <h2 className="text-2xl font-bold mb-4">
          Why Rent {brandTitle} Equipment from Lafayette Equipment Rentals?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold">Certified Service</h3>
            <p className="text-gray-600">
              Our {brandTitle} equipment is maintained by certified technicians 
              to ensure optimal performance and reliability.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Full Fleet Available</h3>
            <p className="text-gray-600">
              From compact machines to heavy-duty equipment, we have the right 
              {brandTitle} model for your project.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Expert Support</h3>
            <p className="text-gray-600">
              Our team knows {brandTitle} equipment inside and out. Get expert 
              advice on the best machine for your needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}