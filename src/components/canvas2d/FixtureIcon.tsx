'use client';

import type { FixtureDefinition } from '@/data/fixtures';

interface FixtureIconProps {
  def: FixtureDefinition;
  width: number;
  depth: number;
  color: string;
}

/** Architectural floor-plan symbols for fixtures */
export function FixtureIcon({ def, width, depth, color }: FixtureIconProps) {
  const w = width;
  const d = depth;

  switch (def.iconType) {
    case 'wc':
      return (
        <g>
          {/* Tank */}
          <rect x={-w * 0.22} y={-d * 0.42} width={w * 0.44} height={d * 0.22} rx={2}
            fill="none" stroke={color} strokeWidth={0.8} opacity={0.8} />
          {/* Bowl */}
          <ellipse cx={0} cy={d * 0.08} rx={w * 0.32} ry={d * 0.28}
            fill="none" stroke={color} strokeWidth={0.8} opacity={0.8} />
          {/* Seat */}
          <ellipse cx={0} cy={d * 0.05} rx={w * 0.26} ry={d * 0.2}
            fill={color} fillOpacity={0.15} stroke={color} strokeWidth={0.5} />
        </g>
      );

    case 'basin':
      return (
        <g>
          <ellipse cx={0} cy={0} rx={w * 0.38} ry={d * 0.38}
            fill="none" stroke={color} strokeWidth={0.8} opacity={0.8} />
          <ellipse cx={0} cy={0} rx={w * 0.22} ry={d * 0.22}
            fill={color} fillOpacity={0.12} />
          {/* Tap */}
          <circle cx={0} cy={-d * 0.22} r={1.5} fill={color} opacity={0.6} />
        </g>
      );

    case 'bath':
      return (
        <g>
          <rect x={-w / 2 + 2} y={-d / 2 + 2} width={w - 4} height={d - 4} rx={6}
            fill="none" stroke={color} strokeWidth={0.8} opacity={0.8} />
          <rect x={-w / 2 + 5} y={-d / 2 + 5} width={w - 10} height={d - 10} rx={4}
            fill={color} fillOpacity={0.1} />
          {/* Tap end */}
          <circle cx={-w * 0.35} cy={0} r={2} fill="none" stroke={color} strokeWidth={0.5} />
        </g>
      );

    case 'shower':
      return (
        <g>
          <rect x={-w / 2 + 1} y={-d / 2 + 1} width={w - 2} height={d - 2} rx={def.id.includes('quadrant') ? 8 : 2}
            fill="none" stroke={color} strokeWidth={0.8} opacity={0.8} />
          {/* Shower head */}
          <circle cx={0} cy={-d * 0.25} r={3} fill="none" stroke={color} strokeWidth={0.6} />
          <line x1={0} y1={-d * 0.25} x2={0} y2={-d * 0.05} stroke={color} strokeWidth={0.5} />
          {/* Drain */}
          <circle cx={0} cy={d * 0.25} r={1.5} fill={color} opacity={0.5} />
        </g>
      );

    case 'bed':
      return (
        <g>
          <rect x={-w / 2 + 2} y={-d / 2 + 2} width={w - 4} height={d - 4} rx={3}
            fill="none" stroke={color} strokeWidth={0.8} opacity={0.8} />
          {/* Pillows */}
          <rect x={-w * 0.35} y={-d * 0.42} width={w * 0.25} height={d * 0.12} rx={2}
            fill={color} fillOpacity={0.2} />
          <rect x={w * 0.1} y={-d * 0.42} width={w * 0.25} height={d * 0.12} rx={2}
            fill={color} fillOpacity={0.2} />
        </g>
      );

    case 'wardrobe':
      return (
        <g>
          <rect x={-w / 2 + 1} y={-d / 2 + 1} width={w - 2} height={d - 2} rx={1}
            fill="none" stroke={color} strokeWidth={0.8} opacity={0.8} />
          <line x1={0} y1={-d / 2 + 1} x2={0} y2={d / 2 - 1} stroke={color} strokeWidth={0.4} opacity={0.5} />
        </g>
      );

    case 'kitchen':
      return (
        <g>
          <rect x={-w / 2 + 1} y={-d / 2 + 1} width={w - 2} height={d - 2} rx={1}
            fill="none" stroke={color} strokeWidth={0.8} opacity={0.8} />
          {def.id.includes('sink') && (
            <>
              <ellipse cx={-w * 0.2} cy={0} rx={w * 0.12} ry={d * 0.15} fill="none" stroke={color} strokeWidth={0.5} />
              <ellipse cx={w * 0.2} cy={0} rx={w * 0.12} ry={d * 0.15} fill="none" stroke={color} strokeWidth={0.5} />
            </>
          )}
        </g>
      );

    default:
      return null;
  }
}
