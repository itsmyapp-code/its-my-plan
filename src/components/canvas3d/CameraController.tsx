'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { usePlanStore } from '@/store/usePlanStore';
import { wallsBoundingBox } from '@/utils/geometry';
import { SCALE_3D, CEILING_HEIGHT } from '@/constants';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface CameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

export function CameraController({ controlsRef }: CameraControllerProps) {
  const { camera } = useThree();
  const walls = usePlanStore((s) => s.plan.walls);
  const planId = usePlanStore((s) => s.plan.id);
  const lastFramedPlan = useRef<string | null>(null);

  useEffect(() => {
    if (walls.length === 0) {
      // Empty plan — centre on origin
      const target = new THREE.Vector3(0, CEILING_HEIGHT * SCALE_3D * 0.3, 0);
      camera.position.set(5, 6, 5);
      camera.lookAt(target);
      if (controlsRef.current) {
        controlsRef.current.target.copy(target);
        controlsRef.current.update();
      }
      return;
    }

    const bb = wallsBoundingBox(walls);
    const cx = bb.center.x * SCALE_3D;
    const cz = bb.center.y * SCALE_3D;
    const maxDim = Math.max(bb.width, bb.height) * SCALE_3D;
    const viewDist = Math.max(maxDim * 1.2, 4);
    const targetY = CEILING_HEIGHT * SCALE_3D * 0.35;
    const target = new THREE.Vector3(cx, targetY, cz);

    // Re-frame when switching plans or first time walls appear
    if (lastFramedPlan.current === planId) return;
    lastFramedPlan.current = planId;

    camera.position.set(
      cx + viewDist * 0.65,
      viewDist * 0.85,
      cz + viewDist * 0.65
    );
    camera.lookAt(target);

    if (controlsRef.current) {
      controlsRef.current.target.copy(target);
      controlsRef.current.update();
    }

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.updateProjectionMatrix();
    }
  }, [walls, camera, planId, controlsRef]);

  return null;
}
