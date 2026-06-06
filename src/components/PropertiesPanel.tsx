'use client';

import { usePlanStore } from '@/store/usePlanStore';
import { wallLength, wallAngleDeg, formatMM, wallDirection } from '@/utils/geometry';
import { clampOpeningPosition } from '@/utils/openingHelpers';
import { getFixtureDefinition } from '@/data/fixtures';
import { X, RotateCw, FlipHorizontal2, Trash2 } from 'lucide-react';

interface PropertiesPanelProps {
  onClose: () => void;
}

export function PropertiesPanel({ onClose }: PropertiesPanelProps) {
  const selection = usePlanStore((s) => s.selection);
  const plan = usePlanStore((s) => s.plan);
  const updateWall = usePlanStore((s) => s.updateWall);
  const updateOpening = usePlanStore((s) => s.updateOpening);
  const updateFixture = usePlanStore((s) => s.updateFixture);
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
                
                // Clamp child openings
                const wallOpenings = plan.openings.filter((o) => o.wallId === wall.id);
                for (const op of wallOpenings) {
                  const updatedWall = { ...wall, p2 };
                  const clampedDist = clampOpeningPosition(updatedWall, op);
                  if (clampedDist !== op.distanceFromP1) {
                    updateOpening(op.id, { distanceFromP1: clampedDist });
                  }
                }
              }}
              step={100}
              min={100}
            />
          </div>

          <div>
            <label className="prop-label">Angle</label>
            <div className="text-sm text-slate-900 font-medium">{angle.toFixed(1)}°</div>
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
            <div className="text-sm text-slate-900 font-medium">{formatMM(wall.thickness)}</div>
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

          <button
            onClick={deleteSelected}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-900/20 text-red-400 text-xs font-medium hover:bg-red-900/40 transition-colors"
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
            <label className="prop-label">Width</label>
            <input
              type="number"
              className="prop-input"
              value={opening.width}
              onChange={(e) => {
                const val = Number(e.target.value) || opening.width;
                if (wall) {
                  const maxW = wallLength(wall);
                  const newW = Math.min(maxW, Math.max(300, val));
                  const currentEdgeDist = opening.distanceFromP1 - opening.width / 2;
                  const newCenterDist = currentEdgeDist + newW / 2;
                  const clampedCenterDist = clampOpeningPosition(wall, { width: newW, distanceFromP1: newCenterDist });
                  updateOpening(opening.id, { width: newW, distanceFromP1: clampedCenterDist });
                } else {
                  updateOpening(opening.id, { width: val });
                }
              }}
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

          {opening.type === 'window' && (
            <>
              <div>
                <label className="prop-label">Height</label>
                <input
                  type="number"
                  className="prop-input"
                  value={opening.height}
                  onChange={(e) => updateOpening(opening.id, { height: Number(e.target.value) || opening.height })}
                  step={50}
                  min={300}
                />
              </div>
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
                {def.width}×{def.depth} mm
              </div>
            )}
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
          </div>

          <button
            onClick={() => updateFixture(fixture.id, { rotation: (fixture.rotation + 90) % 360 })}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <RotateCw size={12} />
            Rotate 90°
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

  return null;
}
