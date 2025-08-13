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

interface ProjectPageProps {
  params: {
    locale: string;
    project: string;
  };
}

// Project-specific equipment recommendations
const projectEquipmentMap: Record<string, string[]> = {
  "home-renovation": ["mini-excavator", "skid-steer", "dumpster", "scaffold", "generator"],
  "land-clearing": ["bulldozer", "excavator", "chipper", "stump-grinder", "loader"],
  "pool-installation": ["mini-excavator", "skid-steer", "compactor", "pump"],
  "driveway-construction": ["excavator", "roller", "paver", "compactor", "skid-steer"],
  "foundation-work": ["excavator", "compactor", "concrete-mixer", "pump", "generator"],
  "demolition": ["excavator", "bulldozer", "dumpster", "jackhammer", "loader"],
  "landscaping": ["mini-excavator", "skid-steer", "trencher", "auger", "chipper"],
  "drainage": ["excavator", "trencher", "pump", "compactor", "pipe-layer"],
};

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { locale, project } = params;
  const baseUrl = "https://www.lafayetteequipmentrental.com";
  
  // Parse project name
  const projectName = project.replace(/-/g, " ").replace(/equipment.*$/, "").trim();
  const projectTitle = projectName
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  const title = `${projectTitle} Equipment Rental Lafayette, LA | Lafayette Equipment Rentals`;
  const description = `Equipment rental for ${projectTitle.toLowerCase()} projects in Lafayette, Louisiana. Complete equipment packages, expert advice, and competitive pricing for your project.`;
  
  // Generate canonical and alternate URLs
  const canonicalPath = `/en/equipment-rental/project/${project}`;
  const languages = {
    "en": `${baseUrl}/en/equipment-rental/project/${project}`,
    "es": `${baseUrl}/es/equipment-rental/project/${project}`,
    "x-default": `${baseUrl}/en/equipment-rental/project/${project}`
  };
  
  return {
    title,
    description,
    keywords: [
      `${projectTitle} equipment`,
      "Lafayette Louisiana",
      `${projectTitle} project`,
      "equipment rental",
      "project equipment",
    ].join(", "),
    openGraph: {
      title,
      description,
      locale: locale === "es" ? "es_ES" : "en_US",
      siteName: "Lafayette Equipment Rentals",
      type: "website",
      url: `${baseUrl}/${locale}/equipment-rental/project/${project}`,
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

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { project } = params;
  
  // Parse project type
  const projectKey = project.replace(/-equipment.*/, "");
  const projectName = project.replace(/-/g, " ").replace(/equipment.*$/, "").trim();
  const projectTitle = projectName
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  // Get project-specific equipment recommendations
  const recommendedEquipment = projectEquipmentMap[projectKey] || [];
  
  // Fetch global Buy-It-Now machines and filter by project-relevant equipment
  const { machines: globalMachines } = await getBuyItNowEverywheresMachines();
  const filteredGlobal = filterOutRadiusMachines(globalMachines);
  const processedMachinesAll = processGlobalBuyItNowMachines(filteredGlobal);
  
  // Filter machines by project-relevant equipment types
  const projectMachines = processedMachinesAll.filter((m) => {
    const machineType = (m.primaryType || "").toLowerCase();
    const displayName = (m.displayName || "").toLowerCase();
    return recommendedEquipment.some(
      type => machineType.includes(type) || displayName.includes(type)
    );
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {projectTitle} Equipment Rental in Lafayette, LA
        </h1>
        <p className="text-lg text-gray-600">
          Complete equipment solutions for {projectTitle.toLowerCase()} projects in Lafayette, Louisiana. 
          Get all the equipment you need from a single trusted source.
        </p>
        
        {/* Project-specific recommendations */}
        <div className="mt-6 p-4 bg-amber-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Recommended Equipment for {projectTitle}:</strong>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {recommendedEquipment.map(equipment => (
              <span 
                key={equipment}
                className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium"
              >
                {equipment.charAt(0).toUpperCase() + equipment.slice(1).replace(/-/g, " ")}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-700 mt-3">
            📞 Project consultation: (337) 545-2935 | Get expert advice for your {projectTitle.toLowerCase()} project
          </p>
        </div>
      </div>
      
      {/* Machine Grid with project-filtered results */}
      <Suspense fallback={<MachineGridSkeleton showFilters={true} />}>
        <MachineGrid
          machines={projectMachines}
          fetchError={null}
          initialSearchQuery=""
          showFilters={true}
        />
      </Suspense>
      
      {/* Project-specific tips and benefits */}
      <div className="mt-12 prose max-w-none">
        <h2 className="text-2xl font-bold mb-4">
          {projectTitle} Project Equipment Guide
        </h2>
        
        {/* Project-specific content based on type */}
        {projectKey === "home-renovation" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Essential Equipment</h3>
              <p className="text-gray-600">
                For home renovation projects, you'll typically need excavation equipment for 
                foundation work, material handling equipment, and power tools. Our mini-excavators 
                are perfect for tight spaces around homes.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Project Timeline</h3>
              <p className="text-gray-600">
                Most home renovation projects take 2-8 weeks. We offer flexible weekly rates 
                that save you money on longer rentals. Extensions are always available.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Homeowner Tips</h3>
              <p className="text-gray-600">
                First-time renters receive free equipment orientation. We'll show you how to 
                operate equipment safely and efficiently for your renovation project.
              </p>
            </div>
          </div>
        )}
        
        {projectKey === "land-clearing" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Clearing Equipment</h3>
              <p className="text-gray-600">
                Land clearing requires powerful equipment. Our bulldozers and excavators make 
                quick work of trees, stumps, and brush. Chippers help process debris efficiently.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Acreage Packages</h3>
              <p className="text-gray-600">
                We offer equipment packages based on acreage. Whether clearing 1 acre or 100, 
                we have the right combination of machines for efficient land clearing.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Debris Management</h3>
              <p className="text-gray-600">
                Don't forget debris removal equipment. We provide dumpsters, loaders, and 
                trucks to handle cleared material. Burn pile setup equipment also available.
              </p>
            </div>
          </div>
        )}
        
        {projectKey === "pool-installation" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Excavation Equipment</h3>
              <p className="text-gray-600">
                Pool installation requires precise excavation. Our mini-excavators provide 
                the control needed for accurate pool hole dimensions while minimizing yard damage.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Backfill & Compaction</h3>
              <p className="text-gray-600">
                Proper backfilling is critical for pool stability. We provide compactors and 
                material handling equipment to ensure proper soil compaction around your pool.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Access Solutions</h3>
              <p className="text-gray-600">
                Tight backyard access? Our compact equipment can fit through gates as narrow 
                as 36 inches. We'll help you choose equipment that fits your property.
              </p>
            </div>
          </div>
        )}
        
        {!["home-renovation", "land-clearing", "pool-installation"].includes(projectKey) && (
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold">Project Planning</h3>
              <p className="text-gray-600">
                Our experts help you select the right equipment combination for your 
                {projectTitle.toLowerCase()} project, ensuring efficiency and cost-effectiveness.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Package Deals</h3>
              <p className="text-gray-600">
                Save money with project-specific equipment packages. Bundle multiple 
                machines for better rates on your {projectTitle.toLowerCase()} project.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Expert Support</h3>
              <p className="text-gray-600">
                Get guidance from professionals who understand {projectTitle.toLowerCase()} 
                requirements. We'll help ensure project success from start to finish.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}