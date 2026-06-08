'use client';

import { usePlanStore } from '@/store/usePlanStore';
import { wallLength, wallAngleDeg, wallDirection, distance } from '@/utils/geometry';
import { clampOpeningPosition, hasOverlappingOpenings } from '@/utils/openingHelpers';
import { getFixtureDefinition } from '@/data/fixtures';
import { X, RotateCw, FlipHorizontal2, Trash2, Copy, Bold, Italic } from 'lucide-react';
import type { Wall } from '@/types';

interface PropertiesPanelProps {
  onClose: () => void;
}

export function PropertiesPanel({ onClose }: PropertiesPanelProps) {
  const selection = usePlanStore((s) => s.selection);
  const plan = usePlanStore((s) => s.plan);
  const updateWall = usePlanStore((s) => s.updateWall);
  const addOpening = usePlanStore((s) => s.addOpening);
  const updateOpening = usePlanStore((s) => s.updateOpening);
  const addFixture = usePlanStore((s) => s.addFixture);
  const updateFixture = usePlanStore((s) => s.updateFixture);
  const updateTextBox = usePlanStore((s) => s.updateTextBox);
  const deleteSelected = usePlanStore((s) => s.deleteSelected);

  if (!selection.type || !selection.id) {
    return (
      <div className="glass-panel absolute right-3 top-14 z-40 w-56 rounded-2xl p-4 animate-fade-in">
        <div className="text-xs text-slate-500 text-center py-4">
          Select an element to edit its properties
        </div>
      </div>
    );
  }

  // ── Wall Properties ──
  if (selection.type === 'wall') {
    const wall = plan.walls.find((w) => w.id === selection.id);
    if (!wall) return null;

    const len = wallLength(wall);
    const angle = wallAngleDeg(wall);

    const clampOpeningsForWall = (updatedP2: { x: number; y: number }) => {
      const updatedWall = { ...wall, p2: updatedP2 };
      const wallOpenings = plan.openings.filter((o) => o.wallId === wall.id);
      for (const op of wallOpenings) {
        const clampedDist = clampOpeningPosition(updatedWall, op);
        if (clampedDist !== op.distanceFromP1) {
          updateOpening(op.id, { distanceFromP1: clampedDist });
        }
      }
    };

    return (
      <div className="glass-panel absolute right-3 top-14 z-40 w-60 rounded-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Wall</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800" aria-label="Close">
            <X size={14} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="prop-label">Length (mm)</label>
            <input
              type="number"
              className="prop-input"
              value={Math.round(len)}
              onChange={(e) => {
                const newLen = Number(e.target.value) || len;
                const dir = wallDirection(wall);
                const p2 = {
                  x: wall.p1.x + dir.x * newLen,
                  y: wall.p1.y + dir.y * newLen,
                };
                updateWall(wall.id, { p2 });

                clampOpeningsForWall(p2);
              }}
              step={100}
              min={100}
            />
          </div>

          <div>
            <label className="prop-label">Angle</label>
            <input
              type="number"
              className="prop-input"
              value={Number.isFinite(angle) ? Number(angle.toFixed(1)) : 0}
              onChange={(e) => {
                const parsed = Number(e.target.value);
                if (!Number.isFinite(parsed)) return;

                const normalized = ((parsed % 360) + 360) % 360;
                const radians = (normalized * Math.PI) / 180;
                const p2 = {
                  x: wall.p1.x + Math.cos(radians) * len,
                  y: wall.p1.y + Math.sin(radians) * len,
                };

                updateWall(wall.id, { p2 });
                clampOpeningsForWall(p2);
              }}
              step={1}
              min={-360}
              max={360}
            />
          </div>

          <div>
            <label className="prop-label">Type</label>
            <div className="flex gap-1 mt-1">
              <button
                onClick={() => updateWall(wall.id, { wallType: 'internal', thickness: 100 })}
                className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  wall.wallType === 'internal'
                    ? 'bg-blue-600/30 text-blue-300 ring-1 ring-blue-500/40'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Internal (100mm)
              </button>
              <button
                onClick={() => updateWall(wall.id, { wallType: 'external', thickness: 300 })}
                className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  wall.wallType === 'external'
                    ? 'bg-orange-600/30 text-orange-300 ring-1 ring-orange-500/40'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                External (300mm)
              </button>
            </div>
          </div>

          <div>
            <label className="prop-label">Thickness</label>
            <input
              type="number"
              className="prop-input"
              value={Math.round(wall.thickness)}
              onChange={(e) => {
                const val = Number(e.target.value) || wall.thickness;
                updateWall(wall.id, { thickness: Math.max(50, val) });
              }}
              step={10}
              min={50}
            />
          </div>

          <div>
            <label className="prop-label">Height at P1 (mm)</label>
            <input
              type="number"
              className="prop-input"
              value={wall.heightP1 ?? wall.height ?? 2400}
              onChange={(e) => {
                const val = Number(e.target.value) || 2400;
                updateWall(wall.id, { heightP1: val, height: undefined });
              }}
              step={100}
              min={1000}
            />
          </div>

          <div>
            <label className="prop-label">Height at P2 (mm)</label>
            <input
              type="number"
              className="prop-input"
              value={wall.heightP2 ?? wall.height ?? 2400}
              onChange={(e) => {
                const val = Number(e.target.value) || 2400;
                updateWall(wall.id, { heightP2: val, height: undefined });
              }}
              step={100}
              min={1000}
            />
            {(wall.heightP1 ?? wall.height ?? 2400) !== (wall.heightP2 ?? wall.height ?? 2400) && (
              <p className="text-[10px] text-orange-400 mt-1">Sloped / raked wall — visible in 3D view</p>
            )}
          </div>

          <div>
            <label className="prop-label">Wall Color</label>
            <div className="grid grid-cols-4 gap-2 mt-1.5">
              {[
                { name: 'Default', hex: '' },
                { name: 'White', hex: '#f8fafc' },
                { name: 'Slate', hex: '#64748b' },
                { name: 'Charcoal', hex: '#334155' },
                { name: 'Sage', hex: '#8ea893' },
                { name: 'Beige', hex: '#d7ccc8' },
                { name: 'Blue', hex: '#7ea1c4' },
                { name: 'Terracotta', hex: '#cc7a6f' },
              ].map((c) => (
                <button
                  key={c.name}
                  onClick={() => updateWall(wall.id, { color: c.hex || undefined })}
                  className={`h-7 rounded-lg border transition-all text-[10px] font-medium ${
                    (wall.color === c.hex || (!wall.color && c.hex === ''))
                      ? 'ring-2 ring-blue-500 border-transparent text-slate-800 scale-105'
                      : 'border-slate-300 hover:scale-102 text-slate-600 bg-white'
                  }`}
                  style={{ borderLeft: c.hex ? `4px solid ${c.hex}` : undefined }}
                  title={c.name}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Timber Framing Settings */}
          <div className="border-t border-slate-200/60 pt-3 mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Timber Framing</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={wall.hasFraming || false}
                  onChange={(e) => {
                    const hasFraming = e.target.checked;
                    updateWall(wall.id, {
                      hasFraming,
                      // Set sensible defaults if turning on for the first time
                      timberSize: wall.timberSize || (wall.wallType === 'external' ? '47x150' : '47x100'),
                      timberGrade: wall.timberGrade || 'C24',
                      studSpacing: wall.studSpacing || 400,
                    });
                  }}
                />
                <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {wall.hasFraming && (
              <div className="space-y-3 pl-1 border-l-2 border-blue-500/20 animate-fade-in">
                {/* Timber Size Selector */}
                <div>
                  <label className="prop-label">Timber Size</label>
                  <select
                    className="prop-input mt-1"
                    value={wall.timberSize || '47x100'}
                    onChange={(e) => {
                      const size = e.target.value as any;
                      const updates: Partial<Wall> = { timberSize: size };
                      if (size !== 'custom') {
                        const [thick, width] = size.split('x').map(Number);
                        updates.customTimberThickness = thick;
                        updates.customTimberWidth = width;
                      } else {
                        updates.customTimberThickness = wall.customTimberThickness || 47;
                        updates.customTimberWidth = wall.customTimberWidth || 169;
                      }
                      updateWall(wall.id, updates);
                    }}
                  >
                    <option value="47x75">47 x 75 mm (2" x 3")</option>
                    <option value="47x100">47 x 100 mm (2" x 4")</option>
                    <option value="47x125">47 x 125 mm (2" x 5")</option>
                    <option value="47x150">47 x 150 mm (2" x 6")</option>
                    <option value="47x175">47 x 175 mm (2" x 7")</option>
                    <option value="47x200">47 x 200 mm (2" x 8")</option>
                    <option value="47x225">47 x 225 mm (2" x 9")</option>
                    <option value="75x100">75 x 100 mm (3" x 4")</option>
                    <option value="75x150">75 x 150 mm (3" x 6")</option>
                    <option value="custom">Custom Size</option>
                  </select>
                </div>

                {/* Custom Size Fields */}
                {wall.timberSize === 'custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="prop-label">Thick (mm)</label>
                      <input
                        type="number"
                        className="prop-input mt-1"
                        value={wall.customTimberThickness ?? 47}
                        onChange={(e) => updateWall(wall.id, { customTimberThickness: Number(e.target.value) || 47 })}
                        min={10}
                        step={1}
                      />
                    </div>
                    <div>
                      <label className="prop-label">Width (mm)</label>
                      <input
                        type="number"
                        className="prop-input mt-1"
                        value={wall.customTimberWidth ?? 169}
                        onChange={(e) => updateWall(wall.id, { customTimberWidth: Number(e.target.value) || 169 })}
                        min={10}
                        step={1}
                      />
                    </div>
                  </div>
                )}

                {/* Strength Grade Selector */}
                <div>
                  <label className="prop-label">Strength Grade</label>
                  <div className="flex gap-1 mt-1">
                    {(['C16', 'C24', 'TR26'] as const).map((grade) => (
                      <button
                        key={grade}
                        onClick={() => updateWall(wall.id, { timberGrade: grade })}
                        className={`flex-1 px-1.5 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                          (wall.timberGrade || 'C24') === grade
                            ? 'bg-blue-600/30 text-blue-300 ring-1 ring-blue-500/40'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spacing Selector */}
                <div>
                  <label className="prop-label">Stud Spacing (mm)</label>
                  <select
                    className="prop-input mt-1"
                    value={wall.studSpacing || 400}
                    onChange={(e) => updateWall(wall.id, { studSpacing: Number(e.target.value) || 400 })}
                  >
                    <option value={400}>400 mm</option>
                    <option value={600}>600 mm</option>
                    <option value={300}>300 mm</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={deleteSelected}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-900/20 text-red-400 text-xs font-medium hover:bg-red-900/40 transition-colors mt-2"
          >
            <Trash2 size={12} />
            Delete Wall
          </button>
        </div>
      </div>
    );
  }

  // ── Opening Properties ──
  if (selection.type === 'opening') {
    const opening = plan.openings.find((o) => o.id === selection.id);
    if (!opening) return null;

    const wall = plan.walls.find((w) => w.id === opening.wallId);

    return (
      <div className="glass-panel absolute right-3 top-14 z-40 w-60 rounded-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
            {opening.type === 'door' ? 'Door' : 'Window'}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800" aria-label="Close">
            <X size={14} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="prop-label">Width (mm)</label>
            <input
              type="number"
              className="prop-input"
              value={opening.width}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!Number.isFinite(val)) return;
                if (wall) {
                  const maxW = wallLength(wall);
                  // Allow free typing (e.g. 9 -> 90 -> 900) without snapping back to 300.
                  // Keep a tiny lower bound only to avoid degenerate geometry while typing.
                  const newW = Math.min(maxW, Math.max(1, val));
                  const currentEdgeDist = opening.distanceFromP1 - opening.width / 2;
                  const newCenterDist = currentEdgeDist + newW / 2;
                  const clampedCenterDist = clampOpeningPosition(wall, { width: newW, distanceFromP1: newCenterDist });
                  updateOpening(opening.id, { width: newW, distanceFromP1: clampedCenterDist });
                } else {
                  updateOpening(opening.id, { width: Math.max(1, val) });
                }
              }}
              onFocus={(e) => e.currentTarget.select()}
              step={10}
              min={300}
              max={3000}
            />
          </div>

          <div>
            <label className="prop-label">Distance from P1 (to edge)</label>
            <input
              type="number"
              className="prop-input"
              value={Math.round(opening.distanceFromP1 - opening.width / 2)}
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                if (wall) {
                  const wallLen = wallLength(wall);
                  const clampedEdgeDist = Math.max(0, Math.min(wallLen - opening.width, val));
                  const newCenterDist = clampedEdgeDist + opening.width / 2;
                  updateOpening(opening.id, { distanceFromP1: newCenterDist });
                } else {
                  updateOpening(opening.id, { distanceFromP1: val + opening.width / 2 });
                }
              }}
              step={50}
              min={0}
            />
          </div>

          <div>
            <label className="prop-label">Height (mm)</label>
            <input
              type="number"
              className="prop-input"
              value={opening.height}
              onChange={(e) => {
                const val = Number(e.target.value) || opening.height;
                updateOpening(opening.id, { height: Math.max(300, val) });
              }}
              step={50}
              min={300}
            />
          </div>

          {opening.type === 'window' && (
            <>
              <div>
                <label className="prop-label">Sill Height</label>
                <input
                  type="number"
                  className="prop-input"
                  value={opening.zOffset}
                  onChange={(e) => updateOpening(opening.id, { zOffset: Number(e.target.value) || 0 })}
                  step={50}
                  min={0}
                />
              </div>
            </>
          )}

          {opening.type === 'door' && (
            <div>
              <label className="prop-label">Hinge Side</label>
              <div className="flex gap-1 mt-1">
                <button
                  onClick={() => updateOpening(opening.id, { hingeSide: 'p1' })}
                  className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    (opening.hingeSide ?? 'p1') === 'p1'
                      ? 'bg-blue-600/30 text-blue-300 ring-1 ring-blue-500/40'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  P1 Side
                </button>
                <button
                  onClick={() => updateOpening(opening.id, { hingeSide: 'p2' })}
                  className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    opening.hingeSide === 'p2'
                      ? 'bg-blue-600/30 text-blue-300 ring-1 ring-blue-500/40'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  P2 Side
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => updateOpening(opening.id, { flipDirection: !opening.flipDirection })}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <FlipHorizontal2 size={12} />
            Flip Swing Direction
          </button>

          <button
            onClick={() => {
              if (!wall) return;

              const offset = opening.width + 200;
              let newDist = clampOpeningPosition(wall, {
                width: opening.width,
                distanceFromP1: opening.distanceFromP1 + offset,
              });

              // If the first choice overlaps, try the opposite side.
              if (hasOverlappingOpenings(wall, plan.openings, { width: opening.width, distanceFromP1: newDist })) {
                newDist = clampOpeningPosition(wall, {
                  width: opening.width,
                  distanceFromP1: opening.distanceFromP1 - offset,
                });
              }

              // If still overlapping, scan wall for first available slot.
              if (hasOverlappingOpenings(wall, plan.openings, { width: opening.width, distanceFromP1: newDist })) {
                const minCenter = opening.width / 2;
                const maxCenter = wallLength(wall) - opening.width / 2;
                let found: number | null = null;
                for (let d = minCenter; d <= maxCenter; d += 50) {
                  if (!hasOverlappingOpenings(wall, plan.openings, { width: opening.width, distanceFromP1: d })) {
                    found = d;
                    break;
                  }
                }

                if (found === null) {
                  alert('No free space on this wall to duplicate this opening.');
                  return;
                }
                newDist = found;
              }

              addOpening({
                wallId: opening.wallId,
                type: opening.type,
                distanceFromP1: newDist,
                width: opening.width,
                height: opening.height,
                zOffset: opening.zOffset,
                flipDirection: opening.flipDirection,
                hingeSide: opening.hingeSide,
              });
            }}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Copy size={12} />
            Duplicate {opening.type === 'door' ? 'Door' : 'Window'}
          </button>

          <button
            onClick={deleteSelected}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-900/20 text-red-400 text-xs font-medium hover:bg-red-900/40 transition-colors"
          >
            <Trash2 size={12} />
            Delete {opening.type === 'door' ? 'Door' : 'Window'}
          </button>
        </div>
      </div>
    );
  }

  // ── Fixture Properties ──
  if (selection.type === 'fixture') {
    const fixture = plan.fixtures.find((f) => f.id === selection.id);
    if (!fixture) return null;

    const def = getFixtureDefinition(fixture.type);

    return (
      <div className="glass-panel absolute right-3 top-14 z-40 w-60 rounded-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Fixture</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800" aria-label="Close">
            <X size={14} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="prop-label">Type</label>
            <div className="text-sm text-slate-900 font-medium">{def?.label ?? fixture.type}</div>
            {def && (
              <div className="text-[10px] text-slate-500 mt-0.5">
                Default {def.width}×{def.depth} mm
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="prop-label">Width</label>
              <input
                type="number"
                className="prop-input"
                value={Math.round(fixture.width ?? def?.width ?? 0)}
                onChange={(e) => {
                  const fallback = fixture.width ?? def?.width ?? 300;
                  updateFixture(fixture.id, { width: Math.max(50, Number(e.target.value) || fallback) });
                }}
                step={10}
                min={50}
              />
            </div>
            <div>
              <label className="prop-label">Depth</label>
              <input
                type="number"
                className="prop-input"
                value={Math.round(fixture.depth ?? def?.depth ?? 0)}
                onChange={(e) => {
                  const fallback = fixture.depth ?? def?.depth ?? 300;
                  updateFixture(fixture.id, { depth: Math.max(50, Number(e.target.value) || fallback) });
                }}
                step={10}
                min={50}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="prop-label">X</label>
              <input
                type="number"
                className="prop-input"
                value={Math.round(fixture.x)}
                onChange={(e) => updateFixture(fixture.id, { x: Number(e.target.value) || fixture.x })}
                step={50}
              />
            </div>
            <div>
              <label className="prop-label">Y</label>
              <input
                type="number"
                className="prop-input"
                value={Math.round(fixture.y)}
                onChange={(e) => updateFixture(fixture.id, { y: Number(e.target.value) || fixture.y })}
                step={50}
              />
            </div>
          </div>

          <div>
            <label className="prop-label">Rotation</label>
            <div className="flex gap-1 mt-1">
              {[0, 90, 180, 270].map((deg) => (
                <button
                  key={deg}
                  onClick={() => updateFixture(fixture.id, { rotation: deg })}
                  className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    fixture.rotation === deg
                      ? 'bg-blue-600/30 text-blue-300 ring-1 ring-blue-500/40'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="range"
                min="0"
                max="360"
                value={Math.round(fixture.rotation)}
                onChange={(e) => updateFixture(fixture.id, { rotation: Number(e.target.value) })}
                className="flex-1 accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="360"
                value={Math.round(fixture.rotation)}
                onChange={(e) => {
                  let val = Number(e.target.value) || 0;
                  val = ((val % 360) + 360) % 360;
                  updateFixture(fixture.id, { rotation: val });
                }}
                className="w-16 prop-input text-center font-mono"
              />
            </div>
          </div>

          <button
            onClick={() => updateFixture(fixture.id, { rotation: (fixture.rotation + 90) % 360 })}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <RotateCw size={12} />
            Rotate 90°
          </button>

          <button
            onClick={() => {
              const offset = 200;
              addFixture({
                type: fixture.type,
                x: fixture.x + offset,
                y: fixture.y + offset,
                rotation: fixture.rotation,
                width: fixture.width,
                depth: fixture.depth,
                showClearance: fixture.showClearance,
              });
            }}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Copy size={12} />
            Duplicate Fixture
          </button>

          <button
            onClick={deleteSelected}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-900/20 text-red-400 text-xs font-medium hover:bg-red-900/40 transition-colors"
          >
            <Trash2 size={12} />
            Delete Fixture
          </button>
        </div>
      </div>
    );
  }

  // ── Measurement Properties ──
  if (selection.type === 'measurement') {
    const measurement = plan.measurements?.find((m) => m.id === selection.id);
    if (!measurement) return null;

    const len = distance(measurement.p1, measurement.p2);

    return (
      <div className="glass-panel absolute right-3 top-14 z-40 w-60 rounded-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Measurement</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800" aria-label="Close">
            <X size={14} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="prop-label">Distance</label>
            <div className="prop-input bg-slate-50 border border-slate-200 font-mono text-slate-700">
              {Math.round(len)} mm
            </div>
          </div>

          <button
            onClick={deleteSelected}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-900/20 text-red-400 text-xs font-medium hover:bg-red-900/40 transition-colors"
          >
            <Trash2 size={12} />
            Delete Measurement
          </button>
        </div>
      </div>
    );
  }

  // ── Text Properties ──
  if (selection.type === 'text') {
    const textBox = plan.texts?.find((t) => t.id === selection.id);
    if (!textBox) return null;

    return (
      <div className="glass-panel absolute right-3 top-14 z-40 w-60 rounded-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Text</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800" aria-label="Close">
            <X size={14} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="prop-label">Text Content</label>
            <textarea
              className="prop-input h-16 resize-none mt-1 text-slate-900"
              value={textBox.text}
              onChange={(e) => updateTextBox(textBox.id, { text: e.target.value })}
              placeholder="Enter text..."
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="prop-label">Size</label>
              <select
                className="prop-input mt-1"
                value={textBox.fontSize}
                onChange={(e) => updateTextBox(textBox.id, { fontSize: Number(e.target.value) })}
              >
                <option value={12}>Small (12pt)</option>
                <option value={16}>Medium-Small (16pt)</option>
                <option value={20}>Medium (20pt)</option>
                <option value={24}>Large (24pt)</option>
                <option value={32}>Extra Large (32pt)</option>
                <option value={48}>Double Extra Large (48pt)</option>
                <option value={64}>Gigantic (64pt)</option>
              </select>
            </div>

            <div>
              <label className="prop-label">Style</label>
              <div className="flex gap-1 mt-1 h-[34px]">
                <button
                  onClick={() => updateTextBox(textBox.id, { isBold: !textBox.isBold })}
                  className={`flex-1 flex items-center justify-center rounded-md border transition-colors ${
                    textBox.isBold
                      ? 'bg-blue-600/30 text-blue-300 ring-1 ring-blue-500/40 border-transparent'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                  title="Bold"
                >
                  <Bold size={14} />
                </button>
                <button
                  onClick={() => updateTextBox(textBox.id, { isItalic: !textBox.isItalic })}
                  className={`flex-1 flex items-center justify-center rounded-md border transition-colors ${
                    textBox.isItalic
                      ? 'bg-blue-600/30 text-blue-300 ring-1 ring-blue-500/40 border-transparent'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                  title="Italic"
                >
                  <Italic size={14} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="prop-label">Text Color</label>
            <div className="grid grid-cols-4 gap-1.5 mt-1.5">
              {[
                { name: 'Dark', hex: '#0f172a' },
                { name: 'Blue', hex: '#2563eb' },
                { name: 'Red', hex: '#dc2626' },
                { name: 'Orange', hex: '#ea580c' },
                { name: 'Green', hex: '#16a34a' },
                { name: 'Purple', hex: '#7c3aed' },
                { name: 'Gray', hex: '#64748b' },
                { name: 'White', hex: '#ffffff' },
              ].map((c) => (
                <button
                  key={c.name}
                  onClick={() => updateTextBox(textBox.id, { color: c.hex })}
                  className={`h-7 rounded-lg border transition-all text-[10px] font-medium flex items-center justify-center ${
                    textBox.color === c.hex
                      ? 'ring-2 ring-blue-500 border-transparent text-slate-800 scale-105'
                      : 'border-slate-300 hover:scale-102 text-slate-600 bg-white'
                  }`}
                  title={c.name}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-slate-300"
                    style={{ backgroundColor: c.hex }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="prop-label">X Coordinate</label>
              <input
                type="number"
                className="prop-input mt-1"
                value={Math.round(textBox.x)}
                onChange={(e) => updateTextBox(textBox.id, { x: Number(e.target.value) || textBox.x })}
                step={50}
              />
            </div>
            <div>
              <label className="prop-label">Y Coordinate</label>
              <input
                type="number"
                className="prop-input mt-1"
                value={Math.round(textBox.y)}
                onChange={(e) => updateTextBox(textBox.id, { y: Number(e.target.value) || textBox.y })}
                step={50}
              />
            </div>
          </div>

          <button
            onClick={deleteSelected}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-900/20 text-red-400 text-xs font-medium hover:bg-red-900/40 transition-colors"
          >
            <Trash2 size={12} />
            Delete Text
          </button>
        </div>
      </div>
    );
  }

  return null;
}
