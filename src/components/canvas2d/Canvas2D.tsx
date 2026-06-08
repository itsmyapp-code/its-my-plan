'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { usePlanStore } from '@/store/usePlanStore';
import { useToolStore } from '@/store/useToolStore';
import { useUIStore } from '@/store/useUIStore';
import { resolveSnap } from '@/utils/snapping';
import { SCALE_2D, MIN_WALL_LENGTH } from '@/constants';
import { distance, projectPointOntoWall, wallLength, formatMM } from '@/utils/geometry';
import { clampOpeningPosition, getDefaultDoorFlipDirection } from '@/utils/openingHelpers';
import { GridLayer } from './GridLayer';
import { WallLayer } from './WallLayer';
import { DrawingCursor } from './DrawingCursor';
import { SnapIndicator } from './SnapIndicator';
import { OpeningOverlay } from './OpeningOverlay';
import { FixtureLayer } from './FixtureLayer';
import type { Point, SnapResult, TextBox } from '@/types';

export function Canvas2D() {
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const lastPanPos = useRef<{ x: number; y: number } | null>(null);

  const { plan, addWall, updateWall, select, clearSelection, selection, addTextBox, updateTextBox } = usePlanStore();
  const { activeTool, isDrawing, drawStart, drawPreview, startDrawing, updateDrawPreview, cancelDrawing } = useToolStore();
  const { viewport, setViewport, viewSettings } = useUIStore();

  const draggedElement = useRef<{
    id: string;
    type: 'fixture' | 'opening' | 'wall' | 'text';
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialP1?: Point;
    initialP2?: Point;
    wallId?: string;
    initialDist?: number;
  } | null>(null);
  const [snapResult, setSnapResult] = useState<SnapResult | null>(null);
  const [shiftHeld, setShiftHeld] = useState(false);
  const [measureStart, setMeasureStart] = useState<Point | null>(null);
  const [measureEnd, setMeasureEnd] = useState<Point | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const updateDimensions = () => {
      setDimensions({
        width: svg.clientWidth || 1200,
        height: svg.clientHeight || 800,
      });
    };

    updateDimensions();

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });
      resizeObserver.observe(svg);
      return () => {
        resizeObserver.disconnect();
      };
    } else {
      window.addEventListener('resize', updateDimensions);
      return () => {
        window.removeEventListener('resize', updateDimensions);
      };
    }
  }, []);


  // Clear measurements when switching away from measure tool
  useEffect(() => {
    if (activeTool !== 'measure') {
      setMeasureStart(null);
      setMeasureEnd(null);
    }
  }, [activeTool]);

  // Track keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        return;
      }
      if (e.key === 'Shift') setShiftHeld(true);
      if (e.key === 'r' || e.key === 'R') {
        const { selection, plan, updateFixture } = usePlanStore.getState();
        if (selection.type === 'fixture' && selection.id) {
          const fixture = plan.fixtures.find((f) => f.id === selection.id);
          if (fixture) {
            updateFixture(selection.id, {
              rotation: (fixture.rotation + 90) % 360,
            });
          }
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftHeld(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  /** Convert screen pixel position to mm coordinates in plan space */
  const screenToMM = useCallback(
    (clientX: number, clientY: number): Point => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      const svgX = (clientX - rect.left) / viewport.zoom;
      const svgY = (clientY - rect.top) / viewport.zoom;
      return {
        x: (svgX - viewport.panX) / SCALE_2D,
        y: (svgY - viewport.panY) / SCALE_2D,
      };
    },
    [viewport]
  );

  const handleFixtureDragStart = useCallback((id: string, e: React.PointerEvent<SVGElement>) => {
    if (activeTool !== 'select') return;
    const mm = screenToMM(e.clientX, e.clientY);
    const fixture = plan.fixtures.find(f => f.id === id);
    if (fixture) {
      draggedElement.current = {
        id,
        type: 'fixture',
        startX: mm.x,
        startY: mm.y,
        initialX: fixture.x,
        initialY: fixture.y,
      };
      (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    }
  }, [activeTool, plan.fixtures, screenToMM]);

  const handleOpeningDragStart = useCallback((id: string, e: React.PointerEvent<SVGElement>) => {
    if (activeTool !== 'select') return;
    const mm = screenToMM(e.clientX, e.clientY);
    const opening = plan.openings.find(o => o.id === id);
    if (opening) {
      draggedElement.current = {
        id,
        type: 'opening',
        startX: mm.x,
        startY: mm.y,
        initialX: mm.x,
        initialY: mm.y,
        wallId: opening.wallId,
        initialDist: opening.distanceFromP1,
      };
      (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    }
  }, [activeTool, plan.openings, screenToMM]);

  const handleWallDragStart = useCallback((id: string, e: React.PointerEvent<SVGElement>) => {
    if (activeTool !== 'select') return;
    const mm = screenToMM(e.clientX, e.clientY);
    const wall = plan.walls.find((w) => w.id === id);
    if (!wall) return;

    draggedElement.current = {
      id,
      type: 'wall',
      startX: mm.x,
      startY: mm.y,
      initialX: 0,
      initialY: 0,
      initialP1: { ...wall.p1 },
      initialP2: { ...wall.p2 },
    };

    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
  }, [activeTool, plan.walls, screenToMM]);

  const handleTextDragStart = useCallback((id: string, e: React.PointerEvent<SVGElement>) => {
    if (activeTool !== 'select') return;
    const mm = screenToMM(e.clientX, e.clientY);
    const text = plan.texts?.find((t) => t.id === id);
    if (text) {
      draggedElement.current = {
        id,
        type: 'text',
        startX: mm.x,
        startY: mm.y,
        initialX: text.x,
        initialY: text.y,
      };
      (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    }
  }, [activeTool, plan.texts, screenToMM]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      // Middle mouse or Space+left for panning
      if (e.button === 1 || (activeTool === 'pan' && e.button === 0)) {
        isPanning.current = true;
        lastPanPos.current = { x: e.clientX, y: e.clientY };
        (e.target as SVGSVGElement).setPointerCapture(e.pointerId);
        return;
      }

      if (e.button !== 0) return;

      // Clear focus from inputs when clicking canvas so keyboard controls trigger immediately
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      const mm = screenToMM(e.clientX, e.clientY);

      if (activeTool === 'measure') {
        const snap = resolveSnap(mm, plan.walls, {
          shiftHeld,
          origin: measureStart ?? undefined,
        });

        if (!measureStart || measureEnd) {
          setMeasureStart(snap.point);
          setMeasureEnd(null);
        } else {
          usePlanStore.getState().addMeasurement(measureStart, snap.point);
          setMeasureStart(null);
          setMeasureEnd(null);
        }
        setSnapResult(snap);
        return;
      }

      if (activeTool === 'draw-wall') {
        const snap = resolveSnap(mm, plan.walls, {
          shiftHeld,
          origin: drawStart ?? undefined,
        });

        if (!isDrawing) {
          startDrawing(snap.point);
          setSnapResult(snap);
        } else if (drawStart) {
          // Finish drawing — create wall if long enough
          const len = distance(drawStart, snap.point);
          if (len >= MIN_WALL_LENGTH) {
            addWall(drawStart, snap.point);
            // Start next wall from this endpoint (chain drawing)
            startDrawing(snap.point);
          }
        }
      } else if (activeTool === 'place-text') {
        const snap = resolveSnap(mm, plan.walls, {
          shiftHeld,
        });
        const newId = addTextBox(snap.point.x, snap.point.y, 'Double-click to edit');
        select('text', newId);
        useToolStore.getState().setTool('select');
        setEditingTextId(newId);
        return;
      } else if (activeTool === 'place-opening-door' || activeTool === 'place-opening-window') {
        // Find closest wall
        let closestWall = null;
        let minPerpDist = Infinity;
        let bestDistAlongWall = 0;

        for (const wall of plan.walls) {
          const proj = projectPointOntoWall(mm, wall);
          const wallLen = wallLength(wall);
          if (proj.distanceAlongWall >= 0 && proj.distanceAlongWall <= wallLen) {
            if (proj.perpendicularDistance < minPerpDist && proj.perpendicularDistance < 500) {
              minPerpDist = proj.perpendicularDistance;
              closestWall = wall;
              bestDistAlongWall = proj.distanceAlongWall;
            }
          }
        }

        if (closestWall) {
          const isDoor = activeTool === 'place-opening-door';
          const opWidth = isDoor ? 762 : 1200; // Standard UK door/window widths
          const opHeight = isDoor ? 2040 : 1200;
          const zOffset = isDoor ? 0 : 900;

          const clampedDist = clampOpeningPosition(closestWall, { width: opWidth, distanceFromP1: bestDistAlongWall });
          const flipDirection = isDoor ? getDefaultDoorFlipDirection(closestWall, plan.walls) : false;

          usePlanStore.getState().addOpening({
            wallId: closestWall.id,
            type: isDoor ? 'door' : 'window',
            distanceFromP1: clampedDist,
            width: opWidth,
            height: opHeight,
            zOffset,
            flipDirection,
            hingeSide: 'p1',
          });

          // Set back to select tool
          useToolStore.getState().setTool('select');
        }
      } else if (activeTool === 'select') {
        // Selection is handled by individual elements
        // Clicking on empty space clears selection
        clearSelection();
      }
    },
    [activeTool, isDrawing, drawStart, plan.walls, shiftHeld, screenToMM, startDrawing, addWall, clearSelection, measureStart, measureEnd]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      // Handle dragging
      if (draggedElement.current) {
        const mm = screenToMM(e.clientX, e.clientY);

        if (draggedElement.current.type === 'wall' && draggedElement.current.initialP1 && draggedElement.current.initialP2) {
          const dx = mm.x - draggedElement.current.startX;
          const dy = mm.y - draggedElement.current.startY;

          let moveX = dx;
          let moveY = dy;
          if (!shiftHeld) {
            moveX = Math.round(moveX / 50) * 50;
            moveY = Math.round(moveY / 50) * 50;
          }

          updateWall(draggedElement.current.id, {
            p1: {
              x: draggedElement.current.initialP1.x + moveX,
              y: draggedElement.current.initialP1.y + moveY,
            },
            p2: {
              x: draggedElement.current.initialP2.x + moveX,
              y: draggedElement.current.initialP2.y + moveY,
            },
          });
          return;
        }

        if (draggedElement.current.type === 'opening' && draggedElement.current.wallId) {
          const wall = plan.walls.find(w => w.id === draggedElement.current!.wallId);
          const opening = plan.openings.find(o => o.id === draggedElement.current!.id);
          if (wall && opening) {
            const proj = projectPointOntoWall(mm, wall);
            const clampedDist = clampOpeningPosition(wall, {
              width: opening.width,
              distanceFromP1: proj.distanceAlongWall,
            });
            usePlanStore.getState().updateOpening(opening.id, { distanceFromP1: clampedDist });
          }
          return;
        }

        const dx = mm.x - draggedElement.current.startX;
        const dy = mm.y - draggedElement.current.startY;
        
        let newX = draggedElement.current.initialX + dx;
        let newY = draggedElement.current.initialY + dy;
        
        if (!shiftHeld) {
          newX = Math.round(newX / 50) * 50;
          newY = Math.round(newY / 50) * 50;
        }
        
        if (draggedElement.current.type === 'text') {
          usePlanStore.getState().updateTextBox(draggedElement.current.id, { x: newX, y: newY });
        } else {
          usePlanStore.getState().updateFixture(draggedElement.current.id, { x: newX, y: newY });
        }
        return;
      }

      // Handle panning
      if (isPanning.current && lastPanPos.current) {
        const dx = (e.clientX - lastPanPos.current.x) / viewport.zoom;
        const dy = (e.clientY - lastPanPos.current.y) / viewport.zoom;
        setViewport({
          panX: viewport.panX + dx,
          panY: viewport.panY + dy,
        });
        lastPanPos.current = { x: e.clientX, y: e.clientY };
        return;
      }

      const mm = screenToMM(e.clientX, e.clientY);
      const snap = resolveSnap(mm, plan.walls, {
        shiftHeld,
        origin: (activeTool === 'measure' ? measureStart : drawStart) ?? undefined,
      });

      if (isDrawing) {
        updateDrawPreview(snap.point);
      }
      setSnapResult(snap);
    },
    [isPanning, viewport, isDrawing, plan.walls, shiftHeld, drawStart, screenToMM, setViewport, updateDrawPreview, activeTool, measureStart, measureEnd, updateWall]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (isPanning.current) {
        isPanning.current = false;
        lastPanPos.current = null;
        (e.target as SVGSVGElement).releasePointerCapture(e.pointerId);
      }
      if (draggedElement.current) {
        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {}
        draggedElement.current = null;
      }
    },
    []
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.02, Math.min(2.0, viewport.zoom * delta));

      // Zoom towards cursor position
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      const scale = newZoom / viewport.zoom;
      setViewport({
        zoom: newZoom,
        panX: cursorX / newZoom - (cursorX / viewport.zoom - viewport.panX),
        panY: cursorY / newZoom - (cursorY / viewport.zoom - viewport.panY),
      });
    },
    [viewport, setViewport]
  );

  // Handle right-click / Escape to cancel drawing
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (isDrawing) {
        cancelDrawing();
      }
    },
    [isDrawing, cancelDrawing]
  );

  // Determine cursor class
  const cursorClass =
    (activeTool === 'draw-wall' || activeTool === 'place-text')
      ? 'cursor-draw'
      : activeTool === 'pan'
      ? 'cursor-pan'
      : activeTool === 'measure'
      ? 'cursor-draw'
      : 'cursor-select';

  const measureStartPx = measureStart
    ? { x: measureStart.x * SCALE_2D, y: measureStart.y * SCALE_2D }
    : null;
  const measureLivePoint = measureEnd ?? ((activeTool === 'measure' && measureStart && snapResult) ? snapResult.point : null);
  const measureEndPx = measureLivePoint
    ? { x: measureLivePoint.x * SCALE_2D, y: measureLivePoint.y * SCALE_2D }
    : null;
  const measureLen = measureStart && measureLivePoint ? distance(measureStart, measureLivePoint) : 0;
  const measureMid = measureStartPx && measureEndPx
    ? { x: (measureStartPx.x + measureEndPx.x) / 2, y: (measureStartPx.y + measureEndPx.y) / 2 }
    : null;

  return (
    <svg
      id="canvas-svg"
      ref={svgRef}
      className={`w-full h-full ${cursorClass}`}
      style={{ background: 'var(--canvas-bg)' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
    >
      <g
        transform={`scale(${viewport.zoom}) translate(${viewport.panX}, ${viewport.panY})`}
      >
        {/* Background grid */}
        <GridLayer
          width={dimensions.width / viewport.zoom}
          height={dimensions.height / viewport.zoom}
          panX={viewport.panX}
          panY={viewport.panY}
        />

        {/* Wall segments */}
        <WallLayer onWallDragStart={handleWallDragStart} />

        {/* Openings on walls */}
        <OpeningOverlay onDragStart={handleOpeningDragStart} />

        {/* Placed fixtures */}
        <FixtureLayer onDragStart={handleFixtureDragStart} />

        {/* Drawing preview line */}
        {isDrawing && drawStart && drawPreview && (
          <DrawingCursor start={drawStart} end={drawPreview} />
        )}

        {/* Measure overlay */}
        {measureStartPx && measureEndPx && (
          <g className="pointer-events-none">
            <line
              x1={measureStartPx.x}
              y1={measureStartPx.y}
              x2={measureEndPx.x}
              y2={measureEndPx.y}
              stroke="var(--brand-orange)"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
            <circle cx={measureStartPx.x} cy={measureStartPx.y} r={2.5} fill="var(--brand-orange)" />
            <circle cx={measureEndPx.x} cy={measureEndPx.y} r={2.5} fill="var(--brand-orange)" />
            {measureMid && (
              <g>
                <rect
                  x={measureMid.x - 34}
                  y={measureMid.y - 9}
                  width={68}
                  height={18}
                  rx={5}
                  fill="rgba(15, 23, 42, 0.9)"
                  stroke="rgba(148, 163, 184, 0.45)"
                  strokeWidth={0.5}
                />
                <text
                  x={measureMid.x}
                  y={measureMid.y + 3.5}
                  textAnchor="middle"
                  fontSize={8}
                  fontFamily="var(--font-sans)"
                  fill="#f8fafc"
                >
                  {formatMM(measureLen)}
                </text>
              </g>
            )}
          </g>
        )}

        {/* Persistent Measurements Layer */}
        {viewSettings.showDimensions && (plan.measurements || []).map((m) => {
          const mStartPx = { x: m.p1.x * SCALE_2D, y: m.p1.y * SCALE_2D };
          const mEndPx = { x: m.p2.x * SCALE_2D, y: m.p2.y * SCALE_2D };
          const mLen = distance(m.p1, m.p2);
          const mMid = { x: (mStartPx.x + mEndPx.x) / 2, y: (mStartPx.y + mEndPx.y) / 2 };
          const isMSelected = selection.type === 'measurement' && selection.id === m.id;

          const strokeColor = isMSelected ? 'var(--brand-orange)' : '#64748b';
          const strokeWidth = isMSelected ? 2.0 : 1.0;
          const circleColor = isMSelected ? 'var(--brand-orange)' : '#64748b';

          return (
            <g
              key={m.id}
              onClick={(e) => {
                if (activeTool === 'select') {
                  e.stopPropagation();
                  select('measurement', m.id);
                }
              }}
              className="cursor-pointer"
            >
              {/* Invisible wider line to make it easy to click/hover */}
              <line
                x1={mStartPx.x}
                y1={mStartPx.y}
                x2={mEndPx.x}
                y2={mEndPx.y}
                stroke="transparent"
                strokeWidth={15}
                className="pointer-events-auto"
              />
              <line
                x1={mStartPx.x}
                y1={mStartPx.y}
                x2={mEndPx.x}
                y2={mEndPx.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={isMSelected ? undefined : "3 3"}
              />
              <circle cx={mStartPx.x} cy={mStartPx.y} r={isMSelected ? 3.5 : 2.5} fill={circleColor} />
              <circle cx={mEndPx.x} cy={mEndPx.y} r={isMSelected ? 3.5 : 2.5} fill={circleColor} />
              <g className="pointer-events-none">
                <rect
                  x={mMid.x - 30}
                  y={mMid.y - 8}
                  width={60}
                  height={16}
                  rx={4}
                  fill={isMSelected ? 'var(--brand-orange)' : '#475569'}
                  stroke={isMSelected ? 'var(--brand-orange)' : '#94a3b8'}
                  strokeWidth={0.5}
                />
                <text
                  x={mMid.x}
                  y={mMid.y + 3.2}
                  textAnchor="middle"
                  fontSize={8}
                  fontWeight="600"
                  fontFamily="var(--font-sans)"
                  fill="#ffffff"
                >
                  {formatMM(mLen)}
                </text>
              </g>
            </g>
          );
        })}

        {/* Persistent Text Boxes */}
        {(plan.texts || []).map((t) => {
          const isSelected = selection.type === 'text' && selection.id === t.id;
          const textX = t.x * SCALE_2D;
          const textY = t.y * SCALE_2D;

          return (
            <g
              key={t.id}
              transform={`translate(${textX}, ${textY})`}
              className="cursor-move select-none"
              onPointerDown={(e) => {
                e.stopPropagation();
                select('text', t.id);
                handleTextDragStart(t.id, e);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingTextId(t.id);
              }}
            >
              {editingTextId === t.id ? (
                <foreignObject
                  x={-150}
                  y={-25}
                  width={300}
                  height={50}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <textarea
                    className="w-full h-full p-1 text-center bg-white border border-blue-500 rounded shadow-md resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                    style={{
                      fontSize: `${t.fontSize * 0.75}px`,
                      fontWeight: t.isBold ? 'bold' : 'normal',
                      fontStyle: t.isItalic ? 'italic' : 'normal',
                      color: t.color,
                      lineHeight: '1.2',
                    }}
                    defaultValue={t.text}
                    autoFocus
                    onFocus={(e) => e.currentTarget.select()}
                    onBlur={(e) => {
                      updateTextBox(t.id, { text: e.target.value.trim() || 'Text' });
                      setEditingTextId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.currentTarget.blur();
                      }
                      if (e.key === 'Escape') {
                        setEditingTextId(null);
                      }
                    }}
                  />
                </foreignObject>
              ) : (
                <g>
                  {/* Select highlight box */}
                  {isSelected && (
                    <rect
                      x={-60}
                      y={-18}
                      width={120}
                      height={36}
                      rx={3}
                      fill="transparent"
                      stroke="var(--brand-orange)"
                      strokeWidth={1.5}
                      strokeDasharray="3 2"
                    />
                  )}
                  {/* Invisible pointer-events target box to make text easy to click and select */}
                  <rect
                    x={-55}
                    y={-15}
                    width={110}
                    height={30}
                    fill="transparent"
                    className="pointer-events-auto"
                  />
                  <text
                    x={0}
                    y={5}
                    textAnchor="middle"
                    className="custom-text pointer-events-none"
                    style={{
                      fontSize: `${t.fontSize}px`,
                      fontWeight: t.isBold ? 'bold' : 'normal',
                      fontStyle: t.isItalic ? 'italic' : 'normal',
                      fill: t.color,
                      fontFamily: 'var(--font-sans), sans-serif',
                    }}
                  >
                    {t.text}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Snap indicator */}
        {snapResult && snapResult.snapType !== 'grid' && (
          <SnapIndicator point={snapResult.point} type={snapResult.snapType} />
        )}
      </g>
    </svg>
  );
}
