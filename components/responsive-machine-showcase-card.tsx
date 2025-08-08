"use client";

import type { Machine } from "@/components/machine-card";
import { Button } from "@/components/ui/button";
import { getMachineDetailUrlWithoutLocale } from "@/lib/machine-url-helper";
import Image from "next/image";
import Link from "next/link";

export interface ResponsiveMachineShowcaseCardProps {
  machine: Machine;
  showRates?: boolean;
}

// A lightweight, responsive machine card optimized for dense grids and carousels.
// Shows a single image, essential metadata, and compact CTAs. Safe to reuse across sites.
export default function ResponsiveMachineShowcaseCard({
  machine,
  showRates = true,
}: ResponsiveMachineShowcaseCardProps) {
  const baseUrl = "https://kimberrubblstg.blob.core.windows.net";
  const images =
    (machine.thumbnails && machine.thumbnails.length > 0
      ? machine.thumbnails
      : machine.images) || [];

  const firstImage = (() => {
    const raw = images[0];
    if (!raw)
      return `/placeholder.svg?width=400&height=300&query=${encodeURIComponent(
        machine.primaryType || "equipment"
      )}`;
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    const corrected = raw.startsWith("/") ? raw : `/${raw}`;
    return `${baseUrl}${corrected}`;
  })();

  const name =
    `${machine.make || ""} ${machine.model || ""}`.trim() ||
    machine.displayName ||
    "Equipment";
  const detailUrl = getMachineDetailUrlWithoutLocale(machine);

  // Extract rate display
  function extractRates() {
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
      machine.rateSchedules.forEach((s) => {
        if (s.label === "DAY" && s.numDays === 1) daily = s.cost;
        else if (s.label === "WEEK" && s.numDays === 7) weekly = s.cost;
        else if (s.label.includes("MOS") || s.numDays >= 28)
          monthly = monthly ?? s.cost;
      });
    }
    return { daily, weekly, monthly };
  }

  const { daily, weekly, monthly } = extractRates();

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-all duration-200 h-full">
      <div className="relative h-40 sm:h-44 bg-gray-50">
        <Image
          src={firstImage}
          alt={`${name}`}
          fill
          className="object-contain p-3"
        />
      </div>

      <div className="p-3">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight line-clamp-2">
            {name}
          </h3>
          <p className="text-xs text-gray-500">{machine.primaryType}</p>
        </div>

        {showRates && (
          <div className="mb-3">
            {/* On very small screens show Daily only; reveal Weekly/Monthly at sm+ */}
            <div className="grid grid-cols-2 sm:grid-cols-3 border border-gray-200 rounded-md overflow-hidden text-center">
              <div className="py-2 bg-white">
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                  Daily
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {daily ? `$${daily}` : "—"}
                </p>
              </div>
              <div className="hidden sm:block border-l border-gray-200 py-2 bg-white">
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                  Weekly
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {weekly ? `$${weekly}` : "—"}
                </p>
              </div>
              <div className="hidden sm:block border-l border-gray-200 py-2 bg-white">
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                  Monthly
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {monthly ? `$${monthly}` : "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        <Link href={detailUrl} className="block">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs border-gray-200 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            See Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
