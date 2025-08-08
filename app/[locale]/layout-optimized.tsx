import Footer from "@/components/footer";
import HCaptchaProvider from "@/components/hcaptcha-provider";
import Header from "@/components/header";
import { locales } from "@/i18n";
import { getServerData } from "@/lib/server-data";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";
import type React from "react";

// Optimize font loading with Next.js font optimization
const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Use font-display: swap for better performance
  preload: true, // Preload the font
  fallback: ["system-ui", "arial"], // Provide fallbacks
  variable: "--font-inter", // CSS variable for the font
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  // Get locale from params
  const { locale } = params;

  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Fetch data in parallel
  const [serverData, messages] = await Promise.all([
    getServerData(),
    getMessages(),
  ]);

  return (
    <html lang={locale} className={inter.variable}>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://kimberrubblstg.blob.core.windows.net"
        />

        {/* DNS prefetch for additional performance */}
        <link
          rel="dns-prefetch"
          href="https://kimberrubblstg.blob.core.windows.net"
        />

        {/* Preload critical resources */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/inter-var.woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <HCaptchaProvider>
            <div className="relative flex min-h-screen flex-col">
              {/* Header */}
              <Header serverData={serverData} />

              {/* Main Content */}
              <main className="flex-1 relative">{children}</main>

              {/* Footer */}
              <Footer />
            </div>
          </HCaptchaProvider>
        </NextIntlClientProvider>

        {/* Load analytics and non-critical scripts after interactive */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=YOUR_LA_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'YOUR_LA_ID');
          `}
        </Script>
      </body>
    </html>
  );
}
