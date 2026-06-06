'use client';

import { Canvas } from '@react-three/fiber';
import { Scene3D } from './Scene3D';

interface Canvas3DProps {
  id?: string;
}

export function Canvas3D({ id = 'canvas-3d' }: Canvas3DProps) {
  return (
    <div className="w-full h-full" id={id}>
      <Canvas
        camera={{ position: [5, 6, 5], fov: 50, near: 0.1, far: 200 }}
        shadows
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        style={{ background: '#e2e8f0' }}
      >
        <Scene3D />
      </Canvas>
    </div>
  );
}
