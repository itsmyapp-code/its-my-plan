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
  const totalBasePerimeterMM = walls.reduce((sum, wall) => sum + wallLength(wall), 0);
  const totalBasePerimeter = totalBasePerimeterMM / 1000;

  // ── Total Wall Surface Area (m²) ──
  let totalWallSurfaceAreaMM2 = 0;
  for (const wall of walls) {
    const len = wallLength(wall);
    const wallArea = len * CEILING_HEIGHT;
    const wallOpenings = openings.filter((o) => o.wallId === wall.id);
    const openingArea = wallOpenings.reduce((sum, o) => sum + o.width * o.height, 0);
    totalWallSurfaceAreaMM2 += wallArea - openingArea;
  }
  const totalWallSurfaceArea = totalWallSurfaceAreaMM2 / 1_000_000;

  // ── Total Floor Area (m²) using cycle detection ──
  const { area: floorArea, isOpen: isFloorAreaOpen } = computeFloorArea(plan);

  // ── Timber Takeoff ──
  const timberTakeoff = calculateTimberTakeoff(plan);

  // ── Plasterboard Estimation ──
  let plasterboardAreaMM2 = 0;
  for (const wall of walls) {
    const len = wallLength(wall);
    const wallArea = len * CEILING_HEIGHT;
    const wallOpenings = openings.filter((o) => o.wallId === wall.id);
    const openingArea = wallOpenings.reduce((sum, o) => sum + o.width * o.height, 0);
    const netArea = wallArea - openingArea;

    // Boarding sides: external defaults to 1, internal to 2.
    let sides = wall.wallType === 'external' ? 1 : 2;
    if (wall.plasterboardSides === 'none') sides = 0;
    else if (wall.plasterboardSides === 'one') sides = 1;
    else if (wall.plasterboardSides === 'both') sides = 2;

    plasterboardAreaMM2 += netArea * sides;
  }

  const plasterboardArea = plasterboardAreaMM2 / 1_000_000;
  const plasterboardSheets2400 = Math.ceil((plasterboardAreaMM2 / 2_880_000) * 1.1); // 2400x1200 sheet = 2,880,000 mm²
  const plasterboardSheets1800 = Math.ceil((plasterboardAreaMM2 / 1_620_000) * 1.1); // 1800x900 sheet = 1,620,000 mm²

  // ── Skirting Board Runs ──
  let skirtingMM = 0;
  for (const wall of walls) {
    const len = wallLength(wall);
    // Skirting on inside of external walls (1 side) and both sides of internal walls (2 sides)
    let sides = wall.wallType === 'external' ? 1 : 2;
    if (wall.plasterboardSides === 'none') {
      sides = 0;
    } else if (wall.plasterboardSides === 'one') {
      sides = 1;
    }

    const wallDoors = openings.filter((o) => o.wallId === wall.id && o.type === 'door');
    const doorSubtract = wallDoors.reduce((sum, d) => sum + d.width, 0);

    skirtingMM += Math.max(0, (len - doorSubtract) * sides);
  }

  const skirtingMeters = skirtingMM / 1000;
  const skirtingBoardsCount = Math.ceil(skirtingMM / 4200); // 4.2m standard boards

  // ── Architrave Trims ──
  let architraveMM = 0;
  for (const op of openings) {
    if (op.type === 'door') {
      const wall = walls.find((w) => w.id === op.wallId);
      if (wall) {
        let sides = wall.wallType === 'external' ? 1 : 2;
        if (wall.plasterboardSides === 'none') sides = 0;
        else if (wall.plasterboardSides === 'one') sides = 1;

        const runPerSide = 2 * op.height + op.width;
        architraveMM += runPerSide * sides;
      }
    }
  }

  const architraveMeters = architraveMM / 1000;
  const architraveBoardsCount = Math.ceil(architraveMM / 2400); // 2.4m single length boards

  // ── Stud Wall Insulation Area ──
  let insulationAreaMM2 = 0;
  for (const wall of walls) {
    if (wall.hasFraming) {
      const len = wallLength(wall);
      const wallArea = len * CEILING_HEIGHT;
      const wallOpenings = openings.filter((o) => o.wallId === wall.id);
      const openingArea = wallOpenings.reduce((sum, o) => sum + o.width * o.height, 0);
      insulationAreaMM2 += wallArea - openingArea;
    }
  }
  const insulationArea = insulationAreaMM2 / 1_000_000;

  return {
    totalFloorArea: floorArea,
    totalWallSurfaceArea: Math.max(0, totalWallSurfaceArea),
    totalBasePerimeter,
    wallCount: walls.length,
    openingCount: openings.length,
    fixtureCount: fixtures.length,
    timberTakeoff,
    plasterboardArea,
    plasterboardSheets2400,
    plasterboardSheets1800,
    skirtingMeters,
    skirtingBoardsCount,
    architraveMeters,
    architraveBoardsCount,
    insulationArea,
    isFloorAreaOpen,
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
 * Robust graph cycle-finder that filters out dangling nodes recursively
 * and calculates Shoelace areas of closed rooms.
 */
function computeFloorArea(plan: RoomPlan): { area: number; isOpen: boolean } {
  const { walls } = plan;
  if (walls.length < 3) return { area: 0, isOpen: true };

  // 1. Snap endpoints within 25mm to consolidate unique vertices
  const snapTolerance = 25; // mm
  const vertices: { x: number; y: number }[] = [];

  const getVertexId = (p: { x: number; y: number }) => {
    for (let i = 0; i < vertices.length; i++) {
      const v = vertices[i];
      if (Math.hypot(v.x - p.x, v.y - p.y) < snapTolerance) {
        return i;
      }
    }
    vertices.push({ x: p.x, y: p.y });
    return vertices.length - 1;
  };

  interface GraphEdge {
    id: string;
    v1: number;
    v2: number;
  }

  let edges: GraphEdge[] = walls.map((w) => ({
    id: w.id,
    v1: getVertexId(w.p1),
    v2: getVertexId(w.p2),
  }));

  // Remove zero-length/self-loop edges
  edges = edges.filter((e) => e.v1 !== e.v2);

  // 2. Recursively prune dangling edges (nodes with degree < 2)
  let changed = true;
  while (changed) {
    changed = false;
    const degree = new Array(vertices.length).fill(0);
    for (const e of edges) {
      degree[e.v1]++;
      degree[e.v2]++;
    }

    const prevCount = edges.length;
    edges = edges.filter((e) => degree[e.v1] >= 2 && degree[e.v2] >= 2);
    if (edges.length < prevCount) {
      changed = true;
    }
  }

  if (edges.length < 3) {
    return { area: 0, isOpen: true };
  }

  // 3. Build adjacency lists of directed edges
  interface AdjItem {
    to: number;
    angle: number;
    edgeId: string;
  }
  const adj: AdjItem[][] = Array.from({ length: vertices.length }, () => []);
  for (const e of edges) {
    const p1 = vertices[e.v1];
    const p2 = vertices[e.v2];
    
    // Invert y-coordinates to work in standard Cartesian space where counter-clockwise angles are positive
    const angle12 = Math.atan2(-(p2.y - p1.y), p2.x - p1.x);
    const angle21 = Math.atan2(-(p1.y - p2.y), p1.x - p2.x);

    adj[e.v1].push({ to: e.v2, angle: angle12, edgeId: e.id });
    adj[e.v2].push({ to: e.v1, angle: angle21, edgeId: e.id });
  }

  // Trace simple faces (rooms) using the Leftmost Turn rule
  const visitedHalfEdges = new Set<string>();
  const getHalfEdgeKey = (from: number, to: number) => `${from}->${to}`;

  let totalAreaMM2 = 0;
  let hasValidCycles = false;

  for (let startV = 0; startV < vertices.length; startV++) {
    for (const startEdge of adj[startV]) {
      const startKey = getHalfEdgeKey(startV, startEdge.to);
      if (visitedHalfEdges.has(startKey)) continue;

      const path: number[] = [startV];
      let currentV = startEdge.to;
      let prevV = startV;
      visitedHalfEdges.add(startKey);

      let closed = false;
      const maxSteps = edges.length * 2;

      for (let step = 0; step < maxSteps; step++) {
        path.push(currentV);
        if (currentV === startV) {
          closed = true;
          break;
        }

        const currentAdj = adj[currentV];
        const pPrev = vertices[prevV];
        const pCurr = vertices[currentV];
        // Incoming vector from prevV to currentV
        const incomingAngle = Math.atan2(-(pPrev.y - pCurr.y), pPrev.x - pCurr.x);

        let bestNext: AdjItem | null = null;
        let maxDiff = -Infinity;

        // Choose the outgoing edge that represents the leftmost (most counter-clockwise) turn
        for (const cand of currentAdj) {
          if (cand.to === prevV) continue; // Skip U-turns back along the incoming edge

          let diff = cand.angle - incomingAngle;
          while (diff <= -Math.PI) diff += 2 * Math.PI;
          while (diff > Math.PI) diff -= 2 * Math.PI;

          if (diff > maxDiff) {
            maxDiff = diff;
            bestNext = cand;
          }
        }

        if (!bestNext) {
          break; // Dead end (should be impossible in a pruned graph with degree >= 2)
        }

        const nextKey = getHalfEdgeKey(currentV, bestNext.to);
        if (visitedHalfEdges.has(nextKey)) {
          break; // Face boundary already visited
        }

        visitedHalfEdges.add(nextKey);
        prevV = currentV;
        currentV = bestNext.to;
      }

      if (closed && path.length >= 4) {
        // Calculate signed Shoelace area in standard Cartesian (y inverted)
        let area = 0;
        const n = path.length - 1;
        for (let i = 0; i < n; i++) {
          const pCurrent = vertices[path[i]];
          const pNext = vertices[path[i + 1]];
          area += pCurrent.x * (-pNext.y);
          area -= pNext.x * (-pCurrent.y);
        }
        area = area / 2;

        // In Cartesian coordinates, leftmost turn traversal traces inner rooms counter-clockwise (positive area).
        // The outer infinite boundary has clockwise traversal (negative area).
        if (area > 0) {
          totalAreaMM2 += area;
          hasValidCycles = true;
        }
      }
    }
  }

  const areaM2 = totalAreaMM2 / 1_000_000;
  return { area: areaM2, isOpen: !hasValidCycles || areaM2 === 0 };
}
