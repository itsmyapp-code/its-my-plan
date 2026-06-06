'use client';

import { SCALE_2D, GRID_SNAP, GRID_MAJOR } from '@/constants';

interface GridLayerProps {
  width: number;  // px (viewport width / zoom)
  height: number; // px
  panX: number;   // px pan offset
  panY: number;   // px pan offset
}

export function GridLayer({ width, height, panX, panY }: GridLayerProps) {
  // Compute grid in px space (SCALE_2D converts mm→px)
  const minorStep = GRID_SNAP * SCALE_2D;  // 50mm * 0.1 = 5px
  const majorStep = GRID_MAJOR * SCALE_2D; // 500mm * 0.1 = 50px

  // Calculate the visible area bounds accounting for pan offset
  const startX = -panX;
  const startY = -panY;
  const endX = startX + width;
  const endY = startY + height;

  // Round to nearest grid line beyond the visible bounds
  const gridStartX = Math.floor(startX / majorStep) * majorStep - majorStep;
  const gridStartY = Math.floor(startY / majorStep) * majorStep - majorStep;
  const gridEndX = Math.ceil(endX / majorStep) * majorStep + majorStep;
  const gridEndY = Math.ceil(endY / majorStep) * majorStep + majorStep;

  const minorLines: React.ReactNode[] = [];
  const majorLines: React.ReactNode[] = [];

  // Vertical lines
  for (let x = gridStartX; x <= gridEndX; x += minorStep) {
    const isMajor = Math.abs(x % majorStep) < 0.01;
    const arr = isMajor ? majorLines : minorLines;
    arr.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={gridStartY}
        x2={x}
        y2={gridEndY}
        stroke={isMajor ? 'var(--canvas-grid-major)' : 'var(--canvas-grid-minor)'}
        strokeWidth={isMajor ? 0.5 : 0.25}
      />
    );
  }

  // Horizontal lines
  for (let y = gridStartY; y <= gridEndY; y += minorStep) {
    const isMajor = Math.abs(y % majorStep) < 0.01;
    const arr = isMajor ? majorLines : minorLines;
    arr.push(
      <line
        key={`h-${y}`}
        x1={gridStartX}
        y1={y}
        x2={gridEndX}
        y2={y}
        stroke={isMajor ? 'var(--canvas-grid-major)' : 'var(--canvas-grid-minor)'}
        strokeWidth={isMajor ? 0.5 : 0.25}
      />
    );
  }

  // Origin crosshair
  const originLines = (
    <>
      <line x1={-20} y1={0} x2={20} y2={0} stroke="var(--brand-blue)" strokeWidth={0.8} opacity={0.5} />
      <line x1={0} y1={-20} x2={0} y2={20} stroke="var(--brand-blue)" strokeWidth={0.8} opacity={0.5} />
    </>
  );

  return (
    <g className="pointer-events-none">
      {minorLines}
      {majorLines}
      {originLines}
    </g>
  );
}
