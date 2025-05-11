
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import type { AppUser } from '@/types';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: AppUser | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        const adminDocRef = doc(db, 'admins', firebaseUser.uid);
        const adminDocSnap = await getDoc(adminDocRef);
        const userIsAdmin = adminDocSnap.exists();
        
        const appUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          isAnonymous: firebaseUser.isAnonymous,
          metadata: firebaseUser.metadata,
          providerData: firebaseUser.providerData,
          refreshToken: firebaseUser.refreshToken,
          tenantId: firebaseUser.tenantId,
          delete: firebaseUser.delete,
          getIdToken: firebaseUser.getIdToken,
          getIdTokenResult: firebaseUser.getIdTokenResult,
          reload: firebaseUser.reload,
          toJSON: firebaseUser.toJSON,
          providerId: firebaseUser.providerId,
          isAdmin: userIsAdmin,
        };
        
        setUser(appUser);
        setIsAdmin(userIsAdmin);

        if (userIsAdmin && pathname === '/admin/login') {
          router.push('/admin/dashboard');
        } else if (userIsAdmin && !pathname.startsWith('/admin')) {
          // Optional: redirect admin to dashboard if they land on a non-admin page after login
          // router.push('/admin/dashboard');
        } else if (!userIsAdmin && pathname.startsWith('/admin')) {
          toast({ title: "Access Denied", description: "You are not authorized to access admin pages.", variant: "destructive"});
          router.push('/');
        }

      } else {
        setUser(null);
        setIsAdmin(false);
        if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
          router.push('/admin/login');
        } else if (pathname === '/profile') {
           router.push('/login?redirect=/profile');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname, toast]);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle setting user and admin state
      // Redirection will be handled by useEffect based on admin status and current path
      toast({ title: "Login Successful", description: "Welcome!" });
    } catch (error: any) {
      console.error("Google sign-in failed:", error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message || "Could not sign in with Google." });
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle user and admin state update
      // Redirection handled by useEffect
    } catch (error: any) {
      console.error("Email/Password sign-in failed:", error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message || "Invalid credentials or server error."});
      setLoading(false); // Ensure loading is false on error
      // Rethrow to allow login page to handle UI state like isSubmitting
      throw error;
    }
    // setLoading will be managed by onAuthStateChanged
  };

  const signOut = async () => {
    setLoading(true);
    await firebaseSignOut(auth);
    // setUser and setIsAdmin will be updated by onAuthStateChanged
    const isAdminPage = pathname.startsWith('/admin');
    // setLoading(false); // onAuthStateChanged will set loading to false
    router.push(isAdminPage ? '/admin/login' : '/');
    toast({ title: "Signed Out", description: "You have been successfully signed out." });
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signInWithGoogle, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
