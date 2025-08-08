/**
 * Lafayette-focused SEO URL generator
 * Generates 500+ long-tail SEO URLs for Lafayette, Louisiana equipment rental market
 */

// Equipment type variations for deep keyword coverage
export const equipmentTypeVariations = {
  excavator: [
    'excavator',
    'mini-excavator',
    'large-excavator',
    'hydraulic-excavator',
    'tracked-excavator',
    'wheeled-excavator',
    'compact-excavator',
    'crawler-excavator',
    'long-reach-excavator',
    'standard-excavator'
  ],
  'skid-steer': [
    'skid-steer',
    'skid-steer-loader',
    'compact-track-loader',
    'wheeled-skid-steer',
    'tracked-skid-steer',
    'mini-skid-steer',
    'large-skid-steer'
  ],
  bulldozer: [
    'bulldozer',
    'dozer',
    'crawler-dozer',
    'wheeled-dozer',
    'mini-dozer',
    'large-bulldozer'
  ],
  backhoe: [
    'backhoe',
    'backhoe-loader',
    'tractor-backhoe',
    'wheeled-backhoe',
    'extendable-backhoe'
  ],
  lift: [
    'scissor-lift',
    'boom-lift',
    'aerial-lift',
    'man-lift',
    'personnel-lift',
    'electric-scissor-lift',
    'rough-terrain-scissor-lift',
    'telescopic-boom-lift',
    'articulating-boom-lift',
    'straight-boom-lift'
  ],
  forklift: [
    'forklift',
    'telehandler',
    'reach-forklift',
    'warehouse-forklift',
    'rough-terrain-forklift',
    'electric-forklift',
    'diesel-forklift',
    'pneumatic-forklift'
  ],
  generator: [
    'generator',
    'portable-generator',
    'diesel-generator',
    'industrial-generator',
    'standby-generator',
    'towable-generator',
    'silent-generator'
  ],
  compactor: [
    'compactor',
    'plate-compactor',
    'roller-compactor',
    'vibratory-compactor',
    'asphalt-compactor',
    'soil-compactor',
    'trench-compactor'
  ],
  crane: [
    'crane',
    'mobile-crane',
    'tower-crane',
    'rough-terrain-crane',
    'all-terrain-crane',
    'crawler-crane',
    'carry-deck-crane'
  ],
  'dump-truck': [
    'dump-truck',
    'articulated-dump-truck',
    'rigid-dump-truck',
    'off-road-dump-truck',
    'side-dump-truck'
  ]
};

// Brand and model combinations
export const brandModelCombinations = [
  { brand: 'caterpillar', model: '320', type: 'excavator' },
  { brand: 'caterpillar', model: '336', type: 'excavator' },
  { brand: 'caterpillar', model: 'D6', type: 'bulldozer' },
  { brand: 'caterpillar', model: '299D', type: 'skid-steer' },
  { brand: 'john-deere', model: '310SL', type: 'backhoe' },
  { brand: 'john-deere', model: '35G', type: 'excavator' },
  { brand: 'john-deere', model: '333G', type: 'skid-steer' },
  { brand: 'komatsu', model: 'PC210', type: 'excavator' },
  { brand: 'komatsu', model: 'D65', type: 'bulldozer' },
  { brand: 'bobcat', model: 'T770', type: 'skid-steer' },
  { brand: 'bobcat', model: 'E85', type: 'excavator' },
  { brand: 'case', model: '580', type: 'backhoe' },
  { brand: 'case', model: 'CX350', type: 'excavator' },
  { brand: 'jlg', model: '600S', type: 'boom-lift' },
  { brand: 'jlg', model: '1850SJ', type: 'boom-lift' },
  { brand: 'genie', model: 'S65', type: 'boom-lift' },
  { brand: 'genie', model: 'GS2669', type: 'scissor-lift' },
  { brand: 'terex', model: 'TH844C', type: 'telehandler' },
  { brand: 'kubota', model: 'KX040', type: 'excavator' },
  { brand: 'volvo', model: 'EC220', type: 'excavator' }
];

