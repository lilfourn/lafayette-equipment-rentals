import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UnavailableProps {
  params: { slug: string };
}

function formatSlugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function IndustryUnavailable({
  params,
}: UnavailableProps) {
  const { slug } = await params;
  const title = formatSlugToTitle(slug);

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-20 max-w-3xl text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {title} Equipment Availability
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          We’re sorry — we don’t have {title.toLowerCase()} equipment available
          for rental today in Lafayette.
        </p>
        <p className="text-gray-600 mb-10">
          Tell us what you need and our team will source it for you within 24
          hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact">
            <Button className="bg-turquoise-600 hover:bg-turquoise-700 text-white cursor-pointer">
              Request Sourcing
            </Button>
          </Link>
          <Link href="/equipment-rental">
            <Button variant="outline" className="cursor-pointer">
              Browse All Equipment
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

export const metadata = {
  robots: { index: false, follow: true },
};
