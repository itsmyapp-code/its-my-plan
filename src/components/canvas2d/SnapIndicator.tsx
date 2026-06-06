'use client';

import { SCALE_2D } from '@/constants';
import type { Point } from '@/types';

interface SnapIndicatorProps {
  point: Point; // mm
  type: 'endpoint' | 'midpoint' | 'angle' | 'wall-line' | 'grid' | 'none';
}

const SNAP_COLORS: Record<string, string> = {
  endpoint: '#fbbf24',   // amber
  midpoint: '#34d399',   // emerald
  angle: '#a78bfa',      // violet
  'wall-line': '#60a5fa', // blue
  grid: '#64748b',        // slate
  none: 'transparent',
};

export function SnapIndicator({ point, type }: SnapIndicatorProps) {
  if (type === 'none' || type === 'grid') return null;

  const px = point.x * SCALE_2D;
  const py = point.y * SCALE_2D;
  const color = SNAP_COLORS[type] ?? SNAP_COLORS.grid;

  return (
    <g className="pointer-events-none">
      {/* Static dot */}
      <circle cx={px} cy={py} r={4} fill={color} opacity={0.9} />

      {/* Ping animation */}
      <circle cx={px} cy={py} r={4} fill="none" stroke={color} strokeWidth={1.5} opacity={0.7}>
        <animate attributeName="r" values="4;14" dur="0.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;0" dur="0.8s" repeatCount="indefinite" />
      </circle>

      {/* Crosshair for endpoint snap */}
      {type === 'endpoint' && (
        <>
          <line x1={px - 8} y1={py} x2={px + 8} y2={py} stroke={color} strokeWidth={0.8} opacity={0.6} />
          <line x1={px} y1={py - 8} x2={px} y2={py + 8} stroke={color} strokeWidth={0.8} opacity={0.6} />
        </>
      )}

      {/* Diamond for midpoint snap */}
      {type === 'midpoint' && (
        <polygon
          points={`${px},${py - 6} ${px + 6},${py} ${px},${py + 6} ${px - 6},${py}`}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.7}
        />
      )}
    </g>
  );
}
