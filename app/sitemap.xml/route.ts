import { locales } from "@/i18n";
import { processGlobalBuyItNowMachines } from "@/lib/global-machines";
import {
  generateLafayetteSEOUrls,
  getUrlMetadata,
} from "@/lib/lafayette-seo-urls";
import {
  LAFAYETTE_LOCATION,
  getMachineCoordinates,
  isWithinLafayetteRadius,
} from "@/lib/location-config";
// Removed Sanity integration
import { NextResponse } from "next/server";

// Force dynamic rendering - CRITICAL for real-time data
export const dynamic = "force-dynamic";

// Interface for API machines
interface RubblMachine {
  id: string;
  location?: {
    point?: { coordinates?: [number, number] };
    longitude?: number;
    latitude?: number;
    city?: string;
    state?: string;
  };
  buyItNowEnabled?: boolean;
  make?: string;
  model?: string;
  primaryType?: string;
  year?: number;
  [key: string]: any;
}

// Fetch machines from API with location filtering
async function getMachinesForSitemap(): Promise<RubblMachine[]> {
  const apiKey = process.env.RUBBL_API_KEY;
  if (!apiKey) {
    console.error(
      "RUBBL_API_KEY is not set. Returning empty machines for sitemap."
    );
    return [];
  }
  const apiUrl =
    "https://kimber-rubbl-search.search.windows.net/indexes/machines/docs/search?api-version=2020-06-30";

  const filterClauses = [
    "(status eq 'Available' or status eq 'Onboarding')",
    "(requiresAdminApproval eq false)",
    "(approvalStatus eq 'Approved' or approvalStatus eq null)",
  ];

  const requestBody = {
    count: true,
    filter: filterClauses.join(" and "),
    search: "",
    searchMode: "all",
    top: 100000, // NO CAP - fetch ALL available machines for maximum SEO coverage
    select:
      "id,location,buyItNowEnabled,buyItNowPrice,make,model,primaryType,year", // Fetch more fields for SEO URLs
    facets: [],
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store", // Always fresh data
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API request failed:", response.status, errorText);
      return [];
    }

    const data = await response.json();
    const allMachines = data.value || [];
    console.log(`Total machine count from API: ${allMachines.length}`);

    // Filter machines based on location and buy-now status
    const filteredMachines: RubblMachine[] = [];

    for (const machine of allMachines) {
      const coords = getMachineCoordinates(machine);

      if (!coords) {
        // If no coordinates, skip this machine
        continue;
      }

      const isInRadius = isWithinLafayetteRadius(coords.lat, coords.lon);

      if (isInRadius) {
        // Machine is within radius - ALWAYS include these
        filteredMachines.push(machine);
      } else {
        // Machine is outside radius - ONLY include if buy-it-now is enabled
        if (machine.buyItNowEnabled) {
          // Transform location to Lafayette for buy-it-now machines outside radius
          filteredMachines.push({
            ...machine,
            location: {
              ...machine.location,
              city: LAFAYETTE_LOCATION.city,
              state: LAFAYETTE_LOCATION.state,
            },
            buyItNowOnly: true, // Mark as buy-it-now only
          });
        }
        // Machines outside radius without buy-it-now are excluded
      }
    }

    console.log(
      `Filtered machine count for sitemap: ${filteredMachines.length}`
    );
    return filteredMachines;
  } catch (error) {
    console.error("Error fetching machines:", error);
    return [];
  }
}

function normalizeDate(dateInput: string | Date | undefined): string {
  if (!dateInput) {
    return new Date().toISOString();
  }

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch (error) {
    console.error("Error normalizing date:", dateInput, error);
    return new Date().toISOString();
  }
}

