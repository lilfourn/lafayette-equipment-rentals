export interface Category {
  name: string;
  displayName: string;
  image: string;
  description?: string;
}

export const CATEGORIES: Category[] = [
  // Categories from user's list
  {
    name: "scissor-lift",
    displayName: "Scissor Lift",
    image: "/category%20images/scissor_lift.png",
    description: "Vertical access equipment for working at height",
  },
  {
    name: "man-lift",
    displayName: "Man Lift",
    image: "/category%20images/man_lift.png",
    description: "Personnel lifting equipment for various heights",
  },
  {
    name: "skid-steer",
    displayName: "Skid Steer",
    image: "/category%20images/skid_steer.png",
    description: "Compact, versatile construction equipment",
  },
  {
    name: "storage-container",
    displayName: "Storage Container",
    image: "/category%20images/storage_container.png",
    description: "Secure storage solutions for job sites",
  },
  {
    name: "telehandler",
    displayName: "Telehandler",
    image: "/category%20images/telehandler.png",
    description: "Telescopic handler for lifting and placing materials",
  },
  {
    name: "mini-excavator",
    displayName: "Mini Excavator",
    image: "/category%20images/mini_excavator.png",
    description: "Compact excavation equipment for tight spaces",
  },
  {
    name: "excavator",
    displayName: "Excavator",
    image: "/category%20images/excavator.png",
    description: "Heavy-duty digging and earthmoving equipment",
  },
  {
    name: "utility-vehicle",
    displayName: "Utility Vehicle",
    image: "/category%20images/utility_vehicle.png",
    description: "Multi-purpose vehicles for various job site tasks",
  },
  {
    name: "compactor",
    displayName: "Compactor",
    image: "/category%20images/compactor.png",
    description: "Soil and asphalt compaction equipment",
  },
  {
    name: "wheel-loader",
    displayName: "Wheel Loader",
    image: "/category%20images/wheel_loader.png",
    description: "Heavy equipment for loading and moving materials",
  },
  {
    name: "articulated-boom-lift",
    displayName: "Articulated Boom Lift",
    image: "/category%20images/articulated_boom_lift.png",
    description: "Flexible boom lift for reaching around obstacles",
  },
  {
    name: "dozer",
    displayName: "Dozer",
    image: "/category%20images/dozer.png",
    description: "Bulldozer for earthmoving and grading",
  },
  {
    name: "air-compressor",
    displayName: "Air Compressor",
    image: "/category%20images/air_compressor.png",
    description: "Compressed air systems for pneumatic tools",
  },
  {
    name: "tractor",
    displayName: "Tractor",
    image: "/category%20images/tractor.png",
    description: "Agricultural and utility tractors",
  },
  {
    name: "water-truck",
    displayName: "Water Truck",
    image: "/category%20images/water_truck.png",
    description: "Water transport and dust suppression vehicles",
  },
  {
    name: "light-tower",
    displayName: "Light Tower",
    image: "/category%20images/light_tower.png",
    description: "Portable lighting systems for job sites",
  },
  {
    name: "articulated-truck",
    displayName: "Articulated Truck",
    image: "/category%20images/articulated_truck.png",
    description: "Off-road hauling vehicles",
  },
  {
    name: "smooth-drum-roller",
    displayName: "Smooth Drum Roller",
    image: "/category%20images/smooth_drum_roller.png",
    description: "Asphalt and soil compaction rollers",
  },
  {
    name: "forklift",
    displayName: "Forklift",
    image: "/category%20images/forklift.png",
    description: "Material handling and lifting equipment",
  },
  {
    name: "generator",
    displayName: "Generator",
    image: "/category%20images/generator.png",
    description: "Portable power generation equipment",
  },

  // Additional categories found in images folder
  {
    name: "security-camera-trailer",
    displayName: "Security Camera Trailer",
    image: "/category%20images/security_camera_trailer.png",
    description: "Mobile surveillance systems for job site security",
  },
  {
    name: "paver",
    displayName: "Paver",
    image: "/category%20images/paver.png",
    description: "Asphalt and concrete paving equipment",
  },
  {
    name: "wheeled-excavator",
    displayName: "Wheeled Excavator",
    image: "/category%20images/wheeled_excavator.png",
    description: "Mobile excavator with wheel configuration",
  },
  {
    name: "dump-truck",
    displayName: "Dump Truck",
    image: "/category%20images/dump_truck.png",
    description: "Material transport and dumping vehicles",
  },
  {
    name: "spider-lift",
    displayName: "Spider Lift",
    image: "/category%20images/spider_lift.png",
    description: "Compact track-mounted aerial work platform",
  },
  {
    name: "wood-chipper",
    displayName: "Wood Chipper",
    image: "/category%20images/wood_chipper.png",
    description: "Tree and brush chipping equipment",
  },
  {
    name: "trencher",
    displayName: "Trencher",
    image: "/category%20images/trencher.png",
    description: "Digging equipment for trenches and utilities",
  },
  {
    name: "walk-behind-trencher",
    displayName: "Walk Behind Trencher",
    image: "/category%20images/walk_behind_trencher.png",
    description: "Compact trenching equipment for small jobs",
  },
  {
    name: "motor-grader",
    displayName: "Motor Grader",
    image: "/category%20images/motor_grader.png",
    description: "Road grading and surface preparation equipment",
  },
  {
    name: "double-drum-asphalt-roller",
    displayName: "Double Drum Asphalt Roller",
    image: "/category%20images/double_drum_asphalt_roller.png",
    description: "Specialized asphalt compaction equipment",
  },
  {
    name: "truck",
    displayName: "Truck",
    image: "/category%20images/truck.png",
    description: "General purpose trucks for transportation",
  },
  {
    name: "forestry-mulcher",
    displayName: "Forestry Mulcher",
    image: "/category%20images/forestry_mulcher.png",
    description: "Land clearing and vegetation management equipment",
  },
  {
    name: "backhoe-loader",
    displayName: "Backhoe Loader",
    image: "/category%20images/backhoe_loader.png",
    description: "Combination digging and loading equipment",
  },
  {
    name: "boom-truck",
    displayName: "Boom Truck",
    image: "/category%20images/boom_truck.png",
    description: "Truck-mounted crane and lifting equipment",
  },
  {
    name: "concrete-mixer",
    displayName: "Concrete Mixer",
    image: "/category%20images/concrete_mixer.png",
    description: "Concrete mixing and transport equipment",
  },
  {
    name: "crawler-carrier",
    displayName: "Crawler Carrier",
    image: "/category%20images/crawler_carrier.png",
    description: "Tracked material transport vehicles",
  },
  {
    name: "demolition-hammer",
    displayName: "Demolition Hammer",
    image: "/category%20images/demolition_hammer.png",
    description: "Heavy-duty demolition and breaking equipment",
  },
  {
    name: "dump-trailer",
    displayName: "Dump Trailer",
    image: "/category%20images/dump_trailer.png",
    description: "Trailer-mounted dumping equipment",
  },
  {
    name: "dump-trailer-dash",
    displayName: "Dump - Trailer",
    image: "/category%20images/dump_trailer.png",
    description: "Trailer-mounted dumping equipment",
  },
  {
    name: "dumpster",
    displayName: "Dumpster",
    image: "/category%20images/dumpster.png",
    description: "Waste collection and disposal containers",
  },
  {
    name: "feller-buncher",
    displayName: "Feller Buncher",
    image: "/category%20images/feller_buncher.png",
    description: "Tree harvesting and forestry equipment",
  },
  {
    name: "grapple-truck",
    displayName: "Grapple Truck",
    image: "/category%20images/grapple_truck.png",
    description: "Truck-mounted grappling equipment",
  },
  {
    name: "jaw-crusher",
    displayName: "Jaw Crusher",
    image: "/category%20images/jaw_crusher.png",
    description: "Rock and concrete crushing equipment",
  },
  {
    name: "landscape-auger",
    displayName: "Landscape Auger",
    image: "/category%20images/landscape_auger.png",
    description: "Drilling equipment for landscaping",
  },
  {
    name: "material-lift",
    displayName: "Material Lift",
    image: "/category%20images/material_lift.png",
    description: "Vertical material handling equipment",
  },
  {
    name: "mini-wheel-loader",
    displayName: "Mini Wheel Loader",
    image: "/category%20images/mini_wheel_loader.png",
    description: "Compact wheel loading equipment",
  },
  {
    name: "mini-wheel-loader-dash",
    displayName: "Mini-Wheel Loader",
    image: "/category%20images/mini_wheel_loader.png",
    description: "Compact wheel loading equipment",
  },
  {
    name: "mower",
    displayName: "Mower",
    image: "/category%20images/mower.png",
    description: "Commercial mowing equipment",
  },
  {
    name: "plate-compactor",
    displayName: "Plate Compactor",
    image: "/category%20images/plate_compactor.png",
    description: "Small area compaction equipment",
  },
  {
    name: "screener",
    displayName: "Screener",
    image: "/category%20images/screener.png",
    description: "Material screening and sorting equipment",
  },
  {
    name: "stump-grinder",
    displayName: "Stump Grinder",
    image: "/category%20images/stump_grinder.png",
    description: "Tree stump removal equipment",
  },
  {
    name: "sweeper",
    displayName: "Sweeper",
    image: "/category%20images/sweeper.png",
    description: "Street and surface cleaning equipment",
  },
  {
    name: "towable-boom-lift",
    displayName: "Towable Boom Lift",
    image: "/category%20images/towable_boom_lift.png",
    description: "Portable boom lift equipment",
  },
  {
    name: "track-loader",
    displayName: "Track Loader",
    image: "/category%20images/track_loader.png",
    description: "Tracked loading equipment",
  },
  {
    name: "trailer",
    displayName: "Trailer",
    image: "/category%20images/trailer.png",
    description: "General purpose trailers",
  },
  {
    name: "water-pump",
    displayName: "Water Pump",
    image: "/category%20images/water_pump.png",
    description: "Water pumping and transfer equipment",
  },
  {
    name: "glass-panel-lifter",
    displayName: "Glass Panel Lifter",
    image: "/category%20images/glass_panel_lifter.png",
    description: "Specialized lifting equipment for glass panels",
  },
  {
    name: "fuel-lube-truck",
    displayName: "Fuel-Lube Truck",
    image: "/category%20images/fuel_lube_truck.png",
    description: "Mobile fuel and lubrication service vehicles",
  },
  {
    name: "mast-climbing-work-platform",
    displayName: "Mast Climbing Work Platform",
    image: "/category%20images/mast_climbing_work_platform.png",
    description: "Vertical access platforms for construction",
  },
  {
    name: "articulated-water-truck",
    displayName: "Articulated Water Truck",
    image: "/category%20images/articulated_water_truck.png",
    description: "Off-road water transport vehicles",
  },
  {
    name: "concrete-buggy",
    displayName: "Concrete Buggy",
    image: "/category%20images/concrete_buggy.png",
    description: "Concrete transport and placement equipment",
  },
  {
    name: "concrete-saw",
    displayName: "Concrete Saw",
    image: "/category%20images/concrete_saw.png",
    description: "Concrete cutting and demolition equipment",
  },
  {
    name: "ditch-pump",
    displayName: "Ditch Pump",
    image: "/category%20images/ditch_pump.png",
    description: "Specialized pumping equipment for drainage",
  },
  {
    name: "dumper",
    displayName: "Dumper",
    image: "/category%20images/dumper.png",
    description: "Small dumping vehicles for construction",
  },
  {
    name: "lift-pod",
    displayName: "Lift Pod",
    image: "/category%20images/lift_pod.png",
    description: "Compact lifting platforms",
  },
  {
    name: "marsh-buggy-excavator",
    displayName: "Marsh Buggy Excavator",
    image: "/category%20images/marsh_buggy_excavator.png",
    description: "Specialized excavator for wetland work",
  },
  {
    name: "message-board",
    displayName: "Message Board",
    image: "/category%20images/message_board.png",
    description: "Electronic traffic control signage",
  },
  {
    name: "motor-scraper",
    displayName: "Motor Scraper",
    image: "/category%20images/motor_scraper.png",
    description: "Heavy earthmoving and grading equipment",
  },
  {
    name: "padding-machine",
    displayName: "Padding Machine",
    image: "/category%20images/padding_machine.png",
    description: "Surface preparation equipment",
  },
  {
    name: "padfoot-roller",
    displayName: "Padfoot Roller",
    image: "/category%20images/padfoot_roller.png",
    description: "Specialized soil compaction equipment",
  },
  {
    name: "pile-driver",
    displayName: "Pile Driver",
    image: "/category%20images/pile_driver.png",
    description: "Foundation and pile installation equipment",
  },
  {
    name: "pipe-layer",
    displayName: "Pipe Layer",
    image: "/category%20images/pipe_layer.png",
    description: "Pipeline installation equipment",
  },
  {
    name: "pipe-lifter",
    displayName: "Pipe Lifter",
    image: "/category%20images/pipe_lifter.png",
    description: "Pipe handling and positioning equipment",
  },
  {
    name: "portable-air-conditioner",
    displayName: "Portable Air Conditioner",
    image: "/category%20images/portable_air_conditioner.png",
    description: "Mobile cooling equipment",
  },
  {
    name: "portable-jaw-crushing-plant",
    displayName: "Portable Jaw Crushing Plant",
    image: "/category%20images/portable_jaw_crushing_plant.png",
    description: "Mobile rock crushing equipment",
  },
  {
    name: "portable-screener",
    displayName: "Portable Screener",
    image: "/category%20images/portable_screener.png",
    description: "Mobile material screening equipment",
  },
  {
    name: "portable-water-tank",
    displayName: "Portable Water Tank",
    image: "/category%20images/portable_water_tank.png",
    description: "Mobile water storage solutions",
  },
  {
    name: "pressure-washers",
    displayName: "Pressure Washers",
    image: "/category%20images/pressure_washers.png",
    description: "High-pressure cleaning equipment",
  },
  {
    name: "roller-system",
    displayName: "Roller System",
    image: "/category%20images/roller_system.png",
    description: "Specialized rolling and compaction systems",
  },
  {
    name: "scraper",
    displayName: "Scraper",
    image: "/category%20images/scraper.png",
    description: "Earthmoving and grading equipment",
  },
  {
    name: "scraper-pan",
    displayName: "Scraper Pan",
    image: "/category%20images/scraper_pan.png",
    description: "Scraper attachment equipment",
  },
  {
    name: "skip-loader",
    displayName: "Skip Loader",
    image: "/category%20images/skip_loader.png",
    description: "Compact loading equipment",
  },
  {
    name: "standing-water-tank",
    displayName: "Standing Water Tank",
    image: "/category%20images/standing_water_tank.png",
    description: "Stationary water storage solutions",
  },
  {
    name: "log-splitter",
    displayName: "Log Splitter",
    image: "/category%20images/log_splitter.webp",
    description: "Wood splitting equipment",
  },
  {
    name: "digger-derrick",
    displayName: "Digger Derrick",
    image: "/category%20images/digger_derrick.png",
    description: "Utility pole installation and maintenance equipment",
  },
];

