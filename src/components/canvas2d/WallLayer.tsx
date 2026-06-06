'use client';

import { usePlanStore } from '@/store/usePlanStore';
import { WallSegment } from './WallSegment';

export function WallLayer() {
  const walls = usePlanStore((s) => s.plan.walls);

  return (
    <g>
      {walls.map((wall) => (
        <WallSegment key={wall.id} wall={wall} />
      ))}
    </g>
  );
}
