"use client";

import type { Machine } from "@/components/machine-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getCachedValue, setCachedValue } from "@/lib/browser-cache";
import { ChevronRight, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useEffect, useState } from "react";

interface PopularEquipmentSectionProps {
  machines?: Machine[];
}

export const PopularEquipmentSection = memo(function PopularEquipmentSection({
  machines,
}: PopularEquipmentSectionProps) {
  const t = useTranslations();
  const router = useRouter();
  const [showAddedPopup, setShowAddedPopup] = useState(false);
  const [addedItemName, setAddedItemName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [clientMachines, setClientMachines] = useState<Machine[] | undefined>(
    machines
  );

  // Hydrate from local cache if server didn't provide machines
  useEffect(() => {
    if (machines && machines.length > 0) {
      // Keep a short cache so subsequent navigations feel instant
      setCachedValue<Machine[]>(
        "popular_rentals_home_v1",
        machines,
        30 * 60 * 1000
      );
      setClientMachines(machines);
      return;
    }
    const cached = getCachedValue<Machine[]>("popular_rentals_home_v1");
    if (cached && cached.length > 0) {
      setClientMachines(cached);
    }
  }, [machines]);

  // Use real machines if provided, otherwise use fallback
  const fallbackEquipment: Machine[] = [
    {
      id: "fallback-1",
      make: "JLG",
      model: "1930ES",
      displayName: "19 ft. Electric Scissor Lift",
      primaryType: "Scissor Lift",
      year: 2022,
      hours: 245,
      thumbnails: ["/category images/scissor_lift.png"],
      images: ["/category images/scissor_lift.png"],
      location: { city: "Lafayette", state: "LA" },
      rentalRate: { daily: 150, weekly: 600, monthly: 1800 },
    } as Machine,
    {
      id: "fallback-2",
      make: "CAT",
      model: "TL642",
      displayName: "5,000 lb. Telehandler",
      primaryType: "Telehandler",
      year: 2021,
      hours: 520,
      thumbnails: ["/category images/telehandler.png"],
      images: ["/category images/telehandler.png"],
      location: { city: "Lafayette", state: "LA" },
      rentalRate: { daily: 300, weekly: 1200, monthly: 3600 },
    } as Machine,
    {
      id: "fallback-3",
      make: "Genie",
      model: "AWP-30S",
      displayName: "30 ft. Personal Lift",
      primaryType: "Man Lift",
      year: 2023,
      hours: 125,
      thumbnails: ["/category images/man_lift.png"],
      images: ["/category images/man_lift.png"],
      location: { city: "Lafayette", state: "LA" },
      rentalRate: { daily: 125, weekly: 500, monthly: 1500 },
    } as Machine,
    {
      id: "fallback-4",
      make: "Toyota",
      model: "8FGU25",
      displayName: "5,000 lb. Forklift",
      primaryType: "Forklift",
      year: 2020,
      hours: 1850,
      thumbnails: ["/category images/telehandler.png"],
      images: ["/category images/telehandler.png"],
      location: { city: "Lafayette", state: "LA" },
      rentalRate: { daily: 200, weekly: 800, monthly: 2400 },
    } as Machine,
  ];

  const popularEquipment =
    clientMachines && clientMachines.length > 0
      ? clientMachines
      : fallbackEquipment;

  console.log("Popular equipment being displayed:", {
    count: popularEquipment.length,
    isUsingFallback: !machines || machines.length === 0,
    firstItem: popularEquipment[0]
      ? {
          id: popularEquipment[0].id,
          displayName: popularEquipment[0].displayName,
          thumbnails: popularEquipment[0].thumbnails,
        }
      : null,
  });

  const handleAddToCart = (machine: Machine) => {
    // Create cart item with the real machine data
    const cartItem = {
      machineId: machine.id,
      machineName:
        `${machine.make || ""} ${machine.model || ""}`.trim() ||
        machine.displayName ||
        "Equipment",
      machine: machine,
      selectedAttachments: [],
      quantity: 1,
    };

    console.log("Adding machine to cart:", cartItem);
    addItemToCart(cartItem, cartItem.machineName);
  };

  const addItemToCart = (cartItem: any, itemName: string) => {
    if (typeof window !== "undefined") {
      try {
        const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

        // Check if item already exists
        const existingItemIndex = existingCart.findIndex(
          (item: any) => item.machineId === cartItem.machineId
        );

        if (existingItemIndex !== -1) {
          // Update quantity if item exists
          existingCart[existingItemIndex].quantity =
            (existingCart[existingItemIndex].quantity || 1) + 1;
        } else {
          // Add new item
          existingCart.push(cartItem);
        }

        localStorage.setItem("cart", JSON.stringify(existingCart));

        // Dispatch custom event to update cart count in header
        window.dispatchEvent(new CustomEvent("cartUpdated"));

        // Show success popup
        setAddedItemName(itemName);
        setShowAddedPopup(true);
      } catch (error) {
        console.error("Error adding to cart:", error);
        alert("Error adding machine to cart. Please try again.");
      }
    }
  };

  const handleGoToCheckout = () => {
    setShowAddedPopup(false);
    // Get current locale from pathname
    const currentPath = window.location.pathname;
    const localeMatch = currentPath.match(/^\/([a-z]{2})\//);
    const locale = localeMatch ? localeMatch[1] : "en";
    router.push(`/${locale}/equipment-rental/cart/checkout-lafayette-la`);
  };

  return (
    <>
      {/* Popular Equipment & Tool Rentals Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              {t("homepage.popularEquipment.category")}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {t("homepage.popularEquipment.title")}
            </h2>
          </div>

          {/* Equipment Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {isLoading && (!popularEquipment || popularEquipment.length === 0)
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-lg" />
                ))
              : popularEquipment.slice(0, 4).map((machine) => {
                  // Get the first image URL
                  const imageUrl =
                    machine.thumbnails?.[0] ||
                    machine.images?.[0] ||
                    "/placeholder.svg";

                  // Process the image URL to handle Azure Blob Storage paths
                  let processedImageUrl = imageUrl;
                  if (imageUrl.startsWith("http")) {
                    // Already a full URL
                    processedImageUrl = imageUrl;
                  } else if (
                    imageUrl.startsWith("/pubweb/") ||
                    imageUrl.startsWith("pubweb/")
                  ) {
                    // Azure Blob Storage path - need to prefix with base URL
                    const cleanPath = imageUrl.startsWith("/")
                      ? imageUrl.slice(1)
                      : imageUrl;
                    processedImageUrl = `https://kimberrubblstg.blob.core.windows.net/${cleanPath}`;
                  } else if (
                    imageUrl.startsWith("/category images/") ||
                    imageUrl === "/placeholder.svg"
                  ) {
                    // Local assets - keep as is
                    processedImageUrl = imageUrl;
                  } else {
                    // Other relative paths - prefix with Azure URL
                    processedImageUrl = `https://kimberrubblstg.blob.core.windows.net/${imageUrl}`;
                  }

                  console.log("Image URL processing:", {
                    original: imageUrl,
                    processed: processedImageUrl,
                    machineId: machine.id,
                  });

                  const machineName =
                    machine.displayName ||
                    `${machine.make || ""} ${machine.model || ""}`.trim() ||
                    machine.primaryType ||
                    "Equipment";

                  // Get rental rates
                  let daily: number | undefined,
                    weekly: number | undefined,
                    monthly: number | undefined;
                  if (typeof machine.rentalRate === "number") {
                    // If rentalRate is a single number, assume it's daily
                    daily = machine.rentalRate;
                  } else if (
                    machine.rentalRate &&
                    typeof machine.rentalRate === "object"
                  ) {
                    daily = machine.rentalRate.daily;
                    weekly = machine.rentalRate.weekly;
                    monthly = machine.rentalRate.monthly;
                  }

                  // Create description from available fields
                  const descriptionParts = [];
                  if (machine.year) descriptionParts.push(machine.year);
                  if (machine.hours) {
                    descriptionParts.push(
                      `${machine.hours.toLocaleString()} hours`
                    );
                  } else if (machine.usage) {
                    const usageLabel = machine.usageLabel || "miles";
                    descriptionParts.push(
                      `${machine.usage.toLocaleString()} ${usageLabel}`
                    );
                  }
                  const description =
                    descriptionParts.length > 0
                      ? descriptionParts.join(" • ")
                      : machine.primaryType || "Equipment";

                  return (
                    <div
                      key={machine.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="p-6 flex flex-col h-full">
                        {/* Equipment Type */}
                        <div className="mb-3">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {machine.primaryType || "Equipment"}
                          </span>
                        </div>

                        {/* Image */}
                        <div className="relative h-48 mb-4">
                          <Image
                            src={processedImageUrl}
                            alt={machineName}
                            fill
                            className="object-contain"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.svg";
                            }}
                          />
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 flex-grow">
                          {machineName}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-3">
                          {description}
                        </p>

                        {/* Rental Rates - More Prominent */}
                        {(daily || weekly || monthly) && (
                          <div className="bg-gradient-to-r from-green-50 to-turquoise-50 border border-green-200 rounded-lg p-3 mb-4">
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 text-center">
                              Rental Rates
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              {daily ? (
                                <div>
                                  <div className="text-lg font-bold text-gray-900">
                                    ${daily.toFixed(0)}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    per day
                                  </div>
                                </div>
                              ) : (
                                <div className="opacity-50">
                                  <div className="text-lg font-bold text-gray-400">
                                    --
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    per day
                                  </div>
                                </div>
                              )}
                              {weekly ? (
                                <div>
                                  <div className="text-lg font-bold text-gray-900">
                                    ${weekly.toFixed(0)}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    per week
                                  </div>
                                </div>
                              ) : (
                                <div className="opacity-50">
                                  <div className="text-lg font-bold text-gray-400">
                                    --
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    per week
                                  </div>
                                </div>
                              )}
                              {monthly ? (
                                <div>
                                  <div className="text-lg font-bold text-gray-900">
                                    ${monthly.toFixed(0)}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    per month
                                  </div>
                                </div>
                              ) : (
                                <div className="opacity-50">
                                  <div className="text-lg font-bold text-gray-400">
                                    --
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    per month
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Add to Cart Button */}
                        <Button
                          onClick={() => handleAddToCart(machine)}
                          className="w-full bg-turquoise-600 hover:bg-turquoise-700 text-white font-semibold py-3 cursor-pointer mt-auto"
                        >
                          {t("homepage.popularEquipment.addToCart")}
                        </Button>
                      </div>
                    </div>
                  );
                })}
          </div>

          {/* Browse All Link */}
          <div className="text-center">
            <Link
              href="/equipment-rental"
              className="inline-flex items-center gap-2 text-turquoise-600 hover:text-turquoise-700 font-semibold"
            >
              {t("homepage.popularEquipment.browseAll")}
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Success Popup Dialog */}
      <Dialog open={showAddedPopup} onOpenChange={setShowAddedPopup}>
        <DialogContent className="max-w-md bg-white border border-gray-200 shadow-lg text-center">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 mb-2">
              Added to cart successfully!
            </DialogTitle>
          </DialogHeader>
          <div className="mb-6 text-gray-700">
            {addedItemName} has been added to your cart.
          </div>
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => setShowAddedPopup(false)}
              className="flex-1"
            >
              Continue Shopping
            </Button>
            <Button
              className="flex-1 bg-turquoise-600 hover:bg-turquoise-700 text-white"
              onClick={handleGoToCheckout}
            >
              Go to Checkout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});
