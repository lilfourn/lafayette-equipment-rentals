import commonIndustries from "@/common_industries.json";
import { mapLabelToInternal, normalizeLabel } from "./industry-synonyms";

export interface IndustryConfig {
  name: string;
  slug: string;
  equipmentLabels: string[];
}

export interface CategoryOrType {
  categorySlug?: string;
  primaryType?: string;
}

export function slugifyIndustry(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function loadCommonIndustries(): IndustryConfig[] {
  const list: IndustryConfig[] = (commonIndustries as any).industries.map(
    (item: { name: string; common_construction_equipment: string[] }) => ({
      name: item.name,
      slug: slugifyIndustry(item.name),
      equipmentLabels: item.common_construction_equipment || [],
    })
  );
  return list;
}

export function mapLabelsToInternal(labels: string[]): CategoryOrType[] {
  return labels
    .map((l) => mapLabelToInternal(normalizeLabel(l)))
    .filter((m) => m.categorySlug || m.primaryType);
}
