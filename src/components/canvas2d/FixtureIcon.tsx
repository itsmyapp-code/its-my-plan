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
  const isQuadrant = def.id.includes('quadrant');

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
          {isQuadrant ? (
            <path
              d={`M ${-w / 2 + 1} ${-d / 2 + 1} L ${w / 2 - 1} ${-d / 2 + 1} A ${w - 2} ${d - 2} 0 0 1 ${-w / 2 + 1} ${d / 2 - 1} Z`}
              fill="none"
              stroke={color}
              strokeWidth={0.8}
              opacity={0.8}
            />
          ) : (
            <rect x={-w / 2 + 1} y={-d / 2 + 1} width={w - 2} height={d - 2} rx={2}
              fill="none" stroke={color} strokeWidth={0.8} opacity={0.8} />
          )}
          {/* Shower head */}
          <circle cx={-w * 0.2} cy={-d * 0.2} r={3} fill="none" stroke={color} strokeWidth={0.6} />
          <line x1={-w * 0.2} y1={-d * 0.2} x2={-w * 0.2} y2={-d * 0.02} stroke={color} strokeWidth={0.5} />
          {/* Drain */}
          <circle cx={isQuadrant ? w * 0.15 : 0} cy={isQuadrant ? d * 0.15 : d * 0.25} r={1.5} fill={color} opacity={0.5} />
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

    case 'table':
      return (
        <g>
          <rect
            x={-w / 2 + 2}
            y={-d / 2 + 2}
            width={w - 4}
            height={d - 4}
            rx={Math.min(6, w * 0.06)}
            fill="none"
            stroke={color}
            strokeWidth={0.8}
            opacity={0.85}
          />
          <line x1={-w / 2 + 8} y1={0} x2={w / 2 - 8} y2={0} stroke={color} strokeWidth={0.45} opacity={0.45} />
          <line x1={0} y1={-d / 2 + 8} x2={0} y2={d / 2 - 8} stroke={color} strokeWidth={0.45} opacity={0.45} />
        </g>
      );

    case 'chair':
      return (
        <g>
          <rect x={-w * 0.28} y={-d * 0.1} width={w * 0.56} height={d * 0.46} rx={2}
            fill="none" stroke={color} strokeWidth={0.8} opacity={0.85} />
          <rect x={-w * 0.32} y={-d * 0.4} width={w * 0.64} height={d * 0.22} rx={2}
            fill="none" stroke={color} strokeWidth={0.8} opacity={0.85} />
        </g>
      );

    case 'electric':
      return (
        <g>
          <circle cx={0} cy={0} r={Math.min(w, d) * 0.34} fill="none" stroke={color} strokeWidth={0.9} opacity={0.95} />
          {def.id.includes('double') && (
            <>
              <circle cx={-w * 0.14} cy={0} r={Math.min(w, d) * 0.08} fill={color} opacity={0.85} />
              <circle cx={w * 0.14} cy={0} r={Math.min(w, d) * 0.08} fill={color} opacity={0.85} />
            </>
          )}
          {def.id.includes('single') && (
            <circle cx={0} cy={0} r={Math.min(w, d) * 0.08} fill={color} opacity={0.85} />
          )}
          {def.id.includes('switch') && (
            <line x1={-w * 0.16} y1={0} x2={w * 0.16} y2={0} stroke={color} strokeWidth={1.2} />
          )}
          {def.id.includes('ceiling-light') && (
            <>
              <line x1={-w * 0.22} y1={-d * 0.22} x2={w * 0.22} y2={d * 0.22} stroke={color} strokeWidth={0.7} />
              <line x1={w * 0.22} y1={-d * 0.22} x2={-w * 0.22} y2={d * 0.22} stroke={color} strokeWidth={0.7} />
            </>
          )}
          {def.id.includes('extractor') && (
            <>
              <circle cx={0} cy={0} r={Math.min(w, d) * 0.2} fill="none" stroke={color} strokeWidth={0.7} />
              <path d={`M 0 ${-d * 0.2} L ${w * 0.06} ${-d * 0.06} L ${-w * 0.06} ${-d * 0.06} Z`} fill={color} opacity={0.8} />
            </>
          )}
        </g>
      );

    case 'plumbing':
      return (
        <g>
          <circle cx={0} cy={0} r={Math.min(w, d) * 0.33} fill="none" stroke={color} strokeWidth={0.9} opacity={0.95} />
          <path
            d={`M ${-w * 0.12} ${-d * 0.02} C ${-w * 0.07} ${-d * 0.2}, ${w * 0.07} ${-d * 0.2}, ${w * 0.12} ${-d * 0.02} C ${w * 0.08} ${d * 0.14}, ${-w * 0.08} ${d * 0.14}, ${-w * 0.12} ${-d * 0.02} Z`}
            fill={color}
            fillOpacity={0.35}
            stroke={color}
            strokeWidth={0.5}
          />
          {def.id.includes('hot') && <text x={0} y={d * 0.44} textAnchor="middle" fontSize={Math.max(4, Math.min(w, d) * 0.12)} fill={color}>H</text>}
          {def.id.includes('cold') && <text x={0} y={d * 0.44} textAnchor="middle" fontSize={Math.max(4, Math.min(w, d) * 0.12)} fill={color}>C</text>}
          {def.id.includes('waste') && <text x={0} y={d * 0.44} textAnchor="middle" fontSize={Math.max(4, Math.min(w, d) * 0.12)} fill={color}>W</text>}
          {def.id.includes('soil-stack') && (
            <line x1={0} y1={-d * 0.26} x2={0} y2={d * 0.26} stroke={color} strokeWidth={1.1} />
          )}
          {def.id.includes('radiator') && (
            <>
              <line x1={-w * 0.3} y1={-d * 0.15} x2={-w * 0.3} y2={d * 0.15} stroke={color} strokeWidth={0.6} />
              <line x1={-w * 0.15} y1={-d * 0.15} x2={-w * 0.15} y2={d * 0.15} stroke={color} strokeWidth={0.6} />
              <line x1={0} y1={-d * 0.15} x2={0} y2={d * 0.15} stroke={color} strokeWidth={0.6} />
              <line x1={w * 0.15} y1={-d * 0.15} x2={w * 0.15} y2={d * 0.15} stroke={color} strokeWidth={0.6} />
              <line x1={w * 0.3} y1={-d * 0.15} x2={w * 0.3} y2={d * 0.15} stroke={color} strokeWidth={0.6} />
            </>
          )}
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
