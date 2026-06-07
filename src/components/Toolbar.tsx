'use client';

import {
  MousePointer2,
  Pencil,
  Hand,
  ZoomIn,
  ZoomOut,
  Trash2,
  Undo2,
  Redo2,
  Box,
  RotateCcw,
  DoorOpen,
  AppWindow,
  Armchair,
  Ruler,
  Eye,
  EyeOff,
  ArrowLeftRight,
  Zap,
  Droplets,
} from 'lucide-react';
import { useToolStore } from '@/store/useToolStore';
import { usePlanStore } from '@/store/usePlanStore';
import { useUIStore } from '@/store/useUIStore';
import type { ToolMode } from '@/types';

interface ToolButton {
  id: ToolMode | string;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
  action?: () => void;
}

export function Toolbar() {
  const { activeTool, setTool } = useToolStore();
  const { deleteSelected, undo, redo, canUndo, canRedo, selection } = usePlanStore();
  const {
    zoomIn, zoomOut, resetViewport,
    viewMode, toggleViewMode,
    showFixturePalette, toggleFixturePalette,
    showTakeoffPanel, toggleTakeoffPanel,
    viewSettings, toggleClearanceZones,
    toggleElectricalLayer, togglePlumbingLayer,
  } = useUIStore();

  const tools: ToolButton[] = [
    { id: 'select', label: 'Select', shortcut: 'V', icon: <MousePointer2 size={18} /> },
    { id: 'draw-wall', label: 'Draw Wall', shortcut: 'W', icon: <Pencil size={18} /> },
    { id: 'place-opening-door', label: 'Place Door', shortcut: 'D', icon: <DoorOpen size={18} /> },
    { id: 'place-opening-window', label: 'Place Window', shortcut: 'N', icon: <AppWindow size={18} /> },
    { id: 'pan', label: 'Pan', shortcut: 'H', icon: <Hand size={18} /> },
    { id: 'measure', label: 'Measure', shortcut: 'M', icon: <ArrowLeftRight size={18} /> },
  ];

  const actions: ToolButton[] = [
    { id: 'undo', label: 'Undo', shortcut: '⌘Z', icon: <Undo2 size={18} />, action: undo },
    { id: 'redo', label: 'Redo', shortcut: '⌘⇧Z', icon: <Redo2 size={18} />, action: redo },
    { id: 'zoom-in', label: 'Zoom In', shortcut: '+', icon: <ZoomIn size={18} />, action: zoomIn },
    { id: 'zoom-out', label: 'Zoom Out', shortcut: '-', icon: <ZoomOut size={18} />, action: zoomOut },
    { id: 'reset-view', label: 'Reset View', shortcut: '0', icon: <RotateCcw size={18} />, action: resetViewport },
  ];

  return (
    <div className="glass-panel absolute left-3 top-1/2 -translate-y-1/2 z-30 rounded-2xl p-1.5 grid grid-cols-2 sm:flex sm:flex-col gap-1 animate-fade-in max-h-[85vh] overflow-y-auto sm:overflow-visible">
      {/* Tool modes */}
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
          onClick={() => setTool(tool.id as ToolMode)}
          title={`${tool.label} (${tool.shortcut})`}
          aria-label={tool.label}
        >
          {tool.icon}
        </button>
      ))}

      {/* Divider */}
      <div className="col-span-2 w-full h-px bg-slate-200/60 my-0.5 sm:col-auto sm:w-6 sm:h-px sm:bg-slate-200 sm:mx-auto sm:my-1" />

      {/* Fixture palette toggle */}
      <button
        className={`tool-btn ${showFixturePalette ? 'active' : ''}`}
        onClick={toggleFixturePalette}
        title="UK Fixture Library (F)"
        aria-label="UK Fixture Library"
      >
        <Armchair size={18} />
      </button>

      {/* Takeoff panel toggle */}
      <button
        className={`tool-btn ${showTakeoffPanel ? 'active' : ''}`}
        onClick={toggleTakeoffPanel}
        title="Material Takeoff (T)"
        aria-label="Material Takeoff"
      >
        <Ruler size={18} />
      </button>

      {/* Clearance zones toggle */}
      <button
        className={`tool-btn ${viewSettings.showClearanceZones ? 'active' : ''}`}
        onClick={toggleClearanceZones}
        title="Toggle Clearance Zones (C)"
        aria-label="Toggle Clearance Zones"
      >
        {viewSettings.showClearanceZones ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>

      {/* Electrical layer toggle */}
      <button
        className={`tool-btn ${viewSettings.showElectricalLayer ? 'active' : ''}`}
        onClick={toggleElectricalLayer}
        title="Toggle Electrical Layer (E)"
        aria-label="Toggle Electrical Layer"
      >
        <Zap size={18} />
      </button>

      {/* Plumbing layer toggle */}
      <button
        className={`tool-btn ${viewSettings.showPlumbingLayer ? 'active' : ''}`}
        onClick={togglePlumbingLayer}
        title="Toggle Plumbing Layer (P)"
        aria-label="Toggle Plumbing Layer"
      >
        <Droplets size={18} />
      </button>

      {/* Divider */}
      <div className="col-span-2 w-full h-px bg-slate-200/60 my-0.5 sm:col-auto sm:w-6 sm:h-px sm:bg-slate-200 sm:mx-auto sm:my-1" />

      {/* Action buttons */}
      {actions.map((action) => {
        const isDisabled =
          (action.id === 'undo' && !canUndo) ||
          (action.id === 'redo' && !canRedo);

        return (
          <button
            key={action.id}
            className={`tool-btn ${isDisabled ? 'opacity-30 pointer-events-none' : ''}`}
            onClick={action.action}
            title={`${action.label} (${action.shortcut})`}
            aria-label={action.label}
            disabled={isDisabled}
          >
            {action.icon}
          </button>
        );
      })}

      {/* Divider */}
      <div className="col-span-2 w-full h-px bg-slate-200/60 my-0.5 sm:col-auto sm:w-6 sm:h-px sm:bg-slate-200 sm:mx-auto sm:my-1" />

      {/* 3D / 2D toggle */}
      <button
        className={`tool-btn ${viewMode === '3d' ? 'active' : ''}`}
        onClick={toggleViewMode}
        title="Toggle 2D / 3D View"
        aria-label="Toggle 2D / 3D View"
      >
        <Box size={18} />
      </button>

      {/* Delete */}
      {selection.id && (
        <button
          className="tool-btn text-red-500 hover:text-red-600 hover:bg-red-50 col-span-2 sm:col-span-1"
          onClick={deleteSelected}
          title="Delete Selected (Del)"
          aria-label="Delete Selected"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}
