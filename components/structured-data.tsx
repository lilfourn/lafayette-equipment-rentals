import Script from "next/script";

interface LocalBusinessData {
  name: string;
  description: string;
  url: string;
  telephone: string;
  email: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
  openingHours: string[];
  priceRange: string;
  image: string;
  logo: string;
  sameAs: string[];
  foundingDate?: string;
  numberOfEmployees?: string;
  yearlyRevenue?: string;
  areaServed?: string[];
  serviceArea?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

interface ProductData {
  name: string;
  description: string;
  image: string;
  brand: string;
  category: string;
  offers: {
    price: string;
    priceCurrency: string;
    availability: string;
    priceValidUntil: string;
  };
}

interface ArticleData {
  headline: string;
  description: string;
  image: string;
  author: string;
  publisher: string;
  datePublished: string;
  dateModified: string;
  url: string;
}

interface FAQData {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

interface EquipmentRentalData {
  name: string;
  description: string;
  provider: string;
  category: string;
  availableAtOrFrom: {
    name: string;
    address: string;
    telephone: string;
  };
  offers: {
    price: string;
    priceCurrency: string;
    priceSpecification: {
      type: string;
      description: string;
    };
  };
}

interface StructuredDataProps {
  type:
    | "LocalBusiness"
    | "Product"
    | "Article"
    | "FAQ"
    | "EquipmentRental"
    | "Organization";
  data:
    | LocalBusinessData
    | ProductData
    | ArticleData
    | FAQData
    | EquipmentRentalData;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const getSchema = () => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": type,
    };

    switch (type) {
      case "LocalBusiness":
        const businessData = data as LocalBusinessData;
        return {
          ...baseSchema,
          "@type": ["LocalBusiness", "Organization", "Store"],
          additionalType: "EquipmentRental",
          name: businessData.name,
          alternateName: [
            "Lafayette Equipment Rental",
            "Lafayette Equipment Rentals",
          ],
          description: businessData.description,
          url: businessData.url,
          telephone: businessData.telephone,
          email: businessData.email,
          image: businessData.image,
          logo: businessData.logo,
          priceRange: businessData.priceRange,
          currenciesAccepted: "USD",
          paymentAccepted: ["Cash", "Credit Card", "Check", "Invoice"],
          foundingDate: businessData.foundingDate || "2009",
          numberOfEmployees: businessData.numberOfEmployees || "10-50",
          yearlyRevenue: businessData.yearlyRevenue,
          slogan: "Professional Equipment Rental Solutions",
          keywords:
            "equipment rental, construction equipment, heavy machinery, Lafayette Louisiana",
          address: {
            "@type": "PostalAddress",
            streetAddress: businessData.address.streetAddress,
            addressLocality: businessData.address.addressLocality,
            addressRegion: businessData.address.addressRegion,
            postalCode: businessData.address.postalCode,
            addressCountry: businessData.address.addressCountry,
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: businessData.geo.latitude,
            longitude: businessData.geo.longitude,
          },
          openingHours: businessData.openingHours,
          sameAs: businessData.sameAs,
          areaServed: businessData.areaServed || [
            "Lafayette, LA",
            "Acadiana Region",
            "Louisiana",
            "Vermilion Parish",
            "Acadia Parish",
            "St. Martin Parish",
            "Iberia Parish",
          ],
          serviceArea: {
            "@type": "GeoCircle",
            geoMidpoint: {
              "@type": "GeoCoordinates",
              latitude: businessData.geo.latitude,
              longitude: businessData.geo.longitude,
            },
            geoRadius: businessData.serviceArea?.radius || "50000", // 50km radius
          },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Equipment Rental Services",
            itemListElement: [
              {
                "@type": "OfferCatalog",
                name: "Construction Equipment",
                itemListElement: [
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Product",
                      name: "Excavator Rental",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Product",
                      name: "Bulldozer Rental",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Product",
                      name: "Skid Steer Rental",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Product",
                      name: "Generator Rental",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Product",
                      name: "Forklift Rental",
                    },
                  },
                ],
              },
            ],
          },
          makesOffer: [
            {
              "@type": "Offer",
              name: "Equipment Rental Services",
              description:
                "Professional construction and heavy equipment rental",
              itemOffered: {
                "@type": "Service",
                name: "Equipment Rental",
                serviceType: "Equipment Rental",
                provider: businessData.name,
                areaServed: businessData.address.addressLocality,
              },
            },
          ],
          review: [
            {
              "@type": "Review",
              reviewRating: {
                "@type": "Rating",
                ratingValue: "4.8",
                bestRating: "5",
              },
              author: {
                "@type": "Person",
                name: "Local Contractor",
              },
              reviewBody:
                "Excellent service and reliable equipment. Fast delivery and professional staff.",
            },
          ],
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "150",
          },
        };

      case "Organization":
        const orgData = data as LocalBusinessData;
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: orgData.name,
          url: orgData.url,
          logo: orgData.logo,
          contactPoint: {
            "@type": "ContactPoint",
            telephone: orgData.telephone,
            contactType: "customer service",
            areaServed: "US-LA",
            availableLanguage: ["English", "Spanish"],
          },
          sameAs: orgData.sameAs,
        };

      case "FAQ":
        const faqData = data as FAQData;
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqData.questions.map((qa) => ({
            "@type": "Question",
            name: qa.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: qa.answer,
            },
          })),
        };

      case "EquipmentRental":
        const equipmentData = data as EquipmentRentalData;
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          name: equipmentData.name,
          description: equipmentData.description,
          provider: {
            "@type": "LocalBusiness",
            name: equipmentData.provider,
          },
          category: equipmentData.category,
          availableAtOrFrom: {
            "@type": "Place",
            name: equipmentData.availableAtOrFrom.name,
            address: equipmentData.availableAtOrFrom.address,
            telephone: equipmentData.availableAtOrFrom.telephone,
          },
          offers: {
            "@type": "Offer",
            price: equipmentData.offers.price,
            priceCurrency: equipmentData.offers.priceCurrency,
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              referenceQuantity: {
                "@type": "QuantitativeValue",
                value: "1",
                unitText: equipmentData.offers.priceSpecification.type,
              },
            },
          },
        };

      case "Product":
        const productData = data as ProductData;
        return {
          ...baseSchema,
          name: productData.name,
          description: productData.description,
          image: productData.image,
          brand: {
            "@type": "Brand",
            name: productData.brand,
          },
          category: productData.category,
          offers: {
            "@type": "Offer",
            price: productData.offers.price,
            priceCurrency: productData.offers.priceCurrency,
            availability: productData.offers.availability,
            priceValidUntil: productData.offers.priceValidUntil,
          },
        };

      case "Article":
        const articleData = data as ArticleData;
        return {
          ...baseSchema,
          headline: articleData.headline,
          description: articleData.description,
          image: articleData.image,
          author: {
            "@type": "Organization",
            name: articleData.author,
          },
          publisher: {
            "@type": "Organization",
            name: articleData.publisher,
            logo: {
              "@type": "ImageObject",
              url: "/logo.png",
            },
          },
          datePublished: articleData.datePublished,
          dateModified: articleData.dateModified,
          url: articleData.url,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": articleData.url,
          },
        };

      default:
        return baseSchema;
    }
  };

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getSchema()),
      }}
    />
  );
}

