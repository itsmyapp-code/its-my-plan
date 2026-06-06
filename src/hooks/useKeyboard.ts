'use client';

import { useEffect } from 'react';
import { useToolStore } from '@/store/useToolStore';
import { usePlanStore } from '@/store/usePlanStore';
import { useUIStore } from '@/store/useUIStore';

export function useKeyboard() {
  const { isDrawing, cancelDrawing, setTool } = useToolStore();
  const { deleteSelected, undo, redo, canUndo, canRedo } = usePlanStore();
  const { toggleFixturePalette, toggleTakeoffPanel, toggleClearanceZones } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case 'Escape':
          if (isDrawing) cancelDrawing();
          break;

        case 'Delete':
        case 'Backspace':
          if (!isDrawing) deleteSelected();
          break;

        case 'w':
        case 'W':
          if (!e.ctrlKey && !e.metaKey) setTool('draw-wall');
          break;

        case 'v':
        case 'V':
          if (!e.ctrlKey && !e.metaKey) setTool('select');
          break;

        case 'h':
        case 'H':
          if (!e.ctrlKey && !e.metaKey) setTool('pan');
          break;

        case 'm':
        case 'M':
          if (!e.ctrlKey && !e.metaKey) setTool('measure');
          break;

        case 'd':
        case 'D':
          if (!e.ctrlKey && !e.metaKey) setTool('place-opening-door');
          break;

        case 'n':
        case 'N':
          if (!e.ctrlKey && !e.metaKey) setTool('place-opening-window');
          break;

        case 'f':
        case 'F':
          if (!e.ctrlKey && !e.metaKey) toggleFixturePalette();
          break;

        case 't':
        case 'T':
          if (!e.ctrlKey && !e.metaKey) toggleTakeoffPanel();
          break;

        case 'c':
        case 'C':
          if (!e.ctrlKey && !e.metaKey) toggleClearanceZones();
          break;

        case 'z':
        case 'Z':
          if ((e.ctrlKey || e.metaKey) && !e.shiftKey && canUndo) {
            e.preventDefault();
            undo();
          } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && canRedo) {
            e.preventDefault();
            redo();
          }
          break;

        case 'y':
        case 'Y':
          if ((e.ctrlKey || e.metaKey) && canRedo) {
            e.preventDefault();
            redo();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawing, cancelDrawing, deleteSelected, setTool, undo, redo, canUndo, canRedo, toggleFixturePalette, toggleTakeoffPanel, toggleClearanceZones]);
}
