'use client';

import { SCALE_2D } from '@/constants';
import { usePlanStore } from '@/store/usePlanStore';
import { useToolStore } from '@/store/useToolStore';
import { wallDirection, wallNormal } from '@/utils/geometry';
import { positionOnWall, getOpeningLabel } from '@/utils/openingHelpers';

interface OpeningOverlayProps {
  onDragStart: (id: string, e: React.PointerEvent<SVGElement>) => void;
}

export function OpeningOverlay({ onDragStart }: OpeningOverlayProps) {
  const openings = usePlanStore((s) => s.plan.openings);
  const walls = usePlanStore((s) => s.plan.walls);
  const selection = usePlanStore((s) => s.selection);
  const select = usePlanStore((s) => s.select);
  const activeTool = useToolStore((s) => s.activeTool);

  return (
    <g>
      {openings.map((opening) => {
        const wall = walls.find((w) => w.id === opening.wallId);
        if (!wall) return null;

        const { point } = positionOnWall(wall, opening.distanceFromP1);
        const isSelected = selection.type === 'opening' && selection.id === opening.id;
        const dir = wallDirection(wall);
        const normal = wallNormal(wall);
        const halfWidth = opening.width / 2;
        const flipMult = opening.flipDirection ? -1 : 1;
        const hingeSide = opening.hingeSide ?? 'p1';

        const gapStart = {
          x: (point.x - dir.x * halfWidth) * SCALE_2D,
          y: (point.y - dir.y * halfWidth) * SCALE_2D,
        };
        const gapEnd = {
          x: (point.x + dir.x * halfWidth) * SCALE_2D,
          y: (point.y + dir.y * halfWidth) * SCALE_2D,
        };

        const pivotX = hingeSide === 'p1' ? gapStart.x : gapEnd.x;
        const pivotY = hingeSide === 'p1' ? gapStart.y : gapEnd.y;

        const handleClick = (e: React.MouseEvent | React.PointerEvent) => {
          if (activeTool !== 'select') return;
          e.stopPropagation();
          select('opening', opening.id);
        };

        const handleDragStart = (e: React.PointerEvent<SVGElement>) => {
          if (activeTool !== 'select') return;
          e.stopPropagation();
          select('opening', opening.id);
          onDragStart(opening.id, e);
        };

        if (opening.type === 'door') {
          const arcRadius = opening.width * SCALE_2D;
          const arcEndX = pivotX + normal.x * arcRadius * flipMult;
          const arcEndY = pivotY + normal.y * arcRadius * flipMult;
          const hitStroke = Math.max(wall.thickness * SCALE_2D + 12, 18);

          return (
            <g key={opening.id} onClick={handleClick} onPointerDown={handleDragStart}>
              {/* Large transparent hit line so doors are easy to pick/select */}
              <line
                x1={gapStart.x}
                y1={gapStart.y}
                x2={gapEnd.x}
                y2={gapEnd.y}
                stroke="transparent"
                strokeWidth={hitStroke}
                style={{ cursor: activeTool === 'select' ? 'grab' : undefined }}
              />

              <line
                x1={gapStart.x}
                y1={gapStart.y}
                x2={gapEnd.x}
                y2={gapEnd.y}
                stroke="var(--canvas-bg)"
                strokeWidth={wall.thickness * SCALE_2D + 2}
              />

              <path
                d={`M ${pivotX} ${pivotY} A ${arcRadius} ${arcRadius} 0 0 ${opening.flipDirection ? 0 : 1} ${arcEndX} ${arcEndY}`}
                fill="none"
                stroke={isSelected ? 'var(--canvas-wall-selected)' : 'var(--brand-blue)'}
                strokeWidth={0.8}
                strokeDasharray="3 2"
                opacity={0.7}
                style={{ cursor: activeTool === 'select' ? 'grab' : undefined }}
              />

              <line
                x1={pivotX}
                y1={pivotY}
                x2={arcEndX}
                y2={arcEndY}
                stroke={isSelected ? 'var(--canvas-wall-selected)' : 'var(--brand-blue)'}
                strokeWidth={0.6}
                opacity={0.5}
              />

              <circle
                cx={pivotX}
                cy={pivotY}
                r={2.5}
                fill={isSelected ? 'var(--canvas-wall-selected)' : 'var(--brand-blue)'}
                style={{ cursor: activeTool === 'select' ? 'grab' : undefined }}
              />

              {/* Unique ID tag */}
              <g className="pointer-events-none select-none">
                <circle
                  cx={(gapStart.x + gapEnd.x) / 2}
                  cy={(gapStart.y + gapEnd.y) / 2}
                  r={5}
                  fill="var(--canvas-bg)"
                  stroke={isSelected ? 'var(--canvas-wall-selected)' : 'var(--brand-blue)'}
                  strokeWidth={0.5}
                />
                <text
                  x={(gapStart.x + gapEnd.x) / 2}
                  y={(gapStart.y + gapEnd.y) / 2 + 1.5}
                  textAnchor="middle"
                  fill={isSelected ? 'var(--canvas-wall-selected)' : 'var(--brand-blue)'}
                  fontSize={4.5}
                  fontWeight="bold"
                >
                  {getOpeningLabel(opening, openings)}
                </text>
              </g>

              {isSelected && (
                <text
                  x={(gapStart.x + gapEnd.x) / 2}
                  y={(gapStart.y + gapEnd.y) / 2 - 8}
                  textAnchor="middle"
                  fill="var(--canvas-dimension-text)"
                  fontSize={5}
                  className="pointer-events-none"
                >
                  Drag to reposition
                </text>
              )}
            </g>
          );
        }

        // Window
        const wallThickPx = wall.thickness * SCALE_2D;
        const n = { x: normal.x * (wallThickPx / 2) * 0.7, y: normal.y * (wallThickPx / 2) * 0.7 };
        const hitStroke = Math.max(wallThickPx + 12, 18);

        return (
          <g key={opening.id} onClick={handleClick} onPointerDown={handleDragStart}>
            {/* Large transparent hit line so windows are easy to pick/select */}
            <line
              x1={gapStart.x}
              y1={gapStart.y}
              x2={gapEnd.x}
              y2={gapEnd.y}
              stroke="transparent"
              strokeWidth={hitStroke}
              style={{ cursor: activeTool === 'select' ? 'grab' : undefined }}
            />

            <line
              x1={gapStart.x}
              y1={gapStart.y}
              x2={gapEnd.x}
              y2={gapEnd.y}
              stroke="var(--canvas-bg)"
              strokeWidth={wallThickPx + 2}
            />

            <line
              x1={gapStart.x + n.x}
              y1={gapStart.y + n.y}
              x2={gapEnd.x + n.x}
              y2={gapEnd.y + n.y}
              stroke={isSelected ? 'var(--canvas-wall-selected)' : 'var(--brand-orange)'}
              strokeWidth={1}
              style={{ cursor: activeTool === 'select' ? 'grab' : undefined }}
            />
            <line
              x1={gapStart.x - n.x}
              y1={gapStart.y - n.y}
              x2={gapEnd.x - n.x}
              y2={gapEnd.y - n.y}
              stroke={isSelected ? 'var(--canvas-wall-selected)' : 'var(--brand-orange)'}
              strokeWidth={1}
            />

            <line
              x1={gapStart.x + n.x}
              y1={gapStart.y + n.y}
              x2={gapEnd.x - n.x}
              y2={gapEnd.y - n.y}
              stroke={isSelected ? 'var(--canvas-wall-selected)' : 'var(--brand-orange)'}
              strokeWidth={0.5}
              opacity={0.5}
            />
            <line
              x1={gapStart.x - n.x}
              y1={gapStart.y - n.y}
              x2={gapEnd.x + n.x}
              y2={gapEnd.y + n.y}
              stroke={isSelected ? 'var(--canvas-wall-selected)' : 'var(--brand-orange)'}
              strokeWidth={0.5}
              opacity={0.5}
            />

            {/* Unique ID tag */}
            <g className="pointer-events-none select-none">
              <circle
                cx={(gapStart.x + gapEnd.x) / 2}
                cy={(gapStart.y + gapEnd.y) / 2}
                r={5}
                fill="var(--canvas-bg)"
                stroke={isSelected ? 'var(--canvas-wall-selected)' : 'var(--brand-orange)'}
                strokeWidth={0.5}
              />
              <text
                x={(gapStart.x + gapEnd.x) / 2}
                y={(gapStart.y + gapEnd.y) / 2 + 1.5}
                textAnchor="middle"
                fill={isSelected ? 'var(--canvas-wall-selected)' : 'var(--brand-orange)'}
                fontSize={4.5}
                fontWeight="bold"
              >
                {getOpeningLabel(opening, openings)}
              </text>
            </g>

            {isSelected && (
              <rect
                x={Math.min(gapStart.x, gapEnd.x) - Math.abs(n.x) - 2}
                y={Math.min(gapStart.y, gapEnd.y) - Math.abs(n.y) - 2}
                width={Math.abs(gapEnd.x - gapStart.x) + Math.abs(n.x) * 2 + 4}
                height={Math.abs(gapEnd.y - gapStart.y) + Math.abs(n.y) * 2 + 4}
                fill="none"
                stroke="var(--canvas-wall-selected)"
                strokeWidth={0.5}
                strokeDasharray="2 2"
                opacity={0.5}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
