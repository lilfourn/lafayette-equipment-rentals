import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ChevronRight, Clock, MapPin, Phone, Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type React from "react";

export default async function AboutUsPage() {
  const t = await getTranslations();
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">
        {/* Clean Hero Section */}
        <section className="relative min-h-[500px] md:min-h-[600px] overflow-hidden bg-gray-50">
          {/* Background with Lafayette Image */}
          <div className="absolute inset-0">
            <Image
              src="/about_us_image.JPG"
              alt="Lafayette, Louisiana"
              fill
              className="object-cover object-center"
              priority
            />
            {/* Softer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="container mx-auto px-4 py-16 md:py-20">
              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 text-sm mb-8 text-white/80">
                <Link href="/" className="hover:text-white transition-colors">
                  {t("navigation.home")}
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-white">{t("navigation.aboutUs")}</span>
              </nav>

              <div className="max-w-4xl">
                {/* Cleaner Headline */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                  {t("aboutUs.hero.title")}
                </h1>

                {/* Simple tagline */}
                <p className="text-xl md:text-2xl text-white/90 mb-8">
                  {t("aboutUs.hero.subtitle")}
                </p>

                <p className="text-lg text-white/80 mb-10 max-w-2xl"></p>

                {/* Simplified CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/contact">
                    <Button className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-6 text-lg font-semibold transition-all">
                      <Phone className="mr-2 h-5 w-5" />
                      {t("aboutUs.hero.getInTouch")}
                    </Button>
                  </Link>
                  <Link href="/equipment-rental">
                    <Button className="bg-white/10 backdrop-blur border-2 border-white text-white hover:bg-white hover:text-black px-8 py-6 text-lg font-semibold transition-all">
                      <Truck className="mr-2 h-5 w-5" />
                      {t("aboutUs.hero.browseEquipment")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story Section - Simple and Professional */}
        <section className="py-20 md:py-28 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              {/* Simple Title */}
              <div className="text-center mb-16">
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
                  {t("aboutUs.story.title")}
                </h2>
                <p className="text-xl text-gray-600">
                  {t("aboutUs.story.subtitle")}
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left side - Image */}
                <div className="relative">
                  <div className="rounded-lg overflow-hidden shadow-xl">
                    <Image
                      src="/about_me_page.jpg"
                      alt="Lafayette Louisiana"
                      width={600}
                      height={400}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>

                {/* Right side - Simple content */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      {t("aboutUs.story.foundedTitle")}
                    </h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {t("aboutUs.story.foundedText")}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      {t("aboutUs.story.localTitle")}
                    </h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {t("aboutUs.story.localText")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              {/* Simple Header */}
              <div className="text-center mb-16">
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
                  {t("aboutUs.difference.title")}
                </h2>
                <p className="text-xl text-gray-600">
                  {t("aboutUs.difference.subtitle")}
                </p>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                {/* Left side - Image */}
                <div className="relative">
                  <div className="rounded-lg overflow-hidden shadow-xl">
                    <Image
                      src="/why_they_trust_us.jpg"
                      alt="Louisiana Pelican and Shipping Containers"
                      width={600}
                      height={400}
                      className="w-full h-auto object-cover"
                    />
                    {/* Image only */}
                  </div>
                </div>

                {/* Right side - Key Points */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      {t("aboutUs.difference.fastDelivery")}
                    </h3>
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                      {t("aboutUs.difference.fastDeliveryText")}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="border-l-4 border-yellow-400 pl-6 py-2">
                      <p className="font-bold text-gray-900 text-lg">
                        {t("aboutUs.difference.maintainedMachines")}
                      </p>
                      <p className="text-gray-600 mt-1">
                        {t("aboutUs.difference.maintainedText")}
                      </p>
                    </div>

                    <div className="border-l-4 border-red-600 pl-6 py-2">
                      <p className="font-bold text-gray-900 text-lg">
                        {t("aboutUs.difference.localExperts")}
                      </p>
                      <p className="text-gray-600 mt-1">
                        {t("aboutUs.difference.localExpertsText")}
                      </p>
                    </div>

                    <div className="border-l-4 border-yellow-400 pl-6 py-2">
                      <p className="font-bold text-gray-900 text-lg">
                        {t("aboutUs.difference.responsiveSupport")}
                      </p>
                      <p className="text-gray-600 mt-1">
                        {t("aboutUs.difference.responsiveSupportText")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Row - Simple and Clean */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-4xl font-black text-slate-800 mb-2">
                    50+
                  </div>
                  <div className="text-gray-700 font-semibold">
                    {t("aboutUs.difference.stats.serviceRadius")}
                  </div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-4xl font-black text-slate-800 mb-2">
                    24/7
                  </div>
                  <div className="text-gray-700 font-semibold">
                    {t("aboutUs.difference.stats.supportAvailable")}
                  </div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-4xl font-black text-slate-800 mb-2">
                    1000+
                  </div>
                  <div className="text-gray-700 font-semibold">
                    {t("aboutUs.difference.stats.projectsCompleted")}
                  </div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-4xl font-black text-slate-800 mb-2">
                    15+
                  </div>
                  <div className="text-gray-700 font-semibold">
                    {t("aboutUs.difference.stats.yearsInBusiness")}
                  </div>
                </div>
              </div>

              {/* Industries We Serve - Simple Grid */}
              <div className="bg-gray-900 rounded-lg p-8 md:p-12">
                <h3 className="text-3xl font-bold text-white mb-8">
                  {t("navigation.industries")}
                </h3>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-white">
                    <span className="text-yellow-400 font-black text-xl">
                      •
                    </span>
                    <span className="ml-3 font-semibold">
                      {t("industries.constructionInfrastructure")}
                    </span>
                  </div>
                  <div className="text-white">
                    <span className="text-yellow-400 font-black text-xl">
                      •
                    </span>
                    <span className="ml-3 font-semibold">
                      {t("industries.energyUtilities")}
                    </span>
                  </div>
                  <div className="text-white">
                    <span className="text-yellow-400 font-black text-xl">
                      •
                    </span>
                    <span className="ml-3 font-semibold">
                      {t("industries.environmentalLandscaping")}
                    </span>
                  </div>
                  <div className="text-white">
                    <span className="text-yellow-400 font-black text-xl">
                      •
                    </span>
                    <span className="ml-3 font-semibold">
                      {t("industries.transportationLogistics")}
                    </span>
                  </div>
                  <div className="text-white">
                    <span className="text-yellow-400 font-black text-xl">
                      •
                    </span>
                    <span className="ml-3 font-semibold">
                      {t("industries.commercialResidential")}
                    </span>
                  </div>
                  <div className="text-white">
                    <span className="text-yellow-400 font-black text-xl">
                      •
                    </span>
                    <span className="ml-3 font-semibold">
                      {t("industries.specialtyServices")}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-700">
                  <p className="text-yellow-400 font-bold mb-3">
                    {t("aboutUs.industries.servingAllAcadiana")}
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    {t("aboutUs.industries.citiesList")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 md:py-20 bg-white -mt-1">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="text-4xl md:text-5xl font-bold text-slate-800 mb-2">
                  30,000+
                </div>
                <div className="text-sm md:text-base text-gray-600 font-medium">
                  {t("aboutUs.stats.equipmentPieces")}
                </div>
              </div>
              <div className="text-center group">
                <div className="text-4xl md:text-5xl font-bold text-slate-800 mb-2">
                  15+
                </div>
                <div className="text-sm md:text-base text-gray-600 font-medium">
                  {t("aboutUs.stats.yearsExperience")}
                </div>
              </div>
              <div className="text-center group">
                <div className="text-4xl md:text-5xl font-bold text-slate-800 mb-2">
                  24/7
                </div>
                <div className="text-sm md:text-base text-gray-600 font-medium">
                  {t("aboutUs.stats.customerSupport")}
                </div>
              </div>
              <div className="text-center group">
                <div className="text-4xl md:text-5xl font-bold text-slate-800 mb-2">
                  100%
                </div>
                <div className="text-sm md:text-base text-gray-600 font-medium">
                  {t("aboutUs.stats.satisfactionRate")}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12">
                {t("aboutUs.location.title")}
              </h2>
              <div className="grid md:grid-cols-2 gap-12 items-stretch">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {t("aboutUs.location.companyName")}
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <MapPin className="h-6 w-6 text-red-600 mr-4 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">
                          {t("aboutUs.location.address")}
                        </p>
                        <p className="text-gray-700">
                          2865 Ambassador Caffery Pkwy, Ste 135
                          <br />
                          Lafayette, LA 70506
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Phone className="h-6 w-6 text-red-600 mr-4 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">
                          {t("aboutUs.location.phone")}
                        </p>
                        <a
                          href="tel:+13375452935"
                          className="text-red-600 hover:text-red-700 font-medium text-lg"
                        >
                          (337) 545-2935
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Clock className="h-6 w-6 text-red-600 mr-4 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">
                          {t("aboutUs.location.businessHours")}
                        </p>
                        <p className="text-gray-700">
                          {t("aboutUs.location.weekdays")}
                          <br />
                          {t("aboutUs.location.sunday")}
                        </p>
                      </div>
                    </div>

                    <div className="bg-turquoise-50 border border-turquoise-200 p-4 rounded-lg">
                      <p className="text-gray-700 text-sm">
                        {t("aboutUs.location.locationNote")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-96 md:h-auto rounded-2xl overflow-hidden shadow-lg">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3478.123456789!2d-92.0198!3d30.2241!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86249c8b33333333%3A0x1234567890abcdef!2s2865%20Ambassador%20Caffery%20Pkwy%2C%20Lafayette%2C%20LA%2070506!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Lafayette Equipment Rentals Location"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner Section */}
        <section className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative container mx-auto px-4 py-20 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t("aboutUs.cta.title")}
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto text-white/90">
              {t("aboutUs.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-turquoise-500 text-white hover:bg-turquoise-600 text-lg px-8 py-6 font-semibold"
                >
                  {t("aboutUs.cta.talkToSpecialist")}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/equipment-rental">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white bg-white/10 backdrop-blur text-white hover:bg-white hover:text-red-600 text-lg px-8 py-6 font-semibold"
                >
                  {t("aboutUs.cta.browseEquipment")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
