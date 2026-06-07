import { create } from 'zustand';
import type { Wall, Opening, Fixture, RoomPlan, SelectionState, PlanMetadata } from '@/types';
import { generateId } from '@/utils/idGenerator';
import { WALL_THICKNESS_INTERNAL, WALL_THICKNESS_EXTERNAL, DEFAULT_PRINT_SCALE } from '@/constants';
import { useUIStore } from '@/store/useUIStore';

// ── Undo/Redo History ──────────────────────────────────────────────

interface HistoryEntry {
  walls: Wall[];
  openings: Opening[];
  fixtures: Fixture[];
}

const MAX_HISTORY = 50;

interface PlanState {
  // Current plan data
  plan: RoomPlan;
  selection: SelectionState;

  // History (undo/redo)
  history: HistoryEntry[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  // Wall actions
  addWall: (p1: { x: number; y: number }, p2: { x: number; y: number }, wallType?: 'internal' | 'external') => string;
  updateWall: (id: string, updates: Partial<Omit<Wall, 'id'>>) => void;
  deleteWall: (id: string) => void;

  // Opening actions
  addOpening: (opening: Omit<Opening, 'id'>) => string;
  updateOpening: (id: string, updates: Partial<Omit<Opening, 'id'>>) => void;
  deleteOpening: (id: string) => void;

  // Fixture actions
  addFixture: (fixture: Omit<Fixture, 'id'>) => string;
  updateFixture: (id: string, updates: Partial<Omit<Fixture, 'id'>>) => void;
  deleteFixture: (id: string) => void;

  // Selection
  select: (type: SelectionState['type'], id: string | null) => void;
  clearSelection: () => void;

  // Plan management
  setPlan: (plan: RoomPlan) => void;
  resetPlan: () => void;
  renamePlan: (name: string) => void;
  updateMetadata: (updates: Partial<PlanMetadata>) => void;

  // Delete selected element
  deleteSelected: () => void;
}

function defaultMetadata(): PlanMetadata {
  return {
    jobNumber: '',
    version: '1.0',
    operator: '',
    scale: DEFAULT_PRINT_SCALE,
    clientName: '',
  };
}

function createEmptyPlan(): RoomPlan {
  return {
    id: generateId(),
    name: 'Untitled Plan',
    walls: [],
    openings: [],
    fixtures: [],
    metadata: defaultMetadata(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function snapshotFromPlan(plan: RoomPlan): HistoryEntry {
  return {
    walls: JSON.parse(JSON.stringify(plan.walls)),
    openings: JSON.parse(JSON.stringify(plan.openings)),
    fixtures: JSON.parse(JSON.stringify(plan.fixtures)),
  };
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plan: createEmptyPlan(),
  selection: { type: null, id: null },

  // ── History ──
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,

  undo: () => {
    const { history, historyIndex, plan } = get();
    if (historyIndex < 0) return;
    const entry = history[historyIndex];
    set({
      plan: {
        ...plan,
        walls: JSON.parse(JSON.stringify(entry.walls)),
        openings: JSON.parse(JSON.stringify(entry.openings)),
        fixtures: JSON.parse(JSON.stringify(entry.fixtures)),
        updatedAt: Date.now(),
      },
      historyIndex: historyIndex - 1,
      canUndo: historyIndex - 1 >= 0,
      canRedo: true,
      selection: { type: null, id: null },
    });
  },

  redo: () => {
    const { history, historyIndex, plan } = get();
    const nextIndex = historyIndex + 2;
    if (nextIndex >= history.length) return;
    const entry = history[nextIndex];
    set({
      plan: {
        ...plan,
        walls: JSON.parse(JSON.stringify(entry.walls)),
        openings: JSON.parse(JSON.stringify(entry.openings)),
        fixtures: JSON.parse(JSON.stringify(entry.fixtures)),
        updatedAt: Date.now(),
      },
      historyIndex: nextIndex - 1,
      canUndo: true,
      canRedo: nextIndex + 1 < history.length,
      selection: { type: null, id: null },
    });
  },

  // === Wall Actions ===
  addWall: (p1, p2, wallType = 'internal') => {
    const id = generateId();
    const thickness = wallType === 'external' ? WALL_THICKNESS_EXTERNAL : WALL_THICKNESS_INTERNAL;

    const state = get();
    // Push current state to history before mutation
    const snapshot = snapshotFromPlan(state.plan);
    const newHistory = [...state.history.slice(0, state.historyIndex + 2), snapshot].slice(-MAX_HISTORY);

    set({
      plan: {
        ...state.plan,
        walls: [
          ...state.plan.walls,
          { id, p1: { ...p1 }, p2: { ...p2 }, thickness, wallType },
        ],
        updatedAt: Date.now(),
      },
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true,
      canRedo: false,
    });
    return id;
  },

  updateWall: (id, updates) => {
    const state = get();
    const snapshot = snapshotFromPlan(state.plan);
    const newHistory = [...state.history.slice(0, state.historyIndex + 2), snapshot].slice(-MAX_HISTORY);

    set({
      plan: {
        ...state.plan,
        walls: state.plan.walls.map((w) =>
          w.id === id ? { ...w, ...updates } : w
        ),
        updatedAt: Date.now(),
      },
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true,
      canRedo: false,
    });
  },

  deleteWall: (id) => {
    const state = get();
    const snapshot = snapshotFromPlan(state.plan);
    const newHistory = [...state.history.slice(0, state.historyIndex + 2), snapshot].slice(-MAX_HISTORY);

    set({
      plan: {
        ...state.plan,
        walls: state.plan.walls.filter((w) => w.id !== id),
        openings: state.plan.openings.filter((o) => o.wallId !== id),
        updatedAt: Date.now(),
      },
      selection:
        state.selection.type === 'wall' && state.selection.id === id
          ? { type: null, id: null }
          : state.selection,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true,
      canRedo: false,
    });
  },

  // === Opening Actions ===
  addOpening: (opening) => {
    const id = generateId();
    const state = get();
    const snapshot = snapshotFromPlan(state.plan);
    const newHistory = [...state.history.slice(0, state.historyIndex + 2), snapshot].slice(-MAX_HISTORY);

    set({
      plan: {
        ...state.plan,
        openings: [...state.plan.openings, { ...opening, id }],
        updatedAt: Date.now(),
      },
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true,
      canRedo: false,
    });
    return id;
  },

  updateOpening: (id, updates) => {
    const state = get();
    const snapshot = snapshotFromPlan(state.plan);
    const newHistory = [...state.history.slice(0, state.historyIndex + 2), snapshot].slice(-MAX_HISTORY);

    set({
      plan: {
        ...state.plan,
        openings: state.plan.openings.map((o) =>
          o.id === id ? { ...o, ...updates } : o
        ),
        updatedAt: Date.now(),
      },
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true,
      canRedo: false,
    });
  },

  deleteOpening: (id) => {
    const state = get();
    const snapshot = snapshotFromPlan(state.plan);
    const newHistory = [...state.history.slice(0, state.historyIndex + 2), snapshot].slice(-MAX_HISTORY);

    set({
      plan: {
        ...state.plan,
        openings: state.plan.openings.filter((o) => o.id !== id),
        updatedAt: Date.now(),
      },
      selection:
        state.selection.type === 'opening' && state.selection.id === id
          ? { type: null, id: null }
          : state.selection,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true,
      canRedo: false,
    });
  },

  // === Fixture Actions ===
  addFixture: (fixture) => {
    const id = generateId();
    const state = get();
    const snapshot = snapshotFromPlan(state.plan);
    const newHistory = [...state.history.slice(0, state.historyIndex + 2), snapshot].slice(-MAX_HISTORY);

    set({
      plan: {
        ...state.plan,
        fixtures: [...state.plan.fixtures, { ...fixture, id }],
        updatedAt: Date.now(),
      },
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true,
      canRedo: false,
    });
    return id;
  },

  updateFixture: (id, updates) => {
    const state = get();
    const snapshot = snapshotFromPlan(state.plan);
    const newHistory = [...state.history.slice(0, state.historyIndex + 2), snapshot].slice(-MAX_HISTORY);

    set({
      plan: {
        ...state.plan,
        fixtures: state.plan.fixtures.map((f) =>
          f.id === id ? { ...f, ...updates } : f
        ),
        updatedAt: Date.now(),
      },
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true,
      canRedo: false,
    });
  },

  deleteFixture: (id) => {
    const state = get();
    const snapshot = snapshotFromPlan(state.plan);
    const newHistory = [...state.history.slice(0, state.historyIndex + 2), snapshot].slice(-MAX_HISTORY);

    set({
      plan: {
        ...state.plan,
        fixtures: state.plan.fixtures.filter((f) => f.id !== id),
        updatedAt: Date.now(),
      },
      selection:
        state.selection.type === 'fixture' && state.selection.id === id
          ? { type: null, id: null }
          : state.selection,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true,
      canRedo: false,
    });
  },

  // === Selection ===
  select: (type, id) => {
    set({ selection: { type, id } });
    if (type !== null) {
      useUIStore.setState({ showFixturePalette: false });
    }
  },

  clearSelection: () => {
    set({ selection: { type: null, id: null } });
  },

  // === Plan Management ===
  setPlan: (plan) => {
    set({ plan, selection: { type: null, id: null }, history: [], historyIndex: -1, canUndo: false, canRedo: false });
  },

  resetPlan: () => {
    set({ plan: createEmptyPlan(), selection: { type: null, id: null }, history: [], historyIndex: -1, canUndo: false, canRedo: false });
  },

  renamePlan: (name) => {
    set((state) => ({
      plan: { ...state.plan, name, updatedAt: Date.now() },
    }));
  },

  updateMetadata: (updates) => {
    set((state) => ({
      plan: {
        ...state.plan,
        metadata: { ...state.plan.metadata, ...updates },
        updatedAt: Date.now(),
      },
    }));
  },

  // === Delete Selected ===
  deleteSelected: () => {
    const { selection } = get();
    if (!selection.id || !selection.type) return;

    switch (selection.type) {
      case 'wall':
        get().deleteWall(selection.id);
        break;
      case 'opening':
        get().deleteOpening(selection.id);
        break;
      case 'fixture':
        get().deleteFixture(selection.id);
        break;
    }
  },
}));
