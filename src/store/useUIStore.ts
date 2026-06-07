import { create } from 'zustand';
import type { ViewportState, AppViewSettings } from '@/types';
import { ZOOM_MIN, ZOOM_MAX } from '@/constants';
import { usePlanStore } from '@/store/usePlanStore';

interface UIState {
  // Viewport
  viewport: ViewportState;
  setViewport: (viewport: Partial<ViewportState>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetViewport: () => void;

  // View settings
  viewSettings: AppViewSettings;
  toggleDimensions: () => void;
  toggleClearanceZones: () => void;
  toggleServiceLayers: () => void;
  toggleElectricalLayer: () => void;
  togglePlumbingLayer: () => void;
  setActiveMode: (mode: AppViewSettings['activeMode']) => void;

  // Panels
  showPropertiesPanel: boolean;
  togglePropertiesPanel: () => void;
  showFixturePalette: boolean;
  toggleFixturePalette: () => void;
  showTakeoffPanel: boolean;
  toggleTakeoffPanel: () => void;

  // View mode — 2D or 3D (exclusive, not side-by-side)
  viewMode: '2d' | '3d';
  setViewMode: (mode: '2d' | '3d') => void;
  toggleViewMode: () => void;

  // Legacy alias kept for toolbar compatibility
  show3DPreview: boolean;
  toggle3DPreview: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  viewport: { panX: 0, panY: 0, zoom: 1 },

  setViewport: (updates) => {
    set((state) => ({
      viewport: { ...state.viewport, ...updates },
    }));
  },

  zoomIn: () => {
    set((state) => ({
      viewport: {
        ...state.viewport,
        zoom: Math.min(state.viewport.zoom * 1.2, ZOOM_MAX),
      },
    }));
  },

  zoomOut: () => {
    set((state) => ({
      viewport: {
        ...state.viewport,
        zoom: Math.max(state.viewport.zoom / 1.2, ZOOM_MIN),
      },
    }));
  },

  resetViewport: () => {
    set({ viewport: { panX: 0, panY: 0, zoom: 1 } });
  },

  // View settings
  viewSettings: {
    showDimensions: true,
    showClearanceZones: false,
    showServiceLayers: false,
    showElectricalLayer: true,
    showPlumbingLayer: true,
    activeMode: '2d',
  },

  toggleDimensions: () => {
    set((state) => ({
      viewSettings: { ...state.viewSettings, showDimensions: !state.viewSettings.showDimensions },
    }));
  },

  toggleClearanceZones: () => {
    set((state) => ({
      viewSettings: { ...state.viewSettings, showClearanceZones: !state.viewSettings.showClearanceZones },
    }));
  },

  toggleServiceLayers: () => {
    set((state) => ({
      viewSettings: {
        ...state.viewSettings,
        showServiceLayers: !state.viewSettings.showServiceLayers,
        showElectricalLayer: !state.viewSettings.showServiceLayers,
        showPlumbingLayer: !state.viewSettings.showServiceLayers,
      },
    }));
  },

  toggleElectricalLayer: () => {
    set((state) => {
      const next = !state.viewSettings.showElectricalLayer;
      return {
        viewSettings: {
          ...state.viewSettings,
          showElectricalLayer: next,
          showServiceLayers: next || state.viewSettings.showPlumbingLayer,
        },
      };
    });
  },

  togglePlumbingLayer: () => {
    set((state) => {
      const next = !state.viewSettings.showPlumbingLayer;
      return {
        viewSettings: {
          ...state.viewSettings,
          showPlumbingLayer: next,
          showServiceLayers: state.viewSettings.showElectricalLayer || next,
        },
      };
    });
  },

  setActiveMode: (mode) => {
    set((state) => ({
      viewSettings: { ...state.viewSettings, activeMode: mode },
    }));
  },

  showPropertiesPanel: false,
  togglePropertiesPanel: () => {
    set((state) => ({ showPropertiesPanel: !state.showPropertiesPanel }));
  },

  showFixturePalette: false,
  toggleFixturePalette: () => {
    set((state) => {
      const next = !state.showFixturePalette;
      if (next) {
        usePlanStore.getState().clearSelection();
      }
      return { showFixturePalette: next };
    });
  },

  showTakeoffPanel: false,
  toggleTakeoffPanel: () => {
    set((state) => ({ showTakeoffPanel: !state.showTakeoffPanel }));
  },

  show3DPreview: false,
  toggle3DPreview: () => {
    set((state) => {
      const newMode = state.viewMode === '2d' ? '3d' : '2d';
      return { viewMode: newMode, show3DPreview: newMode === '3d' };
    });
  },

  viewMode: '2d',
  setViewMode: (mode) => {
    set({ viewMode: mode, show3DPreview: mode === '3d' });
  },
  toggleViewMode: () => {
    set((state) => {
      const newMode = state.viewMode === '2d' ? '3d' : '2d';
      return { viewMode: newMode, show3DPreview: newMode === '3d' };
    });
  },
}));
