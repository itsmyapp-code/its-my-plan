'use client';

import { useRef } from 'react';
import { OrbitControls, Environment } from '@react-three/drei';
import { usePlanStore } from '@/store/usePlanStore';
import { Wall3D } from './Wall3D';
import { Floor3D } from './Floor3D';
import { Fixture3D } from './Fixture3D';
import { CameraController } from './CameraController';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export function Scene3D() {
  const walls = usePlanStore((s) => s.plan.walls);
  const fixtures = usePlanStore((s) => s.plan.fixtures);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 15, 8]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-5, 8, -5]} intensity={0.3} />

      <Environment preset="city" background={false} />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={0.2}
        enableDamping
        dampingFactor={0.08}
        minDistance={1}
        maxDistance={40}
      />

      <CameraController controlsRef={controlsRef} />

      <Floor3D />

      {walls.map((wall) => (
        <Wall3D key={wall.id} wall={wall} />
      ))}

      {fixtures.map((fixture) => (
        <Fixture3D key={fixture.id} fixture={fixture} />
      ))}
    </>
  );
}
