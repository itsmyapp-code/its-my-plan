'use client';

import { useState, useEffect } from 'react';
import { usePlanStore } from '@/store/usePlanStore';
import { useAuth } from '@/components/auth/AuthProvider';
import { loadAllPlans, deletePlan, savePlan } from '@/utils/storage';
import { listPlansFromFirestore, deletePlanFromFirestore, savePlanToFirestore } from '@/lib/firestoreSync';
import { exportAllPlansToJSON } from '@/utils/exportHelpers';
import { X, Plus, FolderOpen, Trash2, Download, Cloud, Monitor, Edit2, Copy, Check } from 'lucide-react';
import { generateId } from '@/utils/idGenerator';
import type { RoomPlan } from '@/types';

interface PlanManagerModalProps {
  onClose: () => void;
}

export function PlanManagerModal({ onClose }: PlanManagerModalProps) {
  const { user } = useAuth();
  const currentPlan = usePlanStore((s) => s.plan);
  const setPlan = usePlanStore((s) => s.setPlan);
  const resetPlan = usePlanStore((s) => s.resetPlan);
  const renamePlan = usePlanStore((s) => s.renamePlan);

  const [plans, setPlans] = useState<RoomPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const handleConfirmRename = async (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    const trimmed = editingName.trim();
    if (!trimmed) {
      alert('Plan name cannot be empty.');
      return;
    }

    try {
      const updatedPlans = plans.map((p) => {
        if (p.id === id) {
          return { ...p, name: trimmed, updatedAt: Date.now() };
        }
        return p;
      });

      const targetPlan = updatedPlans.find((p) => p.id === id);
      if (!targetPlan) return;

      // If targetPlan is current plan, update in store
      if (currentPlan.id === id) {
        renamePlan(trimmed);
      }

      // Save to local storage
      savePlan(targetPlan);

      // Sync to Firestore if logged in
      if (user) {
        await savePlanToFirestore(user.uid, targetPlan);
      }

      setPlans(updatedPlans);
      setEditingPlanId(null);
    } catch (err) {
      console.error('Failed to rename plan:', err);
      alert('Failed to rename plan.');
    }
  };

  const handleDuplicatePlan = async (originalPlan: RoomPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt('Enter a name for the new copy of this plan:', `${originalPlan.name} (Copy)`);
    if (newName === null) return; // Cancelled
    const trimmed = newName.trim();
    if (!trimmed) {
      alert('Plan name cannot be empty.');
      return;
    }

    const clonedPlan: RoomPlan = {
      ...JSON.parse(JSON.stringify(originalPlan)),
      id: generateId(),
      name: trimmed,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      // Save to local storage
      savePlan(clonedPlan);

      // Sync to Firestore if logged in
      if (user) {
        await savePlanToFirestore(user.uid, clonedPlan);
      }

      // Add to plans list
      setPlans((prev) => [clonedPlan, ...prev]);
    } catch (err) {
      console.error('Failed to duplicate plan:', err);
      alert('Failed to save copy: ' + (err as Error).message);
    }
  };


  // Load plans on mount or when user change
  useEffect(() => {
    async function fetchPlans() {
      setLoading(true);
      try {
        if (user) {
          const cloudPlans = await listPlansFromFirestore(user.uid);
          setPlans(cloudPlans);
        } else {
          const localPlans = loadAllPlans();
          setPlans(localPlans);
        }
      } catch (err) {
        console.error('Failed to load plans:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, [user]);

  const handleCreateNew = () => {
    resetPlan();
    onClose();
  };

  const handleLoadPlan = (plan: RoomPlan) => {
    setPlan(plan);
    // Ensure active key is set locally
    localStorage.setItem('itsmyplan_active_plan', plan.id);
    onClose();
  };

  const handleDeletePlan = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) return;

    try {
      if (user) {
        await deletePlanFromFirestore(user.uid, id);
      }
      deletePlan(id); // Always clean local cache too
      setPlans((prev) => prev.filter((p) => p.id !== id));

      // If deleted active plan, reset to empty
      if (currentPlan.id === id) {
        resetPlan();
      }
    } catch (err) {
      console.error('Failed to delete plan:', err);
      alert('Failed to delete plan.');
    }
  };

  const handleMasterExport = () => {
    if (plans.length === 0) {
      alert('No plans found to export.');
      return;
    }
    exportAllPlansToJSON(plans);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-2xl overflow-hidden mx-4 shadow-xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">My Saved Plans</h2>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-600">
              {user ? (
                <>
                  <Cloud size={10} className="text-blue-500" />
                  Cloud Storage
                </>
              ) : (
                <>
                  <Monitor size={10} className="text-slate-500" />
                  Local Browser Only
                </>
              )}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex justify-between gap-3 shrink-0">
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
          >
            <Plus size={14} />
            New Blank Plan
          </button>
          <button
            onClick={handleMasterExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-sm"
          >
            <Download size={14} />
            Master Export (All Plans)
          </button>
        </div>

        {/* Plans List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-xs">Fetching plans...</span>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-xs text-slate-500 font-medium">No plans saved yet</p>
              <p className="text-[10px] text-slate-400 mt-1">Create a new plan to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {plans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleLoadPlan(p)}
                  className={`flex items-center justify-between py-3 px-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group ${
                    currentPlan.id === p.id ? 'bg-blue-50/50 border border-blue-100' : 'border border-transparent'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      {editingPlanId === p.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-semibold text-slate-800 bg-white border border-blue-400 rounded px-2 py-0.5 outline-none w-full max-w-xs focus:ring-1 focus:ring-blue-200"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleConfirmRename(p.id, e);
                            } else if (e.key === 'Escape') {
                              e.stopPropagation();
                              setEditingPlanId(null);
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <span className="text-xs font-semibold text-slate-800 truncate block">
                          {p.name || 'Untitled Plan'}
                        </span>
                      )}
                      {currentPlan.id === p.id && (
                        <span className="text-[9px] bg-blue-100 text-blue-800 px-1 rounded font-medium">Active</span>
                      )}
                    </div>
                    <div className="flex gap-3 text-[10px] text-slate-400 mt-1">
                      <span>Updated: {new Date(p.updatedAt).toLocaleDateString('en-GB')} {new Date(p.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>Walls: {p.walls?.length || 0}</span>
                      <span>•</span>
                      <span>Fixtures: {p.fixtures?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    {editingPlanId === p.id ? (
                      <>
                        <button
                          onClick={(e) => handleConfirmRename(p.id, e)}
                          className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600 hover:text-emerald-800 transition-colors"
                          title="Save Name"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPlanId(null);
                          }}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPlanId(p.id);
                            setEditingName(p.name || '');
                          }}
                          className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 hover:text-slate-800"
                          title="Rename Plan"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDuplicatePlan(p, e)}
                          className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 hover:text-slate-800"
                          title="Save Copy (Duplicate)"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => handleLoadPlan(p)}
                          className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 hover:text-slate-800"
                          title="Load Plan"
                        >
                          <FolderOpen size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDeletePlan(p.id, e)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600"
                          title="Delete Plan"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

          )}
        </div>
      </div>
    </div>
  );
}
