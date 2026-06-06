'use client';

import { useMemo } from 'react';
import { usePlanStore } from '@/store/usePlanStore';
import { computeMaterialTakeoff } from '@/utils/takeoff';
import { X, Ruler, Square, CircleDot, DoorOpen, Armchair } from 'lucide-react';

interface TakeoffPanelProps {
  onClose: () => void;
}

export function TakeoffPanel({ onClose }: TakeoffPanelProps) {
  const plan = usePlanStore((s) => s.plan);

  const takeoff = useMemo(() => computeMaterialTakeoff(plan), [plan]);

  return (
    <div className="glass-panel absolute right-3 bottom-4 z-40 w-72 rounded-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
          Material Takeoff Sheet
        </h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Floor Area */}
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
          <Square size={16} className="text-emerald-600 shrink-0" />
          <div className="flex-1">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total Floor Area</div>
            <div className="text-lg font-bold text-emerald-600">
              {takeoff.totalFloorArea.toFixed(2)} <span className="text-xs font-normal text-slate-500">m²</span>
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
            <div className="text-[10px] text-slate-600 mt-0.5">Skirting board runs</div>
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
      </div>
    </div>
  );
}
