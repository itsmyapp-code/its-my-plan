// Snap utilities for the 2D drawing canvas
// All inputs/outputs in millimetres

import type { Point, Wall, SnapResult } from '@/types';
import { GRID_SNAP, SNAP_ENDPOINT_THRESHOLD, SNAP_ANGLE_STEP } from '@/constants';
import { distance, wallMidpoint } from './geometry';

/** Snap a point to the nearest grid intersection */
export function snapToGrid(point: Point, gridSize: number = GRID_SNAP): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

/** Find the nearest wall endpoint within threshold, or null */
export function snapToEndpoint(
  point: Point,
  walls: Wall[],
  threshold: number = SNAP_ENDPOINT_THRESHOLD
): { point: Point; wallId: string } | null {
  let closest: { point: Point; wallId: string; dist: number } | null = null;

  for (const wall of walls) {
    for (const ep of [wall.p1, wall.p2]) {
      const d = distance(point, ep);
      if (d < threshold && (closest === null || d < closest.dist)) {
        closest = { point: { ...ep }, wallId: wall.id, dist: d };
      }
    }
  }

  return closest ? { point: closest.point, wallId: closest.wallId } : null;
}

/** Find the nearest wall midpoint within threshold, or null */
export function snapToMidpoint(
  point: Point,
  walls: Wall[],
  threshold: number = SNAP_ENDPOINT_THRESHOLD
): { point: Point; wallId: string } | null {
  let closest: { point: Point; wallId: string; dist: number } | null = null;

  for (const wall of walls) {
    const mid = wallMidpoint(wall);
    const d = distance(point, mid);
    if (d < threshold && (closest === null || d < closest.dist)) {
      closest = { point: mid, wallId: wall.id, dist: d };
    }
  }

  return closest ? { point: closest.point, wallId: closest.wallId } : null;
}

/** Constrain a point to a specific angle from an origin (e.g. 0, 15, 30, 45...) */
export function snapToAngle(
  origin: Point,
  current: Point,
  angleStep: number = SNAP_ANGLE_STEP
): Point {
  const dx = current.x - origin.x;
  const dy = current.y - origin.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return { ...current };

  const angleRad = Math.atan2(dy, dx);
  const angleDeg = (angleRad * 180) / Math.PI;
  const snappedDeg = Math.round(angleDeg / angleStep) * angleStep;
  const snappedRad = (snappedDeg * Math.PI) / 180;

  return {
    x: origin.x + dist * Math.cos(snappedRad),
    y: origin.y + dist * Math.sin(snappedRad),
  };
}

/**
 * Resolve the best snap for a given point, applying priority:
 * 1. Endpoint snap
 * 2. Midpoint snap
 * 3. Grid snap (always)
 *
 * If shiftHeld is true, also applies angle snapping from the origin.
 */
export function resolveSnap(
  point: Point,
  walls: Wall[],
  options?: {
    origin?: Point; // For angle snapping
    shiftHeld?: boolean;
    excludeWallIds?: string[]; // Don't snap to these walls
  }
): SnapResult {
  const filteredWalls = options?.excludeWallIds
    ? walls.filter((w) => !options.excludeWallIds!.includes(w.id))
    : walls;

  // Apply angle snap first if shift held
  let candidate = { ...point };
  if (options?.shiftHeld && options?.origin) {
    candidate = snapToAngle(options.origin, candidate);
  }

  // Priority 1: Endpoint snap
  const epSnap = snapToEndpoint(candidate, filteredWalls);
  if (epSnap) {
    return {
      point: epSnap.point,
      snapped: true,
      snapType: 'endpoint',
      snapSourceId: epSnap.wallId,
    };
  }

  // Priority 2: Midpoint snap
  const mpSnap = snapToMidpoint(candidate, filteredWalls);
  if (mpSnap) {
    return {
      point: mpSnap.point,
      snapped: true,
      snapType: 'midpoint',
      snapSourceId: mpSnap.wallId,
    };
  }

  // Priority 3: Angle snap (if shift and origin)
  if (options?.shiftHeld && options?.origin) {
    const angleSnapped = snapToAngle(options.origin, point);
    const gridSnapped = snapToGrid(angleSnapped);
    return {
      point: gridSnapped,
      snapped: true,
      snapType: 'angle',
    };
  }

  // Priority 4: Grid snap (always)
  const gridSnapped = snapToGrid(candidate);
  return {
    point: gridSnapped,
    snapped: true,
    snapType: 'grid',
  };
}
