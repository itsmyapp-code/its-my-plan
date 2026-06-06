'use client';

import { useEffect, useRef } from 'react';
import { usePlanStore } from '@/store/usePlanStore';
import { savePlan, loadActivePlan, migratePlan } from '@/utils/storage';
import { savePlanToFirestore } from '@/lib/firestoreSync';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * Debounced auto-save hook.
 * - Loads the active plan from localStorage on mount.
 * - Saves to localStorage always; syncs to Firestore when signed in.
 */
export function useAutoSave() {
  const setPlan = usePlanStore((s) => s.setPlan);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoaded = useRef(false);
  const uidRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsub = onAuthStateChanged(auth, (user) => {
      uidRef.current = user?.uid ?? null;
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    const saved = loadActivePlan();
    if (saved) {
      setPlan(migratePlan(saved));
    }
  }, [setPlan]);

  useEffect(() => {
    const unsubscribe = usePlanStore.subscribe((state) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        savePlan(state.plan);
        if (uidRef.current) {
          savePlanToFirestore(uidRef.current, state.plan).catch(console.warn);
        }
      }, 500);
    });

    return () => {
      unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);
}
