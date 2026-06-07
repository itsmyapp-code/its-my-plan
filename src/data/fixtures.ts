// UK Structural & Furniture Asset Library
// All dimensions in millimetres — based on standard UK residential sizes
// Covers Bathroom, Kitchen, and Bedroom domains as per the master architecture spec

export interface FixtureDefinition {
  id: string;
  label: string;
  category: 'bathroom' | 'kitchen' | 'bedroom' | 'furniture' | 'electrical' | 'plumbing';
  iconType:
    | 'bath'
    | 'wc'
    | 'basin'
    | 'shower'
    | 'kitchen'
    | 'bed'
    | 'wardrobe'
    | 'table'
    | 'chair'
    | 'electric'
    | 'plumbing'
    | 'radiator'
    | 'tv'
    | 'appliance'
    | 'generic';
  width: number;    // mm (along X when rotation=0)
  depth: number;    // mm (along Y when rotation=0)
  color: string;    // Fill colour for 2D/3D rendering
  clearance: {
    front: number;  // mm clearance required in front
    sides: number;  // mm clearance on each side
    description: string;
  };
}

export const FIXTURE_LIBRARY: FixtureDefinition[] = [
  // ═══════════════════════════════════════
  // BATHROOM
  // ═══════════════════════════════════════
  {
    id: 'uk-bath-standard',
    label: 'Standard Bath',
    category: 'bathroom',
    iconType: 'bath',
    width: 1700,
    depth: 700,
    color: '#60a5fa',
    clearance: { front: 700, sides: 0, description: '700mm clearance path along longitudinal edge' },
  },
  {
    id: 'uk-bath-compact',
    label: 'Compact Bath',
    category: 'bathroom',
    iconType: 'bath',
    width: 1500,
    depth: 700,
    color: '#60a5fa',
    clearance: { front: 700, sides: 0, description: '700mm clearance path along longitudinal edge' },
  },
  {
    id: 'uk-wc-close-coupled',
    label: 'Close-Coupled WC',
    category: 'bathroom',
    iconType: 'wc',
    width: 400,
    depth: 650,
    color: '#e2e8f0',
    clearance: { front: 700, sides: 700, description: '700mm × 700mm clear frontal footprint box' },
  },
  {
    id: 'uk-wc-wall-hung',
    label: 'Wall-Hung WC',
    category: 'bathroom',
    iconType: 'wc',
    width: 380,
    depth: 550,
    color: '#e2e8f0',
    clearance: { front: 700, sides: 700, description: '700mm × 700mm clear frontal footprint box' },
  },
  {
    id: 'uk-basin-pedestal',
    label: 'Pedestal Basin',
    category: 'bathroom',
    iconType: 'basin',
    width: 550,
    depth: 450,
    color: '#e2e8f0',
    clearance: { front: 700, sides: 700, description: '700mm × 700mm operational workspace arc' },
  },
  {
    id: 'uk-basin-cloakroom',
    label: 'Cloakroom Basin',
    category: 'bathroom',
    iconType: 'basin',
    width: 450,
    depth: 250,
    color: '#e2e8f0',
    clearance: { front: 600, sides: 600, description: '600mm × 600mm front clearance footprint' },
  },
  {
    id: 'uk-shower-square',
    label: 'Square Shower',
    category: 'bathroom',
    iconType: 'shower',
    width: 900,
    depth: 900,
    color: '#2dd4bf',
    clearance: { front: 700, sides: 0, description: '700mm clear access zone outside enclosure door' },
  },
  {
    id: 'uk-shower-quadrant',
    label: 'Quadrant Shower',
    category: 'bathroom',
    iconType: 'shower',
    width: 900,
    depth: 900,
    color: '#2dd4bf',
    clearance: { front: 700, sides: 0, description: '700mm clear entry path along curved dynamic sweep' },
  },
  {
    id: 'uk-bathroom-double-vanity',
    label: 'Double Vanity Basin',
    category: 'bathroom',
    iconType: 'basin',
    width: 1200,
    depth: 500,
    color: '#e2e8f0',
    clearance: { front: 700, sides: 100, description: '700mm standing/circulation area for two users' },
  },
  {
    id: 'uk-bathroom-freestanding-bath',
    label: 'Freestanding Bath',
    category: 'bathroom',
    iconType: 'bath',
    width: 1800,
    depth: 800,
    color: '#60a5fa',
    clearance: { front: 750, sides: 150, description: '750mm operational side access buffer' },
  },

  // ═══════════════════════════════════════
  // KITCHEN
  // ═══════════════════════════════════════
  {
    id: 'uk-kitchen-base-standard',
    label: 'Base Unit Standard',
    category: 'kitchen',
    iconType: 'kitchen',
    width: 600,
    depth: 600,
    color: '#a78bfa',
    clearance: { front: 600, sides: 0, description: '600mm frontal operational zone for drawer extraction' },
  },
  {
    id: 'uk-kitchen-base-slim',
    label: 'Base Unit Slim',
    category: 'kitchen',
    iconType: 'kitchen',
    width: 400,
    depth: 600,
    color: '#a78bfa',
    clearance: { front: 600, sides: 0, description: '600mm frontage clearance pathway line' },
  },
  {
    id: 'uk-kitchen-appliance-tower',
    label: 'Appliance Tower',
    category: 'kitchen',
    iconType: 'kitchen',
    width: 600,
    depth: 600,
    color: '#c084fc',
    clearance: { front: 750, sides: 0, description: '750mm clearance threshold to handle hot door utility' },
  },
  {
    id: 'uk-kitchen-sink-double',
    label: 'Double Sink Module',
    category: 'kitchen',
    iconType: 'kitchen',
    width: 1000,
    depth: 500,
    color: '#93c5fd',
    clearance: { front: 700, sides: 0, description: '700mm continuous functional standing clearance lane' },
  },
  {
    id: 'uk-kitchen-island',
    label: 'Kitchen Island',
    category: 'kitchen',
    iconType: 'kitchen',
    width: 1200,
    depth: 900,
    color: '#a78bfa',
    clearance: { front: 900, sides: 900, description: '900mm continuous circulation passage on all active cooking sides' },
  },
  {
    id: 'uk-kitchen-corner-base',
    label: 'Corner Base Unit',
    category: 'kitchen',
    iconType: 'kitchen',
    width: 1000,
    depth: 600,
    color: '#a78bfa',
    clearance: { front: 600, sides: 0, description: '600mm corner clearance path for door articulation' },
  },
  {
    id: 'uk-kitchen-cooker',
    label: 'Cooker / Hob Module',
    category: 'kitchen',
    iconType: 'kitchen',
    width: 600,
    depth: 600,
    color: '#fb7185',
    clearance: { front: 750, sides: 0, description: '750mm hot surface safety clear operational zone' },
  },
  {
    id: 'uk-kitchen-wall-cabinet',
    label: 'Wall Cabinet',
    category: 'kitchen',
    iconType: 'kitchen',
    width: 600,
    depth: 300,
    color: '#ddd6fe',
    clearance: { front: 450, sides: 0, description: '450mm head height clearance zone' },
  },
  {
    id: 'uk-kitchen-washing-machine',
    label: 'Washing Machine',
    category: 'kitchen',
    iconType: 'appliance',
    width: 600,
    depth: 600,
    color: '#94a3b8',
    clearance: { front: 600, sides: 0, description: '600mm front clearance for door swing and loading' },
  },
  {
    id: 'uk-kitchen-tumble-dryer',
    label: 'Tumble Dryer',
    category: 'kitchen',
    iconType: 'appliance',
    width: 600,
    depth: 600,
    color: '#94a3b8',
    clearance: { front: 600, sides: 0, description: '600mm front clearance for door swing and loading' },
  },
  {
    id: 'uk-kitchen-worktop',
    label: 'Kitchen Worktop',
    category: 'kitchen',
    iconType: 'kitchen',
    width: 1200,
    depth: 600,
    color: '#7c2d12',
    clearance: { front: 600, sides: 0, description: '600mm operational space in front of worktop' },
  },

  // ═══════════════════════════════════════
  // BEDROOM
  // ═══════════════════════════════════════
  {
    id: 'uk-bed-double',
    label: 'Double Bed',
    category: 'bedroom',
    iconType: 'bed',
    width: 1350,
    depth: 1900,
    color: '#fb923c',
    clearance: { front: 600, sides: 600, description: '600mm continuous walking pathway around three sides' },
  },
  {
    id: 'uk-bed-king',
    label: 'King Bed',
    category: 'bedroom',
    iconType: 'bed',
    width: 1500,
    depth: 2000,
    color: '#fb923c',
    clearance: { front: 650, sides: 650, description: '650mm walking perimeter access lane' },
  },
  {
    id: 'uk-wardrobe-standard',
    label: 'Wardrobe Standard',
    category: 'bedroom',
    iconType: 'wardrobe',
    width: 600,
    depth: 600,
    color: '#fbbf24',
    clearance: { front: 600, sides: 0, description: '600mm structural swinging door operational tolerance' },
  },
  {
    id: 'uk-wardrobe-slider',
    label: 'Wardrobe Slider',
    category: 'bedroom',
    iconType: 'wardrobe',
    width: 1200,
    depth: 500,
    color: '#fbbf24',
    clearance: { front: 500, sides: 0, description: '500mm standard sliding corridor access clearance' },
  },
  {
    id: 'uk-bed-single',
    label: 'Single Bed',
    category: 'bedroom',
    iconType: 'bed',
    width: 900,
    depth: 1900,
    color: '#fb923c',
    clearance: { front: 600, sides: 600, description: '600mm single side circulation pathway' },
  },
  {
    id: 'uk-bedroom-chest-drawers',
    label: 'Chest of Drawers',
    category: 'bedroom',
    iconType: 'wardrobe',
    width: 800,
    depth: 450,
    color: '#fbbf24',
    clearance: { front: 600, sides: 0, description: '600mm drawer extension operational threshold' },
  },

  // ═══════════════════════════════════════
  // FURNITURE
  // ═══════════════════════════════════════
  {
    id: 'uk-furniture-bedside-table',
    label: 'Bedside Table',
    category: 'furniture',
    iconType: 'table',
    width: 450,
    depth: 450,
    color: '#f59e0b',
    clearance: { front: 450, sides: 100, description: 'Allow pull-out and circulation around compact bedside table' },
  },
  {
    id: 'uk-furniture-chair',
    label: 'Chair',
    category: 'furniture',
    iconType: 'chair',
    width: 500,
    depth: 500,
    color: '#10b981',
    clearance: { front: 450, sides: 150, description: '450mm pull-back space recommended for seating movement' },
  },
  {
    id: 'uk-furniture-dressing-table',
    label: 'Dressing Table',
    category: 'furniture',
    iconType: 'table',
    width: 1000,
    depth: 450,
    color: '#f59e0b',
    clearance: { front: 700, sides: 150, description: '700mm seated access zone in front of dressing table' },
  },
  {
    id: 'uk-furniture-coffee-table',
    label: 'Coffee Table',
    category: 'furniture',
    iconType: 'table',
    width: 1000,
    depth: 600,
    color: '#f59e0b',
    clearance: { front: 400, sides: 300, description: 'Living space circulation zone around central coffee table' },
  },
  {
    id: 'uk-furniture-sofa-3s',
    label: '3-Seater Sofa',
    category: 'furniture',
    iconType: 'chair',
    width: 2000,
    depth: 900,
    color: '#34d399',
    clearance: { front: 600, sides: 200, description: '600mm standard circulation gap in front of sofa' },
  },
  {
    id: 'uk-furniture-sofa-2s',
    label: '2-Seater Sofa',
    category: 'furniture',
    iconType: 'chair',
    width: 1500,
    depth: 900,
    color: '#34d399',
    clearance: { front: 600, sides: 200, description: '600mm standard circulation gap in front of sofa' },
  },
  {
    id: 'uk-furniture-armchair',
    label: 'Armchair',
    category: 'furniture',
    iconType: 'chair',
    width: 850,
    depth: 850,
    color: '#34d399',
    clearance: { front: 500, sides: 150, description: '500mm pull-out/access clearance zone' },
  },
  {
    id: 'uk-furniture-dining-table',
    label: 'Dining Table',
    category: 'furniture',
    iconType: 'table',
    width: 1500,
    depth: 900,
    color: '#f59e0b',
    clearance: { front: 800, sides: 800, description: '800mm seated/chair extension clearance boundary' },
  },
  {
    id: 'uk-furniture-adult',
    label: 'Adult (Scale Figure)',
    category: 'furniture',
    iconType: 'generic',
    width: 500,
    depth: 400,
    color: '#f43f5e',
    clearance: { front: 500, sides: 200, description: 'Circulation space around a standing adult' },
  },
  {
    id: 'uk-furniture-tv-wall',
    label: 'Wall-Mounted TV',
    category: 'furniture',
    iconType: 'tv',
    width: 1200,
    depth: 120,
    color: '#475569',
    clearance: { front: 500, sides: 100, description: 'Maintain clearance for wall visibility' },
  },
  {
    id: 'uk-furniture-tv-stand',
    label: 'TV on Stand',
    category: 'furniture',
    iconType: 'tv',
    width: 1200,
    depth: 400,
    color: '#475569',
    clearance: { front: 500, sides: 100, description: 'Maintain space around console' },
  },

  // ═══════════════════════════════════════
  // ELECTRICAL (UK symbols)
  // ═══════════════════════════════════════
  {
    id: 'uk-elec-single-socket',
    label: 'Single Socket (13A)',
    category: 'electrical',
    iconType: 'electric',
    width: 86,
    depth: 86,
    color: '#f97316',
    clearance: { front: 0, sides: 0, description: 'Wall-mounted service symbol' },
  },
  {
    id: 'uk-elec-double-socket',
    label: 'Double Socket (13A)',
    category: 'electrical',
    iconType: 'electric',
    width: 146,
    depth: 86,
    color: '#f97316',
    clearance: { front: 0, sides: 0, description: 'Wall-mounted service symbol' },
  },
  {
    id: 'uk-elec-light-switch-1g',
    label: 'Light Switch 1G',
    category: 'electrical',
    iconType: 'electric',
    width: 86,
    depth: 86,
    color: '#f97316',
    clearance: { front: 0, sides: 0, description: 'Wall-mounted control symbol' },
  },
  {
    id: 'uk-elec-ceiling-light',
    label: 'Ceiling Light Point',
    category: 'electrical',
    iconType: 'electric',
    width: 120,
    depth: 120,
    color: '#f97316',
    clearance: { front: 0, sides: 0, description: 'Ceiling lighting symbol in reflected plan' },
  },
  {
    id: 'uk-elec-extractor-fan',
    label: 'Extractor Fan',
    category: 'electrical',
    iconType: 'electric',
    width: 150,
    depth: 150,
    color: '#f97316',
    clearance: { front: 0, sides: 0, description: 'Mechanical extraction point symbol' },
  },

  // ═══════════════════════════════════════
  // PLUMBING (UK symbols)
  // ═══════════════════════════════════════
  {
    id: 'uk-plumb-hot-water-outlet',
    label: 'Hot Water Outlet',
    category: 'plumbing',
    iconType: 'plumbing',
    width: 80,
    depth: 80,
    color: '#0ea5e9',
    clearance: { front: 0, sides: 0, description: 'Service connection point symbol' },
  },
  {
    id: 'uk-plumb-cold-water-outlet',
    label: 'Cold Water Outlet',
    category: 'plumbing',
    iconType: 'plumbing',
    width: 80,
    depth: 80,
    color: '#0ea5e9',
    clearance: { front: 0, sides: 0, description: 'Service connection point symbol' },
  },
  {
    id: 'uk-plumb-waste-outlet',
    label: 'Waste Outlet',
    category: 'plumbing',
    iconType: 'plumbing',
    width: 80,
    depth: 80,
    color: '#0ea5e9',
    clearance: { front: 0, sides: 0, description: 'Waste connection point symbol' },
  },
  {
    id: 'uk-plumb-soil-stack-110',
    label: 'Soil Stack 110mm',
    category: 'plumbing',
    iconType: 'plumbing',
    width: 110,
    depth: 110,
    color: '#0ea5e9',
    clearance: { front: 0, sides: 0, description: 'Vertical soil stack symbol' },
  },
  {
    id: 'uk-plumb-radiator-1000',
    label: 'Radiator 1000mm',
    category: 'plumbing',
    iconType: 'radiator',
    width: 1000,
    depth: 120,
    color: '#0ea5e9',
    clearance: { front: 150, sides: 0, description: 'Keep clear from obstructions for airflow and maintenance' },
  },
  {
    id: 'uk-plumb-radiator-600',
    label: 'Radiator 600mm',
    category: 'plumbing',
    iconType: 'radiator',
    width: 600,
    depth: 120,
    color: '#0ea5e9',
    clearance: { front: 150, sides: 0, description: 'Keep clear from obstructions for airflow and maintenance' },
  },
];

export function getFixtureDefinition(typeId: string): FixtureDefinition | undefined {
  return FIXTURE_LIBRARY.find((f) => f.id === typeId);
}

export function getFixturesByCategory(category: FixtureDefinition['category']): FixtureDefinition[] {
  return FIXTURE_LIBRARY.filter((f) => f.category === category);
}
