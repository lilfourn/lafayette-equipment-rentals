"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLocaleHref } from "@/hooks/use-locale-href";
import { type ServerData } from "@/lib/server-data";
import { ChevronDown, ChevronRight, Menu, ShoppingCart, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { LanguageSelector } from "./language-selector";

interface HeaderProps {
  serverData: ServerData;
}

const ListItem = ({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children?: React.ReactNode;
}) => {
  return (
    <DropdownMenuItem
      asChild
      className="cursor-pointer hover:bg-muted text-base py-2"
    >
      <Link href={href} className="w-full">
        {title}
        {children}
      </Link>
    </DropdownMenuItem>
  );
};

export default function Header({ serverData }: HeaderProps) {
  // Get locale-aware href function
  const { localeHref } = useLocaleHref();
  const t = useTranslations();

  // State for mobile dropdowns
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(
    null
  );
  const [openMobileSubDropdown, setOpenMobileSubDropdown] = useState<
    string | null
  >(null);
  // State for cart count
  const [cartCount, setCartCount] = useState(0);

  // serverData currently not used after removing Equipment & Industries menus

  // Function to calculate cart count
  const updateCartCount = () => {
    if (typeof window !== "undefined") {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const totalCount = cart.reduce((sum: number, item: any) => {
          return sum + (item.quantity || 1);
        }, 0);
        setCartCount(totalCount);
      } catch (error) {
        console.error("Error calculating cart count:", error);
        setCartCount(0);
      }
    }
  };

  // Listen for cart updates
  useEffect(() => {
    updateCartCount(); // Initial load

    const handleCartUpdate = () => {
      updateCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate); // Listen for localStorage changes from other tabs

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, []);

  // Removed Equipment & Industries menu helpers

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm safe-top">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          <Link
            href={localeHref("/")}
            className="flex items-center gap-2"
            prefetch={false}
          >
            <Image
              src="/logo.png?v=2"
              alt="Lafayette Equipment Rental Service Logo"
              width={400}
              height={100}
              className="h-12 sm:h-16 md:h-18 lg:h-20 w-auto max-w-[150px] sm:max-w-[200px] md:max-w-none"
              priority={true}
              loading="eager"
              sizes="(max-width: 640px) 150px, (max-width: 768px) 200px, 400px"
            />
          </Link>

          {/* Desktop navigation: hidden on mobile */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Equipment & Tools menu removed per request */}

            <Button
              variant="ghost"
              asChild
              className="text-gray-700 hover:text-turquoise-600 px-3 py-2 text-base font-medium transition-all duration-200"
            >
              <Link href={localeHref("/equipment-rental")}>
                {t("navigation.rentals")}
              </Link>
            </Button>

            {/* Industries menu removed per request */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-turquoise-600 px-3 py-2 text-base font-medium transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:ring-0"
                >
                  {t("navigation.resources")}{" "}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white shadow-lg border border-gray-200 w-[200px] md:w-[250px]"
              >
                <div className="grid gap-2 p-3">
                  <ListItem
                    href={localeHref("/support/faq")}
                    title={t("navigation.faq")}
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              asChild
              className="text-gray-700 hover:text-turquoise-600 px-3 py-2 text-base font-medium transition-all duration-200"
            >
              <Link href={localeHref("/about")}>{t("navigation.aboutUs")}</Link>
            </Button>

            <Button
              variant="ghost"
              asChild
              className="text-gray-700 hover:text-turquoise-600 px-3 py-2 text-base font-medium transition-all duration-200"
            >
              <Link href={localeHref("/contact")}>
                {t("navigation.contact")}
              </Link>
            </Button>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              <LanguageSelector />

              <Link href={localeHref("/contact")}>
                <Button className="bg-turquoise-600 hover:bg-turquoise-700 text-white px-4 py-2 text-sm font-medium transition-all duration-200">
                  {t("navigation.getQuote")}
                </Button>
              </Link>

              <Link
                href={localeHref(
                  "/equipment-rental/cart/checkout-lafayette-la"
                )}
                className="relative"
              >
                <Button
                  variant="outline"
                  className="border-gray-300 hover:border-turquoise-600 px-3 py-2 transition-all duration-200"
                >
                  <ShoppingCart className="h-4 w-4 text-gray-600" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </nav>

          {/* Mobile navigation container */}
          <div className="flex lg:hidden items-center gap-2">
            <LanguageSelector />

            {/* Get Quote - Mobile */}
            <Link href={localeHref("/contact")} className="hidden sm:block">
              <Button
                size="sm"
                className="bg-turquoise-600 hover:bg-turquoise-700 text-white px-3 py-2 text-sm font-medium tap-target"
              >
                {t("navigation.getQuote")}
              </Button>
            </Link>

            {/* Cart Icon - Mobile */}
            <Link href={localeHref("/cart")} className="relative">
              <Button
                variant="outline"
                size="icon"
                className="border-gray-300 hover:border-turquoise-600 h-10 w-10 tap-target"
              >
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Button>
            </Link>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-300 hover:border-turquoise-600 h-10 w-10 tap-target"
                >
                  <Menu className="h-6 w-6 text-gray-600" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full sm:w-[400px] p-0 bg-gradient-to-b from-white to-gray-50 border-l border-gray-200 shadow-2xl safe-top safe-bottom flex flex-col [&>button]:text-white [&>button]:hover:text-gray-200"
              >
                <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>

                {/* Modern Mobile Menu Header */}
                <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-wide">
                        Menu
                      </h2>
                      <p className="text-white text-sm font-semibold mt-1 opacity-90">
                        Lafayette Equipment
                      </p>
                    </div>
                    {/* Remove duplicate close button - SheetContent already has one */}
                  </div>
                  {/* Decorative element */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-turquoise-400 to-turquoise-500"></div>
                </div>

                {/* Mobile Navigation with Professional Styling */}
                <nav className="flex-1 flex flex-col overflow-y-auto bg-white">
                  <div className="flex-1 p-4 space-y-2">
                    {/* Equipment and Tools menu removed per request */}

                    {/* Other Menu Items - Modern Card Style */}
                    {[
                      {
                        href: localeHref("/equipment-rental"),
                        label: t("navigation.rentals"),
                      },
                      {
                        type: "dropdown",
                        label: t("navigation.resources"),
                        key: "resources",
                        items: [
                          {
                            href: localeHref("/support/faq"),
                            title: t("navigation.faq"),
                          },
                        ],
                      },
                      {
                        href: localeHref("/about"),
                        label: t("navigation.aboutUs"),
                      },
                      {
                        href: localeHref("/contact"),
                        label: t("navigation.contact"),
                      },
                    ].map((item, index) => (
                      <div key={index} className="group">
                        {item.type === "dropdown" ? (
                          <>
                            <button
                              className="w-full flex items-center justify-start p-4 text-left bg-white hover:bg-gradient-to-r hover:from-red-50 hover:to-turquoise-50 rounded-xl border border-gray-200 hover:border-turquoise-300 transition-all duration-300 focus:outline-none tap-target shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                              onClick={() =>
                                setOpenMobileDropdown(
                                  openMobileDropdown === item.key
                                    ? null
                                    : item.key
                                )
                              }
                              aria-expanded={openMobileDropdown === item.key}
                            >
                              <span className="font-bold text-gray-900 text-lg flex-1 text-left">
                                {item.label}
                              </span>
                              <ChevronRight
                                className={`h-6 w-6 text-gray-400 group-hover:text-turquoise-600 transition-all duration-300 ml-auto ${
                                  openMobileDropdown === item.key
                                    ? "rotate-90 text-turquoise-500"
                                    : ""
                                }`}
                              />
                            </button>

                            {/* Dropdown Content */}
                            <div
                              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                openMobileDropdown === item.key
                                  ? "max-h-[400px] opacity-100 mt-2"
                                  : "max-h-0 opacity-0"
                              }`}
                            >
                              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-inner">
                                {/* Industries dropdown removed per request */}

                                {item.items.map(
                                  (
                                    subItem: { href: string; title: string },
                                    subIndex: number
                                  ) => {
                                    const href: string = subItem.href;
                                    return (
                                      <SheetClose key={subIndex} asChild>
                                        <Link
                                          href={href}
                                          className="flex items-center justify-between px-6 py-4 text-gray-600 hover:text-gray-900 hover:bg-white transition-all duration-200 border-b border-gray-100 last:border-b-0"
                                        >
                                          <span className="font-medium">
                                            {subItem.title}
                                          </span>
                                          <ChevronRight className="h-4 w-4 text-gray-400" />
                                        </Link>
                                      </SheetClose>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          <SheetClose asChild>
                            <Link
                              href={String((item as any).href)}
                              className="flex items-center justify-start p-4 bg-white hover:bg-gradient-to-r hover:from-red-50 hover:to-turquoise-50 rounded-xl border border-gray-200 hover:border-turquoise-300 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-[1.02] group"
                            >
                              <span className="font-bold text-gray-900 text-lg flex-1 text-left">
                                {item.label}
                              </span>
                              <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-turquoise-600 transition-all duration-300 ml-auto" />
                            </Link>
                          </SheetClose>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Premium Footer Section */}
                  <div className="mt-auto bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 border-t border-gray-200 shadow-2xl">
                    {/* Primary CTA Button */}
                    <SheetClose asChild>
                      <Link
                        href={localeHref("/contact")}
                        className="block mb-4"
                      >
                        <Button
                          size="lg"
                          className="w-full bg-gradient-to-r from-turquoise-500 to-turquoise-600 hover:from-turquoise-600 hover:to-turquoise-700 text-white font-black py-4 text-lg uppercase tracking-wide shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-turquoise-700"
                        >
                          {t("navigation.getQuote")}
                        </Button>
                      </Link>
                    </SheetClose>

                    {/* Contact Information */}
                    <div className="text-center">
                      <a href="tel:+13372345678" className="block group">
                        <p className="text-white text-sm font-medium mb-1 opacity-90">
                          Call Now for Instant Quote
                        </p>
                        <p className="text-white font-black text-2xl group-hover:text-gray-200 transition-colors duration-200">
                          (337) 234-5678
                        </p>
                      </a>
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-white text-xs opacity-75">
                          Professional Equipment Rentals • Lafayette, LA
                        </p>
                      </div>
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
