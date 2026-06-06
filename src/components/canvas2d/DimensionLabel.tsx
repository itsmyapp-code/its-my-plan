'use client';

import { formatMM } from '@/utils/geometry';

interface DimensionLabelProps {
  midpoint: { x: number; y: number }; // Already in SVG px
  angle: number; // degrees
  length: number; // mm (raw value to format)
  offsetDistance?: number; // px
}

export function DimensionLabel({ midpoint, angle, length, offsetDistance = 12 }: DimensionLabelProps) {
  // Offset the label perpendicular to the wall
  const angleRad = (angle * Math.PI) / 180;
  const perpX = -Math.sin(angleRad) * offsetDistance;
  const perpY = Math.cos(angleRad) * offsetDistance;

  // Ensure text is always readable (not upside down)
  let textAngle = angle;
  if (textAngle > 90 || textAngle < -90) {
    textAngle += 180;
  }

  return (
    <g className="pointer-events-none">
      {/* Background pill */}
      <rect
        x={midpoint.x + perpX - 28}
        y={midpoint.y + perpY - 7}
        width={56}
        height={14}
        rx={4}
        fill="rgba(15, 23, 42, 0.85)"
        stroke="rgba(71, 85, 105, 0.3)"
        strokeWidth={0.5}
        transform={`rotate(${textAngle}, ${midpoint.x + perpX}, ${midpoint.y + perpY})`}
      />
      {/* Dimension text */}
      <text
        x={midpoint.x + perpX}
        y={midpoint.y + perpY + 3.5}
        textAnchor="middle"
        fill="var(--canvas-dimension-text)"
        fontSize={8}
        fontFamily="var(--font-sans)"
        fontWeight={500}
        transform={`rotate(${textAngle}, ${midpoint.x + perpX}, ${midpoint.y + perpY})`}
      >
        {formatMM(length)}
      </text>
    </g>
  );
}
