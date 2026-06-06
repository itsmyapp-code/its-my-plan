'use client';

import { usePlanStore } from '@/store/usePlanStore';
import { WallSegment } from './WallSegment';

interface WallLayerProps {
  onWallDragStart: (id: string, e: React.PointerEvent<SVGElement>) => void;
}

export function WallLayer({ onWallDragStart }: WallLayerProps) {
  const walls = usePlanStore((s) => s.plan.walls);

  return (
    <g>
      {walls.map((wall) => (
        <WallSegment key={wall.id} wall={wall} onDragStart={onWallDragStart} />
      ))}
    </g>
  );
}
