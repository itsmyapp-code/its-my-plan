'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { Wall, Opening } from '@/types';
import { CEILING_HEIGHT, SCALE_3D } from '@/constants';
import { wallLength, wallAngle, wallDirection, wallHeightAt, getWallHeights } from '@/utils/geometry';
import { usePlanStore } from '@/store/usePlanStore';

interface Wall3DProps {
  wall: Wall;
}

interface WallSubSegment {
  length: number;
  height: number;
  yOffset: number; // Vertical offset in mm
  xOffset: number; // Offset along the wall in mm
}

export function Wall3D({ wall }: Wall3DProps) {
  const selection = usePlanStore((s) => s.selection);
  const select = usePlanStore((s) => s.select);
  const isSelected = selection.type === 'wall' && selection.id === wall.id;

  const allOpenings = usePlanStore((s) => s.plan.openings);
  const openings = useMemo(() => {
    return allOpenings.filter((o) => o.wallId === wall.id);
  }, [allOpenings, wall.id]);

  const totalLength = useMemo(() => wallLength(wall), [wall]);
  const angle = useMemo(() => wallAngle(wall), [wall]);
  const dir = useMemo(() => wallDirection(wall), [wall]);

  // Sort openings along the wall
  const sortedOpenings = useMemo(() => {
    return [...openings].sort((a, b) => a.distanceFromP1 - b.distanceFromP1);
  }, [openings]);

  const wallHeight = wall.height ?? CEILING_HEIGHT;
  const { h1: heightP1, h2: heightP2 } = getWallHeights(wall, CEILING_HEIGHT);
  const isSloped = heightP1 !== heightP2;

  // Sub-segments of wall computed based on openings
  const segments = useMemo(() => {
    const list: WallSubSegment[] = [];
    let currentDist = 0;

    for (const op of sortedOpenings) {
      const opStart = op.distanceFromP1 - op.width / 2;
      const opEnd = op.distanceFromP1 + op.width / 2;

      // Wall segment before the opening
      if (opStart > currentDist) {
        const segMid = currentDist + (opStart - currentDist) / 2;
        const segHeight = isSloped
          ? wallHeightAt(wall, segMid, CEILING_HEIGHT)
          : wallHeight;
        list.push({
          length: opStart - currentDist,
          height: segHeight,
          yOffset: 0,
          xOffset: currentDist,
        });
      }

      // Wall segment above the opening
      const openingTop = op.zOffset + op.height;
      const opMidHeight = wallHeightAt(wall, op.distanceFromP1, CEILING_HEIGHT);
      if (openingTop < opMidHeight) {
        list.push({
          length: op.width,
          height: opMidHeight - openingTop,
          yOffset: openingTop,
          xOffset: opStart,
        });
      }

      // Wall segment below the opening (for windows)
      if (op.zOffset > 0) {
        list.push({
          length: op.width,
          height: op.zOffset,
          yOffset: 0,
          xOffset: opStart,
        });
      }

      currentDist = opEnd;
    }

    // Remaining segment after the last opening
    if (currentDist < totalLength) {
      const segMid = currentDist + (totalLength - currentDist) / 2;
      const segHeight = isSloped
        ? wallHeightAt(wall, segMid, CEILING_HEIGHT)
        : wallHeight;
      list.push({
        length: totalLength - currentDist,
        height: segHeight,
        yOffset: 0,
        xOffset: currentDist,
      });
    }

    return list;
  }, [sortedOpenings, totalLength, wallHeight, isSloped, wall]);

  const color = useMemo(() => {
    if (isSelected) return '#3b82f6';
    return wall.wallType === 'external' ? '#64748b' : '#94a3b8';
  }, [isSelected, wall.wallType]);

  // Renders the sub-segment meshes in 3D
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        select('wall', wall.id);
      }}
    >
      {/* Wall segments */}
      {segments.map((seg, i) => {
        const segLen = seg.length * SCALE_3D;
        const segHeight = seg.height * SCALE_3D;
        const thickness = wall.thickness * SCALE_3D;

        // Calculate segment center position in wall coordinate space
        // Then transform to world space
        const segMidDist = seg.xOffset + seg.length / 2;
        const posX = (wall.p1.x + dir.x * segMidDist) * SCALE_3D;
        const posZ = (wall.p1.y + dir.y * segMidDist) * SCALE_3D;
        const posY = (seg.yOffset + seg.height / 2) * SCALE_3D;

        return (
          <mesh
            key={i}
            position={[posX, posY, posZ]}
            rotation={[0, -angle, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[segLen, segHeight, thickness]} />
            <meshStandardMaterial
              color={color}
              roughness={0.7}
              metalness={0.05}
              transparent={isSelected}
              opacity={isSelected ? 0.85 : 1}
            />
          </mesh>
        );
      })}

      {/* Opening Frame/Visualizations */}
      {sortedOpenings.map((op) => {
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
            {/* Opening visualizer (Door panel or Window glass/frame) */}
            {op.type === 'window' ? (
              <group position={[posX, posY, posZ]} rotation={[0, -angle, 0]}>
                {/* Window glass pane */}
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
                {/* Window frame */}
                <mesh castShadow>
                  <boxGeometry args={[opWidth, opHeight, thickness + 0.01]} />
                  <meshStandardMaterial color="#f8fafc" wireframe />
                </mesh>
              </group>
            ) : (
              // Door
              <group position={[posX, posY, posZ]} rotation={[0, -angle, 0]}>
                {/* Visualizing door frame cutout */}
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[opWidth, opHeight, thickness + 0.005]} />
                  <meshStandardMaterial color={isOpeningSelected ? '#3b82f6' : '#475569'} wireframe />
                </mesh>
                {/* Door leaf (slightly swung open) */}
                <mesh
                  position={[
                    op.hingeSide === 'p2' ? opWidth / 2 : -opWidth / 2,
                    0,
                    0,
                  ]}
                  rotation={[0, op.flipDirection ? Math.PI / 3 : -Math.PI / 3, 0]}
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
