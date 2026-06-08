'use client';

import { useMemo } from 'react';
import { usePlanStore } from '@/store/usePlanStore';
import { computeMaterialTakeoff } from '@/utils/takeoff';
import { X, Ruler, Square, CircleDot, DoorOpen, Armchair, Hammer, Printer } from 'lucide-react';
import { exportTakeoffPDF } from '@/utils/exportHelpers';
import { getOpeningLabel } from '@/utils/openingHelpers';

interface TakeoffPanelProps {
  onClose: () => void;
}

export function TakeoffPanel({ onClose }: TakeoffPanelProps) {
  const plan = usePlanStore((s) => s.plan);

  const takeoff = useMemo(() => computeMaterialTakeoff(plan), [plan]);

  return (
    <div className="glass-panel absolute right-3 top-14 z-40 w-72 rounded-2xl overflow-hidden animate-fade-in flex flex-col max-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
        <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
          Material Takeoff Sheet
        </h3>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportTakeoffPDF(plan)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title="Export PDF / Print Takeoff"
            aria-label="Export PDF"
          >
            <Printer size={14} />
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto flex-1">
        {/* Floor Area */}
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
          <Square size={16} className="text-emerald-600 shrink-0" />
          <div className="flex-1">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total Floor Area</div>
            <div className="text-lg font-bold text-emerald-600">
              {takeoff.isFloorAreaOpen ? (
                <span className="text-xs font-semibold text-slate-400">0.00 m² (Open layout)</span>
              ) : (
                <>
                  {takeoff.totalFloorArea.toFixed(2)} <span className="text-xs font-normal text-slate-500">m²</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Wall Surface Area */}
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <Ruler size={16} className="text-blue-400 shrink-0" />
          <div className="flex-1">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Wall Surface Area</div>
            <div className="text-lg font-bold text-blue-400">
              {takeoff.totalWallSurfaceArea.toFixed(2)} <span className="text-xs font-normal text-slate-500">m²</span>
            </div>
          </div>
        </div>

        {/* Base Perimeter */}
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
          <CircleDot size={16} className="text-amber-400 shrink-0" />
          <div className="flex-1">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Base Perimeter</div>
            <div className="text-lg font-bold text-amber-400">
              {takeoff.totalBasePerimeter.toFixed(2)} <span className="text-xs font-normal text-slate-500">lin. m</span>
            </div>
            <div className="text-[10px] text-slate-600 mt-0.5">Total wall footprint perimeter</div>
          </div>
        </div>

        {/* Counts */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-slate-800/30">
            <div className="text-sm font-bold text-slate-300">{takeoff.wallCount}</div>
            <div className="text-[9px] text-slate-500 uppercase">Walls</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-800/30">
            <DoorOpen size={12} className="mx-auto text-slate-400 mb-0.5" />
            <div className="text-sm font-bold text-slate-300">{takeoff.openingCount}</div>
            <div className="text-[9px] text-slate-500 uppercase">Openings</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-800/30">
            <Armchair size={12} className="mx-auto text-slate-400 mb-0.5" />
            <div className="text-sm font-bold text-slate-300">{takeoff.fixtureCount}</div>
            <div className="text-[9px] text-slate-500 uppercase">Fixtures</div>
          </div>
        </div>

        {/* Drylining & Insulation Section */}
        <div className="border-t border-slate-200/60 pt-3 mt-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <Square size={12} className="text-slate-400" />
            Drylining & Insulation
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/10 border border-slate-200/60 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Plasterboard Area:</span>
              <span className="font-semibold text-slate-800">{(takeoff.plasterboardArea || 0).toFixed(1)} m²</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="p-1.5 bg-slate-100 rounded text-center">
                <div className="text-[9px] text-slate-500 uppercase">2.4m × 1.2m sheets</div>
                <div className="text-sm font-bold text-slate-700">{takeoff.plasterboardSheets2400 || 0}</div>
              </div>
              <div className="p-1.5 bg-slate-100 rounded text-center">
                <div className="text-[9px] text-slate-500 uppercase">1.8m × 0.9m sheets</div>
                <div className="text-sm font-bold text-slate-700">{takeoff.plasterboardSheets1800 || 0}</div>
              </div>
            </div>
            {takeoff.insulationArea && takeoff.insulationArea > 0 ? (
              <div className="flex justify-between items-center text-slate-600 border-t border-slate-200/40 pt-1.5 mt-1.5">
                <span>Insulated Frame Area:</span>
                <span className="font-semibold text-slate-800">{takeoff.insulationArea.toFixed(1)} m²</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Trims & Finishes Section */}
        <div className="border-t border-slate-200/60 pt-3 mt-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <Ruler size={12} className="text-slate-400" />
            Trims & Finishes
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/10 border border-slate-200/60 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Skirting boards:</span>
              <span className="font-semibold text-slate-800">{(takeoff.skirtingMeters || 0).toFixed(1)} m</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 pl-2">
              <span>Requires (4.2m standard):</span>
              <span className="font-medium text-slate-700">{takeoff.skirtingBoardsCount || 0} boards</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 border-t border-slate-200/40 pt-1.5 mt-1.5">
              <span>Door Architraves:</span>
              <span className="font-semibold text-slate-800">{(takeoff.architraveMeters || 0).toFixed(1)} m</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 pl-2">
              <span>Requires (2.4m single):</span>
              <span className="font-medium text-slate-700">{takeoff.architraveBoardsCount || 0} lengths</span>
            </div>
          </div>
        </div>

        {/* Timber Takeoff Section */}
        {takeoff.timberTakeoff && takeoff.timberTakeoff.length > 0 && (
          <div className="border-t border-slate-200/60 pt-3 mt-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <Hammer size={12} className="text-slate-400" />
              Structural Timber Takeoff
            </div>
            <div className="space-y-2">
              {takeoff.timberTakeoff.map((item, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-800/10 border border-slate-200/60 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{item.dimensions}</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-600/10 text-[9px] text-blue-600 font-bold border border-blue-600/20 uppercase">
                      {item.grade}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Total: <span className="font-semibold text-slate-700">{item.linearMeters.toFixed(1)} lin. m</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.boardCounts.map((bc, bIdx) => (
                      <span
                        key={bIdx}
                        className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] text-slate-600 font-mono border border-slate-200"
                      >
                        {bc.count}x {bc.length.toFixed(1)}m
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opening Schedule Section */}
        {plan.openings.length > 0 && (
          <div className="border-t border-slate-200/60 pt-3 mt-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <DoorOpen size={12} className="text-slate-400" />
              Opening Schedule
            </div>
            <div className="space-y-1.5">
              {plan.openings
                .map((op) => {
                  const wall = plan.walls.find((w) => w.id === op.wallId);
                  const wallType = wall ? (wall.wallType === 'external' ? 'Ext' : 'Int') : '';
                  return { op, wallType };
                })
                .map(({ op, wallType }) => (
                  <div key={op.id} className="p-2 rounded bg-slate-100 flex flex-col gap-0.5 text-[11px] border border-slate-200/40">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">
                        {getOpeningLabel(op, plan.openings)} - {op.type === 'door' ? 'Door' : 'Window'}
                      </span>
                      <span className="text-[9px] px-1 rounded bg-slate-200 text-slate-600 font-medium">
                        {wallType} Wall
                      </span>
                    </div>
                    <div className="text-slate-500 flex justify-between">
                      <span>{op.width} × {op.height} mm</span>
                      {op.type === 'window' && (
                        <span>Sill: {op.zOffset}mm</span>
                      )}
                    </div>
                    {op.specification && (
                      <div className="text-[10px] text-blue-600 italic mt-0.5 border-t border-slate-200/60 pt-0.5 font-medium">
                        Spec: {op.specification}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
