'use client';

import { useMemo } from 'react';
import { usePlanStore } from '@/store/usePlanStore';
import { computeMaterialTakeoff } from '@/utils/takeoff';
import { X, Ruler, Square, CircleDot, DoorOpen, Armchair, Hammer, Printer, Calculator } from 'lucide-react';
import { exportTakeoffPDF } from '@/utils/exportHelpers';
import { getOpeningLabel } from '@/utils/openingHelpers';

interface TakeoffPanelProps {
  onClose: () => void;
}

export function TakeoffPanel({ onClose }: TakeoffPanelProps) {
  const plan = usePlanStore((s) => s.plan);

  const takeoff = useMemo(() => computeMaterialTakeoff(plan), [plan]);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-panel w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-zoom-in bg-white/95 border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="text-blue-500" size={16} />
              Material Takeoff & Estimating Dashboard
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Project: {plan.name || 'Untitled Plan'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportTakeoffPDF(plan)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950 transition-colors shadow-2xs"
              title="Export PDF / Print Takeoff"
              aria-label="Export PDF"
            >
              <Printer size={13} />
              Print PDF Takeoff
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Dashboard Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Top Row: Core Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Floor Area */}
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Square size={20} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Floor Area</div>
                <div className="text-lg font-black text-emerald-600">
                  {takeoff.isFloorAreaOpen ? (
                    <span className="text-xs font-semibold text-slate-400">Open layout</span>
                  ) : (
                    <>{takeoff.totalFloorArea.toFixed(2)} <span className="text-xs font-normal text-slate-500">m²</span></>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Wall Surface Area */}
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Ruler size={20} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Wall Surface Area</div>
                <div className="text-lg font-black text-blue-600">
                  {takeoff.totalWallSurfaceArea.toFixed(2)} <span className="text-xs font-normal text-slate-500">m²</span>
                </div>
              </div>
            </div>

            {/* Card 3: Base Perimeter */}
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <CircleDot size={20} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base Perimeter</div>
                <div className="text-lg font-black text-amber-500">
                  {takeoff.totalBasePerimeter.toFixed(2)} <span className="text-xs font-normal text-slate-500">lin. m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Counts Stats Bar */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/50">
            <div className="text-center">
              <div className="text-md font-black text-slate-800">{takeoff.wallCount}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Wall Segments</div>
            </div>
            <div className="text-center border-x border-slate-200/80">
              <div className="text-md font-black text-slate-800">{takeoff.openingCount}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Doors / Windows</div>
            </div>
            <div className="text-center">
              <div className="text-md font-black text-slate-800">{takeoff.fixtureCount}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Placed Fixtures</div>
            </div>
          </div>

          {/* Main Grid: Drylining, Trims, Timber, Openings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Finishes & Trims */}
            <div className="space-y-6">
              {/* Drylining & Insulation */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-4 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Square size={14} className="text-slate-450" />
                  Drylining & Insulation
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-slate-650 py-1.5 border-b border-slate-100">
                    <span>Plasterboard Surface Area:</span>
                    <span className="font-bold text-slate-800">{(takeoff.plasterboardArea || 0).toFixed(1)} m²</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">2.4m × 1.2m sheets</div>
                      <div className="text-md font-black text-slate-750 mt-1">{takeoff.plasterboardSheets2400 || 0}</div>
                      <div className="text-[8px] text-slate-400 mt-0.5">Est. with 10% waste</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">1.8m × 0.9m sheets</div>
                      <div className="text-md font-black text-slate-750 mt-1">{takeoff.plasterboardSheets1800 || 0}</div>
                      <div className="text-[8px] text-slate-400 mt-0.5">Est. with 10% waste</div>
                    </div>
                  </div>
                  {takeoff.insulationArea && takeoff.insulationArea > 0 ? (
                    <div className="flex justify-between items-center text-slate-650 py-2 border-t border-slate-100 mt-2">
                      <span>Insulated Frame Area:</span>
                      <span className="font-bold text-slate-800">{takeoff.insulationArea.toFixed(1)} m²</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Trims & Finishes */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-4 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Ruler size={14} className="text-slate-455" />
                  Trims & Woodwork Finishes
                </h4>
                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-slate-650">
                      <span>Skirting Board Runs:</span>
                      <span className="font-bold text-slate-800">{(takeoff.skirtingMeters || 0).toFixed(1)} m</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 pl-3">
                      <span>Requires (4.2m standard boards):</span>
                      <span className="font-semibold text-slate-650">{takeoff.skirtingBoardsCount || 0} boards</span>
                    </div>
                  </div>
                  <div className="space-y-1 pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center text-slate-650">
                      <span>Door Architraves (Both sides):</span>
                      <span className="font-bold text-slate-800">{(takeoff.architraveMeters || 0).toFixed(1)} m</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 pl-3">
                      <span>Requires (2.4m single lengths):</span>
                      <span className="font-semibold text-slate-650">{takeoff.architraveBoardsCount || 0} lengths</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Timber Framing & Openings */}
            <div className="space-y-6">
              {/* Structural Timber Takeoff */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-4 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Hammer size={14} className="text-slate-450" />
                  Structural Timber Framing
                </h4>
                {takeoff.timberTakeoff && takeoff.timberTakeoff.length > 0 ? (
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {takeoff.timberTakeoff.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-150 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>{item.dimensions}</span>
                          <span className="px-2 py-0.5 rounded bg-blue-600/10 text-[9px] text-blue-600 font-bold border border-blue-600/20 uppercase">
                            {item.grade}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Total Linear Run: <span className="font-bold text-slate-700">{item.linearMeters.toFixed(1)} lin. m</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.boardCounts.map((bc, bIdx) => (
                            <span
                              key={bIdx}
                              className="px-2 py-0.5 rounded bg-white text-[9px] text-slate-600 font-mono border border-slate-200 shadow-2xs"
                            >
                              {bc.count}x {bc.length.toFixed(1)}m
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 py-4 text-center">No framed walls enabled in plan.</p>
                )}
              </div>

              {/* Opening Schedule */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-4 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <DoorOpen size={14} className="text-slate-450" />
                  Opening Schedule
                </h4>
                {plan.openings.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {plan.openings
                      .map((op) => {
                        const wall = plan.walls.find((w) => w.id === op.wallId);
                        const wallType = wall ? (wall.wallType === 'external' ? 'Ext' : 'Int') : '';
                        return { op, wallType };
                      })
                      .map(({ op, wallType }) => (
                        <div key={op.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-150 flex flex-col gap-1 text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-750">
                              {getOpeningLabel(op, plan.openings)} — {op.type === 'door' ? 'Door' : 'Window'}
                            </span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-semibold uppercase">
                              {wallType}
                            </span>
                          </div>
                          <div className="text-slate-500 flex justify-between">
                            <span>Dimensions: <strong className="text-slate-650">{op.width} × {op.height} mm</strong></span>
                            {op.type === 'window' && (
                              <span>Sill Height: <strong className="text-slate-650">{op.zOffset} mm</strong></span>
                            )}
                          </div>
                          {op.specification && (
                            <div className="text-[10px] text-blue-600 italic font-medium mt-1 pt-1 border-t border-slate-200/60">
                              Spec: {op.specification}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 py-4 text-center">No doors or windows placed.</p>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
