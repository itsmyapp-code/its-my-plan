import { doc, setDoc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import type { RoomPlan } from '@/types';
import { getFirebaseDb, isFirebaseConfigured } from '@/lib/firebase';

/**
 * Save a plan to Firestore under /users/{uid}/plans/{planId}
 */
export async function savePlanToFirestore(uid: string, plan: RoomPlan): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const db = getFirebaseDb();
  if (!db) return;

  const ref = doc(db, 'users', uid, 'plans', plan.id);
  await setDoc(ref, { ...plan, updatedAt: Date.now() }, { merge: true });
}

/**
 * Load a plan from Firestore.
 */
export async function loadPlanFromFirestore(uid: string, planId: string): Promise<RoomPlan | null> {
  if (!isFirebaseConfigured()) return null;
  const db = getFirebaseDb();
  if (!db) return null;

  const ref = doc(db, 'users', uid, 'plans', planId);
  const snap = await getDoc(ref);
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
  const snap = await getDocs(col);
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
  await deleteDoc(ref);
}
