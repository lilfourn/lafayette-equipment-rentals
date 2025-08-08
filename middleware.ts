import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log("[i18n] Middleware: Processing path:", pathname);
  
  // Clear any potential locale cookie on root path
  if (pathname === '/') {
    const response = NextResponse.next();
    // Clear the NEXT_LOCALE cookie if it exists
    response.cookies.delete('NEXT_LOCALE');
    console.log("[i18n] Middleware: Root path - cleared locale cookie");
  }
  
  // Check if the path starts with a locale
  const pathnameHasLocale = routing.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  console.log("[i18n] Middleware: Path has locale:", pathnameHasLocale);
  
  if (pathnameHasLocale) {
    const locale = pathname.split('/')[1];
    console.log("[i18n] Middleware: Detected locale:", locale);
  }
  
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