// Helper function to get category by name
export function getCategoryByName(name: string): Category | undefined {
  return CATEGORIES.find(
    (category) =>
      category.name === name ||
      category.displayName.toLowerCase() === name.toLowerCase()
  );
}

// List of available image files (based on what's actually in the folder)
const AVAILABLE_IMAGE_FILES = [
  "air_compressor.png",
  "articulated_boom_lift.png",
  "articulated_truck.png",
  "articulated_water_truck.png",
  "backhoe_loader.png",
  "boom_truck.png",
  "compactor.png",
  "concrete_buggy.png",
  "concrete_mixer.png",
  "concrete_saw.png",
  "crawler_carrier.png",
  "demolition_hammer.png",
  "digger_derrick.png",
  "ditch_pump.png",
  "double_drum_asphalt_roller.png",
  "dozer.png",
  "dump_trailer.png",
  "dump_truck.png",
  "dumper.png",
  "dumpster.png",
  "excavator.png",
  "feller_buncher.png",
  "forklift.png",
  "forestry_mulcher.png",
  "fuel_lube_truck.png",
  "generator.png",
  "glass_panel_lifter.png",
  "grapple_truck.png",
  "jaw_crusher.png",
  "landscape_auger.png",
  "lift_pod.png",
  "light_tower.png",
  "log_splitter.webp",
  "man_lift.png",
  "marsh_buggy_excavator.png",
  "mast_climbing_work_platform.png",
  "material_lift.png",
  "message_board.png",
  "mini_excavator.png",
  "mini_wheel_loader.png",
  "motor_grader.png",
  "motor_scraper.png",
  "mower.png",
  "no-machine-image-placeholder.png",
  "padding_machine.png",
  "padfoot_roller.png",
  "paver.png",
  "pile_driver.png",
  "pipe_layer.png",
  "pipe_lifter.png",
  "plate_compactor.png",
  "portable_air_conditioner.png",
  "portable_jaw_crushing_plant.png",
  "portable_screener.png",
  "portable_water_tank.png",
  "pressure_washers.png",
  "roller_system.png",
  "scissor_lift.png",
  "scraper.png",
  "scraper_pan.png",
  "screener.png",
  "security_camera_trailer.png",
  "skid_steer.png",
  "skip_loader.png",
  "smooth_drum_roller.png",
  "spider_lift.png",
  "standing_water_tank.png",
  "storage_container.png",
  "stump_grinder.png",
  "sweeper.png",
  "telehandler.png",
  "towable_boom_lift.png",
  "track_loader.png",
  "tractor.png",
  "trailer.png",
  "trencher.png",
  "truck.png",
  "utility_vehicle.png",
  "walk_behind_trencher.png",
  "water_pump.png",
  "water_truck.png",
  "wheel_loader.png",
  "wheeled_excavator.png",
  "wood_chipper.png",
];

