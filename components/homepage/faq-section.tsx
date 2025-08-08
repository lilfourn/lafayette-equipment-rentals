"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { memo, useState } from "react";

interface FAQSectionProps {
  locale: string;
}

export const FAQSection = memo(function FAQSection({ locale }: FAQSectionProps) {
  const t = useTranslations();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: t("homepage.faq.questions.0.question"),
      answer: t("homepage.faq.questions.0.answer"),
    },
    {
      question: t("homepage.faq.questions.1.question"),
      answer: t("homepage.faq.questions.1.answer"),
    },
    {
      question: t("homepage.faq.questions.2.question"),
      answer: t("homepage.faq.questions.2.answer"),
    },
    {
      question: t("homepage.faq.questions.3.question"),
      answer: t("homepage.faq.questions.3.answer"),
    },
    {
      question: t("homepage.faq.questions.4.question"),
      answer: t("homepage.faq.questions.4.answer"),
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <Badge className="mb-4 text-sm px-4 py-1 bg-yellow-100 text-yellow-800 border-yellow-200">
            {t("homepage.faq.category")}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            {t("homepage.faq.title")}
          </h2>
          <p className="text-xl text-gray-600">
            {t("homepage.faq.subtitle")}
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                aria-expanded={openFAQ === index}
              >
                <span className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
                    openFAQ === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openFAQ === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href={`/${locale}/support/faq`}>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-turquoise-600 text-turquoise-600 hover:bg-turquoise-50 font-semibold"
            >
              View All FAQs
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});