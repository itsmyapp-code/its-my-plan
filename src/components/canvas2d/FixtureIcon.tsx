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
          {/* Tank flush button detail */}
          <rect x={-w * 0.06} y={-d * 0.36} width={w * 0.12} height={4} rx={1} fill={color} opacity={0.7} />
          {/* Bowl */}
          <ellipse cx={0} cy={d * 0.08} rx={w * 0.32} ry={d * 0.28}
            fill="none" stroke={color} strokeWidth={0.8} opacity={0.8} />
          {/* Seat inner oval hole */}
          <ellipse cx={0} cy={d * 0.06} rx={w * 0.22} ry={d * 0.18}
            fill="none" stroke={color} strokeWidth={0.4} opacity={0.5} />
          {/* Seat lid outer edge */}
          <ellipse cx={0} cy={d * 0.05} rx={w * 0.26} ry={d * 0.2}
            fill={color} fillOpacity={0.15} stroke={color} strokeWidth={0.5} />
        </g>
      );

    case 'basin': {
      const isDouble = def.id.includes('double-vanity');
      if (isDouble) {
        return (
          <g>
            {/* Vanity top */}
            <rect x={-w / 2 + 1} y={-d / 2 + 1} width={w - 2} height={d - 2} rx={2} fill="none" stroke={color} strokeWidth={0.8} />
            {/* Left sink */}
            <g transform={`translate(${-w * 0.24}, 0)`}>
              <ellipse cx={0} cy={0} rx={w * 0.15} ry={d * 0.3} fill="none" stroke={color} strokeWidth={0.6} opacity={0.7} />
              <circle cx={0} cy={-d * 0.18} r={1.5} fill={color} opacity={0.6} />
            </g>
            {/* Right sink */}
            <g transform={`translate(${w * 0.24}, 0)`}>
              <ellipse cx={0} cy={0} rx={w * 0.15} ry={d * 0.3} fill="none" stroke={color} strokeWidth={0.6} opacity={0.7} />
              <circle cx={0} cy={-d * 0.18} r={1.5} fill={color} opacity={0.6} />
            </g>
          </g>
        );
      }
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
    }

    case 'bath': {
      const isFreestanding = def.id.includes('freestanding');
      if (isFreestanding) {
        return (
          <g>
            {/* Outer Roll-top Rim */}
            <ellipse cx={0} cy={0} rx={w * 0.47} ry={d * 0.45} fill="none" stroke={color} strokeWidth={0.85} opacity={0.9} />
            {/* Inner tub basin */}
            <ellipse cx={0} cy={0} rx={w * 0.4} ry={d * 0.36} fill={color} fillOpacity={0.1} stroke={color} strokeWidth={0.5} />
            {/* Free-standing floor taps */}
            <circle cx={0} cy={-d * 0.4} r={2} fill="none" stroke={color} strokeWidth={0.6} />
            <line x1={0} y1={-d * 0.4} x2={0} y2={-d * 0.3} stroke={color} strokeWidth={0.5} />
          </g>
        );
      }
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
    }

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
          {w > 1000 ? (
            <>
              {/* Double / King Bed Pillows */}
              <rect x={-w * 0.35} y={-d * 0.42} width={w * 0.25} height={d * 0.12} rx={2}
                fill={color} fillOpacity={0.2} stroke={color} strokeWidth={0.4} />
              <rect x={w * 0.1} y={-d * 0.42} width={w * 0.25} height={d * 0.12} rx={2}
                fill={color} fillOpacity={0.2} stroke={color} strokeWidth={0.4} />
            </>
          ) : (
            /* Single Bed Pillow */
            <rect x={-w * 0.25} y={-d * 0.42} width={w * 0.5} height={d * 0.12} rx={2}
              fill={color} fillOpacity={0.2} stroke={color} strokeWidth={0.4} />
          )}
          {/* Blanket folded line */}
          <line x1={-w / 2 + 2} y1={-d * 0.1} x2={w / 2 - 2} y2={-d * 0.1} stroke={color} strokeWidth={0.5} strokeDasharray="3 3" />
        </g>
      );

    case 'wardrobe':
      return (
        <g>
          <rect x={-w / 2 + 1} y={-d / 2 + 1} width={w - 2} height={d - 2} rx={1}
            fill="none" stroke={color} strokeWidth={0.8} opacity={0.8} />
          <line x1={0} y1={-d / 2 + 1} x2={0} y2={d / 2 - 1} stroke={color} strokeWidth={0.4} opacity={0.5} />
          {/* Clothes hangers outline details (visualizing clothes hangers inside) */}
          <path d={`M ${-w * 0.25} ${-d * 0.2} L 0 0 L ${w * 0.25} ${-d * 0.2}`} fill="none" stroke={color} strokeWidth={0.4} opacity={0.3} />
          <path d={`M ${-w * 0.25} ${d * 0.2} L 0 0 L ${w * 0.25} ${d * 0.2}`} fill="none" stroke={color} strokeWidth={0.4} opacity={0.3} />
        </g>
      );

    case 'table':
      return (
        <g>
          <rect
            x={-w / 2 + 1}
            y={-d / 2 + 1}
            width={w - 2}
            height={d - 2}
            rx={Math.min(6, w * 0.05)}
            fill="none"
            stroke={color}
            strokeWidth={0.85}
            opacity={0.9}
          />
          {/* Inner support frame / leg guidelines */}
          <rect x={-w / 2 + 6} y={-d / 2 + 6} width={w - 12} height={d - 12} rx={2}
            fill="none" stroke={color} strokeWidth={0.4} strokeDasharray="2,2" opacity={0.6} />
        </g>
      );

    case 'chair': {
      const isAdult = def.id.includes('adult');
      const isArmchair = def.id.includes('armchair');
      const isSofa3 = def.id.includes('sofa-3s');
      const isSofa2 = def.id.includes('sofa-2s');

      if (isAdult) {
        // Human silhouette from top view
        return (
          <g>
            {/* Shoulders */}
            <path
              d={`M ${-w * 0.45} ${d * 0.15} C ${-w * 0.45} ${-d * 0.25}, ${w * 0.45} ${-d * 0.25}, ${w * 0.45} ${d * 0.15} C ${w * 0.3} ${d * 0.35}, ${-w * 0.3} ${d * 0.35}, ${-w * 0.45} ${d * 0.15} Z`}
              fill={color}
              fillOpacity={0.25}
              stroke={color}
              strokeWidth={0.8}
            />
            {/* Head */}
            <circle cx={0} cy={-d * 0.05} r={w * 0.18} fill="none" stroke={color} strokeWidth={0.8} />
            {/* Nose indicator */}
            <path d={`M 0 ${-d * 0.23} L ${w * 0.04} ${-d * 0.28} L ${-w * 0.04} ${-d * 0.28} Z`} fill={color} />
          </g>
        );
      }

      if (isSofa3) {
        return (
          <g>
            {/* Main body */}
            <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={4} fill="none" stroke={color} strokeWidth={0.8} opacity={0.85} />
            {/* Backrest */}
            <rect x={-w / 2} y={-d / 2} width={w} height={d * 0.22} rx={1} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={0.5} />
            {/* Armrests */}
            <rect x={-w / 2} y={-d / 2} width={w * 0.08} height={d} rx={1} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={0.5} />
            <rect x={w / 2 - w * 0.08} y={-d / 2} width={w * 0.08} height={d} rx={1} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={0.5} />
            {/* 3 Cushions splitting lines */}
            <line x1={-w / 6} y1={-d / 2 + d * 0.22} x2={-w / 6} y2={d / 2} stroke={color} strokeWidth={0.5} />
            <line x1={w / 6} y1={-d / 2 + d * 0.22} x2={w / 6} y2={d / 2} stroke={color} strokeWidth={0.5} />
          </g>
        );
      }

      if (isSofa2) {
        return (
          <g>
            {/* Main body */}
            <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={4} fill="none" stroke={color} strokeWidth={0.8} opacity={0.85} />
            {/* Backrest */}
            <rect x={-w / 2} y={-d / 2} width={w} height={d * 0.22} rx={1} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={0.5} />
            {/* Armrests */}
            <rect x={-w / 2} y={-d / 2} width={w * 0.08} height={d} rx={1} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={0.5} />
            <rect x={w / 2 - w * 0.08} y={-d / 2} width={w * 0.08} height={d} rx={1} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={0.5} />
            {/* 2 Cushions splitting lines */}
            <line x1={0} y1={-d / 2 + d * 0.22} x2={0} y2={d / 2} stroke={color} strokeWidth={0.5} />
          </g>
        );
      }

      if (isArmchair) {
        return (
          <g>
            {/* Main body */}
            <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={6} fill="none" stroke={color} strokeWidth={0.8} opacity={0.85} />
            {/* Backrest */}
            <rect x={-w / 2} y={-d / 2} width={w} height={d * 0.25} rx={1} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={0.5} />
            {/* Armrests */}
            <rect x={-w / 2} y={-d / 2} width={w * 0.14} height={d} rx={1} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={0.5} />
            <rect x={w / 2 - w * 0.14} y={-d / 2} width={w * 0.14} height={d} rx={1} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={0.5} />
          </g>
        );
      }

      // Standard Chair
      return (
        <g>
          {/* Chair Seat cushion */}
          <rect x={-w * 0.36} y={-d * 0.26} width={w * 0.72} height={d * 0.62} rx={4}
            fill="none" stroke={color} strokeWidth={0.8} opacity={0.85} />
          {/* Curved Backrest */}
          <path d={`M ${-w * 0.36} ${-d * 0.34} L ${w * 0.36} ${-d * 0.34} A 4 4 0 0 1 ${w * 0.36} ${-d * 0.14} L ${-w * 0.36} ${-d * 0.14} Z`}
            fill={color} fillOpacity={0.15} stroke={color} strokeWidth={0.8} />
          {/* Armrests */}
          <line x1={-w * 0.44} y1={-d * 0.1} x2={-w * 0.44} y2={d * 0.3} stroke={color} strokeWidth={0.7} />
          <line x1={w * 0.44} y1={-d * 0.1} x2={w * 0.44} y2={d * 0.3} stroke={color} strokeWidth={0.7} />
          <path d={`M ${-w * 0.44} ${-d * 0.1} Q ${-w * 0.4} ${-d * 0.15} ${-w * 0.36} ${-d * 0.1}`} fill="none" stroke={color} strokeWidth={0.7} />
          <path d={`M ${w * 0.44} ${-d * 0.1} Q ${w * 0.4} ${-d * 0.15} ${w * 0.36} ${-d * 0.1}`} fill="none" stroke={color} strokeWidth={0.7} />
        </g>
      );
    }

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
        </g>
      );

    case 'kitchen': {
      const isIsland = def.id.includes('island');
      const isCorner = def.id.includes('corner-base');
      const isCooker = def.id.includes('cooker');
      const isWallCab = def.id.includes('wall-cabinet');

      if (isIsland) {
        return (
          <g>
            {/* Island Countertop */}
            <rect x={-w / 2 + 1} y={-d / 2 + 1} width={w - 2} height={d - 2} rx={2} fill="none" stroke={color} strokeWidth={0.85} />
            {/* Bevel detail */}
            <rect x={-w / 2 + 5} y={-d / 2 + 5} width={w - 10} height={d - 10} fill="none" stroke={color} strokeWidth={0.4} opacity={0.4} />
            {/* Seating overhang dashed line on one long side */}
            <line x1={-w / 2 + 5} y1={d / 2 - d * 0.25} x2={w / 2 - 5} y2={d / 2 - d * 0.25} stroke={color} strokeWidth={0.5} strokeDasharray="3,3" opacity={0.7} />
          </g>
        );
      }

      if (isCorner) {
        return (
          <g>
            {/* Corner cabinet block */}
            <rect x={-w / 2 + 1} y={-d / 2 + 1} width={w - 2} height={d - 2} fill="none" stroke={color} strokeWidth={0.8} />
            {/* Front counter outline */}
            <line x1={-w / 2 + 1} y1={-d / 2 + 60} x2={w / 2 - 1} y2={-d / 2 + 60} stroke={color} strokeWidth={0.5} strokeDasharray="1,1" opacity={0.5} />
            <path d={`M ${-w / 2 + 1} ${d / 2 - 1} L ${w / 2 - 1} ${-d / 2 + 1}`} stroke={color} strokeWidth={0.4} strokeDasharray="3,3" opacity={0.5} />
          </g>
        );
      }

      if (isCooker) {
        return (
          <g>
            {/* Cooker body */}
            <rect x={-w / 2 + 1} y={-d / 2 + 1} width={w - 2} height={d - 2} rx={2} fill="none" stroke={color} strokeWidth={0.9} />
            {/* 4 Hob burners */}
            <circle cx={-w * 0.22} cy={-d * 0.22} r={w * 0.12} fill="none" stroke={color} strokeWidth={0.6} />
            <circle cx={w * 0.22} cy={-d * 0.22} r={w * 0.15} fill="none" stroke={color} strokeWidth={0.6} />
            <circle cx={-w * 0.22} cy={d * 0.22} r={w * 0.15} fill="none" stroke={color} strokeWidth={0.6} />
            <circle cx={w * 0.22} cy={d * 0.22} r={w * 0.12} fill="none" stroke={color} strokeWidth={0.6} />
            {/* Control bar */}
            <rect x={-w * 0.4} y={-d * 0.46} width={w * 0.8} height={d * 0.08} rx={1} fill={color} fillOpacity={0.2} />
          </g>
        );
      }

      if (isWallCab) {
        return (
          <g>
            {/* Wall cabinet - thinner stroke/dashed indicating wall-mounted overhead */}
            <rect x={-w / 2 + 1} y={-d / 2 + 1} width={w - 2} height={d - 2} fill="none" stroke={color} strokeWidth={0.6} strokeDasharray="4,2" opacity={0.7} />
            <line x1={-w / 2 + 1} y1={-d / 2 + 1} x2={w / 2 - 1} y2={d / 2 - 1} stroke={color} strokeWidth={0.4} strokeDasharray="1,2" opacity={0.4} />
            <line x1={-w / 2 + 1} y1={d / 2 - 1} x2={w / 2 - 1} y2={-d / 2 + 1} stroke={color} strokeWidth={0.4} strokeDasharray="1,2" opacity={0.4} />
          </g>
        );
      }

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
    }

    case 'radiator':
      return (
        <g>
          {/* Main radiator panel body */}
          <rect x={-w / 2 + 1} y={-d / 2 + 1} width={w - 2} height={d - 2} rx={1} fill="none" stroke={color} strokeWidth={0.8} />
          {/* Ridges / fins */}
          <line x1={-w * 0.4} y1={-d / 2 + 2} x2={-w * 0.4} y2={d / 2 - 2} stroke={color} strokeWidth={0.5} />
          <line x1={-w * 0.3} y1={-d / 2 + 2} x2={-w * 0.3} y2={d / 2 - 2} stroke={color} strokeWidth={0.5} />
          <line x1={-w * 0.2} y1={-d / 2 + 2} x2={-w * 0.2} y2={d / 2 - 2} stroke={color} strokeWidth={0.5} />
          <line x1={-w * 0.1} y1={-d / 2 + 2} x2={-w * 0.1} y2={d / 2 - 2} stroke={color} strokeWidth={0.5} />
          <line x1={0} y1={-d / 2 + 2} x2={0} y2={d / 2 - 2} stroke={color} strokeWidth={0.5} />
          <line x1={w * 0.1} y1={-d / 2 + 2} x2={w * 0.1} y2={d / 2 - 2} stroke={color} strokeWidth={0.5} />
          <line x1={w * 0.2} y1={-d / 2 + 2} x2={w * 0.2} y2={d / 2 - 2} stroke={color} strokeWidth={0.5} />
          <line x1={w * 0.3} y1={-d / 2 + 2} x2={w * 0.3} y2={d / 2 - 2} stroke={color} strokeWidth={0.5} />
          <line x1={w * 0.4} y1={-d / 2 + 2} x2={w * 0.4} y2={d / 2 - 2} stroke={color} strokeWidth={0.5} />
        </g>
      );

    case 'tv': {
      const isWall = def.id.includes('wall');
      return (
        <g>
          {/* TV Screen */}
          <rect x={-w / 2} y={-d * 0.15} width={w} height={d * 0.3} rx={1} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={0.8} />
          {/* TV Stand (if on stand) */}
          {!isWall && (
            <>
              {/* Stand neck */}
              <line x1={0} y1={0} x2={0} y2={d * 0.3} stroke={color} strokeWidth={1} />
              {/* Stand base */}
              <ellipse cx={0} cy={d * 0.3} rx={w * 0.15} ry={d * 0.1} fill="none" stroke={color} strokeWidth={0.8} />
            </>
          )}
        </g>
      );
    }

    case 'appliance': {
      const isDryer = def.id.includes('dryer');
      return (
        <g>
          {/* Outer body */}
          <rect x={-w / 2 + 1} y={-d / 2 + 1} width={w - 2} height={d - 2} rx={2} fill="none" stroke={color} strokeWidth={0.8} />
          {/* Control panel bar */}
          <line x1={-w / 2 + 1} y1={-d * 0.3} x2={w / 2 - 1} y2={-d * 0.3} stroke={color} strokeWidth={0.6} />
          {/* Dial detail */}
          <circle cx={-w * 0.25} cy={-d * 0.4} r={2} fill="none" stroke={color} strokeWidth={0.5} />
          {/* Front round door/window */}
          <circle cx={0} cy={d * 0.1} r={w * 0.25} fill="none" stroke={color} strokeWidth={0.7} />
          {/* Inner circle (or dryer lines) */}
          {isDryer ? (
            <line x1={-w * 0.12} y1={d * 0.1} x2={w * 0.12} y2={d * 0.1} stroke={color} strokeWidth={0.6} />
          ) : (
            <circle cx={0} cy={d * 0.1} r={w * 0.15} fill="none" stroke={color} strokeWidth={0.4} strokeDasharray="2,1" />
          )}
        </g>
      );
    }

    default:
      return null;
  }
}
