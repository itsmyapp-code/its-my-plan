import { create } from 'zustand';
import type { ToolMode, Point } from '@/types';

interface ToolState {
  activeTool: ToolMode;
  setTool: (tool: ToolMode) => void;

  // Drawing state — tracks active wall draw operation
  isDrawing: boolean;
  drawStart: Point | null;
  drawPreview: Point | null;

  startDrawing: (origin: Point) => void;
  updateDrawPreview: (point: Point) => void;
  finishDrawing: () => void;
  cancelDrawing: () => void;
}

export const useToolStore = create<ToolState>((set) => ({
  activeTool: 'draw-wall',
  setTool: (tool) => {
    set({
      activeTool: tool,
      isDrawing: false,
      drawStart: null,
      drawPreview: null,
    });
  },

  isDrawing: false,
  drawStart: null,
  drawPreview: null,

  startDrawing: (origin) => {
    set({ isDrawing: true, drawStart: origin, drawPreview: origin });
  },

  updateDrawPreview: (point) => {
    set({ drawPreview: point });
  },

  finishDrawing: () => {
    set({ isDrawing: false, drawStart: null, drawPreview: null });
  },

  cancelDrawing: () => {
    set({ isDrawing: false, drawStart: null, drawPreview: null });
  },
}));
