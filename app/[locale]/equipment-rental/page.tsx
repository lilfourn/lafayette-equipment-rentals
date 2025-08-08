import PageSkeleton from "@/components/skeletons/page-skeleton";
import { CATEGORIES } from "@/lib/categories";
import dynamic from "next/dynamic";
import React from "react";

// Lazy load the equipment page content
const EquipmentPageContent = dynamic(
  () => import("@/components/equipment-page-content"),
  {
    loading: () => <PageSkeleton variant="listing" />,
    ssr: true,
  }
);

interface EquipmentCategory {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  image?: {
    asset: {
      url: string;
    };
    alt?: string;
  };
  equipmentCount?: number;
}

async function getEquipmentCategories(): Promise<EquipmentCategory[]> {
  return CATEGORIES.map((c) => ({
    _id: c.name,
    name: c.name,
    displayName: c.displayName,
    description: c.description,
    image: c.image
      ? { asset: { url: c.image }, alt: c.displayName }
      : undefined,
    equipmentCount: undefined,
  }));
}

export default async function EquipmentAndToolsPage() {
  const categories = await getEquipmentCategories();

  return <EquipmentPageContent categories={categories} />;
}
