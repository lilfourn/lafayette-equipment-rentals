// Sanity removed

export interface Industry {
  _id: string;
  title: string;
  slug: { current: string };
  heroTitle?: string;
  heroSubtitle?: string;
  featured?: boolean;
  order?: number;
}

export interface EquipmentCategory {
  _id: string;
  name: string;
  displayName: string;
  slug: string;
  description?: string;
  featured?: boolean;
  order?: number;
  image?: {
    asset: {
      _id: string;
      url: string;
      altText?: string;
    };
    alt?: string;
  };
}

export interface Equipment {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  shortDescription: string;
  category: {
    _id: string;
    name: string;
    displayName: string;
  };
  heroImage?: {
    asset: {
      _id: string;
      url: string;
      altText?: string;
    };
    alt?: string;
  };
  iconImage?: {
    asset: {
      _id: string;
      url: string;
      altText?: string;
    };
    alt?: string;
  };
  featured?: boolean;
}

export interface ServerData {
  industries: Industry[];
  equipmentCategories: EquipmentCategory[];
  equipment: Equipment[];
}

// Cache for server-side data
let cachedServerData: ServerData | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export async function getServerData(): Promise<ServerData> {
  const now = Date.now();

  // Return cached data if it's still fresh
  if (cachedServerData && now - lastFetch < CACHE_DURATION) {
    return cachedServerData;
  }

  try {
    const serverData: ServerData = {
      industries: [
        {
          _id: "construction",
          title: "Construction",
          slug: { current: "construction" },
        },
        {
          _id: "agriculture",
          title: "Agriculture",
          slug: { current: "agriculture" },
        },
        {
          _id: "industrial",
          title: "Industrial",
          slug: { current: "industrial" },
        },
      ],
      equipmentCategories: [],
      equipment: [],
    };

    // Update cache
    cachedServerData = serverData;
    lastFetch = now;

    return serverData;
  } catch (error) {
    console.error("Error fetching server data:", error);

    // Return fallback data if fetch fails
    const fallbackData: ServerData = {
      industries: [
        {
          _id: "1",
          title: "Construction",
          slug: { current: "construction" },
          order: 1,
        },
        {
          _id: "2",
          title: "Agriculture & Farm Equipment",
          slug: { current: "agriculture-farm-equipment-rentals" },
          order: 2,
        },
        {
          _id: "3",
          title: "Landscaping",
          slug: { current: "landscaping" },
          order: 3,
        },
        {
          _id: "4",
          title: "Utilities",
          slug: { current: "utilities" },
          order: 4,
        },
        {
          _id: "5",
          title: "Oil & Gas",
          slug: { current: "oil-gas" },
          order: 5,
        },
        { _id: "6", title: "Events", slug: { current: "events" }, order: 6 },
        {
          _id: "7",
          title: "Government",
          slug: { current: "government" },
          order: 7,
        },
      ],
      equipmentCategories: [],
      equipment: [],
    };

    return fallbackData;
  }
}
