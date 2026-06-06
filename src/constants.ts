// Domain constants for itsmyplan — all measurements in millimetres unless noted

// === Structural ===
export const CEILING_HEIGHT = 2400; // mm — UK standard residential ceiling height

// === 2D Rendering ===
export const SCALE_2D = 0.1; // 10mm = 1px in SVG viewport

// === Snap Grid ===
export const GRID_SNAP = 50; // mm — snap grid resolution
export const GRID_MAJOR = 500; // mm — major grid line interval
export const SNAP_ENDPOINT_THRESHOLD = 80; // mm — distance to trigger endpoint snap
export const SNAP_ANGLE_STEP = 15; // degrees — angle lock increment (when Shift held)

// === Wall Defaults ===
export const WALL_THICKNESS_INTERNAL = 100; // mm — internal stud wall
export const WALL_THICKNESS_EXTERNAL = 300; // mm — external cavity wall
export const MIN_WALL_LENGTH = 100; // mm — minimum drawable wall

// === Opening Defaults ===
export const DEFAULT_DOOR_WIDTH = 762; // mm — standard UK internal door
export const DEFAULT_DOOR_HEIGHT = 2040; // mm — standard UK door height
export const DEFAULT_WINDOW_WIDTH = 1200; // mm
export const DEFAULT_WINDOW_HEIGHT = 1200; // mm
export const DEFAULT_WINDOW_Z_OFFSET = 900; // mm from floor

// === 3D Rendering ===
export const SCALE_3D = 0.001; // mm → meters for Three.js
export const WALL_COLOR_INTERNAL = '#94a3b8'; // slate-400
export const WALL_COLOR_EXTERNAL = '#64748b'; // slate-500
export const FLOOR_COLOR = '#1e293b'; // slate-800
export const GRID_COLOR_MINOR = '#334155'; // slate-700
export const GRID_COLOR_MAJOR = '#475569'; // slate-600

// === Viewport ===
export const INITIAL_VIEWPORT_SIZE = 10000; // mm — initial visible area
export const ZOOM_MIN = 0.02;
export const ZOOM_MAX = 2.0;
export const ZOOM_STEP = 0.1;

// === Print / PDF ===
export const DEFAULT_PRINT_SCALE = '1:50'; // Standard architectural scale for 2D prints
export const PDF_SCALE_MM_PER_PX = 5; // At 1:50 with SCALE_2D=0.1 → 10mm/px → 1:50 on paper
