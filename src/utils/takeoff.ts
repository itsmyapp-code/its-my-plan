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

  const snap = (val: number) => Math.round(val / 10) * 10;
  const getVertexKey = (p: { x: number; y: number }) => `${snap(p.x)},${snap(p.y)}`;

  interface GraphEdge {
    id: string;
    p1Key: string;
    p2Key: string;
    p1: { x: number; y: number };
    p2: { x: number; y: number };
  }

  let edges: GraphEdge[] = walls.map((w) => ({
    id: w.id,
    p1Key: getVertexKey(w.p1),
    p2Key: getVertexKey(w.p2),
    p1: w.p1,
    p2: w.p2,
  }));

  // Recursively prune dangling wall edges (endpoints of degree 1)
  let changed = true;
  while (changed) {
    changed = false;
    const degree: { [key: string]: number } = {};
    for (const e of edges) {
      degree[e.p1Key] = (degree[e.p1Key] || 0) + 1;
      degree[e.p2Key] = (degree[e.p2Key] || 0) + 1;
    }

    const prevCount = edges.length;
    edges = edges.filter((e) => degree[e.p1Key] >= 2 && degree[e.p2Key] >= 2);
    if (edges.length < prevCount) {
      changed = true;
    }
  }

  if (edges.length < 3) {
    return { area: 0, isOpen: true };
  }

  // Build adjacency list for remaining edges
  interface AdjItem {
    nextKey: string;
    edgeId: string;
    p1: { x: number; y: number };
    p2: { x: number; y: number };
  }
  const adj: { [key: string]: AdjItem[] } = {};
  for (const e of edges) {
    if (!adj[e.p1Key]) adj[e.p1Key] = [];
    if (!adj[e.p2Key]) adj[e.p2Key] = [];
    adj[e.p1Key].push({ nextKey: e.p2Key, edgeId: e.id, p1: e.p1, p2: e.p2 });
    adj[e.p2Key].push({ nextKey: e.p1Key, edgeId: e.id, p1: e.p2, p2: e.p1 });
  }

  const visitedEdges = new Set<string>();
  let totalAreaMM2 = 0;

  const keys = Object.keys(adj);
  for (const startKey of keys) {
    for (const startEdge of adj[startKey]) {
      if (visitedEdges.has(startEdge.edgeId)) continue;

      const pathKeys: string[] = [startKey];
      const pathPoints: { x: number; y: number }[] = [startEdge.p1];
      const pathEdges: string[] = [startEdge.edgeId];
      
      let currentKey = startEdge.nextKey;
      let prevEdgeId = startEdge.edgeId;
      pathPoints.push(startEdge.p2);

      let closed = false;
      const pathKeySet = new Set<string>([startKey]);

      while (!closed) {
        if (pathKeySet.has(currentKey)) {
          const cycleStartIndex = pathKeys.indexOf(currentKey);
          const cyclePoints = pathPoints.slice(cycleStartIndex);
          
          let area = 0;
          const n = cyclePoints.length;
          for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            area += cyclePoints[i].x * cyclePoints[j].y;
            area -= cyclePoints[j].x * cyclePoints[i].y;
          }
          totalAreaMM2 += Math.abs(area) / 2;

          for (let i = cycleStartIndex; i < pathEdges.length; i++) {
            visitedEdges.add(pathEdges[i]);
          }
          closed = true;
          break;
        }

        pathKeys.push(currentKey);
        pathKeySet.add(currentKey);

        const nextEdges = adj[currentKey]?.filter(
          (cand) => cand.edgeId !== prevEdgeId && !visitedEdges.has(cand.edgeId)
        );

        if (!nextEdges || nextEdges.length === 0) {
          break;
        }

        const next = nextEdges[0];
        pathPoints.push(next.p2);
        pathEdges.push(next.edgeId);
        prevEdgeId = next.edgeId;
        currentKey = next.nextKey;
      }
    }
  }

  const areaM2 = totalAreaMM2 / 1_000_000;
  return { area: areaM2, isOpen: areaM2 === 0 };
}
