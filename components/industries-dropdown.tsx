"use client";

import {
  MegaMenu,
  MegaMenuContent,
  MegaMenuTrigger,
} from "@/components/ui/mega-menu";
import { useLocaleHref } from "@/hooks/use-locale-href";
import { type Industry } from "@/lib/server-data";
import { cn } from "@/lib/utils";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Factory,
  HardHat,
  Shield,
  Trees,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

interface IndustriesDropdownProps {
  industries: Industry[];
}

// Industry categories with icons
const industryCategories = {
  construction: {
    nameKey: "industries.constructionInfrastructure",
    icon: HardHat,
    color: "orange",
    keywords: [
      "construction",
      "infrastructure",
      "building",
      "civil",
      "contractor",
    ],
  },
  industrial: {
    nameKey: "industries.industrialManufacturing",
    icon: Factory,
    color: "blue",
    keywords: [
      "industrial",
      "manufacturing",
      "factory",
      "production",
      "warehouse",
    ],
  },
  utilities: {
    nameKey: "industries.energyUtilities",
    icon: Zap,
    color: "yellow",
    keywords: [
      "energy",
      "power",
      "utility",
      "electrical",
      "gas",
      "water",
      "solar",
    ],
  },
  transport: {
    nameKey: "industries.transportationLogistics",
    icon: Truck,
    color: "purple",
    keywords: [
      "transport",
      "logistics",
      "shipping",
      "fleet",
      "delivery",
      "distribution",
    ],
  },
  environmental: {
    nameKey: "industries.environmentalLandscaping",
    icon: Trees,
    color: "green",
    keywords: [
      "environmental",
      "landscape",
      "forestry",
      "agriculture",
      "farming",
      "garden",
    ],
  },
  commercial: {
    nameKey: "industries.commercialResidential",
    icon: Building2,
    color: "indigo",
    keywords: [
      "commercial",
      "residential",
      "property",
      "real estate",
      "facility",
      "retail",
    ],
  },
  specialty: {
    nameKey: "industries.specialtyServices",
    icon: Wrench,
    color: "pink",
    keywords: [
      "specialty",
      "service",
      "rental",
      "event",
      "emergency",
      "restoration",
    ],
  },
  government: {
    nameKey: "industries.governmentMunicipal",
    icon: Shield,
    color: "gray",
    keywords: [
      "government",
      "municipal",
      "public",
      "city",
      "state",
      "federal",
      "military",
    ],
  },
};

export default function IndustriesDropdown({
  industries,
}: IndustriesDropdownProps) {
  const { localeHref } = useLocaleHref();
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  // Categorize industries
  const categorizeIndustries = () => {
    const categorized: Record<string, Industry[]> = {};
    const uncategorized: Industry[] = [];

    // Initialize categories
    Object.keys(industryCategories).forEach((key) => {
      categorized[key] = [];
    });

    // Sort industries into categories
    industries.forEach((industry) => {
      const title = industry.title.toLowerCase();
      let assigned = false;

      for (const [categoryKey, category] of Object.entries(
        industryCategories
      )) {
        if (category.keywords.some((keyword) => title.includes(keyword))) {
          categorized[categoryKey].push(industry);
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        uncategorized.push(industry);
      }
    });

    // Add uncategorized to specialty
    if (uncategorized.length > 0) {
      categorized.specialty.push(...uncategorized);
    }

    return categorized;
  };

  const categorizedIndustries = categorizeIndustries();

  const COLOR_CLASS_MAP = {
    orange:
      "bg-orange-50 border-orange-200 hover:border-orange-300 hover:bg-orange-100",
    blue: "bg-blue-50 border-blue-200 hover:border-blue-300 hover:bg-blue-100",
    yellow:
      "bg-yellow-50 border-yellow-200 hover:border-yellow-300 hover:bg-yellow-100",
    purple:
      "bg-purple-50 border-purple-200 hover:border-purple-300 hover:bg-purple-100",
    green:
      "bg-green-50 border-green-200 hover:border-green-300 hover:bg-green-100",
    indigo:
      "bg-indigo-50 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-100",
    pink: "bg-pink-50 border-pink-200 hover:border-pink-300 hover:bg-pink-100",
    gray: "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100",
  } as const;

  const ICON_COLOR_MAP = {
    orange: "text-orange-600",
    blue: "text-blue-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
    green: "text-green-600",
    indigo: "text-indigo-600",
    pink: "text-pink-600",
    gray: "text-gray-600",
  } as const;

  const getColorClasses = (color: string) => {
    return (
      COLOR_CLASS_MAP[color as keyof typeof COLOR_CLASS_MAP] ||
      COLOR_CLASS_MAP.gray
    );
  };

  const getIconColorClasses = (color: string) => {
    return (
      ICON_COLOR_MAP[color as keyof typeof ICON_COLOR_MAP] ||
      ICON_COLOR_MAP.gray
    );
  };

  return (
    <MegaMenu
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <MegaMenuTrigger className="text-gray-700 hover:text-turquoise-600 px-3 py-2 text-base font-medium transition-all duration-200">
          {t("navigation.industries")} <ChevronDown className="ml-1 h-4 w-4" />
        </MegaMenuTrigger>
      }
    >
      <MegaMenuContent className="w-screen max-w-7xl p-0">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {t("navigation.industries")}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Specialized equipment solutions for every industry
              </p>
            </div>
            <Link
              href={localeHref("/industries")}
              className="group flex items-center gap-2 rounded-full bg-turquoise-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-turquoise-700 hover:shadow-lg"
              onClick={() => setIsOpen(false)}
            >
              {t("navigation.viewAllIndustries")}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Industry Categories Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(industryCategories).map(([key, category]) => {
              const industries = categorizedIndustries[key];
              if (industries.length === 0) return null;

              const Icon = category.icon;

              return (
                <div key={key} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        getColorClasses(category.color)
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          getIconColorClasses(category.color)
                        )}
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900">
                      {t(category.nameKey)}
                    </h4>
                  </div>

                  {/* Industry Links */}
                  <div className="space-y-2">
                    {industries.map((industry) => (
                      <Link
                        key={industry._id}
                        href={localeHref(
                          `/industries/${industry.slug.current}`
                        )}
                        className="group block rounded-lg px-3 py-2 text-sm text-gray-700 transition-all hover:bg-gray-100 hover:text-turquoise-600"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="flex items-center justify-between">
                          {industry.title}
                          <ChevronRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="mt-8 rounded-xl bg-gradient-to-r from-turquoise-50 to-blue-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">
                  Need Industry-Specific Solutions?
                </h4>
                <p className="mt-1 text-sm text-gray-600">
                  Our experts can help you find the right equipment for your
                  industry needs.
                </p>
              </div>
              <Link
                href={localeHref("/contact")}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-turquoise-600 shadow-sm transition-all hover:shadow-md"
                onClick={() => setIsOpen(false)}
              >
                Contact an Expert
              </Link>
            </div>
          </div>
        </div>
      </MegaMenuContent>
    </MegaMenu>
  );
}
