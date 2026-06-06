// UK Structural & Furniture Asset Library
// All dimensions in millimetres — based on standard UK residential sizes
// Covers Bathroom, Kitchen, and Bedroom domains as per the master architecture spec

export interface FixtureDefinition {
  id: string;
  label: string;
  category: 'bathroom' | 'kitchen' | 'bedroom';
  iconType: 'bath' | 'wc' | 'basin' | 'shower' | 'kitchen' | 'bed' | 'wardrobe' | 'generic';
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
];

export function getFixtureDefinition(typeId: string): FixtureDefinition | undefined {
  return FIXTURE_LIBRARY.find((f) => f.id === typeId);
}

export function getFixturesByCategory(category: FixtureDefinition['category']): FixtureDefinition[] {
  return FIXTURE_LIBRARY.filter((f) => f.category === category);
}
