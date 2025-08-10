"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  Search, 
  ChevronRight, 
  Clock, 
  CreditCard, 
  Truck, 
  HeadphonesIcon,
  Building2,
  HelpCircle,
  Users,
  Settings
} from "lucide-react"
import Link from "next/link"

const faqData = [
  {
    topic: "About Us",
    id: "about-us",
    icon: Building2,
    questions: [
      {
        q: "What are your hours of operation?",
        a: "Our Lafayette, LA location is open Monday to Saturday, 7 AM to 6 PM. Please call ahead for holiday hours or special closures.",
      },
      {
        q: "Is Lafayette Equipment Rental Service open on holidays?",
        a: "We are closed on major holidays such as New Year's Day, Memorial Day, Independence Day, Labor Day, Thanksgiving Day, and Christmas Day. For Lafayette-specific holiday hours, please contact our local office.",
      },
      {
        q: "How can I find your Lafayette, LA location?",
        a: "Visit us at 2865 Ambassador Caffery Pkwy, Ste 135, Lafayette, LA 70506, or check our website for directions and contact info.",
      },
    ],
  },
  {
    topic: "Reservations and Payments",
    id: "reservations-payments",
    icon: CreditCard,
    questions: [
      {
        q: "How do I reserve equipment in Lafayette, LA?",
        a: "You can reserve equipment online, by calling our Lafayette office, or by visiting us in person.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards, checks, and cash at our Lafayette location. Commercial accounts may qualify for credit terms.",
      },
      {
        q: "Is a deposit required?",
        a: "A deposit may be required depending on the equipment and rental duration. Our Lafayette team will inform you at the time of reservation.",
      },
    ],
  },
  {
    topic: "Delivery, Pickup and Returns",
    id: "delivery-pickup-returns",
    icon: Truck,
    questions: [
      {
        q: "Do you offer equipment delivery in Lafayette, LA?",
        a: "Yes, we offer delivery and pickup services throughout Lafayette and the surrounding areas. Fees vary based on distance and equipment size.",
      },
      {
        q: "Can I pick up equipment myself?",
        a: "Yes! Free pickup is available at our Lafayette location. Please bring a valid driver's license and an appropriate vehicle/trailer for transport.",
      },
      {
        q: "What is your policy on late returns?",
        a: "Equipment returned after the agreed-upon time may incur additional charges. Please call our Lafayette office if you anticipate a delay.",
      },
    ],
  },
  {
    topic: "Support",
    id: "support",
    icon: HeadphonesIcon,
    questions: [
      {
        q: "What if the equipment breaks down during my rental?",
        a: "Contact our Lafayette, LA support line immediately. We offer 24/7 support and will arrange for repair or replacement as quickly as possible.",
      },
      {
        q: "Do you provide training on equipment operation?",
        a: "Basic operating instructions are provided with all rentals. For more comprehensive training, ask our Lafayette staff about available operator training programs.",
      },
    ],
  },
]

const topics = [
  { name: "About Us", id: "about-us", href: "#about-us", icon: Building2 },
  { name: "Delivery, Pickup and Returns", id: "delivery-pickup-returns", href: "#delivery-pickup-returns", icon: Truck },
  { name: "Commercial Credit", id: "commercial-credit", href: "#commercial-credit", icon: Users },
  { name: "Procure-To-Pay", id: "procure-to-pay", href: "#procure-to-pay", icon: Settings },
  { name: "Reservations and Payments", id: "reservations-payments", href: "#reservations-payments", icon: CreditCard },
  { name: "Account Management", id: "account-management", href: "#account-management", icon: Users },
  { name: "Support", id: "support", href: "#support", icon: HeadphonesIcon },
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Basic search filter (can be enhanced)
  const filteredFaqData = faqData
    .map((section) => ({
      ...section,
      questions: section.questions.filter(
        (qna) =>
          qna.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          qna.a.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((section) => section.questions.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Gradient */}
      <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-yellow-500 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-800 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-lg">
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Find answers to common questions about equipment rentals in Lafayette, LA
            </p>
          </div>
        </div>
        
        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0 w-full">
          <svg className="w-full h-16 md:h-24" viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 24L60 28.2C120 32.3 240 40.7 360 38.3C480 36 600 23 720 21.2C840 19.3 960 28.7 1080 34C1200 39.3 1320 40.7 1380 41.3L1440 42V74H1380C1320 74 1200 74 1080 74C960 74 840 74 720 74C600 74 480 74 360 74C240 74 120 74 60 74H0V24Z" fill="#f9fafb"/>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Search Bar */}
        <div className="max-w-3xl mx-auto -mt-20 md:-mt-24 relative z-10 mb-16">
          <div className="bg-white rounded-2xl shadow-2xl p-3 border border-gray-100">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search frequently asked questions..."
                className="w-full pl-14 pr-4 py-6 text-lg border-0 focus:ring-2 focus:ring-red-500/20 bg-transparent rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Topic Cards */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Topic</h2>
          <p className="text-gray-600 mb-8">Select a category to find related questions and answers</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {topics.map((topic) => {
              const Icon = topic.icon
              const isActive = faqData.some(section => section.id === topic.id)
              
              return (
                <Link
                  key={topic.id}
                  href={topic.href}
                  className={`group relative bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-200 ${
                    isActive 
                      ? 'hover:shadow-lg hover:border-red-200 hover:-translate-y-1' 
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                  onClick={!isActive ? (e) => e.preventDefault() : undefined}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      isActive 
                        ? 'bg-red-50 text-red-600 group-hover:bg-red-100' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{topic.name}</h3>
                      {!isActive && (
                        <span className="text-xs text-gray-500">Coming Soon</span>
                      )}
                    </div>
                  </div>
                  {isActive && (
                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-red-600 transition-transform group-hover:translate-x-1" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="max-w-4xl mx-auto">
          {filteredFaqData.map((section) => {
            const Icon = section.icon
            
            return (
              <div key={section.id} id={section.id} className="mb-12 scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Section Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <Icon className="h-6 w-6 text-red-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">{section.topic}</h2>
                    </div>
                  </div>
                  
                  {/* Questions */}
                  <Accordion type="single" collapsible className="divide-y divide-gray-200">
                    {section.questions.map((qna, index) => (
                      <AccordionItem 
                        key={index} 
                        value={`item-${section.id}-${index}`}
                        className="border-0"
                      >
                        <AccordionTrigger className="px-8 py-6 text-left hover:no-underline hover:bg-gray-50 transition-colors">
                          <div className="flex items-start space-x-3 text-left">
                            <div className="mt-0.5 p-1.5 bg-yellow-100 text-yellow-700 rounded-full flex-shrink-0">
                              <HelpCircle className="h-4 w-4" />
                            </div>
                            <span className="text-lg font-medium text-gray-900 pr-4">{qna.q}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-8 pb-6">
                          <div className="ml-10 text-gray-600 leading-relaxed">
                            {qna.a}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            )
          })}
        </div>

        {/* No Results Message */}
        {searchTerm && filteredFaqData.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We couldn't find any FAQs matching "{searchTerm}". Try searching with different keywords or browse by topic above.
            </p>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-12 md:px-12 md:py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Our team in Lafayette is here to help. Contact us for personalized assistance with your equipment rental needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold rounded-lg transition-colors"
              >
                Contact Us
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="tel:+13375452935"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold rounded-lg border border-white/20 transition-colors"
              >
                <Clock className="mr-2 h-5 w-5" />
                Call Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}