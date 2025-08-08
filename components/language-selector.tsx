"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { locales } from "@/i18n";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

const languageNames: Record<string, string> = {
  en: "English",
  es: "Español",
};

const languageFlags: Record<string, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
};

export function LanguageSelector() {
  const locale = useLocale();
  const pathname = usePathname();

  // Debug logging
  console.log("[i18n] Selector: Current locale:", locale);
  console.log("[i18n] Selector: Current pathname:", pathname);

  // Function to get the clean path without locale
  const getPathWithoutLocale = () => {
    // Remove any locale prefix (handles /en, /es, and nested duplicates)
    const segments = pathname.split('/').filter(segment => 
      segment && !locales.includes(segment as any)
    );
    
    // Return the clean path
    return segments.length > 0 ? `/${segments.join('/')}` : '/';
  };

  const pathWithoutLocale = getPathWithoutLocale();
  console.log("[i18n] Selector: Path without locale:", pathWithoutLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-sm font-medium"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {languageFlags[locale]} {languageNames[locale]}
          </span>
          <span className="sm:hidden">{languageFlags[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {locales.map((lng) => {
          const href = lng === 'en' ? pathWithoutLocale : `/${lng}${pathWithoutLocale}`;
          console.log(`[i18n] Selector: Link for ${lng}:`, href);
          
          return (
            <DropdownMenuItem key={lng} asChild>
              <Link
                href={href}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => console.log(`[i18n] Selector: Switching to ${lng}`)}
              >
                <span>{languageFlags[lng]}</span>
                <span>{languageNames[lng]}</span>
                {lng === locale && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}