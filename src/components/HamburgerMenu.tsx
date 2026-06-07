'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu, X, Upload, FileJson, FileText,
  RefreshCw, Settings, LogIn, LogOut, HelpCircle, FolderOpen,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useUIStore } from '@/store/useUIStore';
import { usePlanStore } from '@/store/usePlanStore';

interface HamburgerMenuProps {
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportJSON: () => void;
  onPrint2D: () => void;
  onPrint3D: () => void;
  onOpenSettings: () => void;
  onOpenPlans: () => void;
  isPrinting2D: boolean;
  isPrinting3D: boolean;
}

export function HamburgerMenu({
  onImport,
  onExportJSON,
  onPrint2D,
  onPrint3D,
  onOpenSettings,
  onOpenPlans,
  isPrinting2D,
  isPrinting3D,
}: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout, firebaseEnabled } = useAuth();
  const viewMode = useUIStore((s) => s.viewMode);
  const toggleViewMode = useUIStore((s) => s.toggleViewMode);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const close = () => setOpen(false);

  const menuItemClass =
    'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-9 h-9 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors shadow-sm"
        aria-label="Menu"
        aria-expanded={open}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-56 glass-panel rounded-xl border border-slate-200 shadow-lg z-50 py-2 animate-fade-in">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            File / Plans
          </div>

          <button className={`${menuItemClass} mx-1`} onClick={() => { onOpenPlans(); close(); }}>
            <FolderOpen size={14} className="text-blue-500" />
            My Saved Plans
          </button>

          <label className={`${menuItemClass} cursor-pointer mx-1`} onClick={close}>
            <Upload size={14} />
            Import JSON
            <input type="file" accept=".json" onChange={(e) => { onImport(e); close(); }} className="hidden" />
          </label>

          <button className={`${menuItemClass} mx-1`} onClick={() => { onExportJSON(); close(); }}>
            <FileJson size={14} />
            Export JSON
          </button>

          <button className={`${menuItemClass} mx-1`} onClick={() => { onOpenSettings(); close(); }}>
            <Settings size={14} />
            Plan Settings
          </button>

          <div className="my-1.5 mx-3 border-t border-slate-200" />

          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            View
          </div>

          <button className={`${menuItemClass} mx-1`} onClick={() => { toggleViewMode(); close(); }}>
            <RefreshCw size={14} />
            {viewMode === '2d' ? 'Switch to 3D View' : 'Switch to 2D View'}
          </button>

          <div className="my-1.5 mx-3 border-t border-slate-200" />

          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Print
          </div>

          <button
            className={`${menuItemClass} mx-1`}
            onClick={() => { onPrint2D(); close(); }}
            disabled={isPrinting2D}
          >
            <FileText size={14} />
            {isPrinting2D ? 'Printing 2D…' : 'Print 2D PDF'}
          </button>

          <button
            className={`${menuItemClass} mx-1`}
            onClick={() => { onPrint3D(); close(); }}
            disabled={isPrinting3D}
          >
            <FileText size={14} />
            {isPrinting3D ? 'Printing 3D…' : 'Print 3D PDF'}
          </button>

          <div className="my-1.5 mx-3 border-t border-slate-200" />

          <Link href="/help" className={`${menuItemClass} mx-1`} onClick={close}>
            <HelpCircle size={14} />
            Help & Instructions
          </Link>

          <div className="my-1.5 mx-3 border-t border-slate-200" />

          {user ? (
            <button
              className={`${menuItemClass} mx-1 text-red-600 hover:text-red-700 hover:bg-red-50`}
              onClick={async () => {
                await logout();
                usePlanStore.getState().resetPlan();
                localStorage.removeItem('itsmyplan_active_plan');
                close();
                router.push('/login');
              }}
            >
              <LogOut size={14} />
              Logout ({user.email?.split('@')[0]})
            </button>
          ) : (
            <Link href="/login" className={`${menuItemClass} mx-1`} onClick={close}>
              <LogIn size={14} />
              {firebaseEnabled ? 'Sign In / Sign Up' : 'Sign In (Setup Required)'}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
