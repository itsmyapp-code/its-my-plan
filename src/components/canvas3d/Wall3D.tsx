'use client';

import { useMemo, useEffect } from 'react';
import type { Wall } from '@/types';
import { CEILING_HEIGHT, SCALE_3D } from '@/constants';
import { wallLength, wallAngle, wallDirection } from '@/utils/geometry';
import { buildWallSegmentSpecs, createSlopedWallGeometry } from '@/utils/wallGeometry3d';
import type { WallSegmentSpec } from '@/utils/wallGeometry3d';
import { getDoorOpenRotationY } from '@/utils/openingHelpers';
import { usePlanStore } from '@/store/usePlanStore';

interface SlopedSegmentMeshProps {
  wall: Wall;
  spec: WallSegmentSpec;
  angle: number;
  dir: ReturnType<typeof wallDirection>;
  color: string;
  isSelected: boolean;
  index: number;
}

function SlopedSegmentMesh({ wall, spec, angle, dir, color, isSelected, index }: SlopedSegmentMeshProps) {
  const geometry = useMemo(
    () => createSlopedWallGeometry(wall, spec, wall.thickness),
    [wall, spec, wall.thickness]
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  const segMidDist = (spec.distStart + spec.distEnd) / 2;
  const posX = (wall.p1.x + dir.x * segMidDist) * SCALE_3D;
  const posZ = (wall.p1.y + dir.y * segMidDist) * SCALE_3D;

  if (!geometry.attributes.position || geometry.attributes.position.count === 0) return null;

  return (
    <mesh
      key={index}
      position={[posX, 0, posZ]}
      rotation={[0, -angle, 0]}
      castShadow
      receiveShadow
      geometry={geometry}
    >
      <meshStandardMaterial
        color={color}
        roughness={0.7}
        metalness={0.05}
        transparent={isSelected}
        opacity={isSelected ? 0.85 : 1}
      />
    </mesh>
  );
}

interface Wall3DProps {
  wall: Wall;
}

export function Wall3D({ wall }: Wall3DProps) {
  const selection = usePlanStore((s) => s.selection);
  const select = usePlanStore((s) => s.select);
  const isSelected = selection.type === 'wall' && selection.id === wall.id;

  const allOpenings = usePlanStore((s) => s.plan.openings);
  const openings = useMemo(
    () => allOpenings.filter((o) => o.wallId === wall.id),
    [allOpenings, wall.id]
  );

  const totalLength = useMemo(() => wallLength(wall), [wall]);
  const angle = useMemo(() => wallAngle(wall), [wall]);
  const dir = useMemo(() => wallDirection(wall), [wall]);

  const segmentSpecs = useMemo(
    () => buildWallSegmentSpecs(wall, totalLength, openings),
    [wall, totalLength, openings]
  );

  const color = useMemo(() => {
    if (isSelected) return '#3b82f6';
    return wall.wallType === 'external' ? '#64748b' : '#94a3b8';
  }, [isSelected, wall.wallType]);

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        select('wall', wall.id);
      }}
    >
      {segmentSpecs.map((spec, i) => (
        <SlopedSegmentMesh
          key={i}
          index={i}
          wall={wall}
          spec={spec}
          angle={angle}
          dir={dir}
          color={color}
          isSelected={isSelected}
        />
      ))}

      {openings.map((op) => {
        const opWidth = op.width * SCALE_3D;
        const opHeight = op.height * SCALE_3D;
        const thickness = wall.thickness * SCALE_3D;

        const posX = (wall.p1.x + dir.x * op.distanceFromP1) * SCALE_3D;
        const posZ = (wall.p1.y + dir.y * op.distanceFromP1) * SCALE_3D;
        const posY = (op.zOffset + op.height / 2) * SCALE_3D;

        const isOpeningSelected = selection.type === 'opening' && selection.id === op.id;

        return (
          <group
            key={op.id}
            onClick={(e) => {
              e.stopPropagation();
              select('opening', op.id);
            }}
          >
            {op.type === 'window' ? (
              <group position={[posX, posY, posZ]} rotation={[0, -angle, 0]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[opWidth - 0.04, opHeight - 0.04, 0.02]} />
                  <meshStandardMaterial
                    color="#06b6d4"
                    transparent
                    opacity={0.3}
                    roughness={0.1}
                    metalness={0.9}
                  />
                </mesh>
                <mesh castShadow>
                  <boxGeometry args={[opWidth, opHeight, thickness + 0.01]} />
                  <meshStandardMaterial color="#f8fafc" wireframe />
                </mesh>
              </group>
            ) : (
              <group position={[posX, posY, posZ]} rotation={[0, -angle, 0]}>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[opWidth, opHeight, thickness + 0.005]} />
                  <meshStandardMaterial color={isOpeningSelected ? '#3b82f6' : '#475569'} wireframe />
                </mesh>
                <mesh
                  position={[op.hingeSide === 'p2' ? opWidth / 2 : -opWidth / 2, 0, 0]}
                  rotation={[0, getDoorOpenRotationY(op), 0]}
                >
                  <group position={[op.hingeSide === 'p2' ? -opWidth / 2 : opWidth / 2, 0, 0]}>
                    <mesh castShadow>
                      <boxGeometry args={[opWidth, opHeight, 0.04]} />
                      <meshStandardMaterial color="#b45309" roughness={0.6} />
                    </mesh>
                  </group>
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}
