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

interface ServicePageProps {
  params: {
    locale: string;
    service: string;
  };
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { locale, service } = params;
  const baseUrl = "https://www.lafayetteequipmentrental.com";
  
  // Parse service type (e.g., "daily-excavator-rental" -> "Daily Excavator Rental")
  const serviceName = service.replace(/-/g, " ").replace(/rental$/i, "");
  const serviceTitle = serviceName
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  const title = `${serviceTitle} Equipment Rental Lafayette, LA | Lafayette Equipment Rentals`;
  const description = `${serviceTitle} equipment rental services in Lafayette, Louisiana. Emergency rentals, same-day delivery, flexible terms. Professional equipment for any project.`;
  
  // Generate canonical and alternate URLs
  const canonicalPath = `/en/equipment-rental/service/${service}`;
  const languages = {
    "en": `${baseUrl}/en/equipment-rental/service/${service}`,
    "es": `${baseUrl}/es/equipment-rental/service/${service}`,
    "x-default": `${baseUrl}/en/equipment-rental/service/${service}`
  };
  
  return {
    title,
    description,
    keywords: [
      `${serviceTitle} rental`,
      "Lafayette Louisiana",
      "equipment rental service",
      "construction equipment",
      service.includes("daily") ? "daily rental" : "",
      service.includes("weekly") ? "weekly rental" : "",
      service.includes("emergency") ? "emergency rental" : "",
    ].filter(Boolean).join(", "),
    openGraph: {
      title,
      description,
      locale: locale === "es" ? "es_ES" : "en_US",
      siteName: "Lafayette Equipment Rentals",
      type: "website",
      url: `${baseUrl}/${locale}/equipment-rental/service/${service}`,
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

export default async function ServicePage({ params }: ServicePageProps) {
  const { service } = params;
  
  // Parse service and equipment type
  const serviceParts = service.split("-");
  let serviceType = "";
  let equipmentType = "";
  
  if (serviceParts[0] === "daily" || serviceParts[0] === "weekly" || serviceParts[0] === "monthly") {
    serviceType = serviceParts[0];
    equipmentType = serviceParts.slice(1).join(" ").replace(/rental$/i, "").trim();
  } else if (serviceParts[0] === "emergency" || serviceParts[0] === "overnight") {
    serviceType = serviceParts[0];
    equipmentType = serviceParts.slice(1).join(" ").replace(/rental$/i, "").trim();
  } else {
    equipmentType = service.replace(/-/g, " ").replace(/rental$/i, "").trim();
  }
  
  const serviceTitle = serviceType 
    ? `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} ${equipmentType.charAt(0).toUpperCase() + equipmentType.slice(1)}`
    : equipmentType.charAt(0).toUpperCase() + equipmentType.slice(1);
  
  // Fetch global Buy-It-Now machines and filter by equipment type
  const { machines: globalMachines } = await getBuyItNowEverywheresMachines();
  const filteredGlobal = filterOutRadiusMachines(globalMachines);
  const processedMachinesAll = processGlobalBuyItNowMachines(filteredGlobal);
  
  // Filter machines by equipment type
  const serviceMachines = equipmentType
    ? processedMachinesAll.filter(
        (m) =>
          (m.primaryType || "").toLowerCase().includes(equipmentType.toLowerCase()) ||
          (m.displayName || "").toLowerCase().includes(equipmentType.toLowerCase())
      )
    : processedMachinesAll;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {serviceTitle} Rental Service in Lafayette, LA
        </h1>
        <p className="text-lg text-gray-600">
          Professional {serviceTitle.toLowerCase()} rental services in Lafayette, Louisiana. 
          {serviceType === "emergency" && " Available 24/7 for urgent needs."}
          {serviceType === "daily" && " Flexible daily rental options with same-day delivery."}
          {serviceType === "weekly" && " Cost-effective weekly rates for longer projects."}
          {serviceType === "monthly" && " Best value monthly rental packages available."}
        </p>
        
        {/* Service-specific content */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          {serviceType === "emergency" && (
            <>
              <p className="text-sm text-gray-700">
                <strong>24/7 Emergency Service:</strong> Equipment breakdowns don't wait. 
                Neither do we. Call us anytime for emergency equipment rental.
              </p>
              <p className="text-sm text-gray-700 mt-2">
                🚨 Emergency Hotline: (337) 545-2935 | Response time: Within 2 hours
              </p>
            </>
          )}
          {serviceType === "daily" && (
            <>
              <p className="text-sm text-gray-700">
                <strong>Daily Rental Benefits:</strong> Perfect for short-term projects. 
                No long-term commitments. Same-day delivery available.
              </p>
              <p className="text-sm text-gray-700 mt-2">
                📅 Minimum rental: 1 day | Extensions available | Weekend rates apply
              </p>
            </>
          )}
          {serviceType === "weekly" && (
            <>
              <p className="text-sm text-gray-700">
                <strong>Weekly Rental Savings:</strong> Save up to 30% compared to daily rates. 
                Ideal for week-long projects and construction jobs.
              </p>
              <p className="text-sm text-gray-700 mt-2">
                💰 7-day rental period | Discounted rates | Free delivery included
              </p>
            </>
          )}
          {serviceType === "monthly" && (
            <>
              <p className="text-sm text-gray-700">
                <strong>Monthly Rental Value:</strong> Maximum savings for long-term projects. 
                Includes maintenance and service support.
              </p>
              <p className="text-sm text-gray-700 mt-2">
                📆 28-day rental period | Best rates | Priority service included
              </p>
            </>
          )}
          {!serviceType && (
            <p className="text-sm text-gray-700">
              <strong>Flexible Rental Options:</strong> Daily, weekly, and monthly rates available. 
              Call us to discuss the best rental term for your project needs.
            </p>
          )}
        </div>
      </div>
      
      {/* Machine Grid with service-filtered results */}
      <Suspense fallback={<MachineGridSkeleton showFilters={true} />}>
        <MachineGrid
          machines={serviceMachines}
          fetchError={null}
          initialSearchQuery={equipmentType}
          showFilters={true}
        />
      </Suspense>
      
      {/* SEO Content Block */}
      <div className="mt-12 prose max-w-none">
        <h2 className="text-2xl font-bold mb-4">
          Our Rental Service Advantages
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold">Flexible Terms</h3>
            <p className="text-gray-600">
              From hourly emergency rentals to long-term leases, we offer 
              rental terms that match your project timeline and budget.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Fast Delivery</h3>
            <p className="text-gray-600">
              Same-day delivery throughout Lafayette Parish. Emergency delivery 
              available 24/7 within our 50-mile service radius.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Full Support</h3>
            <p className="text-gray-600">
              Every rental includes operator manuals, safety equipment, and 
              24/7 phone support from our expert team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}