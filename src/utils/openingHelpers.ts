// Utilities for positioning and validating openings on walls

import type { Point, Wall, Opening } from '@/types';
import { wallLength, wallAngle, wallDirection, wallNormal, wallMidpoint, wallsBoundingBox } from './geometry';

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
 * Determine which side of a wall faces the room interior (heuristic using plan centroid).
 */
export function interiorSideOfWall(wall: Wall, allWalls: Wall[]): 1 | -1 {
  if (allWalls.length === 0) return 1;
  const normal = wallNormal(wall);
  const mid = wallMidpoint(wall);
  const centroid = wallsBoundingBox(allWalls).center;
  const toInterior = { x: centroid.x - mid.x, y: centroid.y - mid.y };
  const dot = normal.x * toInterior.x + normal.y * toInterior.y;
  return dot >= 0 ? 1 : -1;
}

/**
 * Default flipDirection so the door swings into the room, not out.
 * flipDirection=false swings toward +wallNormal; true swings toward -wallNormal.
 */
export function getDefaultDoorFlipDirection(wall: Wall, allWalls: Wall[]): boolean {
  return interiorSideOfWall(wall, allWalls) === -1;
}

/**
 * 3D door leaf Y rotation (radians) matching the 2D swing arc.
 * Positive local Z = +wallNormal in plan space.
 */
export function getDoorOpenRotationY(opening: Opening): number {
  const openAngle = Math.PI / 3;
  const swingPositiveNormal = !opening.flipDirection;
  const hingeP1 = (opening.hingeSide ?? 'p1') === 'p1';
  let rot = 0;
  if (hingeP1) {
    rot = swingPositiveNormal ? openAngle : -openAngle;
  } else {
    rot = swingPositiveNormal ? -openAngle : openAngle;
  }
  // 3D wall meshes are placed with an inverted Z mapping relative to 2D plan Y,
  // so the door leaf rotation must be mirrored to match the 2D swing direction.
  return -rot;
}

/**
 * Get the SVG door arc path for a door opening.
 */
export function getDoorArcPath(
  opening: Opening,
  wall: Wall
): string {
  const { point } = positionOnWall(wall, opening.distanceFromP1);
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

/**
 * Generate a unique, stable label (e.g. D1, W1) for an opening based on its type.
 */
export function getOpeningLabel(opening: Opening, openings: Opening[]): string {
  const typedOpenings = openings
    .filter((o) => o.type === opening.type)
    .sort((a, b) => a.id.localeCompare(b.id));
  const index = typedOpenings.findIndex((o) => o.id === opening.id);
  const prefix = opening.type === 'door' ? 'D' : 'W';
  return `${prefix}${index + 1}`;
}