// Service types and rental durations
export const serviceTypes = [
  'daily',
  'weekly',
  'monthly',
  'long-term',
  'short-term',
  'emergency',
  'same-day',
  'weekend',
  '24-hour',
  'overnight',
  'hourly',
  'seasonal'
];

// Industries in Lafayette area
export const industries = [
  'construction',
  'oil-gas',
  'oilfield',
  'industrial',
  'agricultural',
  'landscaping',
  'residential',
  'commercial',
  'municipal',
  'infrastructure',
  'marine',
  'pipeline'
];

// Project types
export const projectTypes = [
  'home-renovation',
  'driveway-construction',
  'pool-installation',
  'tree-removal',
  'concrete-work',
  'demolition',
  'foundation-repair',
  'land-clearing',
  'storm-cleanup',
  'excavation',
  'grading',
  'trenching',
  'site-preparation',
  'drainage-installation',
  'septic-installation',
  'utility-installation',
  'road-construction',
  'parking-lot-construction',
  'landscaping-project',
  'fence-installation'
];

// Equipment specifications
export const equipmentSpecs = [
  { type: 'excavator', specs: ['5-ton', '10-ton', '15-ton', '20-ton', '30-ton', '40-ton'] },
  { type: 'boom-lift', specs: ['30-foot', '40-foot', '60-foot', '80-foot', '120-foot', '150-foot'] },
  { type: 'scissor-lift', specs: ['20-foot', '26-foot', '32-foot', '40-foot', '50-foot'] },
  { type: 'forklift', specs: ['3000-lb', '5000-lb', '8000-lb', '10000-lb', '15000-lb'] },
  { type: 'generator', specs: ['20kw', '50kw', '100kw', '200kw', '500kw'] },
  { type: 'compactor', specs: ['1-ton', '2-ton', '5-ton', '10-ton'] }
];

// Attachments and accessories
export const attachments = [
  'bucket',
  'hydraulic-hammer',
  'auger',
  'grapple',
  'pallet-fork',
  'trencher',
  'ripper',
  'thumb',
  'quick-coupler',
  'breaker',
  'compactor-plate',
  'sweeper',
  'mulcher',
  'rake'
];

// Seasonal and event-based pages
export const seasonalEvents = [
  'hurricane-preparation',
  'hurricane-recovery',
  'festival-season',
  'mardi-gras',
  'crawfish-season',
  'sugarcane-harvest',
  'rice-harvest',
  'football-season',
  'spring-construction',
  'summer-projects',
  'fall-cleanup',
  'winter-maintenance'
];

// Comparison topics
export const comparisonTopics = [
  { item1: 'excavator', item2: 'backhoe' },
  { item1: 'scissor-lift', item2: 'boom-lift' },
  { item1: 'skid-steer', item2: 'compact-track-loader' },
  { item1: 'diesel-generator', item2: 'gas-generator' },
  { item1: 'wheeled-excavator', item2: 'tracked-excavator' },
  { item1: 'telehandler', item2: 'forklift' },
  { item1: 'mini-excavator', item2: 'backhoe' }
];

// Pricing and cost pages
export const pricingTopics = [
  'rental-cost',
  'rental-rates',
  'daily-rates',
  'weekly-rates',
  'monthly-rates',
  'affordable-rental',
  'budget-rental',
  'rental-pricing',
  'rental-estimate',
  'rental-quote'
];

// Guide topics
export const guideTopics = [
  'how-to-rent',
  'rental-guide',
  'sizing-guide',
  'selection-guide',
  'safety-guide',
  'operation-guide',
  'rental-requirements',
  'rental-process',
  'first-time-rental',
  'rental-tips'
];

/**
 * Generate all Lafayette-focused SEO URLs
 */
