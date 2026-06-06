'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  firebaseEnabled: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured());
  const firebaseEnabled = isFirebaseConfigured();

  useEffect(() => {
    if (!firebaseEnabled) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, [firebaseEnabled]);

  const signIn = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase is not configured');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase is not configured');
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const resetPassword = async (email: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase is not configured');
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, firebaseEnabled, signIn, signUp, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
