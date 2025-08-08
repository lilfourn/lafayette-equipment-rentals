import { getRequestConfig } from "next-intl/server";
import { routing } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
  
  console.log("[i18n] Request: Loading messages for locale:", locale);

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
    console.log("[i18n] Request: Invalid or missing locale, falling back to:", locale);
  }

  const messages = (await import(`@/messages/${locale}.json`)).default;
  console.log(`[i18n] Request: Loaded ${locale} messages, sample:`, messages?.homepage?.hero?.title);
  
  return {
    locale,
    messages,
  };
});