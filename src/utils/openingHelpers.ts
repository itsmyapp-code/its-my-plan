// Utilities for positioning and validating openings on walls

import type { Point, Wall, Opening } from '@/types';
import { wallLength, wallAngle, wallDirection, wallNormal } from './geometry';

/**
 * Compute the world position and rotation for an opening on a wall.
 */
export function positionOnWall(
  wall: Wall,
  distanceFromP1: number
): { point: Point; angle: number } {
  const dir = wallDirection(wall);
  const angle = wallAngle(wall);

  return {
    point: {
      x: wall.p1.x + dir.x * distanceFromP1,
      y: wall.p1.y + dir.y * distanceFromP1,
    },
    angle: (angle * 180) / Math.PI,
  };
}

/**
 * Clamp an opening position so it doesn't overflow past wall endpoints.
 * Returns the clamped distanceFromP1.
 */
export function clampOpeningPosition(
  wall: Wall,
  opening: Pick<Opening, 'width' | 'distanceFromP1'>
): number {
  const len = wallLength(wall);
  const halfWidth = opening.width / 2;
  const min = halfWidth;
  const max = len - halfWidth;

  if (max <= min) return len / 2; // Wall is shorter than the opening
  return Math.max(min, Math.min(max, opening.distanceFromP1));
}

/**
 * Check if two openings on the same wall overlap.
 */
export function openingsOverlap(
  a: Pick<Opening, 'distanceFromP1' | 'width'>,
  b: Pick<Opening, 'distanceFromP1' | 'width'>
): boolean {
  const aStart = a.distanceFromP1 - a.width / 2;
  const aEnd = a.distanceFromP1 + a.width / 2;
  const bStart = b.distanceFromP1 - b.width / 2;
  const bEnd = b.distanceFromP1 + b.width / 2;

  return aStart < bEnd && aEnd > bStart;
}

/**
 * Check if a new opening would overlap with any existing openings on the same wall.
 */
export function hasOverlappingOpenings(
  wall: Wall,
  openings: Opening[],
  newOpening: Pick<Opening, 'distanceFromP1' | 'width'>,
  excludeId?: string
): boolean {
  const wallOpenings = openings.filter(
    (o) => o.wallId === wall.id && o.id !== excludeId
  );

  return wallOpenings.some((existing) => openingsOverlap(existing, newOpening));
}

/**
 * Get the SVG door arc path for a door opening.
 */
export function getDoorArcPath(
  opening: Opening,
  wall: Wall
): string {
  const { point, angle } = positionOnWall(wall, opening.distanceFromP1);
  const halfWidth = opening.width / 2;
  const normal = wallNormal(wall);
  const dir = wallDirection(wall);
  const flipMult = opening.flipDirection ? -1 : 1;

  // Door pivot point (at hinged edge of the opening)
  const hingeSide = opening.hingeSide ?? 'p1';
  const pivotX = hingeSide === 'p1'
    ? point.x - dir.x * halfWidth
    : point.x + dir.x * halfWidth;
  const pivotY = hingeSide === 'p1'
    ? point.y - dir.y * halfWidth
    : point.y + dir.y * halfWidth;

  // Arc endpoint (swing direction)
  const arcEndX = pivotX + normal.x * opening.width * flipMult;
  const arcEndY = pivotY + normal.y * opening.width * flipMult;

  return `M ${pivotX} ${pivotY} A ${opening.width} ${opening.width} 0 0 ${opening.flipDirection ? 0 : 1} ${arcEndX} ${arcEndY}`;
}
