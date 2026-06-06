'use client';

import { SCALE_2D } from '@/constants';
import { usePlanStore } from '@/store/usePlanStore';
import { useToolStore } from '@/store/useToolStore';
import { useUIStore } from '@/store/useUIStore';
import { getFixtureDefinition } from '@/data/fixtures';
import { FixtureIcon } from './FixtureIcon';

interface FixtureLayerProps {
  onDragStart: (id: string, e: React.PointerEvent<SVGElement>) => void;
}

export function FixtureLayer({ onDragStart }: FixtureLayerProps) {
  const fixtures = usePlanStore((s) => s.plan.fixtures);
  const selection = usePlanStore((s) => s.selection);
  const select = usePlanStore((s) => s.select);
  const activeTool = useToolStore((s) => s.activeTool);
  const showClearanceZones = useUIStore((s) => s.viewSettings.showClearanceZones);
  const showElectricalLayer = useUIStore((s) => s.viewSettings.showElectricalLayer);
  const showPlumbingLayer = useUIStore((s) => s.viewSettings.showPlumbingLayer);

  return (
    <g>
      {fixtures.map((fixture) => {
        const def = getFixtureDefinition(fixture.type);
        if (!def) return null;

        if (def.category === 'electrical' && !showElectricalLayer) return null;
        if (def.category === 'plumbing' && !showPlumbingLayer) return null;

        const isSelected = selection.type === 'fixture' && selection.id === fixture.id;
        const cx = fixture.x * SCALE_2D;
        const cy = fixture.y * SCALE_2D;
        const widthMm = fixture.width ?? def.width;
        const depthMm = fixture.depth ?? def.depth;
        const w = widthMm * SCALE_2D;
        const d = depthMm * SCALE_2D;

        // Global visibility is controlled by the eye toggle; selected fixture still shows its envelope for editing.
        const shouldShowClearance = showClearanceZones || isSelected;
        const isServiceSymbol = def.category === 'electrical' || def.category === 'plumbing';
        const isQuadrant = def.id.includes('quadrant');

        const handleClick = (e: React.MouseEvent) => {
          if (activeTool !== 'select') return;
          e.stopPropagation();
          select('fixture', fixture.id);
        };

        const handlePointerDown = (e: React.PointerEvent<SVGElement>) => {
          if (activeTool !== 'select') return;
          e.stopPropagation();
          onDragStart(fixture.id, e);
        };

        const frontClearance = def.clearance.front * SCALE_2D;
        const sideClearance = def.clearance.sides * SCALE_2D;

        return (
          <g
            key={fixture.id}
            transform={`translate(${cx}, ${cy}) rotate(${fixture.rotation})`}
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            style={{ cursor: activeTool === 'select' ? 'pointer' : undefined }}
          >
            {/* Clearance zone */}
            {shouldShowClearance && !isServiceSymbol && (
              <rect
                x={-w / 2 - sideClearance}
                y={-d / 2}
                width={w + 2 * sideClearance}
                height={d + frontClearance}
                fill="#f43f5e"
                fillOpacity={0.12}
                stroke="#e11d48"
                strokeWidth={1.1}
                strokeDasharray="5,3"
                className="pointer-events-none"
              />
            )}

            {/* Fixture body */}
            {!isServiceSymbol && !isQuadrant && (
              <rect
                x={-w / 2}
                y={-d / 2}
                width={w}
                height={d}
                rx={2}
                fill={def.color}
                fillOpacity={isSelected ? 0.5 : 0.3}
                stroke={isSelected ? 'var(--canvas-wall-selected)' : def.color}
                strokeWidth={isSelected ? 1.5 : 0.8}
                className="transition-colors duration-150"
              />
            )}

            {!isServiceSymbol && isQuadrant && (
              <path
                d={`M ${-w / 2} ${-d / 2} L ${w / 2} ${-d / 2} A ${w} ${d} 0 0 1 ${-w / 2} ${d / 2} Z`}
                fill={def.color}
                fillOpacity={isSelected ? 0.45 : 0.3}
                stroke={isSelected ? 'var(--canvas-wall-selected)' : def.color}
                strokeWidth={isSelected ? 1.5 : 0.8}
                className="transition-colors duration-150"
              />
            )}

            {isServiceSymbol && (
              <circle
                cx={0}
                cy={0}
                r={Math.max(w, d) * 0.45}
                fill={isSelected ? `${def.color}1a` : 'transparent'}
                stroke={isSelected ? 'var(--canvas-wall-selected)' : `${def.color}66`}
                strokeWidth={isSelected ? 1.2 : 0.6}
              />
            )}

            {/* Architectural fixture symbol */}
            <FixtureIcon def={def} width={w} depth={d} color={def.color} />

            {/* Front edge indicator (clearance direction) */}
            {!isServiceSymbol && (
              <line
                x1={-w / 2}
                y1={d / 2}
                x2={w / 2}
                y2={d / 2}
                stroke={def.color}
                strokeWidth={1.2}
                opacity={0.6}
                className="pointer-events-none"
              />
            )}

            {/* Label */}
            <text
              x={0}
              y={d / 2 + 8}
              textAnchor="middle"
              fill="var(--canvas-dimension-text)"
              fontSize={6}
              fontFamily="var(--font-sans)"
              fontWeight={500}
              className="pointer-events-none"
            >
              {def.label}
            </text>

            {/* Selection resize handles */}
            {isSelected && (
              <>
                <rect x={-w / 2 - 2} y={-d / 2 - 2} width={4} height={4} fill="var(--canvas-wall-selected)" rx={1} />
                <rect x={w / 2 - 2} y={-d / 2 - 2} width={4} height={4} fill="var(--canvas-wall-selected)" rx={1} />
                <rect x={-w / 2 - 2} y={d / 2 - 2} width={4} height={4} fill="var(--canvas-wall-selected)" rx={1} />
                <rect x={w / 2 - 2} y={d / 2 - 2} width={4} height={4} fill="var(--canvas-wall-selected)" rx={1} />
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}
