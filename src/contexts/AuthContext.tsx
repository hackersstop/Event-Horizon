
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
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

  const performSignOut = useCallback(async () => {
    setLoading(true);
    await firebaseSignOut(auth);
    // setUser and setIsAdmin will be updated by onAuthStateChanged
    const isAdminPage = pathname.startsWith('/admin');
    router.push(isAdminPage ? '/admin/login' : '/');
    toast({ title: "Signed Out", description: "You have been successfully signed out." });
    // setLoading(false) will be handled by onAuthStateChanged setting user to null
  }, [pathname, router, toast]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          let userIsAdmin = false;
          try {
            const adminDocRef = doc(db, 'admins', firebaseUser.uid);
            const adminDocSnap = await getDoc(adminDocRef);
            userIsAdmin = adminDocSnap.exists();
          } catch (error) {
            console.error("Failed to check admin status:", error);
            toast({
              title: "Network Issue",
              description: "Could not verify admin status. Assuming non-admin role.",
              variant: "default", 
              duration: 5000,
            });
            // userIsAdmin remains false, which is a safe default
          }
          
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
            router.push('/'); // Redirect non-admin away from admin pages
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
      } catch (error) {
        console.error("Error in onAuthStateChanged handling:", error);
        setUser(null);
        setIsAdmin(false);
        // Handle any unexpected error by resetting state.
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, pathname, toast]);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "Login Successful", description: "Welcome!" });
    } catch (error: any) {
      console.error("Google sign-in failed:", error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message || "Could not sign in with Google." });
      setLoading(false); // Explicitly set loading false on error here, as onAuthStateChanged might not fire quickly
    }
    // onAuthStateChanged will handle setting user, admin state and final setLoading(false)
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle user and admin state update and final setLoading(false)
    } catch (error: any) {
      console.error("Email/Password sign-in failed:", error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message || "Invalid credentials or server error."});
      setLoading(false); // Explicitly set loading false on error here
      throw error;
    }
  };


  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signInWithGoogle, signInWithEmail, signOut: performSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};
