'use client';

import { useEffect } from 'react';
import { useToolStore } from '@/store/useToolStore';
import { usePlanStore } from '@/store/usePlanStore';
import { useUIStore } from '@/store/useUIStore';
import { clampOpeningPosition } from '@/utils/openingHelpers';

export function useKeyboard() {
  const { isDrawing, cancelDrawing, setTool } = useToolStore();
  const { deleteSelected, undo, redo, canUndo, canRedo } = usePlanStore();
  const {
    toggleFixturePalette,
    toggleTakeoffPanel,
    toggleClearanceZones,
    toggleElectricalLayer,
    togglePlumbingLayer,
  } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight': {
          const { selection, plan, updateFixture, updateOpening, updateWall, updateTextBox } = usePlanStore.getState();
          const shift = e.shiftKey;
          const delta = shift ? 10 : 50;

          if (selection.type === 'fixture' && selection.id) {
            const fixture = plan.fixtures.find((f) => f.id === selection.id);
            if (fixture) {
              e.preventDefault();
              let dx = 0;
              let dy = 0;
              if (e.key === 'ArrowLeft') dx = -delta;
              if (e.key === 'ArrowRight') dx = delta;
              if (e.key === 'ArrowUp') dy = -delta;
              if (e.key === 'ArrowDown') dy = delta;
              updateFixture(selection.id, { x: fixture.x + dx, y: fixture.y + dy });
            }
          } else if (selection.type === 'opening' && selection.id) {
            const opening = plan.openings.find((o) => o.id === selection.id);
            const wall = plan.walls.find((w) => w.id === opening?.wallId);
            if (opening && wall) {
              e.preventDefault();
              let change = 0;
              if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') change = -delta;
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') change = delta;
              const newDist = opening.distanceFromP1 + change;
              const clamped = clampOpeningPosition(wall, { ...opening, distanceFromP1: newDist });
              updateOpening(selection.id, { distanceFromP1: clamped });
            }
          } else if (selection.type === 'wall' && selection.id) {
            const wall = plan.walls.find((w) => w.id === selection.id);
            if (wall) {
              e.preventDefault();
              let dx = 0;
              let dy = 0;
              if (e.key === 'ArrowLeft') dx = -delta;
              if (e.key === 'ArrowRight') dx = delta;
              if (e.key === 'ArrowUp') dy = -delta;
              if (e.key === 'ArrowDown') dy = delta;
              updateWall(selection.id, {
                p1: { x: wall.p1.x + dx, y: wall.p1.y + dy },
                p2: { x: wall.p2.x + dx, y: wall.p2.y + dy },
              });
            }
          } else if (selection.type === 'text' && selection.id) {
            const text = plan.texts?.find((t) => t.id === selection.id);
            if (text) {
              e.preventDefault();
              let dx = 0;
              let dy = 0;
              if (e.key === 'ArrowLeft') dx = -delta;
              if (e.key === 'ArrowRight') dx = delta;
              if (e.key === 'ArrowUp') dy = -delta;
              if (e.key === 'ArrowDown') dy = delta;
              updateTextBox(selection.id, { x: text.x + dx, y: text.y + dy });
            }
          }
          break;
        }

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

        case 'x':
        case 'X':
          if (!e.ctrlKey && !e.metaKey) setTool('place-text');
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

        case 'e':
        case 'E':
          if (!e.ctrlKey && !e.metaKey) toggleElectricalLayer();
          break;

        case 'p':
        case 'P':
          if (!e.ctrlKey && !e.metaKey) togglePlumbingLayer();
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
  }, [
    isDrawing,
    cancelDrawing,
    deleteSelected,
    setTool,
    undo,
    redo,
    canUndo,
    canRedo,
    toggleFixturePalette,
    toggleTakeoffPanel,
    toggleClearanceZones,
    toggleElectricalLayer,
    togglePlumbingLayer,
  ]);
}
