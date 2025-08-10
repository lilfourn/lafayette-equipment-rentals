import type { Machine } from "@/components/machine-card";
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
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// Lazy load heavy components
const MachineImageGallery = dynamic(
  () => import("@/components/machine-image-gallery"),
  {
    loading: () => (
      <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
    ),
    ssr: true,
  }
);

const MachineDetailBooking = dynamic(
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

  if (imageUrls.length === 0) {
    const fallbackUrl = `/placeholder.svg?width=800&height=600&query=${encodeURIComponent(
      machine.primaryType || "equipment"
    )}`;
    imageUrls.push(fallbackUrl);
  }

  return imageUrls;
}

// Helper function to create title
function createMachineTitle(machine: Machine): string {
  // Create title from year, make, model
  const titleParts = [machine.year, machine.make, machine.model].filter(
    Boolean
  );
  if (titleParts.length > 0) {
    return titleParts.join(" ");
  } else if (machine.displayName) {
    return machine.displayName;
  }
  return "Unnamed Machine";
}

interface CityMachinePageProps {
  params: Promise<{
    locale: string;
    city: string;
    machineId: string;
  }>;
}

async function getMachineDetails(machineId: string): Promise<Machine | null> {
  const apiKey = process.env.RUBBL_API_KEY;
  if (!apiKey) {
    console.error("RUBBL_API_KEY is not set.");
    return null;
  }
  const apiUrl = `https://kimber-rubbl-search.search.windows.net/indexes/machines/docs/${machineId}?api-version=2020-06-30`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      cache: "no-store",
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
      return null;
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
}: CityMachinePageProps): Promise<Metadata> {
  const { city, machineId } = await params;
  const machine = await getMachineDetails(machineId);

  if (!machine) {
    return {
      title: "Machine Not Found",
    };
  }

  const name = createMachineTitle(machine);

  // Format city name for display
  const [cityName, stateCode] = city.split("-");
  const formattedCity = cityName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Handle location display
  let location = `${formattedCity}, ${stateCode?.toUpperCase() || "LA"}`;

  // Get the first machine image for open graph
  const imageUrls = processMachineImages(machine);
  const ogImage = imageUrls.length > 0 ? imageUrls[0] : "/open-graph.png";

  const titleParts = [machine.year, machine.make, machine.model].filter(
    Boolean
  );
  const ogTitle =
    titleParts.length > 0
      ? `Check out this ${titleParts.join(" ")}`
      : `Check out this ${machine.displayName || "equipment"}`;

  return {
    title: `${name} for Rent in ${formattedCity} | ${LAFAYETTE_LOCATION.businessName}`,
    description: `Rent the ${name} ${
      machine.primaryType || ""
    } in ${location}. View details, specs, and availability.`,
    openGraph: {
      title: ogTitle,
      description: `Available for rent in ${location}`,
      images: [
        {
          url: ogImage,
          width: 800,
          height: 600,
        },
      ],
    },
  };
}

