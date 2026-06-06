'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Canvas2D } from '@/components/canvas2d/Canvas2D';
import { Toolbar } from '@/components/Toolbar';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { FixturePalette } from '@/components/ui/FixturePalette';
import { TakeoffPanel } from '@/components/ui/TakeoffPanel';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import { PlanSettingsModal } from '@/components/PlanSettingsModal';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useUIStore } from '@/store/useUIStore';
import { usePlanStore } from '@/store/usePlanStore';
import { useAuth } from '@/components/auth/AuthProvider';
import { exportToJSON, importFromJSON, export2DPDF, export3DPDF } from '@/utils/exportHelpers';
import { DEFAULT_PRINT_SCALE } from '@/constants';

const Canvas3D = dynamic(
  () => import('@/components/canvas3d/Canvas3D').then((mod) => ({ default: mod.Canvas3D })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading 3D…</span>
        </div>
      </div>
    ),
  }
);

export function AppShell() {
  useKeyboard();
  useAutoSave();

  const viewMode = useUIStore((s) => s.viewMode);
  const showFixturePalette = useUIStore((s) => s.showFixturePalette);
  const toggleFixturePalette = useUIStore((s) => s.toggleFixturePalette);
  const showTakeoffPanel = useUIStore((s) => s.showTakeoffPanel);
  const toggleTakeoffPanel = useUIStore((s) => s.toggleTakeoffPanel);
  const showPropertiesPanel = useUIStore((s) => s.showPropertiesPanel);
  const togglePropertiesPanel = useUIStore((s) => s.togglePropertiesPanel);
  const plan = usePlanStore((s) => s.plan);
  const setPlan = usePlanStore((s) => s.setPlan);
  const selection = usePlanStore((s) => s.selection);
  const { user } = useAuth();

  const [isPrinting2D, setIsPrinting2D] = useState(false);
  const [isPrinting3D, setIsPrinting3D] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedPlan = await importFromJSON(file);
      setPlan(importedPlan);
    } catch (err) {
      alert('Failed to import layout: ' + (err as Error).message);
    }
    e.target.value = '';
  };

  const handlePrint2D = async () => {
    setIsPrinting2D(true);
    await export2DPDF(plan, '#canvas-svg');
    setIsPrinting2D(false);
  };

  const handlePrint3D = async () => {
    if (viewMode !== '3d') {
      useUIStore.getState().setViewMode('3d');
      await new Promise((r) => setTimeout(r, 1500));
    }
    setIsPrinting3D(true);
    await export3DPDF(plan, '#canvas-3d-main');
    setIsPrinting3D(false);
  };

  const showProps = selection.type !== null || showPropertiesPanel;
  const scale = plan.metadata?.scale || DEFAULT_PRINT_SCALE;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-100">
      <header className="glass-panel h-12 flex items-center justify-between px-4 border-b border-slate-200 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <HamburgerMenu
            onImport={handleImport}
            onExportJSON={() => exportToJSON(plan)}
            onPrint2D={handlePrint2D}
            onPrint3D={handlePrint3D}
            onOpenSettings={() => setShowSettings(true)}
            isPrinting2D={isPrinting2D}
            isPrinting3D={isPrinting3D}
          />

          <Image
            src="/its-my-plan.png"
            alt="its my plan logo"
            width={28}
            height={28}
            className="rounded-md hidden sm:block"
            priority
          />
          <h1 className="text-sm font-semibold text-slate-800 tracking-tight hidden sm:block">
            its my plan
          </h1>
          <span className="text-xs text-slate-400 hidden md:inline">|</span>
          <span className="text-xs text-slate-600 truncate max-w-48 hidden md:inline">
            {plan.name}
          </span>
          {plan.metadata?.jobNumber && (
            <>
              <span className="text-xs text-slate-300 hidden lg:inline">|</span>
              <span className="text-xs text-slate-500 hidden lg:inline">
                {plan.metadata.jobNumber}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
            <button
              onClick={() => useUIStore.getState().setViewMode('2d')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === '2d'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
              }`}
              aria-pressed={viewMode === '2d'}
            >
              2D Blueprint
            </button>
            <button
              onClick={() => useUIStore.getState().setViewMode('3d')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === '3d'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
              }`}
              aria-pressed={viewMode === '3d'}
            >
              3D Dollhouse
            </button>
          </div>

          {viewMode === '2d' && (
            <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
              Scale {scale}
            </span>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-700 uppercase tracking-wider">
              {user ? 'Cloud Sync' : 'Zero Server'}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex relative overflow-hidden">
        <Toolbar />

        <div className="relative flex-1 w-full">
          {viewMode === '2d' ? <Canvas2D /> : <Canvas3D id="canvas-3d-main" />}

          <div className="absolute top-3 left-18 px-2 py-1 rounded-md text-[10px] font-medium text-slate-600 bg-white/90 border border-slate-200 uppercase tracking-wider pointer-events-none z-10 shadow-sm">
            {viewMode === '2d' ? `2D Blueprint — ${scale}` : '3D Dollhouse'}
          </div>

          <div className="absolute bottom-4 left-18 z-20 flex gap-4 text-[10px] text-slate-500 font-medium bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 pointer-events-auto shadow-sm">
            <Link href="/terms" className="hover:text-slate-800 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-800 transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-slate-800 transition-colors">Cookies</Link>
            <Link href="/accessibility" className="hover:text-slate-800 transition-colors">Accessibility</Link>
            <Link href="/help" className="hover:text-slate-800 transition-colors">Help</Link>
          </div>
        </div>

        {showProps && (
          <PropertiesPanel onClose={() => {
            usePlanStore.getState().clearSelection();
            if (showPropertiesPanel) togglePropertiesPanel();
          }} />
        )}

        {showFixturePalette && (
          <FixturePalette onClose={toggleFixturePalette} />
        )}

        {showTakeoffPanel && (
          <TakeoffPanel onClose={toggleTakeoffPanel} />
        )}
      </main>

      {showSettings && (
        <PlanSettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
