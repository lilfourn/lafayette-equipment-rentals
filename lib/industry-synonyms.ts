export interface LabelMapping {
  categorySlug?: string;
  primaryType?: string;
}

// Minimal, extensible mapping from free-form labels in common_industries.json
// to our internal category slugs and/or machine primaryType values.
// Extend this list as needed.
export const INDUSTRY_SYNONYMS: Record<string, LabelMapping> = {
  // Core earthmoving
  "hydraulic excavator": {
    categorySlug: "excavator",
    primaryType: "Excavator",
  },
  "compact excavator": {
    categorySlug: "mini-excavator",
    primaryType: "Mini Excavator",
  },
  bulldozer: { categorySlug: "dozer", primaryType: "Dozer" },
  "motor grader": { categorySlug: "motor-grader", primaryType: "Motor Grader" },
  "wheel loader": { categorySlug: "wheel-loader", primaryType: "Wheel Loader" },
  "track loader": { categorySlug: "track-loader", primaryType: "Track Loader" },

  // Site and hauling
  "dump truck": { categorySlug: "dump-truck", primaryType: "Dump Truck" },
  "concrete mixer truck": {
    categorySlug: "concrete-mixer",
    primaryType: "Concrete Mixer",
  },
  "concrete pump truck": { primaryType: "Concrete Pump" },
  "asphalt paver": { categorySlug: "paver", primaryType: "Paver" },
  "vibratory roller": {
    categorySlug: "smooth-drum-roller",
    primaryType: "Smooth Drum Roller",
  },
  "road roller": {
    categorySlug: "smooth-drum-roller",
    primaryType: "Smooth Drum Roller",
  },
  compactor: { categorySlug: "compactor", primaryType: "Compactor" },

  // Aerial & material handling
  "scissor lift": { categorySlug: "scissor-lift", primaryType: "Scissor Lift" },
  "boom lift": {
    categorySlug: "articulated-boom-lift",
    primaryType: "Boom Lift",
  },
  "telescopic boom lift": {
    categorySlug: "articulated-boom-lift",
    primaryType: "Boom Lift",
  },
  telehandler: { categorySlug: "telehandler", primaryType: "Telehandler" },
  forklift: { categorySlug: "forklift", primaryType: "Forklift" },
  "rough-terrain forklift": {
    categorySlug: "forklift",
    primaryType: "Forklift",
  },

  // Small machines
  "skid steer loader": {
    categorySlug: "skid-steer",
    primaryType: "Skid Steer",
  },
  "compact track loader": {
    categorySlug: "track-loader",
    primaryType: "Track Loader",
  },
  "mini excavator": {
    categorySlug: "mini-excavator",
    primaryType: "Mini Excavator",
  },

  // Power & lighting
  "diesel generator": { categorySlug: "generator", primaryType: "Generator" },
  "mobile lighting tower": {
    categorySlug: "light-tower",
    primaryType: "Light Tower",
  },

  // Niche items we might not always have exact categories for
  "pipeline trencher": { categorySlug: "trencher", primaryType: "Trencher" },
  "tower crane": { primaryType: "Tower Crane" },
  "crawler crane": { primaryType: "Crawler Crane" },
  "land drilling rig": { primaryType: "Drilling Rig" },
  "hvac lifting crane": { primaryType: "Crane" },
  "all-terrain crane": { primaryType: "Crane" },
  "overhead gantry crane": { primaryType: "Crane" },
  "overhead bridge crane": { primaryType: "Crane" },
  "container reach stacker": { primaryType: "Reach Stacker" },
  "irrigation pump unit": {
    categorySlug: "water-pump",
    primaryType: "Water Pump",
  },
  "utility utv": {
    categorySlug: "utility-vehicle",
    primaryType: "Utility Vehicle",
  },
  "fuel tanker truck": { primaryType: "Fuel Truck" },
};

export function normalizeLabel(label: string): string {
  return label.toLowerCase().trim();
}

export function mapLabelToInternal(label: string): LabelMapping {
  const key = normalizeLabel(label);
  return INDUSTRY_SYNONYMS[key] || {};
}
