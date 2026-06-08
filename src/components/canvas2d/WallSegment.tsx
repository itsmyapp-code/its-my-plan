'use client';

import { useCallback, useMemo } from 'react';
import type { Wall, Point } from '@/types';
import { SCALE_2D } from '@/constants';
import { wallCorners, wallLength, wallMidpoint, wallAngleDeg, formatMM, wallDirection, getWallHeights } from '@/utils/geometry';
import { CEILING_HEIGHT } from '@/constants';
import { usePlanStore } from '@/store/usePlanStore';
import { useToolStore } from '@/store/useToolStore';
import { useUIStore } from '@/store/useUIStore';
import { DimensionLabel } from './DimensionLabel';
import { getWallFramingLayout } from '@/utils/framing';

interface WallSegmentProps {
  wall: Wall;
  onDragStart: (id: string, e: React.PointerEvent<SVGElement>) => void;
}

export function WallSegment({ wall, onDragStart }: WallSegmentProps) {
  const selection = usePlanStore((s) => s.selection);
  const select = usePlanStore((s) => s.select);
  const activeTool = useToolStore((s) => s.activeTool);
  const showDimensions = useUIStore((s) => s.viewSettings.showDimensions);
  const showFraming = useUIStore((s) => s.viewSettings.showFraming);

  const isSelected = selection.type === 'wall' && selection.id === wall.id;
  const openings = usePlanStore((s) => s.plan.openings);
  const isParentOfSelectedOpening = selection.type === 'opening' && 
    openings.find(o => o.id === selection.id)?.wallId === wall.id;

  const showEndpoints = isSelected || isParentOfSelectedOpening;
  const corners = wallCorners(wall);
  const len = wallLength(wall);
  const mid = wallMidpoint(wall);
  const angle = wallAngleDeg(wall);
  const wDir = useMemo(() => wallDirection(wall), [wall]);
  const { h1, h2 } = getWallHeights(wall, CEILING_HEIGHT);
  const isSloped = h1 !== h2;

  const framing = useMemo(() => {
    if (!showFraming || !wall.hasFraming) return null;
    return getWallFramingLayout(wall, openings, CEILING_HEIGHT);
  }, [showFraming, wall, openings]);

  // Find all openings on this wall and sort them from P1 to P2
  const wallOpenings = useMemo(() => {
    return openings
      .filter((o) => o.wallId === wall.id)
      .sort((a, b) => a.distanceFromP1 - b.distanceFromP1);
  }, [openings, wall.id]);

  // Compute the dimension chains
  const dimensionChains = useMemo(() => {
    const chains: { length: number; midpoint: Point; isOpening: boolean; type?: string }[] = [];
    if (wallOpenings.length === 0) return chains;

    let currentDist = 0;
    const wDir = wallDirection(wall);

    for (const op of wallOpenings) {
      const opStart = op.distanceFromP1 - op.width / 2;
      const opEnd = op.distanceFromP1 + op.width / 2;

      // 1. Wall segment before the opening
      if (opStart > currentDist) {
        const segLen = opStart - currentDist;
        const segMidDist = currentDist + segLen / 2;
        chains.push({
          length: segLen,
          isOpening: false,
          midpoint: {
            x: wall.p1.x + wDir.x * segMidDist,
            y: wall.p1.y + wDir.y * segMidDist,
          },
        });
      }

      // 2. The opening itself
      chains.push({
        length: op.width,
        isOpening: true,
        type: op.type,
        midpoint: {
          x: wall.p1.x + wDir.x * op.distanceFromP1,
          y: wall.p1.y + wDir.y * op.distanceFromP1,
        },
      });

      currentDist = opEnd;
    }

    // 3. Wall segment after the last opening
    if (currentDist < len) {
      const segLen = len - currentDist;
      const segMidDist = currentDist + segLen / 2;
      chains.push({
        length: segLen,
        isOpening: false,
        midpoint: {
          x: wall.p1.x + wDir.x * segMidDist,
          y: wall.p1.y + wDir.y * segMidDist,
        },
      });
    }

    return chains;
  }, [wallOpenings, wall.p1, len, wall.id]);

  // Convert mm corners to SVG px
  const points = corners
    .map((c) => `${c.x * SCALE_2D},${c.y * SCALE_2D}`)
    .join(' ');

  const handleClick = useCallback(
    (e: React.MouseEvent | React.PointerEvent) => {
      if (activeTool !== 'select') return;
      e.stopPropagation();
      select('wall', wall.id);
    },
    [activeTool, select, wall.id]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGElement>) => {
      if (activeTool !== 'select') return;
      e.stopPropagation();
      select('wall', wall.id);
      onDragStart(wall.id, e);
    },
    [activeTool, select, wall.id, onDragStart]
  );

  // Endpoint dots
  const ep1 = { x: wall.p1.x * SCALE_2D, y: wall.p1.y * SCALE_2D };
  const ep2 = { x: wall.p2.x * SCALE_2D, y: wall.p2.y * SCALE_2D };

  return (
    <g>
      {/* Wall polygon with thickness */}
      <polygon
        points={points}
        fill={
          isSelected
            ? 'var(--canvas-wall-selected)'
            : wall.color
            ? wall.color
            : wall.wallType === 'external'
            ? 'var(--canvas-wall-fill-external)'
            : 'var(--canvas-wall-fill)'
        }
        fillOpacity={isSelected ? 0.6 : 0.8}
        stroke={isSelected ? 'var(--canvas-wall-selected)' : 'var(--canvas-wall-stroke)'}
        strokeWidth={isSelected ? 1.5 : 0.5}
        className="transition-colors duration-150"
        style={{ cursor: activeTool === 'select' ? 'pointer' : undefined }}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
      />

      {/* Wall framing studs */}
      {framing && framing.studs.map((stud) => {
        const cx = (wall.p1.x + wDir.x * stud.distanceFromP1) * SCALE_2D;
        const cy = (wall.p1.y + wDir.y * stud.distanceFromP1) * SCALE_2D;
        const rectW = framing.timberThickness * SCALE_2D;
        const rectH = Math.min(wall.thickness, framing.timberWidth) * SCALE_2D;

        return (
          <rect
            key={stud.id}
            x={cx - rectW / 2}
            y={cy - rectH / 2}
            width={rectW}
            height={rectH}
            fill={stud.type.startsWith('cripple') ? '#bcaaa4' : '#d7ccc8'}
            stroke="#8d6e63"
            strokeWidth={0.4}
            transform={`rotate(${angle}, ${cx}, ${cy})`}
            opacity={stud.type.startsWith('cripple') ? 0.7 : 0.95}
            className="pointer-events-none"
          />
        );
      })}

      {/* Center line (thin) */}
      <line
        x1={wall.p1.x * SCALE_2D}
        y1={wall.p1.y * SCALE_2D}
        x2={wall.p2.x * SCALE_2D}
        y2={wall.p2.y * SCALE_2D}
        stroke={isSelected ? 'var(--canvas-wall-selected)' : 'var(--canvas-wall-stroke)'}
        strokeWidth={0.3}
        strokeDasharray="2 2"
        className="pointer-events-none"
        opacity={0.4}
      />

      {/* Endpoint dots */}
      <circle cx={ep1.x} cy={ep1.y} r={2.5} fill="var(--canvas-wall-stroke)" className="pointer-events-none" />
      <circle cx={ep2.x} cy={ep2.y} r={2.5} fill="var(--canvas-wall-stroke)" className="pointer-events-none" />

      {/* Selection highlight dots with P1/P2 labels */}
      {showEndpoints && (
        <>
          {/* P1 indicator (emerald green) */}
          <circle cx={ep1.x} cy={ep1.y} r={5} fill="#10b981" opacity={0.9} className="pointer-events-none" />
          <text
            x={ep1.x}
            y={ep1.y - 7}
            textAnchor="middle"
            fill="#34d399"
            fontSize={8}
            fontFamily="var(--font-sans)"
            fontWeight="bold"
            className="pointer-events-none select-none"
          >
            P1
          </text>

          {/* P2 indicator (blue) */}
          <circle cx={ep2.x} cy={ep2.y} r={4.5} fill="#3b82f6" opacity={0.9} className="pointer-events-none" />
          <text
            x={ep2.x}
            y={ep2.y - 7}
            textAnchor="middle"
            fill="#60a5fa"
            fontSize={8}
            fontFamily="var(--font-sans)"
            fontWeight="bold"
            className="pointer-events-none select-none"
          >
            P2
          </text>
        </>
      )}

      {/* Sloped wall height indicators at P1 / P2 */}
      {(isSloped || isSelected) && (
        <>
          <text
            x={ep1.x}
            y={ep1.y + 14}
            textAnchor="middle"
            fill={isSloped ? '#fb923c' : 'var(--canvas-dimension-text)'}
            fontSize={7}
            fontFamily="var(--font-sans)"
            fontWeight={600}
            className="pointer-events-none select-none"
          >
            ↑ {formatMM(h1)}
          </text>
          <text
            x={ep2.x}
            y={ep2.y + 14}
            textAnchor="middle"
            fill={isSloped ? '#fb923c' : 'var(--canvas-dimension-text)'}
            fontSize={7}
            fontFamily="var(--font-sans)"
            fontWeight={600}
            className="pointer-events-none select-none"
          >
            ↑ {formatMM(h2)}
          </text>
          {isSloped && (
            <line
              x1={ep1.x}
              y1={ep1.y + 4}
              x2={ep2.x}
              y2={ep2.y + 4}
              stroke="#fb923c"
              strokeWidth={0.6}
              strokeDasharray="3 2"
              className="pointer-events-none"
              opacity={0.7}
            />
          )}
        </>
      )}

      {/* Dimension chain labels (if there are openings) */}
      {showDimensions && (
        dimensionChains.length > 0 ? (
          <>
            {/* Outer Overall Wall Length (offset further out) */}
            <DimensionLabel
              midpoint={{ x: mid.x * SCALE_2D, y: mid.y * SCALE_2D }}
              angle={angle}
              length={len}
              offsetDistance={26}
            />
            {/* Inner Chained Dimensions */}
            {dimensionChains.map((chain, i) => (
              <DimensionLabel
                key={i}
                midpoint={{ x: chain.midpoint.x * SCALE_2D, y: chain.midpoint.y * SCALE_2D }}
                angle={angle}
                length={chain.length}
                offsetDistance={12}
              />
            ))}
          </>
        ) : (
          /* Single Wall Dimension Label */
          <DimensionLabel
            midpoint={{ x: mid.x * SCALE_2D, y: mid.y * SCALE_2D }}
            angle={angle}
            length={len}
            offsetDistance={12}
          />
        )
      )}
    </g>
  );
}
