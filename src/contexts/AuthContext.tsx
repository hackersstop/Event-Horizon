'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import type { AppUser } from '@/types';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: AppUser | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>; // Placeholder
  signInWithEmail: (email: string, pass: string) => Promise<void>; // Placeholder
  signUpWithEmail?: (email: string, pass: string) => Promise<void>; // Placeholder for admin creation if needed
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Check if user is admin (example: check a Firestore document or custom claims)
        // This is a simplified check; real admin checks might involve custom claims set server-side.
        // For now, we'll assume any user with a specific UID or email could be admin.
        // Or, we check a 'roles' collection in Firestore.
        // For this example, we'll check if an 'admins' document exists for the user's UID.
        const adminDocRef = doc(db, 'admins', firebaseUser.uid);
        const adminDocSnap = await getDoc(adminDocRef);
        const userIsAdmin = adminDocSnap.exists();
        
        setUser({ ...firebaseUser, isAdmin: userIsAdmin });
        setIsAdmin(userIsAdmin);

        if (userIsAdmin && !pathname.startsWith('/admin')) {
          // If admin logs in and is not in admin section, redirect to admin dashboard
          // router.push('/admin/dashboard');
        } else if (!userIsAdmin && pathname.startsWith('/admin')) {
          // If non-admin tries to access admin page, redirect to home
          router.push('/');
        }

      } else {
        setUser(null);
        setIsAdmin(false);
        if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
          router.push('/admin/login');
        } else if (pathname === '/profile') {
           router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  // Placeholder functions - implement with Firebase SDK
  const signInWithGoogle = async () => {
    // Implement Google Sign-In
    console.log('signInWithGoogle called');
    // Example:
    // const provider = new GoogleAuthProvider();
    // await signInWithPopup(auth, provider);
    alert("Google Sign-In not implemented yet. Redirecting to homepage for demo.");
    router.push('/');
  };

  const signInWithEmail = async (email: string, pass: string) => {
    // Implement Email/Password Sign-In
    console.log('signInWithEmail called with', email, pass);
    // Example:
    // await signInWithEmailAndPassword(auth, email, pass);
    alert("Email Sign-In not implemented yet. Assuming admin login for demo.");
    // Mock admin user for demo
    const mockAdminUser = { uid: 'admin123', email: email, displayName: 'Admin User', isAdmin: true } as AppUser;
    setUser(mockAdminUser);
    setIsAdmin(true);
    router.push('/admin/dashboard');
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setIsAdmin(false);
    if (pathname.startsWith('/admin')) {
      router.push('/admin/login');
    } else {
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signInWithGoogle, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