export function generateLafayetteSEOUrls(locale: string = 'en'): string[] {
  const urls: string[] = [];
  const basePath = `/${locale}/equipment-rental`;

  // 1. Equipment type variations (~150 URLs)
  Object.entries(equipmentTypeVariations).forEach(([baseType, variations]) => {
    variations.forEach(variation => {
      urls.push(`${basePath}/${variation}-rental-lafayette-la`);
    });
  });

  // 2. Brand + Model combinations (~100 URLs)
  brandModelCombinations.forEach(({ brand, model, type }) => {
    urls.push(`${basePath}/brand/${brand}-${model}-${type}-rental-lafayette-la`);
    urls.push(`${basePath}/brand/${brand}-rental-lafayette-la`);
  });

  // 3. Service-specific pages (~144 URLs - 12 services x 12 equipment types)
  serviceTypes.forEach(service => {
    Object.keys(equipmentTypeVariations).forEach(equipment => {
      urls.push(`${basePath}/service/${service}-${equipment}-rental-lafayette-la`);
    });
  });

  // 4. Industry + Equipment combinations (~144 URLs - 12 industries x 12 equipment)
  industries.forEach(industry => {
    Object.keys(equipmentTypeVariations).forEach(equipment => {
      urls.push(`${basePath}/industry/${industry}-${equipment}-rental-lafayette-la`);
    });
  });

  // 5. Project-based pages (~40 URLs)
  projectTypes.forEach(project => {
    urls.push(`${basePath}/project/${project}-equipment-rental-lafayette-la`);
  });

  // 6. Specification-based pages (~36 URLs)
  equipmentSpecs.forEach(({ type, specs }) => {
    specs.forEach(spec => {
      urls.push(`${basePath}/specification/${spec}-${type}-rental-lafayette-la`);
    });
  });

  // 7. Attachment pages (~28 URLs)
  attachments.forEach(attachment => {
    urls.push(`${basePath}/attachment/${attachment}-rental-lafayette-la`);
    // Add attachment with common equipment
    urls.push(`${basePath}/attachment/excavator-${attachment}-rental-lafayette-la`);
  });

  // 8. Seasonal/Event pages (~24 URLs)
  seasonalEvents.forEach(event => {
    urls.push(`${basePath}/seasonal/${event}-equipment-rental-lafayette-la`);
  });

  // 9. Comparison pages (~14 URLs)
  comparisonTopics.forEach(({ item1, item2 }) => {
    urls.push(`${basePath}/compare/${item1}-vs-${item2}-rental-lafayette-la`);
  });

  // 10. Pricing pages (~40 URLs)
  pricingTopics.forEach(topic => {
    urls.push(`${basePath}/pricing/${topic}-lafayette-la`);
    // Add pricing for main equipment types
    ['excavator', 'bulldozer', 'lift', 'generator'].forEach(equipment => {
      urls.push(`${basePath}/pricing/${equipment}-${topic}-lafayette-la`);
    });
  });

  // 11. Guide pages (~40 URLs)
  guideTopics.forEach(topic => {
    urls.push(`${basePath}/guide/${topic}-lafayette-la`);
    // Add guides for main equipment types
    ['excavator', 'skid-steer', 'lift', 'generator'].forEach(equipment => {
      urls.push(`${basePath}/guide/${equipment}-${topic}-lafayette-la`);
    });
  });

  // Remove duplicates and return
  return [...new Set(urls)];
}

/**
 * Get URL metadata for sitemap generation
 */
export function getUrlMetadata(url: string): { changefreq: string; priority: number } {
  // Prioritize based on URL type
  if (url.includes('/excavator-rental-lafayette-la') || 
      url.includes('/skid-steer-rental-lafayette-la')) {
    return { changefreq: 'daily', priority: 0.9 };
  }
  
  if (url.includes('/brand/')) {
    return { changefreq: 'weekly', priority: 0.8 };
  }
  
  if (url.includes('/service/') || url.includes('/industry/')) {
    return { changefreq: 'weekly', priority: 0.7 };
  }
  
  if (url.includes('/project/') || url.includes('/specification/')) {
    return { changefreq: 'weekly', priority: 0.6 };
  }
  
  if (url.includes('/guide/') || url.includes('/compare/')) {
    return { changefreq: 'monthly', priority: 0.5 };
  }
  
  return { changefreq: 'monthly', priority: 0.4 };
}