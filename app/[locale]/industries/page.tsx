import IndustryBrowse, {
  type IndustryBrowseItem,
} from "@/components/industry-browse";
import { getIndustriesWithMachines } from "@/lib/industry-search";

export default async function IndustriesPage() {
  // Use server-side util directly for reliability
  let items: IndustryBrowseItem[] = [];
  if (process.env.RUBBL_API_KEY) {
    const result = await getIndustriesWithMachines(
      {
        apiKey: process.env.RUBBL_API_KEY,
        cacheEnabled: true,
        cacheDuration: 900,
      },
      8
    );
    items = (result as any) || [];
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <IndustryBrowse items={items} />
    </div>
  );
}

export async function generateMetadata() {
  return {
    title: "Industries | Lafayette Equipment Rentals",
    description:
      "Browse industries we serve in Lafayette, LA and see available machines.",
  };
}
