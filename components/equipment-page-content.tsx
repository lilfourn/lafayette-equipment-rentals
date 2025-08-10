"use client";

import EquipmentSearchDialog from "@/components/equipment-search-dialog";
// Removed the All Categories section per request
import IndustryBrowse, {
  type IndustryBrowseItem,
} from "@/components/industry-browse";
import { type Machine } from "@/components/machine-card";
import SimpleMachineCard from "@/components/simple-machine-card";
import IndustryCardSkeleton from "@/components/skeletons/industry-card-skeleton";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { getCachedValue, setCachedValue } from "@/lib/browser-cache";
import { ChevronLeft, ChevronRight, Shield, Truck, Wrench } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface EquipmentCategory {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  image?: {
    asset: {
      url: string;
    };
    alt?: string;
  };
  equipmentCount?: number;
}

interface SearchResults {
  machines: Machine[];
  error: string | null;
}

interface EquipmentPageContentProps {
  categories: EquipmentCategory[];
}

export default function EquipmentPageContent({
  categories,
}: EquipmentPageContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const t = useTranslations();
  const [searchOpen, setSearchOpen] = useState(false);

  const [popularRentals, setPopularRentals] = useState<SearchResults>({
    machines: [],
    error: null,
  });
  const [buyItNowMachines, setBuyItNowMachines] = useState<SearchResults>({
    machines: [],
    error: null,
  });
  const [industryItems, setIndustryItems] = useState<
    IndustryBrowseItem[] | null
  >(null);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingBuyNow, setLoadingBuyNow] = useState(true);
  const [loadingIndustries, setLoadingIndustries] = useState(true);

  // Carousel state for buy now section
  const [buyNowApi, setBuyNowApi] = useState<CarouselApi>();
  const [buyNowCurrent, setBuyNowCurrent] = useState(0);
  const [buyNowCount, setBuyNowCount] = useState(0);

  // Carousel state for popular rentals section
  const [popularApi, setPopularApi] = useState<CarouselApi>();
  const [popularCurrent, setPopularCurrent] = useState(0);
  const [popularCount, setPopularCount] = useState(0);

  useEffect(() => {
    if (!buyNowApi) {
      return;
    }

    setBuyNowCount(buyNowApi.scrollSnapList().length);
    setBuyNowCurrent(buyNowApi.selectedScrollSnap() + 1);

    buyNowApi.on("select", () => {
      setBuyNowCurrent(buyNowApi.selectedScrollSnap() + 1);
    });
  }, [buyNowApi]);

  useEffect(() => {
    if (!popularApi) {
      return;
    }

    setPopularCount(popularApi.scrollSnapList().length);
    setPopularCurrent(popularApi.selectedScrollSnap() + 1);

    popularApi.on("select", () => {
      setPopularCurrent(popularApi.selectedScrollSnap() + 1);
    });
  }, [popularApi]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  useEffect(() => {
    const abort = new AbortController();

    // 1) Try to hydrate from cache for instant UI
    const cachedPopular = getCachedValue<Machine[]>("popular_rentals_v1");
    if (cachedPopular && cachedPopular.length > 0) {
      setPopularRentals({ machines: cachedPopular, error: null });
      setLoadingPopular(false);
    }

    const cachedIndustries = getCachedValue<IndustryBrowseItem[]>(
      "industries_with_machines_v1"
    );
    if (cachedIndustries && cachedIndustries.length > 0) {
      setIndustryItems(cachedIndustries);
      setLoadingIndustries(false);
    }

    const fetchAll = async () => {
      try {
        if (!cachedPopular) setLoadingPopular(true);
        setLoadingBuyNow(true);
        if (!cachedIndustries) setLoadingIndustries(true);

        // 2) Fetch in parallel
        const [popularRes, buyNowRes, industriesRes] = await Promise.all([
          fetch("/api/equipment/popular", {
            signal: abort.signal,
            cache: "no-store",
          }).then((r) => (r.ok ? r.json() : Promise.reject())),
          fetch("/api/equipment/buynow", { signal: abort.signal }).then((r) =>
            r.ok ? r.json() : Promise.reject()
          ),
          fetch("/api/industry/with-machines", {
            signal: abort.signal,
            cache: "no-store",
          }).then((r) => (r.ok ? r.json() : Promise.reject())),
        ]);

        const popularMachines = popularRes.machines || [];
        setPopularRentals({
          machines: popularMachines,
          error: popularRes.error || null,
        });
        // 3) Persist fresh popular list for 30 minutes
        setCachedValue("popular_rentals_v1", popularMachines, 30 * 60 * 1000);

        setBuyItNowMachines({
          machines: buyNowRes.machines || [],
          error: buyNowRes.error || null,
        });
        const industries = industriesRes.items || [];
        setIndustryItems(industries);
        // Cache for quick subsequent loads (30 minutes)
        setCachedValue(
          "industries_with_machines_v1",
          industries,
          30 * 60 * 1000
        );
      } catch (e) {
        if (!cachedPopular) {
          setPopularRentals({ machines: [], error: "failed" });
        }
        setBuyItNowMachines({ machines: [], error: "failed" });
        setIndustryItems([]);
      } finally {
        setLoadingPopular(false);
        setLoadingBuyNow(false);
        setLoadingIndustries(false);
      }
    };

    // 4) Revalidate in background even if cache used
    fetchAll();
    return () => abort.abort();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Enhanced Design */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
              {t("equipmentPage.hero.subtitle")}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
              {t("equipmentPage.hero.title")}{" "}
              <span className="relative">
                {t("equipmentPage.hero.titleAccent")}
                <span className="absolute bottom-0 left-0 w-full h-1 bg-turquoise-500"></span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-12 leading-relaxed max-w-3xl mx-auto">
              {t("equipmentPage.hero.description")}
            </p>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="flex items-center justify-center gap-3">
                <div className="bg-turquoise-100 p-2 rounded-lg">
                  <Wrench className="h-6 w-6 text-turquoise-600" />
                </div>
                <span className="text-gray-700 font-semibold">
                  {t("equipmentPage.hero.professionalGrade")}
                </span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="bg-turquoise-100 p-2 rounded-lg">
                  <Truck className="h-6 w-6 text-turquoise-600" />
                </div>
                <span className="text-gray-700 font-semibold">
                  {t("equipmentPage.hero.fastDelivery")}
                </span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="bg-turquoise-100 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-turquoise-600" />
                </div>
                <span className="text-gray-700 font-semibold">
                  {t("equipmentPage.hero.fullyInsured")}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                onClick={() => setSearchOpen(true)}
                className="bg-turquoise-600 hover:bg-turquoise-700 text-white px-10 py-4 text-lg font-semibold transition-all duration-200 cursor-pointer"
              >
                {t("equipmentPage.search.button")}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <a href="tel:+13375452935">
                <Button
                  variant="outline"
                  className="border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-10 py-4 text-lg font-semibold cursor-pointer"
                >
                  {t("homepage.hero.callNow")} (337) 545-2935
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
      <EquipmentSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Decorative Divider */}
      <div className="py-8 bg-gradient-to-r from-gray-100 via-turquoise-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-turquoise-300 to-turquoise-500"></div>
            <div className="mx-6">
              <div className="w-3 h-3 bg-turquoise-500 rounded-full"></div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-turquoise-500 via-turquoise-300 to-transparent"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        {/* Popular Rentals Section - Enhanced */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {t("equipmentPage.popular.title")}{" "}
              <span className="text-turquoise-600">
                {t("equipmentPage.popular.titleAccent")}
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("equipmentPage.popular.subtitle")}
            </p>
          </div>

          {loadingPopular ? (
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-lg" />
                ))}
              </div>
            </div>
          ) : popularRentals.error ? (
            // Graceful error: show skeletons instead of an error block
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-lg" />
                ))}
              </div>
            </div>
          ) : popularRentals.machines.length > 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full max-w-full relative"
                setApi={setPopularApi}
              >
                <CarouselContent className="-ml-4">
                  {popularRentals.machines.map((machine) => (
                    <CarouselItem
                      key={machine.id}
                      className="pl-4 md:basis-1/2 lg:basis-1/3"
                    >
                      <div className="p-1">
                        <SimpleMachineCard machine={machine} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {/* Desktop navigation - hidden on mobile */}
                <CarouselPrevious className="hidden sm:flex -left-4 border-turquoise-500 text-turquoise-600 hover:bg-turquoise-50 h-8 w-8 shadow-md" />
                <CarouselNext className="hidden sm:flex -right-4 border-turquoise-500 text-turquoise-600 hover:bg-turquoise-50 h-8 w-8 shadow-md" />
              </Carousel>

              {/* Mobile Navigation Controls */}
              <div className="flex sm:hidden items-center justify-between mt-4 px-2">
                <button
                  onClick={() => popularApi?.scrollPrev()}
                  disabled={!popularApi?.canScrollPrev()}
                  className="flex items-center justify-center w-12 h-12 bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-700 rounded-lg shadow-sm border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed tap-target"
                  aria-label="Previous rental"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-gray-600">
                  {popularCurrent} / {popularCount}
                </span>
                <button
                  onClick={() => popularApi?.scrollNext()}
                  disabled={!popularApi?.canScrollNext()}
                  className="flex items-center justify-center w-12 h-12 bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-700 rounded-lg shadow-sm border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed tap-target"
                  aria-label="Next rental"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t("filters.noResults")}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t("filters.tryAdjusting")}
                </p>
                <Link href="/equipment-rental">
                  <Button className="bg-turquoise-600 hover:bg-turquoise-700 text-white px-8 py-3 font-semibold cursor-pointer">
                    {t("navigation.viewAllEquipment")}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Browse by Industry */}
        {loadingIndustries ? (
          <section className="mb-16 md:mb-20">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                {t("equipmentPage.categories.title").toUpperCase()}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Browse by Industry
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t("common.loading")}...
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <IndustryCardSkeleton key={i} />
              ))}
            </div>
          </section>
        ) : industryItems && industryItems.length > 0 ? (
          <section className="mb-16 md:mb-20">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                {t("equipmentPage.categories.title").toUpperCase()}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Browse by Industry
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore equipment commonly used in each industry. We surface
                machines currently available in Lafayette.
              </p>
            </div>
            <IndustryBrowse items={industryItems} />
          </section>
        ) : (
          <section className="mb-16 md:mb-20">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                {t("equipmentPage.categories.title").toUpperCase()}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Browse by Industry
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <IndustryCardSkeleton key={i} />
              ))}
            </div>
          </section>
        )}

        {/* Buy It Now Section - Enhanced */}
        {buyItNowMachines.machines.length > 0 && (
          <section className="mb-20">
            {/* Section Header */}
            <div className="text-center mb-12 px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t("equipmentPage.buyNow.title")}{" "}
                <span className="text-turquoise-600">
                  {t("equipmentPage.buyNow.titleAccent")}
                </span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t("equipmentPage.buyNow.subtitle")}
              </p>
            </div>

            {/* Buy Now Equipment Grid */}
            <div className="bg-white rounded-2xl p-4 md:p-8 border border-gray-200 shadow-sm">
              {/* Mobile-optimized Carousel */}
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
                setApi={setBuyNowApi}
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {buyItNowMachines.machines.slice(0, 12).map((machine) => (
                    <CarouselItem
                      key={machine.id}
                      className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                    >
                      <div className="h-full">
                        <SimpleMachineCard machine={machine} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {/* Desktop navigation - hidden on mobile */}
                <CarouselPrevious className="hidden sm:flex -left-2 md:-left-4 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-400 h-10 w-10 md:h-12 md:w-12 shadow-md" />
                <CarouselNext className="hidden sm:flex -right-2 md:-right-4 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-400 h-10 w-10 md:h-12 md:w-12 shadow-md" />
              </Carousel>

              {/* Mobile Navigation Controls */}
              <div className="flex sm:hidden items-center justify-between mt-4 px-2">
                <button
                  onClick={() => buyNowApi?.scrollPrev()}
                  disabled={!buyNowApi?.canScrollPrev()}
                  className="flex items-center justify-center w-12 h-12 bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-700 rounded-lg shadow-sm border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed tap-target"
                  aria-label="Previous equipment"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-gray-600">
                  {buyNowCurrent} / {buyNowCount}
                </span>
                <button
                  onClick={() => buyNowApi?.scrollNext()}
                  disabled={!buyNowApi?.canScrollNext()}
                  className="flex items-center justify-center w-12 h-12 bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-700 rounded-lg shadow-sm border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed tap-target"
                  aria-label="Next equipment"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* View All Link */}
              {buyItNowMachines.machines.length > 12 && (
                <div className="text-center mt-8">
                  <Link href="/buy-now">
                    <Button className="bg-turquoise-600 hover:bg-turquoise-700 text-white font-semibold px-8 py-3">
                      View All {buyItNowMachines.machines.length} Available for
                      Purchase
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-turquoise-600 to-turquoise-700 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("equipmentPage.cta.title")}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed opacity-90">
            {t("equipmentPage.cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-white text-turquoise-700 hover:bg-gray-100 font-semibold px-10 py-4 text-lg transition-all duration-200 cursor-pointer"
              >
                {t("equipmentPage.cta.button")}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="tel:+13372345678">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-turquoise-700 font-semibold px-10 py-4 text-lg transition-all duration-200 cursor-pointer"
              >
                {t("equipmentPage.cta.phone")}
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
