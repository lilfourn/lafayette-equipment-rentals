import Footer from "@/components/footer";
import HCaptchaProvider from "@/components/hcaptcha-provider";
import Header from "@/components/header";
import { locales } from "@/i18n";
import { getServerData } from "@/lib/server-data";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import type React from "react";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // Await params before destructuring
  const { locale } = await params;

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
  );
}
