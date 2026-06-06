import Link from 'next/link';
import Image from 'next/image';

export default function HelpPage() {
  return (
    <div className="min-h-full bg-slate-950 text-slate-200 overflow-y-auto">
      <header className="glass-panel border-b border-slate-800/60 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <Image src="/its-my-plan.png" alt="its my plan" width={32} height={32} className="rounded-md" />
        <h1 className="text-lg font-semibold">Help & Instructions</h1>
        <Link href="/" className="ml-auto text-sm text-blue-400 hover:text-blue-300">← Back to App</Link>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">Getting Started</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            its my plan lets you draw room layouts in 2D and instantly preview them in 3D.
            All data is stored locally in your browser (Zero Server mode) unless you sign in
            with Firebase for cloud sync.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">Drawing Tools</h2>
          <div className="space-y-3 text-sm text-slate-400">
            <div className="glass-panel rounded-xl p-4">
              <strong className="text-slate-200">Select (V)</strong> — Click walls, doors, windows, or fixtures to select them. Drag fixtures and openings to reposition.
            </div>
            <div className="glass-panel rounded-xl p-4">
              <strong className="text-slate-200">Draw Wall (W)</strong> — Click to set start point, click again to set end point. Hold Shift to lock angles to 15° increments. Walls chain automatically.
            </div>
            <div className="glass-panel rounded-xl p-4">
              <strong className="text-slate-200">Place Door (D)</strong> — Click on a wall to place a standard 762mm UK door. Select the door to change hinge side, swing direction, or drag along the wall.
            </div>
            <div className="glass-panel rounded-xl p-4">
              <strong className="text-slate-200">Place Window (N)</strong> — Click on a wall to place a 1200mm window at 900mm sill height.
            </div>
            <div className="glass-panel rounded-xl p-4">
              <strong className="text-slate-200">Pan (H)</strong> — Drag to pan the canvas. Middle-mouse also pans in any mode.
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">Wall Properties</h2>
          <ul className="text-sm text-slate-400 space-y-2 list-disc pl-5">
            <li><strong className="text-slate-300">Internal (100mm)</strong> or <strong className="text-slate-300">External (300mm)</strong> wall types</li>
            <li><strong className="text-slate-300">Height at P1 / P2</strong> — Set different heights at each end for sloped or raked walls</li>
            <li>Adjust wall length numerically in the properties panel</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">Fixtures</h2>
          <p className="text-sm text-slate-400 mb-3">
            Open the Fixture Library (F) to add UK-standard bathroom, kitchen, and bedroom items.
            Press R to rotate a selected fixture. Clearance zones (C) show required access space.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">2D / 3D Views</h2>
          <p className="text-sm text-slate-400">
            Use the menu or header button to switch between 2D Blueprint and 3D Dollhouse views.
            Only one view is shown at a time for a full-screen experience. In 3D, use mouse to orbit, scroll to zoom.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">Import & Export</h2>
          <ul className="text-sm text-slate-400 space-y-2 list-disc pl-5">
            <li><strong className="text-slate-300">Import JSON</strong> — Load a previously exported layout file</li>
            <li><strong className="text-slate-300">Export JSON</strong> — Save your layout as a JSON file</li>
            <li><strong className="text-slate-300">Print 2D PDF</strong> — Export blueprint with scale annotation and job metadata</li>
            <li><strong className="text-slate-300">Print 3D PDF</strong> — Export dollhouse snapshot (switches to 3D view automatically)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">Plan Settings</h2>
          <p className="text-sm text-slate-400">
            Open Plan Settings from the menu to set job number, client name, version, operator, and drawing scale.
            These details appear on PDF exports and the on-screen scale indicator.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">Keyboard Shortcuts</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              ['V', 'Select tool'], ['W', 'Draw wall'], ['D', 'Place door'], ['N', 'Place window'],
              ['H', 'Pan tool'], ['F', 'Fixture library'], ['T', 'Material takeoff'], ['C', 'Clearance zones'],
              ['R', 'Rotate fixture'], ['Del', 'Delete selected'], ['⌘Z', 'Undo'], ['⌘⇧Z', 'Redo'],
              ['+ / −', 'Zoom in/out'], ['0', 'Reset view'], ['Esc', 'Cancel drawing'],
            ].map(([key, desc]) => (
              <div key={key} className="flex gap-2 glass-panel rounded-lg px-3 py-2">
                <kbd className="text-blue-400 font-mono text-xs min-w-[3rem]">{key}</kbd>
                <span className="text-slate-400 text-xs">{desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">Cloud Sync (Optional)</h2>
          <p className="text-sm text-slate-400">
            Sign in via the menu to sync plans to Firebase Firestore. Your plans are always saved locally
            as a fallback (Zero Server mode). Stripe billing will be added in a future update.
          </p>
        </section>
      </div>
    </div>
  );
}
