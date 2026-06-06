'use client';

import { useState } from 'react';
import { Bath, UtensilsCrossed, Bed, X, ChevronDown, ChevronRight } from 'lucide-react';
import { FIXTURE_LIBRARY, type FixtureDefinition } from '@/data/fixtures';
import { usePlanStore } from '@/store/usePlanStore';
import { useToolStore } from '@/store/useToolStore';
import { snapToGrid } from '@/utils/snapping';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  bathroom: <Bath size={14} />,
  kitchen: <UtensilsCrossed size={14} />,
  bedroom: <Bed size={14} />,
};

const CATEGORY_LABELS: Record<string, string> = {
  bathroom: 'Bathroom',
  kitchen: 'Kitchen',
  bedroom: 'Bedroom',
};

interface FixturePaletteProps {
  onClose: () => void;
}

export function FixturePalette({ onClose }: FixturePaletteProps) {
  const addFixture = usePlanStore((s) => s.addFixture);
  const setTool = useToolStore((s) => s.setTool);
  const [expandedCat, setExpandedCat] = useState<string>('bathroom');

  const categories = ['bathroom', 'kitchen', 'bedroom'] as const;

  const handlePlace = (def: FixtureDefinition) => {
    const snapped = snapToGrid({ x: 2500, y: 2500 });
    addFixture({
      type: def.id,
      x: snapped.x,
      y: snapped.y,
      rotation: 0,
      showClearance: true,
    });
    setTool('select');
  };

  return (
    <div className="glass-panel absolute right-3 top-14 z-40 w-64 rounded-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/30">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          UK Fixture Library
        </h3>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 transition-colors"
          aria-label="Close palette"
        >
          <X size={14} />
        </button>
      </div>

      {/* Categories */}
      <div className="max-h-96 overflow-y-auto p-2">
        {categories.map((cat) => {
          const items = FIXTURE_LIBRARY.filter((f) => f.category === cat);
          const isExpanded = expandedCat === cat;

          return (
            <div key={cat} className="mb-1">
              <button
                onClick={() => setExpandedCat(isExpanded ? '' : cat)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/30 transition-colors"
              >
                {CATEGORY_ICONS[cat]}
                <span>{CATEGORY_LABELS[cat]}</span>
                <span className="ml-auto text-slate-600 text-[10px]">{items.length}</span>
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>

              {isExpanded && (
                <div className="mt-1 space-y-0.5 pl-2">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handlePlace(item)}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs text-slate-300 hover:bg-slate-700/40 hover:text-slate-100 transition-colors group"
                    >
                      <div
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: item.color, opacity: 0.7 }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{item.label}</div>
                        <div className="text-[10px] text-slate-500 group-hover:text-slate-400">
                          {item.width}×{item.depth} mm
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Place
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
