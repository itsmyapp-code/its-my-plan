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

export interface RoomPlan {
  id: string;
  name: string;
  walls: Wall[];
  openings: Opening[];
  fixtures: Fixture[];
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
}

// Tool modes for the 2D canvas
export type ToolMode = 'select' | 'draw-wall' | 'place-opening-door' | 'place-opening-window' | 'place-fixture' | 'pan' | 'measure';

// Selection state
export interface SelectionState {
  type: 'wall' | 'opening' | 'fixture' | null;
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

// Material takeoff results
export interface MaterialTakeoff {
  totalFloorArea: number; // m²
  totalWallSurfaceArea: number; // m²
  totalBasePerimeter: number; // linear metres
  wallCount: number;
  openingCount: number;
  fixtureCount: number;
}

