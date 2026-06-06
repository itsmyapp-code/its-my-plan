'use client';

import { SCALE_2D } from '@/constants';
import { distance, formatMM } from '@/utils/geometry';
import type { Point } from '@/types';

interface DrawingCursorProps {
  start: Point; // mm
  end: Point;   // mm
}

export function DrawingCursor({ start, end }: DrawingCursorProps) {
  const sx = start.x * SCALE_2D;
  const sy = start.y * SCALE_2D;
  const ex = end.x * SCALE_2D;
  const ey = end.y * SCALE_2D;
  const len = distance(start, end);

  // Midpoint for the length label
  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;
  const angle = Math.atan2(ey - sy, ex - sx) * (180 / Math.PI);

  // Ensure text readability
  let textAngle = angle;
  if (textAngle > 90 || textAngle < -90) {
    textAngle += 180;
  }

  const offsetDistance = 14;
  const angleRad = (angle * Math.PI) / 180;
  const perpX = -Math.sin(angleRad) * offsetDistance;
  const perpY = Math.cos(angleRad) * offsetDistance;

  return (
    <g className="pointer-events-none">
      {/* Preview line */}
      <line
        x1={sx}
        y1={sy}
        x2={ex}
        y2={ey}
        stroke="var(--canvas-draw-preview)"
        strokeWidth={2}
        strokeDasharray="6 3"
      />

      {/* Start point dot */}
      <circle cx={sx} cy={sy} r={3} fill="var(--brand-blue)" opacity={0.9} />

      {/* End point dot */}
      <circle cx={ex} cy={ey} r={3} fill="var(--brand-blue)" opacity={0.9}>
        <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
      </circle>

      {/* Live dimension readout */}
      {len > 50 && (
        <>
          <rect
            x={mx + perpX - 30}
            y={my + perpY - 8}
            width={60}
            height={16}
            rx={4}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="var(--brand-blue)"
            strokeWidth={0.5}
            transform={`rotate(${textAngle}, ${mx + perpX}, ${my + perpY})`}
          />
          <text
            x={mx + perpX}
            y={my + perpY + 4}
            textAnchor="middle"
            fill="var(--brand-blue-light)"
            fontSize={9}
            fontFamily="var(--font-sans)"
            fontWeight={600}
            transform={`rotate(${textAngle}, ${mx + perpX}, ${my + perpY})`}
          >
            {formatMM(len)}
          </text>
        </>
      )}
    </g>
  );
}
