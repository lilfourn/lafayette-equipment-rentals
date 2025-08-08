"use client";

import { useLocale } from "next-intl";

/**
 * Hook to generate locale-aware href paths
 * Handles the "as-needed" locale prefix strategy where:
 * - English (default locale) uses root path "/"
 * - Other locales use "/[locale]" prefix
 */
export function useLocaleHref() {
  const locale = useLocale();
  
  /**
   * Generate a locale-aware href
   * @param path - The path without locale prefix (e.g., "/about", "/equipment-rental")
   * @returns The path with appropriate locale prefix
   */
  const localeHref = (path: string) => {
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // For default locale (en), return path as-is
    // For other locales, add the locale prefix
    return locale === 'en' ? cleanPath : `/${locale}${cleanPath}`;
  };
  
  return { localeHref, locale };
}