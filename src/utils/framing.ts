import type { Wall, Opening, Point } from '@/types';
import { wallLength, wallDirection, wallAngle } from './geometry';

export interface StudInfo {
  id: string;
  distanceFromP1: number; // mm along wall from p1
  type: 'standard' | 'edge' | 'cripple-under' | 'cripple-over';
  height: number;         // mm
  yOffset: number;        // mm from floor
}

export interface PlateInfo {
  type: 'bottom' | 'top';
  yOffset: number;        // mm from floor
  thickness: number;      // mm (usually same as timber thickness)
}

export interface FramingLayout {
  timberThickness: number; // mm (e.g. 47)
  timberWidth: number;     // mm (e.g. 100, 150)
  grade: 'C16' | 'C24' | 'TR26';
  spacing: number;         // mm
  studs: StudInfo[];
  plates: PlateInfo[];
  headerLintels: {
    openingId: string;
    distanceFromP1: number;
    width: number;
    height: number; // thickness of lintel
    yOffset: number;
  }[];
  sillPlates: {
    openingId: string;
    distanceFromP1: number;
    width: number;
    thickness: number;
    yOffset: number;
  }[];
}

/**
 * Computes the detailed timber framing layout for a given wall, accounting for openings.
 */
export function getWallFramingLayout(
  wall: Wall,
  openings: Opening[],
  defaultCeilingHeight: number
): FramingLayout {
  const L = wallLength(wall);
  const wallOpenings = openings
    .filter((o) => o.wallId === wall.id)
    .sort((a, b) => a.distanceFromP1 - b.distanceFromP1);

  // Timber sizes
  let t = 47; // Default thickness
  let w = wall.wallType === 'external' ? 150 : 100; // Default width

  if (wall.timberSize) {
    if (wall.timberSize !== 'custom') {
      const parts = wall.timberSize.split('x').map(Number);
      if (parts.length === 2) {
        t = parts[0];
        w = parts[1];
      }
    } else {
      t = wall.customTimberThickness ?? 47;
      w = wall.customTimberWidth ?? 169;
    }
  }

  const grade = wall.timberGrade || 'C24';
  const spacing = wall.studSpacing || 400;

  const h1 = wall.heightP1 ?? wall.height ?? defaultCeilingHeight;
  const h2 = wall.heightP2 ?? wall.height ?? defaultCeilingHeight;

  // Helper to interpolate wall height at any distance along the wall
  const getHeightAt = (dist: number): number => {
    if (L <= 0) return h1;
    const ratio = Math.max(0, Math.min(1, dist / L));
    return h1 + (h2 - h1) * ratio;
  };

  const studs: StudInfo[] = [];
  const headerLintels: FramingLayout['headerLintels'] = [];
  const sillPlates: FramingLayout['sillPlates'] = [];

  // Plates: 1 bottom plate, 2 top plates (double top plate)
  const plates: PlateInfo[] = [
    { type: 'bottom', yOffset: 0, thickness: t },
    { type: 'top', yOffset: -1, thickness: t }, // Place dynamically at wall height minus plate thickness
  ];

  // Keep track of all potential stud centers
  const candidateCenters: { dist: number; type: StudInfo['type'] }[] = [];

  // 1. End studs
  candidateCenters.push({ dist: t / 2, type: 'edge' });
  candidateCenters.push({ dist: L - t / 2, type: 'edge' });

  // 2. Intermediate spacing studs
  for (let dist = spacing; dist < L; dist += spacing) {
    candidateCenters.push({ dist, type: 'standard' });
  }

  // 3. Opening edge studs (King and Jack studs combined as edge studs at opening margins)
  for (const op of wallOpenings) {
    const opStart = op.distanceFromP1 - op.width / 2;
    const opEnd = op.distanceFromP1 + op.width / 2;

    // Studs on the left and right of opening
    candidateCenters.push({ dist: Math.max(t / 2, opStart - t / 2), type: 'edge' });
    candidateCenters.push({ dist: Math.min(L - t / 2, opEnd + t / 2), type: 'edge' });

    // Also calculate lintels above openings
    const opTop = op.zOffset + op.height;
    const wallHeightAtCenter = getHeightAt(op.distanceFromP1);
    
    if (opTop < wallHeightAtCenter) {
      headerLintels.push({
        openingId: op.id,
        distanceFromP1: op.distanceFromP1,
        width: op.width + t * 2, // Lintel sits on top of jack studs
        height: t * 2, // Double timber thickness for structural strength
        yOffset: opTop,
      });
    }

    // Window sill plates
    if (op.type === 'window' && op.zOffset > 0) {
      sillPlates.push({
        openingId: op.id,
        distanceFromP1: op.distanceFromP1,
        width: op.width,
        thickness: t,
        yOffset: op.zOffset - t,
      });
    }
  }

  // Filter candidate centers to remove duplicates or items too close together
  // (e.g., if a standard stud is within 150mm of an edge stud, discard the standard one)
  const MIN_STUD_GAP = 150; // mm
  const sortedCandidates = [...candidateCenters].sort((a, b) => a.dist - b.dist);
  const activeCenters: typeof sortedCandidates = [];

  for (const cand of sortedCandidates) {
    // If it's standard, verify it's not too close to an already added edge stud
    if (cand.type === 'standard') {
      const tooClose = activeCenters.some(
        (active) => Math.abs(active.dist - cand.dist) < MIN_STUD_GAP
      );
      if (tooClose) continue;
    }
    // Also merge duplicates
    const duplicate = activeCenters.some((active) => Math.abs(active.dist - cand.dist) < 5);
    if (duplicate) continue;

    activeCenters.push(cand);
  }

  // Generate actual studs (standard full-height, or cripples above/below openings)
  let studCounter = 0;
  for (const center of activeCenters) {
    const d = center.dist;
    const wallH = getHeightAt(d);
    
    // Check if this center falls inside any opening
    let insideOpening: Opening | null = null;
    for (const op of wallOpenings) {
      const opStart = op.distanceFromP1 - op.width / 2;
      const opEnd = op.distanceFromP1 + op.width / 2;
      if (d >= opStart - 2 && d <= opEnd + 2) {
        insideOpening = op;
        break;
      }
    }

    if (!insideOpening) {
      // Standard full-height stud (starts from bottom plate, goes to double top plate)
      // Bottom plate is t thick. Double top plate is 2 * t thick.
      const bottomPlateThick = t;
      const topPlateThick = t * 2; // Assuming double top plate
      const studH = Math.max(100, wallH - bottomPlateThick - topPlateThick);
      
      studs.push({
        id: `stud-${wall.id}-${studCounter++}`,
        distanceFromP1: d,
        type: center.type,
        height: studH,
        yOffset: bottomPlateThick,
      });
    } else {
      // Center is within an opening span. Create cripples!
      const op = insideOpening;
      const opStart = op.distanceFromP1 - op.width / 2;
      const opEnd = op.distanceFromP1 + op.width / 2;

      // 1. Cripple below window
      if (op.type === 'window' && op.zOffset > 0) {
        // From bottom plate (t) to sill plate (op.zOffset - t)
        const crippleH = Math.max(0, op.zOffset - t - t);
        if (crippleH > 50) {
          studs.push({
            id: `stud-cripple-under-${wall.id}-${studCounter++}`,
            distanceFromP1: d,
            type: 'cripple-under',
            height: crippleH,
            yOffset: t,
          });
        }
      }

      // 2. Cripple above door/window header
      const opTop = op.zOffset + op.height;
      const lintelTop = opTop + t * 2; // Sitting on double header
      const topPlateThick = t * 2;
      const crippleH = Math.max(0, wallH - lintelTop - topPlateThick);
      if (crippleH > 50) {
        studs.push({
          id: `stud-cripple-over-${wall.id}-${studCounter++}`,
          distanceFromP1: d,
          type: 'cripple-over',
          height: crippleH,
          yOffset: lintelTop,
        });
      }
    }
  }

  return {
    timberThickness: t,
    timberWidth: w,
    grade,
    spacing,
    studs,
    plates,
    headerLintels,
    sillPlates,
  };
}
