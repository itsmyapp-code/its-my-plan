// Material Takeoff Engine — pure JavaScript analytic utility
// Computes architectural material dimensions from layout state

import type { RoomPlan, MaterialTakeoff, TimberLineItem } from '@/types';
import { wallLength, getWallHeights } from './geometry';
import { CEILING_HEIGHT } from '@/constants';
import { getWallFramingLayout } from './framing';

/**
 * Compute material takeoff from the current plan state.
 * All output values are in metric (m² and linear metres).
 */
export function computeMaterialTakeoff(plan: RoomPlan): MaterialTakeoff {
  const { walls, openings, fixtures } = plan;

  // ── Total Base Perimeter (linear metres) ──
  // Sum of all wall centreline lengths
  const totalBasePerimeterMM = walls.reduce((sum, wall) => sum + wallLength(wall), 0);
  const totalBasePerimeter = totalBasePerimeterMM / 1000; // Convert mm → m

  // ── Total Wall Surface Area (m²) ──
  // Each wall: length × ceiling height, minus opening areas
  let totalWallSurfaceAreaMM2 = 0;

  for (const wall of walls) {
    const len = wallLength(wall);
    const wallArea = len * CEILING_HEIGHT;

    // Subtract openings on this wall
    const wallOpenings = openings.filter((o) => o.wallId === wall.id);
    const openingArea = wallOpenings.reduce((sum, o) => sum + o.width * o.height, 0);

    totalWallSurfaceAreaMM2 += wallArea - openingArea;
  }

  const totalWallSurfaceArea = totalWallSurfaceAreaMM2 / 1_000_000; // mm² → m²

  // ── Total Floor Area (m²) ──
  // Use the Shoelace formula on wall endpoints to compute enclosed area.
  // This works when walls form a closed polygon.
  const floorArea = computeFloorArea(plan);

  const timberTakeoff = calculateTimberTakeoff(plan);

  return {
    totalFloorArea: floorArea,
    totalWallSurfaceArea: Math.max(0, totalWallSurfaceArea),
    totalBasePerimeter,
    wallCount: walls.length,
    openingCount: openings.length,
    fixtureCount: fixtures.length,
    timberTakeoff,
  };
}

function calculateTimberTakeoff(plan: RoomPlan): TimberLineItem[] {
  const { walls, openings } = plan;
  const groups: { [key: string]: { linearMM: number; boards: { [len: number]: number } } } = {};

  const STANDARD_LENGTHS = [2.4, 3.0, 3.6, 4.2, 4.8]; // in meters

  for (const wall of walls) {
    if (!wall.hasFraming) continue;

    const layout = getWallFramingLayout(wall, openings, CEILING_HEIGHT);
    const { h1, h2 } = getWallHeights(wall, CEILING_HEIGHT);
    const L = wallLength(wall);
    const slopeLen = Math.sqrt(L * L + (h2 - h1) * (h2 - h1));

    // Determine key for grouping: size + grade
    let sizeLabel = '';
    if (wall.timberSize === 'custom') {
      sizeLabel = `${wall.customTimberThickness ?? 47} x ${wall.customTimberWidth ?? 169} mm`;
    } else {
      const parts = (wall.timberSize || '47x100').split('x');
      sizeLabel = `${parts[0]} x ${parts[1]} mm`;
    }
    const grade = wall.timberGrade || 'C24';
    const key = `${sizeLabel}|${grade}`;

    if (!groups[key]) {
      groups[key] = {
        linearMM: 0,
        boards: { 2.4: 0, 3.0: 0, 3.6: 0, 4.2: 0, 4.8: 0 },
      };
    }

    const group = groups[key];

    // 1. Plates: 1 bottom plate of length L, 2 top plates of length slopeLen
    const bottomPlateLen = L;
    const topPlatesLen = slopeLen * 2;
    const totalPlatesLen = bottomPlateLen + topPlatesLen;
    group.linearMM += totalPlatesLen;

    // Estimate plates board counts: use 4.8m boards for plates runs
    const platesBoardsCount = Math.ceil(totalPlatesLen / 4800);
    group.boards[4.8] += platesBoardsCount;

    // 2. Vertical studs
    for (const stud of layout.studs) {
      group.linearMM += stud.height;
      
      const studMeters = stud.height / 1000;
      let matchedLen = 4.8;
      for (const len of STANDARD_LENGTHS) {
        if (len >= studMeters) {
          matchedLen = len;
          break;
        }
      }
      group.boards[matchedLen] += 1;
    }

    // 3. Lintels (Headers)
    for (const lintel of layout.headerLintels) {
      const totalLintelLen = lintel.width * 2;
      group.linearMM += totalLintelLen;
      const lintelBoardsCount = Math.ceil(totalLintelLen / 4800);
      group.boards[4.8] += lintelBoardsCount;
    }

    // 4. Sill Plates
    for (const sill of layout.sillPlates) {
      group.linearMM += sill.width;
      const sillBoardsCount = Math.ceil(sill.width / 4800);
      group.boards[4.8] += sillBoardsCount;
    }
  }

  return Object.entries(groups).map(([key, val]) => {
    const [dimensions, grade] = key.split('|');
    const boardCounts = Object.entries(val.boards)
      .map(([lenStr, count]) => ({
        length: Number(lenStr),
        count,
      }))
      .filter((bc) => bc.count > 0);

    return {
      dimensions,
      grade: grade as any,
      linearMeters: val.linearMM / 1000,
      boardCounts,
    };
  });
}

/**
 * Compute floor area using the Shoelace formula on connected wall endpoints.
 * Attempts to trace a closed polygon from wall connectivity.
 * Returns area in m².
 */
function computeFloorArea(plan: RoomPlan): number {
  const { walls } = plan;
  if (walls.length < 3) return 0;

  // Build adjacency: find connected wall chains
  // Simple approach: try to trace a polygon from wall endpoints
  const points: { x: number; y: number }[] = [];
  const used = new Set<string>();

  // Start from the first wall
  let current = walls[0];
  used.add(current.id);
  points.push(current.p1);
  let lastPoint = current.p2;
  points.push(lastPoint);

  // Try to chain walls by matching endpoints
  const TOLERANCE = 5; // mm tolerance for endpoint matching

  for (let iter = 0; iter < walls.length; iter++) {
    let found = false;
    for (const wall of walls) {
      if (used.has(wall.id)) continue;

      const d1 = Math.hypot(wall.p1.x - lastPoint.x, wall.p1.y - lastPoint.y);
      const d2 = Math.hypot(wall.p2.x - lastPoint.x, wall.p2.y - lastPoint.y);

      if (d1 < TOLERANCE) {
        used.add(wall.id);
        lastPoint = wall.p2;
        points.push(lastPoint);
        found = true;
        break;
      } else if (d2 < TOLERANCE) {
        used.add(wall.id);
        lastPoint = wall.p1;
        points.push(lastPoint);
        found = true;
        break;
      }
    }
    if (!found) break;
  }

  // Apply Shoelace formula
  if (points.length < 3) return 0;

  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  area = Math.abs(area) / 2;

  // Convert mm² to m²
  return area / 1_000_000;
}
