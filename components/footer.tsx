"use client";

import { Button } from "@/components/ui/button";
import { useLocaleHref } from "@/hooks/use-locale-href";
import { ArrowUp, ChevronDown, Clock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const t = useTranslations();
  const { localeHref } = useLocaleHref();

  useEffect(() => {
    setMounted(true);
    
    // Show/hide scroll to top button based on scroll position
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const currentYear = new Date().getFullYear();

  // Mobile collapsible section component
  const MobileSection = ({ 
    title, 
    id, 
    children 
  }: { 
    title: string; 
    id: string; 
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections.includes(id);
    
    return (
      <div className="border-b border-gray-700 last:border-0">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between py-4 text-left"
          aria-expanded={isExpanded}
          aria-controls={`footer-${id}`}
        >
          <h4 className="text-base font-semibold text-white">{title}</h4>
          <ChevronDown 
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
        <div
          id={`footer-${id}`}
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? 'max-h-96 pb-4' : 'max-h-0'
          }`}
        >
          {children}
        </div>
      </div>
    );
  };

  return (
    <>
      <footer className="bg-gray-900 text-white relative">
        {/* Mobile-Optimized Footer Content */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Company Info - Always Visible */}
          <div className="pb-8 border-b border-gray-700 md:border-0">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">
                {t("footer.companyName")}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {t("footer.description")}
              </p>
              
              {/* Mobile CTA Buttons */}
              <div className="flex flex-col gap-3 pt-4 md:hidden">
                <a 
                  href="tel:+13375452935" 
                  className="flex items-center justify-center gap-3 bg-turquoise-500 hover:bg-turquoise-600 active:bg-turquoise-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors min-h-[56px]"
                >
                  <Phone className="h-5 w-5" />
                  <span>{t("footer.contact.phone")}</span>
                </a>
                
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(t("footer.contact.address"))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white px-6 py-4 rounded-lg font-semibold transition-colors min-h-[56px]"
                >
                  <MapPin className="h-5 w-5" />
                  <span>Get Directions</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
                
                <a 
                  href="mailto:info@lafayetteequipmentrentals.com"
                  className="flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white px-6 py-4 rounded-lg font-semibold transition-colors min-h-[56px]"
                >
                  <Mail className="h-5 w-5" />
                  <span>Email Us</span>
                </a>
              </div>
              
              {/* Business Hours - Mobile */}
              <div className="md:hidden pt-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-turquoise-500" />
                    <span className="font-semibold text-white">{t("footer.contact.hours")}</span>
                  </div>
                  <div className="text-gray-300 text-sm whitespace-pre-line">
                    {t("footer.contact.schedule")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Collapsible Sections */}
          <div className="md:hidden">
            <MobileSection title={t("footer.sections.equipmentServices")} id="equipment">
              <ul className="space-y-3 px-1">
                <li>
                  <Link
                    href={localeHref("/equipment-rental")}
                    className="text-gray-300 hover:text-turquoise-400 active:text-turquoise-500 transition-colors text-sm flex items-center gap-2 py-2"
                  >
                    <span className="w-1.5 h-1.5 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.allEquipment")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={localeHref("/equipment-rental/excavators")}
                    className="text-gray-300 hover:text-turquoise-400 active:text-turquoise-500 transition-colors text-sm flex items-center gap-2 py-2"
                  >
                    <span className="w-1.5 h-1.5 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.excavators")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={localeHref("/equipment-rental/skid-steers")}
                    className="text-gray-300 hover:text-turquoise-400 active:text-turquoise-500 transition-colors text-sm flex items-center gap-2 py-2"
                  >
                    <span className="w-1.5 h-1.5 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.skidSteers")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={localeHref("/equipment-rental/lifts")}
                    className="text-gray-300 hover:text-turquoise-400 active:text-turquoise-500 transition-colors text-sm flex items-center gap-2 py-2"
                  >
                    <span className="w-1.5 h-1.5 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.aerialLifts")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={localeHref("/equipment-rental/generators")}
                    className="text-gray-300 hover:text-turquoise-400 active:text-turquoise-500 transition-colors text-sm flex items-center gap-2 py-2"
                  >
                    <span className="w-1.5 h-1.5 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.generators")}
                  </Link>
                </li>
              </ul>
            </MobileSection>

            <MobileSection title={t("footer.sections.company")} id="company">
              <ul className="space-y-3 px-1">
                <li>
                  <Link
                    href={localeHref("/about")}
                    className="text-gray-300 hover:text-turquoise-400 active:text-turquoise-500 transition-colors text-sm flex items-center gap-2 py-2"
                  >
                    <span className="w-1.5 h-1.5 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.aboutUs")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={localeHref("/contact")}
                    className="text-gray-300 hover:text-turquoise-400 active:text-turquoise-500 transition-colors text-sm flex items-center gap-2 py-2"
                  >
                    <span className="w-1.5 h-1.5 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.contactUs")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={localeHref("/industries")}
                    className="text-gray-300 hover:text-turquoise-400 active:text-turquoise-500 transition-colors text-sm flex items-center gap-2 py-2"
                  >
                    <span className="w-1.5 h-1.5 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.industries")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={localeHref("/blog")}
                    className="text-gray-300 hover:text-turquoise-400 active:text-turquoise-500 transition-colors text-sm flex items-center gap-2 py-2"
                  >
                    <span className="w-1.5 h-1.5 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.blog")}
                  </Link>
                </li>
              </ul>
            </MobileSection>

            <MobileSection title={t("footer.sections.support")} id="support">
              <ul className="space-y-3 px-1">
                <li>
                  <Link
                    href={localeHref("/support/faq")}
                    className="text-gray-300 hover:text-turquoise-400 active:text-turquoise-500 transition-colors text-sm flex items-center gap-2 py-2"
                  >
                    <span className="w-1.5 h-1.5 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.faq")}
                  </Link>
                </li>
                <li>
                  <a
                    href="/Rubbl-TOS.pdf"
                    className="text-gray-300 hover:text-turquoise-400 active:text-turquoise-500 transition-colors text-sm flex items-center gap-2 py-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="w-1.5 h-1.5 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.termsOfService")}
                  </a>
                </li>
                <li>
                  <Link
                    href="/sitemap.xml"
                    className="text-gray-300 hover:text-turquoise-400 active:text-turquoise-500 transition-colors text-sm flex items-center gap-2 py-2"
                  >
                    <span className="w-1.5 h-1.5 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.sitemap")}
                  </Link>
                </li>
              </ul>
            </MobileSection>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pt-8">
            {/* Contact Info - Desktop */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white mb-4">Contact Info</h4>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(t("footer.contact.address"))}`} 
                 className="flex items-start gap-3 text-sm hover:text-turquoise-400 transition-colors">
                <MapPin className="h-5 w-5 text-turquoise-500 flex-shrink-0 mt-0.5" />
                <div className="text-gray-300">
                  <div className="font-semibold text-white mb-1">
                    {t("footer.contact.location")}
                  </div>
                  <div className="whitespace-pre-line">
                    {t("footer.contact.address")}
                  </div>
                </div>
              </a>

              <a href="tel:+13375452935" 
                 className="flex items-center gap-3 text-sm hover:text-turquoise-400 transition-colors">
                <Phone className="h-5 w-5 text-turquoise-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-white mb-1">
                    {t("footer.contact.callUs")}
                  </div>
                  <span className="text-turquoise-400 hover:text-turquoise-300 transition-colors font-semibold">
                    {t("footer.contact.phone")}
                  </span>
                </div>
              </a>

              <a href="mailto:info@lafayetteequipmentrentals.com"
                 className="flex items-center gap-3 text-sm hover:text-turquoise-400 transition-colors">
                <Mail className="h-5 w-5 text-turquoise-500 flex-shrink-0" />
                <div className="overflow-hidden">
                  <div className="font-semibold text-white mb-1">
                    {t("footer.contact.emailUs")}
                  </div>
                  <span className="text-turquoise-400 hover:text-turquoise-300 transition-colors font-semibold text-sm break-all">
                    {t("footer.contact.email")}
                  </span>
                </div>
              </a>

              <div className="flex items-start gap-3 text-sm">
                <Clock className="h-5 w-5 text-turquoise-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white mb-1">
                    {t("footer.contact.hours")}
                  </div>
                  <div className="text-gray-300 whitespace-pre-line text-sm">
                    {t("footer.contact.schedule")}
                  </div>
                </div>
              </div>
            </div>

            {/* Equipment & Services - Desktop */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6">
                {t("footer.sections.equipmentServices")}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href={localeHref("/equipment-rental")}
                    className="text-gray-300 hover:text-turquoise-400 transition-colors text-sm flex items-center gap-2 font-medium"
                  >
                    <span className="w-1 h-1 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.allEquipment")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={localeHref("/equipment-rental/excavators")}
                    className="text-gray-300 hover:text-turquoise-400 transition-colors text-sm flex items-center gap-2 font-medium"
                  >
                    <span className="w-1 h-1 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.excavators")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={localeHref("/equipment-rental/skid-steers")}
                    className="text-gray-300 hover:text-turquoise-400 transition-colors text-sm flex items-center gap-2 font-medium"
                  >
                    <span className="w-1 h-1 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.skidSteers")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={localeHref("/equipment-rental/lifts")}
                    className="text-gray-300 hover:text-turquoise-400 transition-colors text-sm flex items-center gap-2 font-medium"
                  >
                    <span className="w-1 h-1 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.aerialLifts")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={localeHref("/equipment-rental/generators")}
                    className="text-gray-300 hover:text-turquoise-400 transition-colors text-sm flex items-center gap-2 font-medium"
                  >
                    <span className="w-1 h-1 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.generators")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links - Desktop */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6">
                {t("footer.sections.company")}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href={localeHref("/about")}
                    className="text-gray-300 hover:text-turquoise-400 transition-colors text-sm flex items-center gap-2 font-medium"
                  >
                    <span className="w-1 h-1 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.aboutUs")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={localeHref("/contact")}
                    className="text-gray-300 hover:text-turquoise-400 transition-colors text-sm flex items-center gap-2 font-medium"
                  >
                    <span className="w-1 h-1 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.contactUs")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={localeHref("/industries")}
                    className="text-gray-300 hover:text-turquoise-400 transition-colors text-sm flex items-center gap-2 font-medium"
                  >
                    <span className="w-1 h-1 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.industries")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={localeHref("/blog")}
                    className="text-gray-300 hover:text-turquoise-400 transition-colors text-sm flex items-center gap-2 font-medium"
                  >
                    <span className="w-1 h-1 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.blog")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Resources - Desktop */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6">
                {t("footer.sections.support")}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href={localeHref("/support/faq")}
                    className="text-gray-300 hover:text-turquoise-400 transition-colors text-sm flex items-center gap-2 font-medium"
                  >
                    <span className="w-1 h-1 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.faq")}
                  </Link>
                </li>
                <li>
                  <a
                    href="/Rubbl-TOS.pdf"
                    className="text-gray-300 hover:text-turquoise-400 transition-colors text-sm flex items-center gap-2 font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="w-1 h-1 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.termsOfService")}
                  </a>
                </li>
                <li>
                  <Link
                    href="/sitemap.xml"
                    className="text-gray-300 hover:text-turquoise-400 transition-colors text-sm flex items-center gap-2 font-medium"
                  >
                    <span className="w-1 h-1 bg-turquoise-500 rounded-full"></span>
                    {t("footer.links.sitemap")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Map Section - Desktop Only */}
        <div className="hidden md:block border-t border-gray-700">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-6">
              <h4 className="text-xl font-bold text-white mb-2">
                {t("footer.map.title")}
              </h4>
              <p className="text-gray-300 text-sm">{t("footer.map.subtitle")}</p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl border border-gray-700">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3449.123456789!2d-92.01234567!3d30.123456789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8626a123456789ab%3A0x123456789abcdef0!2s2865%20Ambassador%20Caffery%20Pkwy%20Ste%20135%2C%20Lafayette%2C%20LA%2070506!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lafayette Equipment Rentals Location - 2865 Ambassador Caffery Pkwy, Lafayette, LA"
                className="w-full h-64 md:h-80 lg:h-96"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 bg-gray-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-300 text-xs md:text-sm text-center md:text-left">
                {t("footer.bottom.copyright", { year: currentYear })}
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div className="text-gray-400 text-xs text-center md:text-right">
                  {t("footer.bottom.tagline")}
                </div>
                <Button
                  onClick={scrollToTop}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:text-white hover:border-turquoise-500 hover:bg-turquoise-500/10 transition-colors"
                >
                  <ArrowUp className="h-4 w-4 mr-1" />
                  {t("footer.bottom.backToTop")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Scroll to Top Button - Mobile */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="md:hidden fixed bottom-6 right-6 z-50 bg-turquoise-500 hover:bg-turquoise-600 active:bg-turquoise-700 text-white rounded-full transition-colors duration-200"
          style={{ width: '48px', height: '48px', padding: '0', border: 'none', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          aria-label="Scroll to top"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ pointerEvents: 'none' }}
          >
            <path d="M12 19V5M12 5l-7 7M12 5l7 7" />
          </svg>
        </button>
      )}
    </>
  );
}