function generateUrlEntry(
  url: string,
  changefreq: string,
  priority: number,
  lastmod?: string,
  alternateUrls?: string[]
): string {
  const normalizedDate = normalizeDate(lastmod);
  const alternateLinks = alternateUrls
    ? alternateUrls
        .map(
          (altUrl) =>
            `        <xhtml:link rel="alternate" hreflang="${
              altUrl.includes("/es/") ? "es" : "en"
            }" href="${altUrl}"/>`
        )
        .join("\n")
    : "";

  return `    <url>
        <loc>${url}</loc>${alternateLinks ? "\n" + alternateLinks : ""}
        <lastmod>${normalizedDate}</lastmod>
        <changefreq>${changefreq}</changefreq>
        <priority>${priority.toFixed(1)}</priority>
    </url>`;
}

export async function GET(request: Request) {
  try {
    // ALWAYS use production domain
    const baseUrl = "https://www.lafayetteequipmentrental.com";

    console.log("Generating UNLIMITED sitemap with baseUrl:", baseUrl);

    // Fetch ALL data in parallel - NO LIMITS for maximum SEO coverage
    const [articles, equipmentCategories, equipment, industries, allMachines] =
      await Promise.all([
        Promise.resolve([]),
        Promise.resolve([]),
        Promise.resolve([]),
        Promise.resolve([]),
        getMachinesForSitemap().catch((error) => {
          console.error("Error fetching machines:", error);
          return [];
        }),
      ]);

    console.log(
      `Fetched data: ${articles.length} articles, ${equipmentCategories.length} categories, ${equipment.length} equipment items, ${allMachines.length} machines, ${industries.length} industries`
    );

    const currentDate = new Date().toISOString();
    const urls: string[] = [];

    // Static pages - now with locale support
    const staticPages = [
      { path: "", changefreq: "daily", priority: 1.0 },
      { path: "/about", changefreq: "monthly", priority: 0.8 },
      { path: "/contact", changefreq: "monthly", priority: 0.8 },
      { path: "/blog", changefreq: "daily", priority: 0.9 },
      { path: "/equipment-rental", changefreq: "daily", priority: 0.9 },
      { path: "/support/faq", changefreq: "monthly", priority: 0.7 },
      { path: "/industries", changefreq: "monthly", priority: 0.8 },
    ];

    // Add static pages with locale support
    staticPages.forEach((page) => {
      locales.forEach((locale) => {
        const localePath =
          locale === "en" ? `/en${page.path}` : `/es${page.path}`;
        const alternateUrls = locales
          .map((altLocale) => {
            const altPath =
              altLocale === "en" ? `/en${page.path}` : `/es${page.path}`;
            return `${baseUrl}${altPath}`;
          })
          .filter((url) => url !== `${baseUrl}${localePath}`);

        urls.push(
          generateUrlEntry(
            `${baseUrl}${localePath}`,
            page.changefreq,
            page.priority,
            currentDate,
            alternateUrls
          )
        );
      });
    });

    // Add equipment category pages with locale support
    equipmentCategories.forEach((category: any) => {
      if (category.name) {
        locales.forEach((locale) => {
          const localePath = `/${locale}/equipment-rental/${category.name}`;
          const alternateUrls = locales
            .map(
              (altLocale) =>
                `${baseUrl}/${altLocale}/equipment-rental/${category.name}`
            )
            .filter((url) => url !== `${baseUrl}${localePath}`);

          urls.push(
            generateUrlEntry(
              `${baseUrl}${localePath}`,
              "weekly",
              0.8,
              currentDate,
              alternateUrls
            )
          );
        });
      }
    });

    // Add equipment detail pages with locale support
    equipment.forEach((item: any) => {
      if (item.slug?.current && item.category?.name) {
        locales.forEach((locale) => {
          const localePath = `/${locale}/equipment-rental/${item.category.name}/${item.slug.current}`;
          const alternateUrls = locales
            .map(
              (altLocale) =>
                `${baseUrl}/${altLocale}/equipment-rental/${item.category.name}/${item.slug.current}`
            )
            .filter((url) => url !== `${baseUrl}${localePath}`);

          urls.push(
            generateUrlEntry(
              `${baseUrl}${localePath}`,
              "weekly",
              0.7,
              normalizeDate(item.publishedAt),
              alternateUrls
            )
          );
        });
      }
    });

    // Add machine pages - ONLY WORKING URLs
    let machineUrlsAdded = 0;

    // Collect unique types, makes, and models for listing pages
    const uniqueTypes = new Set<string>();
    const uniqueMakeModels = new Set<string>();
    const uniqueCities = new Set<string>();

    allMachines.forEach((machine: RubblMachine) => {
      if (machine.id) {
        // Determine the city-state for URL (for location-based URLs)
        const city = machine.location?.city || LAFAYETTE_LOCATION.city;
        const state = machine.location?.state || LAFAYETTE_LOCATION.state;
        const citySlug = city.toLowerCase().replace(/\s+/g, "-");
        const stateSlug = state.toLowerCase();

        // Collect unique values for listing pages
        if (machine.primaryType) {
          uniqueTypes.add(
            machine.primaryType.toLowerCase().replace(/\s+/g, "-")
          );
        }
        if (machine.make && machine.model) {
          uniqueMakeModels.add(
            `${machine.make.toLowerCase().replace(/\s+/g, "-")}|${machine.model
              .toLowerCase()
              .replace(/\s+/g, "-")}`
          );
        }
        uniqueCities.add(`${citySlug}-${stateSlug}`);

        // Generate ONLY WORKING URL patterns
        locales.forEach((locale) => {
          // Pattern 1: Direct machine URL (canonical) - THIS WORKS
          const directPath = `/${locale}/equipment-rental/machines/${machine.id}`;
          const directAlternates = locales
            .map(
              (altLocale) =>
                `${baseUrl}/${altLocale}/equipment-rental/machines/${machine.id}`
            )
            .filter((url) => url !== `${baseUrl}${directPath}`);

          urls.push(
            generateUrlEntry(
              `${baseUrl}${directPath}`,
              "weekly",
              0.7,
              currentDate,
              directAlternates
            )
          );

          // Pattern 2: City-based URL (SEO-friendly redirect) - THIS WORKS
          const cityPath = `/${locale}/equipment-rental/location/${citySlug}-${stateSlug}/machines/${machine.id}`;
          const cityAlternates = locales
            .map(
              (altLocale) =>
                `${baseUrl}/${altLocale}/equipment-rental/location/${citySlug}-${stateSlug}/machines/${machine.id}`
            )
            .filter((url) => url !== `${baseUrl}${cityPath}`);

          urls.push(
            generateUrlEntry(
              `${baseUrl}${cityPath}`,
              "weekly",
              0.6,
              currentDate,
              cityAlternates
            )
          );
        });
        machineUrlsAdded++;
      }
    });

    // Add equipment type listing pages (NEW WORKING ROUTES)
    uniqueTypes.forEach((type) => {
      locales.forEach((locale) => {
        // Type listing page
        const typePath = `/${locale}/equipment-rental/type/${type}`;
        const typeAlternates = locales
          .map(
            (altLocale) =>
              `${baseUrl}/${altLocale}/equipment-rental/type/${type}`
          )
          .filter((url) => url !== `${baseUrl}${typePath}`);

        urls.push(
          generateUrlEntry(
            `${baseUrl}${typePath}`,
            "weekly",
            0.8,
            currentDate,
            typeAlternates
          )
        );

        // Type + city combination pages (limit to major cities)
        const majorCities = [
          "lafayette-la",
          "new-orleans-la",
          "baton-rouge-la",
          "lake-charles-la",
        ];
        majorCities.forEach((city) => {
          const typeCityPath = `/${locale}/equipment-rental/type/${type}/${city}`;
          const typeCityAlternates = locales
            .map(
              (altLocale) =>
                `${baseUrl}/${altLocale}/equipment-rental/type/${type}/${city}`
            )
            .filter((url) => url !== `${baseUrl}${typeCityPath}`);

          urls.push(
            generateUrlEntry(
              `${baseUrl}${typeCityPath}`,
              "weekly",
              0.7,
              currentDate,
              typeCityAlternates
            )
          );
        });
      });
    });

    // Add make/model listing pages (NEW WORKING ROUTES with /make/ prefix)
    uniqueMakeModels.forEach((makeModel) => {
      const [make, model] = makeModel.split("|");
      if (make && model) {
        locales.forEach((locale) => {
          // Make/model listing page with /make/ prefix
          const makeModelPath = `/${locale}/equipment-rental/make/${make}/${model}`;
          const makeModelAlternates = locales
            .map(
              (altLocale) =>
                `${baseUrl}/${altLocale}/equipment-rental/make/${make}/${model}`
            )
            .filter((url) => url !== `${baseUrl}${makeModelPath}`);

          urls.push(
            generateUrlEntry(
              `${baseUrl}${makeModelPath}`,
              "weekly",
              0.7,
              currentDate,
              makeModelAlternates
            )
          );

          // Make/model + city combination pages (limit to major cities)
          const majorCities = [
            "lafayette-la",
            "new-orleans-la",
            "baton-rouge-la",
          ];
          majorCities.forEach((city) => {
            const makeModelCityPath = `/${locale}/equipment-rental/make/${make}/${model}/${city}`;
            const makeModelCityAlternates = locales
              .map(
                (altLocale) =>
                  `${baseUrl}/${altLocale}/equipment-rental/make/${make}/${model}/${city}`
              )
              .filter((url) => url !== `${baseUrl}${makeModelCityPath}`);

            urls.push(
              generateUrlEntry(
                `${baseUrl}${makeModelCityPath}`,
                "weekly",
                0.6,
                currentDate,
                makeModelCityAlternates
              )
            );
          });
        });
      }
    });

    console.log(
      `Added ${machineUrlsAdded} machine URLs out of ${allMachines.length} total machines`
    );
    console.log(
      `Added ${uniqueTypes.size} unique equipment type listing pages`
    );
    console.log(
      `Added ${uniqueMakeModels.size} unique make/model listing pages`
    );

    // Add industry pages with locale support
    industries.forEach((industry: any) => {
      if (industry.slug?.current) {
        locales.forEach((locale) => {
          const localePath = `/${locale}/industries/${industry.slug.current}`;
          const alternateUrls = locales
            .map(
              (altLocale) =>
                `${baseUrl}/${altLocale}/industries/${industry.slug.current}`
            )
            .filter((url) => url !== `${baseUrl}${localePath}`);

          urls.push(
            generateUrlEntry(
              `${baseUrl}${localePath}`,
              "monthly",
              0.7,
              currentDate,
              alternateUrls
            )
          );
        });
      }
    });

    // Add blog articles with locale support
    articles.forEach((article: any, index: number) => {
      if (article.slug?.current) {
        locales.forEach((locale) => {
          const localePath = `/${locale}/blog/${article.slug.current}`;
          const alternateUrls = locales
            .map(
              (altLocale) =>
                `${baseUrl}/${altLocale}/blog/${article.slug.current}`
            )
            .filter((url) => url !== `${baseUrl}${localePath}`);

          urls.push(
            generateUrlEntry(
              `${baseUrl}${localePath}`,
              "monthly",
              0.6,
              normalizeDate(article.publishedAt),
              alternateUrls
            )
          );
        });
      }
    });

    // ADD LAFAYETTE-FOCUSED LONG-TAIL SEO URLs (500+ URLs)
    console.log("Generating Lafayette-focused long-tail SEO URLs...");
    let lafayetteSeoUrlCount = 0;

    locales.forEach((locale) => {
      const lafayetteSeoUrls = generateLafayetteSEOUrls(locale);

      lafayetteSeoUrls.forEach((seoUrl) => {
        const metadata = getUrlMetadata(seoUrl);
        const fullUrl = `${baseUrl}${seoUrl}`;

        // Generate alternate URLs for other locales
        const alternateUrls = locales
          .filter((altLocale) => altLocale !== locale)
          .map((altLocale) => {
            const altUrl = seoUrl.replace(`/${locale}/`, `/${altLocale}/`);
            return `${baseUrl}${altUrl}`;
          });

        urls.push(
          generateUrlEntry(
            fullUrl,
            metadata.changefreq,
            metadata.priority,
            currentDate,
            alternateUrls
          )
        );
        lafayetteSeoUrlCount++;
      });
    });

    console.log(
      `Added ${lafayetteSeoUrlCount} Lafayette-focused long-tail SEO URLs`
    );

    // Sort URLs by priority (highest first) then by path for better organization
    urls.sort((a, b) => {
      const priorityA = parseFloat(
        a.match(/<priority>([\d.]+)<\/priority>/)?.[1] || "0"
      );
      const priorityB = parseFloat(
        b.match(/<priority>([\d.]+)<\/priority>/)?.[1] || "0"
      );
      if (priorityA !== priorityB) return priorityB - priorityA;

      const locA = a.match(/<loc>([^<]+)<\/loc>/)?.[1] || "";
      const locB = b.match(/<loc>([^<]+)<\/loc>/)?.[1] || "";
      return locA.localeCompare(locB);
    });

    // Generate professional XML sitemap with COMPREHENSIVE LAFAYETTE SEO COVERAGE
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<!-- 
    Lafayette Equipment Rentals - Enhanced Long-Tail SEO Sitemap
    Generated: ${new Date().toISOString()}
    Total URLs: ${urls.length} (Comprehensive Lafayette-Focused Coverage)
    
    This enhanced sitemap provides comprehensive SEO coverage for Lafayette Equipment Rentals:
    
    Lafayette-Focused Long-Tail SEO URLs (${lafayetteSeoUrlCount} URLs):
    - Equipment type variations (mini, large, hydraulic, etc.)
    - Brand/model specific pages (Caterpillar, John Deere, etc.)
    - Service-specific pages (daily, weekly, emergency rentals)
    - Industry-equipment combinations (construction, oil & gas, etc.)
    - Project-based pages (home renovation, land clearing, etc.)
    - Specification pages (tonnage, height, capacity)
    - Comparison and guide pages
    - Seasonal and event-based pages
    
    Machine Inventory:
    - ${allMachines.length} machines with direct URLs
    - Location-specific URLs for Lafayette SEO
    - Equipment type and make/model pages
    
    Content & Resources:
    - Static pages (Home, About, Contact, FAQ)
    - Blog articles and industry pages
    - Full multilingual support (EN/ES)
    
    All URLs optimized for Lafayette, Louisiana market
    For equipment rentals in Lafayette, LA, visit https://www.lafayetteequipmentrental.com
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.join("\n")}
</urlset>`;

    console.log(
      `Generated ENHANCED LAFAYETTE SEO sitemap with ${urls.length} total URLs!`
    );
    console.log(
      `Breakdown: ${staticPages.length * locales.length} static pages, ${
        equipmentCategories.length * locales.length
      } category pages, ${
        equipment.length * locales.length
      } equipment detail pages, ${
        machineUrlsAdded * 2 * locales.length
      } machine URLs, ${industries.length * locales.length} industry pages, ${
        articles.length * locales.length
      } article pages, ${lafayetteSeoUrlCount} Lafayette-focused long-tail SEO URLs`
    );
    console.log(
      `Lafayette SEO Coverage: Equipment variations, brand/model pages, service-specific, industry combinations, project-based, specifications, guides, and seasonal pages - all optimized for Lafayette, LA market`
    );

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400", // 24 hour cache
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Fallback basic sitemap
    const baseUrl = "https://www.lafayetteequipmentrental.com";

    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
</urlset>`;

    return new NextResponse(basicSitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
}