export default async function CityMachinePage({
  params,
}: CityMachinePageProps) {
  const { locale, city, machineId } = await params;
  const machine = await getMachineDetails(machineId);

  if (!machine) {
    notFound();
  }

  const name = createMachineTitle(machine);

  // Format city for display
  const [cityName, stateCode] = city.split("-");
  const formattedCity = cityName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Prepare data for client components
  const imageUrls = processMachineImages(machine);

  // Handle location display
  let locationDisplay = "";

  // For buy-it-now-only machines, always show Lafayette, LA
  if (machine.buyItNowOnly) {
    locationDisplay = `${LAFAYETTE_LOCATION.city}, ${LAFAYETTE_LOCATION.state}`;
  } else {
    // For regular machines, use actual location or formatted city from URL
    if (
      machine.location?.address?.city &&
      machine.location?.address?.stateProvince
    ) {
      locationDisplay = `${machine.location.address.city}, ${machine.location.address.stateProvince}`;
    } else if (machine.location?.city && machine.location?.state) {
      locationDisplay = `${machine.location.city}, ${machine.location.state}`;
    } else if (machine.location?.name) {
      locationDisplay = machine.location.name;
    } else {
      locationDisplay = `${formattedCity}, ${stateCode?.toUpperCase() || "LA"}`;
    }
  }

  // Helper function to get rental rates
  const getRentalRates = () => {
    let daily: number | undefined,
      weekly: number | undefined,
      monthly: number | undefined;

    if (typeof machine.rentalRate === "number") {
      monthly = machine.rentalRate;
    } else if (machine.rentalRate && typeof machine.rentalRate === "object") {
      daily = machine.rentalRate.daily;
      weekly = machine.rentalRate.weekly;
      monthly = machine.rentalRate.monthly;
    }

    if (machine.rateSchedules) {
      machine.rateSchedules.forEach((schedule) => {
        if (schedule.label === "DAY" && schedule.numDays === 1) {
          daily = schedule.cost;
        } else if (schedule.label === "WEEK" && schedule.numDays === 7) {
          weekly = schedule.cost;
        } else if (schedule.label?.includes("MOS") || schedule.numDays >= 28) {
          if (!monthly || schedule.numDays <= 31) {
            monthly = schedule.cost;
          }
        }
      });
    }

    daily = daily && daily > 0 ? daily : undefined;
    weekly = weekly && weekly > 0 ? weekly : undefined;
    monthly = monthly && monthly > 0 ? monthly : undefined;

    return { daily, weekly, monthly };
  };

  const { daily, weekly, monthly } = getRentalRates();

  // Check if machine should be marked as buy-it-now only
  const hasValidRentalRates = daily || weekly || monthly;
  const shouldBeBuyItNowOnly =
    !hasValidRentalRates &&
    machine.buyItNowEnabled &&
    machine.buyItNowPrice &&
    machine.buyItNowPrice > 0;

  // Update machine object to mark as buy-it-now only if needed
  const processedMachine =
    shouldBeBuyItNowOnly && !machine.buyItNowOnly
      ? { ...machine, buyItNowOnly: true }
      : machine;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href="/equipment-rental"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Equipment Rental
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div>
            <Suspense
              fallback={
                <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
              }
            >
              <MachineImageGallery
                imageUrls={imageUrls}
                machineName={name}
                primaryType={processedMachine.primaryType}
              />
            </Suspense>

            {/* Attachments Card - Show after images on mobile */}
            {processedMachine.relatedAttachments &&
              processedMachine.relatedAttachments.length > 0 && (
                <Card className="mt-6 lg:hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5 text-turquoise-600" />
                      Available Attachments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {processedMachine.relatedAttachments.map(
                        (attachment, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="font-medium">
                              {attachment.name ||
                                attachment.displayName ||
                                `Attachment ${index + 1}`}
                            </div>
                            {(attachment.make || attachment.model) && (
                              <div className="text-sm text-gray-600 mt-1">
                                {attachment.make} {attachment.model}
                              </div>
                            )}
                            {attachment.size && (
                              <div className="text-sm text-gray-500">
                                Size: {attachment.size}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      Attachments can be added when booking this equipment.
                    </p>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Right Column - Details & Booking */}
          <div className="space-y-6">
            {/* Title and Basic Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
              <p className="text-lg text-gray-600 mb-4">
                {processedMachine.primaryType}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {processedMachine.rpoEnabled &&
                  !processedMachine.buyItNowOnly && (
                    <Badge className="bg-turquoise-50 text-turquoise-700 border-turquoise-200">
                      Rent to Own Available
                    </Badge>
                  )}
                {processedMachine.buyItNowEnabled && (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    {processedMachine.buyItNowOnly
                      ? "Purchase Only"
                      : "Buy It Now Available"}
                  </Badge>
                )}
              </div>

              {/* Location and Hours */}
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{locationDisplay}</span>
                </div>
                {processedMachine.hours && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{processedMachine.hours.toLocaleString()} hours</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Card - Only show for rental-capable machines */}
            {!processedMachine.buyItNowOnly && (daily || weekly || monthly) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-turquoise-600" />
                    Rental Rates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
                    <div className="text-center rounded-lg border p-4 bg-gray-50">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                        Daily
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {daily ? `$${daily.toLocaleString()}` : "—"}
                      </p>
                    </div>
                    <div className="text-center rounded-lg border p-4 bg-gray-50">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                        Weekly
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {weekly ? `$${weekly.toLocaleString()}` : "—"}
                      </p>
                    </div>
                    <div className="text-center rounded-lg border p-4 bg-gray-50">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                        Monthly
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {monthly ? `$${monthly.toLocaleString()}` : "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Buy It Now Price - For purchase-only machines */}
            {processedMachine.buyItNowOnly &&
              processedMachine.buyItNowPrice && (
                <Card className="border-emerald-200 bg-emerald-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-emerald-700" />
                      Purchase Price
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-emerald-700">
                        ${processedMachine.buyItNowPrice.toLocaleString()}
                      </p>
                      <p className="text-sm text-emerald-600 mt-2">
                        Available for immediate purchase
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Booking Component */}
            <Suspense
              fallback={
                <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />
              }
            >
              <MachineDetailBooking
                machine={processedMachine}
                daily={daily}
                weekly={weekly}
                monthly={monthly}
              />
            </Suspense>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-turquoise-600" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Our equipment specialists are ready to assist you with
                  questions about this {processedMachine.primaryType}.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="tel:+13375452935" className="flex-1">
                    <Button className="w-full bg-turquoise-600 hover:bg-turquoise-700">
                      Call (337) 545-2935
                    </Button>
                  </a>
                  <Link
                    href={`/equipment-rental/machines/${processedMachine.id}/contact`}
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full">
                      Send Message
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Attachments Card - Desktop */}
            {processedMachine.relatedAttachments &&
              processedMachine.relatedAttachments.length > 0 && (
                <Card className="hidden lg:block">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5 text-turquoise-600" />
                      Available Attachments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {processedMachine.relatedAttachments.map(
                        (attachment, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="font-medium">
                              {attachment.name ||
                                attachment.displayName ||
                                `Attachment ${index + 1}`}
                            </div>
                            {(attachment.make || attachment.model) && (
                              <div className="text-sm text-gray-600 mt-1">
                                {attachment.make} {attachment.model}
                              </div>
                            )}
                            {attachment.size && (
                              <div className="text-sm text-gray-500">
                                Size: {attachment.size}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      Attachments can be added when booking this equipment.
                    </p>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
