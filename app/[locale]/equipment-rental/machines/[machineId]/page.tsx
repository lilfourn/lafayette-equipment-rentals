export const dynamic = 'force-dynamic';

import type { Machine } from "@/components/machine-card"; // Re-use the interface
import PageSkeleton from "@/components/skeletons/page-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LAFAYETTE_LOCATION,
  getMachineCoordinates,
  isWithinLafayetteRadius,
} from "@/lib/location-config";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  Clock,
  ClockIcon,
  DollarSign,
  Info,
  MapPin,
  MapPinIcon,
  Phone,
  Plus,
  Share2,
  Shield,
  Tag,
  Truck,
  Wrench,
  X,
} from "lucide-react";
import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// Lazy load heavy components
const MachineImageGallery = dynamicImport(
  () => import("@/components/machine-image-gallery"),
  {
    loading: () => (
      <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
    ),
    ssr: true,
  }
);

const MachineDetailBooking = dynamicImport(
  () => import("@/components/machine-detail-booking"),
  { ssr: true }
);

// Configuration
const MACHINE_IMAGE_BASE_URL =
  process.env.MACHINE_IMAGE_BASE_URL ||
  "https://kimberrubblstg.blob.core.windows.net";

// Helper function to process machine images
function processMachineImages(machine: Machine): string[] {
  let imageSourceArray: string[] | undefined = machine.thumbnails;
  if (!imageSourceArray || imageSourceArray.length === 0) {
    imageSourceArray = machine.images;
  }

  const imageUrls =
    (imageSourceArray
      ?.map((pathFragment) => {
        if (pathFragment && typeof pathFragment === "string") {
          if (
            pathFragment.startsWith("http://") ||
            pathFragment.startsWith("https://")
          )
            return pathFragment;
          const correctedPathFragment = pathFragment.startsWith("/")
            ? pathFragment
            : `/${pathFragment}`;
          return `${MACHINE_IMAGE_BASE_URL}${correctedPathFragment}`;
        }
        return null;
      })
      .filter(Boolean) as string[]) || [];

  return imageUrls;
}

// Helper function to create a clean title from machine data
function createMachineTitle(machine: Machine): string {
  const parts = [machine.year, machine.make, machine.model].filter(Boolean);
  return parts.length > 0
    ? parts.join(" ")
    : machine.displayName || "Equipment";
}

interface MachineDetailsPageProps {
  params: {
    locale: string;
    machineId: string;
  };
}

