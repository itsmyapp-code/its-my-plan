'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BookOpen, 
  Wrench, 
  Calculator, 
  Keyboard, 
  Cloud, 
  ArrowLeft, 
  MousePointer, 
  Hammer, 
  FolderOpen, 
  Sparkles,
  Info
} from 'lucide-react';

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<'getting-started' | 'tools' | 'takeoff' | 'shortcuts' | 'cloud'>('getting-started');

  const tabs = [
    { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
    { id: 'tools', label: 'Drawing Tools', icon: Wrench },
    { id: 'takeoff', label: 'Estimating & PDF', icon: Calculator },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
    { id: 'cloud', label: 'Cloud Sync', icon: Cloud },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Premium Header */}
      <header className="glass-panel border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 bg-white/85 backdrop-blur-md">
        <Image src="/its-my-plan.png" alt="its my plan logo" width={32} height={32} className="rounded-xl shadow-sm" />
        <div>
          <h1 className="text-md font-bold text-slate-900 tracking-tight">its my plan</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Help & Documentation Center</p>
        </div>
        <Link 
          href="/" 
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
        >
          <ArrowLeft size={12} />
          Back to App
        </Link>
      </header>

      {/* Main Body Grid */}
      <div className="max-w-5xl w-full mx-auto px-6 py-8 flex flex-col md:flex-row gap-8 flex-1">
        {/* Navigation Sidebar */}
        <aside className="md:w-64 shrink-0">
          <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-3 md:pb-0 sticky top-20">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap md:w-full border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10'
                      : 'bg-white text-slate-600 border-slate-200/60 hover:bg-slate-100/60 hover:text-slate-900'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Tab Content Panel */}
        <main className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm min-h-[450px] animate-fade-in">
          
          {/* TAB 1: GETTING STARTED */}
          {activeTab === 'getting-started' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="text-blue-500" size={18} />
                  Getting Started with its my plan
                </h2>
                <p className="text-xs text-slate-500 mt-1">Learn the core concepts of creating layout drawings and 3D models.</p>
              </div>

              <div className="prose prose-slate max-w-none text-xs text-slate-600 leading-relaxed space-y-4">
                <p>
                  <strong>its my plan</strong> is an architectural layout editor designed to streamline drafting, estimation, and material takeoff. 
                  You can draw room walls, place openings (doors and windows), position fixtures, and view your projects in full 3D.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Zero Server fallback
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      All your plan blueprints are stored locally in your browser's Cache/LocalStorage. Your work is kept completely private and runs offline by default.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Automatic Takeoff Math
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Every wall segment you draw dynamically feeds our materials engine, calculating floor area, plasterboards, timber boards, trims, and schedules in real-time.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 flex gap-3 text-xs text-blue-800 mt-4">
                  <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Pro Tip:</span> Switch between <strong>2D Blueprint</strong> and <strong>3D Dollhouse</strong> views in the top-right header at any time to inspect your framing and color finishes.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DRAWING TOOLS */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="text-blue-500" size={18} />
                  Drawing Tools Guide
                </h2>
                <p className="text-xs text-slate-500 mt-1">Overview of layout components and design actions.</p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: 'Select tool',
                    kbd: 'V',
                    desc: 'Click walls, openings, texts, or fixtures to edit properties. Drag fixtures and openings to reposition. Use keyboard arrow keys for fine placement of texts and fixtures.',
                    icon: MousePointer,
                  },
                  {
                    name: 'Draw Wall',
                    kbd: 'W',
                    desc: 'Click start point, click again to finish segment. Segment chains automatically. Hold SHIFT to lock draw direction to 15° increments (perfect straight lines).',
                    icon: Hammer,
                  },
                  {
                    name: 'Place Door',
                    kbd: 'D',
                    desc: 'Click along any wall to insert a door. Selecting the door in Select mode opens options to flip direction, swap hinge sides, and adjust specifications.',
                    icon: FolderOpen,
                  },
                  {
                    name: 'Place Window',
                    kbd: 'N',
                    desc: 'Click along a wall to place a window. Fine-tune window width, height, and sill heights in the properties panel.',
                    icon: Wrench,
                  },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <div key={t.name} className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-slate-500" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-800">{t.name}</h4>
                          <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-mono text-slate-500">{t.kbd}</kbd>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{t.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ESTIMATING & PDF */}
          {activeTab === 'takeoff' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="text-blue-500" size={18} />
                  Estimating & PDF Printouts
                </h2>
                <p className="text-xs text-slate-500 mt-1">Understanding material counts, schedules, and document prints.</p>
              </div>

              <div className="prose prose-slate max-w-none text-xs text-slate-600 leading-relaxed space-y-4">
                <h3 className="font-bold text-slate-900 mt-4 text-xs">📐 Estimating Rules</h3>
                <ul className="list-disc pl-5 space-y-2 text-[11px]">
                  <li>
                    <strong>Plasterboard Finishing</strong>: The system automatically detects boundary walls of closed rooms, defaulting them to 1 finish side. Partition walls default to 2 sides. Calculations include standard UK sheet configurations (2.4m x 1.2m and 1.8m x 0.9m) with a 10% cutting waste factor.
                  </li>
                  <li>
                    <strong>Trims & Perimeter Runs</strong>: Skirting board runs automatically subtract door widths to give net purchase lengths. Door architraves are counted per face.
                  </li>
                  <li>
                    <strong>Insulation Frame Area</strong>: Calculates the internal cavity area of stud framed walls (excluding door and window openings).
                  </li>
                </ul>

                <h3 className="font-bold text-slate-900 mt-4 text-xs">🖨️ PDF Printout Exporter</h3>
                <p className="text-[11px]">
                  Open the <strong>Material Takeoff</strong> panel (Calculator icon) and click the **Printer** button to export a formal A4 Portrait takeoff sheet.
                  The exporter prints paginated tables for core quantities, drylining/insulation counts, structural timber framing lists, and a door/window schedule matching your plan's layout.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Keyboard className="text-blue-500" size={18} />
                  Keyboard Shortcuts Reference
                </h2>
                <p className="text-xs text-slate-500 mt-1">Use shortcuts to speed up your drawing workflow.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {[
                  { key: 'V', desc: 'Select tool' },
                  { key: 'W', desc: 'Draw wall tool' },
                  { key: 'D', desc: 'Place door tool' },
                  { key: 'N', desc: 'Place window tool' },
                  { key: 'X', desc: 'Add text tool' },
                  { key: 'H', desc: 'Pan canvas tool' },
                  { key: 'F', desc: 'Toggle Fixture Library' },
                  { key: 'T', desc: 'Toggle Takeoff Sheet' },
                  { key: 'C', desc: 'Toggle Clearance Zones' },
                  { key: 'R', desc: 'Rotate selected fixture' },
                  { key: 'Delete', desc: 'Delete selected element' },
                  { key: 'Ctrl + Z', desc: 'Undo action' },
                  { key: 'Ctrl + Shift + Z', desc: 'Redo action' },
                  { key: '+ / -', desc: 'Zoom in / out' },
                  { key: '0', desc: 'Reset zoom & pan' },
                  { key: 'Escape', desc: 'Cancel current draw action' },
                ].map((s) => (
                  <div key={s.key} className="flex justify-between items-center px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/30">
                    <span className="text-xs text-slate-600">{s.desc}</span>
                    <kbd className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-mono text-xs font-bold text-blue-600 shadow-sm">{s.key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CLOUD SYNC */}
          {activeTab === 'cloud' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Cloud className="text-blue-500" size={18} />
                  Cloud Database & Cloud Sync
                </h2>
                <p className="text-xs text-slate-500 mt-1">Synchronizing files across browser devices.</p>
              </div>

              <div className="prose prose-slate max-w-none text-xs text-slate-600 leading-relaxed space-y-4">
                <p>
                  Sign in through the Hamburger menu to sync plans with Firebase Cloud.
                  All plans autosave (debounced to 500ms) to Firestore. If you are signed out, plans remain safely stored locally.
                </p>

                <div className="p-4 rounded-xl border border-yellow-200/60 bg-yellow-50/40 text-xs text-yellow-800 space-y-2">
                  <h4 className="font-bold text-yellow-900 flex items-center gap-1.5">
                    <Info size={14} className="text-yellow-600" />
                    How to setup Firebase cloud sync variables:
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-yellow-800">
                    <li>Create a Firebase Project console in console.firebase.google.com</li>
                    <li>Turn on <strong>Email/Password Auth</strong> and <strong>Cloud Firestore</strong></li>
                    <li>Copy configurations into the local project <code className="text-xs bg-slate-200/50 px-1 rounded">.env.local</code></li>
                    <li>Add the environment keys to Vercel Settings, then trigger a production build</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
