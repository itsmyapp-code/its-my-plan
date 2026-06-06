'use client';

import { usePlanStore } from '@/store/usePlanStore';
import { DEFAULT_PRINT_SCALE } from '@/constants';
import { X } from 'lucide-react';

interface PlanSettingsModalProps {
  onClose: () => void;
}

export function PlanSettingsModal({ onClose }: PlanSettingsModalProps) {
  const plan = usePlanStore((s) => s.plan);
  const renamePlan = usePlanStore((s) => s.renamePlan);
  const updateMetadata = usePlanStore((s) => s.updateMetadata);
  const meta = plan.metadata;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/30">
          <h2 className="text-sm font-semibold text-slate-200">Plan Settings</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="prop-label">Plan Name</label>
            <input
              type="text"
              className="prop-input"
              value={plan.name}
              onChange={(e) => renamePlan(e.target.value)}
            />
          </div>

          <div>
            <label className="prop-label">Job Number</label>
            <input
              type="text"
              className="prop-input"
              value={meta.jobNumber}
              onChange={(e) => updateMetadata({ jobNumber: e.target.value })}
              placeholder="e.g. JOB-2026-001"
            />
          </div>

          <div>
            <label className="prop-label">Client Name</label>
            <input
              type="text"
              className="prop-input"
              value={meta.clientName ?? ''}
              onChange={(e) => updateMetadata({ clientName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="prop-label">Version</label>
              <input
                type="text"
                className="prop-input"
                value={meta.version}
                onChange={(e) => updateMetadata({ version: e.target.value })}
                placeholder="1.0"
              />
            </div>
            <div>
              <label className="prop-label">Scale</label>
              <select
                className="prop-input"
                value={meta.scale}
                onChange={(e) => updateMetadata({ scale: e.target.value })}
              >
                <option value="1:20">1:20</option>
                <option value="1:50">1:50</option>
                <option value="1:100">1:100</option>
                <option value="1:200">1:200</option>
              </select>
            </div>
          </div>

          <div>
            <label className="prop-label">Operator</label>
            <input
              type="text"
              className="prop-input"
              value={meta.operator}
              onChange={(e) => updateMetadata({ operator: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <p className="text-[10px] text-slate-500">
            Job details appear on PDF exports and the title block. Scale {meta.scale || DEFAULT_PRINT_SCALE} applies to 2D blueprint prints.
          </p>
        </div>

        <div className="px-6 py-4 border-t border-slate-700/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
