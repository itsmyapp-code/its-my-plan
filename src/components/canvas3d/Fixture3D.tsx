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
    if (def.iconType === 'radiator' || def.id.includes('radiator')) return 0.6;
    if (def.iconType === 'tv') return 0.7;
    if (def.iconType === 'appliance') return 0.85;

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
            {/* Tray (Base) - positioned at the back-left corner, scaled to width and depth to support rectangular sizing */}
            <mesh position={[-width / 2, 0.04 / 2, -depth / 2]} scale={[width, 1, depth]} castShadow>
              <cylinderGeometry args={[1, 1, 0.04, 32, 1, false, Math.PI * 1.5, Math.PI / 2]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.1} />
            </mesh>
            {/* Curved Glass Screen - matching the tray's arc and scaled */}
            <mesh position={[-width / 2, height / 2, -depth / 2]} scale={[width, height, depth]} castShadow>
              <cylinderGeometry args={[1, 1, 1, 32, 1, true, Math.PI * 1.5, Math.PI / 2]} />
              <meshStandardMaterial color="#38bdf8" transparent opacity={0.3} roughness={0.1} side={THREE.DoubleSide} />
            </mesh>
            {/* Corner Post (Back-Left) */}
            <mesh position={[-width / 2 + 0.015, height / 2, -depth / 2 + 0.015]} castShadow>
              <boxGeometry args={[0.03, height, 0.03]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* End Post (Front-Left) */}
            <mesh position={[-width / 2 + 0.015, height / 2, depth / 2 - 0.015]} castShadow>
              <boxGeometry args={[0.03, height, 0.03]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* End Post (Back-Right) */}
            <mesh position={[width / 2 - 0.015, height / 2, -depth / 2 + 0.015]} castShadow>
              <boxGeometry args={[0.03, height, 0.03]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
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

    // Adult Scale Figure
    if (def.id.includes('adult')) {
      return (
        <group>
          {/* Torso/Body */}
          <mesh position={[0, 1.25 / 2, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.16, 1.25, 16]} />
            <meshStandardMaterial color="#f43f5e" roughness={0.5} />
          </mesh>
          {/* Shoulders joint */}
          <mesh position={[0, 1.25 - 0.05, 0]} castShadow>
            <boxGeometry args={[0.34, 0.08, 0.14]} />
            <meshStandardMaterial color="#f43f5e" roughness={0.5} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 1.25 + 0.15, 0]} castShadow>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#fda4af" roughness={0.4} />
          </mesh>
        </group>
      );
    }

    // Double Vanity Basin
    if (def.id.includes('double-vanity')) {
      return (
        <group>
          {/* Vanity cabinet */}
          <mesh position={[0, (height - 0.04) / 2, 0]} castShadow>
            <boxGeometry args={[width, height - 0.04, depth]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
          </mesh>
          {/* Worktop rim */}
          <mesh position={[0, height - 0.04 / 2, 0]} castShadow>
            <boxGeometry args={[width + 0.01, 0.04, depth + 0.01]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.1} />
          </mesh>
          {/* Left sink basin hole visual */}
          <mesh position={[-width * 0.24, height, 0]}>
            <boxGeometry args={[width * 0.32, 0.02, depth * 0.65]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.25} />
          </mesh>
          {/* Right sink basin hole visual */}
          <mesh position={[width * 0.24, height, 0]}>
            <boxGeometry args={[width * 0.32, 0.02, depth * 0.65]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.25} />
          </mesh>
        </group>
      );
    }

    // Freestanding Bath
    if (def.id.includes('freestanding-bath')) {
      return (
        <group>
          {/* Oval Tub */}
          <mesh position={[0, height / 2, 0]} castShadow>
            <cylinderGeometry args={[width / 2, width / 2 - 0.05, height, 32, 1]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.1} />
          </mesh>
          {/* Rim */}
          <mesh position={[0, height, 0]}>
            <torusGeometry args={[width / 2 - 0.02, 0.02, 12, 48]} />
            <meshStandardMaterial color="#ffffff" roughness={0.05} />
          </mesh>
          {/* Water */}
          <mesh position={[0, height - 0.08, 0]}>
            <cylinderGeometry args={[width / 2 - 0.03, width / 2 - 0.04, 0.01, 32]} />
            <meshStandardMaterial color="#bae6fd" transparent opacity={0.65} roughness={0.05} />
          </mesh>
        </group>
      );
    }

    // Chairs & Sofas & Armchairs
    if (def.id.includes('sofa') || def.id.includes('armchair') || def.iconType === 'chair' || def.id.includes('chair')) {
      const isSofa3 = def.id.includes('sofa-3s');
      const isSofa2 = def.id.includes('sofa-2s');
      const isArmchair = def.id.includes('armchair');
      const seatColor = def.color || '#10b981';
      const armWidth = isArmchair ? 0.12 : 0.08;

      return (
        <group>
          {/* Seat base frame */}
          <mesh position={[0, (height * 0.45) / 2, 0]} castShadow>
            <boxGeometry args={[width, height * 0.45, depth]} />
            <meshStandardMaterial color={seatColor} roughness={0.7} />
          </mesh>
          {/* Backrest */}
          <mesh position={[0, height * 0.75, -depth / 2 + 0.05]} castShadow>
            <boxGeometry args={[width, height * 0.5, 0.1]} />
            <meshStandardMaterial color={seatColor} roughness={0.7} />
          </mesh>
          {/* Armrests */}
          {(isSofa3 || isSofa2 || isArmchair) && (
            <>
              <mesh position={[-width / 2 + armWidth / 2, (height * 0.6) / 2, 0]} castShadow>
                <boxGeometry args={[armWidth, height * 0.6, depth]} />
                <meshStandardMaterial color={seatColor} roughness={0.7} />
              </mesh>
              <mesh position={[width / 2 - armWidth / 2, (height * 0.6) / 2, 0]} castShadow>
                <boxGeometry args={[armWidth, height * 0.6, depth]} />
                <meshStandardMaterial color={seatColor} roughness={0.7} />
              </mesh>
            </>
          )}
          {/* Four wooden chair legs (for standard chairs) */}
          {!isSofa3 && !isSofa2 && !isArmchair && (
            <>
              <mesh position={[-width / 2 + 0.03, (height * 0.4) / 2, -depth / 2 + 0.03]} castShadow>
                <cylinderGeometry args={[0.02, 0.015, height * 0.4, 8]} />
                <meshStandardMaterial color="#78350f" roughness={0.4} />
              </mesh>
              <mesh position={[width / 2 - 0.03, (height * 0.4) / 2, -depth / 2 + 0.03]} castShadow>
                <cylinderGeometry args={[0.02, 0.015, height * 0.4, 8]} />
                <meshStandardMaterial color="#78350f" roughness={0.4} />
              </mesh>
              <mesh position={[-width / 2 + 0.03, (height * 0.4) / 2, depth / 2 - 0.03]} castShadow>
                <cylinderGeometry args={[0.02, 0.015, height * 0.4, 8]} />
                <meshStandardMaterial color="#78350f" roughness={0.4} />
              </mesh>
              <mesh position={[width / 2 - 0.03, (height * 0.4) / 2, depth / 2 - 0.03]} castShadow>
                <cylinderGeometry args={[0.02, 0.015, height * 0.4, 8]} />
                <meshStandardMaterial color="#78350f" roughness={0.4} />
              </mesh>
            </>
          )}
        </group>
      );
    }

    // Tables & Desks & Islands
    if (def.iconType === 'table' || def.id.includes('table') || def.id.includes('desk') || def.id.includes('island')) {
      const topThickness = 0.04;
      const legHeight = height - topThickness;
      const legRadius = Math.max(0.02, Math.min(width, depth) * 0.04);
      const tableColor = def.color || '#f59e0b';
      const legColor = '#451a03'; // Dark wood legs

      return (
        <group>
          {/* Tabletop */}
          <mesh position={[0, height - topThickness / 2, 0]} castShadow>
            <boxGeometry args={[width, topThickness, depth]} />
            <meshStandardMaterial color={tableColor} roughness={0.45} />
          </mesh>
          {/* 4 Corner Legs */}
          <mesh position={[-width / 2 + legRadius + 0.01, legHeight / 2, -depth / 2 + legRadius + 0.01]} castShadow>
            <cylinderGeometry args={[legRadius, legRadius * 0.7, legHeight, 8]} />
            <meshStandardMaterial color={legColor} roughness={0.5} />
          </mesh>
          <mesh position={[width / 2 - legRadius - 0.01, legHeight / 2, -depth / 2 + legRadius + 0.01]} castShadow>
            <cylinderGeometry args={[legRadius, legRadius * 0.7, legHeight, 8]} />
            <meshStandardMaterial color={legColor} roughness={0.5} />
          </mesh>
          <mesh position={[-width / 2 + legRadius + 0.01, legHeight / 2, depth / 2 - legRadius - 0.01]} castShadow>
            <cylinderGeometry args={[legRadius, legRadius * 0.7, legHeight, 8]} />
            <meshStandardMaterial color={legColor} roughness={0.5} />
          </mesh>
          <mesh position={[width / 2 - legRadius - 0.01, legHeight / 2, depth / 2 - legRadius - 0.01]} castShadow>
            <cylinderGeometry args={[legRadius, legRadius * 0.7, legHeight, 8]} />
            <meshStandardMaterial color={legColor} roughness={0.5} />
          </mesh>
        </group>
      );
    }

    // Kitchen Worktop
    if (def.id === 'uk-kitchen-worktop') {
      return (
        <group>
          {/* Cabinet Base */}
          <mesh position={[0, (height - 0.04) / 2, 0]} castShadow>
            <boxGeometry args={[width, height - 0.04, depth]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
          </mesh>
          {/* Wooden Countertop */}
          <mesh position={[0, height - 0.04 / 2, 0]} castShadow>
            <boxGeometry args={[width + 0.01, 0.04, depth + 0.01]} />
            <meshStandardMaterial color="#7c2d12" roughness={0.4} />
          </mesh>
        </group>
      );
    }

    // Radiator (wall panel radiator with fins)
    if (def.iconType === 'radiator') {
      const finCount = 10;
      const finWidth = width / finCount;
      const listFins = Array.from({ length: finCount });
      return (
        <group>
          {/* Main radiator panel body */}
          <mesh position={[0, height / 2, 0]} castShadow>
            <boxGeometry args={[width, height, depth * 0.4]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} />
          </mesh>
          {/* Radiator fins/ridges */}
          {listFins.map((_, idx) => {
            const xPos = -width / 2 + finWidth * (idx + 0.5);
            return (
              <mesh key={idx} position={[xPos, height / 2, depth * 0.2 + 0.005]} castShadow>
                <boxGeometry args={[finWidth * 0.6, height * 0.95, 0.01]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
              </mesh>
            );
          })}
        </group>
      );
    }

    // TV (Wall-mounted or stand console)
    if (def.iconType === 'tv') {
      const isWall = def.id.includes('wall');
      const tvHeight = 0.7;
      const tvThickness = 0.04;
      const zPos = isWall ? -depth / 2 + tvThickness / 2 : 0;
      const yPos = isWall ? 1.4 : tvHeight / 2 + 0.5; // Wall mount vs stand console height
      
      return (
        <group>
          {/* Stand console (if not wall-mounted) */}
          {!isWall && (
            <group>
              {/* Stand cabinet */}
              <mesh position={[0, 0.5 / 2, 0]} castShadow>
                <boxGeometry args={[width + 0.1, 0.5, depth]} />
                <meshStandardMaterial color="#1e293b" roughness={0.6} />
              </mesh>
              {/* TV neck & base support */}
              <mesh position={[0, 0.5 + 0.05, 0]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
                <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.1} />
              </mesh>
              <mesh position={[0, 0.5 + 0.1, 0]} castShadow>
                <boxGeometry args={[0.3, 0.02, 0.2]} />
                <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.1} />
              </mesh>
            </group>
          )}
          
          {/* TV Screen */}
          <mesh position={[0, yPos, zPos]} castShadow>
            <boxGeometry args={[width, tvHeight, tvThickness]} />
            <meshStandardMaterial color="#090d16" roughness={0.1} metalness={0.8} />
          </mesh>
          {/* TV Screen Inner panel (glass highlight) */}
          <mesh position={[0, yPos, zPos + tvThickness / 2 + 0.001]}>
            <boxGeometry args={[width * 0.96, tvHeight * 0.94, 0.002]} />
            <meshStandardMaterial color="#020617" roughness={0.05} metalness={0.9} />
          </mesh>
        </group>
      );
    }

    // Appliance (Washing Machine / Tumble Dryer)
    if (def.iconType === 'appliance') {
      const isDryer = def.id.includes('dryer');
      return (
        <group>
          {/* Main Appliance Cabinet */}
          <mesh position={[0, height / 2, 0]} castShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} />
          </mesh>
          {/* Top Control Panel Drawer */}
          <mesh position={[0, height - 0.12 / 2 - 0.01, depth / 2 + 0.005]} castShadow>
            <boxGeometry args={[width * 0.96, 0.12, 0.01]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
          </mesh>
          {/* Dial button */}
          <mesh position={[-width * 0.25, height - 0.07, depth / 2 + 0.015]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.02, 12]} />
            <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.2} />
          </mesh>
          {/* Round Glass Door */}
          <mesh position={[0, height * 0.42, depth / 2 + 0.015]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[width * 0.25, width * 0.25, 0.03, 32, 1]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.1} />
          </mesh>
          {/* Glass window panel inside door */}
          <mesh position={[0, height * 0.42, depth / 2 + 0.026]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[width * 0.18, width * 0.18, 0.01, 24]} />
            <meshStandardMaterial color={isDryer ? "#cbd5e1" : "#38bdf8"} transparent opacity={isDryer ? 0.3 : 0.4} roughness={0.05} />
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
