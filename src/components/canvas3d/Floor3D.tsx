'use client';

import { useMemo } from 'react';
import { usePlanStore } from '@/store/usePlanStore';
import { wallsBoundingBox } from '@/utils/geometry';
import { SCALE_3D } from '@/constants';

export function Floor3D() {
  const walls = usePlanStore((s) => s.plan.walls);

  const { position, size } = useMemo(() => {
    if (walls.length === 0) {
      return {
        position: [0, -0.001, 0] as [number, number, number],
        size: [10, 10] as [number, number],
      };
    }

    const bb = wallsBoundingBox(walls);
    const padding = 2000; // 2m padding in mm
    const w = (bb.width + padding * 2) * SCALE_3D;
    const h = (bb.height + padding * 2) * SCALE_3D;
    const cx = bb.center.x * SCALE_3D;
    const cz = bb.center.y * SCALE_3D;

    return {
      position: [cx, -0.001, cz] as [number, number, number],
      size: [Math.max(w, 5), Math.max(h, 5)] as [number, number],
    };
  }, [walls]);

  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={size} />
      <meshStandardMaterial
        color="#1e293b"
        roughness={0.9}
        metalness={0}
      />
    </mesh>
  );
}
