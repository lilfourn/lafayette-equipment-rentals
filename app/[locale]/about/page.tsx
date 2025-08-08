import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Truck, 
  Wrench, 
  MapPin, 
  MessageSquare, 
  Award, 
  Users, 
  Clock, 
  Shield, 
  Phone,
  ChevronRight,
  CheckCircle,
  Star,
  Building
} from "lucide-react"

export default function AboutUsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">
        {/* Rugged Hero Section with Lafayette Image */}
        <section className="relative min-h-[700px] md:min-h-[800px] overflow-hidden">
          {/* Background with Lafayette Image */}
          <div className="absolute inset-0">
            <Image
              src="/about_us_image.JPG"
              alt="Lafayette, Louisiana Sign - Community Landmark"
              fill
              className="object-cover object-center"
              priority
            />
            {/* Heavy dark overlay for rugged industrial look */}
            <div className="absolute inset-0 bg-black/75"></div>
            {/* Industrial texture overlay */}
            <div className="absolute inset-0 mix-blend-overlay opacity-30" style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 35px,
                rgba(255,255,255,.05) 35px,
                rgba(255,255,255,.05) 70px
              )`
            }}></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="container mx-auto px-4 py-20 md:py-24">
              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 text-sm mb-8 text-white/70">
                <Link href="/" className="hover:text-yellow-400 transition-colors font-semibold uppercase tracking-wide">HOME</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-yellow-400 font-bold uppercase tracking-wide">About Us</span>
              </nav>
              
              <div className="max-w-5xl">
                {/* Main Headline - Bold and Industrial */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 tracking-tight">
                  <span className="text-white block">LOCALLY OWNED.</span>
                  <span className="text-yellow-400 block mt-2">
                    BUILT TOUGH.
                  </span>
                  <span className="text-red-500 block mt-2 text-4xl md:text-5xl lg:text-6xl">
                    LAFAYETTE STRONG.
                  </span>
                </h1>
                
                {/* Tagline with industrial separator */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-1 w-20 bg-yellow-400"></div>
                  <p className="text-xl md:text-2xl text-white/90 font-bold uppercase tracking-wide">
                    Since 2009
                  </p>
                </div>
                
                <p className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl leading-relaxed">
                  Lafayette Equipment Rentals powers the backbone of Southern Louisiana. 
                  From construction sites to oil fields, we deliver the heavy machinery 
                  that builds the Acadiana region.
                </p>
                
                {/* CTA Buttons - Bold Industrial Style */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/contact">
                    <Button className="bg-yellow-400 hover:bg-yellow-500 text-black px-10 py-7 text-xl font-black uppercase tracking-wide shadow-2xl transition-all duration-200 transform hover:scale-105">
                      <Phone className="mr-3 h-6 w-6" />
                      Call Now
                    </Button>
                  </Link>
                  <Link href="/equipment-rental">
                    <Button className="bg-transparent border-4 border-white text-white hover:bg-white hover:text-black px-10 py-7 text-xl font-black uppercase tracking-wide transition-all duration-200 transform hover:scale-105">
                      <Truck className="mr-3 h-6 w-6" />
                      Get Equipment
                    </Button>
                  </Link>
                </div>
                
                {/* Contact Info Bar */}
                <div className="mt-12 flex flex-wrap gap-6 text-white/90">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-yellow-400" />
                    <span className="font-bold">LAFAYETTE, LA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-yellow-400" />
                    <span className="font-bold">(337) 234-1234</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-400" />
                    <span className="font-bold">24/7 SUPPORT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom industrial edge */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600"></div>

        </section>

        {/* Why Lafayette Trusts Us Section - Rugged Industrial Style */}
        <section className="relative bg-gray-100">
          {/* Industrial pattern background */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              #000,
              #000 1px,
              transparent 1px,
              transparent 40px
            ),
            repeating-linear-gradient(
              0deg,
              #000,
              #000 1px,
              transparent 1px,
              transparent 40px
            )`
          }}></div>
          
          {/* Content Container */}
          <div className="relative container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-7xl mx-auto">
              {/* Section Header with Industrial Style */}
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 uppercase tracking-tight mb-4">
                  Why Lafayette Trusts Us
                </h2>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="h-1 w-20 bg-red-600"></div>
                  <div className="h-3 w-3 bg-yellow-400 rotate-45"></div>
                  <div className="h-1 w-20 bg-red-600"></div>
                </div>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto font-bold">
                  HEAVY EQUIPMENT. HEAVY RESPONSIBILITY. WE DELIVER BOTH.
                </p>
              </div>
              
              {/* Stats Grid - Bold Industrial Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                <div className="bg-white border-4 border-gray-900 p-6 text-center transform hover:-translate-y-1 transition-transform">
                  <div className="text-5xl font-black text-red-600 mb-2">50+</div>
                  <div className="text-sm font-bold text-gray-900 uppercase tracking-wide">Mile Radius</div>
                </div>
                <div className="bg-gray-900 border-4 border-gray-900 p-6 text-center transform hover:-translate-y-1 transition-transform">
                  <div className="text-5xl font-black text-yellow-400 mb-2">24/7</div>
                  <div className="text-sm font-bold text-white uppercase tracking-wide">Support</div>
                </div>
                <div className="bg-white border-4 border-gray-900 p-6 text-center transform hover:-translate-y-1 transition-transform">
                  <div className="text-5xl font-black text-red-600 mb-2">1000+</div>
                  <div className="text-sm font-bold text-gray-900 uppercase tracking-wide">Projects</div>
                </div>
                <div className="bg-yellow-400 border-4 border-gray-900 p-6 text-center transform hover:-translate-y-1 transition-transform">
                  <div className="text-5xl font-black text-gray-900 mb-2">15+</div>
                  <div className="text-sm font-bold text-gray-900 uppercase tracking-wide">Years Strong</div>
                </div>
              </div>
              
              {/* Two Column Content */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Column - Our Promise */}
                <div className="space-y-6">
                  <div className="bg-white border-l-8 border-red-600 p-8 shadow-xl">
                    <h3 className="text-3xl font-black text-gray-900 mb-4 uppercase">
                      Built on Trust
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                      When you need heavy equipment in Lafayette, you need it NOW. 
                      No excuses. No delays. Just reliable machinery delivered on time, 
                      every time.
                    </p>
                    
                    {/* Key Points with Industrial Checkmarks */}
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-yellow-400 mt-1 mr-3 flex-shrink-0"></div>
                        <div>
                          <p className="font-black text-gray-900 uppercase">Local Stock</p>
                          <p className="text-gray-600">Equipment ready to roll from our Lafayette yard</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-yellow-400 mt-1 mr-3 flex-shrink-0"></div>
                        <div>
                          <p className="font-black text-gray-900 uppercase">Certified Mechanics</p>
                          <p className="text-gray-600">Every machine inspected and job-ready</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-yellow-400 mt-1 mr-3 flex-shrink-0"></div>
                        <div>
                          <p className="font-black text-gray-900 uppercase">Emergency Response</p>
                          <p className="text-gray-600">24/7 support when equipment goes down</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Industries We Serve */}
                <div className="space-y-6">
                  <div className="bg-gray-900 p-8 text-white">
                    <h3 className="text-3xl font-black mb-6 uppercase text-yellow-400">
                      Industries We Power
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border-l-4 border-yellow-400 pl-4">
                        <p className="font-bold uppercase">Construction</p>
                      </div>
                      <div className="border-l-4 border-yellow-400 pl-4">
                        <p className="font-bold uppercase">Oil & Gas</p>
                      </div>
                      <div className="border-l-4 border-yellow-400 pl-4">
                        <p className="font-bold uppercase">Agriculture</p>
                      </div>
                      <div className="border-l-4 border-yellow-400 pl-4">
                        <p className="font-bold uppercase">Infrastructure</p>
                      </div>
                      <div className="border-l-4 border-yellow-400 pl-4">
                        <p className="font-bold uppercase">Emergency Services</p>
                      </div>
                      <div className="border-l-4 border-yellow-400 pl-4">
                        <p className="font-bold uppercase">Events & Festivals</p>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-gray-700">
                      <p className="text-yellow-400 font-bold mb-2">SERVING ALL OF ACADIANA:</p>
                      <p className="text-gray-300">
                        Lafayette • Broussard • Youngsville • Scott • Carencro • 
                        Breaux Bridge • St. Martinville • New Iberia • Abbeville • 
                        Crowley • Rayne • And Beyond
                      </p>
                    </div>
                  </div>
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
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent mb-2">30,000+</div>
                <div className="text-sm md:text-base text-gray-600 font-medium">Equipment Pieces</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent mb-2">15+</div>
                <div className="text-sm md:text-base text-gray-600 font-medium">Years Experience</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent mb-2">24/7</div>
                <div className="text-sm md:text-base text-gray-600 font-medium">Customer Support</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent mb-2">100%</div>
                <div className="text-sm md:text-base text-gray-600 font-medium">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Story</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Built to Serve Contractors Like You
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <div className="mb-6">
                    <Star className="h-12 w-12 text-yellow-500 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Founded with Purpose</h3>
                    <p className="text-lg text-gray-700 leading-relaxed mb-4">
                      Founded by a team of industry professionals and equipment operators, Lafayette Equipment Rentals was
                      built with one goal: make heavy equipment accessible, fast, and hassle-free for contractors across Southern Louisiana.
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <Building className="h-12 w-12 text-red-600 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Local Expertise</h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      We know the challenges contractors face in the Acadiana region, and we built our rental platform to help you 
                      finish jobs on time and under budget. Our extensive network and local expertise ensure you get the right 
                      equipment when you need it.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-turquoise-50 rounded-2xl p-6 border border-turquoise-200">
                    <div className="flex items-start space-x-4">
                      <CheckCircle className="h-8 w-8 text-turquoise-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Industry Leaders</h4>
                        <p className="text-gray-700">Setting the standard in equipment rental throughout Lafayette and surrounding parishes.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                    <div className="flex items-start space-x-4">
                      <Award className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Community Focused</h4>
                        <p className="text-gray-700">Proud to serve Lafayette and contribute to the growth of our local economy.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-turquoise-50 rounded-2xl p-6 border border-turquoise-200">
                    <div className="flex items-start space-x-4">
                      <Users className="h-8 w-8 text-turquoise-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Family Values</h4>
                        <p className="text-gray-700">We treat every customer like family, with honesty, integrity, and respect.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Makes Us Different Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What Makes Us Different</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We're not just another rental company. We're your partners in getting the job done right.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <DifferenceCard
                icon={<Truck className="h-12 w-12" />}
                title="Fast Delivery"
                description="Same-day delivery available throughout Lafayette and the Acadiana region."
              />
              <DifferenceCard
                icon={<Wrench className="h-12 w-12" />}
                title="Maintained Machines"
                description="Reliable, job-ready equipment serviced by certified technicians."
              />
              <DifferenceCard
                icon={<MapPin className="h-12 w-12" />}
                title="Local Experts"
                description="Deep knowledge of Southern Louisiana's unique conditions and needs."
              />
              <DifferenceCard
                icon={<MessageSquare className="h-12 w-12" />}
                title="Responsive Support"
                description="24/7 support to keep your projects running smoothly."
              />
            </div>
          </div>
        </section>


        {/* Location Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12">Visit Our Location</h2>
              <div className="grid md:grid-cols-2 gap-12 items-stretch">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Lafayette Equipment Rentals</h3>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <MapPin className="h-6 w-6 text-red-600 mr-4 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Address</p>
                        <p className="text-gray-700">
                          2865 Ambassador Caffery Pkwy, Ste 135<br />
                          Lafayette, LA 70506
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Phone className="h-6 w-6 text-red-600 mr-4 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Phone</p>
                        <a
                          href="tel:+13372341234"
                          className="text-red-600 hover:text-red-700 font-medium text-lg"
                        >
                          (337) 234-1234
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="h-6 w-6 text-red-600 mr-4 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Business Hours</p>
                        <p className="text-gray-700">
                          Monday – Saturday: 7:00 AM – 6:00 PM<br />
                          Sunday: Closed
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-turquoise-50 border border-turquoise-200 p-4 rounded-lg">
                      <p className="text-gray-700 text-sm">
                        Located in the heart of Lafayette, we're perfectly positioned to serve contractors
                        throughout Southern Louisiana with fast delivery and pickup services.
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
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto text-white/90">
              Need help choosing the right equipment for your project? Our experts are here to help you find the perfect solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-turquoise-500 text-white hover:bg-turquoise-600 text-lg px-8 py-6 font-semibold"
                >
                  Talk to a Specialist
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/equipment-rental">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white bg-white/10 backdrop-blur text-white hover:bg-white hover:text-red-600 text-lg px-8 py-6 font-semibold"
                >
                  Browse Equipment
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

const DifferenceCard = ({
  icon,
  title,
  description,
}: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
    <div className="mb-4 p-3 bg-turquoise-50 rounded-lg inline-block group-hover:scale-110 transition-transform duration-300">
      <div className="text-turquoise-600">{icon}</div>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
)