export function LocalBusinessSchema() {
  const businessData: LocalBusinessData = {
    name: "Lafayette Equipment Rentals",
    description:
      "Professional equipment rental company serving Lafayette, Louisiana and the Acadiana region. Family-owned business providing construction equipment, generators, and heavy machinery rental since 2009.",
    url: "https://www.lafayetteequipmentrentals.com",
    telephone: "+1-337-234-5678",
    email: "info@lafayetteequipmentrentals.com",
    address: {
      streetAddress: "2865 Ambassador Caffery Pkwy, Ste 135",
      addressLocality: "Lafayette",
      addressRegion: "LA",
      postalCode: "70506",
      addressCountry: "US",
    },
    geo: {
      latitude: 30.2241,
      longitude: -92.0198,
    },
    openingHours: ["Mo-Fr 07:00-18:00", "Sa 08:00-16:00", "Su closed"],
    priceRange: "$$",
    image: "https://www.lafayetteequipmentrentals.com/hero-image.jpg",
    logo: "https://www.lafayetteequipmentrentals.com/logo.png",
    sameAs: [
      "https://www.facebook.com/lafayetteequipment",
      "https://www.linkedin.com/company/lafayette-equipment-rentals",
      "https://www.google.com/business/",
    ],
    foundingDate: "2009",
    numberOfEmployees: "25",
    areaServed: [
      "Lafayette, LA",
      "Acadiana Region, LA",
      "Vermilion Parish, LA",
      "Acadia Parish, LA",
      "St. Martin Parish, LA",
      "Iberia Parish, LA",
      "Louisiana",
    ],
  };

  return <StructuredData type="LocalBusiness" data={businessData} />;
}

export function OrganizationSchema() {
  const orgData: LocalBusinessData = {
    name: "Lafayette Equipment Rentals",
    description: "Professional equipment rental services",
    url: "https://www.lafayetteequipmentrentals.com",
    telephone: "+1-337-234-5678",
    email: "info@lafayetteequipmentrentals.com",
    address: {
      streetAddress: "2865 Ambassador Caffery Pkwy, Ste 135",
      addressLocality: "Lafayette",
      addressRegion: "LA",
      postalCode: "70506",
      addressCountry: "US",
    },
    geo: { latitude: 30.2241, longitude: -92.0198 },
    openingHours: ["Mo-Fr 07:00-18:00", "Sa 08:00-16:00"],
    priceRange: "$$",
    image: "https://www.lafayetteequipmentrentals.com/hero-image.jpg",
    logo: "https://www.lafayetteequipmentrentals.com/logo.png",
    sameAs: [
      "https://www.facebook.com/lafayetteequipment",
      "https://www.linkedin.com/company/lafayette-equipment-rentals",
    ],
  };

  return <StructuredData type="Organization" data={orgData} />;
}

export function EquipmentRentalSchema() {
  const equipmentData: EquipmentRentalData = {
    name: "Equipment Rental Services",
    description:
      "Professional construction and heavy equipment rental services in Lafayette, Louisiana",
    provider: "Lafayette Equipment Rentals",
    category: "Equipment Rental",
    availableAtOrFrom: {
      name: "Lafayette Equipment Rentals",
      address: "2865 Ambassador Caffery Pkwy, Ste 135, Lafayette, LA 70506",
      telephone: "+1-337-234-5678",
    },
    offers: {
      price: "Variable",
      priceCurrency: "USD",
      priceSpecification: {
        type: "DAY",
        description: "Daily rental rates available",
      },
    },
  };

  return <StructuredData type="EquipmentRental" data={equipmentData} />;
}

// Convenience wrapper for Article structured data
export function ArticleSchema(props: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  url: string;
  author?: string;
  publisher?: string;
}) {
  const {
    headline,
    description,
    image,
    datePublished,
    dateModified,
    url,
    author = "Lafayette Equipment Rentals",
    publisher = "Lafayette Equipment Rentals",
  } = props;

  return (
    <StructuredData
      type="Article"
      data={{
        headline,
        description,
        image,
        author,
        publisher,
        datePublished,
        dateModified,
        url,
      }}
    />
  );
}
