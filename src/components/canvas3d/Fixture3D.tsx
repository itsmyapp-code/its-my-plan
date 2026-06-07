'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { Fixture } from '@/types';
import { SCALE_3D } from '@/constants';
import { getFixtureDefinition } from '@/data/fixtures';
import { usePlanStore } from '@/store/usePlanStore';

interface Fixture3DProps {
  fixture: Fixture;
}

export function Fixture3D({ fixture }: Fixture3DProps) {
  const selection = usePlanStore((s) => s.selection);
  const select = usePlanStore((s) => s.select);
  const isSelected = selection.type === 'fixture' && selection.id === fixture.id;

  const def = getFixtureDefinition(fixture.type);
  if (!def) return null;

  const width = (fixture.width ?? def.width) * SCALE_3D;
  const depth = (fixture.depth ?? def.depth) * SCALE_3D;
  // Standard heights in meters: Bath: 0.6, WC: 0.8, Basin: 0.85, Kitchen: 0.9, Appliance Tower: 2.1, Bed: 0.5, Wardrobe: 2.0
  const height = useMemo(() => {
    if (def.category === 'bathroom') {
      if (def.id.includes('bath')) return 0.6;
      if (def.id.includes('wc')) return 0.8;
      if (def.id.includes('basin')) return 0.85;
      if (def.id.includes('shower')) return 2.0;
      return 0.7;
    }
    if (def.category === 'kitchen') {
      if (def.id.includes('tower')) return 2.1;
      return 0.9;
    }
    if (def.category === 'bedroom') {
      if (def.id.includes('bed')) return 0.5;
      if (def.id.includes('wardrobe')) return 2.0;
    }
    if (def.category === 'furniture') {
      if (def.id.includes('chair')) return 0.9;
      if (def.id.includes('coffee-table')) return 0.45;
      if (def.id.includes('dressing-table')) return 0.78;
      if (def.id.includes('bedside-table')) return 0.6;
      return 0.75;
    }
    if (def.category === 'electrical' || def.category === 'plumbing') return 0.08;
    return 0.7;
  }, [def]);

  const rotationY = -(fixture.rotation * Math.PI) / 180;

  // Render composite Three.js components for rich visuals
  const renderGeometry = () => {
    // WC
    if (def.id.includes('wc')) {
      return (
        <group>
          {/* Cistern */}
          <mesh position={[0, height - 0.4 / 2, -depth / 2 + 0.15 / 2]} castShadow>
            <boxGeometry args={[width, 0.4, 0.15]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.1} />
          </mesh>
          {/* Bowl */}
          <mesh position={[0, 0.4 / 2, 0.05]} castShadow>
            <boxGeometry args={[width * 0.9, 0.4, depth - 0.15]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.1} />
          </mesh>
        </group>
      );
    }

    // Bath
    if (def.id.includes('bath')) {
      return (
        <group>
          {/* Main Tub */}
          <mesh position={[0, height / 2, 0]} castShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
          </mesh>
          {/* Inner tub hole (visualized with a slightly smaller dark/blue top pane) */}
          <mesh position={[0, height - 0.01, 0]}>
            <boxGeometry args={[width - 0.1, 0.03, depth - 0.1]} />
            <meshStandardMaterial color="#e0f2fe" roughness={0.1} metalness={0.1} />
          </mesh>
        </group>
      );
    }

    // Shower
    if (def.id.includes('shower')) {
      if (def.id.includes('quadrant')) {
        return (
          <group>
            <mesh position={[0, 0.04 / 2, 0]} castShadow>
              <cylinderGeometry args={[width / 2, width / 2, 0.04, 48, 1, false, Math.PI, Math.PI / 2]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.1} />
            </mesh>
            <mesh position={[-width / 4, height / 2, 0]} castShadow>
              <boxGeometry args={[0.02, height, depth]} />
              <meshStandardMaterial color="#38bdf8" transparent opacity={0.3} roughness={0.1} />
            </mesh>
            <mesh position={[0, height / 2, -depth / 4]} castShadow>
              <boxGeometry args={[width, height, 0.02]} />
              <meshStandardMaterial color="#38bdf8" transparent opacity={0.3} roughness={0.1} />
            </mesh>
          </group>
        );
      }

      return (
        <group>
          {/* Tray */}
          <mesh position={[0, 0.05 / 2, 0]} castShadow>
            <boxGeometry args={[width, 0.05, depth]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.1} />
          </mesh>
          {/* Glass Panels */}
          <mesh position={[-width / 2 + 0.01, height / 2, 0]} castShadow>
            <boxGeometry args={[0.02, height, depth]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.3} roughness={0.1} />
          </mesh>
          <mesh position={[0, height / 2, -depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[width, height, 0.02]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.3} roughness={0.1} />
          </mesh>
        </group>
      );
    }

    // Electrical and plumbing symbols as low-profile markers
    if (def.category === 'electrical' || def.category === 'plumbing') {
      return (
        <group>
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[Math.max(width, depth) * 0.42, Math.max(width, depth) * 0.42, 0.04, 24]} />
            <meshStandardMaterial
              color={new THREE.Color(def.color).offsetHSL(0, 0, -0.05)}
              roughness={0.35}
              metalness={0.1}
            />
          </mesh>
          <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[Math.max(width, depth) * 0.26, Math.max(width, depth) * 0.35, 24]} />
            <meshStandardMaterial color={def.color} emissive={def.color} emissiveIntensity={0.05} side={THREE.DoubleSide} />
          </mesh>
        </group>
      );
    }

    // Basin
    if (def.id.includes('basin')) {
      return (
        <group>
          {/* Stand/Pedestal */}
          <mesh position={[0, (height - 0.2) / 2, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, height - 0.2, 16]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.2} />
          </mesh>
          {/* Sink Bowl */}
          <mesh position={[0, height - 0.2 / 2, 0]} castShadow>
            <boxGeometry args={[width, 0.2, depth]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.1} />
          </mesh>
        </group>
      );
    }

    // Kitchen base units
    if (def.category === 'kitchen' && !def.id.includes('tower')) {
      return (
        <group>
          {/* Cabinet */}
          <mesh position={[0, (height - 0.04) / 2, 0]} castShadow>
            <boxGeometry args={[width, height - 0.04, depth]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
          </mesh>
          {/* Worktop */}
          <mesh position={[0, height - 0.04 / 2, 0]} castShadow>
            <boxGeometry args={[width + 0.02, 0.04, depth + 0.02]} />
            <meshStandardMaterial color="#475569" roughness={0.3} />
          </mesh>
          {/* Handle details */}
          <mesh position={[0, height * 0.75, depth / 2 + 0.01]}>
            <boxGeometry args={[0.15, 0.02, 0.02]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      );
    }

    // Kitchen appliance tower
    if (def.id.includes('tower')) {
      return (
        <group>
          {/* Tall cabinet */}
          <mesh position={[0, height / 2, 0]} castShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
          </mesh>
          {/* Oven window */}
          <mesh position={[0, height * 0.6, depth / 2 + 0.01]}>
            <boxGeometry args={[width * 0.8, 0.4, 0.02]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
          </mesh>
        </group>
      );
    }

    // Beds
    if (def.id.includes('bed')) {
      return (
        <group>
          {/* Headboard */}
          <mesh position={[0, 0.9 / 2, -depth / 2 + 0.05]} castShadow>
            <boxGeometry args={[width, 0.9, 0.1]} />
            <meshStandardMaterial color="#854d0e" roughness={0.8} />
          </mesh>
          {/* Mattress/Frame */}
          <mesh position={[0, height / 2, 0]} castShadow>
            <boxGeometry args={[width, height, depth - 0.1]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
          </mesh>
          {/* Pillows */}
          <mesh position={[0, height + 0.05, -depth / 2 + 0.3]} castShadow>
            <boxGeometry args={[width * 0.8, 0.08, 0.4]} />
            <meshStandardMaterial color="#ffffff" roughness={0.9} />
          </mesh>
        </group>
      );
    }

    // Wardrobe
    if (def.category === 'bedroom' && def.id.includes('wardrobe')) {
      return (
        <group>
          {/* Main wardrobe box */}
          <mesh position={[0, height / 2, 0]} castShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color="#b45309" roughness={0.7} />
          </mesh>
          {/* Handle line split details */}
          <mesh position={[0, height / 2, depth / 2 + 0.005]}>
            <boxGeometry args={[0.01, height * 0.9, 0.01]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      );
    }

    // Default block representation
    return (
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={def.color} roughness={0.5} />
      </mesh>
    );
  };

  return (
    <group
      position={[fixture.x * SCALE_3D, 0, fixture.y * SCALE_3D]}
      rotation={[0, rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        select('fixture', fixture.id);
      }}
    >
      {renderGeometry()}

      {/* Selection Ring/Box Outline */}
      {isSelected && (
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[width + 0.02, height + 0.02, depth + 0.02]} />
          <meshStandardMaterial color="#3b82f6" wireframe transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}
