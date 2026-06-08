// localStorage persistence utilities for room plans

import type { RoomPlan, Opening } from '@/types';
import { DEFAULT_PRINT_SCALE } from '@/constants';

const STORAGE_KEY = 'itsmyplan_plans';
const ACTIVE_PLAN_KEY = 'itsmyplan_active_plan';

/** Migrate older plan formats to current schema */
export function migratePlan(plan: RoomPlan): RoomPlan {
  if (!plan.metadata) {
    plan.metadata = {
      jobNumber: '',
      version: '1.0',
      operator: '',
      scale: DEFAULT_PRINT_SCALE,
      clientName: '',
    };
  }
  for (const op of plan.openings ?? []) {
    if (!(op as Opening).hingeSide) {
      (op as Opening).hingeSide = 'p1';
    }
  }
  if (!plan.texts) {
    plan.texts = [];
  }
  return plan;
}

/**
 * Save a plan to localStorage.
 */
export function savePlan(plan: RoomPlan): void {
  try {
    const plans = loadAllPlans();
    const index = plans.findIndex((p) => p.id === plan.id);
    if (index >= 0) {
      plans[index] = plan;
    } else {
      plans.push(plan);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    localStorage.setItem(ACTIVE_PLAN_KEY, plan.id);
  } catch (e) {
    console.warn('Failed to save plan to localStorage:', e);
  }
}

/**
 * Load all plans from localStorage.
 */
export function loadAllPlans(): RoomPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const plans = JSON.parse(raw) as RoomPlan[];
    return plans.map(migratePlan);
  } catch {
    return [];
  }
}

/**
 * Load a specific plan by ID.
 */
export function loadPlan(id: string): RoomPlan | null {
  const plans = loadAllPlans();
  return plans.find((p) => p.id === id) ?? null;
}

/**
 * Load the last active plan.
 */
export function loadActivePlan(): RoomPlan | null {
  try {
    const activeId = localStorage.getItem(ACTIVE_PLAN_KEY);
    if (!activeId) return null;
    return loadPlan(activeId);
  } catch {
    return null;
  }
}

/**
 * List plan summaries (id, name, updatedAt).
 */
export function listPlans(): { id: string; name: string; updatedAt: number }[] {
  return loadAllPlans().map((p) => ({
    id: p.id,
    name: p.name,
    updatedAt: p.updatedAt,
  }));
}

/**
 * Delete a plan from localStorage.
 */
export function deletePlan(id: string): void {
  try {
    const plans = loadAllPlans().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));

    const activeId = localStorage.getItem(ACTIVE_PLAN_KEY);
    if (activeId === id) {
      localStorage.removeItem(ACTIVE_PLAN_KEY);
    }
  } catch (e) {
    console.warn('Failed to delete plan from localStorage:', e);
  }
}