async function getMachineDetails(machineId: string): Promise<Machine | null> {
  const apiKey = process.env.RUBBL_API_KEY;
  if (!apiKey) {
    console.error("RUBBL_API_KEY is not set.");
    return null;
  }
  // Attempt to use the direct document lookup endpoint.
  // Format: /indexes/{indexName}/docs/{documentKey}?api-version={apiVersion}
  const apiUrl = `https://kimber-rubbl-search.search.windows.net/indexes/machines/docs/${machineId}?api-version=2020-06-30`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      cache: "no-store", // Fetch fresh data
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Machine with ID ${machineId} not found. API status: 404`);
        return null;
      }
      const errorText = await response.text();
      console.error(
        `Rubbl API request for machine ${machineId} failed:`,
        response.status,
        errorText
      );
      return null; // Or throw an error to be caught by an error boundary
    }

    const data: Machine = await response.json();

    // Check if machine is outside Lafayette radius and mark as buy-it-now-only
    const coords = getMachineCoordinates(data);
    const isOutsideRadius = coords
      ? !isWithinLafayetteRadius(coords.lat, coords.lon)
      : false;

    // If machine is outside radius and has buy-it-now, mark as buy-it-now-only
    if (isOutsideRadius && data.buyItNowEnabled) {
      return {
        ...data,
        buyItNowOnly: true,
        location: {
          ...data.location,
          city: LAFAYETTE_LOCATION.city,
          state: LAFAYETTE_LOCATION.state,
          address: {
            ...data.location?.address,
            city: LAFAYETTE_LOCATION.city,
            stateProvince: LAFAYETTE_LOCATION.state,
          },
        },
      };
    }

    return data;
  } catch (error: any) {
    console.error(
      `Error fetching machine ${machineId} details from Rubbl API:`,
      error
    );
    return null;
  }
}

export async function generateMetadata({
  params,
}: MachineDetailsPageProps): Promise<Metadata> {
  const { machineId, locale } = await params;
  const machine = await getMachineDetails(machineId);
  const baseUrl = "https://www.lafayetteequipmentrental.com";

  if (!machine) {
    return {
      title: "Machine Not Found",
    };
  }

  const name = createMachineTitle(machine);

  // Handle location display with new API structure
  let location = "";
  if (
    machine.location?.address?.city &&
    machine.location?.address?.stateProvince
  ) {
    location = `${machine.location.address.city}, ${machine.location.address.stateProvince}`;
  } else if (machine.location?.city && machine.location?.state) {
    location = `${machine.location.city}, ${machine.location.state}`;
  } else if (machine.location?.name) {
    location = machine.location.name;
  } else {
    location = "our location";
  }

  // Get the first machine image for open graph
  const imageUrls = processMachineImages(machine);

  // Use first machine image or fallback to default
  const ogImage = imageUrls.length > 0 ? imageUrls[0] : "/open-graph.png";

  // Create "Check out this YEAR MAKE MODEL" format with proper spacing
  const titleParts = [machine.year, machine.make, machine.model].filter(
    Boolean
  );
  const ogTitle =
    titleParts.length > 0
      ? `Check out this ${titleParts.join(" ")}`
      : `Check out this ${machine.displayName || "equipment"}`;

  // Generate canonical URL (always use English version as canonical)
  const canonicalPath = `/en/equipment-rental/machines/${machineId}`;
  
  // Generate alternate language URLs
  const languages = {
    "en": `${baseUrl}/en/equipment-rental/machines/${machineId}`,
    "es": `${baseUrl}/es/equipment-rental/machines/${machineId}`,
    "x-default": `${baseUrl}/en/equipment-rental/machines/${machineId}`
  };

  return {
    title: `${name} for Rent | ${LAFAYETTE_LOCATION.businessName}`,
    description: `Rent the ${name} ${
      machine.primaryType || ""
    } in ${location}. View details, specs, and availability.`,
    openGraph: {
      title: ogTitle,
      description: `Rent the ${name} ${
        machine.primaryType || ""
      } in ${location}. View details, specs, and availability.`,
      locale: locale === "es" ? "es_ES" : "en_US",
      url: `${baseUrl}/${locale}/equipment-rental/machines/${machineId}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${name} for rent`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: `Rent the ${name} ${
        machine.primaryType || ""
      } in ${location}. View details, specs, and availability.`,
      images: [ogImage],
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

export default async function MachineDetailsPage({
  params,
}: MachineDetailsPageProps) {
  const { machineId } = await params;
  const machine = await getMachineDetails(machineId);

  if (!machine) {
    notFound(); // Triggers the not-found.tsx page
  }

  const imageUrls = processMachineImages(machine);

  if (imageUrls.length === 0) {
    imageUrls.push(
      `/placeholder.svg?width=800&height=600&query=${encodeURIComponent(
        machine.primaryType || "equipment"
      )}`
    );
  }

  const name = createMachineTitle(machine);

  // Handle location display with new API structure
  let locationDisplay = "";

  // For buy-it-now-only machines, always show Lafayette, LA
  if (machine.buyItNowOnly) {
    locationDisplay = `${LAFAYETTE_LOCATION.city}, ${LAFAYETTE_LOCATION.state}`;
  } else {
    // For regular machines, use actual location
    if (
      machine.location?.address?.city &&
      machine.location?.address?.stateProvince
    ) {
      locationDisplay = `${machine.location.address.city}, ${machine.location.address.stateProvince}`;
    } else if (machine.location?.city && machine.location?.state) {
      locationDisplay = `${machine.location.city}, ${machine.location.state}`;
    } else if (machine.location?.name) {
      locationDisplay = machine.location.name;
    }
  }

  // Helper function to get rental rates from the new structure
  const getRentalRates = () => {
    let daily: number | undefined,
      weekly: number | undefined,
      monthly: number | undefined;

    if (typeof machine.rentalRate === "number") {
      // If rentalRate is a single number, assume it's monthly
      monthly = machine.rentalRate;
    } else if (machine.rentalRate && typeof machine.rentalRate === "object") {
      daily = machine.rentalRate.daily;
      weekly = machine.rentalRate.weekly;
      monthly = machine.rentalRate.monthly;
    }

    // Try to get rates from rateSchedules if available
    if (machine.rateSchedules) {
      machine.rateSchedules.forEach((schedule) => {
        if (schedule.label === "DAY" && schedule.numDays === 1) {
          daily = schedule.cost;
        } else if (schedule.label === "WEEK" && schedule.numDays === 7) {
          weekly = schedule.cost;
        } else if (schedule.label.includes("MOS") || schedule.numDays >= 28) {
          if (!monthly || schedule.numDays <= 31) {
            monthly = schedule.cost;
          }
        }
      });
    }

    // Filter out invalid rates (negative numbers, zero, etc.)
    daily = daily && daily > 0 ? daily : undefined;
    weekly = weekly && weekly > 0 ? weekly : undefined;
    monthly = monthly && monthly > 0 ? monthly : undefined;

    return { daily, weekly, monthly };
  };

  const { daily, weekly, monthly } = getRentalRates();

  // Check if machine should be marked as buy-it-now only
  // If no valid rental rates exist but buy-it-now is available, treat as buy-it-now only
  const hasValidRentalRates = daily || weekly || monthly;
  const shouldBeBuyItNowOnly =
    !hasValidRentalRates &&
    machine.buyItNowEnabled &&
    machine.buyItNowPrice &&
    machine.buyItNowPrice > 0;

  // Update machine object to mark as buy-it-now only if needed
  if (shouldBeBuyItNowOnly && !machine.buyItNowOnly) {
    machine.buyItNowOnly = true;
  }

  // Description
  const description =
    (machine as any).description ||
    `${machine.year || ""} ${name} ${
      machine.primaryType || "equipment"
    }`.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Breadcrumb */}
      <section className="relative bg-gray-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                            45deg,
                            transparent,
                            transparent 35px,
                            rgba(255,255,255,.05) 35px,
                            rgba(255,255,255,.05) 70px
                        )`,
            }}
          ></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm mb-6 text-white/70">
            <Link
              href="/"
              className="hover:text-yellow-400 transition-colors font-semibold uppercase tracking-wide"
            >
              HOME
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href="/equipment-rental"
              className="hover:text-yellow-400 transition-colors font-semibold uppercase tracking-wide"
            >
              EQUIPMENT
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-yellow-400 font-bold uppercase tracking-wide">
              {machine.primaryType || "MACHINE"}
            </span>
          </nav>

          {/* Machine Title */}
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight uppercase">
              {name}
            </h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-1 w-20 bg-yellow-400"></div>
              <p className="text-xl text-white/90 font-bold">
                {machine.year && machine.primaryType
                  ? `${machine.year} • ${machine.primaryType}`
                  : machine.year
                  ? machine.year.toString()
                  : machine.primaryType || "Equipment"}
              </p>
            </div>
            {machine.buyItNowOnly && (
              <Badge className="text-sm px-4 py-2 bg-yellow-400 text-black font-bold uppercase">
                <Info className="mr-2 h-4 w-4" /> Purchase Only - Not Available
                For Rent
              </Badge>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Image Gallery and Details */}
          <div className="lg:col-span-2">
            <MachineImageGallery
              imageUrls={imageUrls}
              machineName={name}
              primaryType={machine.primaryType || "equipment"}
            />

            <Card className="mb-6 shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200">
                <CardTitle className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center">
                  <div className="w-1 h-8 bg-turquoise-500 mr-3"></div>
                  Machine Details
                </CardTitle>
                <p className="text-lg text-gray-600 mt-2">
                  {machine.year && machine.primaryType
                    ? `${machine.year} ${machine.primaryType}`
                    : machine.year
                    ? machine.year.toString()
                    : machine.primaryType || "N/A"}
                </p>
                {machine.buyItNowOnly && (
                  <div className="mt-3">
                    <Badge
                      variant="outline"
                      className="text-sm px-3 py-1 border-orange-300 text-orange-700 bg-orange-50"
                    >
                      <Info className="mr-2 h-4 w-4" /> Not Available For Rent -
                      Purchase Only
                    </Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4 py-6">
                {((machine.usage !== undefined && machine.usage > 0) ||
                  (machine.hours !== undefined && machine.hours > 0)) && (
                  <div className="flex items-center p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="bg-turquoise-100 p-3 rounded-lg mr-4">
                      <ClockIcon className="h-6 w-6 text-turquoise-600" />
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-gray-600 uppercase text-xs tracking-wider">
                        Machine Hours
                      </span>
                      <p className="text-gray-900 font-black text-xl mt-1">
                        {(machine.usage || machine.hours || 0).toLocaleString()}{" "}
                        {machine.usageLabel ||
                          machine.usageAbbreviation ||
                          "hrs"}
                      </p>
                    </div>
                  </div>
                )}
                {locationDisplay && (
                  <div className="flex items-center p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                      <MapPinIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-gray-600 uppercase text-xs tracking-wider">
                        Current Location
                      </span>
                      <p className="text-gray-900 font-black text-xl mt-1">
                        {locationDisplay}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mobile Rental Rates - Show on mobile */}
            <Card className="mb-6 block lg:hidden shadow-xl border-0">
              <CardHeader className="bg-white border-b-4 border-turquoise-500">
                <CardTitle className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                  {machine.buyItNowOnly ? "Purchase Options" : "Rental Rates"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MachineDetailBooking
                  machine={machine}
                  daily={daily}
                  weekly={weekly}
                  monthly={monthly}
                />
              </CardContent>
            </Card>

            <Card className="mb-6 shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200">
                <CardTitle className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center">
                  <div className="w-1 h-8 bg-yellow-400 mr-3"></div>
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent className="py-6">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {description}
                </p>
              </CardContent>
            </Card>

            {machine.relatedAttachments &&
              machine.relatedAttachments.length > 0 && (
                <Card className="mb-6 shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200">
                    <CardTitle className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center">
                      <div className="w-1 h-8 bg-turquoise-500 mr-3"></div>
                      Available Attachments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {machine.relatedAttachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="bg-turquoise-100 p-2 rounded mr-3">
                            <Wrench className="h-4 w-4 text-turquoise-600" />
                          </div>
                          <span className="text-gray-800 font-semibold">
                            {att.displayName ||
                              att.name ||
                              "Unnamed Attachment"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Rental-specific information - Only show for rental machines */}
            {!machine.buyItNowOnly && (
              <>
                <Card className="mb-6 shadow-xl border-0">
                  <CardHeader className="bg-white border-b-4 border-yellow-400">
                    <CardTitle className="text-xl font-black text-gray-900 uppercase tracking-tight">
                      Things to Know
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 py-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Truck className="h-5 w-5 text-yellow-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 mb-2 uppercase text-sm tracking-wide">
                          Transportation
                        </h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          We support both short and long hauls across state
                          lines. Transportation is not included in your rental
                          rate. Once an order is placed you will receive a quote
                          within 1 business day.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-turquoise-100 rounded-lg flex items-center justify-center">
                          <Clock className="h-5 w-5 text-turquoise-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 mb-2 uppercase text-sm tracking-wide">
                          Usage Limit
                        </h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          Equipment can be used for 160 hours per month
                          throughout the length of the rental. Total usage is
                          calculated cumulatively over the entire rental.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 mb-2 uppercase text-sm tracking-wide">
                          Overages
                        </h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          Any hours used over the 160-hour cumulative monthly
                          limit will be charged at the end of the rental and
                          will appear on your final statement.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-turquoise-100 rounded-lg flex items-center justify-center">
                          <Plus className="h-5 w-5 text-turquoise-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 mb-2 uppercase text-sm tracking-wide">
                          Extensions
                        </h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          You are free to extend a rental as needed.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <X className="h-5 w-5 text-red-500" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 mb-2 uppercase text-sm tracking-wide">
                          Cancellation
                        </h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          To receive a full refund, cancellations must be made
                          at least 24 hours before the first machine in the
                          order is picked up. Charges may apply for
                          cancellations made after this period.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 overflow-hidden">
                  <CardHeader className="bg-white border-b-4 border-turquoise-500">
                    <CardTitle className="flex items-center space-x-2 text-gray-900">
                      <div className="bg-turquoise-100 p-2 rounded-lg">
                        <Shield className="h-6 w-6 text-turquoise-600" />
                      </div>
                      <span className="font-black uppercase tracking-tight">
                        Always Included
                      </span>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1 font-semibold">
                      Lafayette Equipment Rental Managed Services
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Shield className="h-5 w-5 text-yellow-600" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 mb-2 uppercase text-sm tracking-wide">
                            Damage & Liability Coverage
                          </h4>
                          <ul className="text-gray-700 text-sm space-y-1">
                            <li>• $5,000 damage deductible per incident</li>
                            <li>
                              • Multiple 50-point machine inspections during the
                              rental
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-turquoise-100 rounded-lg flex items-center justify-center">
                            <Wrench className="h-5 w-5 text-turquoise-600" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 mb-2 uppercase text-sm tracking-wide">
                            Ongoing Maintenance
                          </h4>
                          <ul className="text-gray-700 text-sm space-y-1">
                            <li>
                              • Proactively scheduled preventative maintenance
                              every 250 hours
                            </li>
                            <li>
                              • Maintenance services coordinated by a dedicated
                              service manager
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-yellow-600" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 mb-2 uppercase text-sm tracking-wide">
                            Logistics & GPS
                          </h4>
                          <ul className="text-gray-700 text-sm space-y-1">
                            <li>
                              • Scheduled transportation and coordination for
                              all your rentals
                            </li>
                            <li>
                              • GPS location monitoring and hourly machine usage
                              tracking
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-turquoise-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-turquoise-600" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 mb-2 uppercase text-sm tracking-wide">
                            Service & Repair
                          </h4>
                          <ul className="text-gray-700 text-sm space-y-1">
                            <li>
                              • Reliable service pros on standby to resolve any
                              issues that arise
                            </li>
                            <li>
                              • Nationwide network of certified mechanics to
                              minimize downtime
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Right Column: Pricing and Actions - Hidden on mobile */}
          <div className="lg:col-span-1 hidden lg:block">
            <Card className="sticky top-36 z-40 shadow-2xl border-0 overflow-hidden">
              <CardHeader className="bg-white border-b-4 border-turquoise-500">
                <CardTitle className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                  {machine.buyItNowOnly ? "Purchase Options" : "Rental Rates"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MachineDetailBooking
                  machine={machine}
                  daily={daily}
                  weekly={weekly}
                  monthly={monthly}
                />
                <div className="pt-2">
                  <Link
                    href={`/equipment-rental/machines/${machine.id}/contact`}
                  >
                    <Button variant="outline" className="w-full">
                      Send Message
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
