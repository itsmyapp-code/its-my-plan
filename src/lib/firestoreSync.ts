import { doc, setDoc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import type { RoomPlan } from '@/types';
import { getFirebaseDb, isFirebaseConfigured } from '@/lib/firebase';

/**
 * Helper to wrap promises in a timeout so they fail fast instead of hanging
 * indefinitely when blocked by Brave Shields or privacy ad-blockers.
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs = 15000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error('Database connection timed out. If you are using Brave or an ad-blocker, please disable Shields/blocking for plan.itsmyapp.co.uk and refresh.')),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Save a plan to Firestore under /users/{uid}/plans/{planId}
 */
export async function savePlanToFirestore(uid: string, plan: RoomPlan): Promise<void> {
  console.log('🔧 savePlanToFirestore called', { uid, planId: plan.id });
  if (!isFirebaseConfigured()) return;
  const db = getFirebaseDb();
  if (!db) return;

  const ref = doc(db, 'users', uid, 'plans', plan.id);
  await withTimeout(setDoc(ref, { ...plan, updatedAt: Date.now() }, { merge: true }));
}

/**
 * Load a plan from Firestore.
 */
export async function loadPlanFromFirestore(uid: string, planId: string): Promise<RoomPlan | null> {
  if (!isFirebaseConfigured()) return null;
  const db = getFirebaseDb();
  if (!db) return null;

  const ref = doc(db, 'users', uid, 'plans', planId);
  const snap = await withTimeout(getDoc(ref));
  if (!snap.exists()) return null;
  return snap.data() as RoomPlan;
}

/**
 * List all plans for a user from Firestore.
 */
export async function listPlansFromFirestore(uid: string): Promise<RoomPlan[]> {
  if (!isFirebaseConfigured()) return [];
  const db = getFirebaseDb();
  if (!db) return [];

  const col = collection(db, 'users', uid, 'plans');
  const snap = await withTimeout(getDocs(col));
  return snap.docs.map((d) => d.data() as RoomPlan);
}

/**
 * Delete a plan from Firestore.
 */
export async function deletePlanFromFirestore(uid: string, planId: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const db = getFirebaseDb();
  if (!db) return;

  const ref = doc(db, 'users', uid, 'plans', planId);
  await withTimeout(deleteDoc(ref));
}
