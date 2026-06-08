// Core data models for itsmyplan — all coordinates in millimetres

export interface Point {
  x: number; // mm
  y: number; // mm
}

export interface Wall {
  id: string;
  p1: Point;
  p2: Point;
  thickness: number; // 100mm internal stud, 300mm external cavity
  wallType: 'internal' | 'external';
  height?: number; // Uniform height in mm (defaults to CEILING_HEIGHT)
  heightP1?: number; // Height at p1 end in mm (for sloped/raked walls)
  heightP2?: number; // Height at p2 end in mm (for sloped/raked walls)
  color?: string; // Custom color override
  hasFraming?: boolean;
  timberSize?: '47x75' | '47x100' | '47x125' | '47x150' | '47x175' | '47x200' | '47x225' | '75x100' | '75x150' | 'custom';
  customTimberWidth?: number; // depth/width in mm
  customTimberThickness?: number; // thickness in mm
  timberGrade?: 'C16' | 'C24' | 'TR26';
  studSpacing?: number; // mm
  plasterboardSides?: 'none' | 'one' | 'both';
}

export interface Opening {
  id: string;
  wallId: string;
  type: 'door' | 'window';
  distanceFromP1: number; // mm along wall line from p1
  width: number; // e.g., 762mm door, 1200mm window
  height: number; // For 3D extrusion (2040mm door, 1200mm window)
  zOffset: number; // Elevation from floor (0 for doors, ~900mm for windows)
  flipDirection: boolean; // Door swing / window open direction
  hingeSide: 'p1' | 'p2'; // Which edge of the opening the door is hinged on
  specification?: string; // e.g. "FD30 Fire Door"
}

export interface Fixture {
  id: string;
  type: string; // References fixture library ID
  x: number; // Center coordinate X in mm
  y: number; // Center coordinate Y in mm
  rotation: number; // 0, 90, 180, 270 degrees
  width?: number; // Optional instance override in mm
  depth?: number; // Optional instance override in mm
  showClearance: boolean; // Dynamic tracking property visibility toggle
}

export interface PlanMetadata {
  jobNumber: string;
  version: string;
  operator: string;
  scale: string; // e.g. "1:50"
  clientName?: string;
}

export interface Measurement {
  id: string;
  p1: Point;
  p2: Point;
}

export interface TextBox {
  id: string;
  x: number; // mm coordinate
  y: number; // mm coordinate
  text: string;
  fontSize: number; // font size in SVG pixels (e.g. 12, 16, 20, 24, 32, 48, 64)
  color: string; // hex color code or preset
  isBold: boolean;
  isItalic: boolean;
}

export interface RoomPlan {
  id: string;
  name: string;
  walls: Wall[];
  openings: Opening[];
  fixtures: Fixture[];
  measurements?: Measurement[];
  texts?: TextBox[];
  metadata: PlanMetadata;
  createdAt: number;
  updatedAt: number;
}

// App view settings for display toggles
export interface AppViewSettings {
  showDimensions: boolean;
  showClearanceZones: boolean;
  showServiceLayers: boolean;
  showElectricalLayer: boolean;
  showPlumbingLayer: boolean;
  activeMode: '2d' | '3d' | 'takeoff';
  showFraming: boolean;
}

// Tool modes for the 2D canvas
export type ToolMode = 'select' | 'draw-wall' | 'place-opening-door' | 'place-opening-window' | 'place-fixture' | 'pan' | 'measure' | 'place-text';

// Selection state
export interface SelectionState {
  type: 'wall' | 'opening' | 'fixture' | 'measurement' | 'text' | null;
  id: string | null;
}

// Viewport state for 2D canvas pan/zoom
export interface ViewportState {
  panX: number; // mm offset
  panY: number; // mm offset
  zoom: number; // multiplier (1 = default)
}

// Snap result returned by snapping utilities
export interface SnapResult {
  point: Point;
  snapped: boolean;
  snapType: 'grid' | 'endpoint' | 'midpoint' | 'angle' | 'wall-line' | 'none';
  snapSourceId?: string; // ID of the wall/element snapped to
}

export interface TimberBoardCount {
  length: number; // in meters (e.g. 2.4, 3.0, 3.6, 4.2, 4.8)
  count: number;
}

export interface TimberLineItem {
  dimensions: string; // e.g. "47 x 150 mm"
  grade: 'C16' | 'C24' | 'TR26';
  linearMeters: number;
  boardCounts: TimberBoardCount[];
}

// Material takeoff results
export interface MaterialTakeoff {
  totalFloorArea: number; // m²
  totalWallSurfaceArea: number; // m²
  totalBasePerimeter: number; // linear metres
  wallCount: number;
  openingCount: number;
  fixtureCount: number;
  timberTakeoff?: TimberLineItem[];
  plasterboardArea?: number; // m²
  plasterboardSheets2400?: number; // 2.4x1.2m sheets count
  plasterboardSheets1800?: number; // 1.8x0.9m sheets count
  skirtingMeters?: number; // lin. m
  skirtingBoardsCount?: number; // 4.2m runs count
  architraveMeters?: number; // lin. m
  architraveBoardsCount?: number; // 2.4m runs count
  insulationArea?: number; // m²
  isFloorAreaOpen?: boolean;
}

