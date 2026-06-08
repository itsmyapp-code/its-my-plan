'use client';

import { useMemo, useEffect } from 'react';
import type { Wall } from '@/types';
import { CEILING_HEIGHT, SCALE_3D } from '@/constants';
import { wallLength, wallAngle, wallDirection, getWallHeights } from '@/utils/geometry';
import { buildWallSegmentSpecs, createSlopedWallGeometry } from '@/utils/wallGeometry3d';
import type { WallSegmentSpec } from '@/utils/wallGeometry3d';
import { getDoorOpenRotationY } from '@/utils/openingHelpers';
import { usePlanStore } from '@/store/usePlanStore';
import { useUIStore } from '@/store/useUIStore';
import { getWallFramingLayout } from '@/utils/framing';

interface SlopedSegmentMeshProps {
  wall: Wall;
  spec: WallSegmentSpec;
  angle: number;
  dir: ReturnType<typeof wallDirection>;
  color: string;
  isSelected: boolean;
  index: number;
  showFraming: boolean;
  hasFraming: boolean;
}

function SlopedSegmentMesh({ wall, spec, angle, dir, color, isSelected, index, showFraming, hasFraming }: SlopedSegmentMeshProps) {
  const geometry = useMemo(
    () => createSlopedWallGeometry(wall, spec, wall.thickness),
    [wall, spec, wall.thickness]
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  const segMidDist = (spec.distStart + spec.distEnd) / 2;
  const posX = (wall.p1.x + dir.x * segMidDist) * SCALE_3D;
  const posZ = (wall.p1.y + dir.y * segMidDist) * SCALE_3D;

  if (!geometry.attributes.position || geometry.attributes.position.count === 0) return null;

  const isTranslucent = showFraming && hasFraming;
  const opacity = isSelected ? 0.85 : (isTranslucent ? 0.15 : 1);
  const transparent = isSelected || isTranslucent;

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
        transparent={transparent}
        opacity={opacity}
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

  const showFraming = useUIStore((s) => s.viewSettings.showFraming);
  const { h1, h2 } = useMemo(() => getWallHeights(wall, CEILING_HEIGHT), [wall]);

  const framing = useMemo(() => {
    if (!showFraming || !wall.hasFraming) return null;
    return getWallFramingLayout(wall, allOpenings, CEILING_HEIGHT);
  }, [showFraming, wall, allOpenings]);

  const segmentSpecs = useMemo(
    () => buildWallSegmentSpecs(wall, totalLength, openings),
    [wall, totalLength, openings]
  );

  const color = useMemo(() => {
    if (isSelected) return '#3b82f6';
    if (wall.color) return wall.color;
    return wall.wallType === 'external' ? '#64748b' : '#94a3b8';
  }, [isSelected, wall.wallType, wall.color]);

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
          showFraming={showFraming}
          hasFraming={wall.hasFraming || false}
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

      {/* 3D Timber Framing Layer */}
      {showFraming && wall.hasFraming && framing && (
        <group
          position={[wall.p1.x * SCALE_3D, 0, wall.p1.y * SCALE_3D]}
          rotation={[0, -angle, 0]}
        >
          {/* Bottom Plate */}
          <mesh
            position={[totalLength / 2 * SCALE_3D, (framing.timberThickness / 2) * SCALE_3D, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[totalLength * SCALE_3D, framing.timberThickness * SCALE_3D, Math.min(wall.thickness - 2, framing.timberWidth) * SCALE_3D]} />
            <meshStandardMaterial color="#d2b48c" roughness={0.8} />
          </mesh>

          {/* Double Top Plate */}
          {(() => {
            const t = framing.timberThickness;
            const slopeAngle = Math.atan((h2 - h1) / totalLength);
            const slopeLen = Math.sqrt(totalLength * totalLength + (h2 - h1) * (h2 - h1));
            const centerY = (h1 + h2) / 2 - t;

            return (
              <mesh
                position={[totalLength / 2 * SCALE_3D, centerY * SCALE_3D, 0]}
                rotation={[0, 0, slopeAngle]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[slopeLen * SCALE_3D, t * 2 * SCALE_3D, Math.min(wall.thickness - 2, framing.timberWidth) * SCALE_3D]} />
                <meshStandardMaterial color="#d2b48c" roughness={0.8} />
              </mesh>
            );
          })()}

          {/* Vertical Studs */}
          {framing.studs.map((stud) => (
            <mesh
              key={stud.id}
              position={[stud.distanceFromP1 * SCALE_3D, (stud.yOffset + stud.height / 2) * SCALE_3D, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[framing.timberThickness * SCALE_3D, stud.height * SCALE_3D, Math.min(wall.thickness - 2, framing.timberWidth) * SCALE_3D]} />
              <meshStandardMaterial
                color={stud.type.startsWith('cripple') ? '#c7a374' : '#d2b48c'}
                roughness={0.8}
              />
            </mesh>
          ))}

          {/* Header Lintels */}
          {framing.headerLintels.map((lintel, i) => (
            <mesh
              key={`lintel-${i}`}
              position={[lintel.distanceFromP1 * SCALE_3D, (lintel.yOffset + lintel.height / 2) * SCALE_3D, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[lintel.width * SCALE_3D, lintel.height * SCALE_3D, Math.min(wall.thickness - 2, framing.timberWidth) * SCALE_3D]} />
              <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
            </mesh>
          ))}

          {/* Sill Plates */}
          {framing.sillPlates.map((sill, i) => (
            <mesh
              key={`sill-${i}`}
              position={[sill.distanceFromP1 * SCALE_3D, (sill.yOffset + sill.thickness / 2) * SCALE_3D, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[sill.width * SCALE_3D, sill.thickness * SCALE_3D, Math.min(wall.thickness - 2, framing.timberWidth) * SCALE_3D]} />
              <meshStandardMaterial color="#d2b48c" roughness={0.8} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
