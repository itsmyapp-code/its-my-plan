// Core vector math and geometry utilities for wall calculations
// All inputs/outputs in millimetres

import type { Point, Wall } from '@/types';

/** Euclidean distance between two points */
export function distance(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Length of a wall segment */
export function wallLength(wall: Wall): number {
  return distance(wall.p1, wall.p2);
}

/** Angle of a wall in radians (from p1 to p2, measured from positive X axis) */
export function wallAngle(wall: Wall): number {
  return Math.atan2(wall.p2.y - wall.p1.y, wall.p2.x - wall.p1.x);
}

/** Angle of a wall in degrees */
export function wallAngleDeg(wall: Wall): number {
  return (wallAngle(wall) * 180) / Math.PI;
}

/** Midpoint of a wall */
export function wallMidpoint(wall: Wall): Point {
  return {
    x: (wall.p1.x + wall.p2.x) / 2,
    y: (wall.p1.y + wall.p2.y) / 2,
  };
}

/** Unit normal vector perpendicular to the wall (rotated 90° CCW) */
export function wallNormal(wall: Wall): Point {
  const len = wallLength(wall);
  if (len === 0) return { x: 0, y: -1 };
  const dx = wall.p2.x - wall.p1.x;
  const dy = wall.p2.y - wall.p1.y;
  return {
    x: -dy / len,
    y: dx / len,
  };
}

/** Point at a given distance along the wall from p1 */
export function pointAlongWall(wall: Wall, dist: number): Point {
  const len = wallLength(wall);
  if (len === 0) return { ...wall.p1 };
  const t = dist / len;
  return {
    x: wall.p1.x + (wall.p2.x - wall.p1.x) * t,
    y: wall.p1.y + (wall.p2.y - wall.p1.y) * t,
  };
}

/** Direction unit vector from p1 to p2 */
export function wallDirection(wall: Wall): Point {
  const len = wallLength(wall);
  if (len === 0) return { x: 1, y: 0 };
  return {
    x: (wall.p2.x - wall.p1.x) / len,
    y: (wall.p2.y - wall.p1.y) / len,
  };
}

/**
 * Compute the 4 corners of a wall polygon accounting for thickness.
 * Returns corners in order: topLeft, topRight, bottomRight, bottomLeft
 * (relative to the wall's direction).
 */
export function wallCorners(wall: Wall): [Point, Point, Point, Point] {
  const normal = wallNormal(wall);
  const halfThick = wall.thickness / 2;
  const offsetX = normal.x * halfThick;
  const offsetY = normal.y * halfThick;

  return [
    { x: wall.p1.x + offsetX, y: wall.p1.y + offsetY },
    { x: wall.p2.x + offsetX, y: wall.p2.y + offsetY },
    { x: wall.p2.x - offsetX, y: wall.p2.y - offsetY },
    { x: wall.p1.x - offsetX, y: wall.p1.y - offsetY },
  ];
}

/**
 * Find the intersection point of two infinite lines defined by wall segments.
 * Returns null if lines are parallel.
 */
export function linesIntersect(w1: Wall, w2: Wall): Point | null {
  const x1 = w1.p1.x, y1 = w1.p1.y;
  const x2 = w1.p2.x, y2 = w1.p2.y;
  const x3 = w2.p1.x, y3 = w2.p1.y;
  const x4 = w2.p2.x, y4 = w2.p2.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 0.001) return null; // Parallel

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;

  return {
    x: x1 + t * (x2 - x1),
    y: y1 + t * (y2 - y1),
  };
}

/**
 * Project a point onto a wall's infinite line and return the closest point on the line,
 * plus the distance from p1 along the wall direction.
 */
export function projectPointOntoWall(
  point: Point,
  wall: Wall
): { projected: Point; distanceAlongWall: number; perpendicularDistance: number } {
  const dx = wall.p2.x - wall.p1.x;
  const dy = wall.p2.y - wall.p1.y;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return {
      projected: { ...wall.p1 },
      distanceAlongWall: 0,
      perpendicularDistance: distance(point, wall.p1),
    };
  }

  const t = ((point.x - wall.p1.x) * dx + (point.y - wall.p1.y) * dy) / lenSq;
  const projected: Point = {
    x: wall.p1.x + t * dx,
    y: wall.p1.y + t * dy,
  };

  return {
    projected,
    distanceAlongWall: t * Math.sqrt(lenSq),
    perpendicularDistance: distance(point, projected),
  };
}

/** Compute the bounding box of all walls, returning min/max in mm */
export function wallsBoundingBox(walls: Wall[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  center: Point;
} {
  if (walls.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, center: { x: 0, y: 0 } };
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const wall of walls) {
    const corners = wallCorners(wall);
    for (const c of corners) {
      if (c.x < minX) minX = c.x;
      if (c.y < minY) minY = c.y;
      if (c.x > maxX) maxX = c.x;
      if (c.y > maxY) maxY = c.y;
    }
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
  };
}

/** Format a measurement in mm for display (e.g., "2,400 mm") */
export function formatMM(mm: number): string {
  return `${Math.round(mm).toLocaleString('en-GB')} mm`;
}

/** Get wall heights at p1 and p2 endpoints (mm) */
export function getWallHeights(wall: Wall, defaultHeight: number): { h1: number; h2: number } {
  const uniform = wall.height ?? defaultHeight;
  return {
    h1: wall.heightP1 ?? uniform,
    h2: wall.heightP2 ?? uniform,
  };
}

/** Interpolate wall height at a distance along the wall from p1 (mm) */
export function wallHeightAt(wall: Wall, distFromP1: number, defaultHeight: number): number {
  const len = wallLength(wall);
  if (len === 0) return defaultHeight;
  const { h1, h2 } = getWallHeights(wall, defaultHeight);
  const t = Math.max(0, Math.min(1, distFromP1 / len));
  return h1 + (h2 - h1) * t;
}