// Helper function to get category image by display name
export function getCategoryImage(displayName: string): string {
  // First try exact match in categories
  let category = CATEGORIES.find((cat) => cat.displayName === displayName);

  if (!category) {
    // Try case-insensitive match in categories
    category = CATEGORIES.find(
      (cat) => cat.displayName.toLowerCase() === displayName.toLowerCase()
    );
  }

  if (category) {
    return category.image;
  }

  // If no category found, try to construct filename and check if it exists
  const imageFileName = displayNameToImageName(displayName);
  const pngFile = `${imageFileName}.png`;
  const webpFile = `${imageFileName}.webp`;

  if (AVAILABLE_IMAGE_FILES.includes(pngFile)) {
    return `/category%20images/${pngFile}`;
  }

  if (AVAILABLE_IMAGE_FILES.includes(webpFile)) {
    return `/category%20images/${webpFile}`;
  }

  // If no image found, return fallback
  return "/category%20images/no-machine-image-placeholder.png";
}

// Helper function to convert display name to image filename format
export function displayNameToImageName(displayName: string): string {
  return displayName
    .toLowerCase()
    .replace(/\s*-\s*/g, "_") // Convert hyphens (with optional spaces) to underscores
    .replace(/\s+/g, "_") // Convert spaces to underscores
    .replace(/[^a-z0-9_]/g, ""); // Remove any remaining special characters
}

// Export category names for easy access
export const CATEGORY_NAMES = CATEGORIES.map((cat) => cat.displayName);
export const CATEGORY_SLUGS = CATEGORIES.map((cat) => cat.name);
