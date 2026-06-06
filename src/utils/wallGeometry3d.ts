import * as THREE from 'three';
import type { Wall } from '@/types';
import { CEILING_HEIGHT, SCALE_3D } from '@/constants';
import { wallHeightAt } from './geometry';

export interface WallSegmentSpec {
  distStart: number; // mm from p1
  distEnd: number;   // mm from p1
  yBottom: number;   // mm from floor
  yTopStart?: number; // mm override at distStart
  yTopEnd?: number;   // mm override at distEnd
}

/**
 * Build a trapezoidal wall prism for sloped/raked walls.
 * Local origin at segment midpoint; +X toward p2, +Y up, +Z is wall normal.
 */
export function createSlopedWallGeometry(
  wall: Wall,
  spec: WallSegmentSpec,
  thickness: number
): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const len = spec.distEnd - spec.distStart;
  if (len <= 0) return geo;

  const s = SCALE_3D;
  const halfLen = (len * s) / 2;
  const halfThick = (thickness * s) / 2;
  const y0 = spec.yBottom * s;

  const yTopStart =
    (spec.yTopStart ?? wallHeightAt(wall, spec.distStart, CEILING_HEIGHT)) * s;
  const yTopEnd =
    (spec.yTopEnd ?? wallHeightAt(wall, spec.distEnd, CEILING_HEIGHT)) * s;

  // Skip degenerate segments
  if (yTopStart <= y0 + 0.001 && yTopEnd <= y0 + 0.001) return geo;

  // 8 corners: bottom quad then sloped top quad
  const positions = new Float32Array([
    -halfLen, y0, -halfThick,
    halfLen, y0, -halfThick,
    halfLen, y0, halfThick,
    -halfLen, y0, halfThick,
    -halfLen, yTopStart, -halfThick,
    halfLen, yTopEnd, -halfThick,
    halfLen, yTopEnd, halfThick,
    -halfLen, yTopStart, halfThick,
  ]);

  const indices = [
    0, 2, 1, 0, 3, 2, // bottom
    4, 5, 6, 4, 6, 7, // top (sloped)
    0, 1, 5, 0, 5, 4, // -Z face
    3, 7, 6, 3, 6, 2, // +Z face
    0, 4, 7, 0, 7, 3, // -X face (p1 end)
    1, 2, 6, 1, 6, 5, // +X face (p2 end)
  ];

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** Build all solid wall segments for a wall, accounting for openings. */
export function buildWallSegmentSpecs(
  wall: Wall,
  totalLength: number,
  openings: { distanceFromP1: number; width: number; height: number; zOffset: number }[]
): WallSegmentSpec[] {
  const specs: WallSegmentSpec[] = [];
  const sorted = [...openings].sort((a, b) => a.distanceFromP1 - b.distanceFromP1);
  let currentDist = 0;

  for (const op of sorted) {
    const opStart = op.distanceFromP1 - op.width / 2;
    const opEnd = op.distanceFromP1 + op.width / 2;
    const openingTop = op.zOffset + op.height;

    if (opStart > currentDist) {
      specs.push({ distStart: currentDist, distEnd: opStart, yBottom: 0 });
    }

    // Lintel above opening — top follows wall slope
    if (openingTop < wallHeightAt(wall, op.distanceFromP1, CEILING_HEIGHT)) {
      specs.push({
        distStart: opStart,
        distEnd: opEnd,
        yBottom: openingTop,
      });
    }

    // Sill below window — flat top at sill height
    if (op.zOffset > 0) {
      specs.push({
        distStart: opStart,
        distEnd: opEnd,
        yBottom: 0,
        yTopStart: op.zOffset,
        yTopEnd: op.zOffset,
      });
    }

    currentDist = opEnd;
  }

  if (currentDist < totalLength) {
    specs.push({ distStart: currentDist, distEnd: totalLength, yBottom: 0 });
  }

  return specs;
}
