import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, ShieldCheck, Wrench, Users, ChevronRight } from "lucide-react"

const infrastructureCategories = [
  { name: "Compaction", image: "/placeholder.svg?width=200&height=200" },
  { name: "Air Compressors & Tools", image: "/placeholder.svg?width=200&height=200" },
  { name: "Concrete & Masonry", image: "/placeholder.svg?width=200&height=200" },
  { name: "Dumpers & Buggies", image: "/placeholder.svg?width=200&height=200" },
  { name: "Earthmoving", image: "/placeholder.svg?width=200&height=200" },
  { name: "Generators", image: "/placeholder.svg?width=200&height=200" },
  { name: "Heaters & Fans", image: "/placeholder.svg?width=200&height=200" },
  { name: "Pumps", image: "/placeholder.svg?width=200&height=200" },
  { name: "Site-Prep", image: "/placeholder.svg?width=200&height=200" },
  { name: "Welders", image: "/placeholder.svg?width=200&height=200" },
]

const specializedSolutions = [
  { name: "Ground protection", href: "#" },
  { name: "Power and HVAC services", href: "#" },
  { name: "Trench safety", href: "#" },
  { name: "Scaffold services", href: "#" },
  { name: "Temporary structures", href: "#" },
  { name: "Tools and equipment", href: "#" },
  { name: "Climate control", href: "#" },
  { name: "Mobile storage", href: "#" },
]

export default function CivilCommercialPage() {
  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] w-full flex items-center justify-center text-center text-white">
        <Image
          src="/placeholder.svg?width=1920&height=700"
          alt="Civil and commercial construction site"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Rent Civil and Commercial Construction Equipment
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-gray-200">
            We understand the demands of the construction industry. That's why we provide reliable equipment and expert
            support to keep your project moving forward.
          </p>
          <div className="mt-8">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6">
              Contact a Rental Expert
            </Button>
          </div>
        </div>
      </section>

      <main>
        {/* Solutions Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Construction equipment rental solutions
            </h2>
            <p className="mt-6 max-w-3xl mx-auto text-lg leading-8 text-gray-600">
              From groundbreaking to finishing touches, we offer a comprehensive inventory of construction equipment to
              meet the needs of any civil or commercial project. Our flexible rental terms and expert support ensure you
              have the right tools for the job, exactly when you need them.
            </p>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="infrastructure" className="w-full">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto">
                <TabsTrigger value="infrastructure" className="py-3 text-base">
                  Infrastructure
                </TabsTrigger>
                <TabsTrigger value="commercial" className="py-3 text-base">
                  Commercial & Residential
                </TabsTrigger>
                <TabsTrigger value="industrial" className="py-3 text-base">
                  Industrial
                </TabsTrigger>
              </TabsList>
              <TabsContent value="infrastructure" className="mt-12">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {infrastructureCategories.map((category) => (
                    <EquipmentCategoryCard key={category.name} {...category} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="commercial" className="mt-12 text-center">
                <p className="text-gray-600">Commercial & Residential equipment categories coming soon.</p>
              </TabsContent>
              <TabsContent value="industrial" className="mt-12 text-center">
                <p className="text-gray-600">Industrial equipment categories coming soon.</p>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Specialized Solutions Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center tracking-tight text-gray-900 sm:text-4xl">
              Specialized solutions for infrastructure
            </h2>
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {specializedSolutions.map((solution) => (
                  <Link key={solution.name} href={solution.href} className="group flex items-center p-2">
                    <ChevronRight className="h-5 w-5 text-orange-600 mr-3 transition-transform group-hover:translate-x-1" />
                    <span className="text-lg text-gray-700 group-hover:text-orange-600 font-medium">
                      {solution.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Work With Us Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center tracking-tight text-gray-900 sm:text-4xl">
              Why work with us?
            </h2>
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <BenefitCard
                icon={<Clock className="h-10 w-10 text-orange-600" />}
                title="Keep your project on schedule and on budget"
                description="With our flexible rental options and timely delivery, you can manage your resources effectively and avoid project delays."
              />
              <BenefitCard
                icon={<ShieldCheck className="h-10 w-10 text-orange-600" />}
                title="Reliable equipment you can count on"
                description="Our fleet is meticulously maintained and inspected to ensure it performs safely and efficiently on your job site."
              />
              <BenefitCard
                icon={<Wrench className="h-10 w-10 text-orange-600" />}
                title="A solution for every stage of your project"
                description="From site prep to finishing, our extensive inventory provides the right tools for every phase of construction."
              />
              <BenefitCard
                icon={<Users className="h-10 w-10 text-orange-600" />}
                title="Expert support when you need it"
                description="Our knowledgeable team is here to help you select the right equipment and provide support throughout your rental."
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function EquipmentCategoryCard({ name, image }: { name: string; image: string }) {
  return (
    <Link href="#" className="group block text-center">
      <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 group-hover:shadow-md transition-shadow">
        <Image src={image || "/placeholder.svg"} alt={name} fill className="object-contain p-2" />
      </div>
      <p className="mt-3 font-semibold text-gray-800 group-hover:text-orange-600">{name}</p>
    </Link>
  )
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center p-6 bg-gray-50 rounded-lg">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  )
}
